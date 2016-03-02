var fs = require("fs");
var util = require("util");
var Util = require("./util.js");
var Type = require("./type.js");

var argv = require('optimist')
    .usage('makedb [-v] def-file')
    .describe('v', 'verbose')
    .argv;

if (argv._.length != 1) {
    usage();
}
var srcFilename = argv._[0];
console.log("Making DB from %s", srcFilename);


//////////////// Load template file
var templates = {};
try {
    var reg = new RegExp(/^================ ([a-zA-Z]+)\n/gm);
    var s = fs.readFileSync("dbtemplates.js").toString();
    var result;
    var idxs = [];
    while((result = reg.exec(s)) !== null) {
	    var head = result[0];
	    var tag = result[1];
	    console.log('Found %s', tag);
	    var start = s.indexOf(head);
	    if (idxs.length > 0) {
	        idxs[idxs.length-1].end = start;
	    }
	    idxs.push({tag: tag, start: start+head.length, end:s.length});
    }
    for (var i=0; i<idxs.length; i++) {
	    templates[idxs[i].tag] = s.substr(idxs[i].start, idxs[i].end-idxs[i].start);
    }
    //console.log(templates);
} catch (e) {
    console.error(e);
    Util.exit(103);
}

// load schema definition
var obj;
try {
    var sinfo = (/** @type {!string} */ fs.readFileSync(srcFilename)).toString();
    //console.log(sinfo);
    obj = (/** @type {!Object} */ (JSON.parse(sinfo)));
} catch(e) {
    console.error(e);
    console.error('failed to read %s. perhaps the json is misformed or it is not there?', srcFilename);
    Util.exit(102);
}

// create the code for each definition
for (var i=0; i<obj.length; i++) {
    obj[i].itemnum = i+1;
    createClass(obj[i]);
}

// now create general item file
var out = fs.openSync("./db/item.js", "w");
fs.writeSync(out, templates.itemheader);
fs.writeSync(out, templates.item2clsheader);
for (var i=0; i<obj.length; i++) {
    fs.writeSync(out, "case "+(i+1)+": cls="+obj.class+"; break; \n");
}
fs.writeSync(out, templates.item2clstrailer);
fs.writeSync(out, templates.item2type);
fs.writeSync(out, templates.itemtrailer);
fs.closeSync(out);

// done
Util.exit(0);

// type = dbtype & possible itype

// if itype not defined, create it.
// itype if type stored in instance var
function findIVtype(fld, obj)
{
    console.error('Parsing: %s', fld.type);
    fld.type = Type.parse(fld.type);
    fld.dtype = fld.type;
    if ('itype' in fld) {
        fld.itype = Type.parse(fld.itype);
    } else {
        fld.itype = fld.type.clone(('backend' in fld) && (fld.backend == "resolve"));
    }
    if ('fetype' in fld) {
        fld.fetype = Type.parse(fld.fetype);
    } else {
        fld.fetype = fld.type.clone(false);
    }
    console.log('%s => db:%s => iv:%s => fe:%s', 
                fld.name, 
                fld.type.toString(true), 
                fld.itype.toString(true), 
                fld.fetype.toString(true));
    console.log('%s => db:%j => iv:%j', 
                fld.name, 
                fld.type, 
                fld.itype);
}

function convertFieldForFrontEnd(out, varname, fromtype, type)
{
    console.log("%s %s --> %s", varname, fromtype.toString(), type.toString());
    if (type.isRecurable()) {
	    // this is a composite type
	    if (type.isArrayType()) {
	        // handle array conversion
	        fs.writeSync(out, templates.forfrontendarrayHeader);
	        fs.writeSync(out, "\tafter.push(");
            convertFieldForFrontEnd(out, "before[i]", fromtype.getChildType(), type.getChildType());
            fs.writeSync(out, ");\n");
	        fs.writeSync(out, templates.forfrontendarrayTrailer.replace(/<varname>/g, varname));
	    } else if (f.type.isObjectType()) {
	        // handle object conversion
	        Util.assert(0, "no obj yet");
	    } else {
	        // handle record conversion
	        Util.assert(0, "no record yet");
	    }
    } else {
        if (type.isIdFor(fromtype)) {
	        // convert ptr to id if not null
	        fs.writeSync(out, templates.forfrontendcvtfield.replace(/<varname>/g, varname));
	    } else {
	        fs.writeSync(out, templates.forfrontendfield.replace(/<varname>/g, varname));
	    }
    }
}

