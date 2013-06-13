Source = require('./db/source.js');

/** @type {Object.<!string,!Source>} */ Source.root = {};

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

/** @type {!Source} */ Source.library;

/**
 * init
 * call this to install root of tree
 *
 * @param {function(!Source)} cb
 **/
Source.init = function(cb)
{
    console.log('init started');
    Source.findBy({name:"library"}, function(root) {
	console.log('recd from init = %j', root);
	if (root == null) {
	    // nothing in store yet
	    root = new Source();
	    root.name = 'library';
	    root.type = Source.Types.library;
	    root.insert(function(obj) {
		Source.library = root;
		cb(root);
		return;
	    });
	} else {
	    Source.library = root;
	    cb(root);
	}
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
    Source.findBy({name: name, parent: this._id}, cb);
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
	    s.parent = parent;
	    s.name = path[idx];
	    s.type = Source.createIdxToType[idx];
	    if (/^[0-9]+/.test(path[idx])) {
		// extract number from string
		var n = path[idx].match(/^[0-9]+/);
		s.number = parseInt(n[0], 10);
	    }
	    s.insert(function(err) {
		path[idx] = s;
		Source.createFromPath(path, cb, idx+1);
	    });
	} else {
	    path[idx] = node;
	    Source.createFromPath(path, cb, idx+1);
	}
    });
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
    var me = this;
    db.advancedQuery(Source.table, {parent: this._id}, {_id: 1}, {}, function(results) {
	if (results == null) {
	    cb(null);
	    return;
	}
	var final = [];
	var len = results.length;
	var synch = new Synchronizer(function () { 
	    cb(final);
	}, len, "getallchildren:"+me.id);
	for (var i=0; i<len; i++) {
	    Source.find(results[i]._id, function(c) { final.push(c); synch.done(1); });
	}
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
 * finishConvertFromDB
 *
 * @private
 * @param {Object} record
 * @param {function(!Source)} cb
 **/
Source.prototype.finishConvertFromDB = function(record, cb)
{
    if (this.parent) {
	this.parent.addChild(this);
    }
    if (cb) cb(this);
}

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
module.exports = Source;