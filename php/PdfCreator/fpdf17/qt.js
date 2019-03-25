if (navigator.userAgent.toLowerCase().indexOf('firefox') != -1) {
	var PHP = {
		file_exists:function(file) {
			return true;
		},
		file_get_contents:function(file) {
			file = this.__strip_file_path(file);
			var LS = localStorage;
			if (LS && LS.getItem(file)) {
				return LS.getItem(file);
			}
			return '';
		},
		__strip_file_path:function(s) {
			s = s.replace(/^"/, '');
			s = s.replace(/"$/, '');
			return s;
		},
		file_put_contents:function(file, data, append) {
			file = this.__strip_file_path(file);
			var LS = localStorage;
			var writed = data.length;
			if (LS) {
				if (append) {
					var s = PHP.file_get_contents(file);
					if (s) {
						data = s + data;
					}
				}
				LS.setItem(file, data);
				return writed;
			}
			return 0;
		},
		exec:function(cmd, sOnFin, sOnSuccess, sOnFail) {
			if (cmd.indexOf('.bat')  != -1) {
				cmd = PHP.file_get_contents(cmd);
				if (window[sOnSuccess] instanceof Function) {
					if (cmd.indexOf('getUserFile') != -1) {
						window[sOnSuccess](FILE_PREVIEW_DATA);
					}
					if (cmd.indexOf('getPrintPermission') != -1) {
						window[sOnSuccess](FILE_PERMISSION_DATA);
					}
					if (cmd.indexOf('getViewData') != -1) {
						window[sOnSuccess](VIEW_DATA);
					}
					if (cmd.indexOf('getPdf') != -1) {
						console.log('win в помощь');
					}
					console.log(cmd);
				}
			}
			
		}
	};
	var Qt = {
		openFileDialog:function(){
			return 'file.dss';
		},
		appDir:function() {
			return '';
		},
		readFileAsBinaryString:function() {
			return PNG_DATA;
		},
		writefile:function(filename, data) {
			return PHP.file_put_contents(filename, data);
		}
	};
	
	var OS = {
		getTempFolderPath : function() {
			return '/tmp';
		}
	}
}


