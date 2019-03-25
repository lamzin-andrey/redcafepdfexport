/** @depends 'PPGraphicsjs'; */

function PSprite() {
	this.initPSprite();
}
PSprite.prototype = {
	initPSprite:function() {
		/** @property int x */
		/** @property int y */
		/** @property int width */
		/** @property int height */
		/** @property string name */
		/** @property array _childs */
		this._childs = [];
		/** @property int $rotation в градусах */
		this._rotation = 0;
		this.x  = 0;
		this.y  = 0;
		this.name= null;
		this.width  = 0;
		this.height  = 0;
		/** @property graphics */
		this.graphics = new PGraphics(this);
		Object.defineProperty(this, "numChildren", {
			enumerable:true,
			get:function(){
				return count(this._childs);
			}
		});
		Object.defineProperty(this, "rotation", {
			enumerable:true,
			get:function(){
				return this._rotation;
			},
			set:function($value) {
				this._rotation = $value;
				if (isset(this, "bitmap")) {
					this._rotateBitmap();
				}
			}
		});
	},
    addChild : function($clip) {
		/*if ($clip.x == 36 && $clip.y == 36 ) {
			if ($clip.name != 'MetkaL') {
				$clip.name = 'MetkaL';
				//throw Error				('Bryaka'				);
			} else {
				$clip.M0sign = 1;
			}
		}*/
		this._childs.push($clip);
	},
    /**
     * @return Clip or Null
    */
    getChildAt : function($i) {
        if (isset(this, "_childs", $i)) {
            return this._childs[$i];
        }
        return null;
	},
    /**
     * @return Clip or Null
    */
    getChildByName : function($name) {
        var $a, $clip, phpjslocvar_0;
        $a = this._childs;
        for (phpjslocvar_0 in $a) { $clip = $a[phpjslocvar_0];
            if (isset($clip, "name") && $clip.name == $name) {
                return clip;
            }
        }
        return null;
	},
    
  
	_rotateBitmap : function() {
		var a = this._rotation;
		if (a == -90) {
			a = 270;
		}
		if (a == -180) {
			a = 180;
		}
		if (a == 360) {
			a = 0;
		}
        switch (a) {
			case 0:
				this.bitmap = Qt.appDir() + '/php/PdfCreator/fpdf17/0.png';
				break;
			case 90:
				this.bitmap = Qt.appDir() + '/php/PdfCreator/fpdf17/2.png';
				break;
			case 180:
				this.bitmap = Qt.appDir() + '/php/PdfCreator/fpdf17/1.png';
				break;
			case 270:
				this.bitmap = Qt.appDir() + '/php/PdfCreator/fpdf17/3.png';
				break;
			default:
				throw new Error("Unexpected angle: " + this._rotation);
		}
	},
	/**
     * @return array
    */
    getChilds : function() {
        return this._childs;
	},
	/**
     * @return array
    */
    toArray : function() {
        var $result, $o, phpjslocvar_0;
        $result = {
            'name' : this.name,
            'x' : this.x,
            'y' : this.y,
            'w' : this.width,
            'h' : this.height,
            'graphics' : this.graphics._objects,
            'children' : [],
            'numChildren' : this.numChildren,
            'rotation'    : this.rotation
            };
        
        for (phpjslocvar_0  = 0; phpjslocvar_0 < this._childs.length; phpjslocvar_0++) { $o = this._childs[phpjslocvar_0];
            $result['children'].push($o.toArray());
        }
        return $result;
	},
	removeFromParentScope:function() {
	}

};
