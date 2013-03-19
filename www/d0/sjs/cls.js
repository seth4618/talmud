var t=[[0,0],[200,0],[200,10],[125,10],[125,100],[75,100],[75,10],[0,10],[0,0]];

/**
 * Page
 * The underlying page
 *
 * @constructor
 * @param {number} id
 **/
function Page(id)
{
    if (id != undefined) this._id = id;
    this.shapes = [];
    this.selected = -1;
    this.loaded = false;

}

/**
 * Page
 * The underlying page
 *
 * @param {!string} path
 * @param {!Source} name
 * @param {function(!Page)=} onload
 **/
Page.prototype.init = function(path, name, onload)
{
    this.path = path;
    this.name = name;
    this.offset = new Point(0,0);
    this.img = new Image();
    this.lineHeightGuess = 25;
    onload = onload || function(x) {};
    var me = this;
    this.img.onload = function(){
	    me.loaded = true;
	    onload(me);
    };
    this.img.src = path;
}

Page.table = 'page';
/** @type {!Object.<!DataBaseObject.Key,!Page>} */ Page.all = {};

/** @type {!string} */ Page.prototype.path;
/** @type {!Source} */ Page.prototype.name;
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
    this.addShape(new Rectangle(p.x(), p.y(), w, h, new Annotation('unknown')));
    this.render(r);
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

/**
 * endPassage
 * finish up a passage
 *
 * @param {!string} kind
 **/
Page.prototype.endPassage = function(kind)
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
    //console.log(lineheight+" LL:"+lowerleft.asString(1)+" UR:"+upperright.asString(1)+" ["+s.join(", ")+"]");
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
    this.addShape(new NGon(trace, new Annotation(kind)));
    this.render();
};

/**
 * addShape
 * add a new annotatin to the page
 *
 * @private
 * @param {!Shape} s
 **/
Page.prototype.addShape = function(s)
{
    var out = new Outline();
    out.init(s);
    this.shapes.push(out);
    var me = this;
    out.insert(function() {
        me.updateDB(function() {});
    });
    //db.add('onpage', {page: this.id, shape: s.id});
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
    //console.log(lineheight+" LL:"+lowerleft.asString(1)+" UR:"+upperright.asString(1)+" ["+str.join(", ")+"]");
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

/**
 * createReference
 * crate a link between src and ref
 *
 * @param {!Shape} src
 * @param {!Shape} ref
 **/
Page.prototype.createReference = function(src, ref)
{
    src.addRef(ref);
    this.canvas.scratchpad.clear();
    src.render(this.canvas);
};

Page.prototype.clearSelection = function()
{
    this.selected = -1;
	this.canvas.scratchpad.clear();
};

Page.prototype.getSelectedShape = function()
{
    if (this.selected == -1) return null;
    return this.shapes[this.selected];
};

// see if p is in an object
Page.prototype.selectObjectAt = function(p)
{
    for (var i=0; i<this.shapes.length; i++) {
	    this.canvas.scratchpad.clear();
	    this.shapes[i].renderSelected(this.canvas);

	if (this.shapes[i].containsPoint(p)) {
	    this.selected = i;
	    this.canvas.scratchpad.clear();
	    this.shapes[i].renderSelected(this.canvas);
	    return true;
	}
    }
    return false;
};

/**
 * find
 * get page by id
 *
 * @param {!DataBaseObject.Key} id
 * @param {function(!Page)} cb
 **/
Page.find = function(id, cb)
{
	db.find(Page, id, cb);
};

Page.findBySource = function(src, cb)
{
    db.findBy(Page, 'source', src._id, function(pages) {
        if (pages.length > 1) throw new Error('more than one page for src: '+src.asString());
        if (pages.length == 0) {
            cb(null);
        } else {
            cb(pages[0]);
        }
    });
};

/**
 * insert
 * insert this one in the db.
 *
 * @param {function(!Page)} cb
 **/
Page.prototype.insert = function(cb)
{
    if ('_id' in this) throw new Error('already in db');
    var me = this;
    db.insert(Page, this, function(err) {
	    if (err) throw new Error(err);
	    Page.all[me._id] = me;
	    cb(me);
    });
};

/**
 * updateDB
 * re-insert this one in the db.
 *
 * @param {function(!Page)=} cb
 **/
Page.prototype.updateDB = function(cb)
{
    if (!('_id' in this)) throw new Error('not in db already');
    var me = this;
    db.upsert(Page, this, function(err) {
	    if (err) throw new Error(err);
        if (cb == undefined) return;
	    cb(me);
    });
};

Page.prototype.convertToDB = function()
{
    var recd = {};
    recd.name = this.name._id;
    recd.path = this.path;
    recd.shapes = [];
    for (var i=0; i<this.shapes.length; i++) {
        recd.shapes.push(this.shapes[i]._id);
    }
    return recd;
};

/**
 * convertFromDB
 * get source by id (implied get all the way back to root)
 * for this to work properly, root of tree needs to get preloaded
 *
 * @param {Object} recd
 * @param {function(!Page)} cb
 **/
Page.convertFromDB = function(recd, cb)
{
    var me = Page.all[recd._id];
    Source.find(recd.name, function(src) { 
        me.init(recd.path, src, function(p) {});
        var sync = new Synchronizer(function() { cb(me); }, recd.shapes.length+1, "pageload");
        for (var i=0; i<recd.shapes.length; i++) {
            Outline.find(recd.shapes[i], function(s) { me.shapes.push(s); sync.done(1); });
        }
        sync.done(1);
    });
};

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

var startpage;

// hack for now
Util.addAsynchReadyHook(1, function(cb) {
    console.log('running cls hook');
    Source.find(6, function(s) {
        Page.findBySource(s, function(p) {
            if (p == null) {
                // create it 
                p = new Page();
                p.init("/images/yutorak.org-149a.gif", s, function() {});
                p.insert(function(pp) { startpage = pp; cb(); });
            } else {
                startpage = p;
                cb();
            }
        });
    });
});

var controller;

function showpage(p)
{
    if (p.loaded) {
        console.log('image is loaded');
        var canvas = new Canvas("maincanvas");
        canvas.addTemp();
        p.setup(canvas);
        p.render();
        controller = new UI(canvas, p);
    } else {
        console.log('image not loaded yet');
        setTimeout(function() { showpage(p); }, 200);
    }
}

// this is last thing we run
Util.addReadyHook(100, function() {
    var thispage;
    if (0) {
        var src = Source.fakedata();
        var path = "/page.jpg";
        path = "/images/yutorak.org-149a.gif";
        thispage = new Page();
        thispage.init(path, src, function(p) { p.setup(canvas); p.render(); });
    } else {
        thispage = startpage;
        showpage(thispage);
    }
});


// Local Variables:
// tab-width: 4
// indent-tabs-mode: nil
// End:
