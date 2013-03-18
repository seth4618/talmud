/**
 * Annotation
 * a class describing a particular type of shape
 *
 * @constructor
 * @export
 * @param {!string} key
 * @param {!Color=} color
 **/
function Annotation(key, color)
{
    this.name = key;
    if (color == undefined) {
	    if (key in Annotation.Colors) color = Annotation.Colors[key];
	    else color = Annotation.UnknownAnnotationColor;
    }
    this.color = color;
    Annotation.all[key] = this;
};

Annotation.all = {};

/** @type {!string} */ Annotation.prototype.name;
/** @type {!Color} */ Annotation.prototype.color;
/** @type {boolean} */ Annotation.prototype.stroke;
/** @type {boolean} */ Annotation.prototype.fill;

/** @type {!Color} */ Annotation.UnknownAnnotationColor = new Color(50,50,50,.7);

/** @type {Object.<!string,!Color>} */ Annotation.Colors = {
    unknown: new Color(0xFF, 0x99, 0x66, .5),
    mishna: new Color(0, 0xff, 0xff, .5),
    gemora: new Color(0x66, 0x99, 0xff, .5),
    tosefot: new Color(0x99, 0x00, 0xff, .5),
    rashi: new Color(0xCC, 0x66, 0x99, .5)
};

Annotation.find = function(id, cb)
{
    var a;
    if (id in Annotation.all) a = Annotation.all[id];
    else a = new Annotation(id);
    cb(a);
};

/**
 * getKey
 * get a key for this annotation
 *
 * @return {!string}
 **/
Annotation.prototype.getKey = function()
{
    return this.name;
};

/**
 * getColor
 * get the color for rendering this annotation
 *
 * @return {!Color}
 **/
Annotation.prototype.getColor = function()
{
    return this.color;
};



// Local Variables:
// tab-width: 4
// indent-tabs-mode: nil
// End:
