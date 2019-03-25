window.DxfCreator = {
	//static private var minX:Number;
	init:function() {
		this.minX = 0;
		this.minY = 0;
		this.maxX = 0;
		this.maxY = 0;
		this.scalar = 1;// 0.03937007874;
	},
	
	//static public function createDxf(data:Object):String
	createDxf:function(data)
	{
	  DxfTemplate.init();
	  var result = new String("");
	  result = DxfTemplate.HEADER;
	  //create image section
	   var plan = "";
		 var i = 0;
		 var lastPoint = {x:0, y:0};
		 DxfCreator.minX = data.lines[0].startX;
		 DxfCreator.minY = data.lines[0].startY;
		 DxfCreator.maxX = data.lines[0].startX;
		 DxfCreator.maxY = data.lines[0].startY;
		 while (i < data.lines.length) {
		  var lineBlock = new String("");
		  lineBlock = DxfCreator.drawPoliline(DxfTemplate.POLYLINE, "253", "0.005", "PLOT", data.lines[i]);
		  plan += lineBlock;
		  
		  if (DxfCreator.maxX < data.lines[i].startX) DxfCreator.maxX = data.lines[i].startX;
		  if (DxfCreator.maxX < data.lines[i].endX) DxfCreator.maxX = data.lines[i].endX;
		  if (DxfCreator.minX > data.lines[i].startX) DxfCreator.minX = data.lines[i].startX;
		  if (DxfCreator.minX > data.lines[i].endX) DxfCreator.minX = data.lines[i].endX;
		  
		  if (DxfCreator.maxY < data.lines[i].startY) DxfCreator.maxY = data.lines[i].startY;
		  if (DxfCreator.maxY < data.lines[i].endY) DxfCreator.maxY = data.lines[i].endY;
		  if (DxfCreator.minY > data.lines[i].startY) DxfCreator.minY = data.lines[i].startY;
		  if (DxfCreator.minY > data.lines[i].endY) DxfCreator.minY = data.lines[i].endY;
		  
			i++;
		 }
		 var s = new String();
		 
		 DxfCreator.minX /= DxfCreator.scalar;
		 DxfCreator.maxX /= DxfCreator.scalar;
		 DxfCreator.maxY /= DxfCreator.scalar;
		 DxfCreator.minY /= DxfCreator.scalar;
		 
		 result = result.replace("#minX",  String(DxfCreator.minX)); //minX
		 result = result.replace( "#maxX", String(DxfCreator.maxX)); //maxX
		 result = result.replace( "#maxY", String(DxfCreator.maxY)); //maxY
		 result = result.replace("#minY",  String(DxfCreator.minY)); //minY
		 //draw grid
		 //horizontal
		 var y = DxfCreator.minY;
		 var x = DxfCreator.minX;
		 var x2 = DxfCreator.maxX;
		 while (true)
		 {
			var lineObject = {startX:x, startY:y, endX:x2, endY:y};
			y += 10* DxfCreator.scalar;
			lineBlock = DxfCreator.drawPoliline(DxfTemplate.POLYLINE, "   250", "0.003", "GRID",lineObject);
			result += lineBlock;
			if (y > DxfCreator.maxY) break;
		 }
		 //vertical
		 y = DxfCreator.minY;
		 x = DxfCreator.minX;
		 var y2 = DxfCreator.maxY;
		 while (true) {
			lineObject = {startX:x, startY:y, endX:x, endY:y2};
			x += 10* DxfCreator.scalar;
			lineBlock = DxfCreator.drawPoliline(DxfTemplate.POLYLINE, "   250", "0.003", "GRID", lineObject);
			result += lineBlock;		 	
			if (x > DxfCreator.maxX) break;
		 }
		 result += plan;
		 result += DxfTemplate.EOF;
		 return result;
	},
	
	//static private function drawPoliline(template:String, aColor:String, thick:String, layerName:String, lineObject:Object):String
	drawPoliline : function(template, aColor, thick, layerName, lineObject)
	{
		  var lineBlock = template;
		  lineBlock = lineBlock.replace("#startX", lineObject.startX*DxfCreator.scalar);
		  lineBlock = lineBlock.replace("#startY", lineObject.startY*DxfCreator.scalar * -1);
		  lineBlock = lineBlock.replace("#endX", lineObject.endX*DxfCreator.scalar);
		  lineBlock = lineBlock.replace("#endY", lineObject.endY*DxfCreator.scalar * -1);
		  while (lineBlock.indexOf("#linecolorsixsign") != -1) lineBlock = lineBlock.replace("#linecolorsixsign", aColor);//colorline
		  lineBlock = lineBlock.replace("#linethick", thick);
		  while (lineBlock.indexOf("$layername") != -1) lineBlock = lineBlock.replace("$layername", layerName);
		  return lineBlock;
	}
	
}
