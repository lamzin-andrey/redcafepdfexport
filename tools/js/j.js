window.QtBrige = {
	/**
	 * {String} callback
	 * {String} stdout
	 * {String} stderr
	*/
	onFinish:function(callback, stdout, stderr) {
		if (window[callback] instanceof Function) {
			var re = new RegExp(Qt.getLineDelimeter(), 'mg');
			var out = stdout.replace(re, '\n'),
				stderr = stderr.replace(re, '\n');
			window[callback](out, stderr);
		}
	}
};

PHP.scandir = function(path) {
	var re = new RegExp(Qt.getLineDelimeter(), 'mg');
	var arr = PHP._scandir(path).split(re), i, b = [];
	for (i = 0; i < arr.length; i++) {
		b.push(arr[i].replace(path + '/', ''));
	}
	return b;
}
PHP.getimagesize = function(path) {
	var a = PHP._getimagesize(path).split(',');
	return a;
}

window.FILE_APPEND = 1;
