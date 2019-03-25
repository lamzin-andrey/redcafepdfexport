function o($var, $key) {
	$key = String($key);
        if (is_array($var)) {
			$key = Number($key);
			//console.log('Ye, it array, key = ');
			//console.log($key);
			//window.issetdbg = 1;
            var res = isset($var, $key) ? $var[$key] : null;
            //window.issetdbg = 0;
            return res;
        }
        if (is_object($var)) {
            return isset($var, $key) ? $var[$key] : null;
        }
        return isset($var) ? $var : null;
}
function Cmdline2HttpRequestAdapter($argc, $argv) {
	//console.log($argv);
	this.r = {};
		var $tempFolder, $s, $width, $height, $m, __DIR__;
		$_SERVER['DOCUMENT_ROOT'] = __DIR__ = Qt.appDir() + '/php';
		$tempFolder = '';
		if (o($argv, 9)) {
			$s = o($argv, 9);
			$s = str_replace('\\', '/', $s);
			$tempFolder = $s;
		}
		$_POST['tempFolder'] = $tempFolder;
		$_POST['targetDir']  = isset($argv, "10") ? $argv[10] : $tempFolder;
		
		$_SESSION['online_user'] = [];
		$_SESSION['online_user']['id'] = 1;
		$_POST['v'] = '2';
		$_POST['xhr'] = '1';
		if (o($argv, 1) == 'getPdf' && o($argv, 2) && file_exists(o($argv, 2) ) )  {
			/**
			 * Для getPdf параметры командной строки
			 * 1 getPdf 
			 * 2 путь_к_dss 
			 * 3 страницы, ALL_or_1,2,3
			 * 4 Отключить печать сетки 1_или_0
			 * 5 формат в виде AN или plot
			 * 6 ориентация portrait landscape
			 * 7 mmW в случае формат == 'plot' ширина печати в мм
			 * 8 mmH в случае формат == 'plot' высота (длина) печати в мм
			 * 9 путь к временной папке.
			 * 
			 * 11 - установлена ли галка Печатать рамку при печати на плоттере
			*/
			
			$_POST['action'] = 'getPdf';
			$_POST['path'] = $argv[2];
			if (isset($argv,"3")) {
				$_POST['p'] = $argv[3];
			}
			if (isset($argv,"4") && $argv[4] == 1) {
				$_POST['gridOff'] = $argv[4];
			}
			$_POST['f'] = isset($argv,"5") ? $argv[5] : 'A4';
			$_POST['o'] = isset($argv,"6") ? $argv[6] : 'portrait';
			$_POST['o'] = ($_POST['o'] == 'landscape' || $_POST['o'] == 'portrait') ? $_POST['o'] : 'portrait';
			$width = isset($argv, "7") ? intval($argv[7]) : 1000;
			$height = isset($argv, "8") ? intval($argv[8]) : 6000;
			$_POST['plotterWidth'] = $width;
			$_POST['plotterHeight'] = $height;
			$m = 2.834666667;
			$_POST['plotterWidthInch'] = $_POST['plotterWidth'] * $m;
			$_POST['plotterHeightInch'] = $_POST['plotterHeight'] * $m;
			
			$_POST['fileId'] = '482104';
			
			$_POST['iPlotFrameOff'] = isset($argv, "11") && $argv[11] == 1 ? true : false;
			
			//include __DIR__ + '/v2/index.php';
			
			var responder  = runV2Index()
			this.result = responder.result;
		}
		if (o($argv, 1) == 'getUserFile' && o($argv, 2) && file_exists(o($argv, 2) ) )  {
			//console.log('found');
			/**
			 * Для getViewData параметры командной строки
			 * 1 getViewData
			 * 2 путь_к_dss 
			 * 3 формат в виде AN или plot
			 * 4 ориентация portrait landscape
			 * 7 mmW в случае формат == 'plot' ширина печати в мм
			 * 8 mmH в случае формат == 'plot' высота (длина) печати в мм
			*/
			$_POST['action'] = 'getUserFile';
			$_POST['path'] = $argv[2];
			$_POST['id'] = '482104';
			
			$width  = isset($argv,5) ? intval($argv[5]) : 1000;
			$height = isset($argv,6) ? intval($argv[6]) : 6000;
			$_POST['plotterWidth'] = $width;
			$_POST['plotterHeight'] = $height;
			$m = 2.834666667;
			$_POST['plotterWidthInch'] = $_POST['plotterWidth'] * $m;
			$_POST['plotterHeightInch'] = $_POST['plotterHeight'] * $m;
			var responder  = runV2Index();
			this.result = responder.result;
		}
		
		if (o($argv, 1) == 'getPrintPermission' && o($argv, 2) && file_exists(o($argv, 2) ) )  {
			$_POST['fileId'] = 1;
			$_POST['action'] = 'getPrintPermission';
			$_POST['f'] = isset($argv,3) ? $argv[3] : 'A4';
			$_POST['o'] = isset($argv,4) ? $argv[4] : 'portrait';
			$_POST['path'] = $argv[2];
			$width  = isset($argv,5) ? intval($argv[5]) : 1000;
			$height = isset($argv,6) ? intval($argv[6]) : 6000;
			$_POST['plotterWidth'] = $width;
			$_POST['plotterHeight'] = $height;
			$m = 2.834666667;
			$_POST['plotterWidthInch'] = $_POST['plotterWidth'] * $m;
			$_POST['plotterHeightInch'] = $_POST['plotterHeight'] * $m;
			var responder  = runV2Index()
			this.result = responder.result;
		}
		
		if (o($argv, 1) == 'getViewData' && o($argv, 2) && file_exists(o($argv, 2) ) )  {
			//10 - установлена ли галка Печатать рамку при печати на плоттере
			
			$_POST['fileId'] = 1;
			$_POST['action'] = 'getViewData';
			$_POST['path'] = $argv[2];
			$_POST['f'] = $argv[3];
			$_POST['o'] = $argv[4];
			$width  = isset($argv,5) ? intval($argv[5]) : 1000;
			$height = isset($argv,6) ? intval($argv[6]) : 6000;
			$_POST['plotterWidth'] = $width;
			$_POST['plotterHeight'] = $height;
			$m = 2.834666667;
			$_POST['plotterWidthInch'] = $_POST['plotterWidth'] * $m;
			$_POST['plotterHeightInch'] = $_POST['plotterHeight'] * $m;
			$_POST['iPlotFrameOff'] = isset($argv, "10") && $argv[10] == 1 ? true : false;
			var responder  = runV2Index()
			this.result = responder.result;
		}
}
Cmdline2HttpRequestAdapter.prototype = {};



