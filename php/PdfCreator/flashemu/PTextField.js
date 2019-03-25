/** @depends PSprite.js      */
/** @depends  PTextFormat.js */
/** @depends  se2d.js        */

function PTextField() {
	this.initPSprite();
	/** @property _textWidth */
	this._textWidth = 0;
	/** @property _text */
	/** @property _textFormat */
	this._textFormat = new PTextFormat();
	//parent.__construct();				 //TODO ? initPSprite
	
	Object.defineProperty(this, "textWidth", {
		enumerable:true,
		get:function() {
			return this._textWidth;
		}
	});
	Object.defineProperty(this, "text", {
		enumerable:true,
		get:function() {
			return this._text;
		},
		set:function($value) {
			this._text = $value;
            this._textWidth = this._getTextWidth($value);
		}
	});
	
}
U.extend(PSprite, PTextField);
//PTextField.prototype = new PSprite();


PTextField.prototype.setPTextFormat = function($tf) {
	//this._textFormat = $tf;
	this._textFormat.font = $tf.font;
	this._textFormat.size = $tf.size;
	this._textFormat.color = $tf.color;
}
PTextField.prototype.getPTextFormat = function() {
	return this._textFormat;
}
PTextField.prototype._getTextWidth = function(a) {
	var b = SE2D.c;
	b.font = this._textFormat.size + "px " + this._textFormat.font;
	return b.measureText(a).width;
}
/**
 * @return array
*/
PTextField.prototype.toArrayParent = PTextField.prototype.toArray;
PTextField.prototype.toArray = function() {
	var $result;
	//$result = this.toArrayParent();
	$result = PTextField.superclass.toArray.call(this);
	$result['text'] = this._text;
	$result['textWidth'] = this._textWidth;
	$result['textFormat'] = {
		'font' : this._textFormat.font,
		'size' : this._textFormat.size,
		'color' : this._textFormat.color,
	};
	if (!window.ddbg) {
		window.ddbg = 1;
		//console.log($result);
	}
	return $result;
}

