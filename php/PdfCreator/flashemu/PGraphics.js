PGraphics.TYPE_POINT = 1;
PGraphics.TYPE_RECT  = 2;
function PGraphics($parent) {
	/** @property array $_objects Содержит объекты (ассоциативные массивы) типа точки линий и четырехугольники
     * item[type=TYPE_POINT]: type, x, y, color, fill_color, thikness, is_start, is_begin_fill, is_end_fill
     * *  is_start 1 если был вызван moveTo
     * item[type=TYPE_RECT] : type, x, y, w, h, color, fill_color, thikness
    */
	this._objects = [];
	/** @property $_last_object */
	this._last_object = null;
	 //для удобства проверки, что там у нас
	/** @property int $color Текущий цвет */
	this._color = 0x000001;
	/** @property int $_fill_color Текущий цвет заливки*/
	this._fill_color = 0xFFFFFF;
	/** @property double $_thikness Текущая толщина */
	this._thikness = 0.25;
	
	//все тоже для нового
	/** @property int $_new_color Новый цвет */
	this._new_color = null;
	/** @property int $_new_fill_color Новый цвет заливки*/
	/** @property $_new_thikness Новая толщина */
	/** @property $_is_begin_fill True if begin */
	this._is_begin_fill = false;
	/** @property  bool $_is_end_fill True if end */
	this._is_end_fill = false;
	/** @property  PSprite $_parent ссылка на отображаемый объект, с целью вычислять его размер при отрисовке линий*/
	this._parent = $parent;
	
	this.TYPE_POINT = 1;
    this.TYPE_RECT  = 2;
	
}
PGraphics.prototype = {
        lineTo : function($x, $y) {
			var $o, $t, $clr, $thi, $item;
			$o = this._last_object;
			if (!$o) {
				throw new Error('need call moveTo before drawLine');
			}
			if ($o['type'] == this.TYPE_RECT) {
				throw new Error('need call moveTo before drawRect');
			}
			$t = this.TYPE_POINT;
			
			var oColor = {};
			var oTh = {};
			this._applyLineStyle(oColor, oTh);
			$clr = oColor.v;
			$thi = oTh.v
			
			//this._applyLineStyle($clr, $thi);
			if ($clr == $o['color']) {
				$clr = null;
			}
			if ($thi == $o['thikness']) {
				$thi = null;
			}
			if (this._parent.width < $x) {
				this._parent.width = $x;
			}
			if (this._parent.height < $y) {
				this._parent.height = $y;
			}
			$item = this._createPoint($t, $x, $y, $clr, $thi);
			this._last_object = $item;
			this._objects.push($item);
	},
    /** Тупо берет последнюю точку в массиве, и если она is_start, перезаписывает ее, иначе добавляет новую в массив*/
        moveTo : function($x, $y) {
			var $t, $clr, $thi, $point, $o;
			$t = this.TYPE_POINT;
			
			var oColor = {};
			var oTh = {};
			this._applyLineStyle(oColor, oTh);
			$clr = oColor.v;
			$thi = oTh.v
			//this._applyLineStyle($clr, $thi);
			
			
			$point = this._createPoint($t, $x, $y, $clr, $thi, true);
			$o = this._last_object;
			this._objects.push($point);
			this._last_object = $point;
		},
        drawRect : function($x, $y, $width, $height) {
			var $o;
			//item[type=TYPE_RECT] : type, x, y, w, h, color, fill_color, thikness

			$o = {
				'type' : this.TYPE_RECT,
				'x'    : $x,
				'y'    : $y,
				'w'    : $width,
				'h'    : $height,
				'color' : this._color,
				'thikness' : this._thikness,
				'fill_color' : this._is_begin_fill && !this._is_end_fill ?  this._fill_color : false
			};
			this._objects.push($o);
			this._last_object =  $o;
			
			if (this._parent.width < $x + $width) {
				this._parent.width = $x + $width;
			}
			if (this._parent.height < $y + $height) {
				this._parent.height = $y + $height;
			}
		},
        beginFill : function($color) {
			this._fill_color = $color;
			this._is_begin_fill = true;
			this._is_end_fill   = false;
		},
        setLineStyle : function($thikness, $color) {
			this._new_color = $color;
			this._new_thikness = $thikness;
		},
		/***
		 * @param float $thikness
		 * @param uint  $color
		 * @param float $alpha
		 * @param boolean $pixelHinting = false
		 * @param string $scaleMode = 'normal'
		 * @param string $caps = null
		 * @param string $joints = null
		 * @param int $miterLimit = 3
		 * @return void
		*/
        lineStyle : function($thikness, $color) {
			this.setLineStyle($thikness, $color);
		},
        endFill : function() {
			this._is_end_fill = true;
			if (isset(this, "_objects", String(count(this._objects) -  1), 'is_end_fill')) {
				this._objects[count(this._objects) - 1]['is_end_fill'] = true;
			}
		},
    
        _applyLineStyle : function($oColor, $oThikness) {
			if (this._new_color && this._new_color != this._color) {
				$oColor.v = this._color = this._new_color;
				this._new_color = null;
			} else {
				$oColor.v = this._color;
			}
			
			if (this._new_thikness && this._new_thikness != this._thikness) {
				$oThikness.v = this._thikness = this._new_thikness;
				this._new_thikness = null;
			} else {
				$oThikness.v = this._thikness;
			}
		},
    
        _createPoint : function($type, $x, $y, $color, $thikness, $is_start, $is_begin_fill, $is_end_fill) {
			$color = String($color) == 'undefined' ? null : $color;
			$thikness = String($thikness) == 'undefined' ? null : $thikness;
			$is_start = String($is_start) == 'undefined' ? false : $is_start;
			$is_begin_fill = String($is_begin_fill) == 'undefined' ? false : $is_begin_fill;
			$is_end_fill = String($is_end_fill) == 'undefined' ? false : $is_end_fill;
			var $fill_color, $o;
			if (!$is_begin_fill) {
				$is_begin_fill = this._is_begin_fill;
				this._is_begin_fill = false;
			}
			
			$fill_color = false;
			if (this._last_object && this._last_object['fill_color'] != this._fill_color) {
				$fill_color = this._fill_color;
			}
			$o = {
				'type' : $type,
				'x'    : $x,
				'y'    : $y,
				'color'    : $color,
				'fill_color'    : $fill_color,
				'thikness' : $thikness,
				'is_start' : $is_start,
				'is_begin_fill' : $is_begin_fill,
				'is_end_fill' : $is_end_fill
				};
			return $o;
		}

    
};
