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
    $('#pagetitle').append(page.name.asString('long'));
    this.installHandlers();
    this.changeMode(UI.Mode.Quiet);
}

/** @enum */ 
UI.Mode = {
    Quiet: 0,
    MarkPassage: 1,
    AddRect: 2,
    Selected: 3
};

UI.tools = {};

/** @type {!Canvas} */ UI.prototype.canvas;
/** @type {!Page} */ UI.prototype.page;

/**
 * changeMode
 * change mode of UI to newmode
 *
 * @private
 * @param {!UI.Mode} newmode
 **/
UI.prototype.changeMode = function(newmode)
{
    switch (newmode)
    {
    case UI.Mode.Quiet:
	this.currentTools = UI.tools['main'];
	break;

    case UI.Mode.MarkPassage:
	this.currentTools = UI.tools['marking'];
	break;

    case UI.Mode.Selected:
	this.currentTools = UI.tools['selected'];
	break;

    default:
	alert('bad mode: '+newmode);
	return;
    }
    this.mode = newmode;
    this.showTools();
};

/**
 * showTools
 * show the current tools
 *
 * @private
 **/
UI.prototype.showTools = function()
{
    var $tools = $('#tools ul');
    $tools.empty();
    for (var label in this.currentTools) {
	var tool = this.currentTools[label];
	$tools.append('<li>'+tool.show+': '+tool.prompt+'</li>');
    }
};

UI.prototype.handleClick = function(evt, cnv)
{
    if (this.mode == UI.Mode.AddRect) {
	this.page.addRect(cnv.mouseAt, 50, 50);
    } else if (this.mode == UI.Mode.Quiet) {
	// select the object under point
	if (this.page.selectObjectAt(cnv.mouseAt)) {
	    this.changeMode(UI.Mode.Selected);
	}
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

/**
 * startPassage
 * start marking passage
 *
 * @private
 * @param {!Event} evt
 **/
UI.prototype.startPassage = function(evt)
{
    this.changeMode(UI.Mode.MarkPassage);
    this.page.startPassage();
};

/**
 * finishPassage
 * finish marking passage
 *
 * @private
 * @param {!Event} evt
 **/
UI.prototype.finishPassage = function(evt)
{
    if (this.mode == UI.Mode.MarkPassage) {
	this.changeMode(UI.Mode.Quiet);
	this.page.endPassage('unknown');
    }
};

/**
 * markPassageAs
 * descirbe kind of passage that is selected
 *
 * @private
 * @param {!string} kind
 * @param {!Event} evt
 **/
UI.prototype.markPassageAs = function(kind, evt)
{
    this.changeMode(UI.Mode.Quiet);
    this.page.endPassage(kind);
};

/**
 * create link to source
 * <desc>
 *
 * @private
 * @param {!string} direction
 * @param {!Event} evt
 **/
UI.prototype.startReference = function(direction, evt)
{
};

/**
 * startNote
 * add note
 *
 * @private
 * @param {!string} kind
 * @param {!Event} evt
 **/
UI.prototype.startNote = function(kind, evt)
{
};

/**
 * resetMode
 * reset back to main tools and clear temp canvas
 *
 * @param {!Event=} evt
 **/
UI.prototype.resetMode = function(evt)
{
    this.changeMode(UI.Mode.Quiet);
    this.canvas.scratchpad.clear();
};



UI.prototype.handleKeydown = function(evt)
{
    var code = evt.which;
    var charCode = String.fromCharCode(code);
    //console.log(code+" = "+charCode);

    // first check mode tools
    if (charCode in this.currentTools) {
	this.currentTools[charCode].func.apply(this, evt);
	return;
    }
    var pd = true;
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
	this.changeMode(UI.Mode.AddRect);
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

	case 27:
	    this.resetMode();
	    break;

	default:
	    console.log('Key is '+code);
	    pd = false;
	}
    }
    if (pd) evt.preventDefault();
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

UI.tools['main'] = {
    'M': {show:'m', prompt: 'start marking passage', func: UI.prototype.startPassage}
};

UI.tools['marking'] = {
    'f': {show:'f', prompt: 'finish and mark as unknown', func: UI.prototype.markPassageAs.curry('unknown') },
    'M': {show:'m', prompt: 'finish and mark as Mishna', func: UI.prototype.markPassageAs.curry('mishna') },
    'G': {show:'g', prompt: 'finish and mark as Gemora', func: UI.prototype.markPassageAs.curry('gemora')},
    'T': {show:'t', prompt: 'finish and mark as Tosefot', func: UI.prototype.markPassageAs.curry('tosefot')},
    'R': {show:'r', prompt: 'finish and mark as Rashi', func: UI.prototype.markPassageAs.curry('rashi')}
};

UI.tools['selected'] = {
    'T': {show:'t', prompt: 'create translation', func: UI.prototype.startNote.curry('translation')},
    'R': {show:'r', prompt: 'create link to reference', func: UI.prototype.startReference.curry('toref')},
    'S': {show:'s', prompt: 'create link to source', func: UI.prototype.startReference.curry('fromref')},
    'N': {show:'n', prompt: 'add note', func: UI.prototype.startNote.curry('general')},
    'B': {show:'b', prompt: 'add background note', func: UI.prototype.startNote.curry('background')}
};

// Local Variables:
// tab-width: 4
// indent-tabs-mode: nil
// End:
