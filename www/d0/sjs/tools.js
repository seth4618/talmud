var t=[[0,0],[200,0],[200,10],[125,10],[125,100],[75,100],[75,10],[0,10],[0,0]];

/**
 * Page
 * The underlying page
 *
 * @constructor
 * @param {!string} path
 * @param {function(!Page)=} onload
 **/
function Page(path, onload)
{
    this.path = path;
    this.shapes = [];
    this.selected = -1;
    this.offset = new Point(0,0);
    this.img = new Image();
    this.loaded = false;
    this.lineHeightGuess = 25;
    onload = onload || function(x) {};
    var me = this;
    this.img.onload = function(){
	me.loaded = true;
	onload(me);
    };
    this.img.src = path;
}
/** @type {!string} */ Page.prototype.path;
/** @type {!Array.<!Shape>} */ Page.prototype.shapes;
/** @type {!Point} */ Page.prototype.offset;
/** @type {!Point} */ Page.prototype.imageOffset;
/** @type {!Point} */ Page.prototype.pageOffset;

Page.prototype.setup = function(canvas)
{
    this.canvas = canvas;
    this.context = canvas.getContext();
    // scale and offset
    var s = 1;
    var offset = new Point(0,0);
    // canvas size
    var ch = canvas.getHeight();
    var cw = canvas.getWidth();
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
    canvas.zoom(s);
    var xoffset = (cw-w*s)/2;
    if (xoffset > 0)
	canvas.pan(new Point(xoffset, 0));
    this.pageOffset = new Point(0,0);
};

Page.prototype.render = function()
{
    this.canvas.clear();
    // image size
    var h = this.img.naturalHeight;
    var w = this.img.naturalWidth;
    this.canvas.getContext().drawImage(this.img, 0, 0, w, h);
    for (var i=0; i<this.shapes.length; i++) this.renderShape(this.shapes[i]);
    this.canvas.scratchpad.clear();
    if (this.selected != -1) {
	this.shapes[this.selected].renderSelected(this.canvas);
    }
};

Page.prototype.reset = function(canvas)
{
    canvas.reset();
    this.setup(canvas);
    this.render();
};

Page.prototype.showlots = function()
{
    var canvas = this.canvas;
    var ctx = canvas.getContext();
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
    s.render(this.canvas);
}

Page.prototype.addRect = function(p, w, h)
{
    var r = new Rectangle(p.x(), p.y(), w, h, new Annotation('unknown'));
    this.shapes.push(r);
    this.renderShape(r);
};

Page.prototype.startPassage = function()
{
    this.selected = -1;
    this.passage = {points: [ ], lineheight: 25};
};

Page.prototype.addPassagePoint = function(p, start)
{
    console.log((start?"starting line":"")+' and continue passage @ '+p.asString());
    if (start)
	this.passage.start = p;
    else {
	this.passage.points.push(this.passage.start);
	delete this.passage.start;
	this.passage.points.push(p);
	this.guessPassage(this.passage, true);
    }
};

Page.prototype.tempShowPassage = function(p)
{
    if ('start' in this.passage)
	this.guessPassage(this.passage, false, this.passage.start, p);
};

Page.prototype.endPassage = function()
{
    this.selected = -1;

    // commit this passage.  Could have 2, 3, 4, or 6 points
    var points = this.passage.points;

    // for now three lines:
    // first two points mark first line of passage
    // next set of points may mark vertical depth
    // last set of points mark last line of passage

    // calculate max-left and max-right
    var lowerleft = points[1].copy();
    var upperright = points[0].copy();
    var s = [];
    for (var i=0; i<points.length; i++) {
	var p = points[i];
	s.push(p.asString(1));
	if (p.x() > upperright.x()) upperright.x(p.x());
	if (p.x() < lowerleft.x()) lowerleft.y(p.y());
	if (p.y() < upperright.y()) upperright.y(p.y());
	if (p.y() > lowerleft.y()) lowerleft.y(p.y());
    }
    if (points.length > 2 ) {
	this.passage.lineheight = points[2].y()-upperright.y();
    }
    var lineheight = this.passage.lineheight;
    console.log(lineheight+" LL:"+lowerleft.asString(1)+" UR:"+upperright.asString(1)+" ["+s.join(", ")+"]");
    this.canvas.scratchpad.clear();

    if (points.length == 3) {
	points.splice(2,1);
    }

    var trace = [];
    var numpoints;
    var p;
    if (points.length >= 2) {
	p = new Point(points[0].x(), upperright.y());
	trace.push(p);
	p = new Point(lowerleft.x(), upperright.y());
	trace.push(p);
    }
    if (points.length == 2) {
	// use lineheight to complete the square
	trace.push(new Point(lowerleft.x(), upperright.y()+lineheight));
	trace.push(new Point(upperright.x(), upperright.y()+lineheight));
	numpoints = 4;
    } else if (points.length == 4) {
	// layout if we got 4 points [orignal-point]
	// numbers not in brackets represent the location in the trace array
	//
	// 1               0
	// [1]------------[0]
	// |		   |
	// |		   |
	// |	       	   +---[2]4
	// |		   5	|
	// |			|
	// +-------------------[3]
	// 2                    3
	//
	trace.push(new Point(lowerleft.x(), points[3].y()));
	trace.push(new Point(upperright.x(), points[3].y()));
	trace.push(new Point(upperright.x(), points[2].y()));
	trace.push(new Point(points[0].x(), points[2].y()));
	numpoints = 6;
    } else if (points.length == 6) {
	// layout if we got 6 points [orignal-point]
	// numbers not in brackets represent the location in the trace array
	//
	// 1               0
	// [1]------------[0]
	// |		   |
	// |		   |
	// |	       	   +---[2]6
	// |		   7   	|
	// |2		    	|
	// +------------+      [3]
	//             3|       |
	//		|   	|
	//     	       [5]-----[4]
	//		4      	5
	trace.push(new Point(lowerleft.x(), points[3].y())); // 2
	trace.push(new Point(points[5].x(), points[3].y())); // 3
	trace.push(new Point(points[5].x(), lowerleft.y())); // 4
	trace.push(new Point(upperright.x(), lowerleft.y())); // 5
	trace.push(new Point(upperright.x(), points[2].y())); // 6
	trace.push(new Point(points[0].x(), points[2].y())); // 7
	numpoints = 8;
    }
    this.shapes.push(new NGon(trace, new Annotation('passage')));
    this.render();
};

var first = 1;
/**
 * guessPassage
 * show user where they are as they are marking passage
 *
 * @private
 * @param {!Object} passage
 * @param {boolean} done
 * @param {!Point=} s
 * @param {!Point=} e
 **/
Page.prototype.guessPassage = function(passage, done, s, e)
{
    //console.log('gp: '+passage.points.length+(done?"":s.asString()+" & "+e.asString()));
    var points = [];
    for (var i=0; i<passage.points.length; i++) {
	points.push(passage.points[i]);
    }
    if (!done) {
	points.push(s);
	points.push(e);
    }

    // for now three lines:
    // first two points mark first line of passage
    // next set of points may mark vertical depth
    // last set of points mark last line of passage

    // calculate max-left and max-right
    var lowerleft = points[1].copy();
    var upperright = points[0].copy();
    var str = [];
    for (var i=0; i<points.length; i++) {
	var p = points[i];
	str.push(p.asString(1));
	if (p.x() > upperright.x()) upperright.x(p.x());
	if (p.x() < lowerleft.x()) lowerleft.y(p.y());
	if (p.y() < upperright.y()) upperright.y(p.y());
	if (p.y() > lowerleft.y()) lowerleft.y(p.y());
    }
    if (points.length > 2 ) {
	passage.lineheight = points[2].y()-upperright.y();
    }
    var lineheight = passage.lineheight;
    console.log(lineheight+" LL:"+lowerleft.asString(1)+" UR:"+upperright.asString(1)+" ["+str.join(", ")+"]");
    this.canvas.scratchpad.clear();
    if (points.length >= 2) {
	// guess on first line height
	var r = new Rectangle(lowerleft.x(), upperright.y(), points[0].x()-points[1].x(), lineheight, new Annotation('unknown'));
	r.render(this.canvas.scratchpad)
    }
    if (points.length >= 4) {
	if (first && points[3].y()-points[2].y() > 50) {
	    first = 0;
	}
	var r = new Rectangle(lowerleft.x(), points[2].y(), upperright.x()-lowerleft.x(), points[3].y()-points[2].y(), new Annotation('middle'));
	r.render(this.canvas.scratchpad)
    }
    if (points.length == 6) {
	var r = new Rectangle(points[5].x(), points[4].y()-lineheight, upperright.x()-points[5].x(), lineheight, new Annotation('unknown'));
	r.render(this.canvas.scratchpad)
    }
};

// see if p is in an object
Page.prototype.selectObjectAt = function(p)
{
    for (var i=0; i<this.shapes.length; i++) {
	if (this.shapes[i].containsPoint(p)) {
	    this.selected = i;
	    this.canvas.scratchpad.clear();
	    this.shapes[i].renderSelected(this.canvas);
	    return;
	}
    }
};

/**
 * UI
 * The UI controller
 *
 * @constructor
 * @param {!Canvas} canvas
 * @param {!Page} page
 **/
function UI(canvas, page)
{
    this.canvas = canvas;
    this.page = page;
    this.installHandlers();
    this.mode = UI.Mode.Quiet;
}

UI.Mode = {
    Quiet: 0,
    MarkPassage: 1,
    AddRect: 2
};

/** @type {!Canvas} */ UI.prototype.canvas;
/** @type {!Page} */ UI.prototype.page;

UI.prototype.handleClick = function(evt, cnv)
{
    if (this.mode == UI.Mode.AddRect) {
	this.page.addRect(cnv.mouseAt, 50, 50);
    } else if (this.mode == UI.Mode.Quiet) {
	// select the object under point
	this.page.selectObjectAt(cnv.mouseAt);
    }
};

UI.prototype.handleMouseDown = function(evt, cnv)
{
    if (this.mode == UI.Mode.MarkPassage)
	this.page.addPassagePoint(cnv.mouseAt, true);
};

UI.prototype.handleMouseUp = function(evt, cnv)
{
    if (this.mode == UI.Mode.MarkPassage) {
	this.page.addPassagePoint(cnv.mouseAt, false);
    }
};

UI.prototype.handleMouseMove = function(evt, cnv)
{
    if (this.mode == UI.Mode.MarkPassage) {
	this.page.tempShowPassage(cnv.mouseAt);
    }
};

UI.prototype.handleKeydown = function(evt)
{
    evt.preventDefault();
    var code = evt.which;
    var charCode = String.fromCharCode(code);
    //console.log(code+" = "+charCode);

    switch (charCode) {
    case 'I':
	this.canvas.zoom(1.1);
	this.page.render();
	break;

    case 'O':
	this.canvas.zoom(0.9);
	this.page.render();
	break;

    case  'A':
	this.page.showlots();
	break;

    case  'R':
	this.mode = UI.Mode.AddRect;
	break;

    case  'M':
	this.mode = UI.Mode.MarkPassage;
	this.page.startPassage();
	break;

    case  'F':
	if (this.mode == UI.Mode.MarkPassage) {
	    this.mode = UI.Mode.Quiet;
	    this.page.endPassage();
	}
	break;

    default:
	switch (code) {
	case  37:
	    // move left
	    this.canvas.pan(new Point(20, 0));
	    this.page.render();
	    break;

	case  39:
	    // move right
	    this.canvas.pan(new Point(-20, 0));
	    this.page.render();
	    break;

	case  40:
	    // move down
	    this.canvas.pan(new Point(0, -20));
	    this.page.render();
	    break;

	case  38:
	    this.canvas.pan(new Point(0, 20));
	    this.page.render();
	    break;
	}
    }
};

UI.prototype.installHandlers = function()
{
    var me = this;
    this.canvas.mouseListner('click', function(evt, cnv) {
	me.handleClick(evt, cnv);
    });
    this.canvas.mouseListner('mousedown', function(evt, cnv) {
	me.handleMouseDown(evt, cnv);

    });
    this.canvas.mouseListner('mouseup', function(evt, cnv) {
	me.handleMouseUp(evt, cnv);
    });
    this.canvas.mouseListner('mousemove', function(evt, cnv) {
	me.handleMouseMove(evt, cnv);
    });
    // detect keys
    $('body').keydown(function(evt) {
	me.handleKeydown(evt);
    });
};

$(document).ready(function() {
    var canvas = new Canvas("maincanvas");
    canvas.addTemp();
    var thispage = new Page("/page.jpg", function(p) { p.setup(canvas); p.render(); });
    var controller = new UI(canvas, thispage);
});

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


// Local Variables:
// tab-width: 4
// indent-tabs-mode: nil
// End:
