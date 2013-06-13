var fs = require("fs");
var util = require("util");
var Util = require("./util.js");

var argv = require('optimist')
    .usage('makedb [-v] def-file')
    .describe('v', 'verbose')
    .argv;

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
    console.log(templates);
} catch (e) {
    console.error(e);
    Util.exit(103);
}
var obj;
try {
    var sinfo = (/** @type {!string} */ fs.readFileSync(srcFilename)).toString();
    console.log(sinfo);
    obj = (/** @type {!Object} */ (JSON.parse(sinfo)));
} catch(e) {
    console.error(e);
    console.error('failed to read %s. perhaps the json is misformed or it is not there?', srcFilename);
    Util.exit(102);
}
console.log("Creating %s in backend:%s frontend:%s table:%s", obj.class, obj.backend, obj.frontend, obj.table);
var out = fs.openSync(obj.backend, "w");
fs.writeSync(out, "// class "+obj.class+" Created on "+(new Date())+"\n");
var header = rewrite(templates.header, obj);
// write out class def
fs.writeSync(out, header);
// write out instance var def
for (var i=0; i<obj.fields.length; i++) {
    var def = rewrite(templates.instanceVar, obj, obj.fields[i]);
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
	fs.writeSync(templates.findbyfield, obj, f);
    }
}
// convert to front end
fs.writeSync(out, rewrite(templates.forfrontendHeader, obj));
var clsrx = new RegExp("[^a-zA-Z0-9_.]*("+obj.class+")[^a-zA-Z0-9_.]*");
for (var i=0; i<obj.fields.length; i++) {
    var f = obj.fields[i];
    var exp = f.name;
    if (clsrx.exec(f.type)) {
	// convert ptr to id if not null
	fs.writeSync(out, rewrite(templates.forfrontendcvtfield, obj, f));
    } else {
	fs.writeSync(out, rewrite(templates.forfrontendfield, obj, f));
    }
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
	var typename = clsrx.exec(f.type);
	var cvt = rewrite(templates.convertfromdbcvtfield, obj, f);
	cvt = cvt.replace(/<typename>/g, typename[1]);
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
Util.exit(0);

function rewrite(str, def, f)
{
    try {
	str = str.replace(/<class>/g, obj.class);
	str = str.replace(/<table>/g, obj.table);
	if (f == undefined) return str;
	str = str.replace(/<type>/g, f.type);
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

