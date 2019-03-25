function DssParser() {
	this.lines = [];
}
DssParser.prototype = {
	parseData:function(file) {
		var s = '[' + Qt.getDssFileData(file) + ']', arr, i, j = 0, obj = {};		
		try {
			arr = JSON.parse(s);
			for (i = 1; i < arr.length; i++) {
				if (j == 0) {
					obj = {};
					obj.startX = arr[i];
					j++;
				} else if (j == 1) {
					obj.startY = arr[i];
					j++;
				} else if (j == 2) {
					obj.endX = arr[i];
					j++;
				} else if (j == 3) {
					obj.endY = arr[i];
					j++;
				} else if (j == 4) {
					obj.color = arr[i];
					j = 0;
					this.lines.push(obj);
				}
				
			}
		}catch(e) {}
	}
}
