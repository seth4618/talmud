/**
 * Canvas
 * A wrapper for the underlying canvas element.  Tracks scale and translate so we can do inverse in code
 *
 * @constructor
 * @export
 * @param {!string} elementid
 **/
function Canvas(elementid)
{
    this.scale = 1;
    this.translate = new Point(0,0);
    if (elementid == undefined) return;
    this.init(elementid);
}

Canvas.Events = [ 'mousedown', 'mousemove', 'click', 'mouseup' ];

/** @type {Element} */ Canvas.prototype.canvas;
/** @type {*} */ Canvas.prototype.context;
/** @type {number} */ Canvas.prototype.scale;
/** @type {!Point} */ Canvas.prototype.translate;
/** @type {!Canvas} */ Canvas.prototype.scratchpad;
/** @type {Object.<!string,!Array.<Function>>} */ Canvas.prototype.listners;

Canvas.getLast = function()
{
    return Canvas.lastCanvas;
};

Canvas.prototype.init = function(element)
{
    this.canvas = document.getElementById(element);
    this.context = this.canvas.getContext("2d");
    Canvas.lastCanvas = this;
};

Canvas.prototype.addTemp = function()
{
    var child = document.createElement('canvas');
    if (!child) {
	    alert('Error: I cannot create a new canvas element!');
	    return;
    }

    child.id     = 'childCanvas';
    child.width  = this.canvas.width;
    child.height = this.canvas.height;
    this.canvas.parentNode.appendChild(child);
    var kid = new Canvas('childCanvas');
    this.scratchpad = kid;
    // pass all events to parent
    var $tmp = $(child);
    var me = this;
    var up = function(evt) {
	    me.handleMouse(evt);
    }
    for (var i=0; i<Canvas.Events.length; i++) {
	    $tmp.on(Canvas.Events[i], up);
    }
    return kid;
};

Canvas.prototype.translateCoordinates = function(evt)
{
    var rect = this.canvas.getBoundingClientRect();
    var at = new Point(evt.clientX - rect.left, evt.clientY - rect.top);
    at = at.dividedBy(this.scale).minus(this.translate);
    return at;
};

Canvas.prototype.zoom = function(factor)
{
    this.context.scale(factor, factor);
    this.scale = this.scale * factor;
    this.translate = this.translate.times(1/factor);
    if (this.scratchpad != undefined) this.scratchpad.zoom(factor);
};

Canvas.prototype.getHeight = function()
{
    return this.canvas.height;
};

Canvas.prototype.getWidth = function()
{
    return this.canvas.width;
};

Canvas.prototype.getContext = function()
{
    return this.context;
};

Canvas.prototype.pan = function(p)
{
    this.context.translate(p.x(), p.y());
    this.translate = this.translate.plus(p);
    if (this.scratchpad != undefined) this.scratchpad.pan(p);
};

Canvas.prototype.clear = function()
{
    // Store the current transformation matrix
    this.context.save();

    // Use the identity matrix while clearing the canvas
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Restore the transform
    this.context.restore();
};

Canvas.prototype.reset = function()
{
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.scale = 1;
    this.translate = new Point(0,0);
    this.clear();
};

Canvas.prototype.mouseListner = function(type, cb)
{
    if (this.listners == undefined) {
	    this.setupMouse();
    }
    if (type in this.listners)
	    this.listners[type].push(cb);
    else
	    alert('No listner of type:'+type);
};

Canvas.prototype.setupMouse = function()
{
    var me = this;
    var mouseHandler = function(evt) {
	    me.handleMouse(evt);
    };
    this.listners = {};
    var $canvas = $(this.canvas);
    for (var i=0; i<Canvas.Events.length; i++) {
	    this.listners[Canvas.Events[i]] = [];
	    $canvas.on(Canvas.Events[i], mouseHandler);
    }
};

Canvas.prototype.handleMouse = function(evt)
{
    this.mouseAt = this.translateCoordinates(evt);
    //console.log(evt.type+' @ '+this.mouseAt.asString());
    if (evt.type in this.listners) {
	    var cbs = this.listners[evt.type];
	    for (var i=0; i<cbs.length; i++) {
	        var cb = cbs[i];
	        cb(evt, this);
	    }
    }
};

/** @type {boolean} */ Canvas.prototype.inline = false;
/** @type {!Color} */ Canvas.prototype.lineColor;

Canvas.prototype.startLine = function(p)
{
    //console.log('starting line');
    this.lineColor = new Color(255, 0, 255, 1);
    this.inline = true;
    this.line = [ p ];
};

Canvas.prototype.cancelLine = function()
{
    this.inline = false;
};

Canvas.prototype.finishLine = function(p)
{
    if (this.inline == false) return;
    this.inline = false;
    this.clear();
    return {start: this.line[0], end: p};
};

var cnt = 0;

Canvas.prototype.showLine = function(p)
{
    if (this.inline == false) return;
    //console.log('Showline from '+this.line[0].asString()+' to '+p.asString());
    this.clear();
    var ctx = this.context;
    ctx.strokeStyle = this.lineColor.rgb();
    ctx.beginPath();
    ctx.moveTo(this.line[0].x(), this.line[0].y());
    ctx.lineTo(p.x(), p.y());
    ctx.stroke();
    ctx.closePath();
};


// Local Variables:
// tab-width: 4
// indent-tabs-mode: nil
// End:
