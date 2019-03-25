//require_once dirname(__FILE__) . '/DbProvider.php';
//require_once dirname(__FILE__) . '/../PdfCreator/dss/DssParser.php';
//require_once dirname(__FILE__) . '/../PdfCreator/CPdfCreator.php';

function CResponder() {
}
CResponder.prototype = {
	
	/** @property bool _timeWaitLoaded true когда время ожидания файла загружено из базы данных */
	
	
	PRINT_FILES_WAIT : 'print_files_wait',
	PRINT_FILES_DATA : 'print_files_data',
	
    process : function() {
		var $action;
		$action = isset($_POST, 'action') ? $_POST['action'] : null;
		switch ($action) {
			
			case 'getUserFile':
				this.result = this.getUserFile();
				break;
			case 'getPrintPermission':
					this.result = this.getPrintPermission();
					break;
			case 'getViewData':
					this.result = this.getViewData();
					break;
			case 'getPdf':
					this.result = this.getPdf();
					break;
			}
	},
	getUserFile : function() {
		var $uid, $id, $fileInfo, $path, $p, $result, $line, $pdfCreator, $c, phpjslocvar_0;
		$uid = isset($_POST, "uid") ? intval($_POST["uid"]) : 0;
		if (!$uid) {
			$uid = isset($_SESSION, 'online_user', 'id') ? $_SESSION['online_user']['id'] : 0;
		}
		$id = isset($_POST, 'id') ? intval($_POST['id']) : 0;
		if ($uid && $id) {
			$fileInfo = DbProvider.getFileInfo($id);
			if ($fileInfo) {
				$path = $fileInfo.path;
				if (file_exists($path)) {
					$p = new DssParser();
					$p.parseData($path);
					$result = [];
					for (phpjslocvar_0 in $p.lines) { $line = $p.lines[phpjslocvar_0];
						$result.push($line.startX);
						$result.push($line.startY);
						$result.push($line.endX);
						$result.push($line.endY);
						$result.push($line.color);
					}
					$pdfCreator = new CPdfCreator();
					$c = $pdfCreator.getQuantityPages($id);
					$result.push($c);
					return $result;
				} else {
					return this._error('File ' + $path + ' not found');
				}
			}
			return this._error('File ' + $path + ' not belong authenticated user');
		}
		return this._error('Bad request');
	},

	getPrintPermission : function() {
			var $uid, $fileId, $extUserInfo, $props, $date, $waitProc, $printFilesWait, $t, $printFilesData, $fileName, $need, $info, $k, $i, $pdf;
			$uid = isset($_SESSION, 'online_user', 'id') ? $_SESSION['online_user']['id'] : 0;
			$fileId	= isset($_POST, 'fileId')  ? intval($_POST['fileId']) : 0;
			if (!$uid) {			
				var ro = {'logout' : 1};
				return ro;
			}
			$extUserInfo = DbProvider.getUserInfo($uid);
			
			if ($extUserInfo['is_active'] == 0) {
				var ro = {'need_act':1};
				return ro;
			}
			
			$props = DbProvider.getPrintProps( isset($_POST, "locale") ? $_POST["locale"] : '');
			$props = array_merge($extUserInfo, $props);
			
			$date = date('d.m.Y H:i:s');
			$props['date'] = $date;
			
			$waitProc = '';
			if ($fileId && $props['balance'] == 0 && $props['is_active'] == 1) {
				throw new Error("Not wait!\n");
				$printFilesWait = DbProvider.waitFileSession(this.PRINT_FILES_WAIT);
				if ( count($printFilesWait) == 0) {
					DbProvider.waitFileSession(this.PRINT_FILES_WAIT, $fileId, time());
					$printFilesWait = DbProvider.waitFileSession(this.PRINT_FILES_WAIT);
					DbProvider.waitFileSession(this.PRINT_FILES_DATA, $fileId, DbProvider.getFileNameById($fileId));
					$props['dbg'] = 'reinit time';
					$props['timeWait'] = this.getFileTime($fileId, $printFilesWait);
				} else {
					$t = this.getFileTime($fileId, $printFilesWait, $printFilesData, $fileName, $waitProc);
					$props['dbg'] =  $printFilesWait;
					$props['waitProc'] = $waitProc;
					$props['timeWait'] = $t;
					$props['waitFile'] =  ($fileName ? $fileName : DbProvider.waitFileSession(this.PRINT_FILES_DATA, $fileId));
					$props['waitFileId'] = $fileId;
				}
			} else if ($props['balance'] > 0 && $props['is_active'] != 1) {
				throw new Error ("Not wait 2!\n");
				DbProvider.waitFileSession(this.PRINT_FILES_WAIT, null, null, []);
				$props['dbg'] = 'balance not zero === reset file session';
			}
			$need = ['dbg', 'balance', 'banned', 'is_active', 'oneListPrice', 'listsPerCoin', 'timeWait', 'waitFile', 'waitFileId'];
			$info = {};
			for ($k in $props) { $i = $props[$k];
				if (in_array($k, $need)) {
					$info[$k] = $i;
				}
			}
			$info['view'] = isset($_SESSION, "CPdfCreator","FILE_DATA") ? $_SESSION[CPdfCreator.FILE_DATA] : 'TODO';
			/*if (isset($_SESSION,CPdfCreator.FILE_DATA)) {
				console.log('getFromSession');
				$info['view'] = $_SESSION[CPdfCreator.FILE_DATA];
			} else {*/
				$pdf = new CPdfCreator();
				$info['view'] = $pdf.getFilePreview($fileId);
			//}
			return $info;
	},
	/**
	 * @description JSON die
	 * @param array || string $error
	*/
	getViewData : function() {
			var $uid, $fileId, $orientation, $format, $validOrientations, $validFormats, $pdf, $result, $validFormats;
			$uid = isset($_SESSION, 'online_user', 'id') ? $_SESSION['online_user']['id'] : 0;
			$fileId	= isset($_POST, 'fileId')  ? intval($_POST['fileId']) : 0;
			$orientation = isset($_POST, 'o')  ? $_POST['o'] : null;
			$format      = isset($_POST, 'f')  ? $_POST['f'] : null;
			
			$validOrientations = {};
			$validOrientations[PrintJob.PORTRAIT] = 1;
			$validOrientations[PrintJob.LANDSCAPE] = 1;
			
			$validFormats = PrintJob.getAllowFormats();
			if ($fileId && isset($validOrientations,$orientation) && isset($validFormats, $format) ) {
				$pdf = new CPdfCreator();
				$result = $pdf.getQuantityPages($fileId);
				if (isset($_SESSION, CPdfCreator.FILE_DATA)) {
					return $_SESSION[CPdfCreator.FILE_DATA];
				} else {
					//file_put_contents(__DIR__ + '/err.log', 'A');
					console.log( $_SESSION );
					switch($result) {
						case -1:
						return this._error('Не удалось обработать файл');
						case -2:
						return this._error('id файла не определено');
						case -3:
						return this._error('Путь к файлу  не найден');
						case -4:
						return this._error('Видимо, что-то случилось...');
					}
				}
			} else {
				if (!isset($validOrientations,$orientation)) {
					return this._error('Invalid orientation');
				}
				if (!isset($validFormats, $format)) {
					return this._error('Invalid format');
				}
			}
	},
	/**
	 * @description JSON die
	 * @param array || string $error
	*/
	    getPdf : function() {
			var $fileId, $pdf;
			$fileId = isset($_POST, 'fileId') ? intval($_POST['fileId']) : 0;
			if ($fileId) {
				$pdf = new CPdfCreator();
				return $pdf.getFile($fileId, this);
				
			}
			throw new Error("File Id not defined");
			
		},
	/**
	 * @description JSON die
	 * @param array || string $error
	*/
    _error : function($error) {
		var $s;
		$error = $error ? $error : this._badRequest;
		return {'error' : $error};
		/*$s = json_encode( {'error' : $error} );
		file_put_contents($_POST['tempFolder'] + '/out.json', $s );
		sleep(1);
		echo 'rcsexit';
		die;*/
	},
	/**
	 * @description Получить период ожидания из базы или оставить свое по умолчанию
	*/
	    _initTimeWait : function() {
        var $timeWait;
        if (this._timeWaitLoaded) {
            return;
        }
        $timeWait = DbProvider.value("SELECT value FROM config WHERE name='timeWait'");
        this._timeWait = $timeWait   ? $timeWait : this._timeWait;
        this._timeWaitLoaded = true;
},
	/**
	 * @description Получить остаток времени ожидания  для файла
	 * @param int $fileId            - Идентификатор файла
	 * @param array &$printFilesWait - данные об ожидаемом файле, сколько еще ждать
	 * @param array &$printFilesData - данные об ожидаемом файле 
	 * @param string &$fileName      - имя файла
	 * @param string &$waitProc      - 1 если надо еще ждать, 0  - если не надо
	*/
	    getFileTime : function($fileId, $printFilesWait, $printFilesData, $fileName, $waitProc) {
        var $time, $savedFileId, $t, $diff, $timeWait;
        date_default_timezone_set('Europe/Moscow');
        this._initTimeWait();
        $printFilesWait = $printFilesWait ? $printFilesWait : DbProvider.waitFileSession(this.PRINT_FILES_WAIT);
        $time = null;
        for ($savedFileId in $printFilesWait) { $t = $printFilesWait[$savedFileId];
            $time = $t;
            break;
        }
        $diff = time() - intval($time);
        $timeWait = this._timeWait;
        $t = $timeWait - $diff;
        $fileName = '';
        $waitProc = 0;
        if ($t <= 0) {
            $t = 0;
            
            } else {
            $waitProc = 1;
            if ($savedFileId != $fileId) {
                $fileName = DbProvider.getFileNameById($fileId);
                //TODO заменить на один запрос

                $printFilesData = DbProvider.waitFileSession(this.PRINT_FILES_DATA, null, null, {$fileId : $fileName});
                $printFilesWait = DbProvider.waitFileSession(this.PRINT_FILES_WAIT, null, null, {$fileId : $time});
            }
        }
        return $t;
},
	
	   
	/**
	 * @param int $uid
	*/
	_getWaitFile : function($uid) {
        var $k, $r, $time, $fileId, $id, $t, $diff, $timeWait, $fileName, $props, $balance;
        this._initTimeWait();
        $k = {
            'timeWait' : 0
            };
        $r = DbProvider.waitFileSession();
        if (isset($r, "this", "PRINT_FILES_DATA") && isset($r, "this", "PRINT_FILES_WAIT") && is_array($r[this.PRINT_FILES_WAIT]) && is_array($r[this.PRINT_FILES_DATA])) {
            $time = null;
            $fileId = null;
            for ($id in $r[self.PRINT_FILES_WAIT]) { $t = $r[self.PRINT_FILES_WAIT][$id];
                $time = $t;
                $fileId = $id;
            }
            if ($time !== null && $fileId !== null) {
                $diff = time() - intval($time);
                $timeWait = this._timeWait;
                $t = $timeWait - $diff;
                $fileName = isset($r, "this", "PRINT_FILES_DATA", $fileId) ? $r[this.PRINT_FILES_DATA][$fileId] : '';
                
                if ($t <= 0) {
                    $t = 0;
                    }// else {

                $props = DbProvider.getPrintProps('ru');
                $balance = DbProvider.value("SELECT balance FROM users WHERE id = {$uid}");
                $k = {
                    'timeWait'   : $t,
                    'fileName'   : $fileName,
                    'waitFileId' : $fileId,
                    'balance'    : $balance,
                    'listsPerCoin' : $props['listsPerCoin']
                    };
                //}

                } else {
                $k['empty'] = 1;
            }
            
        }
        
        return $k;
}

};
