function PageOrderHelper($map) {
	/** @property $_array */
	this._array = [];
	var $keys, $max, $maxColumn, $maxRow, $_array, $i, $t, $sI, $sJ, $I, $J, $index;
	$keys  = $map.getKeys();
	$max = this._getMaxValues($keys);
	$maxColumn = $max.column;
	$maxRow = $max.line;
	$_array= [];
	$_array.push('-1');
	for ($i = 0; $i < $maxColumn * $maxRow; $i++ ) {
		$_array.push('-1');
	
		for ($i = 0; $i < count($keys); $i++ ) {
			//$t = $keys[$i]->split(':');

			$t = explode(':', $keys[$i]);
			$sI = $t[0];
			$sJ = $t[1];
			$I = intval($sI);
			$J = intval($sJ);
			$index = $I * $maxColumn + $J + 1;
			//trace ("index == " + I + " * " + maxColumn + "  + " + J + " + 1 = " + index);

			$_array[$index] = $sI + ':' + $sJ;
		}
		this._array = [];
		//trace ("*------------*");

		for ($i = 0; $i < $maxColumn * $maxRow + 10; $i++ ) {
			if ( ( isset($_array, $i) && ($_array[$i] != '-1') ) || ($i == 0) ) {
				
				this._array.push($_array[$i]);
			}
		}
	}
}
PageOrderHelper.prototype = {
	    getArray : function() {
			
			return this._array;
	},
	/**
	 * @param array $keys
	*/
	    _getMaxValues : function($keys) {
        var $maxJ, $maxI, $length, $i, $t, $sI, $sJ, $I, $J, $res;
        $maxJ = null;
        $maxI = null;
        $length = count($keys);
        for ($i = 0; $i < $length; $i++ ) {
            //$t = keys[i].split(":");

            $t = explode(':', $keys[$i]) ;
            $sI = $t[0];
            $sJ = $t[1];
            $I = intval($sI);
            $J = intval($sJ);
            if ($maxJ === null) $maxJ = $J;
            if ($maxI === null) $maxI = $I;
            if ($maxI < $I) $maxI = $I;
            if ($maxJ < $J) $maxJ = $J;
        }
        $maxI++;
        $maxJ++;
        //return {column:maxJ, line:maxI };

        $res = {};
        $res.column = $maxJ;
        $res.line = $maxI;
        return $res;
}

};
