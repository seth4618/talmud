if (typeof window === 'undefined') {
    console.log('running in node');
    Util = require('./util.js');
}

/**
 * Source
 * a descritption of a source
 *
 * @constructor
 * @param {Source?} parent
 * @param {!string} name
 **/
function Source(id)
{
    if (id != undefined) this._id = id;
    this.parent = null;
    this.name = 'undefined';
    this.child = null;
    this.next = null
    this.prev = null;
}

Source.prototype.init = function(parent, name)
{
    console.log('Creating source '+name+' with parent of '+((parent == null)?'null':parent.name));
    this.parent = parent;
    this.name = name;
    if (parent) {
	parent.addChild(this);
    }
};

Source.table = 'source';

/** @type {Object.<!string,!Source>} */ Source.root = {};

/** @type {Source} */ Source.prototype.parent;
/** @type {!string} */ Source.prototype.type;
/** @type {!string} */ Source.prototype.name;
/** @type {number} */ Source.prototype.number;
/** @type {Source} */ Source.prototype.next;
/** @type {Source} */ Source.prototype.prev;
/** @type {Source} */ Source.prototype.child;

Source.Types = {
    talmud: 0,
    order: 1,
    tractate: 2,
    chapter: 3,
    page: 4,
    library: 5
};

Source.createIdxToType = [ Source.Types.talmud, Source.Types.order, Source.Types.tractate, Source.Types.chapter, Source.Types.page ];

Source.TypeNames = {};
Source.TypeNames[Source.Types.talmud] =  'talmud';
Source.TypeNames[Source.Types.order] =  'seder/order';
Source.TypeNames[Source.Types.tractate] =  'Masekhet/Tractate';
Source.TypeNames[Source.Types.chapter] =  'Perek/Chapter';
Source.TypeNames[Source.Types.page] =  'Page';

Source.Format = {};
Source.Format[Source.Types.library] = {'long': [ 'CL:' ], 'short': []};
Source.Format[Source.Types.talmud] =  {'long': [ 'name', 'C,' ], 'short': []};
Source.Format[Source.Types.order] =  {'long': [ 'name', 'C,' ], 'short': [] };
Source.Format[Source.Types.tractate] =  {'long': [ 'name' ], 'short': [ 'name' ] };
Source.Format[Source.Types.chapter] =  {'long': [ 'C&lt;Perek ', 'R', 'number', 'C(', 'name', 'C)&gt;' ], 'short': [ 'C&lt;Perek ', 'R', 'number', 'C&gt;' ] };
Source.Format[Source.Types.page] =  {'long': [ 'name' ], 'short': [ 'name' ] };

/** @type {!Object.<!DataBaseObject.Key,!Source>} */ Source.all = {};
/** @type {!Source} */ Source.library;

/**
 * init
 * call this to install root of tree
 *
 * @param {function(!Source)} cb
 **/
Source.init = function(cb)
{
    //console.log('init started');
    db.find(Source, 1, function(recd) {
	//console.log('recd from init = '+recd);
	if (recd == null) {
	    // nothing in store yet
	    var root = new Source();
	    root.init(null, 'library');
	    root.type = Source.Types.library;
	    db.insert(Source, root, function(err) {
		if (err) throw err;
		Source.all[root._id] = root;
		Source.library = root;
		cb(root);
		return;
	    });
	} else {
	    var root = recd;
	    Source.library = root;
	    cb(root);
	}
    });
};

/**
 * find
 * get source by id (implied get all the way back to root)
 *
 * @param {!DataBaseObject.Key} id
 * @param {function(!Source)} cb
 **/
Source.find = function(id, cb)
{
    db.find(Source, id, cb);
};

/**
 * insert
 * insert this one in the db.
 *
 * @param {function(!Source)} cb
 **/
Source.prototype.insert = function(cb)
{
    if ('_id' in this) throw new Error('already in db');
    var me = this;
    db.insert(Source, this, function(err) {
	if (err) throw new Error(err);
	Source.all[me._id] = me;
	cb(me);
    });
};

Source.prototype.getChildType = function()
{
    switch (this.type) {
    case Source.Types.talmud:
    case Source.Types.order:
    case Source.Types.tractate:
    case Source.Types.chapter:
	return this.type+1;

    case Source.Types.library:
	return Source.Types.talmud;

    case Source.Types.page:
    default:
	return -1;
    }
};

Source.prototype.getChildTypeName = function()
{
    var ct = this.getChildType();
    if (ct >= 0) return Source.TypeNames[ct];
    return null;
};

/**
 * findChildByName
 * find the child of this node with a particular name
 *
 * @param {!string} name
 * @param {function(!Source)} cb
 **/
Source.prototype.findChildByName = function(name, cb)
{
    me = this;
    db.findBy(Source, 'name', name, function(children) {
	for (i=0; i<children.length; i++) {
	    console.log('finding against: '+((children[i].parent==null)?'null':children[i].parent._id));
	    if (children[i].parent == me) {
		cb(children[i]);
		return;
	    }
	}
	cb(null);
    });
};


/**
 * createFromPath
 * given a complete path, make sure all are in db
 *
 * @param {Array.<(!string|!Source)>} path
 * @param {function(Source)} cb
 * @param {number=} idx
 **/
