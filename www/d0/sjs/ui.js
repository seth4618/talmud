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
    $("body").attr("lang", "en");
    this.keyboard = VKeyboard.loadHebrew("keyboard", "editor");
    this.installHandlers();
    this.clearSelection();
    this.changeMode(UI.Mode.Quiet);
    this.mouseIsDown = false;
}

/** @enum */ 
UI.Mode = {
    Quiet: 0,
    MarkPassage: 1,
    AddRect: 2,
    Selected: 3,
    Dragging: 4,
    ShowNotes: 5,
    HideNotes: 6
};

UI.tools = {};

/** @type {!Canvas} */ UI.prototype.canvas;
/** @type {!Page} */ UI.prototype.page;
/** 
 *  track if mouse is down or not
 * @type {boolean} */ UI.prototype.mouseIsDown;

/**
 * changeMode
 * change mode of UI to newmode
 *
 * @private
 * @param {!UI.Mode} newmode
 **/
UI.prototype.changeMode = function(newmode)
{
    if (newmode == this.mode) return;

    switch (newmode)
    {
    case UI.Mode.Quiet:
	    this.currentTools = UI.tools['main'];
	    break;

    case UI.Mode.ShowNotes:
    case UI.Mode.HideNotes:
        this.currentTools = UI.tools['showhide'];
        break;

    case UI.Mode.MarkPassage:
	    this.currentTools = UI.tools['marking'];
	    break;

    case UI.Mode.Dragging:
    case UI.Mode.Selected:
	    this.currentTools = UI.tools['selected'];
	    break;

    default:
	    alert('bad mode: '+newmode);
	    return;
    }
    this.mode = newmode;
    this.showTools();
    this.showHelp('');
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
        if (('hidden' in tool)&&(tool.hidden)) continue;
	    $tools.append('<li>'+tool.show+': '+tool.prompt+'</li>');
    }
};

UI.prototype.handleClick = function(evt, cnv)
{
    console.log(cnv.mouseAt.asString());
     switch (this.mode) {
    case UI.Mode.AddRect:
	    this.page.addRect(cnv.mouseAt, 50, 50);
        break;

    case UI.Mode.Quiet:
	    // select the object under point
	    if (this.page.selectObjectAt(cnv.mouseAt)) {
	        this.changeMode(UI.Mode.Selected);
	    }
        break;

    case UI.Mode.Selected:
        if (this.page.selectObjectAt(cnv.mouseAt)) {
            this.secondSelection();
        } else {
            this.clearSelection();
	        this.changeMode(UI.Mode.Quiet);
        }
        break;
    }
};

UI.prototype.handleMouseDown = function(evt, cnv)
{
    // track where we clicked in case we need it later
    this.lastDown = cnv.mouseAt.copy();
    this.mouseIsDown = true;
    // see if there is a mode specific action to take
    if (this.mode == UI.Mode.MarkPassage)
	this.page.addPassagePoint(cnv.mouseAt, true);
};

UI.prototype.handleMouseUp = function(evt, cnv)
{
    this.mouseIsDown = false;
    switch (this.mode) {
    case UI.Mode.MarkPassage:
	    this.page.addPassagePoint(cnv.mouseAt, false);
        break;
    case UI.Mode.Dragging:
        this.endDrag(cnv.mouseAt);
        this.changeMode(UI.Mode.Selected);
        break;
    } 
};

UI.prototype.handleMouseMove = function(evt, cnv)
{
    switch (this.mode) {
    case UI.Mode.MarkPassage:
	    this.page.tempShowPassage(cnv.mouseAt);
        break;
    case UI.Mode.Dragging:
        this.doDrag(cnv.mouseAt);
        break;
    case UI.Mode.Quiet:
    case UI.Mode.Selected:
        if (this.mouseIsDown) {
            // mouse is down, see if we should start dragging mode
	        if (this.page.selectObjectAt(this.lastDown)) {            
                this.changeMode(UI.Mode.Dragging);
                this.startDrag(cnv.mouseAt);
            }
        }
        break;
    default:
    }
};

UI.prototype.renderDrag = function()
{
    this.canvas.scratchpad.clear();
    this.dragShape.renderAt(this.canvas.scratchpad, 
                            this.dragShape.x(),
                            this.dragShape.y());
};

UI.prototype.startDrag = function(pt)
{
    var x = this.page.getSelectedShape();
    if (x == null) alert('null start drag');
    this.dragOutline = x;
    this.dragShape = x.container;
    this.dragInitialPosition = new Point(this.dragShape.x(), this.dragShape.y());
    this.dragOffset = new Point(this.dragShape.x()-this.lastDown.x(),
                                this.dragShape.y()-this.lastDown.y());
    var me = this;
    this.dragInterval = setInterval(function() { me.renderDrag(); }, 50);
    this.doDrag(pt);
};

UI.prototype.doDrag = function(pt)
{
    this.dragShape.x(pt.x()+this.dragOffset.x());
    this.dragShape.y(pt.y()+this.dragOffset.y());
};

UI.prototype.endDrag = function(pt)
{
    this.doDrag(pt);
    clearInterval(this.dragInterval);
    this.dragOutline.finalizeMove(this.dragInitialPosition);
    this.page.render();
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

UI.prototype.clearSelection = function()
{
    this.startSelection = null;
    this.direction = '';
    this.page.clearSelection();
};

/**
 * secondSelection
 * an additional object has been selected while in selection mode
 *
 * @private
 **/
UI.prototype.secondSelection = function()
{
    switch (this.direction) {
    case 'toref':
        this.page.createReference(this.startSelection, this.page.getSelectedShape());
        break;

    case 'fromref':
        this.page.createReference(this.page.getSelectedShape(), this.startSelection);
        break;

    default:
        return;
    }
    this.clearSelection();
    this.changeMode(UI.Mode.Quiet);
};

UI.prototype.deleteIt = function(evt)
{
    this.page.deleteShape(this.page.getSelectedShape());
    this.clearSelection();
    this.changeMode(UI.Mode.Quiet);
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
    this.startSelection = this.page.getSelectedShape();
    this.direction = direction;
    if (direction == 'toref') this.showHelp('Click on reference');
    else this.showHelp('Click on source of this reference');
};

UI.prototype.showHelp = function(msg)
{
    var $helparea = $('#help');
    $helparea.empty();
    $helparea.append('<span>'+msg+'</span>');
};

UI.prototype.showHideMenu = function(which, evt)
{
    var m;
    var p;
    if (which == 'show') {
        m = UI.Mode.ShowNotes;
        p = "SHOW";
    } else if (which == 'hide') {
        m = UI.Mode.HideNotes;
        p = "HIDE";
    } else alert('unknown showhide menu option');
    this.changeMode(m);
    this.showHelp('Pick which kind of notes to '+p+'.');
};

UI.prototype.showHide = function(which, evt)
{
    if (which == 'done') {
        this.changeMode(UI.Mode.Quiet);
        return;
    }
    if (which != 'all') which = Annotation.sfind(which);
    this.page.changeHiddenShown(UI.Mode.ShowNotes == this.mode, which);
    this.changeMode(UI.Mode.Quiet);
    this.page.render();
};

UI.prototype.hideOutline = function(evt)
{
    this.page.getSelectedShape().hide();
    this.clearSelection();
    this.changeMode(UI.Mode.Quiet);
    this.page.render();
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
    this.page.createNoteNearSelected(kind);
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

UI.prototype.beep = function()
{
    var snd = document.getElementById('beep');
    snd.play();
};

UI.prototype.handleKeydown = function(evt)
{
    if (this.enteringText) return;
    var code = evt.which;
    var charCode = String.fromCharCode(code);
    //console.log(code+" = "+charCode);

    // first check mode tools
    if (charCode in this.currentTools) {
	    this.currentTools[charCode].func.apply(this, evt);
	    return;
    } else if ('modal' in this.currentTools) {
        charCode = 0;           // don't do anything else
        this.beep();
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

UI.prototype.showEditor = function()
{
    this.enteringText = true;
    $('#textentry').css("display", "block");
    this.keyboard.showAll();
}

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
    // special handlers
    $('#textentry').draggable();
    var me = this;
    $('#textentry input').click(function(evt) { 
        var btext = $(this).val();
        if (btext == "done") {
            me.keyboard.hide();
            me.enteringText = false;
            me.page.finishText($('#textentry textarea').val());
            $('#textentry').css('display', 'none'); 
        } else if (btext == "cancel") {
            me.keyboard.hide();
            me.enteringText = false;
            $('#textentry').css('display', 'none'); 
        } else {
            console.log(btext);
            me.keyboard.init();
            me.keyboard.show();
        }
        
    });
};

UI.tools['main'] = {
    'M': {show:'m', prompt: 'start marking passage', func: UI.prototype.startPassage},
    'S': {show:'s', prompt: 'show hidden notes', func: UI.prototype.showHideMenu.curry('show')},
    'H': {show:'h', prompt: 'hide notes', func: UI.prototype.showHideMenu.curry('hide')}
};

UI.tools['showhide'] = {
    'A': {show:'a', prompt: 'everything', func: UI.prototype.showHide.curry('all') },
    'U': {show:'u', prompt: 'all unknown', func: UI.prototype.showHide.curry('unknown') },
    'M': {show:'m', prompt: 'all Mishna', func: UI.prototype.showHide.curry('mishna') },
    'G': {show:'g', prompt: 'all Gemora', func: UI.prototype.showHide.curry('gemora')},
    'T': {show:'t', prompt: 'all Tosefot', func: UI.prototype.showHide.curry('tosefot')},
    'R': {show:'r', prompt: 'all Rashi', func: UI.prototype.showHide.curry('rashi')},
    'N': {show:'n', prompt: 'all Notes', func: UI.prototype.showHide.curry('translation')},
    'Z': {show:'z', prompt: 'back to main menu', func: UI.prototype.showHide.curry('done')},
    'modal': {hidden: true}
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
    'B': {show:'b', prompt: 'add background note', func: UI.prototype.startNote.curry('background')},
    'D': {show:'d', prompt: 'delete shape (and links)', func: UI.prototype.deleteIt},
    'H': {show:'h', prompt: 'hide note from view (temporarily)', func: UI.prototype.hideOutline}
};

Util.addReadyHook(1000, function() {
    $('#audioresource').append('<audio id="beep" preload="auto"><source src="images/beep.mp3" type=\'audio/mpeg codecs="mp3"\' /><source src="images/beep.wav" type=\'audio/wav\' /></audio>');
});

// Local Variables:
// tab-width: 4
// indent-tabs-mode: nil
// End:
