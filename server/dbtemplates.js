================ header
/**
 * <class>
 *
 * @constructor
 * @extends {DatabaseBackedObject}
 * @implements {FrontEndObject}
 **/
function <class>() 
{
}
Util.inherits(<class>, DatabaseBackedObject);

//////////////// class vars

/** @typedef {!string} */
<class>.ID;

/** 
 * @type{!string}
 * @const
 */
<class>.table = '<table>';

/** @type {!GenCache} */ <class>.directory = new GenCache("<class>s", <class>, 240);

//////////////// instance vars
/** @type {<class>.ID} */ <class>.prototype.id;

================ instanceVar
/** @type {<itype>} */ <class>.prototype.<fname>;
================ find
/**
 * find
 * find the <class> related to this id
 *
 * @param {!(<class>.ID|DBID)} id
 * @param {function(<class>)} cb
 **/
<class>.find = function(id, cb)
{
    try {
	db.find(<class>.table, id, <class>.directory, cb);
    } catch (err) {
	Util.info('at <class> with error '+err+"\n"+err.stack);
	cb(null);
    }
};
================ findby
/**
 * findby
 * find the <class> related to this query
 *
 * @param {!Object} query
 * @param {function(<class>)} cb
 **/
<class>.findBy = function(query, cb)
{
    try {
	db.findBy(<class>.table, query, <class>.directory, cb);
    } catch (err) {
	Util.info('findy at <class> with error '+err+"\n"+err.stack);
	cb(null);
    }
};
================ findbyfield
/**
 * findBy<Fname>
 * find the <class> by <fname>
 *
 * @param {<type>} key
 * @param {function(<class>)} cb
 **/
<class>.findBy<Fname> = function(key, cb)
{
    db.advancedQuery(<class>.table, {<fname>: key}, {_id: 1}, {}, function(results) {
	if ((results)&&(results.length == 1)) {
	    <class>.find(results[0]._id, cb);
	} else {
	    cb(null);
	}
    });
};
================ findallbyfield
/**
 * findAllBy<Fname>
 * find the array of <class> by <fname>
 *
 * @param {<type>} key
 * @param {function(!Array.<!<class>>)} cb
 **/
<class>.findAllBy<Fname> = function(key, cb)
{
    var result = [];
    db.advancedQuery(<class>.table, {<fname>: key}, {_id: 1}, {}, function(results) {
	if (results == null) results = [];
	var len = results.length;
	var synch = new Synchronizer(function () { cb(result); }, len+1);
	for (var i=0; i<len; i++) {
	   <class>.find(results[i]._id, function(x) { result.push(x); synch.done(1); });
	}
	synch.done(1);
    });
};
================ forfrontendHeader
/**
 * forFrontEnd
 * convert the object into something for the front-end
 *
 * @return {Object}
 **/
<class>.prototype.forFrontEnd = function()
{
    var record = {};
    var me = this;
================ forfrontendfield
    <varname>
================ forfrontendcvtfield
    (function(before) { if (before) return before.id; else return null; })(<varname>)
================ forfrontendarrayHeader
    (function(before) {
	var after = [];
	if (before) {
	var len = before.length;
	for (var i=0; i<len; i++) {
================ forfrontendarrayTrailer
	})(<varname>)
================ forfrontendTrailer
    return record;
};
================ converttodbHeader
/**
 * convertToDB
 * @param {!function(!Object)} cb
 * @param {Array.<!string>=} using
 */
<class>.prototype.convertToDB = function(cb, using)
{
    var record = {};
    var me = this;
================ converttodbfield
    record.<fname> = me.<fname>;
================ converttodbcvtfield
    if (me.<fname>) record.<fname> = me.<fname>._id; else record.<fname> = null;
================ converttodbTrailer
    if (this._id) {
        record._id = this._id;
    }
    cb(record);
};
================ convertfromdbHeader
/**
 * convertFromDB
 *
 * @param {Object} record	     data from DB
 * @param {function(!<class>)=} cb   if specified, call back when conversion is done
 */
<class>.prototype.convertFromDB = function(record, cb){
    var i;
    var me = this;
    var synch = new Synchronizer(function () { 
	    <postConvertFromDb>;
    }, 1, "<class>:"+me.id);
================ convertfromdbfield
    me.<fname> = record.<fname>;
================ convertfromdbNotInDb
    me.<fname> = <initial>;
================ convertfromdbcvtfield
    if (('<fname>' in record) && (record.<fname> != null)) {
	synch.wait(1);
        <typename>.find(record.<fname>, function(obj) {
 	   me.<fname> = obj;
	   synch.done(1);
	});
    } else {
	me.<fname> = null;
    }
================ convertfromdbTrailer
    synch.done(1);
};
================ insert
/**
 * insert
 *
 * @param {function(User)=} cb
 */
<class>.prototype.insert = function(cb) {
     db.insert(<class>.table, this, cb);
};
================ update
/**
 * update
 *
 * generic update function for simple updates
 *
 * @param{Array.<!string>} fields
 */
<class>.prototype.update = function(fields){
    var toset = {};
    for (var i in fields) {
        toset[fields[i]] = this[fields[i]];
    }
    var update = {
        $set : toset
    };
    db.rawupdate(<class>.table, {_id : this._id}, update);
};

/**
 * deleteMe
 * called when we want to delete this object
 *
 **/
<class>.prototype.deleteMe = function()
{
    //nothing special to do
};
================ itemheader
/**
 * item
 * get items from backend for the frontend
 *
 * @constructor
 *
 **/
function Item() {
}
================ item2clsheader
Item.type2cls = function(type) {
    var cls;
    switch (type) {
================ item2clstrailer
    default:
	throw new Error("Unknown type in type2cls:"+type);
    }
    return cls;
}
================ item2type
Item.type2cls = function(cls) {
    if ('ItemType' in cls) return cls.ItemType;
    throw new Error('cls without an ItemType');
}



