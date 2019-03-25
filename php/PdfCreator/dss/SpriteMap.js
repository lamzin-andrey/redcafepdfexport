function SpriteMap() {
	this.initMap();
}
U.extend(Map, SpriteMap);
//SpriteMap.prototype = new Map();
/**
 * @param string $key
 * @return Sprite
*/
SpriteMap.prototype.getSprite = function($key) {
	var $i = this.indexOf($key);
	if ($i > -1) {
		return this._items[$i];
	}
	$i = count(this._keys);
	this._keys.push($key);
	//console.log('now create PSprite...');
	this._items.push(new PSprite());
	return this._items[$i];
}
/**
 * @return array
*/
SpriteMap.prototype.getAllSprites = function() {
	return this._items;
}
/**
 * @return array
*/
SpriteMap.prototype.getKeys = function() {
	return this._keys;
}
