window.onload = init;
window.lastSelected = false;
window.Exec = PHP;
function e(i) {return document.getElementById(i);}
function init() {
	gotoOffHelp.onclick = function(){
		var path = Qt.appDir() + '/help/documentation.pdf';
		path = path.replace('/default/', '/');
		OS.ShellExecuteQ('open', path , '', '', true);
	};
	return;
	/*e('ch').onclick=function() {
		var file = Qt.openFileDialog("Select file", Qt.appDir(), "*.dss");
		if(PHP.file_exists(file)) {
			var arr = file.split('/');
			var s = arr[arr.length - 1];
			e('selFN').innerHTML = s;
			e('bPrint').disabled = false;
			window.lastSelected = file;
		} else {
			e('selFN').innerHTML = 'Need select dss file';
			e('bPrint').disabled = true;
		}
	}
	e('bPrint').onclick = function() {
		var ds = '/';
		var iniPath = ' -c ' + Qt.appDir() + '\\bin\\php\\php.ini';
		phpIni();
		var php = getPhpCommand();
		var cmd = php + " " + iniPath + ' ' + Qt.appDir() + ds + 'php' + ds + 'offline.php getPdf ' + 
			window.lastSelected + ' ALL 0 plot portrait 1000 6000';
		//alert(cmd);
		PHP.file_put_contents(Qt.appDir() + ds + 'run.bat', cmd);
		Exec.exec(Qt.appDir() + ds + 'run.bat', 'onFinish', 'onA', 'onB');
	}/**/
}
/*
function onA(s) {
	try {
		var object = JSON.parse(s);
		if (object.pdfPath) {
			onFinish(s, '');
		}
	} catch(e) {}
}
function onB(s) {
	
}
function onFinish(out, err) {
	//alert(out);
	var errD = 'ПОка не работает';
	try {
		var object = JSON.parse(out);
		var viewer = '"C:\\Program Files\\Internet Explorer\\iexplore.exe"';//Qt.appDir() + '/bin/STDU_Viewer/STDUViewerApp.exe'; //LIN 'evince'
		//alert(viewer + ' ' + object.pdfPath);
		//alert("file://localhost//" + object.pdfPath);
		
		var ds = '/', cmd = viewer + ' file://localhost//' + object.pdfPath;
		PHP.file_put_contents(Qt.appDir() + ds + 'run.bat', cmd);
		Exec.exec(Qt.appDir() + ds + 'run.bat', 'F');
	} catch(e) {
		alert(errD);
	}
	if (err) {
		alert(errD + "\n" + err);
	}
}*/

function getPhpCommand() {
	return '"' + Qt.appDir() + '\\bin\\php\\php.exe"';
}

function phpIni() {
	var ds = '\\';
	var c = PHP.file_get_contents(Qt.appDir() + ds + 'bin\\php' + ds + 'php.ini.default');
	var phpDir = Qt.appDir() + '\\bin\\php';
	phpDir = phpDir.replace(/\//g, '\\');
	c = c.replace('extension_dir = "C:\\php-5.6.24-nts-Win32-VC11-x86\\ext"', 'extension_dir = "' + phpDir + '\\ext"');
	PHP.file_put_contents(Qt.appDir() + '/' + 'bin/php' + '/' + 'php.ini', c);
}

function setRadioButtons(setIt) {
	$('input[type=radio]').each(function(i, j){
		if (j.checked) {
			$(j).parent().find('div.radioInner').removeClass('hide');
		} else {
			$(j).parent().find('div.radioInner').addClass('hide');
		}
		
		if (setIt) {
			$(j).change(function(){
					setRadioButtons();
			});
		}
	});
	if (setIt) {
		$('.radioOuter').click(function(){
			var o = this, self;
			o = $(o).parent().find('input[type=radio]');
			if (o && o[0] && o[0].name) {
				self = o = o[0];
				$('input[name=' + o.name +']').each(function(i, j){
					j.checked = false;
				});
				self.checked = true;
				setRadioButtons();
				if ("createEvent" in document) {
					var evt = document.createEvent("HTMLEvents");
					evt.initEvent("change", false, true);
					self.dispatchEvent(evt);
				}
				else {
					self.fireEvent("onchange");
				}
			}
		});
	}
}
setRadioButtons(true);

function cp1251_codes(s) {
	var codes = {
		'а':224,
		'б':225,
		'в':226,
		'г':227,
		'д':228,
		'е':229,
		'ё':184,
		'ж':230,
		'з':231,
		'и':232,
		'й':233,
		'к':234,
		'л':235,
		'м':236,
		'н':237,
		'о':238,
		'п':239,
		'р':240,
		'с':241,
		'т':242,
		'у':243,
		'ф':244,
		'х':245,
		'ц':246,
		'ч':247,
		'ш':248,
		'щ':249,
		'ъ':250,
		'ы':251,
		'ь':252,
		'э':253,
		'ю':254,
		'я':255,
		'А':192,
		'Б':193,
		'В':194,
		'Г':195,
		'Д':196,
		'Е':197,
		'Ё':168,
		'Ж':198,
		'З':199,
		'И':200,
		'Й':201,
		'К':202,
		'Л':203,
		'М':204,
		'Н':205,
		'О':206,
		'П':207,
		'Р':208,
		'С':209,
		'Т':210,
		'У':211,
		'Ф':212,
		'Х':213,
		'Ц':214,
		'Ч':215,
		'Ш':216,
		'Щ':217,
		'Ъ':218,
		'Ы':219,
		'Ь':220,
		'Э':221,
		'Ю':222,
		'Я':223
	};
	var i, data = [];
	for (i = 0; i < s.length; i++) {
		if (codes[s.charAt(i)]) {
			data.push(String(codes[s.charAt(i)]));
		} else {
			data.push(String(s.charCodeAt(i)));
		}
	}
	return 'QDJS_BINARY' + data.join(',') + '/QDJS_BINARY';
}

function F(){}

