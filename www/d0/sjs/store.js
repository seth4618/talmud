// In the following line, you should include the prefixes of implementations you want to test.
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
// Moreover, you may need references to some window.IDB* objects:
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange

/**
 * DB
 * indexDB class
 *
 * @constructor
 * @param {!string} name
 * @param {(number|string)=} version
 **/
function DB(name, version)
{
    this.version = version || 1;     // if this ios undefined, then we will
                                // open whatever the most recent
                                // version of the db is.  If this is
                                // the case, enforce schema = {}.
                                // I.e., first time you open the
                                // database you HAVE to set version
    this.name = name;
    this.schema = {};
    this.db = null;
}

/** @type {string} */ DB.READ_WRITE = "readwrite";
/** @type {string} */ DB.READ = "readonly";

/** @type {Object} */ DB.prototype.schema;
/** @type {(!string|number)} */ DB.prototype.version;
/** @type {!string} */ DB.prototype.name;
/** @type {*} */ DB.prototype.db;

/**
 * nowait
 * used when user doesn't want to wait for op to finish
 *
 * @private
 * @param {?Error} err
 * @param {Object=} obj
 **/
DB.nowait = function(err, obj)
{
};

/**
 * addStoreDefinition
 * add a def of a store for this db.  Do this before you open it!
 *
 * @param {!string} name
 * @param {Object} params
 * @param {boolean} clr
 **/
DB.prototype.addStoreDefinition = function(name, params, clr)
{
    this.schema[name] = {opt: params, clr: clr||false};
};

DB.prototype.addIndex = function(store, name, path, params)
{
    if (!(store in this.schema)) 
        throw new Error('Cannot add index for non-existent store:'+store);
    var storedef = this.schema[store];
    if (!('index' in storedef)) {
        // this is first index def
        storedef.index = {};
    }
    storedef.index[name] = {path: path, opt: params};
};

/**
 * upgrade
 * called to handle the upgrade event.  Right now we DO NOT upgrade a
 * store if it is already in the db.
 *
 * @private
 * @param {!Event} event
 **/
DB.prototype.upgrade = function(event)
{
    console.log('upgrading');
    // create all the stores we need
    var changes = 0;
    // delete some old one
    var old = this.db.objectStoreNames;
    for (var i=0; i<old.length; i++) {
        var name = old[i];
        if ((name in this.schema)&&(!this.schema[name].clr)) continue;
        // we deleted name
        console.log('UPGRADE:delete:'+name);
        this.db.deleteObjectStore(name);
    }
    // create new ones
    for (var name in this.schema) {
        var store;
        changes++;
        if(!this.db.objectStoreNames.contains(name)) {
            console.log('UPGRADE:create:'+name);
            store = this.db.createObjectStore(name, this.schema[name].opt);
            // create all the indices we need
            if ('index' in this.schema[name]) {
                var indices = this.schema[name].index;
                for (var idx in indices) {
                    console.log('UPGRADE:new index:'+idx+'@'+name);
                    store.createIndex(idx, indices[idx].path, indices[idx].opt);
                }
            }
        }
        else
        {
            // the db already had this store.  
            if ('index' in this.schema[name]) {
                var store = event.currentTarget.transaction.objectStore(name);
                var indices = this.schema[name].index;
                for (var idx in indices) {
                    try {
                        console.log('UPGRADE:delete index:'+idx+'@'+name);
                        store.deleteIndex(idx);
                    } catch (err) {
                        console.log('Error deleting '+idx+' on '+name+':'+err);
                    }
                }
                for (var idx in indices) {
                    try {
                        console.log('UPGRADE:create index:'+idx+'@'+name);
                        store.createIndex(idx, indices[idx].path, indices[idx].opt);
                    } catch (err) {
                        console.log('Error creating '+idx+' on '+name+':'+err);
                    }
                }
            }
        }
    }
    if (changes == 0) throw new Error('upgrade caused on '+this.name+', but no changes made');
};

var xxx;

/**
 * open
 * open the db.
 * Have already defined a schema if we think we can cause an upgrade event
 *
 * @param {function(?string)} cb
 **/
