window.onload = function() {
	
	new SimpleEngine2D("TestCanvas", 44);
	
	var s = new PTextField();
	console.log(s);
	s.bitmap = '0.png';
	s.rotation = -180;
	s.text = 'Hello!';
	console.log(s.toArray());
	console.log('s.bitmap = ' + s.bitmap);
	
	var t = new PTextField();
	t.graphics.moveTo(10, 10);
	console.log(t.toArray());
	console.log('t.bitmap = ' + t.bitmap);
}

