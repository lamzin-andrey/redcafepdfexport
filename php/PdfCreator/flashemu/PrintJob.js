'/../dss/MapPoint.php';
'/../flashemu/PGraphics.php';
'/../flashemu/PTextField.php';

PrintJob.LANDSCAPE = 'landscape';
PrintJob.PORTRAIT  = 'portrait';

/**
 * @return array
*/
PrintJob.getAllowFormats = function() {
	return {'A0' : 1, 'A1' : 1, 'A2' : 1, 'A3' : 1, 'A4' : 1, 'A5' : 1, 'plot' : 1};
}

function PrintJob($fileName) {
	

	/** @property $orientation */
	/** @property $pageWidth */
	/** @property $paperWidth */
	/** @property $pageHeight */
	/** @property $paperHeight */
	/** @property $log */
	this.$log = [];
	/** @property $_fail */
	this.$_fail = false;
	/** @property $_pages */
	this._pages = [];
	/** @property $_format */
	/** @property $_pdf */
	/** @property $_dest */

		var $map, $fmt, $allow, $size;
		this._dest = $fileName;
		this.orientation = isset($_POST, 'o') ? $_POST['o'] : PrintJob.PORTRAIT;
		if (this.orientation != PrintJob.LANDSCAPE && this.orientation != PrintJob.PORTRAIT) {
			this.orientation = PrintJob.PORTRAIT;
		}
		$map = this.getFormatMap();
		$fmt = isset($_POST, 'f') ? $_POST['f'] : 'A4';
		if ($map.indexOf($fmt) == -1) {
			$fmt = 'A4';
		}
		//поддерживаемые форматы

		$allow = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'plot'];
		if (!in_array($fmt, $allow)) {
			this.log.push( 'Формат бумаги ' + $fmt + ' не поддерживается');
			this._fail = true;
			return;
		}
		this._format = $fmt;
		$size = $map.getPoint($fmt);
		this.pageWidth  = this.paperWidth  = $size.x;
		this.pageHeight = this.paperHeight = $size.y;
		if (this.orientation == PrintJob.LANDSCAPE) {
			this.pageWidth  = this.paperWidth  = $size.y;
			this.pageHeight = this.paperHeight = $size.x;
		}
}
PrintJob.prototype = {

	//==================================================================

	//======== ИНТЕРФЕЙС, ПЕРЕНЕСЕННЫЙ С Action Script =================

	//==================================================================

	
	   //mm

	  //mm

	  //mm

	 //mm

	
	//==================================================================

	//======== Дополнительные свойства =================================

	//==================================================================

	
	
	
	
	/** @property bool $_fail true когда неподдерживаемый формат @see start()*/
	
	//{}

	/** string $_format */
	
	/** FPDF $_pdf */
	
	/** string $_dest */
	
	
	/**
	 * @param string $fileName - полное имя файла
	*/
	
	//==================================================================

	//======== ИНТЕРФЕЙС, ПЕРЕНЕСЕННЫЙ С Action Script =================

	//==================================================================

	    addPage : function($sprite) {
        this._pages.push( $sprite);
},
	    send : function() {
        var $page, phpjslocvar_0;
        for (phpjslocvar_0 in this._pages) { $page = this._pages[phpjslocvar_0];
            this._pdf.AddPage();
            this._draw($page);
        }
        this._pdf.Output(this._dest, 'F');
},
	
	//вероятно  можно и нужно будет сразу указывать требуемую нам как временную

	    start : function() {
        
        if (!this._fail) {
            this._pdf = new FPDF(this.orientation.charAt(0), 'mm', this._format);
            this._pdf.AddFont('Arial', '', 'arial-cyr.php');
            this._pdf.AddFont('ArialBold', 'B', 'arial-cyrb.php');
            
        }
        return !this._fail;
},
	//==================================================================

	//======== Дополнительные методы ===================================

	//==================================================================


	/**
	 * @return MapPoint
	*/
	    getFormatMap : function() {
        var $list;
        $list = new MapPoint();
        $list.insert('A5',   pt(148, 210));
        $list.insert('A4',   pt(210, 297));
        $list.insert('A4A',  pt(216, 279));
        $list.insert('A3',   pt(297, 420));
        $list.insert('A2',   pt(420, 594));
        $list.insert('A1',   pt(594, 841));
        $list.insert('A0',   pt(841, 1189));
        $list.insert('plot', pt($_POST['plotterWidth'], $_POST['plotterHeight']));
        return $list;
},
	/**
	 * @param Sprite||PTextField||Arrow $displayObject
	 * @param int $offsetX
	 * @param int $offsetY
	*/
	    _draw : function($displayObject, $offsetX, $offsetY) {
			$offsetX = String($offsetX) != 'undefined' ? $offsetX : 0;
			$offsetY = String($offsetY) != 'undefined' ? $offsetY : 0;
			if (!window.DBG14) {
				//console.log($displayObject);
				window.DBG14 = true;
				//throw new Error('debug');
			}
        
        var $arr, $tfm, $color, $item, $objects, phpjslocvar_0;
        
        
        $arr = $displayObject.getChilds();
        if ($displayObject instanceof PTextField) {
            $tfm = $displayObject.getPTextFormat();
            $color = this._parseColor($tfm.color);
            
            this._pdf.SetTextColor($color.r, $color.g, $color.b);
            //this._pdf.SetTextColor(1, 1, 1);
            
            
            this._pdf.SetFont($tfm.font, ($tfm.bold ? 'B' : ''));
            this._pdf.SetFontSize($tfm.size);
            
            this._pdf.Text($displayObject.x + $offsetX, $displayObject.y + $offsetY + $tfm.size / 4, $displayObject.text);
        }
        if (isset($displayObject, "bitmap")) {
            this._pdf.Image($displayObject.bitmap, $displayObject.x + $offsetX, $displayObject.y + $offsetY);
        }
        for (phpjslocvar_0 in $arr) { $item = $arr[phpjslocvar_0];
            this._draw($item, $offsetX  + $displayObject.x, $offsetY + $displayObject.y);
        }
        //Вообще-то Сначала берем графикс и рисуем его, но тут пока так

        $objects = $displayObject.graphics._objects;
        this._drawGraphics($objects, $offsetX  + $displayObject.x, $offsetY  + $displayObject.y);
},
	/**
	 * @param array $objects @see Graphics::_objects
	 * item[type=TYPE_POINT]: 
	 * {type, x, y, color, 
	 *  fill_color, 
	 *  thikness, 
	 *  is_start, 
	 * is_begin_fill, 
	 * is_end_fill}
	*/
	    _drawGraphics : function($objects, $dX, $dY) {
        var $lastStart = null, $k, $i, $c, $style;
        //print_r($objects); die;
        
        for ($k in $objects) { $i = $objects[$k];
            if (isset($i, 'type')) {
				//console.log($i);
                if ($i['type'] == PGraphics.TYPE_POINT) {
					//console.log('taki da');
                    if ($i['is_start']) {
                        $lastStart = $i;
                    }
                    if (isset($i, 'thikness') && $i['thikness']) {
                        this._pdf.SetLineWidth($i['thikness'] / 10);

                    }
                    if (isset($i, 'color') && $i['color']) {
                        $c = this._parseColor($i['color']);
                        //console.log('SetDrawColor');
                        //console.log($c);
                        this._pdf.SetDrawColor($c.r, $c.g, $c.b);

                    }
                    if (isset($i, 'is_begin_fill') && $i['is_begin_fill'] && $i['fill_color']) {
                        $c = this._parseColor($i['fill_color']);
                        this._pdf.SetFillColor($c.r, $c.g, $c.b);

                    }
                    if (isset($i, 'is_end_fill') && $i['is_end_fill']) {
                        this._pdf.SetFillColor(255, 255, 255);
                    }
                    if ($i['is_start']) {
                        
                    } else if (isset($lastStart, 'x')){
						//console.log('Draw line to ' + ($lastStart['x'] + $dX) + ', ' + ($lastStart['y'] + $dY) );
                        this._pdf.Line($lastStart['x'] + $dX, $lastStart['y'] + $dY, $i['x'] + $dX, $i['y'] + $dY);
                        $lastStart = $i;
                    } else {
                        throw new Error ('On index k = ' + $k + ' lastObject not containt x ' + print_r($lastStart, 1));
                    }
                    } else if ($i['type'] == PGraphics.TYPE_RECT){
                    $style = '';
                    if ($i['fill_color']) {
                        $c = this._parseColor($i['fill_color']);
                        this._pdf.SetFillColor($c.r, $c.g, $c.b);
                        $style = 'FD';
                    } else {
                        this._pdf.SetFillColor(255,1,1);
                    }
                    this._pdf.Rect($i['x'] + $dX, $i['y'] + $dY, $i['w'], $i['h'], $style);
                }
                } else {
                throw new Exception('Unexpected object ' + print_r($i, 1));
            }
        }
},
	_parseColor : function($n) {
		$n = (String($n) == 'undefined') ? 0xFF0000 : $n;
		//console.log('_parseColor get arg '  + $n);
        var $s, $arr, $item, $i, $j, $res;
        $s = dechex($n);
        while (strlen($s) < 6) {
            $s = '0' + $s;
        }
        //console.log('_parseColor transfoerm arg '  + $s);
        $arr = [];
        $item = '';
        for ($i = 0, $j = 0; $i < strlen($s); $i++, $j++) {
            $item += $s.charAt($i);
            if ($j > 0) {
                $arr.push($item);
                $item = '';
                $j = -1;
            }
        }
        //console.log('_parseColor fill arr ');
        //console.log($arr);
        $res = {};
        $res.r = hexdec($arr[0]);
        $res.g = hexdec($arr[1]);
        $res.b = hexdec($arr[2]);
        return $res;
	},
	    getDest : function() {
        
        return this._dest;
},
	
	    getFormat : function() {
        
        return this._format;
}

};