function createClass(obj)
{
    console.log("Creating %s in backend:%s frontend:%s table:%s", obj.class, obj.backend, obj.frontend, obj.table);
    var out = fs.openSync(obj.backend, "w");
    fs.writeSync(out, "// class "+obj.class+" Created on "+(new Date())+"\n");
    var header = rewrite(templates.header, obj);
    // write out class def
    fs.writeSync(out, header);
    // write out instance var def
    for (var i=0; i<obj.fields.length; i++) {
	    var f = obj.fields[i];
	    findIVtype(f, obj);	// claculate type we will store in instance var
	    var def = rewrite(templates.instanceVar, obj, f);
	    fs.writeSync(out, def);
    }
    // write out find function
    var str = rewrite(templates.find, obj);
    fs.writeSync(out, str);
    var str = rewrite(templates.findby, obj);
    fs.writeSync(out, str);
    // write out any findBy functions
    for (var i=0; i<obj.fields.length; i++) {
	    var f = obj.fields[i];
	    if ('key' in f) {
	        if (f.key == "unique")
		        fs.writeSync(out, rewrite(templates.findbyfield, obj, f));
	        else
		        fs.writeSync(out, rewrite(templates.findallbyfield, obj, f));
	    }
    }
    // convert to front end
    fs.writeSync(out, rewrite(templates.forfrontendHeader, obj));
    var clsrx = new RegExp("[^a-zA-Z0-9_.]*("+obj.class+")[^a-zA-Z0-9_.]*");
    for (var i=0; i<obj.fields.length; i++) {
	    var f = obj.fields[i];
	    if (('notinfrontend' in f)&&(f.notinfrontend == true)) continue;
	    fs.writeSync(out, "\trecord."+f.name+" = ");
	    convertFieldForFrontEnd(out, "me."+f.name, f.itype, f.fetype);
	    fs.writeSync(out, ";\n");
    }
    fs.writeSync(out, rewrite(templates.forfrontendTrailer, obj));

    // convert to db
    fs.writeSync(out, rewrite(templates.converttodbHeader, obj));
    for (var i=0; i<obj.fields.length; i++) {
	    var f = obj.fields[i];
	    if (('notindb' in f)&&(f.notindb)) continue;
	    if (clsrx.exec(f.type)) {
	        // convert ptr to id if not null
	        fs.writeSync(out, rewrite(templates.converttodbcvtfield, obj, f));
	    } else {
	        fs.writeSync(out, rewrite(templates.converttodbfield, obj, f));
	    }
    }
    fs.writeSync(out, rewrite(templates.converttodbTrailer, obj));

    // convert from db
    var header = rewrite(templates.convertfromdbHeader, obj);
    var postconv = "if (cb) cb(me)";
    if ('fromdb' in obj) {
	    postconv = "me."+obj.fromdb+"(record, cb)";
    }
    header = header.replace(/<postConvertFromDb>/g, postconv);
    fs.writeSync(out, header);
    for (var i=0; i<obj.fields.length; i++) {
	    var f = obj.fields[i];
	    var exp = f.name;
	    if (('backend' in f)&&(f.backend == "resolve")) {
	        // convert id to ptr if not null
	        if (!('typename' in f)) throw new Error('No typename in ', f.name);
	        var cvt = rewrite(templates.convertfromdbcvtfield, obj, f);
	        cvt = cvt.replace(/<typename>/g, f.typename);
	        fs.writeSync(out, cvt);
	    } else if (('notindb' in f)&&(f.notindb)) {
	        fs.writeSync(out, rewrite(templates.convertfromdbNotInDb, obj, f));
	    } else {
	        fs.writeSync(out, rewrite(templates.convertfromdbfield, obj, f));
	    }
    }
    fs.writeSync(out, rewrite(templates.convertfromdbTrailer, obj));
    // insert function
    fs.writeSync(out, rewrite(templates.insert, obj));

    // finally export class
    fs.writeSync(out, "module.exports = "+obj.class+";\n");
    fs.closeSync(out);
}

function rewrite(str, obj, f)
{
    //console.log('%s replacement %j', str, obj);
    try {
	str = str.replace(/<class>/g, obj.class);
	str = str.replace(/<table>/g, obj.table);
	if (f == undefined) return str;
	str = str.replace(/<dtype>/g, f.dtype.toString());
	str = str.replace(/<itype>/g, f.itype.toString());
	str = str.replace(/<ftype>/g, f.fetype.toString());
	str = str.replace(/<fname>/g, f.name);
	var ucase = f.name.substr(0,1).toUpperCase()+f.name.substr(1);
	str = str.replace(/<Fname>/g, ucase);
	str = str.replace(/<initial>/g, f.initial);
	return str;
    } catch (e) {
	console.error(e);
	console.error(str+" & "+util.inspect(def)+ " & "+f);
	throw e;
    }
}


function usage()
{
    console.error('makedb [-v] def-file');
    Util.exit(-1);
}


// Local Variables:
// tab-width: 4
// indent-tabs-mode: nil
// End:
