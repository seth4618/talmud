/**
 * Outline
 * A general annotation that resides on the page
 *
 * @constructor
 * @param {number=} id
 **/
function Outline(id)
{
    if (id != undefined) this._id = id;
    this.targets = [];
    this.selected = false;
}

/**
 * init
 * A general annotation that resides on the page
 *
 **/
Outline.prototype.init = function(container)
{
    this.container = container;
}

/** @type {!Object.<!DataBaseObject.Key,!Outline>} */ Outline.all = {};
Outline.table = 'shape';

/** @type {boolean} */ Outline.prototype.selected;
/** @type {!Shape} */ Outline.prototype.container;
/** @type {!Array.<!Outline>} */ Outline.prototype.targets;

/**
 * find
 * get Outline by id
 *
 * @param {!DataBaseObject.Key} id
 * @param {function(!Outline)} cb
 **/
Outline.find = function(id, cb)
{
	db.find(Outline, id, cb);
};

/**
 * convertFromDB
 * get source by id (implied get all the way back to root)
 * for this to work properly, root of tree needs to get preloaded
 *
 * @param {Object} recd
 * @param {function(!Outline)} cb
 **/
Outline.convertFromDB = function(recd, cb)
{
    s = Outline.all[recd._id];
    s.init(Shape.convertFromDB(recd.shape));
    var sync = new Synchronizer(function() {     cb(s); }, recd.targets.length+1, "Outlineload");
    for (var i=0; i<recd.targets.length; i++) {
        s.assignTarget(i, recd.targets[i], sync);
    }
    sync.done(1);
};

/**
 * insert
 * insert this one in the db.
 *
 * @param {function(!Outline)} cb
 **/
Outline.prototype.insert = function(cb)
{
    if ('_id' in this) throw new Error('already in db');
    var me = this;
    db.insert(Outline, this, function(err) {
	    if (err) throw new Error(err);
	    Outline.all[me._id] = me;
	    cb(me);
    });
};

/**
 * insert
 * insert this one in the db.
 *
 * @param {function(!Outline)=} cb
 **/
Outline.prototype.updateDB = function(cb)
{
    if (!('_id' in this)) throw new Error('not in db already');
    var me = this;
    db.upsert(Outline, this, function(err) {
	    if (err) throw new Error(err);
        if (cb == undefined) return;
	    cb(me);
    });
};

Outline.prototype.convertToDB = function()
{
    var recd = {};
    recd.shape = this.container.convertToDB();
    recd.targets = [];
    for (var i=0; i<this.targets.length; i++) {
        recd.targets.push(this.targets[i]._id);
    }
    return recd;
};

Outline.prototype.assignTarget = function(t, id, sync)
{
    var me = this;
    Outline.find(id, function(s) {
        me.targets[t] = s;
        sync.done(1);
    });
};

Outline.prototype.addRef = function(ref)
{
    this.targets.push(ref);
    this.updateDB();
};

Outline.prototype.render = function(target)
{
    this.container.render(target);
    var ctx = target.getContext();
    var color = this.container.type.getColor();
    ctx.strokeStyle = color.rgb();
    ctx.fillStyle = color.rgba();
    // now render lines to all references
    var old = ctx.lineWidth;
    ctx.lineWidth = old+2;
    var center = this.container.getCenterPoint();
    for (var i=0; i<this.targets.length; i++) {
	var targetContainer = this.targets[i].container;
        var tc = targetContainer.getCenterPoint();
        var from = this.container.getIntersectionWithPerimeter(center, tc);
        var to = targetContainer.getIntersectionWithPerimeter(center, tc);
        console.log('line from '+from.asString(1)+' -> '+to.asString(1));
        ctx.beginPath();
        ctx.moveTo(from.x(), from.y());
        ctx.lineTo(to.x(), to.y());
        ctx.closePath();
        ctx.stroke();
    }
    ctx.lineWidth = old;
};

Outline.prototype.renderSelected = function(target)
{
    this.container.renderSelected(target);
};

Outline.prototype.containsPoint = function(p)
{
    return this.container.containsPoint(p);
};
