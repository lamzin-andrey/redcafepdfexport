//require_once dirname(__FILE__) . '/CResponder.php';
function runV2Index() {
	var $h = new CResponder();
	$r = $h.process();
	return $h;
}

