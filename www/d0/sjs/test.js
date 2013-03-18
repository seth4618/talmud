var t=[[0,0],[200,0],[200,10],[125,10],[125,100],[75,100],[75,10],[0,10],[0,0]];

function Point(x, y)
{
    this.xval = x;
    this.yval = y;
};
Point.prototype.x;
Point.prototype.y;

Point.prototype.x = function(newx)
{
    if (newx == undefined) return this.xval;
    this.xval = newx;
    return this.xval;
};

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
    var p = new Point(this.xval+p.x(), this.yval+p.y());
    return p;
};

Point.prototype.minus = function(p)
{
    var p = new Point(this.xval-p.x(), this.yval-p.y());
    return p;
};

Point.prototype.asString = function()
{
    return ["(", this.x(), ",", this.y(), ")"].join('');
};

function Page(path, onload)
{
    this.path = path;
    this.shapes = [];
    this.offset = new Point(0,0);
    this.img = new Image();
    this.loaded = false;
    this.canvas = null;
    this.lineHeightGuess = 25;
    onload = onload || function() {};
    var me = this;
    this.img.onload = function(){
	me.loaded = true;
	onload(me);
    };
    this.img.src = path;
}
Page.prototype.path;
Page.prototype.shapes;
Page.prototype.offset;
Page.prototype.canvas;
Page.prototype.imageOffset;
Page.prototype.pageOffset;
Page.prototype.scale;

Page.prototype.setup = function(canvas)
{
    if (this.canvas == canvas) return;
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    // scale and offset
    var s = 1;
    var offset = new Point(0,0);
    // canvas size
    var ch = canvas.height;
    var cw = canvas.width;
    // image size
    var h = this.img.naturalHeight;
    var w = this.img.naturalWidth;
    // first scale it
    if (h > w) {
	s = ch/h;
    } else {
	s = cw/w;
    }
    if (s > 1) s = 1;
    this.context.scale(s, s);
    var offset = (cw-w*s)/2;
    if (offset > 0)
	this.context.translate(offset, 0);
    this.translate = new Point(offset,0);
    this.pageOffset = new Point(0,0);
    this.scale = s;
};

Page.prototype.zoomIn = function(f)
{
    this.context.scale(f, f);
    this.scale = this.scale * f;
    //console.log("before scaling by "+f+" we have: "+this.translate.asString());
    this.translate = this.translate.times(1/f);
    //console.log("after = "+this.translate.asString());
    this.render(this.canvas);
};

Page.prototype.pan = function(x, y)
{
    this.context.translate(x, y);
    this.translate = this.translate.plus(new Point(x, y));
    this.render(this.canvas);
};

function clearContext(ctx, canvas)
{
    // Store the current transformation matrix
    ctx.save();

    // Use the identity matrix while clearing the canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Restore the transform
    ctx.restore();
}

Page.prototype.render = function(canvas)
{
    this.setup(canvas);
    context = this.context;
    clearContext(context, canvas);

    // image size
    var h = this.img.naturalHeight;
    var w = this.img.naturalWidth;
    context.drawImage(this.img, 0, 0, w, h);
    for (var i=0; i<this.shapes.length; i++) this.renderShape(this.shapes[i]);
};

Page.prototype.reset = function(canvas)
{
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    var c = this.canvas;
    this.canvas = null;
    this.render(c);
};

Page.prototype.showlots = function()
{
    var canvas = this.canvas;
    var ctx = this.context;
    ctx.fillStyle =  (new Color(0, 100, 255, 1)).rgb();
    ctx.font = "24px sans-serif";
    for (var x=-400; x<=400; x+=200) {
	for (var y=-400; y<=400; y+= 200) {
	    ctx.fillStyle =  (new Color(255, 255, 255, 1)).rgb();
	    ctx.fillRect(x,y-40,100,80);
	    ctx.strokeStyle = (new Color(255,0,0,1)).rgb();
	    ctx.beginPath();
	    ctx.moveTo(x-50,y);
	    ctx.lineTo(x+50,y);
	    ctx.stroke();
	    ctx.moveTo(x,y-50);
	    ctx.lineTo(x,y+50);
	    ctx.stroke();
	    ctx.closePath();
	    ctx.fillStyle =  (new Color(0, 100, 255, 1)).rgb();
	    ctx.fillText(["(", x, ",", y, ")"].join(""), x, y);
	}
    }
};

Page.prototype.renderShape = function(s)
{
    s.renderAt(s.x(), s.y());
}

Page.prototype.addRect = function(x, y, w, h)
{
    var r = new Rect(x, y, w, h, 1);
    this.shapes.push(r);
    this.renderShape(r);
};

Page.prototype.setMouse = function(p)
{
    this.mouse = p;
};

Page.prototype.startPassage = function(p)
{
    this.passage = {points: [ p ]};
};

Page.prototype.continuePassage = function(p)
{
    console.log('continue passage @ '+p.asString());
    this.passage.points.push(p);
    this.guessPassage(this.passage, false);
};

Page.prototype.endPassage = function(p)
{
    console.log('end passage @ '+p.asString());
    this.passage.points.push(p);
    this.guessPassage(this.passage, true);
};

Page.prototype.guessPassage = function(passage, done)
{
    if (passage.points.length < 2) return;
    if (passage.points.length == 2) {
	passage.right = passage.points[0];
	passage.left = passage.points[1];
	var start = new Point(passage.left.x(), passage.right.y());
	var end = new Point(passage.right.x(), passage.left.y());
	if (!done) end.y(this.lineHeightGuess);
	var r = new Rect(start.x(), start.y(), end.x()-start.x(), end.y()-start.x(), done?2:1);
	this.renderShape(r);
    } else {
	passage.right = passage.points[0];
	passage.left = passage.points[1];
	for (var i=0; i<passage.points.length; i++) {
	    var p = passage.points[i];
	    if (p.x() > passage.right.x()) passage.right.x(p.x());
	    if (p.x() < passage.left.x()) passage.left.y(p.y());
	}
	var fullwidth = passage.right.x() - passage.left.x();
	var three = passage.points[2];
	// first do little rect
	var start = new Point(passage.left.x(), passage.points[0].y());
	var end = new Point(passage.points[1].x(), three.y());
	this.lineHeightGuess = three.y()-start.y();
	var r = new Rect(start.x(), start.y(), end.x()-start.x(), this.lineHeightGuess, 2);
	this.renderShape(r);
	if (passage.points.length == 3) {
	    // now do next line
	    r = new Rect(start.x(), three.y(), fullwidth, this.lineHeightGuess, 1);
	    this.renderShape(r);
	} else {
	    // we should be done now
	    var four = passage.points[3];
	    r = new Rect(start.x(), three.y(), fullwidth, four.y()-this.lineHeightGuess, 1);
	    this.renderShape(r);
	    // last line
	    r = new Rect(four.x(), four.y()-this.lineHeightGuess, passage.right.x()-four.x(), this.lineHeightGuess, 1);
	    this.renderShape(r);
	}
    }
};

function Rect(x, y, w, h, type)
{
    this.xval = x;
    this.yval = y;
    this.w = w;
    this.h = h;
    this.type = type;
}
Rect.prototype.x = function(newv) 
{
    return this.xval;
};

Rect.prototype.y = function(newv) 
{
    return this.yval;
};

Rect.prototype.renderAt = function(offx, offy)
{
    var color;
    if (this.type == 1) color = new Color(255, 165, 0, .3);
    else if (this.type == 2) color = new Color(255, 165, 0, .6);
    makeRect(context, offx, offy, this.w, this.h, color);
    //console.log([offx, offy, this.w, this.h, scale].join(', '));
};

$(document).ready(function() {
    var canvas = document.getElementById("maincanvas");
    var context = canvas.getContext("2d");
    var thispage = new Page("/page.jpg", function(p) { p.render(canvas); });
    var $mc = $('#maincanvas');
    // detect mouse
    var lastMouse;
    $mc.mousedown(function(evt) {
	var rect = canvas.getBoundingClientRect();
	var at = new Point(evt.clientX - rect.left, evt.clientY - rect.top);
	//console.log("scale="+thispage.scale);
	//console.log("translate="+thispage.translate.asString());
	//console.log("mouse="+at.asString());
	at = at.dividedBy(thispage.scale).minus(thispage.translate);
	//console.log("transformed="+at.asString());
	thispage.setMouse(at);
    });
    $mc.mousemove(function(evt) {
	var rect = canvas.getBoundingClientRect();
	var at = new Point(evt.clientX - rect.left, evt.clientY - rect.top);
	//console.log("scale="+thispage.scale);
	//console.log("translate="+thispage.translate.asString());
	//console.log("mouse="+at.asString());
	lastMouse = at.dividedBy(thispage.scale).minus(thispage.translate);
    });
    // detect keys
    $('body').keydown(function(evt) {
	evt.preventDefault();
	var code = evt.which;
	var charCode = String.fromCharCode(code);
	console.log(code+" = "+charCode);
	if (charCode == 'I') {
	    thispage.zoomIn(1.1);
	} else if (charCode == 'O') {
	    thispage.zoomIn(0.9);
	} else if (code == 37) {
	    // move left
	    thispage.pan(+20, 0);
	} else if (code == 39) {
	    // move right
	    thispage.pan(-20, 0);
	} else if (code == 40) {
	    // move down
	    thispage.pan(0, -20);
	} else if (code == 38) {
	    thispage.pan(0, 20);
	} else if (charCode == 'A') {
	    thispage.showlots();
	} else if (charCode == 'R') {
	    thispage.reset();
	} else if (charCode == 'S') {
	    thispage.startPassage(lastMouse);
	} else if (charCode == 'E') {
	    thispage.endPassage(lastMouse);
	} else if (charCode == 'C') {
	    thispage.continuePassage(lastMouse);
	}
    });
    $mc.focus();
});

function Color(r, g, b, a)
{
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
}
Color.prototype.r;
Color.prototype.g;
Color.prototype.b;
Color.prototype.a;

Color.prototype.rgb = function()
{
    return "rgb("+ [ this.r, this.g, this.b].join(",") + ")";
}

Color.prototype.rgba = function(a)
{
    a = a || this.a;
    return "rgba("+ [ this.r, this.g, this.b, a].join(",") + ")";
}


function makeRect(ctx, x, y, w, h, color)
{
    ctx.strokeStyle = color.rgb();
    ctx.fillStyle = color.rgba();
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
}

function makeNgon(ctx, x, y, points, color)
{
    ctx.strokeStyle = color.rgb();
    ctx.fillStyle = color.rgba();
    ctx.beginPath();
    ctx.moveTo(x+points[0][0], y+points[0][1]);
    for (var j=1; j<points.length; j++) {
	ctx.lineTo(x+points[j][0], y+points[j][1]);
    }
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x+points[0][0], y+points[0][1]);
    for (var j=1; j<points.length; j++) {
	ctx.lineTo(x+points[j][0], y+points[j][1]);
    }
    ctx.closePath();
    ctx.stroke();
}

