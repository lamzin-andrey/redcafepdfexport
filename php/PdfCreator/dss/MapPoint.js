function pt($x, $y) {
	$point = {};
	$point.x = $x;
	$point.y = $y;
	return $point;
}
function MapPoint() {
	this.initMap();
}
U.extend(Map, MapPoint);
//MapPoint.prototype = new Map();

/**
 * @param string $key
*/
MapPoint.prototype.getPoint = function($key) {
	var $i, $point;
	$i = this.indexOf($key);
	if ($i > -1) {
		return this._items[$i];
	}
	$i = count(this._keys);
	this._keys.push($key);
	$point = pt(-100000, -100000);
	this._items.push($point);
	return this._items[$i];
}
/**
 * @param string $key
 * @param StdClass  $point
 * @return StdClass
*/
MapPoint.prototype.insert = function($key, $point) {
	var $i;
	$i = this.indexOf($key);
	if ($i > -1) {
		return this._items[$i];
	}
	$i = count(this._keys);
	this._keys.push($key);
	this._items.push($point);
	return this._items[$i];
}
