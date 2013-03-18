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


function Page(path, onload)
{
    this.path = path;
    this.shapes = [];
    this.zoom = 1;
    this.offset = new Point(0,0);
    this.img = new Image();
    this.loaded = false;
    this.canvas = null;
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
Page.prototype.zoom;
Page.prototype.offset;
Page.prototype.canvas;
Page.prototype.scaleForOne;
Page.prototype.imageOffset;
Page.prototype.pageOffset;
Page.prototype.scale;

Page.prototype.setup = function(canvas)
{
    if (this.canvas == canvas) return;
    this.canvas = canvas;
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
    h = s*h;
    w = s*w;
    // now center it
    if (h < ch) offset.y((ch-h)/2);
    if (w < cw) offset.x((cw-w)/2);
    this.scaleForOne = s;
    this.imageOffset = offset;
    this.scale = s;
    this.pageOffset = new Point(0,0);
};

Page.prototype.zoomIn = function(f)
{
    this.zoom = this.zoom * f
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
    context = canvas.getContext("2d");
    // image size
    var h = this.img.naturalHeight;
    var w = this.img.naturalWidth;
    var pageOffset = this.pageOffset;
    var imageOffset = this.imageOffset;
    var scale = this.zoom * this.scaleForOne;
    h = h*scale;
    w = w*scale;
    var ch = canvas.height;
    var cw = canvas.width;
    if (scale <= 1) {
	// smaller than viewport
	pageOffset = new Point(0,0);
	// now center it
	if (h < ch) imageOffset.y((ch-h)/2);
	if (w < cw) imageOffset.x((cw-w)/2);
	clearContext(context, canvas);
	context.drawImage(this.img, imageOffset.x(), imageOffset.y(), w, h);
    } else {
	// larger than viewport
	imageOffset = new Point(0,0);
	center = 
	pageOffset = 
    }
    this.imageOffset = imageOffset;
    this.scale = scale;
    this.pageOffset = pageOffset;
    for (var i=0; i<this.shapes.length; i++) this.renderShape(this.shapes[i]);
};

Page.prototype.renderShape = function(s)
{
    // scale it
    x = s.x() * this.scale;
    y = s.y() * this.scale;
    // move to proper place on page
    x -= this.pageOffset.x();
    y -= this.pageOffset.y();
    // adjust for image starting not at 0,0
    x += this.imageOffset.x();
    y += this.imageOffset.y();
    s.renderAt(x, y, this.scale);
}

Page.prototype.addRect = function(x, y, w, h)
{
    // adjust for image starting not at 0,0
    x -= this.imageOffset.x();
    y -= this.imageOffset.y();
    // adjust for page not all being in viewport
    x += this.pageOffset.x();
    y += this.pageOffset.y();
    // adjust for scaling
    x /= this.scale;
    y /= this.scale;
    w /= this.scale;
    h /= this.scale;
    var r = new Rect(x, y, w, h, 1);
    this.shapes.push(r);
    this.renderShape(r);
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

Rect.prototype.renderAt = function(offx, offy, scale)
{
    var orange = new Color(255, 165, 0, .4);
    makeRect(context, offx, offy, this.w*scale, this.h*scale, orange);
};

$(document).ready(function() {
    var canvas = document.getElementById("maincanvas");
    var context = canvas.getContext("2d");
    var thispage = new Page("/page.jpg", function(p) { p.render(canvas); });
    var orange = new Color(255, 165, 0, .2);
    var $mc = $('#maincanvas');
    // detect mouse
    $mc.mousedown(function(evt) {
	var rect = canvas.getBoundingClientRect();
	x = evt.clientX - rect.left,
	y = evt.clientY - rect.top
	thispage.addRect(x, y, 50, 50);
    });
    // detect keys
    $('body').keypress(function(evt) {
	evt.preventDefault();
	var code = evt.which;
	var charCode = String.fromCharCode(code);
	console.log(code+" = "+charCode);
	if (charCode == 'i') {
	    thispage.zoomIn(1.1);
	} else if (charCode == 'o') {
	    thispage.zoomIn(0.9);
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

