<?php
require_once __DIR__ . '/fpdf.php';

$_POST['plotterHeightInch'] = 10;
$_POST['plotterWidthInch'] = 10;


/*var pdf = new FPDF();
pdf.AddPage();
pdf.AddFont('Arial', '', 'arial-cyr.php')
pdf.SetFont('Arial', '');
pdf.SetFontSize(16);
pdf.Cell(40, 10,'Привет медвед!');*/


$pdf = new FPDF();
$pdf->AddPage();
//$pdf->AddFont('ArialBold', 'B', 'arial-cyrb.php');
//$pdf->SetFont('ArialBold','B');
$pdf->AddFont('Arial', '', 'arial-cyr.php');
$pdf->SetFont('Arial','');
$pdf->SetFontSize(16);
//RIGHT RILE! $pdf->Cell(40, 10, mb_convert_encoding('Привет медвед!', 'Windows-1251', 'utf-8'));
$pdf->Cell(40, 10, 'Привет медвед!');
$pdf->Output('php.pdf', 'F');



//$s = 'abrrrerf';
$s = '/media/andrey/C/dev/v3-r9/default/php/PdfCreator/fpdf17/0.png';
var_dump(strrpos($s, '.'));
