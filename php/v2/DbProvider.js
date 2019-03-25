var DbProvider = {
	    getFileInfo : function($fileID) {
        var $o;
        $fileID = intval($fileID);
        
        $o = {};
        $o.fname = 'Premium User';
        $o.path = $_POST['path'];
        return $o;
        
},
	
	/*static public function getFilePathById($fileID)
	{
		$cmd = "SELECT uf.filepath, uf.userID FROM user_files as uf WHERE fileID = :id";
		$params = [":id"=>(int)$fileID];
		$res = self::execute($cmd, $params);
		if (mysql_num_rows($res) == 0) return false;
		$o = new StdClass();
		$o->path   = mysql_result($res, 0, "filepath");
		$o->userID = mysql_result($res, 0, "userID");
		return $o;
	}*/
	
	
	
	
	/*    getUser : function($login, $password) {
        var $cmd, $row, $n;
        this.safeString($login);
        this.safeString($password);
        $cmd = "SELECT id, banned FROM users WHERE login = '" + $login + "' AND password = '" + $password + "'";
        $row = this.row($cmd, $n);
        if ($n == 1) {
            if ($row['banned'] == 1) {
                return -1;
            }
            return $row['id'];
        }
        return 0;
},*/
	
	
	/**
	 * @desc Получить данные пользователя
	 * @return ассоциативный массив 
	*/
	    getUserInfo : function($id) {
        
        var $r;
        
        $r  ={
            'id' : 1,
            'name' : 'Premium User',
            'login' : 'Premium User',
            'email' : '',
            'password' : '',
            'type' : '',
            'active' : '1',
            'code' : '',
            'personal'  : '',
            'banned' : 0,
            'money' : 10000,
            //userdata, regdate, printed, formactive, OrderID, photoid, sendmailmess, is_offline_version_user,

            'balance' : 10000,
            'is_active' : 1
            };
        return $r;
},
	
	/*    getPrintPrice : function() {
        var $cmd, $res, $v;
        if (!this.is_use_balance()) {
            return 0;
        }
        $cmd = "SELECT `value` FROM config  WHERE `name` = 'oneListPrice'";
        $res = mysql_query($cmd);
        $v = 0;
        if (mysql_num_rows($res)) {
            $v = mysql_result($res, 0, 0);
        }
        return $v;
},*/
	
	    getPrintProps : function($locale) {
        var $info;
        $info = {};
        $info['oneListPrice'] = 1;
        $info['listsPerCoin'] = 10000;
        return $info;
},
	
	/**
	 * //скоро @deprecated
	 * @return Возвращает true если используем в системе списывание с баланса за печать (было удобно при внедрении баланса)
	*/
	is_use_balance : function() {
        return true;
	}

	/**
	 * @desc Замена сессии 
	 * @param $sessKey - ключ
	 * @param $key - ключ массива
	 * @param $val - значение для ключа массива, может быть 'unset' или null, тогда не изменяется
	 * @param $array - если не null переписывает весь sess_key, key и val при этом игнорируются
	 * @param $getAll - если true возвращает массив _session[sess_key]
	 * @return если sessKey == null возвращает весь массив, если key == null возвращает массив _session[sess_key]
	 *         иначе если getAll не true возвращает _session[sess_key][key]
	*/
	/*static public function waitFileSession($sessKey = null, $key = null, $val = null, $array = null, $getAll = false)	{
		
	}*/
	
	
};
