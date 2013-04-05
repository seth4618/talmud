// copyright (c) 2013, Seth Copen Goldstein (talmudproject.com)
//#copyright
//#process: jsc.sh --option "--summary_detail_level 3 --create_name_map_files true  --compilation_level ADVANCED_OPTIMIZATIONS --warning_level VERBOSE"
// --formatting PRETTY_PRINT

/**
 * VKeyboard
 * class to handle virtual keyboards
 *
 * @constructor
 **/
function VKeyboard() {
}


/**
 * Don't know what 'k' is
 * Don't know what 'b' is
 * @typedef {{i:!string, c:!string, n:!string, s:!string, k:!string, b:!string}}
 **/
VKeyboard.Key;

/**
 * keyCode
 * get keycode out of an event
 *
 * @param {Event} evt
 * @return {number}
 **/
VKeyboard.keyCode = function (evt) 
{
    if (!evt) {
        evt = window.event;
    }
    if ($.browser.mozilla) {
        var a = evt.keyCode;
        switch (a) {
        case 59:
            a = 186;
            break;
        case 107:
            a = 187;
            break;
        case 109:
            a = 189;
            break
        }
        return a
    }
    if ($.browser.opera) {
        var a = evt.keyCode;
        switch (a) {
        case 59:
            a = 186;
            break;
        case 61:
            a = 187;
            break;
        case 109:
            a = 189;
            break
        }
        return a
    }
    return evt.keyCode
};

VKeyboard.isCtrl = function (evt) 
{
    if (!evt) {
        evt = window.event;
    }
    return evt.ctrlKey
};

VKeyboard.isAlt = function (evt) 
{
    if (!evt) {
        evt = window.event;
    }
    return evt.altKey
};

VKeyboard.isShift = function (evt) 
{
    if (!evt) {
        evt = window.event
    }
    return evt.shiftKey
};

VKeyboard.insertAtCaret = function (c, d) 
{
    var f = VKeyboard.getSelectionStart(c);
    var b = VKeyboard.getSelectionEnd(c);
    var a = c.value.length;
    c.value = c.value.substring(0, f) + d + c.value.substring(b, a);
    VKeyboard.setCaretPosition(c, f + d.length, 0)
};

VKeyboard.deleteAtCaret = function (d, c, g) 
{
    var h = VKeyboard.getSelectionStart(d);
    var b = VKeyboard.getSelectionEnd(d);
    var a = d.value.length;
    if (c > h) {
        c = h
    }
    if (b + g > a) {
        g = a - b
    }
    var f = d.value.substring(h - c, b + g);
    d.value = d.value.substring(0, h - c) + d.value.substring(b + g);
    VKeyboard.setCaretPosition(d, h - c, 0);
    return f
};

VKeyboard.getSelectionStart = function (d) 
{
    d.focus();
    if (d.selectionStart !== undefined) {
        return d.selectionStart
    } else {
        if (document.selection) {
            var b = document.selection.createRange();
            if (b == null) {
                return 0
            }
            var a = d.createTextRange();
            var c = a.duplicate();
            a.moveToBookmark(b.getBookmark());
            c.setEndPoint("EndToStart", a);
            return c.text.length
        }
    }
    return 0
};

VKeyboard.getSelectionEnd = function (d) 
{
    d.focus();
    if (d.selectionEnd !== undefined) {
        return d.selectionEnd
    } else {
        if (document.selection) {
            var b = document.selection.createRange();
            if (b == null) {
                return 0
            }
            var a = d.createTextRange();
            var c = a.duplicate();
            a.moveToBookmark(b.getBookmark());
            c.setEndPoint("EndToStart", a);
            return c.text.length + b.text.length
        }
    }
    return d.value.length
};

VKeyboard.setCaretPosition = function (d, f, c) 
{
    var a = d.value.length;
    if (f > a) {
        f = a
    }
    if (f + c > a) {
        c = a - c
    }
    d.focus();
    if (d.setSelectionRange) {
        d.setSelectionRange(f, f + c)
    } else {
        if (d.createTextRange) {
            var b = d.createTextRange();
            b.collapse(true);
            b.moveEnd("character", f + c);
            b.moveStart("character", f);
            b.select()
        }
    }
    d.focus()
};

VKeyboard.selectAll = function (a) 
{
    VKeyboard.setCaretPosition(a, 0, a.value.length)
};

/**
 * VKeyboard.layout
 * a layout instance
 *
 * @constructor
 **/
VKeyboard.layout = function () {
    this.keys = [];
    this.deadkeys = [];
    this.dir = "ltr";
    this.name = "US";
    this.lang = "en"
};
/** @type {!Array.<!VKeyboard.Key>} */ VKeyboard.layout.prototype.keys;
/** @type {!Array.<!VKeyboard.Key>} */ VKeyboard.layout.prototype.deadkeys;
/** @type {!string} */ VKeyboard.layout.prototype.dir;
/** @type {!string} */ VKeyboard.layout.prototype.name;
/** @type {!string} */ VKeyboard.layout.prototype.lang;

VKeyboard.layout.prototype.loadDefault = function () 
{
    this.keys = [
	{            i: "k0",            c: "0",            n: "`",            s: "~"        }, 
	{            i: "k1",            c: "0",            n: "1",            s: "!"        }, 
	{            i: "k2",            c: "0",            n: "2",            s: "@"        }, 
	{            i: "k3",            c: "0",            n: "3",            s: "#"        }, 
	{            i: "k4",            c: "0",            n: "4",            s: "$"        }, 
	{            i: "k5",            c: "0",            n: "5",            s: "%"        }, 
	{            i: "k6",            c: "0",            n: "6",            s: "^"        }, 
	{            i: "k7",            c: "0",            n: "7",            s: "&"        }, 
	{            i: "k8",            c: "0",            n: "8",            s: "*"        }, 
	{            i: "k9",            c: "0",            n: "9",            s: "("        }, 
	{            i: "k10",            c: "0",            n: "0",            s: ")"        }, 
	{            i: "k11",            c: "0",            n: "-",            s: "_"        }, 
	{            i: "k12",            c: "0",            n: "=",            s: "+"        }, 
	{            i: "k13",            c: "1",            n: "q",            s: "Q"        }, 
	{            i: "k14",            c: "1",            n: "w",            s: "W"        }, 
	{            i: "k15",            c: "1",            n: "e",            s: "E"        }, 
	{            i: "k16",            c: "1",            n: "r",            s: "R"        }, 
	{            i: "k17",            c: "1",            n: "t",            s: "T"        }, 
	{            i: "k18",            c: "1",            n: "y",            s: "Y"        }, 
	{            i: "k19",            c: "1",            n: "u",            s: "U"        }, 
	{            i: "k20",            c: "1",            n: "i",            s: "I"        }, 
	{            i: "k21",            c: "1",            n: "o",            s: "O"        }, 
	{            i: "k22",            c: "1",            n: "p",            s: "P"        }, 
	{            i: "k23",            c: "0",            n: "[",            s: "{"        }, 
	{            i: "k24",            c: "0",            n: "]",            s: "}"        }, 
	{            i: "k25",            c: "0",            n: "\\",            s: "|"        }, 
	{            i: "k26",            c: "1",            n: "a",            s: "A"        }, 
	{            i: "k27",            c: "1",            n: "s",            s: "S"        }, 
	{            i: "k28",            c: "1",            n: "d",            s: "D"        }, 
	{            i: "k29",            c: "1",            n: "f",            s: "F"        }, 
	{            i: "k30",            c: "1",            n: "g",            s: "G"        }, 
	{            i: "k31",            c: "1",            n: "h",            s: "H"        }, 
	{            i: "k32",            c: "1",            n: "j",            s: "J"        }, 
	{            i: "k33",            c: "1",            n: "k",            s: "K"        }, 
	{            i: "k34",            c: "1",            n: "l",            s: "L"        }, 
	{            i: "k35",            c: "0",            n: ";",            s: ":"        }, 
	{            i: "k36",            c: "0",            n: "'",            s: '"'        }, 
	{            i: "k37",            c: "1",            n: "z",            s: "Z"        }, 
	{            i: "k38",            c: "1",            n: "x",            s: "X"        }, 
	{            i: "k39",            c: "1",            n: "c",            s: "C"        }, 
	{            i: "k40",            c: "1",            n: "v",            s: "V"        }, 
	{            i: "k41",            c: "1",            n: "b",            s: "B"        }, 
	{            i: "k42",            c: "1",            n: "n",            s: "N"        }, 
	{            i: "k43",            c: "1",            n: "m",            s: "M"        }, 
	{            i: "k44",            c: "0",            n: "<",            s: "&lt;"        }, 
	{            i: "k45",            c: "0",            n: ">",            s: "&gt;"        }, 
	{            i: "k46",            c: "0",            n: "/",            s: "?"        }, 
	{            i: "k47",            c: "0",            n: "\\",            s: "|"        }
    ];
    this.dir = "ltr";
    this.name = "US";
    this.lang = "en"
};

VKeyboard.layout.prototype.load = function (a) 
{
    this.keys = a.keys;
    this.deadkeys = a.deadkeys;
    this.dir = a.dir;
    this.name = a.name;
    this.lang = a.lang ? a.lang : "en"
};

/**
 * Event keycodes that I care about.  Place in array is crucial
 *
 * @type {Array.<number>}
 **/
VKeyboard.layout.keyCodes = [192, 49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 189, 187, 81, 87, 69, 82, 84, 89, 85, 73, 79, 80, 219, 221, 220, 65, 83, 68, 70, 71, 72, 74, 75, 76, 186, 222, 90, 88, 67, 86, 66, 78, 77, 188, 190, 191, 220];

/**
 * getKeyCode
 * get the keycode for this layout
 *
 * @param {number} b	only 0 is used now
 * @param {!string} e	label of key
 * @return {!string}
 **/
VKeyboard.layout.prototype.getKeyCode = function (b, e) {
    var a = this.keys.length;
    for (var c = 0; c < a; c++) {
        if (this.keys[c].i == e) {
            return b == 1 ? (this.keys[c].s ? this.keys[c].s : "") : (this.keys[c].n ? this.keys[c].n : "")
        }
    }
    return "0";
};

/**
 * getKeyId
 * get keyid (i.e., index into KeyCode array) for this keycode
 *
 * @param {number} b
 * @return {number}
 **/
VKeyboard.layout.getKeyId = function (b) 
{
    for (var a = 0; a < 48; a++) {
        if (VKeyboard.layout.keyCodes[a] == b) {
            return a;
        }
    }
    return -1
};

VKeyboard.layout.parser = {
    getKey: function (c, d) {
        var a = c.length;
        for (var b = 0; b < a; b++) {
            if (c[b].i == d) {
                return c[b]
            }
        }
        return null
    },
    /**
     * isDeadkey
     * check to see of key is useful in the layout
     *
     * @param {!Array.<!VKeyboard.Key>} b
     * @param {!string} d
     * @return {boolean}
     **/
    isDeadkey: function (b, d) {
        if (!b) {
            return false
        }
        var a = b.length;
        for (var c = 0; c < a; c++) {
            if (b[c].k == d) {
                return true
            }
        }
        return false
    },
    getMappedValue: function (b, e, d) {
        if (!b) {
            return ""
        }
        var a = b.length;
        for (var c = 0; c < a; c++) {
            if (b[c].k == d && b[c].b == e) {
                return b[c].c
            }
        }
        return ""
    },
    getState: function (d, f, a, b, e) {
        var c = "n";
        if (!f && !a && d) {
            c = "n"
        } else {
            if (!f && a && !d) {
                c = "s"
            } else {
                if (!f && a && d) {
                    c = "s"
                } else {
                    if (f && !a && !d) {
                        c = "n"
                    } else {
                        if (f && !a && d) {
                            c = "t"
                        } else {
                            if (f && a && !d) {
                                c = "s"
                            } else {
                                if (f && a && d) {
                                    c = "f"
                                }
                            }
                        }
                    }
                }
            }
        } if ((c == "n" || c == "s") && b) {
            if (e == "1") {
                if (c == "n") {
                    c = "s"
                } else {
                    c = "n"
                }
            }
            if (e == "SGCap") {
                if (c == "n") {
                    c = "y"
                } else {
                    if (c == "s") {
                        c = "z"
                    }
                }
            }
        }
        return c
    }
};

/**
 * VTextArea
 * setup a textbox and keyboard
 *
 * @constructor
 * @param {!string} a	id of keyboard div
 * @param {!string} b	id of textarea div
 **/
function VTextArea(a, b) 
{
    this.keyboardId = a;
    this.textareaId = b;
    this.defaultLayout = new VKeyboard.layout();
    this.defaultLayout.loadDefault();
    this.virtualLayout = new VKeyboard.layout();
    this.virtualLayout.loadDefault();
    this.currentLayout = this.virtualLayout;
    this.shift = false;
    this.caps = false;
    this.alt = false;
    this.ctrl = false;
    this.counter = 0;
    this.interval = 0;
    this.prev = "";
    this.cancelkeypress = false;
    this.customOnBackspace = function (e) {};
    this.customOnEnter = function () {};
    this.customOnSpace = function () {
        return false
    };
    this.customOnKey = function (e) {
        return false
    };
    this.customOnEsc = function () {};
    this.customDrawKeyboard = function (e) {
        return e
    };
    this.textbox = /** @type {!jQueryObject} */ $("#" + b);
    this.nativeTextbox = /** @type {!HTMLElement} */ document.getElementById(b);
    var d = ['<div id="VKeyboard-keyboard">'];
    for (var c = 0; c < 13; c++) {
        d.push('<button id="VKeyboard-k', c, '" class="VKeyboard-key"></button>')
    }
    d.push('<button id="VKeyboard-backspace"><span>Backspc</span></button>');
    d.push('<div class="VKeyboard-clear"></div>');
    d.push('<button id="VKeyboard-tab"><span>Tab</span></button>');
    for (var c = 13; c < 25; c++) {
        d.push('<button id="VKeyboard-k', c, '" class="VKeyboard-key"></button>')
    }
    d.push('<button id="VKeyboard-k25"></button>');
    d.push('<div class="VKeyboard-clear"></div>');
    d.push('<button id="VKeyboard-caps-lock"><span>Caps Lock</span></button>');
    for (var c = 26; c < 37; c++) {
        d.push('<button id="VKeyboard-k', c, '" class="VKeyboard-key"></button>')
    }
    d.push('<button id="VKeyboard-enter" class="VKeyboard-enter"><span>Enter</span></button>');
    d.push('<div class="VKeyboard-clear"></div>');
    d.push('<button id="VKeyboard-left-shift"><span>Shift</span></button>');
    d.push('<button id="VKeyboard-k47" class="VKeyboard-key"></button>');
    for (var c = 37; c < 47; c++) {
        d.push('<button id="VKeyboard-k', c, '" class="VKeyboard-key"></button>')
    }
    d.push('<button id="VKeyboard-right-shift"><span>Shift</span></button>');
    d.push('<div class="VKeyboard-clear"></div>');
    d.push('<button id="VKeyboard-escape" title="Swap keyboard layout"><span>Esc</span></button>');
    d.push('<button id="VKeyboard-left-ctrl"><span>Ctrl</span></button>');
    d.push('<button id="VKeyboard-left-alt"><span>Alt</span></button>');
    d.push('<button id="VKeyboard-space"><span>Space</span></button>');
    d.push('<button id="VKeyboard-right-alt"><span>Alt</span></button>');
    d.push('<button id="VKeyboard-swap" title="Goto English Layout"><span>&rArr;English Keys</span></button>');
    d.push('<div class="VKeyboard-clear"></div>');
    d.push("</div>");
    document.getElementById(a).innerHTML = d.join("");
    this.wireEvents();
    this.drawKeyboard()
}
/** @type {!VKeyboard.layout} */ VTextArea.prototype.defaultLayout;
/** @type {!VKeyboard.layout} */ VTextArea.prototype.virtualLayout;
/** @type {!VKeyboard.layout} */ VTextArea.prototype.currentLayout;
/** @type {boolean} */ VTextArea.prototype.shift;
/** @type {boolean} */ VTextArea.prototype.caps;
/** @type {boolean} */ VTextArea.prototype.alt;
/** @type {boolean} */ VTextArea.prototype.ctrl;
/** @type {number} */ VTextArea.prototype.counter;
/** @type {number} */ VTextArea.prototype.interval;
/** @type {!string} */ VTextArea.prototype.prev;
/** @type {boolean} */ VTextArea.prototype.cancelkeypress;
/** @type {function(*)} */ VTextArea.prototype.customOnBackspace;
/** @type {function()} */ VTextArea.prototype.customOnEnter;
/** @type {function():boolean} */ VTextArea.prototype.customOnSpace;
/** @type {function(*):boolean} */ VTextArea.prototype.customOnKey;
/** @type {function()} */ VTextArea.prototype.customOnEsc;
/** @type {function(!string):!string} */ VTextArea.prototype.customDrawKeyboard;
/** @type {!jQueryObject} */ VTextArea.prototype.textbox;
/** @type {!HTMLElement} */ VTextArea.prototype.nativeTextbox;

VTextArea.prototype.loadDefaultLayout = function (a) {
    this.defaultLayout.load(a);
    this.drawKeyboard()
};
VTextArea.prototype.loadVirtualLayout = function (a) {
    this.virtualLayout.load(a);
    this.drawKeyboard();
    this.textbox.attr("dir", this.attr("dir"))
};

/**
 * switchLayout
 * switch current layout to the specified one (or toggle if none specified)
 *
 * @param {!VKeyboard.layout=} destLayout
 **/
VTextArea.prototype.switchLayout = function (destLayout) 
{
    destLayout = destLayout || ((this.currentLayout === this.defaultLayout) ? this.virtualLayout : this.defaultLayout);
    this.currentLayout = destLayout;
    this.reset();
    if (this.currentLayout == this.virtualLayout) {
	// we just switched to hebrew
	VKeyboard.insertAtCaret(this.nativeTextbox, "\u200F");
	$("#VKeyboard-swap").empty().append("<span>&rArr;English Keys</span>");
	$("#VKeyboard-swap").attr('title', "Goto English Layout");
    } else {
	// we just switched to english
	VKeyboard.insertAtCaret(this.nativeTextbox, "\u200E");
	$("#VKeyboard-swap").empty().append("<span style='direction:rtl'>לפריסת עברית&lArr;</span>");
	$("#VKeyboard-swap").attr('title', "Goto Hebrew Layout");
    }
    this.drawKeyboard();
    this.textbox.attr("dir", this.attr("dir"))
};
VTextArea.prototype.onEsc = function () {
    this.switchLayout();
    this.customOnEsc()
};
VTextArea.prototype.onShift = function () {
    this.shift = !this.shift;
    this.drawKeyboard()
};
VTextArea.prototype.onAlt = function () {
    this.alt = !this.alt;
    this.drawKeyboard()
};
VTextArea.prototype.onCtrl = function () {
    this.ctrl = !this.ctrl;
    this.drawKeyboard()
};
VTextArea.prototype.onCapsLock = function () {
    this.caps = !this.caps;
    this.drawKeyboard()
};
VTextArea.prototype.onBackspace = function () {
    if (this.prev != "") {
        this.prev = "";
        this.shift = false;
        this.drawKeyboard()
    } else {
        var a = VKeyboard.deleteAtCaret(this.nativeTextbox, 1, 0);
        this.customOnBackspace(a)
    }
};
VTextArea.prototype.onEnter = function () {
    VKeyboard.insertAtCaret(this.nativeTextbox, "\u000A");
    this.customOnEnter()
};
VTextArea.prototype.onSpace = function () {
    if (!this.customOnSpace()) {
        VKeyboard.insertAtCaret(this.nativeTextbox, "\u0020")
    }
};

/**
 * attr
 * return description of current keyboard. (direction/language/name)
 *
 * @param {!string} a
 * @return {!string}
 **/
VTextArea.prototype.attr = function (a) {
    if (a == "dir") {
        return this.currentLayout.dir
    } else {
        if (a == "lang") {
            return this.currentLayout.lang
        } else {
            if (a == "name") {
                return this.currentLayout.name
            }
        }
    }
    return ""
};
VTextArea.prototype.reset = function () {
    this.shift = false;
    this.caps = false;
    this.alt = false;
    this.ctrl = false;
    this.counter = 0;
    this.interval = 0;
    this.prev = ""
};
VTextArea.prototype.stopRepeat = function () {
    if (this.interval != 0) {
        clearInterval(this.interval);
        this.counter = 0;
        this.interval = 0
    }
};

/**
 * onKey
 * render key with keyid
 *
 * @param {!string} e
 **/
VTextArea.prototype.onKey = function (e) {
    console.log('onKey:'+e);
    var b = VKeyboard.layout.parser.getKey(this.currentLayout.keys, e);
    if (b) {
        var d = VKeyboard.layout.parser.getState(this.ctrl, this.alt, this.shift, this.caps, b.c ? b.c : "0");
        var c = b[d] ? b[d] : "";
        if (this.prev != "") {
            var a = VKeyboard.layout.parser.getMappedValue(this.currentLayout.deadkeys, c, this.prev);
            if (a != "") {
                VKeyboard.insertAtCaret(this.nativeTextbox, a)
            }
            this.prev = ""
        } else {
            if (VKeyboard.layout.parser.isDeadkey(this.currentLayout.deadkeys, c)) {
                this.prev = c
            } else {
                if (c != "") {
                    if (!this.customOnKey(c)) {
                        VKeyboard.insertAtCaret(this.nativeTextbox, c)
                    }
                }
            }
        }
    }
};
VTextArea.prototype.drawKeyboard = function () {
    if (!this.currentLayout.keys) {
        return
    }
    var d, c, f, e;
    var a = this.currentLayout.keys.length;
    for (var b = 0; b < a; b++) {
        /** @type {!VKeyboard.Key} */ c = this.currentLayout.keys[b];
        if (!$("VKeyboard-" + c.i)) {
            continue
        }
        f = VKeyboard.layout.parser.getState(this.ctrl, this.alt, this.shift, this.caps, c.c ? c.c : "0");
        e = c[f] ? c[f] : "";
        if (this.prev != "") {
            e = VKeyboard.layout.parser.getMappedValue(this.currentLayout.deadkeys, e, this.prev)
        }
        if (!this.shift) {
            e = this.customDrawKeyboard(e);
            if (e == "") {
                e = "&nbsp;"
            }
            d = '<div class="VKeyboard-label-reference">' + this.defaultLayout.getKeyCode(0, c.i) + '</div><div class="VKeyboard-label-natural">' + e + "</div>"
        } else {
            if (e == "") {
                e = "&nbsp;"
            }
            d = '<div class="VKeyboard-label-reference">' + this.defaultLayout.getKeyCode(0, c.i) + '</div><div class="VKeyboard-label-shift">' + e + "</div>"
        }
        document.getElementById("VKeyboard-" + c.i).innerHTML = d
    }
    if (this.ctrl) {
        $("#VKeyboard-left-ctrl").addClass("VKeyboard-recessed");
        $("#VKeyboard-right-ctrl").addClass("VKeyboard-recessed")
    } else {
        $("#VKeyboard-left-ctrl").removeClass("VKeyboard-recessed");
        $("#VKeyboard-right-ctrl").removeClass("VKeyboard-recessed")
    } if (this.alt) {
        $("#VKeyboard-left-alt").addClass("VKeyboard-recessed");
        $("#VKeyboard-right-alt").addClass("VKeyboard-recessed")
    } else {
        $("#VKeyboard-left-alt").removeClass("VKeyboard-recessed");
        $("#VKeyboard-right-alt").removeClass("VKeyboard-recessed")
    } if (this.shift) {
        $("#VKeyboard-left-shift").addClass("VKeyboard-recessed");
        $("#VKeyboard-right-shift").addClass("VKeyboard-recessed")
    } else {
        $("#VKeyboard-left-shift").removeClass("VKeyboard-recessed");
        $("#VKeyboard-right-shift").removeClass("VKeyboard-recessed")
    } if (this.caps) {
        $("#VKeyboard-caps-lock").addClass("VKeyboard-recessed")
    } else {
        $("#VKeyboard-caps-lock").removeClass("VKeyboard-recessed")
    }
};
VTextArea.prototype.wireEvents = function () {
    var a = this;
    $("#VKeyboard-keyboard").delegate("button", "mousedown", function (c) {
        var b = this.id;
	console.log("mousedown: "+b);
        a.interval = setInterval(function () {
            a.counter++;
            if (a.counter > 5) {
                switch (b) {
                    case "VKeyboard-backspace":
                        a.onBackspace();
                        break;
                    default:
                        if (b.search("VKeyboard-k([0-9])|([1-3][0-9])|(4[0-7])") != -1) {
                            a.onKey(b.substr(7));
                            a.shift = false;
                            a.alt = false;
                            a.ctrl = false;
                            a.drawKeyboard()
                        }
                        break
                }
            }
        }, 50)
    });
    $("#VKeyboard-keyboard").delegate("button", "mouseup", function (b) {
        a.stopRepeat()
    });
    $("#VKeyboard-keyboard").delegate("button", "mouseout", function (b) {
        a.stopRepeat()
    });
    $("#VKeyboard-keyboard").delegate("button", "click", function (c) {
        var b = this.id;
	console.log("click: "+b);
        switch (b) {
            case "VKeyboard-left-shift":
            case "VKeyboard-right-shift":
                a.onShift();
                break;
            case "VKeyboard-left-alt":
            case "VKeyboard-right-alt":
                a.onCtrl();
                a.onAlt();
                break;
            case "VKeyboard-left-ctrl":
            case "VKeyboard-right-ctrl":
                a.onAlt();
                a.onCtrl();
                break;
	case "VKeyboard-escape":
            case "VKeyboard-swap":
                a.onEsc();
                break;
            case "VKeyboard-caps-lock":
                a.onCapsLock();
                break;
            case "VKeyboard-backspace":
                a.onBackspace();
                break;
            case "VKeyboard-enter":
                a.onEnter();
                break;
            case "VKeyboard-space":
                a.onSpace();
                break;
            default:
                if (b.search("VKeyboard-k([0-9])|([1-3][0-9])|(4[0-7])") != -1) {
                    a.onKey(b.substr(10));
                    a.shift = false;
                    a.alt = false;
                    a.ctrl = false;
                    a.drawKeyboard()
                }
                break
        }
    });
    a.textbox.bind("keydown", function (d) {
        var c = VKeyboard.keyCode(d);
        if ((c == 65 || c == 67 || c == 86 || c == 88 || c == 89 || c == 90) && (a.ctrl && !a.alt && !a.shift)) {
            return
        }
        if (a.currentLayout == a.defaultLayout && c != 27) {
            return
        }
        switch (c) {
            case 17:
                a.ctrl = false;
                a.onCtrl();
                break;
            case 18:
                a.alt = false;
                a.onAlt();
                break;
            case 16:
                a.shift = false;
                a.onShift();
                break;
            case 27:
                a.onEsc();
                break;
            case 8:
                a.onBackspace();
                d.preventDefault();
                break;
            case 32:
                a.onSpace();
                d.preventDefault();
                break;
            case 10:
                a.onEnter();
                d.preventDefault();
                break;
            default:
                var b = VKeyboard.layout.getKeyId(VKeyboard.keyCode(d));
                if (b != -1) {
                    a.onKey("k" + b);
                    a.drawKeyboard();
                    d.preventDefault();
                    a.cancelkeypress = true
                }
                break
        }
    });
    if ($.browser.opera) {
        a.textbox.bind("keypress", function (b) {
            if (this.cancelkeypress) {
                b.preventDefault();
                a.cancelkeypress = false
            }
        })
    }
    a.textbox.bind("keyup", function (b) {
        switch (VKeyboard.keyCode(b)) {
            case 17:
                a.ctrl = true;
                a.onCtrl();
                break;
            case 18:
                a.alt = true;
                a.onAlt();
                break;
            case 16:
                a.shift = true;
                a.onShift();
                break;
            default:
        }
    });
};

/**
 * init
 * init the keyboard to the virtual one
 *
 **/
VTextArea.prototype.init = function()
{
    this.switchLayout(this.virtualLayout);
};

/**
 * hide
 * hide the keyboard
 *
 **/
VTextArea.prototype.show = function()
{
    $('#'+this.keyboardId).show();
};

/**
 * hide
 * hide the keyboard
 *
 **/
VTextArea.prototype.hide = function()
{
    $('#'+this.keyboardId).hide();
};

/**
 * showAll
 * show the textarea and keyboard (if virt), otherwise just the textarea - and give it focus
 *
 **/
VTextArea.prototype.showAll = function(virt)
{
    this.switchLayout(virt?this.virtualLayout:this.defaultLayout);
    $('#'+this.keyboardId).hide();
    if (virt) {
	$('#'+this.keyboardId).show();
    }
    $('#'+this.textareaId).focus();
};

/**
 * loadHebrew
 * get a hebrew textarea/keyboard going
 *
 * @param {!string} keyboardId
 * @param {!string} textareaId
 * @return {!VTextArea}
 **/
VKeyboard.loadHebrew = function(keyboardId, textareaId)
{
    var keyboard = new VTextArea(keyboardId, textareaId);
    var a = {
	name: "Hebrew",
	dir: "rtl",
	keys: [
	    { i: "k1", c: "SGCap", n: "1", s: "!" }, 
	    { i: "k2", c: "SGCap", n: "2", s: "@" }, 
	    { i: "k3", c: "SGCap", n: "3", s: "#" }, 
	    { i: "k4", c: "SGCap", n: "4", s: "$", t: "\u20aa" }, 
	    { i: "k5", c: "SGCap", n: "5", s: "%" }, 
	    { i: "k6", c: "SGCap", n: "6", s: "^" }, 
	    { i: "k7", c: "SGCap", n: "7", s: "&" }, 
	    { i: "k8", c: "SGCap", n: "8", s: "*" }, 
	    { i: "k9", c: "SGCap", n: "9", s: ")" }, 
	    { i: "k10", c: "SGCap", n: "0", s: "(" }, 
	    { i: "k11", c: "SGCap", n: "-", s: "_", t: "\u05bf" }, 
	    { i: "k12", c: "SGCap", n: "=", s: "+" }, 
	    { i: "k13", c: "1", n: "/", s: "Q" }, 
	    { i: "k14", c: "1", n: "'", s: "W" }, 
	    { i: "k15", c: "1", n: "\u05e7", s: "E", t: "\u20ac" }, 
	    { i: "k16", c: "1", n: "\u05e8", s: "R" }, 
	    { i: "k17", c: "1", n: "\u05d0", s: "T" }, 
	    { i: "k18", c: "1", n: "\u05d8", s: "Y" }, 
	    { i: "k19", c: "1", n: "\u05d5", s: "U", t: "\u05f0" }, 
	    { i: "k20", c: "1", n: "\u05df", s: "I" }, 
	    { i: "k21", c: "1", n: "\u05dd", s: "O" }, 
	    { i: "k22", c: "1", n: "\u05e4", s: "P" }, 
	    { i: "k23", c: "SGCap", n: "]", s: "}", l: "\u200e" }, 
	    { i: "k24", c: "SGCap", n: "[", s: "{", l: "\u200f" }, 
	    { i: "k26", c: "1", n: "\u05e9", s: "A" }, 
	    { i: "k27", c: "1", n: "\u05d3", s: "S" }, 
	    { i: "k28", c: "1", n: "\u05d2", s: "D" }, 
	    { i: "k29", c: "1", n: "\u05db", s: "F" }, 
	    { i: "k30", c: "1", n: "\u05e2", s: "G" }, 
	    { i: "k31", c: "1", n: "\u05d9", s: "H", t: "\u05f2" }, 
	    { i: "k32", c: "1", n: "\u05d7", s: "J", t: "\u05f1" }, 
	    { i: "k33", c: "1", n: "\u05dc", s: "K" }, 
	    { i: "k34", c: "1", n: "\u05da", s: "L" }, 
	    { i: "k35", c: "SGCap", n: "\u05e3", s: ":" }, 
	    { i: "k36", c: "SGCap", n: ",", s: '"' }, 
	    { i: "k0", c: "SGCap", n: ";", s: "~" }, 
	    { i: "k25", c: "SGCap", n: "\\", s: "|" }, 
	    { i: "k37", c: "1", n: "\u05d6", s: "Z" }, 
	    { i: "k38", c: "1", n: "\u05e1", s: "X" }, 
	    { i: "k39", c: "1", n: "\u05d1", s: "C" }, 
	    { i: "k40", c: "1", n: "\u05d4", s: "V" }, 
	    { i: "k41", c: "1", n: "\u05e0", s: "B" }, 
	    { i: "k42", c: "1", n: "\u05de", s: "N" }, 
	    { i: "k43", c: "1", n: "\u05e6", s: "M" }, 
	    { i: "k44", c: "SGCap", n: "\u05ea", s: ">" }, 
	    { i: "k45", c: "SGCap", n: "\u05e5", s: "<" }, 
	    { i: "k46", c: "SGCap", n: ".", s: "?" }, 
	    { i: "k47", c: "0", n: "\\", s: "|" }
	],
	deadkeys: []
    };
    keyboard.loadVirtualLayout(a);
    $("#".textareaId).attr("dir", keyboard.attr("dir"));
    return keyboard;
};

