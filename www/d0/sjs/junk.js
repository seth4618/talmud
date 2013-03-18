
    var img=new Image();
    img.onload = function(){
	// now draw it
	context.drawImage(img, offset.x, offset.y, w, h);
	var orange = new Color(255, 165, 0, .2);
	makeRect(context, 300, 100, 50, 50, orange);
	makeNgon(context, 400, 400, t, new Color(255,255,0,.4));
	var me = this;
