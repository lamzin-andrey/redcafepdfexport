/**
 * @param string $font
 * @param StdClass|int $size
 * @param StdClass|int $color
*/
function PTextFormat($font, $size, $textColor) {
	$font = $font ? $font : 'Arial';
	$size = $size ? $size : 12;
	$textColor = $textColor ? $textColor : 0x000000;
	/** @property $font */
	this.font = $font;
	/** @property $size */
	this.size = $size;
	/** @property $color */
	this.color = 1;
	/** @property $bold */
	this.bold = false;


	this.font  = $font ? $font : this.font;
	this.size  = $size ? $size : this.size;
	this.color = $textColor ? $textColor : this.color;
	
}
