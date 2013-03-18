/**
 * Point
 * A point in 2-d space
 *
 * @constructor
 * @param {number} x
 * @param {number} y
 **/
function Point(x, y)
{
    this.xval = x;
    this.yval = y;
};
/** @type {number} */ Point.prototype.xval;
/** @type {number} */ Point.prototype.yval;

/**
 * x
 * return (and/or) set x coordinate
 *
 * @param {number=} newx
 * @return {number}
 **/
Point.prototype.x = function(newx)
{
    if (newx == undefined) return this.xval;
    this.xval = newx;
    return this.xval;
};

/**
 * y
 * return (and/or) set y coordinate
 *
 * @param {number=} newy
 * @return {number}
 **/
Point.prototype.y = function(newy)
{
    if (newy == undefined) return this.yval;
    this.yval = newy;
    return this.yval;
};

Point.prototype.times = function(f)
{
    var p = new Point(this.xval*f, this.yval*f);
    return p;
};

Point.prototype.dividedBy = function(f)
{
    var p = new Point(this.xval/f, this.yval/f);
    return p;
};

Point.prototype.plus = function(p)
{
    p = new Point(this.xval+p.x(), this.yval+p.y());
    return p;
};

Point.prototype.minus = function(p)
{
    p = new Point(this.xval-p.x(), this.yval-p.y());
    return p;
};

Point.prototype.copy = function()
{
    return new Point(this.xval, this.yval);
};

function round(x, decimals)
{
    if (decimals == undefined) return x;
    x = Math.round(x*Math.pow(10,decimals))/Math.pow(10,decimals);
    return x;
}

function ffmt(x, decimals)
{
    if (decimals == undefined) return x;
    x = round(x, decimals);
    if (decimals == 0) return x;
    x += "";
    if (x.indexOf(".")==-1) x+=".0";
    while (x.length-x.indexOf(".") < decimals) x += "0";
    return x;
};

/**
 * asString
 * return point formated as a string
 *
 * @param {number=} decimals
 * @return {!string}
 **/
Point.prototype.asString = function(decimals)
{
    return ["(", ffmt(this.x(), decimals), ",", ffmt(this.y(),decimals), ")"].join('');
};

////////////////////////////////////////////////////////////////

/**
 * Color
 * a color
 *
 * @constructor
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @param {number} a
 **/
function Color(r, g, b, a)
{
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
}
/** @type {number} */ Color.prototype.r;
/** @type {number} */ Color.prototype.g;
/** @type {number} */ Color.prototype.b;
/** @type {number} */ Color.prototype.a;

/**
 * rgb
 * return a color string (without opacity) for this color.
 *
 * @return {!string}
 **/
Color.prototype.rgb = function()
{
    return "rgb("+ [ this.r, this.g, this.b].join(",") + ")";
};

/**
 * rgba
 * return a color string for this color.  You can optionally modify the opacity
 *
 * @private
 * @param {number=} a
 * @return {!string}
 **/
Color.prototype.rgba = function(a)
{
    a = a || this.a;
    return "rgba("+ [ this.r, this.g, this.b, a].join(",") + ")";
};

/**
 * Shape
 * A general annotation that resides on the page
 *
 * @constructor
 * @param {!Annotation} type
 * @param {number} x
 * @param {number} y
 **/
function Shape(type, x, y)
{
    this.type = type;
    this.xval = x;
    this.yval = y;
    this.targets = {};
    this.selected = false;
}

Shape.table = 'shape';
/** @type {!Object.<!DataBaseObject.Key,!Shape>} */ Shape.all = {};

/** @type {!Annotation} */ Shape.prototype.type;
/** @type {boolean} */ Shape.prototype.selected;
/** @type {Object.<!string,!Shape>} */ Shape.prototype.targets;
/** @type {number} */ Shape.prototype.xval;
/** @type {number} */ Shape.prototype.yval;

Shape.prototype.x = function(newv) 
{
    return this.xval;
};

Shape.prototype.y = function(newv) 
{
    return this.yval;
};

Shape.prototype.kind = function()
{
    throw new Error('must be reimplemented for subclass');
};

/**
 * find
 * get shape by id
 *
 * @param {!DataBaseObject.Key} id
 * @param {function(!Shape)} cb
 **/
Shape.find = function(id, cb)
{
    if (id in Shape.all) {
	    cb(Shape.all[id]);
    } else {
	    db.find(Shape, id, cb);
    }
};

/**
 * insert
 * insert this one in the db.
 *
 * @param {function(!Shape)} cb
 **/
Shape.prototype.insert = function(cb)
{
    if ('_id' in this) throw new Error('already in db');
    var me = this;
    db.insert(Shape, this, function(err) {
	    if (err) throw new Error(err);
	    Shape.all[me._id] = me;
	    cb(me);
    });
};

Shape.prototype.convertToDB = function()
{
    var recd = {};
    recd.xval = this.xval;
    recd.yval = this.yval;
    recd.type = this.type.getKey();
    recd.targets = {};
    for (t in this.targets) {
        recd.targets[t] = this.targets[t]._id;
    }
    return recd;
};

Shape.kindToClass = [ null, Rectangle, NGon ];

/**
 * convertFromDB
 * get source by id (implied get all the way back to root)
 * for this to work properly, root of tree needs to get preloaded
 *
 * @param {Object} recd
 * @param {function(!Shape)} cb
 **/
Shape.convertFromDB = function(recd, cb)
{
    Annotation.find(recd.type, function(ann) {
        Shape.kindToClass[recd.kind].convertFromDB(recd, ann, cb);
    });
};

Shape.prototype.assignTarget = function(t, id, sync)
{
    var me = this;
    Shape.find(id, function(s) {
        me.targets[t] = s;
    });
};

Shape.prototype.convertFromDB = function(recd, cb)
{
    var me = this;
    me._id = recd._id;
    var sync = undefined;       // for now
    for (var t in recd.targets) {
        me.assignTarget(t, sync);
    }
    cb(me);
};

Rectangle.convertFromDB = function(recd, ann, cb)
{
    var r = new Rectangle(recd.xval, recd.yval, recd.width, recd.height, ann);
    r.convertFromDB(recd, cb);
};

NGon.convertFromDB = function(recd, ann, cb)
{
    var trace = [];
    for (var i=0; i<recd.trace.length; i++) {
        trace[i] = new Point(recd.trace[i].x, recd.trace[i].y);
    }
    var n = new NGon(trace, ann);
    n.convertFromDB(recd, cb);
};

////////////////////////////////////////////////////////////////


/**
 * Rectangle
 * A rectangular annotation
 *
 * @constructor
 * @extends {Shape}
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {!Annotation} type
 **/
function Rectangle(x, y, w, h, type)
{
    Rectangle.super_.call(this, type, x, y);
    this.w = w;
    this.h = h;
}
Util.inherits(Rectangle, Shape);

Rectangle.prototype.kind = function()
{
    return 1;
};

/**
 * renderAt
 * render this shape at offx, offy
 *
 * @param {!Canvas} target
 * @param {number} offx
 * @param {number} offy
 **/
Rectangle.prototype.renderAt = function(target, offx, offy)
{
    var color = this.type.getColor();
    var ctx = target.getContext();
    ctx.strokeStyle = color.rgb();
    ctx.fillStyle = color.rgba();
    ctx.fillRect(offx, offy, this.w, this.h);
    ctx.strokeRect(offx, offy, this.w, this.h);
};

Rectangle.prototype.render = function(target)
{
    this.renderAt(target, this.xval, this.yval);
};

/**
 * NGon
 * A polygonal annotation
 *
 * @constructor
 * @extends {Shape}
 * @param {Array.<!Point>} trace
 * @param {!Annotation} type
 **/
function NGon(trace, type)
{
    NGon.super_.call(this, type, trace[0].x(), trace[0].y());
    this.trace = trace;
}
Util.inherits(NGon, Shape);

NGon.prototype.kind = function()
{
    return 2;
};

NGon.prototype.renderWithAt = function(target, offx, offy, color)
{
    var ctx = target.getContext();
    ctx.strokeStyle = color.rgb();
    ctx.fillStyle = color.rgba();
    ctx.beginPath();
    offx -= this.trace[0].x();
    offy -= this.trace[0].y();
    ctx.moveTo(offx+this.trace[0].x(), offy+this.trace[0].y());
    for (var j=1; j<this.trace.length; j++) {
	ctx.lineTo(offx+this.trace[j].x(), offy+this.trace[j].y());
    }
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(offx+this.trace[0].x(), offy+this.trace[0].y());
    for (var j=1; j<this.trace.length; j++) {
	ctx.lineTo(offx+this.trace[j].x(), offy+this.trace[j].y());
    }
    ctx.closePath();
    ctx.stroke();
};

/**
 * renderAt
 * render this shape at offx, offy
 *
 * @param {!Canvas} target
 * @param {number} offx
 * @param {number} offy
 **/
NGon.prototype.renderAt = function(target, offx, offy)
{
    var color = this.type.getColor();
    this.renderWithAt(target, offx, offy, color);
};

NGon.prototype.render = function(target)
{
    this.renderAt(target, this.trace[0].x(), this.trace[0].y());
};

NGon.prototype.lowerleft = function()
{
    if ('ll' in this) return this.ll;
    var x = this.trace[0].x();
    var y = this.trace[0].y();
    for (var i=1; i<this.trace.length; i++) {
	if (this.trace[i].x() < x) x = this.trace[i].x();
	if (this.trace[i].y() > y) y = this.trace[i].y();
    }
    this.ll = new Point(x,y);
    return this.ll;
};

NGon.prototype.upperright = function()
{
    if ('ur' in this) return this.ur;
    var x = this.trace[0].x();
    var y = this.trace[0].y();
    for (var i=1; i<this.trace.length; i++) {
	if (this.trace[i].x() > x) x = this.trace[i].x();
	if (this.trace[i].y() < y) y = this.trace[i].y();
    }
    this.ur = new Point(x,y);
    return this.ur;
};

NGon.prototype.containsPoint = function(p)
{
    // first test bounding box
    if (  (this.upperright().x() < p.x())
	||(this.upperright().y() > p.y())
	||(this.lowerleft().x() > p.x())
	||(this.lowerleft().y() < p.y())) 
	return false;
    // now complex text (ray casting for fun)

    // choose epsilon to be big enough, but not too big
    var e = (this.upperright().x() - this.lowerleft().x())/100;
    // choose a starting point DEFINITELY outside the NGon
    var rayOrigin = this.lowerleft().copy();
    rayOrigin.x(rayOrigin.x()-e);
    rayOrigin.y(rayOrigin.y()+2*e);

    //console.log('ray: '+rayOrigin.asString()+'  e='+e);
    // test ray against all sides and count intersections
    var intersections = 0;
    var sides = this.trace.length;
    //console.log('sides: '+sides);
    for (var side = 0; side < sides; side++) {
	// Test if current side intersects with ray.
	var start = side;
	var end = side+1;
	if (end >= sides) end = 0;
	if (this.intersect(rayOrigin, p, start, end)) {
	    intersections++;
	    //console.log('Intersected! '+intersections);
	}
    }
    //console.log('Total intersections =  '+intersections);
    if ((intersections & 1) == 1) {
	return true;
    } 
    return false;
};

NGon.prototype.intersect = function(p, q, i, j)
{
    var r = this.trace[i];
    var s = this.trace[j];
    // does pq intersect ab?

    //#removeIfShip
    if (0) {
	var cnv = Canvas.getLast();
	var ctx = cnv.getContext();
	ctx.beginPath();
	console.log('Checking ['+[p.asString(),q.asString()].join(",")+']  against ['+[r.asString(),s.asString()].join(",")+']');
	ctx.strokeStyle = "blue";
	ctx.lineWidth = 4;
	ctx.moveTo(p.x(), p.y());
	ctx.lineTo(q.x(),q.y());
	ctx.stroke();
	ctx.strokeStyle = "pink";
	ctx.moveTo(r.x(), r.y());
	ctx.lineTo(s.x(),s.y());
	ctx.stroke();
	ctx.closePath();
    }
    //#endremoveIfShip

    var d1, d2;
    var a1, a2, b1, b2, c1, c2;

    // Convert vector 1 to a line (line 1) of infinite length.
    // We want the line in linear equation standard form: A*x + B*y + C = 0
    // See: http://en.wikipedir.org/wiki/Linear_equation
    a1 = q.y() - p.y();
    b1 = p.x() - q.x();
    c1 = (q.x() * p.y()) - (p.x() * q.y());

    // Every point (x,y), that solves the equation above, is on the line,
    // every point that does not solve it, is either above or below the line.
    // We insert (x1,y1) and (x2,y2) of vector 2 into the equation above.
    d1 = (a1 * r.x()) + (b1 * r.y()) + c1;
    d2 = (a1 * s.x()) + (b1 * s.y()) + c1;

    // If d1 and d2 both have the same sign, they are both on the same side of
    // our line 1 and in that case no intersection is possible. Careful, 0 is
    // a special case, that's why we don't test ">=" and "<=", but "<" and ">".
    if (d1 > 0 && d2 > 0) return false;
    if (d1 < 0 && d2 < 0) return false;

    // We repeat everything above for vector 2.
    // We start by calculating line 2 in linear equation standard form.
    a2 = s.y() - r.y();
    b2 = r.x() - s.x();
    c2 = (s.x() * r.y()) - (r.x() * s.y());

    // Calulate d1 and d2 again, this time using points of vector 1
    d1 = (a2 * p.x()) + (b2 * p.y()) + c2;
    d2 = (a2 * q.x()) + (b2 * q.y()) + c2;

    // Again, if both have the same sign (and neither one is 0),
    // no intersection is possible.
    if (d1 > 0 && d2 > 0) return false;
    if (d1 < 0 && d2 < 0) return false;

    // If we get here, only three possibilities are left. Either the two
    // vectors intersect in exactly one point or they are collinear
    // (they both lie both on the same infinite line), in which case they
    // may intersect in an infinite number of points or not at all.
    if ((a1 * b2) - (a2 * b1) == 0.0) {
	console.log('CO-LINEAR');
	return false;		// THIS IS ACTUALLY COLINEAR.  NOT SURE IF WE SHOULD COUNT IT OR NOT.  I THINK IT IS UNLIKELY GIVEN MY DEF OF rayOrigin
    }

    // If they are not collinear, they must intersect in exactly one point.
    return true;
};

NGon.prototype.renderSelected = function(cnv)
{
    console.log('selected shape @ '+this.trace[0].asString());
    this.renderWithAt(cnv.scratchpad, this.trace[0].x(), this.trace[0].y(), new Color(0, 155, 155, .5));
};

NGon.prototype.convertToDB = function()
{
    var recd = Shape.prototype.convertToDB.call(this);
    recd.kind = this.kind();
    recd.trace = [];
    for (var i=0; i<this.trace.length; i++) {
        recd.trace[i] = {x: this.trace[i].x(), y:this.trace[i].y()};
    }
    return recd;
};


// Local Variables:
// tab-width: 4
// indent-tabs-mode: nil
// End:
