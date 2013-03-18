/**
 * Chooser
 * a chooser
 *
 * @constructor
 * @param {!jQueryObject} $container
 * @param {!string} name
 * @param {Chooser} parent
 **/
function Chooser($container, name, parent)
{
    this.$container = $container;
    this.name = name;
    this.type = Source.Types[name];
    this.parent = parent;
    if (parent) parent.child = this;
    this.child = null;
    this.create();
}

/** @type {Chooser} */ Chooser.selection = null;

/** @type {Chooser} */ Chooser.prototype.parent;

Chooser.prototype.setSelection = function(includeme)
{
    if (includeme == 0) {
        if (this.parent) {
            this.parent.setSelection(1);
            return;
        }
        else
            Chooser.selection = null;
    } else
        Chooser.selection = this;
    $output = $('#selection');
    $output.empty();
    if (Chooser.selection == null) {
        $('#doadd').val('----');
    } else {
        $output.append("<span>"+Chooser.selection.source.asString('long')+"</span>");
        var subtype = this.source.getChildTypeName();
        if (subtype == null) 
            $('#doadd').val('----');
        else
            $('#doadd').val('add a '+subtype);
    }
};

Chooser.prototype.process = function(id)
{
    console.log('processing '+id);
    var me = this;
    if (id == "none") {
        if (this.child) this.child.reset();
        this.setSelection(0);
        return;
    }
    Source.find(id, function(src) {
	    me.source = src;
	    if (me.child) {
            me.child.fill();
        }
        me.setSelection(1);
    });
    if ((this.child)&&(this.child.child)) this.child.child.reset();
};

var uidc=0;

Chooser.prototype.reset = function()
{
    this.$widget.empty();
    this.$widget.append('<option value="none">----</option>');
    if (this.child) this.child.reset();
};

Chooser.prototype.create = function()
{
    var $div = this.$container.append(['<div id="',this.name,'"><span class="label">',this.name,':</span></div>'].join(''));
    $div = $('#'+this.name);
    $div.append('<select id="x'+ (uidc++) +'"></select>');
    this.$widget = $('#'+this.name+' select');
    var me = this;
    this.$widget.change(function(){
	    me.process(me.$widget.children(":selected").val());
    });
    this.$widget.append('<option value="none">----</option>');
    console.log('created '+this.name);
};

Chooser.prototype.fill = function()
{
    this.$widget.empty();
    this.$widget.append('<option value="none">----</option>');
    var me = this;
    var sp = Source.library;
    if (this.parent) sp = this.parent.source;
    sp.getChildren(function(children) {
	    var i;
	    for (i=0; i<children.length; i++) {
	        var x = children[i];
	        me.$widget.append(['<option value="', x._id, '">', x.name, '</option>'].join(''));
	    }
    });
};

var srclist = [    "talmud",     "order",     "tractate",     "chapter",     "page" ];

function start()
{
    var $main = (/** @type {!jQueryObject} */ $('#selector'));
    var c = null;
    for (var idx=0; idx<srclist.length; idx++) {
	    c = new Chooser($main, srclist[idx], c);
	    if (idx == 0) {
            c.fill();
            c.setSelection(0);
        }
    }
    $('#doadd').click(function() {
        var name = '';
        var number = 0;
        var clr = [];
        $('#add input').each(function(idx, elem) {
            var $f = $(elem);
            var fn = $f.attr('name');
            var val = $f.val();
            if (fn == "name") {
                name = val;
                clr.push($f);
            } else if (fn == 'number') {
                number = val;
                clr.push($f);
            }
        });
        if (name == '') {
            alert('need a name');
            return;
        }
        for (var i=0; i<clr.length; i++) clr[i].val('');
        // now create the record
        var s = new Source(Chooser.selection.source, name);
        if (number != 0) s.number = number;
        s.type = Chooser.selection.source.getChildType();
        s.insert(function() { Chooser.selection.child.fill(); });
    });
}

// this is last thing we run
Util.addReadyHook(100, function() {
    start();
});


// Local Variables:
// tab-width: 4
// indent-tabs-mode: nil
// End:
