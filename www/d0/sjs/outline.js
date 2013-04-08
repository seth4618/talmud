/**
 * Outline
 * A general annotation that resides on the page
 *
 * @constructor
 * @param {number=} id
 **/
function Outline(id)
{
    if (id != undefined) this._id = id;
    this.targets = [];
    this.selected = false;
    this.deleted = null;
    this.children = [];
    this.parent = null;
}

/**
 * init
 * A general annotation that resides on the page
 *
 **/
Outline.prototype.init = function(container)
{
    this.container = container;
}

/** @type {!Object.<!DataBaseObject.Key,!Outline>} */ Outline.all = {};
Outline.table = 'shape';

/** @type {boolean} */ Outline.prototype.selected;
/** @type {!Shape} */ Outline.prototype.container;
/** @type {!Array.<!Outline>} */ Outline.prototype.targets;
/** @type {Date} */ Outline.prototype.deleted;
/** @type {!Array.<!Outline>} */ this.children;
/** @type {Outline} */ this.parent;

/**
 * find
 * get Outline by id
 *
 * @param {!DataBaseObject.Key} id
 * @param {function(!Outline)} cb
 **/
Outline.find = function(id, cb)
{
	db.find(Outline, id, cb);
};

/**
 * convertFromDB
 * get source by id (implied get all the way back to root)
 * for this to work properly, root of tree needs to get preloaded
 *
 * @param {Object} recd
 * @param {function(!Outline)} cb
 **/
Outline.convertFromDB = function(recd, cb)
{
    //console.log(recd);
    s = Outline.all[recd._id];
    s.init(Shape.convertFromDB(recd.shape));
    if ('deleted' in recd) {
        s.deleted = recd.deleted;
    };
    if (s.deleted != null) {
        // this shape has been deleted, so we can ignore its targets
        cb(s);
        return;
    }
    if (!('parent' in recd)) {
        recd.parent = null;
    }
    var sync = new Synchronizer(function() {     //console.log("done"); console.log(recd); console.log(s); 
        cb(s); }, 
                                recd.targets.length+1, 
                                "Outlineload");
    for (var i=0; i<recd.targets.length; i++) {
	    if (recd.targets[i] == undefined) {
	        console.log('UNDEFINED TARGET for outline'+recd._id);
	        sync.done(1);
	    } else {
            s.assignTarget(i, recd.targets[i], sync);
	    }
    }
    if (0) {
        for (var i=0; i<recd.children.length; i++) {
	        if (recd.children[i] == undefined) {
	            console.log('UNDEFINED CHILD for outline'+recd._id);
	            sync.done(1);
	        } else {
                s.assignChild(i, recd.children[i], sync);
	        }
        }
    }
    if ('text' in recd) {
	    s.text = recd.text;
	    s.font = recd.font;
    }
    if (('parent' in recd) && (recd.parent != -1) && (recd.parent != null)) {
        if ((typeof recd.parent)=="object") {
            console.log('tried to find object record:'+recd.parent);
            recd.parent = recd.parent._id;
        }
        //console.log('Finding parent: '+recd.parent);
        Outline.find(recd.parent, function(p) {
            s.parent = p;
            p.children.push(s);
            //console.log('parent:'+p._id+' and child:'+s._id);
            sync.done(1);
        });
    } else {
        s.parent = null;
        sync.done(1);
    }
};

Outline.prototype.asString = function()
{
    var result = [ 'Outline:', 
                   (('_id' in this) ? this._id : '?'),
                   ':', 
                   (this.deleted?'DELETED':''),
                   (this.selected?'SELECTED':''),
                   (this.container
                    	? this.container.asString()
	                    : 'undefined-container'), 
                   ' parent:',
                   (this.parent ? this.parent._id : '-'),
                   ' children:',
                   this.children.length 
                 ];
    if (this.children.length > 0) {
        result.push(':');
        for (i=0; i<this.children.length; i++) {
            result.push(this.children[i]._id);
            if (i+1 < this.children.length) result.push(',');
        }
    }
    result.push(' -> ');
    result.push(this.targets.length);
    if (this.targets.length > 0) {
        result.push(':');
        for (i=0; i<this.targets.length; i++) {
            result.push((this.targets[i]._id)?this.targets[i]._id:'?');
            if (i+1 < this.targets.length) result.push(',');
        }
    }
    return result.join('');
};

/**
 * insert
 * insert this one in the db.
 *
 * @param {function(!Outline)} cb
 **/
Outline.prototype.insert = function(cb)
{
    if ('_id' in this) throw new Error('already in db');
    var me = this;
    db.insert(Outline, this, function(err) {
	if (err) throw new Error(err);
	Outline.all[me._id] = me;
	cb(me);
    });
};

/**
 * insert
 * insert this one in the db.
 *
 * @param {function(!Outline)=} cb
 **/
Outline.prototype.updateDB = function(cb)
{
    if (!('_id' in this)) throw new Error('not in db already');
    var me = this;
    db.upsert(Outline, this, function(err) {
	    if (err) throw new Error(err);
        if (cb == undefined) return;
	    cb(me);
    });
};

/**
 * convertToDB
 * convert object to recd for db
 *
 **/
Outline.prototype.convertToDB = function()
{
    var recd = {};
    recd.shape = this.container.convertToDB();
    recd.targets = [];
    for (var i=0; i<this.targets.length; i++) {
        recd.targets.push(this.targets[i]._id);
    }
    if ('text' in this) {
	    recd.text = this.text;
	    recd.font = this.font;
    }
    if (('deleted' in this)&&(this.deleted != null)) {
        recd.onpage = this.onpage;
        recd.deleted = this.deleted;
    }
    if (this.parent != null) {
        recd.parent = this.parent._id;
    } else {
        recd.parent = -1;
    }
    return recd;
};

/**
 * deleteMe
 * remote this shape from a page. mark as deleted in db
 *
 **/
Outline.prototype.deleteMe = function(page)
{
    this.deleted = new Date();
    this.onpage = page._id;
    this.updateDB();
};

Outline.prototype.assignTarget = function(t, id, sync)
{
    var me = this;
    Outline.find(id, function(s) {
        me.targets[t] = s;
        sync.done(1);
    });
};

Outline.prototype.assignChild = function(t, id, sync)
{
    var me = this;
    Outline.find(id, function(s) {
        me.children[t] = s;
        sync.done(1);
    });
};

Outline.prototype.containsQ = function(other)
{
    if (!this.container.containsQ(other.container)) return null;
    // this outline contains other, see if any children also contain it
    for (var i=0; i<this.children.length; i++) {
        var c = this.children[i].containsQ(other);
        if (c) return c;
    }
    return this;

};

Outline.prototype.finalizeMove = function(start)
{
    // update shape
    this.container.finalizeMove();
    // get delta for children
    start = start.minus(new Point(this.container.x(), this.container.y()));
    // now see about any children
    for (var i=0; i<this.children.length; i++) {
        var child = this.children[i];
        var cc = child.container;
        var ccStart = new Point(cc.x(), cc.y());
        cc.x(cc.x()-start.x());
        cc.y(cc.y()-start.y());
        child.finalizeMove(ccStart);
    }
    this.updateDB();
};

Outline.prototype.addChild = function(c)
{
    this.children.push(c);
    this.updateDB();
    c.parent = this;
};

Outline.prototype.addRef = function(ref)
{
    this.targets.push(ref);
    this.updateDB();
};

Outline.prototype.render = function(target)
{
    this.container.render(target);
    var ctx = target.getContext();
    var color = this.container.type.getColor();
    ctx.strokeStyle = color.rgb();
    ctx.fillStyle = color.rgba();
    // now render lines to all references
    var old = ctx.lineWidth;
    ctx.lineWidth = old+2;
    var center = this.container.getCenterPoint();
    for (var i=0; i<this.targets.length; i++) {
        if (this.targets[i].deleted != null) continue;
	    var targetContainer = this.targets[i].container;
        var tc = targetContainer.getCenterPoint();
        var from = this.container.getIntersectionWithPerimeter(center, tc);
        var to = targetContainer.getIntersectionWithPerimeter(center, tc);
        //console.log('line from '+from.asString(1)+' -> '+to.asString(1));
        ctx.beginPath();
        ctx.moveTo(from.x(), from.y());
        ctx.lineTo(to.x(), to.y());
        ctx.closePath();
        ctx.stroke();
    }
    ctx.lineWidth = old;
    if (this.text) this.renderText(target);
};

Outline.prototype.renderSelected = function(target)
{
    this.container.renderSelected(target);
};

Outline.prototype.containsPoint = function(p)
{
    return this.container.containsPoint(p);
};

Outline.prototype.setText = function(text, target, page)
{
    // first set the text and calculate the height
    this.font = {family: "Arial, Helvetica, sans-serif", size: 10, color: "black"};
    var textinfo = this.prepareText(target, text);
    this.text = textinfo.text;
    this.container.height(textinfo.height);
    //console.log('lines='+this.text.length+', h='+textinfo.height);

    // now adjust the position so it doesn't overlap with anything else on the page
    if (page == undefined) return;
    
    var shapes = page.getShapes();
    var len = shapes.length;
    var i;
    var here = this.container;
    var oldy = here.y();
    for (i=0; i<len; i++) {
        var c = shapes[i].container;
        var overlap = c.findOverlapOfBB(here);
        if (overlap == 0) continue;
        // we have some overlap - try moving in y direction if not too harsh
        console.log('overlap between me and '+i+' of '+overlap);
        var up = here.lowerleft().y()-c.upperright().y();
        var down = c.lowerleft().y()-here.upperright().y();
        if (up < down) {
            here.y(here.y()-(up+3));
        } else {
            here.y(here.y()+(down+3));
        }
    }
    // check to see if we succeeded.  If not, restore original y and move only in x direction.
    for (i=0; i<len; i++) {
        var c = shapes[i].container;
        var overlap = c.findOverlapOfBB(here);
        if (overlap == 0) continue;
        // we STILL have some overlap - move in X direction
        here.y(oldy);
        break;
    }
    // see if we were ok
    if (i < len) {
        // we have to move in x direction
        var factor = (here.x() < 0) ? -1 : 1;
        var bad = true;
        while (bad) {
            bad = false;
            for (i=0; i<len; i++) {
                var c = shapes[i].container;
                var overlap = c.findOverlapOfBB(here);
                if (overlap == 0) continue;
                // we STILL have some overlap - move in X direction
                bad = true;
                console.log('X overlap still exists with '+i+' of '+overlap);
                if (factor > 0) {
                    // move to the right
                    here.x(here.x()+(3+c.upperright().x()-here.lowerleft().x()));
                } else {
                    here.x(here.x()-(3+here.upperright().x()-c.lowerleft().x()));
                }
            }
        }
    }
    // ok, we are all good now
};

Outline.LineHeight = 1.5;
Outline.Xborder = 10;
Outline.Yborder = 6;

Outline.prototype.prepareText = function(target, text)
{
    // return this
    var lines = [];

    // see how many lines it takes
    var context = target.getContext();
    context.font = this.font.size+'pt '+this.font.family;
    context.fillStyle = this.font.color;
    var maxWidth = this.container.width()-Outline.Xborder;
    var lineHeight = this.font.size*Outline.LineHeight;
    text = text.replace(/\s+$/g, '');
    text = text.replace(/\s+\n+/gm, '\n');
    var input = text.split('\n');
    for (inline=0; inline<input.length; inline++) {
	var words = input[inline].split(' ');
	var line = '';
	for(var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = context.measureText(testLine);
            var testWidth = metrics.width;
            if(testWidth > maxWidth) {
		lines.push(line);
		line = words[n] + ' ';
            }
            else {
		line = testLine;
            }
	}
	lines.push(line);
	lines.push('');
    }
    lines.pop();
    return {text: lines, height: 3*Outline.Yborder/2+lines.length*lineHeight-(input.length-1)*lineHeight/2};
};

Outline.prototype.renderText = function(target)
{
    var context = target.getContext();
    context.font = this.font.size+'pt '+this.font.family;
    context.fillStyle = this.font.color;
    var text = this.text;
    var lineHeight = this.font.size*Outline.LineHeight;
    var x = this.container.x()+Outline.Xborder/2;
    var y = this.container.y()+Outline.Yborder/2+lineHeight;
    for(var n = 0; n < text.length; n++) {
	if (text[n] == '') y-= lineHeight/2;
        else context.fillText(text[n], x, y);
        y += lineHeight;
    }
    //console.log('container: '+this.container.height()+'   delta='+(y-this.container.y())+' and lh = '+lineHeight);
};

// Local Variables:
// tab-width: 4
// indent-tabs-mode: nil
// End:
