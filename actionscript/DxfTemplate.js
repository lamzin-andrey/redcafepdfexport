
var DxfTemplate = 
{
/*static public var HEADER:String;
static public var POLYLINE:String;
static public var STARTPOLYLINE:String;
static public var VERTEX:String;
static public var CLOSELINE:String;
static public var EOF:String; 
*/

//static public function init() {
init:function() {
	 DxfTemplate.HEADER = "  0\r\nSECTION\r\n  2\r\nHEADER\r\n  9\r\n$ACADVER\r\n  1\r\nAC1006\r\n  9\r\n$EXTMIN\r\n 10\r\n#minX\r\n 20\r\n#minY\r\n  9\r\n$EXTMAX\r\n 10\r\n#maxX\r\n 20\r\n#maxY\r\n  9\r\n$LTSCALE\r\n 40\r\n0.000394\r\n  9\r\n$ATTMODE\r\n 70\r\n     1\r\n  9\r\n$PDMODE\r\n 70\r\n     0\r\n  9\r\n$PDSIZE\r\n 40\r\n0.0\r\n  0\r\nENDSEC\r\n  0\r\nSECTION\r\n  2\r\nTABLES\r\n  0\r\nTABLE\r\n  2\r\nLAYER\r\n 70\r\n     2\r\n  0\r\nLAYER\r\n  2\r\nGRID\r\n 70\r\n    64\r\n 62\r\n     7\r\n  6\r\nCONTINUOUS\r\n  0\r\nLAYER\r\n  2\r\nPLOT\r\n 70\r\n    64\r\n 62\r\n     7\r\n  6\r\nCONTINUOUS\r\n  0\r\nENDTAB\r\n  0\r\nENDSEC\r\n  0\r\nSECTION\r\n  2\r\nENTITIES\r\n";
	 DxfTemplate.POLYLINE = "  0\r\nPOLYLINE\r\n  8\r\n$layername\r\n 62\r\n#linecolorsixsign\r\n  6\r\nCONTINUOUS\r\n 66\r\n     1\r\n 40\r\n#linethick\r\n  0\r\nVERTEX\r\n  8\r\n$layername\r\n 62\r\n#linecolorsixsign\r\n  6\r\nCONTINUOUS\r\n 10\r\n#startX\r\n 20\r\n#startY\r\n  0\r\nVERTEX\r\n  8\r\n$layername\r\n 62\r\n#linecolorsixsign\r\n  6\r\nCONTINUOUS\r\n 10\r\n#endX\r\n 20\r\n#endY\r\n  0\r\nSEQEND\r\n";
	 
	 DxfTemplate.STARTPOLYLINE = "  0\r\nPOLYLINE\r\n  8\r\n$layername\r\n 62\r\n#linecolorsixsign\r\n  6\r\nCONTINUOUS\r\n 66\r\n     1\r\n 40\r\n#linethick\r\n  0\r\nVERTEX\r\n  8\r\n$layername\r\n 62\r\n#linecolorsixsign\r\n  6\r\nCONTINUOUS\r\n 10\r\n#startX\r\n 20\r\n#startY\r\n  0\r\n";
	 DxfTemplate.VERTEX = "VERTEX\r\n  8\r\n$layername\r\n 62\r\n#linecolorsixsign\r\n  6\r\nCONTINUOUS\r\n 10\r\n#endX\r\n 20\r\n#endY\r\n";
	 DxfTemplate.CLOSELINE = "  0\r\nSEQEND\r\n";
	 DxfTemplate.EOF = "0\r\nENDSEC\r\n  0\r\nEOF";
	}
}