DB.prototype.open = function(cb)
{
    // a little bit of sanity?
    if (this.version == undefined) {
        for (var x in this.schema) {
            // not sure this reasonable, but lets see how it works
            throw new Error('version is undefined, but you have a schema');
        }
    } else {
        var ok=0;
        for (x in this.schema) {
            ok=1; break;
        }
        if (!ok) throw new Error('version defined, but no schema');
    }
    var me = this;
    var request = window.indexedDB.open(this.name, (/** @type {!string} */ this.version));
    xxx = request;
    request.onupgradeneeded = function(event) {
        me.db = event.target.result;
        console.log('upgrading');
	    me.upgrade(event);
    };
    request.onsuccess = function(e) {
        if (me.db) {
            if (me.db != e.target.result) console.log('onsucc has different def of db??');
        }
	    me.db = e.target.result;
	    // what about request.result?

	    me.db.onerror = function(event) {
	        // Generic error handler for all errors targeted at this database's
	        // requests!
	        alert("Database ("+me.name+") error: " + event.target.errorCode);
	    };
	    cb(null);
    };
    request.onerror = function(e) {
	    cb("Failed to open database:"+me.name);
    };
};

/**
 * rawinsert
 * insert a new record into the db.  record cannot exist
 *
 * @param {!string} sname
 * @param {Object} recd
 * @param {function(?Error, Object=)=} cb
 **/
DB.prototype.rawinsert = function(sname, recd, cb)
{
    if (cb == undefined) cb=DB.nowait;
	var trans = this.db.transaction([sname], DB.READ_WRITE);
    trans.oncomplete = function(e) { //console.log('readwrite transaction complete for '+sname) 
    };
	var store = trans.objectStore(sname);
    var req = store.add(recd);
    req.onsuccess = function(e) {
        //console.log('add complete with '+e.target.result);
        recd._id = e.target.result;
        cb(null, recd);
    };
    req.onerror = function(e) {
        console.log('Error doing add: '+e);
        cb(e);
    }
};

DB.prototype.rawupsert = function(sname, recd, cb)
{
    if (cb == undefined) cb=DB.nowait;
    if (!('_id' in recd)) {
        this.rawinsert(sname, recd, cb);
        return;
    }
	var trans = this.db.transaction([sname], DB.READ_WRITE);
    trans.oncomplete = function(e) { //console.log('transaction complete for '+sname) 
    };
	var store = trans.objectStore(sname);
    var req = store.put(recd);
    req.onsuccess = function(e) {
        //console.log('put complete with '+e.target.result);
        cb(null, recd);
    };
    req.onerror = function(e) {
        console.log('Error doing put: '+e);
        cb(e);
    }
};

/**
 * upsert
 * insert an object into the db.  Will convert first.  Error if already in db
 *
 * @param {function(new:DataBaseObject)} cls
 * @param {!DataBaseObject} obj
 * @param {function(?Error)=} cb
 **/
DB.prototype.upsert = function(cls, obj, cb)
{
    if (cb == undefined) cb=function() {};
    if (!('_id' in obj)) {
        this.insert(cls, obj, cb);
        return;
    }
    var recd = obj.convertToDB();
    recd._id = obj._id;
    this.rawupsert(cls.table, recd, function(err, storedRecd) {
        cb(err);
    });
};

/**
 * insert
 * insert an object into the db.  Will convert first.  Error if already in db
 *
 * @param {function(new:DataBaseObject)} cls
 * @param {!DataBaseObject} obj
 * @param {function(?Error)=} cb
 **/
DB.prototype.insert = function(cls, obj, cb)
{
    if (cb == undefined) cb=function() {};
    if (('_id' in obj)) {
        cb(new Error('object from '+cls.table+' is already in db'));
        return;
    }
    var recd = obj.convertToDB();
    this.rawinsert(cls.table, recd, function(err, storedRecd) {
        if (err == null) obj._id = storedRecd._id;
        cb(err);
    });
};

/**
 * find
 * find based on primary key, i.e., find on id
 *
 * @param {function(new:DataBaseObject)} cls
 * @param {number} id
 * @param {function(DataBaseObject)} cb
 **/
DB.prototype.find = function(cls, id, cb)
{
    if (id in cls.all) {
        cb(cls.all[id]);
        return;
    } 
    cls.all[id] = new cls(id);
    var sname = cls.table;
	var trans = this.db.transaction([sname], DB.READ);
    trans.oncomplete = function(e) { //console.log('read only transaction complete for '+sname) 
    };
	var store = trans.objectStore(sname);
    var req = store.get(id);
    req.onsuccess = function(e) {
        //console.log('get complete with '+e.target.result);
        if (e.target.result == undefined) cb(null); else cls.convertFromDB(e.target.result, cb);
    };
    req.onerror = function(e) {
        console.log('Error doing get on '+id+' : '+sname+':'+e);
        cb(null);
    }
};

/**
 * findBy
 * find based on a secondary key
 *
 * @param {function(new:DataBaseObject)} cls
 * @param {!string} iname
 * @param {*} val
 * @param {function(!Array)} cb
 **/
DB.prototype.findBy = function(cls, iname, val, cb)
{
    var sname = cls.table;
	var trans = this.db.transaction([sname], DB.READ);
    trans.oncomplete = function(e) { //console.log('read only transaction complete for '+sname) 
    };
	var store = trans.objectStore(sname);
    var index = store.index(iname);
    if (index == null) throw new Error('no index with name '+iname);
    var cnt = 1;
    var me = this;
    var result = [];
    //console.log('findby '+iname+' val = '+val);
    index.openKeyCursor(IDBKeyRange.only(val)).onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
            // cursor.key is a name, like "Bill", and cursor.value is the SSN.
            // No way to directly get the rest of the stored object.
            cnt++;
            //console.log('findby finding: '+cursor.primaryKey);
            me.find(cls, cursor.primaryKey, function(obj) {
                cnt--;
                result.push(obj);
                if (cnt == 0) cb(result);
            });
            cursor.continue();
        } else {
            cnt--;
            if (cnt == 0) cb(result);
        }
    };
};
    
function getfunc(x, y)
{
    if (x != null) 
        console.log('Error when getting '+x);
    if (y) {
        console.log('Just got: '+y._id+' and '+y.name);
        console.log(y);
    }
}

function addfunc(x, y)
{
    if (x != null) 
        console.log('Error when adding '+x);
    if (y) {
        console.log('Just added: '+y._id);
        console.log(y);
    }
}

function test()
{
    var db = new DB('first', 1);
    db.addStoreDefinition('source', {keyPath: '_id', autoIncrement: true});
    db.addIndex('source', 'name', 'name', {});
    db.addIndex('source', 'parent', 'parent', {});
    db.addStoreDefinition('page', {keyPath: '_id', autoIncrement: true});
    db.addIndex('page', 'source', 'source', {unique: true});
    db.addStoreDefinition('shape', {keyPath: '_id', autoIncrement: true});
    db.open(function(r) {
        if (r != null) alert('ERROR:'+r);
        else alert('you created a db!! and it is ready to go.');

        if (0) {
            db.rawinsert('source', {type: 0, name:'Babylonian Talmud'}, addfunc);
            db.rawinsert('source', {type: 1, name: 'Moed/Festival'},addfunc);
            db.rawinsert('source',           {type: 2, name:'Shabbat'}, addfunc);
            db.rawinsert('source',            {type: 3, name:'Shoal', number:23}, addfunc);
            db.rawinsert('source',            {type: 4, name:'149a',number:149}, addfunc);
            db.rawinsert('source', {type: 0, name:'Jerusalem Talmud'}, addfunc);
        }
        for (var i=0; i<100; i++) {
            db.find('source', i, getfunc);
        }
    });
}

/**
 * DataBaseObject
 * all db backed objects inherit from here
 *
 * @constructor
 **/
function DataBaseObject()
{
}

/** @type {!string} */ DataBaseObject.prototype.table;

/**
 * convertFromDB
 * <desc>
 *
 * @param {!Object} record
 * @param {!function(!DataBaseObject)} cb
 **/
DataBaseObject.prototype.convertFromDB = function(record, cb) 
{
};

/** @typedef {number} */ DataBaseObject.Key;

// Local Variables:
// tab-width: 4
// indent-tabs-mode: nil
// End:
