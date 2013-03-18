function Cursor(canvas)
{
    this.shown = false;
    this.x = 0;
    this.y = 0;
    this.canvas = canvas;
}
Cursor.prototype.shown;
Cursor.prototype.x;
Cursor.prototype.y;
Cursor.prototype.canvas;

Cursor.prototype.trackMouse = function()
{
    var me = this;
    var onMouseMove = function(evt) {
        var rect = me.canvas.getBoundingClientRect();
        x = evt.clientX - rect.left,
        y = evt.clientY - rect.top
	if (me.shown) me.erase();
	me.set(x, y);
	me.show();
    }
    this.canvas.addEventListener('mousemove', onMouseMove);
};
Cursor.prototype.erase = function()
{
};
Cursor.prototype.set = function(x,y)
{
    this.x = x;
    this.y = y;
};
Cursor.prototype.show = function()
{
    var ctx = this.canvas.getContext("2d");
    var oldcomp = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = "lighter";//"darker";//"lighter";//"xor";//"source-over";
    ctx.fillStyle = (new Color(255,0,0,1)).rgb();
    ctx.beginPath();
    ctx.arc(this.x, this.y, 25, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = oldcomp;
};
