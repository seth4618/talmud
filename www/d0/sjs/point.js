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


Color.prototype.asString = function()
{
    return this.rgba();
};

/**
 * Shape
 * A shape
 *
 * @constructor
 * @param {!Annotation} type
 * @param {number} x
 * @param {number} y
 **/
function Shape(type, x, y)
{
    //console.log('Creating '+x+','+y);
    this.type = type;
    this.xval = x;
    this.yval = y;
}

/** @type {number} */ Shape.prototype.xval;
/** @type {number} */ Shape.prototype.yval;
/** @type {!Annotation} */ Shape.prototype.type;

Shape.prototype.x = function(newv) 
{
    if (newv == undefined) return this.xval;
    this.xval = newv;
    if ('ll' in this) delete this.ll;
    if ('ur' in this) delete this.ur;
};

Shape.prototype.y = function(newv) 
{
    if (newv == undefined) return this.yval;
    this.yval = newv;
    if ('ll' in this) delete this.ll;
    if ('ur' in this) delete this.ur;
};

Shape.prototype.kind = function()
{
    throw new Error('must be reimplemented for subclass');
};

Shape.prototype.asString = function()
{
    return [ Util.getType(this), "@" , (new Point(this.xval, this.yval)).asString(2) ].join(' ');
};

Shape.prototype.convertToDB = function()
{
    var recd = {};
    recd.kind = this.kind();
    recd.xval = this.xval;
    recd.yval = this.yval;
    recd.type = this.type.getKey();
    return recd;
};

Shape.kindToClass = [ null, Rectangle, NGon ];

Shape.convertFromDB = function(recd)
{
    var cls = Shape.kindToClass[recd.kind];
    return cls.convertFromDB(recd, Annotation.sfind(recd.type));
};

Shape.prototype.renderSelected = function(cnv)
{
    //console.log('selected shape @ '+this.xval+","+this.yval);
    this.renderWithAt(cnv.scratchpad, this.xval, this.yval, new Color(0, 155, 155, .5));
};

/**
 * renderAt
 * render this shape at offx, offy
 *
 * @param {!Canvas} target
 * @param {number} offx
 * @param {number} offy
 **/
Shape.prototype.renderAt = function(target, offx, offy)
{
    var color = this.type.getColor();
    this.renderWithAt(target, offx, offy, color);
};

Shape.prototype.getCenterPoint = function()
{
    var ll = this.lowerleft();
    var ur = this.upperright();
    return new Point((ll.x()+ur.x())/2, (ll.y()+ur.y())/2);
};

/**
 * intersect
 * return true if line pq intersects with line rs
 *
 * @param {!Point} p
 * @param {!Point} q
 * @param {!Point} r
 * @param {!Point} s
 * @return {boolean}
 **/
Shape.prototype.intersect = function(p0, p1, p2, p3, getpoint)
{
    var s1_x = p1.x() - p0.x();     
    var s1_y = p1.y() - p0.y();
    var s2_x = p3.x() - p2.x();
    var s2_y = p3.y() - p2.y();

    var s = (-s1_y * (p0.x() - p2.x()) + s1_x * (p0.y() - p2.y())) / (-s2_x * s1_y + s1_x * s2_y);
    var t = ( s2_x * (p0.y() - p2.y()) - s2_y * (p0.x() - p2.x())) / (-s2_x * s1_y + s1_x * s2_y);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
    {
        if (getpoint) {
            // Collision detected
            return new Point(p0.x() + (t * s1_x), p0.y() + (t * s1_y));
        }
        return true;
    }
    return false; // No collision
};

Shape.prototype.containsQ = function(other)
{
    if (this.lowerleft().x() > other.lowerleft().x()) return false;
    if (this.lowerleft().y() < other.lowerleft().y()) return false;
    if (this.upperright().x() < other.upperright().x()) return false;
    if (this.upperright().y() > other.upperright().y()) return false;
    return true;
};

Shape.prototype.findOverlapOfBB = function(other)
{
    var x11 = this.lowerleft().x();
    var y11 = this.upperright().y();
    var x12 = this.upperright().x();
    var y12 = this.lowerleft().y();

    var x21 = other.lowerleft().x();
    var y21 = other.upperright().y();
    var x22 = other.upperright().x();
    var y22 = other.lowerleft().y();

    var xOverlap = Math.max(0, Math.min(x12,x22) - Math.max(x11,x21));
    var yOverlap = Math.max(0, Math.min(y12,y22) - Math.max(y11,y21));
    return xOverlap*yOverlap;
};

/**
 * finalizeMove
 *
 * some shapes may need some updating after a change in their
 * parameters is made.  (E.g., NGons).  And they will need storing in
 * DB too.
 *
 **/
Shape.prototype.finalizeMove = function()
{
    console.log("Finalize: "+this.asString());
};

////////////////////////////////////////////////////////////////


/**
 * Rectangle
 * A rectangular annotation
 *
 * @constructor
 * @extends {Shape}
 **/
function Rectangle(x, y, w, h, type)
{
    Rectangle.super_.call(this, type, x, y);
    this.w = w;
    this.h = h;
}
Util.inherits(Rectangle, Shape);

Rectangle.convertFromDB = function(recd, ann)
{
    if (!('w' in recd)) recd.w = 200;
    if (!('h' in recd)) recd.h = 100;
    return new Rectangle(recd.xval, recd.yval, recd.w, recd.h, ann);
};

Rectangle.prototype.convertToDB = function()
{
    var recd = Shape.prototype.convertToDB.call(this);
    recd.xval = this.xval;
    recd.yval = this.yval;
    recd.w = this.w;
    recd.h = this.h;
    return recd;
};

Rectangle.prototype.kind = function()
{
    return 1;
};

/**
 * renderWithAt
 * render this shape at offx, offy
 *
 * @param {!Canvas} target
 * @param {number} offx
 * @param {number} offy
 * @param {!Color} color
 **/
Rectangle.prototype.renderWithAt = function(target, offx, offy, color)
{
    //console.log('rect: '+offx+","+offy+"  for:"+this.w+"x"+this.h+"using "+color.rgb());
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

Rectangle.prototype.width = function(neww)
{
    if (neww == undefined) return this.w;
    this.w = neww;
    return neww;
};

Rectangle.prototype.height = function(newh)
{
    if (newh == undefined) return this.h;
    this.h = newh;
    return newh;
};

Rectangle.prototype.lowerleft = function()
{
    if ('ll' in this) {
        return this.ll;
    }
    this.ll = new Point(this.xval,this.yval+this.h);
    return this.ll;
};

Rectangle.prototype.upperright = function()
{
    if ('ur' in this) return this.ur;
    this.ur = new Point(this.xval+this.w,this.yval);
    return this.ur;
};

Rectangle.prototype.containsPoint = function(p)
{
    if (  (this.upperright().x() < p.x())
	      ||(this.upperright().y() > p.y())
	      ||(this.lowerleft().x() > p.x())
	      ||(this.lowerleft().y() < p.y())) 
	    return false;
    return true;
};

/**
 * getIntersectionWithPerimeter
 * return point of intersection between line pq and the side it intersects with on this rectangle
 * null if no intersection
 *
 * @private
 * @param {Point} p
 * @param {Point} q
 * @return {Point}
 **/
Rectangle.prototype.getIntersectionWithPerimeter = function(p, q)
{
    var sides = 4;
    var ll = this.lowerleft();
    var ur = this.upperright();
    var points = [ ll, new Point(ll.x(), ur.y()), ur, new Point(ur.x(), ll.y()) ];
    //console.log('sides: '+sides);
    for (var side = 0; side < sides; side++) {
	    // Test if current side intersects with pq.
	    var start = side;
	    var end = side+1;
	    if (end >= sides) end = 0;
        if (this.intersect(p, q, points[start], points[end])) {
            //#removeIfShip
            if (0) {
	            var cnv = Canvas.getLast();
	            var ctx = cnv.getContext();
	            ctx.beginPath();
                var r = points[start];
                var s = points[end];
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

	        //var ip = findIntersection(p, q, points[start], points[end]);
            var ip = this.intersect(p, q, points[start], points[end], true);
            if (ip) {
                return ip;
	        }
        }
    }
    return null;
};

/**
 * NGon
 * A polygonal annotation
 *
 * @constructor
 * @extends {Shape}
 * @param {number} id
 **/
function NGon(trace, type)
{
    NGon.super_.call(this, type, trace[0].x(), trace[0].y());
    this.trace = trace;
};
Util.inherits(NGon, Shape);

NGon.convertFromDB = function(recd, ann)
{
    var trace = [];
    for (var i=0; i<recd.trace.length; i++) {
        trace[i] = new Point(recd.trace[i].x, recd.trace[i].y);
    }
    return new NGon(trace, ann);
};

NGon.prototype.kind = function()
{
    return 2;
};

/**
 * renderWithAt
 * render this shape at offx, offy
 *
 * @param {!Canvas} target
 * @param {number} offx
 * @param {number} offy
 * @param {!Color} color
 **/
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

NGon.prototype.render = function(target)
{
    this.renderAt(target, this.trace[0].x(), this.trace[0].y());
};

NGon.prototype.width = function(neww)
{
    if (neww == undefined) return this.upperright().x()-this.lowerleft().x();
    throw new Error("Can't set width of ngon");
};

NGon.prototype.height = function(newh)
{
    if (newh == undefined) return this.lowerleft().y()-this.upperright().y();
    throw new Error("Can't set height of ngon");
};

NGon.prototype.lowerleft = function()
{
    if ('ll' in this) {
        //console.log('old ll: '+this.trace[0].asString(1)+" -> "+this.ll.asString(1)+' '+this.trace.length);
        return this.ll;
    }
    var x = this.trace[0].x();
    var y = this.trace[0].y();
    for (var i=1; i<this.trace.length; i++) {
	    if (this.trace[i].x() < x) x = this.trace[i].x();
	    if (this.trace[i].y() > y) y = this.trace[i].y();
    }
    this.ll = new Point(x,y);
    //console.log('ll: '+this.trace[0].asString(1)+" -> "+this.ll.asString(1)+' '+this.trace.length);
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
    var e = (this.upperright().x() - this.lowerleft().x())/50;
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

/**
 * getIntersectionWithPerimeter
 * return point of intersection between line pq and the side it intersects with on this ngon
 * null if no intersection
 *
 * @private
 * @param {Point} p
 * @param {Point} q
 * @return {Point}
 **/
NGon.prototype.getIntersectionWithPerimeter = function(p, q)
{
    var sides = this.trace.length;
    //console.log('sides: '+sides);
    for (var side = 0; side < sides; side++) {
	    // Test if current side intersects with pq.
	    var start = side;
	    var end = side+1;
	    if (end >= sides) end = 0;
        if (this.intersect(p, q, start, end)) {
            //#removeIfShip
            if (0) {
	            var cnv = Canvas.getLast();
	            var ctx = cnv.getContext();
	            ctx.beginPath();
                var r = this.trace[start];
                var s = this.trace[end];
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

	        //var ip = findIntersection(p, q, this.trace[start], this.trace[end]);
            ip = this.intersect(p, q, start, end, true)
            if (ip) {
                return ip;
	        }
        }
    }
    return null;
};

/**
 * findIntersection
 * return point of intersection between pq and rs, null if none
 *
 * @param {!Point} p
 * @param {!Point} q
 * @param {!Point} r
 * @param {!Point} s
 * @return {Point}
 **/
function findIntersection(p, q, r, s)
{
    throw new Error("don't call this anymore");
    var a1, a2, b1, b2, c1, c2;

    // Convert vector 1 to a line (line 1) of infinite length.
    // We want the line in linear equation standard form: A*x + B*y + C = 0
    // See: http://en.wikipedir.org/wiki/Linear_equation
    if (0) {
    a1 = q.y() - p.y();
    b1 = p.x() - q.x();
    c1 = (q.x() * p.y()) - (p.x() * q.y());
    } else {
        var dx = q.x()-p.x();
        var dy = q.y()-p.y();
        a1 = dx;
        b1 = -dy;
        c1 = p.y()*dy-p.x()*dx;
    }

    // We repeat everything above for vector 2.
    // We start by calculating line 2 in linear equation standard form.
    if (0) {
    a2 = s.y() - r.y();
    b2 = r.x() - s.x();
    c2 = (s.x() * r.y()) - (r.x() * s.y());
    } else {
        var dx = s.x()-r.x();
        var dy = s.y()-r.y();
        a2 = dx;
        b2 = -dy;
        c2 = r.y()*dy-r.x()*dx;
    }

    var delta = a1*b2 - a2*b1;
    if(delta == 0) {
        console.log('lines are parallel');
        return null;
    }
    var x = (b2*c1 - b1*c2)/delta;
    var y = (a1*c2 - a2*c1)/delta;
    if (x*y < 0) throw new Error('oppposite signs');
    if ((x < 0)||(y < 0)) {
        x=x*-1;
        y=y*-1;
    }
    return new Point(x, y);
}

NGon.prototype.intersect = function(p, q, i, j, getpoint)
{
    var r = this.trace[i];
    var s = this.trace[j];
    // does pq intersect rs?
    return Shape.prototype.intersect.call(this, p, q, r, s, getpoint);
};

/**
 * finalizeMove
 *
 * some shapes may need some updating after a change in their
 * parameters is made.  (E.g., NGons).  make trace[0].x() &
 * trace[0].y() be the same as this.x and this.y - and adjust all
 * other shapes.
 *
 **/
NGon.prototype.finalizeMove = function()
{
    var delta = new Point(this.x() - this.trace[0].x(),
                          this.y() - this.trace[0].y());
    var len = this.trace.length;
    for (var i=0; i<len; i++) {
        this.trace[i] = this.trace[i].plus(delta);
    }
    NGon.super_.prototype.finalizeMove.call(this);
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
