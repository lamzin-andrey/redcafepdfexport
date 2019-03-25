function Arrow() {
	this.initPSprite();
	this.bitmap = Qt.appDir() + '/php/PdfCreator/fpdf17/0.png';
	var $size;
	if (file_exists(this.bitmap)) {
		$size = getimagesize(this.bitmap);
		if (is_array($size) && $size[0]) {
			this.width  = $size[0];
			this.height = $size[1];
		} else {
			throw new Error('Bad bitmap');
		}
	} else {
		throw new Error('Bitmap file ' + this.bitmap + ' not found');
	}
}
U.extend(PSprite, Arrow);

Arrow.prototype.toArrayParent = Arrow.prototype.toArray;
Arrow.prototype.toArray = function() {
	var $result;
	//$result = this.toArrayParent();
	$result = PTextField.superclass.toArray.call(this);
	$result['bitmap'] = this.bitmap;
	return $result;
}

