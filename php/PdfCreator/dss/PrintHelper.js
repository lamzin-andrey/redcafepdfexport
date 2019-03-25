var PrintHelper = {

	/** @property MapPoint $_formats */
	
	 //mm

	/** @property int $lMargin */
	
	/** @property int $rMargin */
	
	/** @property int $tMargin */
	
	/** @property int $bMargin */
	
	/** @property string $LANDSCAPE */
	
	/** @property string $PORTRAIT */
	
	/** @property string $MARKER_TEXT */
	
	/** @property StdClass $flashVars */
	
  
	/** @property $MARGIN */
    $MARGIN : 12,
        /** @property $lMargin */
        /** @property $rMargin */
        /** @property $tMargin */
        /** @property $bMargin */
        /** @property $LANDSCAPE */
        /** @property $PORTRAIT */
        /** @property $MARKER_TEXT */
    //$MARKER_TEXT : '| Сделано в программе Redcafe | Redcafestore.com | Сделано в программе Redcafe | Redcafestore.com |',
    $MARKER_TEXT : '',
        /** @property $addWatermark */
    $addWatermark : false,
        /** @property $trc */
    $trc : '',
        /** @property $flashVars */
        /** @property $_formats */

	_trace : function($s, $_throw) {
        var $str, $trc;
        if ($_throw) {
            $str = PrintHelper.$trc + "\r\n" + $s;
            //PrintHelper::$trc = '';
            throw new Error($str);
        } else {
            PrintHelper.$trc += "\r\n" + $s;
            console.log( "\n" + $s + "\n");
        }
},
	 /**
	  * @param PSprite $spr
	  * @param int $w
	  * @param int $h
	  * @param int $delta
	  * @param int $color
	  * @param string $pageID
	  * @param int $mmW
	  * @param int $mmH
	 */
	drawGrid : function($spr, $w, $h, $delta, $color, $pageID, $mmW, $mmH) {
		$mmW = String($mmW) == 'undefined' ? $mmW : 0;
		$mmH = String($mmH) == 'undefined' ? $mmH : 0;
		
        var $arr, $rowID, $colID, $addWatermark, $offset, $watermarkColor, $flashVars, $waterMarkTf, $text, $MARKER_TEXT, $textSz, $tef, $maxW, $lMargin, $str, $gridPSprite, $start, $tMargin, $i;
        $arr = explode(':', $pageID);

        $rowID = Number($arr[0]);
        //var colID = Number(arr[1]);

        $colID = intval($arr[1]);
        
        if (this.$addWatermark) {
            $offset = rand(12, 58);
            $watermarkColor = isset(PrintHelper, '$flashVars', "watermarkFontColor") ? PrintHelper['$flashVars']["watermarkFontColor"] : 0xe3e3e3;

            $waterMarkTf = new PTextFormat('Arial', null, $watermarkColor);
            $text = cp1251_codes(this.$MARKER_TEXT);
            $textSz = ($text.length - 1);
            while (true) {
                $tef = new PTextField();
                $maxW = $w - this.toPix(this.$lMargin + 6);
                $tef.width = $maxW;
                $str = '';
                while (true) {
                    $str += $text;
                    $tef.text = $str;
                    if($tef.textWidth >= $maxW) {
                        break;
                    }
                }
                $tef.setPTextFormat($waterMarkTf);
                $tef.x = this.getStart($rowID, $mmW) + this.toPix(this.$lMargin + 4);
                $tef.y = $offset;
                $spr.addChild($tef);
                $offset += this.toPix(70);
                if ($offset > $h) {
                    break;
                }
            }
        }
        
        
        //var gridPSprite:PSprite = new PSprite();

        $gridPSprite = new PSprite();
        $gridPSprite.name = "gridPSprite";
        //gridPSprite.graphics.lineStyle(0.25, color);

        $gridPSprite.graphics.lineStyle(0.25, $color);
        //hor

        //var start = getStart(rowID, mmH) + toPix(tMargin);

        $start = this.getStart($rowID, $mmH) + this.toPix(this.$tMargin);
        for ($i = $start; $i < $h; $i += $delta) {
            $gridPSprite.graphics.moveTo(this.toPix(this.$lMargin), $i);
            $gridPSprite.graphics.lineTo($w, $i);
        }
        //vert

        //start = getStart(colID, mmW) + toPix(lMargin);

        $start = this.getStart($colID, $mmW) + this.toPix(this.$lMargin);
        for ($i = $start; $i < $w; $i+= $delta) {
            //self::_trace('i = ' . $i . ' from ' . self::toPix(self::$tMargin) . ' to ' . $h);

            //gridPSprite.graphics.moveTo(i, toPix(tMargin));

            $gridPSprite.graphics.moveTo($i, this.toPix(this.$tMargin));
            //gridPSprite.graphics.lineTo(i, h);

            $gridPSprite.graphics.lineTo($i, $h);
        }
        //spr.addChild(gridPSprite);
        $spr.addChild($gridPSprite);
},
	 
	     getStart : function($multiplier, $length) {
        var $start, $k, $n;
        $start = 0;
        $k = $multiplier * $length;
        if ($k != 0) {
            $n = $k / 10;
            $n = Math.ceil($n) * 10;
            //self::_trace("round (" + $k +  ")  = "  + $n);

            $start = $n - $k;
        }
        return this.toPix($start);
},
	 /**
	  * @param PrintJob $o
	 */
	getFormat : function($o) {
        var $_formats, $dw, $lMargin, $MARGIN, $rMargin, $dh, $tMargin, $bMargin, $LANDSCAPE, $PORTRAIT, $w, $h;
        this.$_formats = $o.getFormatMap();
        $dw = $o.paperWidth - $o.pageWidth;
        
        if ($dw != 0) {
            $dw = $dw / 2;
        }
        this.$lMargin = this.$MARGIN - this.toMm($dw);
        this.$rMargin = PrintHelper.$MARGIN + this.toMm($dw);
        $dh = $o.paperHeight - $o.pageHeight;
        if ($dh != 0) {
            $dh = $dh / 2;
        }
        this.$tMargin = PrintHelper.$MARGIN - this.toMm($dh); // toMm(5);// 14.5;

        this.$bMargin = PrintHelper.$MARGIN + this.toMm($dh); // toMm(5);// 14.5;

        this.$LANDSCAPE = PrintJob.LANDSCAPE;
        this.$PORTRAIT  = PrintJob.PORTRAIT;
        //var w = toMm(o.paperWidth);

        //$w = self::toMm($o->paperWidth);

        $w = $o.paperWidth;
        if ($o.orientation == this.$PORTRAIT) {
            if ($w == 148) return "A5";
            if ($w == 210) return "A4";
            if ($w == 216) return "A4A";
            if ($w == 297) return "A3";
            if ($w == 420) return "A2";
            if ($w == 594) return "A1";
            if ($w == 841) return "A0";
            if ($w == $_POST['plotterWidth']) {
                return "plot";
            }
        }
        
        //var h = toMm(o.paperHeight);

        $h = $o.paperHeight;
        
        $h = $o.paperHeight;
        if ($h == 148) return "A5";
        if ($h == 210) return "A4";
        if ($h == 216) return "A4A";
        if ($h == 297) return "A3";
        if ($h == 420) return "A2";
        if ($h == 594) return "A1";
        if ($h == 841) return "A0";
        if ($h == $_POST['plotterWidth']) {
            return "plot";
        }
},
	 /**
	  * @description возвращает массив номеров страниц. Номер страницы представляет собой строку "N:M" где  N - номер строки прямоугольной таблицы, M - номер столбца	 
	  * @param string   $format
	  * @param StdClass $lineInfo
	  * @param string $listOrientation
	  * @param StdClass $delta
	  * @return array
	 */
	 getPages : function($format, $lineInfo, $listOrientation, $delta) {
        var $result, $LANDSCAPE, $PORTRAIT, $l, $page, $page2, $debug, $norm, $pages, $pagesLength, $i, $_rect;
        $result = [];
        if ( ($listOrientation != this.$LANDSCAPE)&& ($listOrientation != this.$PORTRAIT)) {
            this._trace ("unknown orientation, this.$LANDSCAPE = " + this.$LANDSCAPE);
            $result.push("-1:-1");
            return $result;
        }
        $lineInfo.startX -= $delta.dx;
        $lineInfo.endX   -= $delta.dx;
        
        $lineInfo.endY   -= $delta.dy;
        $lineInfo.startY -= $delta.dy;
        
        
        //var l = lineLength(lineInfo);

        $l = this.lineLength($lineInfo);
        if (this.lineLength($lineInfo) > 10) {
            //исходя из того что линия прямая вычисляем её пересечение с прямоугольниками

            //если она перпендикулярна одной из паре сторон прямоугольника получаем все, что между ними.

            //var page = getPageName(lineInfo.startX, lineInfo.startY, format, listOrientation);

            $page = this.getPageName($lineInfo.startX, $lineInfo.startY, $format, $listOrientation);
            //var page2 = getPageName(lineInfo.endX, lineInfo.endY, format, listOrientation);

            $page2 = this.getPageName($lineInfo.endX, $lineInfo.endY, $format, $listOrientation);
            
            $debug = false;
            //var norm = isNormal(page, page2);

            $norm = this._isNormal($page, $page2);
            if ($norm != false) {
                $result  = this._getMiddleRects($norm, $page, $page2);
                return $result;
            }
            //иначе получаем массив прямоугольников составляющих прямоугольник, в углах которого прямоугольники,

            //						которым принадлежат точки прямых 

            else {
                if ($debug == true) this._trace ("WILL GET INNER RECTS");
                //var pages = getInnerRects(page, page2);

                $pages = this.getInnerRects($page, $page2);
                if ($debug == true) {
                    this._trace ("startX == " + $lineInfo.startX);
                    this._trace ("startY == " + $lineInfo.startY);
                    this._trace ("endX   == " + $lineInfo.endX);
                    this._trace ("endY   == " + $lineInfo.endY);
                    this._trace("page = {$page}, page2 = {$page2}");
                }
                //и для каждого из них смотрим пересечение для каждой из сторон

                $pagesLength = count($pages);
                for ($i = 0; $i < $pagesLength; $i++) {
                    if ($debug == true) this._trace ("pages[" + $i + "]" + $pages[$i]);
                    //var _rect = pageNameToRect(pages[i], format, listOrientation);

                    $_rect = this.pageNameToRect($pages[$i], $format, $listOrientation);
                    //print_r($_rect); die;

                    if (this._isIntersect($lineInfo, $_rect)) {
                        //result.push(pages[i]);

                        $result.push($pages[$i]);
                        } else {
                        //self::_trace('skip!');

                    }
                }
                return $result;
            }
            } else {
            $page = this.getPageName($lineInfo.startX, $lineInfo.startY, $format, $listOrientation);
            if (this.noExist($result, $page)) {
                //result.push(page);

                $result.push($page);
            }
            //page = getPageName(lineInfo.endX, lineInfo.endY, format, listOrientation);

            $page = this.getPageName($lineInfo.endX, $lineInfo.endY, $format, $listOrientation);
            if (this.noExist($result, $page)){
                //result.push(page);

                $result.push($page);
            }
        }
        return $result;
},
	 //---------------

	 //возвращает объект с полями аналогичными dssLoader.lines[i],

	 //но пересчитанными в соответствии с форматом листа, его номером и его положением

	 /**
	  * @param string $listFormat
	  * @param StdClass $lineInfo
	  * @param string $listOrientation
	  * @param string $pageNumber
	 */
	     getData : function($listFormat, $lineInfo, $listOrientation, $pageNumber) {
        var $trc, $debug, $format, $_formats, $w, $lMargin, $rMargin, $h, $tMargin, $bMargin, $LANDSCAPE, $b, $p, $startX, $endX, $endY, $startY, $rFalse, $oLine, $o, $e;
        PrintHelper.$trc = '';
        $debug  = true;
        //var format = formats.getPoint(listFormat);

        $format = this.$_formats.getPoint($listFormat);
        //var w = format.x - (lMargin + rMargin);

        //var h = format.y - (tMargin + bMargin);

        $w = $format.x - (this.$lMargin + this.$rMargin);
        $h = $format.y - (this.$tMargin + this.$bMargin);
        
        if ($listOrientation == this.$LANDSCAPE) {
            $b = $w;
            $w = $h;
            $h = $b;
        }
        $p = this.toObject($pageNumber);
        $startX = $lineInfo.startX - $p.x * $w;
        $endX   = $lineInfo.endX   - $p.x * $w;
        $endY   = $lineInfo.endY   - $p.y * $h;
        $startY = $lineInfo.startY - $p.y * $h;
        $rFalse = false;
        $oLine = {};
        $oLine.startX = $startX;
        $oLine.startY = $startY;
        $oLine.endX   = $endX;
        $oLine.endY   = $endY;
        if (this._pointInOutSide($startX, $startY, $w, $h)) {
            //var o = rewritePoint(w, h, { startX:startX, startY:startY, endX:endX, endY:endY }, "start");

            //$oLine = { startX:startX, startY:startY, endX:endX, endY:endY };

            
            $o = this._rewritePoint($w, $h, $oLine, 'start');
            if ($o != false) {
                try	{
                    $startX = $o.x;
                    $startY = $o.y;
                    } catch ($e)	{
						$rFalse = true;
					}
            }
        }
        
        if (this._pointInOutSide($endX, $endY, $w, $h)) {
            $o = this._rewritePoint($w, $h, $oLine, 'end');
            if ($o != false)	{
                try	{
                    $endX = $o.x;
                    $endY = $o.y;
                    } catch ($e) {
						$rFalse = true;
					}
            }
        }
        if ($rFalse) {
            return false;
        }
        $oLine.startX = $startX;
        $oLine.startY = $startY;
        $oLine.endX   = $endX;
        $oLine.endY   = $endY;
        $oLine.color  = isset($lineInfo, "color") ? $lineInfo.color : 0;
        return $oLine;
},
	 /**
	  * @param int $x
	  * @param int $y
	  * @param int $w
	  * @param int $h
	 */
	     _pointInOutSide : function($x, $y, $w, $h) {
        
        if (
        ($x < 0)
        || ($x > $w)
        || ($y > $h)
        || ($y < 0)
        ) return true;
        return false;
},
	 /**
	  * @param StdClass {startX, startY, endX, endY} $line
	  * @param StdClass {startX, startY, endX, endY} $piece
	 */
	     _getIntersectPointLineWithPiece : function($line, $piece) {
        var $y, $eLine, $x;
        //если отрезок горизонтальный

        if ($piece.startY == $piece.endY) {
            $y = $piece.startY;
            //если прямая не вертикальная  и не горизонтальная

            if (($line.startX != $line.endX)&&($line.startY != $line.endY))	{
                $eLine  = this._getLineKoeff($line);
                $x = ($y - $eLine.b) / $eLine.k;
                if (($x >= $piece.startX) && ($x <= $piece.endX)) {
                    //return {x:x, y:y };

                    return pt($x, $y);
                }
                } else if ($line.startY == $line.endY) {//прямая горизонтальная

                if ($line.startY == $piece.startY) { //они лежат на одной пряиой

                    $x = $line.startX;
                    if (($x >= $piece.startX) && ($x <= $piece.endX)) {
                        //return { x:x, y:y };

                        return pt($x, $y);
                    }
                    $x = $line.endX;
                    if (($x >= $piece.startX) && ($x <= $piece.endX)) {
                        //return {x:x, y:y };

                        return pt($x, $y);
                    }
                }
                } else if ($line.startX == $line.endX) { //прямая вертикальная

                $x = $line.startX;
                if (($x >= $piece.startX) && ($x <= $piece.endX)) {
                    //return {x:x, y:y };

                    return pt($x, $y);
                }
            }
            } else  if ($piece.startX == $piece.endX) {//отрезок вертикальный

            $x = $piece.startX;
            //если прямая не вертикальная  и не горизонтальная

            if (($line.startX != $line.endX)&&($line.startY != $line.endY))	{
                $eLine  = this._getLineKoeff($line);
                $y = $eLine.k * $x + $eLine.b;
                if (($y >= $piece.startY) && ($y <= $piece.endY)) {
                    //return {x:x, y:y };

                    return pt($x, $y);
                }
                } else if ($line.startY == $line.endY) {//если прямая горизонтальная

                $y = $line.startY;
                if (($y >= $piece.startY) && ($y <= $piece.endY)) {
                    //return { x:x, y:y };

                    return pt($x, $y);
                }
                } else if ($line.startY == $line.endY) {//если прямая вертикальная

                if ($line.startX == $piece.startX) {	//и отрезок принадлежит ей

                    $y = $line.startY;
                    if (($y >= $piece.startY) && ($y <= $piece.endY)) {
                        //return { x:x, y:y };

                        return pt($x, $y);
                    }
                    $y = $line.endY;
                    if (($y >= $piece.startY) && ($y <= $piece.endY)) {
                        //return { x:x, y:y };

                        return pt($x, $y);
                    }
                }
            }
        }
        return false;
},
	 /**
	  * @param int $w
	  * @param int $h
	  * @param StdClass {startX, startY, endX, endY} $line
	  * @param string $type
	 */
	     _rewritePoint : function($w, $h, $line, $type) {
        var $wPiece, $point, $points, $hPiece;
        //верхняя горизонталь 

        //var wPiece = { startX:0, startY:0, endX:w, endY:0 };

        $wPiece = {};
        $wPiece.startX = 0;
        $wPiece.startY = 0;
        $wPiece.endX   = $w;
        $wPiece.endY   = 0;
        //получить точку пересечения прямой с отрезком

        //var point = self::_getIntersectPointLineWithPiece(line, wPiece);

        $point = this._getIntersectPointLineWithPiece($line, $wPiece);
        
        $points = [];
        if ($point != false) { //точка пересекается с отрезком
            //points.push(point);
            $points.push($point);
        }
        //нижняя горизонталь 

        //wPiece = { startX:0, startY:h, endX:w, endY:h }; 

        $wPiece.startX = 0;
        $wPiece.startY = $h;
        $wPiece.endX   = $w;
        $wPiece.endY   = $h;
        //получить точку пересечения прямой с отрезком

        $point = this._getIntersectPointLineWithPiece($line, $wPiece);
        if ($point != false) {			 //точка пересекается с отрезком

            //points.push(point);

            $points.push($point);
        }
        //левая вертикаль

        //var hPiece = { startX:0, startY:0, endX:0, endY:h }; 

        $hPiece = {};
        $hPiece.startX = 0;
        $hPiece.startY = 0;
        $hPiece.endX   = 0;
        $hPiece.endY   = $h;
        //получить точку пересечения прямой с отрезком

        $point = this._getIntersectPointLineWithPiece($line, $hPiece);
        if ($point != false) { //точка пересекается с отрезком

            //points.push(point);

            $points.push($point);
        }
        //правая вертикаль

        //hPiece = { startX:w, startY:0, endX:w, endY:h }; 

        $hPiece.startX = $w;
        $hPiece.startY = 0;
        $hPiece.endX   = $w;
        $hPiece.endY   = $h;
        //получить точку пересечения прямой с отрезком

        $point = this._getIntersectPointLineWithPiece($line, $hPiece);
        if ($point != false) { //точка пересекается с отрезком

            //points.push(point);

            $points.push($point);
        }
        return this.getNearestPoint($points, $line, $type);
	},
	 /**
	  * @description Возвращает ближайшую к одному из краев отрезкa прямой точку
	  * @param array $cache
	  * @param StdClass {startX, startY, endX, endY} $line
	  * @param string $type
	 */
	    getNearestPoint : function($cache, $line, $type) {
        var $length, $p, $min, $i, $A, $s;
        $length = count($cache);
        if ($length > 1) {
            $p = $cache[0];
            $min = this.getMinDist($p, $line, $type);
            for ($i = 0; $i < $length; $i++ ) {
                $A = $cache[$i];
                $s = this.getMinDist($A, $line, $type);
                if ($s < $min) {
                    $p = $A;
                    $min = $s;
                }
            }
            return $p;
        }
},
	//Возвращает наименьшее расстояние от точки до края отрезка

	    getMinDist : function($point, $line, $type) {
        var $x1, $y1, $x2, $y2, $r_2, $r1, $r2;
        $x1 = $point.x;
        $y1 = $point.y;
        $x2 = $line.startX;
        $y2 = $line.startY;
        $r_2 = ($x2 - $x1)*($x2 - $x1) + ($y2 - $y1)*($y2 - $y1);
        $r1 = sqrt($r_2);
        $x2 = $line.endX;
        $y2 = $line.endY;
        $r_2 = ($x2 - $x1) * ($x2 - $x1) + ($y2 - $y1) * ($y2 - $y1);
        $r2 = sqrt($r_2);
        if ($type == "end") {
            return $r2;
        }
        return $r1;
},
	/**
	 * @description Возвращает объект приращения для сдвига страниц к краю листа
	 * @param array $lines 
	*/
	    getDelta : function($lines) {
        var $dx, $dy, $length, $i, $return;
        $dx = null;//undefined!

        $dy = null;//undefined!

        $length = count($lines);
        for ($i = 0; $i < $length; $i++) {
            if ($dx === null) {
                $dx = $lines[$i].startX;
            }
            if ($dx > $lines[$i].startX) {
                $dx = $lines[$i].startX;
            }
            if ($dx > $lines[$i].endX) {
                $dx = $lines[$i].endX;
            }
            
            if ($dy === null) {
                $dy = $lines[$i].startY;
            }
            if ($dy > $lines[$i].startY) {
                $dy = $lines[$i].startY;
            }
            if ($dy > $lines[$i].endY) {
                $dy = $lines[$i].endY;
            }
        }
        $return = {};
        $return.dx = $dx;
        $return.dy = $dy;
        //return {dx:dx, dy:dy};

        return $return;
},
	/**
	 * @description Возвращает размер страницы
	 * @param string $key 
	*/
	    getFormatSize : function($key) {
        var $_formats;
        //die('key = ' . $key);

        return this.$_formats.getPoint($key);
},
	//--------------

	//

	//

	/**
	 * @description Возвращает булеву величину, в зависимости от того, пересекается ли линия lineInfo с какой либо из сторон прямоугольника
	 * @param StdClass {startX, startY, endX, endY} $lineInfo
	 * @param $_rect {x, y, w, h}
	*/
	    _isIntersect : function($lineInfo, $_rect) {
        var $line, $lineParams, $AB, $point, $CD, $x, $y, $tv;
        /*
		 * A-------------------B
		 * |                   |
		 * |                   |
		 * |                   |
		 * |                   |
		 * C-------------------D
		 *
		 */
        //Получить коэффициенты уравнения прямой y= kx + b. (o = {b, k})

        
        //var line:Object = self::_getLineKoeff(lineInfo);

        $line = this._getLineKoeff($lineInfo);
        //{ startX:_rect.x, startY:_rect.y, endX:_rect.x + _rect.w, endY:_rect.y}

        $lineParams = {};
        $lineParams.startX = $_rect.x;
        $lineParams.startY = $_rect.y;
        $lineParams.endX   = $_rect.x + $_rect.w;
        $lineParams.endY   = $_rect.y;
        $AB = this._getLineKoeff($lineParams);
        
        //var point = getIntersectPoint(line, AB);

        $point = this._getIntersectPoint($line, $AB);
        if ($point === null) {
            this._trace ("Линия параллельна Y???");
        }
        if (($point.x >= $_rect.x) && ($point.x <= $_rect.x + $_rect.w)) {
            return true;
        }
        //{startX:_rect.x, startY:_rect.y + _rect.h, endX:_rect.x + _rect.w, endY:_rect.y + _rect.h }

        $lineParams.startX = $_rect.x;
        $lineParams.startY = $_rect.y + $_rect.h;
        $lineParams.endX   = $_rect.x + $_rect.w;
        $lineParams.endY   = $_rect.y + $_rect.h;
        $CD = this._getLineKoeff($lineParams);
        $point = this._getIntersectPoint($line, $CD);
        if ($point === null) {
            this._trace ("Линия параллельна Y???");
        }
        if (($point.x >= $_rect.x) && ($point.x <= $_rect.x + $_rect.w)) {
            return true;
        }
        //AC

        $x = $_rect.x;
        $y = $line.k * $x + $line.b;
        $tv = $_rect.y + $_rect.h;
        if (($y >= $_rect.y) && ($y <= $_rect.y + $_rect.h)) {
            return true;
        }
        //BD

        $x = $_rect.x + $_rect.w;
        $y = $line.k * $x + $line.b;
        if (($y >= $_rect.y) && ($y <= $tv)) {
            return true;
        }
        return false;
},
	/**
	 * @description возвращает точку пересечения прямых line_1, line_2 - объекты {b , k} (y = kx + b)
	 * @param StdClass {b, k} $line_1
	 * @param StdClass {b, k} $line_1
	*/
	    _getIntersectPoint : function($line_1, $line_2) {
        var $k0, $k2, $b2, $b0, $x, $y;
        $k0 = $line_1.k;
        $k2 = $line_2.k;
        $b2 = $line_2.b;
        $b0 = $line_1.b;
        if (($k0 !== null) && ($k2 !== null)) {
            /*y = k0 * x + b0;
			y = k2 * x + b2;
			k2 * x + b2 = k0 * x + b0;
			k2 * x  = k0 * x + b0 - b2;
			k2 * x  - k0 * x  = b0 - b2;
			(k2 - k0) * x  = (b0 - b2);*/
            $x  = ($b0 - $b2) / ($k2 - $k0);
            $y = $k0 * $x + $b0;
            //return { x:x, y:y };

            return pt($x, $y);
        }
        return null; //исходя из того что line_1 параллелльной осям координат быть не может (в этом случае данная функция не вызывается)

},
	//Получить коэффициенты уравнения прямой y= kx + b. (o = {b, k})

	/**
	 * @param StdClass {startX, startY, endX, endY} $lineInfo
	*/
	    _getLineKoeff : function($lineInfo) {
        var $x1, $y1, $y2, $x2, $k, $b, $res;
        $x1 = $lineInfo.startX;
        $y1 = $lineInfo.startY;
        $y2 = $lineInfo.endY;
        $x2 = $lineInfo.endX;
        $k = null;
        if ($x2 - $x1 != 0) {
            $k = ($y2 - $y1) / ($x2 - $x1);
        }
        $b = $y1 - $k * $x1;
        //var res = { b:b, k:k };

        $res = {};
        $res.b = $b;
        $res.k = $k;
        return $res;
},
	/**
	 * @param string $page
	 * @param string $page2
	*/
	    getInnerRects : function($page, $page2) {
        var $p1, $p2, $res, $buf, $i, $_p1, $_p2, $_buf, $j, $s;
        $p1 = this.toObject($page);
        $p2 = this.toObject($page2);
        
        $res = [];
        if ($p1.x > $p2.x) {
            //var buf = { x:p1.x, y:p1.y };

            $buf = pt($p1.x, $p1.y);
            $p1.x = $p2.x;
            $p1.y = $p2.y;
            $p2.x = $buf.x;
            $p2.y = $buf.y;
        }
        for ($i = $p1.x; $i <= $p2.x; $i++) {
            //var _p1 = { x:p1.x, y:p1.y };

            $_p1 = pt($p1.x, $p1.y);
            $_p2 = pt($p2.x, $p2.y);
            if ($_p1.y > $_p2.y) {
                $_buf = pt($_p1.x, $_p1.y);
                $_p1.x = $_p2.x;
                $_p1.y = $_p2.y;
                $_p2.x = $_buf.x;
                $_p2.y = $_buf.y;
            }
            for ($j = $_p1.y; $j <= $_p2.y; $j++) {
                //var s = String(j) + ":" + String(i);

                $s = strval($j) + ":" + strval($i);
                //res.push(s);

                $res.push($s);
            }
        }
        return $res;
},
	/**
	 * @param string $norm
	 * @param string $page
	 * @param string $page2
	*/
	    _getMiddleRects : function($norm, $page, $page2) {
        var $res, $p1, $p2, $N, $i, $s, $M;
        $res = [];
        if ($norm == 'h') {
            $p1 = this.toObject($page);
            $p2 = this.toObject($page2);
            if ($p1.x > $p2.x) {
                $p1 = this.toObject($page2);
                $p2 = this.toObject($page);
            }
            //var N = String(p1.y);

            $N = strval($p1.y);
            for ($i = $p1.x; $i <= $p2.x; $i++) {
                //var s = N + ":" + String(i);

                $s = $N + ':' + strval($i);
                $res.push($s);
            }
            return $res;
        }
        if ($norm == 'v') {
            $p1 = this.toObject($page);
            $p2 = this.toObject($page2);
            if ($p1.y > $p2.y) {
                $p1 = this.toObject($page2);
                $p2 = this.toObject($page);
            }
            $M = strval($p1.x);
            for ($i = $p1.y; $i <= $p2.y; $i++) {
                $s = strval($i) + ':' + $M;
                $res.push($s);
            }
            return $res;
        }
        return $res;
},
	/**
	 * @param string $page
	 * @param string $page2
	*/
	    _isNormal : function($page, $page2) {
        var $p1, $p2;
        $p1 = this.toObject($page);
        $p2 = this.toObject($page2);
        if ($p1.x == $p2.x) {
            return 'v';
        }
        if ($p1.y == $p2.y) {
            return 'h';
        }
        return false;
},
	/**
	 * @param string $pageStr
	*/
	    toObject : function($pageStr) {
        var $arr, $res;
        //var arr:Array = pageStr.split(":");
		//console.log('pageStr = ' + $pageStr);
        $arr = explode(':', $pageStr);
        /*var res:Object = new Object();
		res.y = Number(arr[0]);
		res.x = Number(arr[1]);*/
        $res = pt($arr[1], $arr[0]);
        return $res;
},
	/**
	 * @param StdClass {startX, startY, endX, endY} $lineInfo
	*/
	    lineLength : function($lineInfo) {
        var $x1, $x2, $y2, $y1;
        $x1 = $lineInfo.startX;
        $x2 = $lineInfo.endX;
        $y2 = $lineInfo.endY;
        $y1 = $lineInfo.startY;
        //return Math.sqrt((x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1));

        return Math.sqrt(($x2 - $x1)*($x2 - $x1) + ($y2 - $y1)*($y2 - $y1));
},
	/**
	 * @param string $page
	 * @param string $format
	 * @param string $listOrientation
	 * @return StdClass {x, y, w, h}
	*/
	    pageNameToRect : function($page, $format, $listOrientation) {
        var $arr, $sN, $sM, $N, $M, $sz, $_formats, $w, $lMargin, $h, $tMargin, $LANDSCAPE, $b, $res;
        //var arr:Array = page.split(":");

        $arr = explode(':', $page);
        $sN = $arr[0];
        $sM = isset($arr, "1") ? $arr[1] : '';
        $N = intval($sN);
        $M = intval($sM);
        $sz = this.$_formats.getPoint($format);
        $w = $sz.x - this.$lMargin;
        $h = $sz.y - this.$tMargin;
        if ($listOrientation == this.$LANDSCAPE) {
            $b = $w;
            $w = $h;
            $h = $b;
        }
        $N *= $h;
        $M *= $w;
        //var res:Object = {x:M, y:N, w:w, h:h};

        $res = {};
        $res.x = $M;
        $res.y = $N;
        $res.w = $w;
        $res.h = $h;
        return $res;
},
	/**
	 * @param int $x
	 * @param int $y
	 * @param string $format
	 * @param string $listOrientation
	*/
    getPageName : function($x, $y, $format, $listOrientation) {
        var $p, $_formats, $w, $lMargin, $rMargin, $h, $tMargin, $bMargin, $LANDSCAPE, $M, $N, $res;
        //self::_trace ("enter getPageName");

        //var p = formats.getPoint(format);

        $p = this.$_formats.getPoint($format);
        //echo "format = '{$format}'";

        //self::_trace ("post get Point");

        $w = $p.x  - (this.$lMargin + this.$rMargin);
        $h = $p.y  - (this.$tMargin + this.$bMargin);
        //self::_trace ("post recalc");

        if ($listOrientation == this.$LANDSCAPE) {
            $w = $p.y - (this.$tMargin + this.$bMargin);
            $h = $p.x - (this.$lMargin + this.$rMargin);
        }
        $M = Math.floor($x / $w);
        $N =  Math.floor($y / $h);
        //var res:String = String(N) + ":" + String(M);

        $res = strval($N) + ':' + strval($M);
        return $res;
},
	/** 
	 * @param array $arr
	 * @param string $item
	 * @return bool
	*/
	    noExist : function($arr, $item) {
        var $i, $length;
        $i = 0;
        $length = count($arr);
        while ($i < $length) {
            if ($arr[$i] == $item) {
                return false;
            }
            $i++;
        }
        return true;
},
	/**
	 * @description Для флеша переводил из Mm в пиксели
	 * @param double $pix
	 * @return double
	*/
	    toMm : function($pix) {
        
        //return round(($pix*20) / 56.7);

        return $pix;
},
	/**
	 * @description Для флеша переводил из пикселей в Mm
	 * @param double $mm
	 * @return double
	*/
	    toPix : function($mm) {
        
        //return ($mm * 56.7) / 20;

        return $mm;
},
	/**
	 * @description Определяет, надо ли рисовать рамку и "уголки" на страницах. 
	 * Если плоттер и стоит галка  "Не печатать рамку и уголки" вернет false
	 * @param {Boolean} isPlotFrameOff true когда стоит галка  "Не печатать рамку и уголки" вернет false
	 * @param {String} format 'plot'когда выбран плоттер
	 * @return Boolean
	*/
	isNeedDrawBorder:function(isPlotFrameOff, format) {
		var r = !(isPlotFrameOff && format == 'plot');
		if (format == 'plot') {
			//throw new Error('isNeedDrawBorder return ' + (r ? 'true' : 'false') + ', because format = ' + format + ', isPlotFrameOff = ' + (isPlotFrameOff ? 'true' : 'false') );
		}
		return r;
	}

	/*static public function rand(min:Number, max:Number):Number {	
		var v = Math.random();
		var ord = max.toString().length;
		v = Math.round( v * (ord + 1) * 10 ) % max;
		if (v < min) v = min;
		return v;
	}*/
};