Source.createFromPath = function(path, cb, idx)
{
    // on entry idx is 0 or undefined
    idx = idx || 0;
    // are we done?
    if ((path.length == 5)&&(idx == 5)) {
	cb((/** @type {!Source} */ path[idx-1]));
	return;
    }
    // expecting array to be of length 5
    if (path.length != 5) {
	cb(null);
	return;
    }
    
    var parent = Source.library;
    // get real parent if there is one
    if (idx > 0) parent = path[idx-1];
    // first I need to get parent
    parent.findChildByName(path[idx], function(node) {
	if (node == null) {
	    // this child does not exist in db, so create it
	    var s = new Source();
	    s.init((/** @type {!Source} */ parent), (/** @type {!string} */ path[idx]));
	    s.type = Source.createIdxToType[idx];
	    if (/^[0-9]+/.test(path[idx])) {
		// extract number from string
		var n = path[idx].match(/^[0-9]+/);
		s.number = parseInt(n[0], 10);
	    }
	    db.insert(Source, s, function(err) {
		if (err) throw new Error(err);
		Source.all[s._id] = s;
		path[idx] = s;
		Source.createFromPath(path, cb, idx+1);
	    });
	} else {
	    path[idx] = node;
	    Source.createFromPath(path, cb, idx+1);
	}
    });
};

Source.prototype.convertToDB = function()
{
    var recd = {};
    recd.name = this.name;
    recd.parent = (this.parent == null) ? 0 : this.parent._id;
    recd.type = this.type;
    recd.number = this.number;
    return recd;
};

/**
 * convertFromDB
 * get source by id (implied get all the way back to root)
 * for this to work properly, root of tree needs to get preloaded
 *
 * @param {Object} recd
 * @param {function(!Source)} cb
 **/
Source.convertFromDB = function(recd, cb)
{
    var fillin = function(parent, recd) {
	s = Source.all[recd._id];
	s.init(parent, recd.name);
	s.type = recd.type;
	s.number = recd.number;
	cb(s);
    };

    // if there is a parent, get it
    if ((!('parent' in recd)) || (recd.parent == undefined)||(recd.parent == 0)) {
	fillin(null, recd);
    } else {
	// first I need to get parent
	Source.find(recd.parent, function(parent) {
	    fillin(parent, recd);
	});
    }
};

Source.prototype.asString = function(verbose)
{
    var str ='';
    verbose = verbose || 'short';
    if (this.parent != null) str = this.parent.asString(verbose);
    console.log(this.name);
    // fill in my part
    var format = Source.Format[this.type][verbose];
    if (format.length == 0) return str;
    if (str.length > 0) str += ' ';
    for (var i=0; i<format.length; i++) {
	var token = format[i];
	switch (token.charAt(0)) {
	case 'C':
	    str += token.substr(1);
	    break;

	case 'R':
	    var x = format[i+1];
	    i++;
	    str += Util.romanize(this[x]);
	    break;

	default:
	    str += this[token];
	}
    }
    return str;
};

/**
 * getChildByName
 * gets child with this name.  assume already loaded into core
 *
 * @param {!string} name
 * @return {Source}
 **/
Source.prototype.getChildByName = function(name)
{
    var child = this.child;
    while (child) {
	if (child.name == name) return child;
	child = child.next;
    }
    return null;
};

/**
 * getChildren
 * get all children of this node
 *
 * @param {function(Array.<!Source>)} cb
 **/
Source.prototype.getChildren = function(cb)
{
    db.findBy(Source, 'parent', this._id, function(children) {
	cb(children);
    });
};

/**
 * fakedata
 * install some fake data
 *
 **/
Source.fakedata = function()
{
    var path = [ 'Babylonian Talmud', 'Moed/Festival', 'Shabbat', 'Shoal', '149a' ];
    var path3 = [ 'Babylonian Talmud', 'Moed/Festival', 'Shabbat', 'Shoal', '150b' ];
    var path2 = [ 'Babylonian Talmud', 'Moed/Festival', 'Eruvin', 'first', '6a' ];
    Source.createFromPath(path2, function(x){
	Source.createFromPath(path3, function(x){});
    });
    return;

    var page = [{type:Source.Types.talmud, name:'Babylonian Talmud'},
		{type:Source.Types.order, name: 'Moed/Festival'},
		{type:Source.Types.tractate, name:'Shabbat'},
		{type:Source.Types.chapter, name:'Shoal', number:23},
		{type:Source.Types.page, name:'149a',number:149}
	       ];
    var parent = null;
    for (var i=0; i<page.length; i++) {
	var info = page[i];
	var s = new Source();
	s.init(parent, info.name);
	for (var key in info) {
	    s[key] = info[key];
	}
	parent = s;
    }
    return parent;
};

/**
 * addChild
 * add child to this
 *
 * @private
 * @param {!Source} newchild
 **/
Source.prototype.addChild = function(newchild)
{
    if (this.child == null) 
	this.child = newchild;
    else {
	if (this.child.name > newchild.name) {
	    this.child.prev = newchild;
	    newchild.next = this.child;
	    this.child = newchild;
	} else {
	    for (var syb = this.child; (syb.next != null) && (syb.name < newchild.name); syb = syb.next) {}
	    newchild.next = syb;
	    newchild.prev = syb.prev;
	    if (syb.prev) syb.prev.next = newchild;
	    newchild.next = syb;
	}
    }
};

Util.addAsynchReadyHook(-50, function(cb) {
    console.log('running book hook');
    Source.init(cb);
});

if (typeof window === 'undefined') {
    console.log('started');
    var s = Source.fakedata();
    console.error(s);
    console.error(s.asString('long'));
    console.error('bye');
}
