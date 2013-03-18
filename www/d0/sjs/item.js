/**
 * this is the superclass of all component items that we fetch from
 * the backend, e.g., Friend, Product, Shop, Link, ...  it's main job
 * is to store them, get them by some key and deal with the time when
 * we want them but they aren't here yet.
 * @constructor
 * @param {string=} id
 **/
function Item(id)
{
	if (id == undefined) return;
	this.id = id;
	this.constructor.all[id] = this;
}

// Item types

/** 
 *  @enum {number}
 *  types of items we can ask the backend for
 * THESE MUST BE NUMERIC FROM 0-N, WITH NO GAPS 
 **/ 
Item.type = {
    USER: Const.User,
    PAGE: Const.Page,
    SOURCE: Const.Source,
    SHAPE: Const.Shape,
    ANNOTE: Const.Annotation,
	NoType: 0
};

Item.type2class = {};

Item.all = {};
Item.classType = 0;

Util.addReadyHook(-10, function(){
		Item.type2class[Item.type.USER] = User;
		Item.type2class[Item.type.PAGE] = Page;
		Item.type2class[Item.type.SOURCE] = Source;
		Item.type2class[Item.type.SHAPE] = Shape;
		Item.type2class[Item.type.ANNOTE] = Annotation;
	});

/** @type {number} 
 *  @const
 *  @private
 *  THIS IS MAX INTEGER FROM THE ABOVE CONSTANTS
 */ Item.numTypes = Const.MaxTypesOfItems;		

/** @type {boolean} 
 *  @private
 *  @const
 */ Item.useTransaction = true;

/** @type {number} 
 *  @private
 *  @const
 */ Item.MaxTranSize = 10;

/** @type {number} 
 *  @private
 */ Item.inTransaction = 0;

// class vars

/** @type {Array.<{type:number,id:number}>} */ Item.tdata = [];
/** @type {!string} */ Item.name = "Item";
/** @type {number} */ Item.classType = Item.type.NoType;
/** @type {!JSONChecker} */ Item.RecordChecker;

// instance vars

/** @type {!string} */ Item.prototype.id;
/** @type {number} */ Item.prototype.waiting = 0;
/** @type {Array.<function(Item)>} */ Item.prototype.callbacks = [];

// class methods

/**
 * @param {string=} where
 **/
Item.startTransaction = function(where)
{
	if (Item.useTransaction) {
		//Console.log("starting transaction from "+where);
		Item.inTransaction++;
	} else {
		return;
	}
};

/**
 * endTransaction
 * transaction if over.  Issue it. When completed call cb if it is included
 *
 * @param {string=} where
 * @param {function()=} cb
 **/
Item.endTransaction = function(where, cb)
{
	// check to see if we are nested, if so - continue
	Item.inTransaction--;
	if (Item.inTransaction < 0) {
		// serious error, report it (but keep going)
		Util.assert(0, "inTransaction < 0 from "+where);
		Item.inTransaction = 0;
	} else if (Item.inTransaction > 0) {
		// still nested, so just return
		return;
	}

	Item.inTransaction = 0;
	Item.doTranCall(cb);
};

/**
 * doTranCall
 *
 * this is the call that sends actual stuff out.  No checking id done
 * here.  It is called from two places.
 *
 * @private
 * @param {function()=} cb
 **/
Item.doTranCall = function(cb)
{
	var info = Item.tdata;	// grab info locally
	Item.tdata = [];		// reset for future

	if (info.length == 0) {
        if (cb != undefined) {
            cb();
        }
        return; // there was nothing to get
    }
	// get everything at once
	Ajax.get('gettran', 
			 info,
			 'item.js:71a',
			 function(reply) {
				 if (reply.status != 0) {
					 Util.fatal("bad status on return from gettran"+reply.status);
					 // probably should return error to cb?
				 }
				 var rinfo = reply.data;
				 var i;
				 var len = rinfo.length;
				 for (i=0; i<len; i++) {
					 var t = parseInt(rinfo[i]['_itemtype'], 10);
					 delete rinfo[i]['_itemtype'];
					 var cls = Item.type2class[t];
					 var f = cls.all[rinfo[i].id];
					 //Console.log("Setting "+t+" for id:"+f.id);
					 f.setFromBackend(rinfo[i]);
					 f.checkForCallbacks();
				 }
				 if (cb != undefined) cb();
			 });
};

/**
 * queueRequest
 *
 * @private
 * @param {Item.type} type		the type of item we should get
 * @param {number|!string|!Array.<!string>} id				id of the item
 *
 * put request on tdata
 **/
Item.queueRequest = function(type, id)
{
	Util.assert(Item.inTransaction >= 1, "Que request but no transaction");
	if (id == undefined) Util.fatal("undefined id being queued");
	Item.tdata.push(type);
	Item.tdata.push(id);
	if (Item.tdata.length > (Item.MaxTranSize * 2)) {
		// we have reached the max size transaction, so send it out
		Item.doTranCall();
	}
};

/**
 * get
 *
 * @param {!string} key	key for this item
 * @param {function((!Item|!Array.<!Item>))=} 
 *											callback	callback when item is really here
 * @param {function(new:Item, string=)=} cls						class of item we are getting
 * @return {Item|Array.<Item>}				item for this key (even if it isn't here)
 *
 * get the kind of item being requested.  (defer to subclasses)
 **/
Item.get = function(key, callback, cls)
{
	if (key == undefined) {
        //#removeIfShip
        debugger;
        //#endremoveIfShip
		Util.fatal("Item.get called with undefined key for "+cls.name+" id:"+key);
    }

    /** @type {Item} */ var f;
	if (key in cls.all) {
		f = cls.all[key];
	} else {
		// it is not there, create new one and fetch info
		f = new cls(key);
		f.setupWaiting();
		f.Fetch();
		
		if (Item.inTransaction > 0) {
			// delay getting it until transaction is over
			Item.queueRequest(cls.classType, key);
		}
		//#removeIfShip
		else if (0) {
			var xx = new Error();
			Console.log(key+":"+cls.name+":"+xx.stack);
		}
		//#endremoveIfShip
	}
	f.maybeCallback(callback);
	return f;
};

/**
 * install
 *
 * @param {!string} key
 * @param {Item.type} clsid
 * @param {Object} obj
 *
 **/
Item.install = function(key, clsid, obj)
{
    var cls = Item.type2class[clsid];
    var f = new cls(key);
    f.setFromBackend(obj);
};

/**
 * Fetch
 * do actual call to back-end - only executes if not in a transaction
 *
 * @private
 **/
Item.prototype.Fetch = function()
{
	var me = this;
	if (!Item.inTransaction) {
        //#removeIfShip
        if (0) {
            var myStackTrace;
            try { (0)(); } catch(e) { myStackTrace=e.stack || e.stacktrace }
        }
        //#endremoveIfShip
		Ajax.get('get',
				 [this.constructor.classType, this.id],
				 'item.js:152',
				 function(reply) {
					 if (reply.status != 0) {
						 Util.error("bad status on return from get:"+reply.status);
						 return;
					 }
                     try{
                         me.setFromBackend(reply.data);
                         me.checkForCallbacks();
                     } catch(e) {
                         //#removeIfShip
                         console.log(Util.st2str(myStackTrace));
                         //#endremoveIfShip
                         throw e;
                     }
				 });
	}
};


// instance methods

/**
 * @param {ItemRecord} record
 **/
Item.prototype.setFromBackend = function(record) {
	var cls = this.constructor;
    cls.RecordChecker.check(record);
    /** @type {!string} */ var id = record.id;
    Util.assert(id == this.id, "returned "+id+" but not same as comment object");
    this.set(record);
};


/**
 * @param {function(!Item)=} callback	callback when item is really here
 *
 * if not waiting, execute callback, otherwise put on queue
 **/
Item.prototype.maybeCallback = function(callback)
{
	if (callback == undefined) return;
	if (this.waiting == 0) callback(this);
	//Console.log(this.constructor.name + ": " + this.id + " Adding to waiting");
    //SETH: if waiting == 0, do we want to execute the callback AND push the callback onto this.callbacks
	else this.callbacks.push(callback);
}

/**
 * VOID -> VOID
 **/
Item.prototype.checkForCallbacks = function()
{
	// now check for possible callbacks that should be executed
	while (this.waiting) {
		// stash callbacks in case something causes more to be added
		var callbacks = this.callbacks;
		this.waiting = 0;
		this.callbacks = [];

		// now process what we made local
		var i;
		var len = callbacks.length;

		//Console.log("" + this.id + " has waiting("+ len +") on a "+this.constructor.name);
		for (i=0; i<len; i++) {
			var cb = callbacks[i];
			cb(this);
		}
	}
}

/**
 * VOID -> VOID
 *
 * setup so if we access this we get temp data and deal with delayed loading
 **/
Item.prototype.setupWaiting = function()
{
	//Console.log(this.constructor.name+" is setting up waiting");
	Util.assert(this.waiting == 0, "setupwaiting when not 0??");
	this.waiting = 1;
	this.callbacks = [];
};

/**
 * @param {!function(!Item)} cb
 * call cb to render this item
 **/
Item.prototype.renderWhenReady = function(cb)
{
	this.maybeCallback(cb);
}

/**
 * @param {ItemRecord} record
 **/
Item.prototype.set = function(record) {
	Util.assert(this.id == record.id, "setting "+this.constructor.name+" with id mismatch (old:"+this.id+" new:"+record.id+")");
};

/**
 * @param {!ItemRecord} record
 **/
Item.createFromBackend = function(record) {
	Util.fatal("should be handled in a subclass");
};

/**
 * @param {number} expId		experience that asked for this to be stored
 * @param {function(!Item=)} cb	called when it has been stored in the DB and has an id
 **/
Item.prototype.store = function(expId, cb) {
	Util.assert(this.id == undefined, "You are storing something with an ID");
	this.setupWaiting();
	this.maybeCallback(cb);
}

/**
 * User
 * user class
 *
 * @constructor
 **/
function User()
{
}

/**
 * JSONChecker
 * fake json checker class
 *
 * @constructor
 **/
function JSONChecker()
{
}

// Local Variables:
// tab-width: 4
// indent-tabs-mode: nil
// End:
