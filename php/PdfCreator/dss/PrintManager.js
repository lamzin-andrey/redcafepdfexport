var PrintManager = {

	/** @property PrintJob $pj */
	
	/** @property Array $flashVars */
	
	/** @property SpriteMap $frames */
		//спрайты для распчатки 

	/** @property SpriteMap $framesDisplay */
		//спрайты для отображения 

	/** @property bool $firstLandscape */
		// принимает значение true когда первый раз в свойствах печати выбрано landscape

	/** @property PSprite $firstPage */
	
	/** @property PTextField $firstPageQuantityPTextField Для возможности указывать кол-во страниц */
	
	/** @property int $totalPages Инициализуется в preparePrint */
	
	/** @property String offsetYForQuantityPageText   Y координата для текста о количестве страниц */
	/** @property String pageWidthForQuantityPageText Ширина страницы для текста а количестве страниц */
	

	//Переменные использующиеся при генерации pdf (имеется ввиду генерация pdf во флеше)

		// принимает значение true когда твердо определились с landscape

		   //{w,h} размеры страницы в мм

	/** @property string $pageFormat */
		   //string value of format page

	
	/**
	* @param Object $o
	* @param PSprite $_sprite
	* @param bool $grid
	* @param string $outputFile полное имя pdf файла в который будем печатать
	* @param StdClass  $info {path, login, name, fileName, iPlotFrameOff}
	* @TODO return array {'view' => $view, c => quantityPages} || false
	*/
	preparePrint : function($o, $_sprite, $grid, $outputFile, $info) {
		
        var $pj, $listOrientation, $dumpObj, $format, $pageFormat, $fSize, $w, $h, $LANDSCAPE, $firstLandscape, $b, $firstPage, $pageOrientation, $_pageSize, $pageSize, $dO, $dx, $dy, $map, $mapView, $i, $length, $tr, $pages, $j, $pagesLength, $sprite, $sw, $printData, $color, $items, $itemsV, $view, $keys, $frames, $framesDisplay, $keysLength, $key, $str, $displayFrame, $borderPSprite, $frame, $padding, $start, $lMargin, $bMargin, $rMargin, $tMargin, $cornerWidth, $y, $x, $_w, $_h, $pixW, $pixH, $addWatermark, $text, $tfor, $totalPages, $canvas, $sc, $fon;
        this.$pj = new PrintJob($outputFile);
        if (this.$pj.start()) {
            $listOrientation = this.$pj.orientation;
            //TODO здесь записать в дамп displayFrames

            $dumpObj = {'view' : null, 'c' : 0};
            $format = PrintHelper.getFormat(this.$pj);	//получили формат бумаги А1, А2, А3 и т д
			
            PrintManager.$pageFormat = $format;
            //var fSize = PrintHelper.getFormatSize(format);

            $fSize = PrintHelper.getFormatSize($format);
            $w = $fSize.x;//210;

            $h = $fSize.y;//297;

            if ($listOrientation == PrintHelper.$LANDSCAPE) {
                this.$firstLandscape = true;
                $b = $w;
                $w = $h;
                $h = $b;
            } else {
                this.$firstLandscape = false;
            }
            if (isset($_POST, 'f') && $_POST['f'] != 'plot') {
                this._createFirstPage($info, $w, $h);
            } else {
                this.$firstPage = new PSprite();
            }
            PrintManager.$pageOrientation = $listOrientation;
            //PrintManager.pageSize = {w:w, h:h};

            $_pageSize = {};
            $_pageSize.w = $w;
            $_pageSize.h = $h;
            PrintManager.$pageSize = $_pageSize;
            $dO = PrintHelper.getDelta($o.lines);
            $dx = $dO.dx;
            $dy = $dO.dy;
            $map     = new SpriteMap();
            $mapView = new SpriteMap();
            $i = 0;
            $length = count($o.lines);
            
            while ($i < $length) {
                //PrintHelper.getPages возвращает массив номеров страниц. Номер страницы представляет собой строку "N:M"
                //	где  N - номер строки прямоугольной таблицы, M - номер столбца
                $tr = false;
                $pages = PrintHelper.getPages($format, $o.lines[$i], $listOrientation, $dO);
                //Рисуем все страницы
                $j = 0;
                $pagesLength = count($pages);
                //console.log('$pagesLength ' + $pagesLength);
                while ($j < $pagesLength) {
                    $sprite = $map.getSprite($pages[$j]);
                    
                    $sw     = $mapView.getSprite($pages[$j]);
                    //PrintHelper.getData возвращает объект с полями аналогичными o.lines[i],
                    //но пересчитанными в соответствии с форматом листа, его номером и его положением
                    //var printData = PrintHelper.getData(format, o.lines[i], listOrientation, pages[j]);
                    $printData = PrintHelper.getData($format, $o.lines[$i], $listOrientation, $pages[$j]);
                    if (!$printData) {
                        $j++;
                        continue;
                    }
                    
                    $color = 0x111111;
                    $sprite.graphics.lineStyle(4, $color); //это страницы

                    $sprite.graphics.moveTo($printData.startX, $printData.startY);
                    $sprite.graphics.lineTo($printData.endX, $printData.endY);
                    
                    $sw.graphics.lineStyle(3, $printData.color); //это превью

                    $sw.graphics.moveTo(PrintHelper.toPix($printData.startX), PrintHelper.toPix($printData.startY));
                    $sw.graphics.lineTo(PrintHelper.toPix($printData.endX), PrintHelper.toPix($printData.endY));
                    $j++;
                    //console.log($sprite);
                }
                $i++;
            }
            //var items:Array = map.getAllSprites();

            $items  = $map.getAllSprites();
            
            //console.log('$items');
            //console.log($items);
            $itemsV = $mapView.getAllSprites();
            //var view:PSprite = new PSprite();

            $view = new PSprite();
            $keys = $map.getKeys();
            //console.log('$keys:');
            //console.log($keys);
            this.$frames = new SpriteMap();
            this.$framesDisplay = new SpriteMap();
            $keysLength = count($keys);
            //console.log('$keysLength ' + $keysLength);
            for ($i = 0; $i < $keysLength; $i++ ) {
                $key = $keys[$i];
                $str = PrintHelper.toObject($key);
                
                $displayFrame = this.$framesDisplay.getSprite($keys[$i]);
                
                //console.log('x = ' +  $displayFrame.x);
                $displayFrame.x = PrintHelper.toObject($keys[$i]).x * $w + $str.x * 25 + 24;
                //console.log('x = ' +  $displayFrame.x);
                //console.log($displayFrame._childs);
                $displayFrame.y = PrintHelper.toObject($keys[$i]).y * $h + $str.y * 25 + 24;
                
                //GOOD
                $borderPSprite = new PSprite();
                
                
                //if (PrintHelper.isNeedDrawBorder($info.iPlotFrameOff, $format)) {
					$borderPSprite.graphics.lineStyle(1, 0xFF0000);
					$borderPSprite.graphics.drawRect(0, 0, PrintHelper.toPix($w), PrintHelper.toPix($h));
					$displayFrame.addChild($borderPSprite);
				//}
                
                
                //console.log($itemsV[$i]);
                
                $displayFrame.addChild($itemsV[$i]);
                
                //BAD
                $view.addChild($displayFrame);
                
                //var frame:PSprite = frames.getSprite(keys[i]);	

                $frame = this.$frames.getSprite($keys[$i]);
                
                
                
                //$frame->graphics->beginFill(0xFFFFFF);

                $frame.graphics.drawRect(0, 0, PrintHelper.toPix($w), PrintHelper.toPix($h));
                //$frame->graphics->endFill();

                $frame.graphics.lineStyle(1, 0x555555);
                //отрисовка рамки
                $padding = 0;
				if (PrintHelper.isNeedDrawBorder($info.iPlotFrameOff, $format)) {
					//горизонт.

					
					//with (frame.graphics) {

					$start = PrintHelper.toPix(PrintHelper.$lMargin - $padding);
					$frame.graphics.moveTo($start, PrintHelper.toPix($h - PrintHelper.$bMargin + $padding));
					$frame.graphics.lineTo(PrintHelper.toPix($w - PrintHelper.$rMargin + $padding), PrintHelper.toPix($h - PrintHelper.$bMargin + $padding));
					$frame.graphics.moveTo($start, PrintHelper.toPix(PrintHelper.$tMargin - $padding));
					$frame.graphics.lineTo(PrintHelper.toPix($w - PrintHelper.$rMargin + $padding), PrintHelper.toPix(PrintHelper.$tMargin - $padding));
					
					//corners

					$cornerWidth = -1;
					//близко к исходному

					//$frame->graphics->lineStyle(0.25, 0xFF0000, 0, false, LineScaleMode.NORMAL, CapsStyle.SQUARE);

					//скорее всего ни на что не повлияет

					$frame.graphics.lineStyle(0.25, 0xFF0000);
					$y = $h - PrintHelper.$bMargin + $padding;
					$frame.graphics.beginFill(0x111111);
					$frame.graphics.drawRect($start, $y, 15, $cornerWidth);
					$frame.graphics.endFill();
					$frame.graphics.beginFill(0x111111);
					$frame.graphics.drawRect($w - PrintHelper.$rMargin + $padding - 15, $y, 15, $cornerWidth);
					$frame.graphics.endFill();
					
					$y = PrintHelper.$tMargin - $padding;
					$frame.graphics.beginFill(0x111111);
					$frame.graphics.drawRect($start, $y, 15, -1 * $cornerWidth);
					$frame.graphics.endFill();
					$frame.graphics.beginFill(0x111111);
					$frame.graphics.drawRect($w - PrintHelper.$rMargin + $padding - 15, $y, 15, $cornerWidth);
					$frame.graphics.endFill();
					//}

					//верт

					//with (frame.graphics) {

					$frame.graphics.lineStyle(1, 0x555555);
					$start = PrintHelper.toPix(PrintHelper.$tMargin - $padding);
					$frame.graphics.moveTo($w - PrintHelper.$rMargin + $padding, $start);
					$frame.graphics.lineTo($w - PrintHelper.$rMargin + $padding, $h - PrintHelper.$bMargin + $padding);
					$frame.graphics.moveTo(PrintHelper.$lMargin - $padding, $start);
					$frame.graphics.lineTo(PrintHelper.$lMargin - $padding, $h - PrintHelper.$bMargin + $padding);
					
					//corners

					$frame.graphics.lineStyle(0.25, 0xFF0000 /*, 0, false, LineScaleMode.NORMAL, CapsStyle.SQUARE*/);
					$x = $w - PrintHelper.$rMargin + $padding;
					$frame.graphics.beginFill(0x111111);
					$frame.graphics.drawRect($x, $start,  $cornerWidth, 15);//TODO attention

					$frame.graphics.endFill();
					
					$frame.graphics.beginFill(0x111111);
					$frame.graphics.drawRect($x, $h - PrintHelper.$bMargin + $padding - 15,  $cornerWidth, PrintHelper.toPix(15));
					$frame.graphics.endFill();
					$x = PrintHelper.toPix(PrintHelper.$lMargin - $padding);
					$frame.graphics.beginFill(0x111111);
					$frame.graphics.drawRect($x, $start, $cornerWidth, 15);
					$frame.graphics.endFill();
					$frame.graphics.beginFill(0x111111);
					$frame.graphics.drawRect($x, PrintHelper.toPix($h - PrintHelper.$bMargin + $padding - 15), $cornerWidth, PrintHelper.toPix(15));
					$frame.graphics.endFill();
				}					

                
                $_w = $w - (PrintHelper.$rMargin);
                $_h = $h - (PrintHelper.$bMargin);
                $pixW = PrintHelper.toPix($_w);
                $pixH = PrintHelper.toPix($_h);
                
                
                if ($grid) {
                    PrintHelper.$addWatermark = true;
                    PrintHelper.drawGrid($frame, $pixW, $pixH, PrintHelper.toPix(10), 0xA5A5A5, $keys[$i], $_w, $_h);
                }
                
                try {
					var $txt = new PTextField();
				} catch (e) {
					alert(e);
				}
                //$text.text = this.incIndexes($keys[$i], false);
                //$tfor = $text.getPTextFormat();
                //$tfor.size += 1;
                //$text.setPTextFormat($tfor);
                $items[$i].x += PrintHelper.$lMargin + $padding;
                $items[$i].y += PrintHelper.$tMargin + $padding;
                $frame.pageNumber = this.incIndexes($keys[$i]);
                //$text.y = $items[$i].y + 2;
                //$text.x = $items[$i].x + 1;
                //console.log('before call ad childs');
                //console.log($items[$i]);
                $frame.addChild($items[$i]);
                //$frame.addChild($txt);
            }
            
            this.$totalPages = $dumpObj['c']    = $view.numChildren;
            var tempOffsetYObj = {v:this.offsetYForQuantityPageText};
            this._addPairText(this.$firstPage, "Кол-во листов / Pages", String(this.$totalPages), tempOffsetYObj, this.pageWidthForQuantityPageText, 'firstPageQuantityPTextField');
            //PrintHelper._trace("exit", true);

            $canvas = new PSprite();
            $canvas.addChild($view);
            
            $view.x = 5;
            $view.y = 5;
            $view.name = 'viewClip';
            $sc = $_sprite.width / ($canvas.width + 50);
            //TODO js self::_addGreenCheckBox($sc);

            $canvas.width  *= $sc;
            $canvas.height *= $sc;
            this._setPagesNumber();
            //TODO js self::_setPagesNumber();


            $dumpObj['view'] = $view.toArray();

            $fon = new PSprite();
            $fon.graphics.beginFill(0xF0F0F0);
            $fon.graphics.drawRect(0, 0, $canvas.width + 70, $canvas.height + 50);
            $fon.graphics.endFill();
            $_sprite.addChild($fon);
            $_sprite.addChild($canvas);
            
            return $dumpObj;
            }//end if pj.start

        return false;
},
	/**
	 * @param string $s
	*/
	    incIndexes : function($s, $incremetFirstNumber) {
        var $arr, $m, $n, q;
        //var arr = s.split(":");
        $incremetFirstNumber = String($incremetFirstNumber) === 'undefined' ? true : $incremetFirstNumber;

        $arr = explode(':', $s);
        $m = intval($arr[0]);
        $n = intval($arr[1]);
        $n++;
        if ($incremetFirstNumber) {
			$m++;
		}
        q = strval($m) + ':' + strval($n);
        
        return q;
},
	    _setPagesNumber : function() {
        var $pageInfo, $framesDisplay, $items, $j, $length, $i, $key, $sprite, $child;
        //var pageInfo = new PageOrderHelper(framesDisplay);

        $pageInfo = new PageOrderHelper(this.$framesDisplay);
        $items = $pageInfo.getArray();
        $j = 1;
        $length = count($items);
        for ($i = 1; $i < $length; $i++) {
            $key = $items[$i];
            if ($key != '-1') {
                $sprite = this.$framesDisplay.getSprite($key);
                $child = $sprite.getChildAt($sprite.numChildren - 1);
                if ($child.name != 'pageNumber')  {
                    this._createPageNumber($sprite, $j);
                    $j++;
                }
            }
        }
},
	/**
	 * @param PSprite $sprite
	 * @param int $value
	*/
	    _createPageNumber : function($sprite, $value) {
				var $s, $pageNumber;
				$s  = strval($value);
				$pageNumber = new PTextField();
				$pageNumber.text   = $s ;
				$sprite.addChild($pageNumber);
		},
	    __print : function($pagesNumber) {
        
        this.printPages($pagesNumber);
},
	/**
	 * @param array $pagesNumber [1 => 1, 2 => 1] ключ - номер страницы, 1 - печатать ли. В нулевом элементе может быть ALL
	*/
	    printPages : function($pagesNumber) {
        var $c, $totalPages, $isPlotter, $firstPageQuantityPTextField, $pj, $firstPage, $pageInfo, $frames, $items, $length, $i, $key, $frame, $PORTRAIT, $firstLandscape,
			pageNumberX = 6,pageNumberY = 7;
        
        $c = (isset($pagesNumber,"0") && $pagesNumber[0] == 'ALL') ? this.$totalPages : count($pagesNumber);
        $isPlotter = isset($_POST, 'f') && $_POST['f'] == 'plot';
        if (!$isPlotter) {
            this.$pj.addPage(this.$firstPage);
        }
        //var pageInfo = new PageOrderHelper(frames);

        $pageInfo = new PageOrderHelper(this.$frames);
        $items = $pageInfo.getArray();
        $length = count($items);
        for ($i = 1; $i < $length; $i++ ) {
            $key = $items[$i];
            $frame = this.$frames.getSprite($key);
            if (isset($pagesNumber,'0') && $pagesNumber[0] == "ALL") {
                if (this.$pj.orientation == PrintHelper.$PORTRAIT && this.$firstLandscape == true) {
                    $frame.rotation += 90;
                    this._setHalfLandscapeMarkers($frame, $key, $items);
                    } else if (this.$pj.orientation) { //иначе при повороте все плывет куда-то, устранить удалось н все равно маркеры не выводились

                    this._drawTopMarker($key, $frame, $items);
                    this._drawBtmMarker($key, $frame, $items);
                    this._drawLeftMarker($key, $frame, $items);
                    this._drawRightMarker($key, $frame, $items);
                }
                if ($key != '-1') {
					var $txt = new PTextField();
					$txt.text = $frame.pageNumber;
					$txt.x = pageNumberX;
					$txt.y = pageNumberY;
					$frame.addChild($txt);
                    this.$pj.addPage($frame);
                }
                } else if (($key != '-1') && isset($pagesNumber, $i) && $pagesNumber[$i] == 1) {
                if (this.$pj.orientation == PrintHelper.$PORTRAIT && this.$firstLandscape == true) {
                    $frame.rotation += 90;
                    this._setHalfLandscapeMarkers($frame, $key, $items);
                    } else if (this.$pj.orientation) { //иначе при повороте все плывет куда-то, устранить удалось н все равно маркеры не выводились

                    this._drawTopMarker($key, $frame, $items);
                    this._drawBtmMarker($key, $frame, $items);
                    this._drawLeftMarker($key, $frame, $items);
                    this._drawRightMarker($key, $frame, $items);
                }
                var $txt = new PTextField();
                $txt.text = $frame.pageNumber;
                $txt.x = pageNumberX;
                $txt.y = pageNumberY;
                $frame.addChild($txt);
                this.$pj.addPage($frame);
                
            }
            
        }
        this.$pj.send();
},
	/**
	 * @param string $key
    */
	    _setHalfLandscapeMarkers : function($frame, $key, $items) {
        var $s, $pNsPr, $id, $rMargin, $lMargin, $tMargin, $bMargin;
        //page number

        $s = this.incIndexes($key);
        $pNsPr = new PSprite();
        this._strToBitmap($pNsPr, $s);
        $pNsPr.x = 10;
        $frame.addChild($pNsPr);
        //right

        $id = this.toObj($key);
        $s = intval($id.m - 1) + ':' + $id.n;
        if (this.IDExist($items, $s)) {
            this.setVerticalArrowEx($s, $frame, PrintHelper.toPix(5 + PrintHelper.$rMargin), 0);
        }
        //left

        $id = this.toObj($key);
        $s = intval($id.m + 1) + ':' + $id.n;
        if (this.IDExist($items, $s)) {
            this.setVerticalArrowEx($s, $frame, $frame.height - PrintHelper.toPix(5 + PrintHelper.$lMargin), 180);
        }
        //top

        $id = this.toObj($key);
        $s = $id.m + ':' + intval($id.n - 1);
        if (this.IDExist($items, $s)) {
            this.setHorizontalArrowEx($s, $frame, PrintHelper.toPix(5 + PrintHelper.$tMargin), -90);
        }
        //bottom

        $id = this.toObj($key);
        $s = $id.m + ':' + intval($id.n + 1);
        if (this.IDExist($items, $s)) {
            this.setHorizontalArrowEx($s, $frame, $frame.height - PrintHelper.toPix(17 + PrintHelper.$bMargin), 90);
        }
},
	    IDExist : function($keys, $ID) {
        var $length, $i;
        $length = count($keys);
        for ($i = 0; $i < $length; $i++ ) {
            if ($keys[$i] == $ID) {
                return true;
            }
        }
        return false;
},
	/**
	 * @param string $s
	 * @return StdClass {m,n}
	*/
	    toObj : function($s) {
        var $pair, $m, $n, $ret;
        $pair = explode(':', $s);
        $m = intval($pair[0]);
        $n = intval($pair[1]);
        //var ret = { m:m, n:n };

        $ret = {};
        $ret.m = $m;
        $ret.n = $n;
        return $ret;
},
	
	    setVerticalArrow : function($s, $sprite, $y, $degree) {
        var $tfl, $tf, $spr, $arrow;
        $tfl = new PTextField();
        $tfl.text = this.incIndexes($s);
        $tf = new PTextFormat();
        $tf.size = 12;
        $tfl.setPTextFormat($tf);
        $spr = new PSprite();
        $arrow = new Arrow();
        $arrow.rotation += $degree;
        
        $spr.addChild($arrow);
        $tfl.x = $arrow.x - 0.5;
        $tfl.y = $arrow.y - 3.5;//TODO attention

        $spr.addChild($tfl);
        $spr.x = ($sprite.width /*- $spr->width*/) / 2;
        $spr.y = $y;
        $sprite.addChild($spr);
        
        return $spr;
},
	
	
	    setVerticalArrowEx : function($s, $sprite, $y, $degree) {
        var $tfl, $spr, $arrow;
        $s = this.incIndexes($s);
        $tfl = new PSprite();
        this._strToBitmap($tfl, $s);
        $spr = new PSprite();
        $arrow = new Arrow();
        $arrow.rotation += $degree;
        if ($degree != 0) {
            $arrow.y += $arrow.height;
        }
        
        $spr.addChild($arrow);
        $tfl.x += $arrow.x + $arrow.width;
        
        $tfl.y -= 5;
        $spr.addChild($tfl);
        $spr.x = ($sprite.height /*- $spr->width*/) / 2;
        return;
        $spr.y = $y;
        $sprite.addChild($spr);
        return $spr;
},
	/** TODO пока что пробуем заменить на PTextField
	 * @param string $s
	*/
	    _strToBitmap : function($sprite, $s) {
        var $tf;
        /*var offset = 0;
		for (var i = 0; i < s.length; i++ ) {
			var sp = null;
			switch (s.charAt(i)) {
				case "0":
					sp = new f0();
					break;
				case "1":
					sp = new f1();
					break;
				case "2":
					sp = new f2();
					break;
				case "3":
					sp = new f3();
					break;
				case "4":
					sp = new f4();
					break;
				case "5":
					sp = new f5();
					break;
				case "6":
					sp = new f6();
					break;
				case "7":
					sp = new f7();
					break;
				case "8":
					sp = new f8();
					break;
				case "9":
					sp = new f9();
					break;
				case ":":
					sp = new fw();
					break;
			}
			if (sp != null) {
				sp.x = offset;
				sprite.addChild(sp);
				offset += sp.width + 2;
				sp = null;
			}
		}*/
        $tf = new PTextField();
        $tf.text = $s;
        $sprite.addChild($tf);
},
	
	    setHorizontalArrowEx : function($s, $sprite, $x, $degree) {
        var $tfl, $spr, $arrow;
        $s = this.incIndexes($s);
        $tfl = new PSprite();
        this._strToBitmap($tfl, $s);
        $spr = new PSprite();
        $arrow = new Arrow();
        $arrow.rotation += $degree;
        if ($degree > 0) {
            $arrow.x += $arrow.width * 2;
        }
        $spr.addChild($arrow);
        $tfl.y += $arrow.y + $arrow.height - 3;
        $spr.addChild($tfl);
        $spr.x = $x;
        $spr.y = ($sprite.width - $spr.height) / 2;
        $sprite.addChild($spr);
        return $spr;
},
	
	    setHorizontalArrow : function($s, $sprite, $x, $degree) {
        var $tfl, $tf, $spr, $arrow;
        $tfl = new PTextField();
        $tfl.text = this.incIndexes($s);
        $tf = new PTextFormat();
        $tf.size = 12;
        /*if (degree == 90) tf.color = 0x00aa00;
			 else tf.color = 0xaaaa00;*/
        $tfl.setPTextFormat($tf);
        $spr = new PSprite();
        $arrow = new Arrow();
        
        $arrow.rotation += $degree;
        if ($degree > 0) {
            $arrow.x += 1;
        }
        $spr.addChild($arrow);
        $tfl.y = $arrow.y + 4;
        $spr.addChild($tfl);
        $spr.x = $x;
        $spr.y = ($sprite.height - $spr.height) / 2;
        $sprite.addChild($spr);
        return $spr;
},
	
	    _drawTopMarker : function($ID, $sprite, $keys) {
        var $id, $s, $tMargin;
        $id = this.toObj($ID);
        $s = $id.m - 1 + ':' + $id.n;
        if (this.IDExist($keys, $s)) {
            this.setVerticalArrow($s, $sprite, (PrintHelper.$tMargin + 6), 0);
        }
},
	
	    _drawBtmMarker : function($ID, $sprite, $keys) {
        var $id, $s, $bMargin;
        $id = this.toObj($ID);
        $s = $id.m + 1 + ':' + $id.n;
        if (this.IDExist($keys, $s)) {
            this.setVerticalArrow($s, $sprite, $sprite.height - (24 + PrintHelper.$bMargin), 180);
        }
},
	
	    _drawLeftMarker : function($ID, $sprite, $keys) {
        var $id, $s;
        $id = this.toObj($ID);
        $s = $id.m + ':' + intval($id.n - 1);
        if (this.IDExist($keys, $s)) {
            this.setHorizontalArrow($s, $sprite, 12, -90);
        }
},
	
	    _drawRightMarker : function($ID, $sprite, $keys) {
        var $id, $s, $rMargin;
        $id = this.toObj($ID);
        $s = $id.m + ':' + intval($id.n + 1);
        if (this.IDExist($keys, $s)) {
            this.setHorizontalArrow($s, $sprite, $sprite.width - (PrintHelper.$rMargin) - 6, 90);
        }
},
	
	    getPrintJob : function() {
        var $pj;
        return this.$pj;
},
	    getQuantityPages : function($o) {
        var $LANDSCAPE, $PORTRAIT, $args, $format, $dObj, $listOrientation, $pagesCounterObj, $count, $i, $length, $pages, $j, $sz, $key;
        PrintHelper.$LANDSCAPE = PrintHelper.LANDSCAPE;
        PrintHelper.$PORTRAIT  = PrintHelper.PORTRAIT;
        //$args = {pageWidth:PrintHelper::toPix(210), paperWidth:PrintHelper::toPix(210), pageHeight:PrintHelper::toPix(297), paperHeight:PrintHelper::toPix(297), orientation : 'portrait'}

        $args = {};
        $args.pageWidth   = PrintHelper.toPix(210);
        $args.paperWidth  = PrintHelper.toPix(210);
        $args.pageHeight  = PrintHelper.toPix(297);
        $args.paperHeight = PrintHelper.toPix(297);
        $args.orientation = PrintHelper.PORTRAIT;
        $format = PrintHelper.getFormat($args);
        console.log('$format');
        console.log($format);
        $dObj   = PrintHelper.getDelta($o.lines);
        $listOrientation = PrintHelper.PORTRAIT;
        $pagesCounterObj = {};
        $count = 0;
        $i = 0;
        $length = count($o.lines);
        console.log('o.lines');
        console.log(o.lines);
        
        while ($i < $length) {
            //PrintHelper.getPages возвращает массив номеров страниц. Номер страницы представляет собой строку "N:M"

            //	где  N - номер строки прямоугольной таблицы, M - номер столбца

            $pages = PrintHelper.getPages($format, $o.lines[$i], $listOrientation, $dObj);
            //Рисуем все страницы

            $j = 0;
            $sz = count($pages);
            while ($j < $sz) {
                //if (!pagesCounterObj[ pages[j] ]) {

                $key = $pages[$j];
                if (!isset($pagesCounterObj, $key)) {
                    $count++;
                    $pagesCounterObj[$key] = 1;
                }
                $j++;
            }
            $i++;
        }
        return $count;
},
	/*
	 * @param StdClass  $info {path, login, name, fileName}
	*/
	    _createFirstPage : function($info, $pageWidth, $pageHeight) {
        var $s, $offsetY, $pj, $squareSide, $topLeftX, $topLeftY, $q, $firstPage;
        //die( $info->fileName );

        $s = new PSprite();
        //$s.graphics.drawRect(0, 0, $pageWidth, $pageHeight);
        $offsetY = {v:10};
        var sDate = $('#iDateVal').val().trim() ? $('#iDateVal').val().trim() : $info.date;
        var sFilename = $('#iFilenameVal').val().trim() ? $('#iFilenameVal').val().trim() : $info.fileName;
        
        this._addPairText($s, $('#iDateLabel').val(), sDate, $offsetY, $pageWidth);
        this._addPairText($s, $('#iFilenameLabel').val(), sFilename, $offsetY, $pageWidth);
        this._addPairText($s, "Формат / Format", this.$pj.getFormat(), $offsetY, $pageWidth);
        this.offsetYForQuantityPageText = $offsetY.v;
        this.pageWidthForQuantityPageText = $pageWidth;
        
        //Тут ранее выводился текст о количестве страниц, попробуем сделать это, когда количество страниц станет известно
        this._addPairText($s, ' ', ' ', $offsetY, $pageWidth, 'firstPageQuantityPTextField');
        //а это выводим на всякий случай
        
        if (this.$pj.getFormat() != 'A5') {
            $pageWidth = 210;
        }
        $squareSide = 80;
        $topLeftX = round( ($pageWidth - $squareSide) / 2);
        $topLeftY = $offsetY.v + 10;
        $s.graphics.moveTo($topLeftX, $topLeftY);
        $s.graphics.lineTo($topLeftX + $squareSide, $topLeftY);
        $s.graphics.lineTo($topLeftX + $squareSide, $topLeftY + $squareSide);
        $s.graphics.lineTo($topLeftX, $topLeftY + $squareSide);
        $s.graphics.lineTo($topLeftX, $topLeftY);
        
        this._addTextOnCenter($s, 'Тестовый квадрат', $pageWidth, $topLeftY +  10, 1,   10,1,60);
        this._addTextOnCenter($s, 'Test square', $pageWidth, $topLeftY +  20, 1,   10,1,47);
        $q = $squareSide / 10;
        this._addTextOnCenter($s, $q + "x" + $q + " CM", $pageWidth, $topLeftY +  30, 1, 20,   1,65);
        
        
        this._addTextOnCenter($s, 'ВАЖНО', $pageWidth, $topLeftY + $squareSide + 10, 1, 20,    1,65);
        this._addTextOnCenter($s, 'При печати этого PDF файла «Масштабирование страницы» или «Page scaling»', $pageWidth, $topLeftY + $squareSide + 30, false, 10, 1, 200);
        this._addTextOnCenter($s, 'должно быть равно «Нет» или «No»', $pageWidth, $topLeftY + $squareSide + 35, false, 10, 1, 105);
        this._addTextOnCenter($s, 'Печать производите в «Истинный размер» или «Actual size»', $pageWidth, $topLeftY + $squareSide + 45, false, 10, 1, 170);
        
        this._addTextOnCenter($s, 'Подробнее смотрите в разделе «Помощь» - «Печать PDF файлов»', $pageWidth, $topLeftY + $squareSide + 55, 0, 10, 0xC0C0C0, 210);
        
        
        this.$firstPage = $s;
},
	_addTextOnCenter : function($sprite, $text, $pageWidth, $y, $isBold, $size, $color, $dx) {
		$isBold = String($isBold) != 'undefined' ? $isBold : false;
		$size = $size ? $size : 10;
		$color = $color ? $color : 1;
		$dx = String($dx) != 'undefined' ? $dx : 0;
        var $t, $tf, $tW;
        $t = new PTextField();
        $tf = $t.getPTextFormat();
        $tf.font = 'Arial';
        $tf.size = $size;
        $tf.color = $color;
        $tf.bold = false;
        if ($isBold) {
            $tf.bold = true;
            $tf.font = 'ArialBold';
        }
        $t.setPTextFormat($tf);
        $t.text = cp1251_codes($text);
        $tW = $t.textWidth;
        $tW = ($tW*20)/56.7;
        $t.x = round( ($pageWidth - $tW) / 2 ) + $dx;
        $t.y = $y;
        $sprite.addChild($t);
	},
	/**
	 * @param $textFieldVarName переменная, в которую сохраниться ссылка на ообъект текстфилда
	*/
	_addPairText : function($sprite, $legend, $text, $oOffsetY, $pageWidth, $textFieldVarName) {
		$textFieldVarName = String($textFieldVarName) != 'undefined' ? $textFieldVarName : null;
        var $tfLabel, $tfData, $tf, $margin, $lMargin, $textFieldVarName, $offsetY;
        $offsetY = $oOffsetY.v;
        $tfLabel = new PTextField();
        $tfData  = new PTextField();
        
        $tfLabel.text = cp1251_codes($legend);
        $tfData.text =  cp1251_codes($text);
        $tf = $tfData.getPTextFormat();
        $tf.font = 'Arial';
        $tf.size = 10;
        $tf.bold = false;
        $tfData.setPTextFormat($tf);
        //$tf->font = 'ArialBold';

        //$tf->bold = true;

        $tfLabel.setPTextFormat($tf);
        
        $margin = -5;
        $lMargin = 50;
        $tfLabel.x = 20;//round( ($pageWidth - $tfLabel->textWidth) / 2 );

        $tfLabel.y = $offsetY;
        $tfData.y = $offsetY;//round( ($pageHeight - 3 * (14 + $margin)) / 2 );

        $tfData.x = $tfLabel.x + $lMargin;
        
        $sprite.addChild($tfLabel);
        $sprite.addChild($tfData);
        $offsetY += $tf.size + $margin;
        if ($textFieldVarName) {
            this.$textFieldVarName = $tfData;
        }
        $oOffsetY.v = $offsetY;
	},
	
	    getOutputFile : function() {
        var $pj;
        return this.$pj.getDest();
}

};
