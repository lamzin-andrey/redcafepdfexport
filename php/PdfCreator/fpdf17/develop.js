/*var pdf = new FPDF();
pdf.AddPage();
pdf.SetFont('Arial','B',16);
pdf.Cell(40, 10,'Hello World!');
pdf.Output('0.pdf', 'F');*/

var pdf = new FPDF();
pdf.AddPage();
pdf.AddFont('Arial', 'B', 'arial-cyrb.php')
pdf.SetFont('Arial', 'B');
pdf.SetFontSize(16);
pdf.Cell(40, 10, cp1251_codes('Привет медвед!'));
pdf.SetLineWidth(1);
pdf.SetDrawColor(255, 0, 0);
pdf.Line(10, 10, 100, 100);
pdf.Image('C:/dev/v3-r9/default/php/PdfCreator/fpdf17/1.png', 20, 20);
pdf.Image('C:/dev/v3-r9/default/php/PdfCreator/fpdf17/0.png', 40, 40);

pdf.Output('0.pdf', 'F');
//console.log(pdf.Output('0.pdf', 'S') );
/*window.onload = function () {
	var s = Qt.readFileAsBinaryString('C:/dev/v3-r9/default/php/PdfCreator/fpdf17/0.png');
	out.value = s;
}*/



function cp1251_codes(s) {
	var codes = {
		'а':224,
		'б':225,
		'в':226,
		'г':227,
		'д':228,
		'е':229,
		'ё':184,
		'ж':230,
		'з':231,
		'и':232,
		'й':233,
		'к':234,
		'л':235,
		'м':236,
		'н':237,
		'о':238,
		'п':239,
		'р':240,
		'с':241,
		'т':242,
		'у':243,
		'ф':244,
		'х':245,
		'ц':246,
		'ч':247,
		'ш':248,
		'щ':249,
		'ъ':250,
		'ы':251,
		'ь':252,
		'э':253,
		'ю':254,
		'я':255,
		'А':192,
		'Б':193,
		'В':194,
		'Г':195,
		'Д':196,
		'Е':197,
		'Ё':168,
		'Ж':198,
		'З':199,
		'И':200,
		'Й':201,
		'К':202,
		'Л':203,
		'М':204,
		'Н':205,
		'О':206,
		'П':207,
		'Р':208,
		'С':209,
		'Т':210,
		'У':211,
		'Ф':212,
		'Х':213,
		'Ц':214,
		'Ч':215,
		'Ш':216,
		'Щ':217,
		'Ъ':218,
		'Ы':219,
		'Ь':220,
		'Э':221,
		'Ю':222,
		'Я':223
	};
	var i, data = [];
	for (i = 0; i < s.length; i++) {
		if (codes[s.charAt(i)]) {
			data.push(String(codes[s.charAt(i)]));
		} else {
			data.push(String(s.charCodeAt(i)));
		}
	}
	return 'QDJS_BINARY' + data.join(',') + '/QDJS_BINARY';
}
