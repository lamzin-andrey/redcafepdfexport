/*'/dss/DssParser.php';
'/dss/PrintManager.php';
'/flashemu/Sprite.php';
'/../v2/DbProvider.php';*/
CPdfCreator.FILE_DATA = 'file_data';
function CPdfCreator() {
	/** @property */
	/** @property количество листов которое можно распечатать на один редкоин */
	/** @property $_price стоимость экспорта выбранных листов в redcoins*/
	/** @property $_balance баланс пользователя в redcoins*/
	/** @property $_isActive активен ли аккаунт пользователя (речь об активации для печати за редкоины, см. например как получается is_active в DbProvider::getUserInfo) */
	/** @property $_listsPerCoin */
	/** @property $_badRequest */
	this.$_badRequest = 'Bad request';
}
CPdfCreator.prototype = {
	
	/**
	 * Подготавливает к печати файл, возвращает количество страниц для печати
	 * @return int -1 - не удалось обрабоать файл, -2 - id файла не определено, -3 - путь к файлу  не найден, -4 - прочие ошибки ))))
	*/
	    getQuantityPages : function($fileId) {
        var $id, $info, $filepath, $sprite, $parser, $o;
        $id = $fileId;
        //это вариант запроса pdf файла для скачивания

        if ($id) {
            //DbProvider::setConnection();

            $info = this._getFileById($id);
            //print_r($_POST);die;

            $filepath = $_POST['path'];//$info->path;

            if ($filepath) {
                $sprite = new Sprite();
                $parser = new DssParser();
                $parser.parseData($filepath);
                $o = PrintManager.preparePrint($parser, $sprite, true, Qt.appDir() + '/php/PdfCreator/test/out/' + $id + '.pdf', $info);
                
                if ($o == false) {
                    return -1;
                }
                $_SESSION[CPdfCreator.FILE_DATA] = $o['view'];
                return isset($o, 'c') ? $o['c'] : -4;
            }
            return -3;
        }
        return -2;
},
	/**
	 * Подготавливает к печати файл, возвращает его данные или false
	 * @return array || bool
	*/
	    getFilePreview : function($fileId) {
        var $id, $info, $filepath, $sprite, $parser, $o;
        $id = $fileId;
        //это вариант запроса pdf файла для скачивания

        if ($id) {
            //DbProvider::setConnection();

            $info = this._getFileById($id);
            $filepath = $info.path;
            if ($filepath) {
                $sprite = new Sprite();
                $parser = new DssParser();
                $parser.parseData($filepath);
                $o = PrintManager.preparePrint($parser, $sprite, true, Qt.appDir() + '/php/PdfCreator/test/out/' + $id + '.pdf', $info);
                if ($o == false) {
                    return false;
                }
                return isset($o, 'view') ? $o['view'] : false;
            }
        }
        return false;
},
	/**
	 * @description deprecated Тестовая функция, удалить
	*/
	    run : function() {
        var $id, $info, $filepath, $sprite, $parser, $o, $pagesNumber, $data;
        $id = isset($_GET, 'id') ? intval($_GET['id']) : 0;
        //это вариант запроса pdf файла для скачивания

        if ($id) {
            
            DbProvider.setConnection();
            $info = this._getFileById($id);
            $filepath = $info.path;
            if ($filepath) {
                $sprite = new Sprite();
                $parser = new DssParser();
                $parser.parseData($filepath);
                $o = PrintManager.preparePrint($parser, $sprite, true, dirname(__FILE__) + '/test/out/' + $_GET['id'] + '.pdf', $info);
                if ($o == false) {
                    throw new Exception('Unable prepare print data');
                }
                $pagesNumber = this._getPagesNumber();
                console.log($pagesNumber);
                throw new Error('Debug');
                this._validatePagesNumber($pagesNumber, $o);
                //проверить, достаточно ли денег для печати выбранных страниц, а потом уже печатать

                this._checkBalance($pagesNumber, $o['c']);
                PrintManager.__print($pagesNumber);
                die('COMPLETE!');
            }
        }
        return $sprite.toArray();
        /*$data = json_encode($sprite.toArray());
        echo $data;
        die;*/
},
	/**
	 * @description 
	 * @param $id file id
	 * @param $cResponder 
	*/
	getFile : function($id, $cResponder) {
        var $uid, $info, $filepath, $sprite, $parser, $stamp, $destfolder, $destfile, $o, $pagesNumber, $quantity, $scheme;
        
        if ($id) {
            $uid = isset($_SESSION, 'online_user', 'id') ? $_SESSION['online_user']['id'] : 0;
            if (!$uid) {
                this._error('Вам надо авторизоваться');
                return;
            }
            $info = this._getFileById($id);
            $filepath = $info.path;
            if ($filepath) {
                $sprite = new Sprite();
                $parser = new DssParser();
                $parser.parseData($filepath);
                
                $stamp = date('Y-m-d-H-i-s');
                //$destfile =  $_SERVER['DOCUMENT_ROOT'] . '/userfiles/newfiles/pdf/' . 'u' . $uid . '_f' . $id . 'd' . $stamp . '.pdf';
                
                $destfolder = isset($_POST, 'targetDir') ? $_POST['targetDir']: $_POST['tempFolder'];
                $destfile =  $destfolder + '/' + 'd' + $stamp + '.pdf';
                $o = PrintManager.preparePrint($parser, $sprite, !(isset($_POST, 'gridOff')), $destfile, $info);
                if ($o == false) {
                    this._error('Не могу подготовить данные для печати');
                }
                $pagesNumber = this._getPagesNumber($uid, $o['c']);
                
                
                //нет ошибки, печатаем столько выбранных, сколько их можно распечатать

                if (isset($pagesNumber,"0") && $pagesNumber[0] == 'ALL') {
                    $pagesNumber = this._getListsByOneRedcoin($o['c']);
                    } else {
                    $pagesNumber = this._getSelectedListsByOneRedcoin($pagesNumber);
                }
                /*}*/
                PrintManager.__print($pagesNumber);
                
                if (file_exists($destfile)) {
                    $info = {};
                    $quantity = (isset($pagesNumber,'0') && $pagesNumber[0]) == 'ALL' ? $o['c'] : count($pagesNumber);
                    
                    if (!isset($info, 'error')) {
                        $scheme = 'http://';//($_SERVER['HTTP_HOST'] == 'my.redcafestore.com' ? 'https://' : 'http://');
                        
                        //$info['url'] = $scheme . $_SERVER['HTTP_HOST'] . str_replace($_SERVER['DOCUMENT_ROOT'], '', $destfile);
                        
                        $info['id'] = $id;
                        $info['t'] = $stamp;
                        $info['pdfPath'] = str_replace('\\', '/', $destfile);
                    }
                    //echo json_encode($info);

                    //file_put_contents($_POST['tempFolder'] + '/out.json', json_encode($info));
                    return $info;
                    //sleep(1);


                    //header('Content-Type: application/pdf');

                    //header('Content-Disposition: attachment; filename="'. basename($destfile) .'"');

                    //readfile($destfile);

                    } else {
                    this._error('Не удалось сохранить файл, мы уже работаем над проблемой, повторите попытку позже');
                }
            }
            this._error('Файл не найден');
        }
        this._error('Идентификатор файла не определен. Мы уже работаем над проблемой.');
},
	/**
	 * @description Распечатать тренировочный файл
	 * @param $id file id
	 * @param $cResponder 
	*/
	    getTraningFile : function($id, $cResponder) {
        var $uid, $srcUid, $info, $filepath, $sprite, $parser, $stamp, $destfile, $o, $pagesNumber, $printModeData, $scheme;
        
        if ($id) {
            $uid = isset($_SESSION, 'online_user', 'id') ? $_SESSION['online_user']['id'] : 0;
            if (!$uid) {
                this._error('Вам надо авторизоваться');
                return;
            }
            $srcUid = $uid;
            $uid = $cResponder.traningUid;
            
            //DbProvider::setConnection();

            $info = this._getFileById($id);
            $info.lName = $_SESSION['online_user']['login'];
            $filepath = $info.path;
            if ($filepath) {
                $sprite = new Sprite();
                $parser = new DssParser();
                $parser.parseData($filepath);
                
                $stamp = date('Y-m-d-H-i-s');
                $destfile =  $_SERVER['DOCUMENT_ROOT'] + '/userfiles/newfiles/pdf/' + date('Y') + "/" + date('m') + '/u' + $uid + '_f' + $id + 'd' + $stamp + '.pdf';
                $o = PrintManager.preparePrint($parser, $sprite, !(isset($_POST, 'gridOff')), $destfile, $info);
                if ($o == false) {
                    this._error('Не могу подготовить данные для печати');
                }
                $pagesNumber = this._getPagesNumber($uid, $o['c']);
                
                $printModeData  = {};
                $printModeData.isPrintModeTimeWait = false;
                
                
                PrintManager.__print($pagesNumber);
                
                if (file_exists($destfile)) {
                    $info = {};
                    $scheme = 'http://';
                    $info['id'] = $id;
                    $info['t'] = $stamp;
                    return $info;
                    //header('Content-Type: application/pdf');

                    //header('Content-Disposition: attachment; filename="'. basename($destfile) .'"');

                    //readfile($destfile);

                    } else {
                    this._error('Не удалось сохранить файл, мы уже работаем над проблемой, повторите попытку позже');
                }
            }
            this._error('Файл не найден');
        }
        this._error('Идентификатор файла не определен. Мы уже работаем над проблемой.');
},
	/**
	 * @deprecated используется только в run
	 * @description проверить, достаточно ли средств на счету
	 * @param array $pagesNumber ключи - номера страниц к печати
	 * @param int totalPages общее количество страниц чертежа
	*/
	    _checkBalance : function($pagesNumber, $totalPages) {
        var $n, $info, $price, $userId, $user;
        $n = isset($pagesNumber, "0") && $pagesNumber[0] == 'ALL' ? $totalPages : count($pagesNumber);
        DbProvider.getPrintProps('rus', $info);
        if ( isset($info, 'oneListPrice') ) {
            $price = intval( $info['oneListPrice'] * $n);
            $userId = isset($_SESSION, 'online_user', 'id') ? $_SESSION['online_user']['id'] : 0;
            DbProvider.getUserInfo($userId, $user);
            if ($user['balance'] < $price) {
                throw new Error('Недостаточно средств на балансе');
            }
        }
},
	/**
	 * @description проверить, все ли из запрошенных страниц существуют, выдавать JSON  сообщение, "Листов N,n,r ... не сушествует"
	 * @param array $pagesNumber ключи - номера страниц к печати
	 * @param array $previewInfoObject результат работы preparePrint
	*/
	    _validatePagesNumber : function($pagesNumber, $previewInfoObject) {
        var $max;
        $max = max(array_keys($pagesNumber));
        if ($max > $previewInfoObject['c']) {
            throw new Error('Листа ' + $max + ' не существует');
        }
},
	/**
	 * @description - считывает номера страниц, которые надо распечатать. Оставляет токльо те, на которые хватает денег
	 * @var string $_POST['p'] номера страниц к печати, разделенные запятой. Нумеруются с 1. Если пусто, то считаем, что печатаем все
	 * @param $uid
	 * @param $totalPages
	 * @return array $pagesNumber [1 => 1, 2 => 1] ключ - номер страницы, 1 - печатать ли. В нулевом элементе может быть ALL
	*/
	_getPagesNumber : function($uid, $totalPages) {
        var $all, $listsPerCoin, $userInfo, $limit, $pages, $i, $v, $result, $buf, $key, $item;
        $all = ['ALL'];
        $listsPerCoin = this._getListsPerCoin();
        $userInfo = DbProvider.getUserInfo($uid);
        this._isActive = $userInfo['is_active'];
        this._balance = $userInfo['balance'];
        $limit =  this._getLimitWithFormat($_POST['f'], $listsPerCoin);
        
        if (!isset($_POST, 'p') || !trim($_POST['p'])) {
            if ($totalPages > $limit) {
                $pages = {};

                for ($i = 0; $i < $limit; $i++) {
                    $pages[$i + 1] = 1;
                }
                //$this->_price = ceil($limit / $listsPerCoin);

                //i = Math.ceil(cWillPrint * this._getA4InFormat(this.format) / this.listsPerCoin );

                this._price = Math.ceil($limit * this._getA4InFormat($_POST['f'])/ $listsPerCoin);
                return $pages;
                } else {
                //$this->_price = ceil($totalPages / $listsPerCoin);

                this._price = Math.ceil($totalPages * this._getA4InFormat($_POST['f'])/ $listsPerCoin);
                return $all;
            }
        }
        $pages = array_map(function($v) {
            return intval($v);
            }, explode(',', $_POST['p']));
        $result = array_fill_keys($pages, 1);
        if (isset($result, "0")) {
            return $all;
        }
        //оставить только те, которые позволяет баланс распечатать
        $buf = {};

        $i = 0;
        if ($limit == 0) {
            return $buf;
        }
        for ($key in $result) { $item = $result[$key];
            if ($i >= $limit) {
                break;
            }
            $buf[$key] = $item;
            $i++;
        }
        //$this->_price = ceil(count($buf) / $listsPerCoin);

        this._price = Math.ceil(count($buf) * this._getA4InFormat($_POST['f'])/ $listsPerCoin);
        $result = $buf;
        return $result;
},
	/**
	 * @param $fileId 
	 * @return StdClass {path, login, name, fileName}
	*/
	    _getFileById : function($fileId) {
        var $id, $filepath, $info;
        $id = $fileId;
        $filepath = isset($_POST, 'path') ? $_POST['path'] :  false;
        
        /*$info = DbProvider::getFileInfo($id);
		if ($info) {
			$filepath = $info->path;
			$filepath = explode('userfiles', $filepath);
			$filepath = 'userfiles' . $filepath[1];
		}
		$filepath = $_SERVER['DOCUMENT_ROOT'] . '/' . $filepath;*/
        $info = {};
        $info.path     = $filepath;
        $info.login    = 'offline';//$info->lName;

        $info.lName = 'Premium User';
        $info.name     = 'Premium User';//$info->dName;

        $info.dName     = 'Premium User';
        $info.fileName = 'd' + date('Y-m-d-H-i-s');//$info->fname;

        $info.date = date('d.m.Y H:i:s');
        $info.iPlotFrameOff = isset($_POST, 'iPlotFrameOff') ? $_POST['iPlotFrameOff'] :  false;
        return $info;
},
	    _getA4InFormat : function($formatStr) {
        var $multiplier;
        $multiplier = 1;
        switch ($formatStr) {
            case 'A5':
            $multiplier = 0.5;
            case 'A4':
            $multiplier = 1;
            break;
            case 'A4A':
            $multiplier = 1;
            break;
            case 'A3':
            $multiplier = 2;
            break;
            case 'A2':
            $multiplier = 4;
            break;
            case 'A1':
            $multiplier = 8;
            break;
            case 'A0':
            $multiplier = 16;
            break;
        }
        return $multiplier;
},
	    _getLimitWithFormat : function($formatStr, $listsPerCoin) {
        var $multiplier, $lim;
        $multiplier = this._getA4InFormat($formatStr);
        $lim = $listsPerCoin;
        if (this._balance  > 0) {
            $lim *= this._balance;
        }
        return Math.floor($lim / $multiplier);
},
	/**
	 * @description JSON die
	 * @param array || string $error
	*/
	_error : function($error) {
        var $s;
        $error = $error ? $error : this._badRequest;
        throw new Error($error);
        return {'error' : $error};
		
	},
	/**
	 * @description Проверить, не запрошен ли файл для печати после периода ожидания
	 * @param int $fileId
	 * @return баланс равен 0, пользователь активен и в файловой сессии есть время жизни запрошенного файла и оно равно 0
	*/
	    _checkPrintMode : function($fileId, $cResponder) {
        var $ret, $time;
        $ret = {};
        $ret.isPrintModeTimeWait = true;
        if (this._balance == 0) {
            if (this._isActive == 1) {
                $time = $cResponder.getFileTime($fileId);
                if ($time == 0) {
                    return $ret;
                }
                $ret.time = $time;
                $ret.errCode = 1;
                return $ret;
                } else {
                $ret.error = 'Необходима активация аккаунта';
                $ret.errCode = 2;
                return $ret;
            }
        }
        $ret.isPrintModeTimeWait = false;
        $ret.errCode = 3; //Недостаточно средств

        return $ret;
},
	/**
	 * @description Метод вызывается только в случае, если не выбрано "печатать все листы".
	 * @param array $pagesNumber @see return $this->_getPagesNumber
	 * @return array  @see return $this->_getPagesNumber
	*/
	    _getSelectedListsByOneRedcoin : function($pagesNumber) {
        var $listsPerCoin, $i, $r, $key, $item;
        $listsPerCoin = this._getListsPerCoin();
        $i = 0;
        $r = {};

        for ($key in $pagesNumber) { $item = $pagesNumber[$key];
            if ($i < $listsPerCoin) {
                $r[$key] = 1;
                $i++;
                } else {
                break;
            }
        }
        return $r;
},
	/**
	 * @description Метод вызывается только в случае, если выбрано "печатать все листы". Получает столько листов из допустимого количества, сколько можно получитьна один редкоин
	 * @param array $pagesNumber @see return $this->_getPagesNumber
	 * @return array  @see return $this->_getPagesNumber
	*/
	    _getListsByOneRedcoin : function($totalPages) {
        var $listsPerCoin, $r, $i;
        $listsPerCoin = this._getListsPerCoin();
        if ($listsPerCoin >= $totalPages) {
            return ['ALL'];
        }
        $r = {};

        for ($i = 1; $i <= $listsPerCoin; $i++) {
            $r[$i] = 1;
        }
        return $r;
},
	    _getListsPerCoin : function() {
        var $props;
        return 1000000;
        if (this._listsPerCoin !== null) {
            return this._listsPerCoin;
        }
        $props = DbProvider.getPrintProps('ru');
        this._listsPerCoin = $props['listsPerCoin'];
        return this._listsPerCoin;
}

};
