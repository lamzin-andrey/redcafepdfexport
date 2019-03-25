function Map() {
	this.initMap();
}
Map.prototype = {
	/**
	 * @param string $key
	 * @return int
	*/
	indexOf : function($key) {
        var $i, $length;
        $i = 0;
        $length = count(this._keys);
        while ($i < $length) {
            if (this._keys[$i] == $key) {
                return $i;
            }
            $i++;
        }
		return -1;
	},
	initMap:function() {
		/** @property {Array} _keys */
		this._keys = [];
		/** @property {Array} _items */
		this._items = [];
	}
};
