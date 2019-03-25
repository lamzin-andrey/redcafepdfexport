define('FPDF_VERSION','1.7');
define('FPDF_FONTPATH', '/');
define('PHP_SAPI', '');

function FPDF($orientation, $unit, $size) {
	$orientation = $orientation ? $orientation : 'P';
	$size = $size ? $size : 'A4';
	
	
	/** @property $page */
	/** @property $n */
	/** @property $offsets */
	this.offsets = [];
	/** @property $buffer */
	/** @property $pages */
	/** @property $state */
	/** @property $compress */
	/** @property $k */
	/** @property $DefOrientation */
	/** @property $CurOrientation */
	/** @property $StdPageSizes */
	/** @property $DefPageSize */
	/** @property $CurPageSize */
	/** @property $PageSizes */
	/** @property $hPt */
	/** @property $h */
	/** @property $lMargin */
	/** @property $tMargin */
	/** @property $rMargin */
	/** @property $bMargin */
	/** @property $cMargin */
	/** @property $y */
	/** @property $lasth */
	/** @property $LineWidth */
	/** @property $fontpath */
	/** @property $CoreFonts */
	/** @property $fonts */
	this.fonts = [];
	/** @property $FontFiles */
	/** @property $diffs */
	/** @property $FontFamily */
	/** @property $FontStyle */
	/** @property $underline */
	/** @property $CurrentFont */
	/** @property $FontSizePt */
	/** @property $FontSize */
	/** @property $DrawColor */
	/** @property $FillColor */
	/** @property $TextColor */
	/** @property $ColorFlag */
	/** @property $ws */
	/** @property $images */
	$images = {};
	/** @property $PageLinks */
	/** @property $links */
	/** @property $AutoPageBreak */
	/** @property $PageBreakTrigger */
	/** @property $InHeader */
	/** @property $InFooter */
	/** @property $ZoomMode */
	/** @property $LayoutMode */
	/** @property $title */
	/** @property $subject */
	/** @property $author */
	/** @property $keywords */
	/** @property $creator */
	/** @property $AliasNbPages */
	/** @property $PDFVersion */

	var $margin;
	// Some checks

	this._dochecks();
	// Initialization of properties

	this.page = 0;
	this.n = 2;
	this.buffer = '';
	this.pages = [];
	this.PageSizes = [];
	this.state = 0;
	this.fonts = [];
	this.FontFiles = [];
	this.diffs = [];
	this.images = {};
	this.links = [];
	this.InHeader = false;
	this.InFooter = false;
	this.lasth = 0;
	this.FontFamily = '';
	this.FontStyle = '';
	this.FontSizePt = 12;
	this.underline = false;
	this.DrawColor = '0 G';
	this.FillColor = '0 g';
	this.TextColor = '0 g';
	this.ColorFlag = false;
	this.ws = 0;
	// Font path

	if(defined('FPDF_FONTPATH'))//TODO it
	{
		this.fontpath = FPDF_FONTPATH;
		if(substr(this.fontpath,-1)!='/' && substr(this.fontpath,-1)!='\\')
			this.fontpath += '/';
	
	/*else if(is_dir(dirname(__FILE__)+'/font'))
		this.fontpath = dirname(__FILE__)+'/font/';*/
	else
		this.fontpath = '';
	// Core fonts

	this.CoreFonts = ['courier', 'helvetica', 'times', 'symbol', 'zapfdingbats'];
	// Scale factor

	if($unit=='pt')
		this.k = 1;
	else if($unit=='mm')
		this.k = 72/25.4; // 2,834645669

	else if($unit=='cm')
		this.k = 72/2.54;
	else if($unit=='in')
		this.k = 72;
	else
		this.PDFError('Incorrect unit: '+$unit);
	// Page sizes

	this.StdPageSizes = {
		'a0':[2383.93, 3370.39],
		'a1':[1683.78, 2383,94],
		'a2':[1190.55, 1683.78],
		'a3':[841.89,1190.55],
		'a4':[595.28,841.89],
		'a5':[420.94,595.28],
		'plot' : [$_POST['plotterWidthInch'], $_POST['plotterHeightInch']],//17008 - 6000 mm, 2834.674 - 1000 mm

		'letter':[612,792], 
		'legal':[612,1008]};
	$size = this._getpagesize($size);
	this.DefPageSize = $size;
	this.CurPageSize = $size;
	// Page orientation

	$orientation = strtolower($orientation);
	if($orientation=='p' || $orientation=='portrait')
	{
		this.DefOrientation = 'P';
		this.w = $size[0];
		this.h = $size[1];
	}
	else if($orientation=='l' || $orientation=='landscape')
	{
		this.DefOrientation = 'L';
		this.w = $size[1];
		this.h = $size[0];
	}
	else
		this.PDFError('Incorrect orientation: ' + $orientation);
	this.CurOrientation = this.DefOrientation;
	this.wPt = this.w*this.k;
	this.hPt = this.h*this.k;
	// Page margins (1 cm)

	$margin = 28.35/this.k;
	this.SetMargins($margin,$margin);
	// Interior cell margin (1 mm)

	this.cMargin = $margin/10;
	// Line width (0.2 mm)

	this.LineWidth = +567/this.k;
	// Automatic page break

	this.SetAutoPageBreak(true,2*$margin);
	// Default display mode

	this.SetDisplayMode('default');
	// Enable compression

	this.SetCompression(true);
	// Set default PDF version number

	this.PDFVersion = '1.3';
}
}
FPDF.prototype = {

    SetMargins : function($left, $top, $right) {
        $right = $right ? $right : null;
        // Set left, top and right margins
        this.lMargin = $left;
        this.tMargin = $top;
        if($right === null)
			$right = $left;
        this.rMargin = $right;
},

    SetLeftMargin : function($margin) {
        // Set left margin
        this.lMargin = $margin;
        if(this.page > 0 && this.x < $margin)
			this.x = $margin;
},

    SetTopMargin : function($margin) {
        // Set top margin
        this.tMargin = $margin;
},

    SetRightMargin : function($margin) {
        // Set right margin

        this.rMargin = $margin;
},

    SetAutoPageBreak : function($auto, $margin) {
        $margin = $margin ? $margin : 0;
        // Set auto page break mode and triggering margin
        this.AutoPageBreak = $auto;
        this.bMargin = $margin;
        this.PageBreakTrigger = this.h - $margin;
},

    SetDisplayMode : function($zoom, $layout) {
        $layout = $layout ? $layout : 'default';
        // Set display mode in viewer
        if($zoom=='fullpage' || $zoom=='fullwidth' || $zoom=='real' || $zoom=='default' || !is_string($zoom))
			this.ZoomMode = $zoom;
        else
			this.PDFError('Incorrect zoom display mode: '+$zoom);
        if($layout=='single' || $layout=='continuous' || $layout=='two' || $layout=='default')
			this.LayoutMode = $layout;
        else
			this.PDFError('Incorrect layout display mode: '+$layout);
},

    SetCompression : function($compress) {
        /*
        if(function_exists('gzcompress'))
			this.compress = $compress;
        else*/
        this.compress = false;
},

    SetTitle : function($title, $isUTF8) {
        $isUTF8 = $isUTF8 ? $isUTF8 : false;

        if($isUTF8)
			$title = this._UTF8toUTF16($title);
        this.title = $title;
},

    SetSubject : function($subject, $isUTF8) {
        $isUTF8 = $isUTF8 ? $isUTF8 : false;
        // Subject of document

        if($isUTF8)
			$subject = this._UTF8toUTF16($subject);
        this.subject = $subject;
},

    SetAuthor : function($author, $isUTF8) {
        $isUTF8 = $isUTF8 ? $isUTF8 : false;
        // Author of document
        if($isUTF8)
			$author = this._UTF8toUTF16($author);
        this.author = $author;
},

    SetKeywords : function($keywords, $isUTF8) {
        $isUTF8 = $isUTF8 ? $isUTF8 : false;
        // Keywords of document
        if($isUTF8)
			$keywords = this._UTF8toUTF16($keywords);
        this.keywords = $keywords;
},

    SetCreator : function($creator, $isUTF8) {
        $isUTF8 = $isUTF8 ? $isUTF8 : false;
        // Creator of document
        if($isUTF8)
			$creator = this._UTF8toUTF16($creator);
        this.creator = $creator;
},

    AliasNbPages : function($alias) {
		$alias = $alias ? $alias : '{nb}';
        // Define an alias for total number of pages
        this.AliasNbPages = $alias;
},

    PDFError : function($msg) {
        // Fatal error
        throw new Error('FPDF error: ' + $msg);
},

    Open : function() {
        // Begin document
        this.state = 1;
},

    Close : function() {
        // Terminate document
        if(this.state==3)
			return;
        if(this.page==0)
			this.AddPage();
        // Page footer

        this.InFooter = true;
        this.Footer();
        this.InFooter = false;
        // Close page

        this._endpage();
        // Close document

        this._enddoc();
},

    AddPage : function($orientation, $size) {
		$orientation = $orientation ? $orientation : '';
		$size = $size ? $size : '';
        var $family, $style, $fontsize, $lw, $dc, $fc, $tc, $cf;
        // Start a new page

        if(this.state==0)
			this.Open();
        $family = this.FontFamily;
        $style = this.FontStyle+(this.underline ? 'U' : '');
        $fontsize = this.FontSizePt;
        $lw = this.LineWidth;
        $dc = this.DrawColor;
        $fc = this.FillColor;
        $tc = this.TextColor;
        $cf = this.ColorFlag;
        if(this.page > 0)
        {
            // Page footer
            this.InFooter = true;
            this.Footer();
            this.InFooter = false;
            // Close page
            this._endpage();
        }
        // Start new page

        this._beginpage($orientation,$size);
        // Set line cap style to square

        this._out('2 J');
        // Set line width

        this.LineWidth = $lw;
        
		this._out(sprintf('%.2F w',$lw*this.k));
        // Set font

        if($family)
			this.SetFont($family,$style,$fontsize);
        // Set colors

        this.DrawColor = $dc;
        if($dc!='0 G')
			this._out($dc);
        this.FillColor = $fc;
		if($fc!='0 g')
			this._out($fc);
        this.TextColor = $tc;
        this.ColorFlag = $cf;
        // Page header

        this.InHeader = true;
        this.Header();
        this.InHeader = false;
        // Restore line width

        if(this.LineWidth!=$lw)
        {
            this.LineWidth = $lw;
            this._out(sprintf('%.2F w',$lw*this.k));
        }
        // Restore font

        if($family)
			this.SetFont($family,$style,$fontsize);
        // Restore colors

        if(this.DrawColor!=$dc)
        {
            this.DrawColor = $dc;
            this._out($dc);
        }
        if(this.FillColor!=$fc)
        {
            this.FillColor = $fc;
            this._out($fc);
        }
        this.TextColor = $tc;
        this.ColorFlag = $cf;
},

    Header : function() {
        
        // To be implemented in your own inherited class

},

    Footer : function() {
        // To be implemented in your own inherited class

},

    PageNo : function() {
        // Get current page number
        return this.page;
},

    SetDrawColor : function($r, $g, $b) {
		$b = ($b !== null) ? $b : null;
		$g = ($g !== null) ? $g : null;
        // Set color for all stroking operations

        if(($r==0 && $g==0 && $b==0) || $g===null)
			this.DrawColor = sprintf('%.3F G',$r/255);
        else
			this.DrawColor = sprintf('%.3F %.3F %.3F RG',$r/255,$g/255,$b/255);
        if(this.page>0)
			this._out(this.DrawColor);
},

    SetFillColor : function($r, $g, $b) {
        $b = $b ? $b : null;
		$g = $g ? $g : null;
        // Set color for all filling operations
        if(($r==0 && $g==0 && $b==0) || $g===null)
			this.FillColor = sprintf('%.3F g',$r/255);
        else
			this.FillColor = sprintf('%.3F %.3F %.3F rg',$r/255,$g/255,$b/255);
        this.ColorFlag = (this.FillColor!=this.TextColor);
        if(this.page>0)
			this._out(this.FillColor);
},

    SetTextColor : function($r, $g, $b) {
        $b = $b ? $b : null;
		$g = $g ? $g : null;

        if(($r==0 && $g==0 && $b==0) || $g===null)
			this.TextColor = sprintf('%.3F g',$r/255);
        else
			this.TextColor = sprintf('%.3F %.3F %.3F rg',$r/255,$g/255,$b/255);
        this.ColorFlag = (this.FillColor!=this.TextColor);
},

    GetStringWidth : function($s) {
        var $cw, $w, $l, $i;
        // Get width of a string in the current font

        $s = String($s);
        $cw = this.CurrentFont['cw'];
        $w = 0;
        $l = strlen($s);
        for($i=0;$i<$l;$i++)
			$w += $cw[$s[$i]];
        return $w*this.FontSize/1000;
},

    SetLineWidth : function($width) {
        // Set line width
        this.LineWidth = $width;
        if(this.page>0)
			this._out(sprintf('%.2F w',$width*this.k));
},

    Line : function($x1, $y1, $x2, $y2) {
        // Draw a line
        this._out(sprintf('%.2F %.2F m %.2F %.2F l S',$x1*this.k,(this.h-$y1)*this.k,$x2*this.k,(this.h-$y2)*this.k));
},

    Rect : function($x, $y, $w, $h, $style) {
		$style = $style ? $style : '';
        var $op;
        // Draw a rectangle

        if($style=='F')
			$op = 'f';
        else if($style=='FD' || $style=='DF')
			$op = 'B';
        else
			$op = 'S';
        this._out(sprintf('%.2F %.2F %.2F %.2F re %s',$x*this.k,(this.h-$y)*this.k,$w*this.k,-$h*this.k,$op));
},

    AddFont : function($family, $style, $file) {
		$style = $style ? $style : '';
		$file = $file ? $file : '';
        var $fontkey, $info, $n;
        // Add a TrueType, OpenType or Type1 font

        $family = strtolower($family);
        if($file == '') {
			$file = str_replace(' ','',$family)+strtolower($style)+'.php';
		}
        $style = strtoupper($style);
        if($style=='IB') {
			$style = 'BI';
		}
        $fontkey = $family+$style;
        if(isset(this, "fonts", $fontkey)) {
			return;
		}
        $info = this._loadfont($file);
        $info['i'] = count(this.fonts)+1;
        if(!empty($info['diff']))
        {
            // Search existing encodings

            $n = array_search($info['diff'],this.diffs);
            if(!$n)
            {
                $n = count(this.diffs)+1;
                this.diffs[$n] = $info['diff'];
            }
            $info['diffn'] = $n;
        }
        if(!empty($info['file']))
        {
            // Embedded font

            if($info['type']=='TrueType')
				this.FontFiles[$info['file']] = {'length1':$info['originalsize']};
            else
				this.FontFiles[$info['file']] = {'length1':$info['size1'], 'length2':$info['size2']};
        }
        this.fonts[$fontkey] = $info;
},

	
    SetFont : function($family, $style, $size) {
		$size = $size ? $size : 0;
		$style = $style ? $style : '';
        var $fontkey;
        // Select a font; size given in points

        if($family=='')
			$family = this.FontFamily;
        else
			$family = strtolower($family);
        $style = strtoupper($style);
        if(strpos($style,'U')!==false)
        {
            this.underline = true;
            $style = str_replace('U','',$style);
        }
        else
			this.underline = false;
        if($style=='IB')
			$style = 'BI';
        if($size==0)
			$size = this.FontSizePt;
        // Test if font is already selected

        if(this.FontFamily == $family && this.FontStyle == $style && this.FontSizePt == $size)
			return;
        // Test if font is already loaded

        $fontkey = $family + $style;
        if(!isset(this,"fonts",$fontkey))
        {
            // Test if one of the core fonts

            if($family=='arial')
				$family = 'helvetica';
            if($family=='arialbold')
				$family = 'helvetica';
            if(in_array($family,this.CoreFonts))
            {
                if($family=='symbol' || $family=='zapfdingbats')
					$style = '';
                $fontkey = $family+$style;
                if(!isset(this,'fonts',$fontkey))
					this.AddFont($family,$style);
            }
            else
				this.PDFError('Undefined font: '+$family+' '+$style);
        }
        // Select it

        this.FontFamily = $family;
        this.FontStyle = $style;
        this.FontSizePt = $size;
        this.FontSize = $size/this.k;
        this.CurrentFont = this.fonts[$fontkey];
        if(this.page>0) {
			
			this._out(sprintf('BT /F%d %.2F Tf ET',this.CurrentFont['i'],this.FontSizePt));
		}
},
	//TODO stop here
    SetFontSize : function($size) {
        // Set font size in points

        if(this.FontSizePt==$size)
			return;
        this.FontSizePt = $size;
        this.FontSize = $size/this.k;
        if(this.page>0)
			this._out(sprintf('BT /F%d %.2F Tf ET',this.CurrentFont['i'],this.FontSizePt));
},

    AddLink : function() {
        var $n;
        // Create a new internal link

        $n = count(this.links)+1;
        this.links[$n] = [0, 0];
        return $n;
},

    SetLink : function($link, $y, $page) {
		$page = $page ? $page : -1;
		$y = $y ? $y : 0;
        // Set destination of internal link
        if($y==-1)
			$y = this.y;
        if($page==-1)
			$page = this.page;
        this.links[$link] = [$page, $y];
	},

    Link : function($x, $y, $w, $h, $link) {
        // Put a link on the page
        this.PageLinks[this.page].push( [$x*this.k, this.hPt-$y*this.k, $w*this.k, $h*this.k, $link] );
	},
	
    Text : function($x, $y, $txt) {
        var $s;
        // Output a string
        $s = sprintf('BT %.2F %.2F Td (%s) Tj ET',$x*this.k,(this.h-$y)*this.k,this._escape($txt));
        if(this.underline && $txt!='')
			$s += ' '+this._dounderline($x,$y,$txt);
        if(this.ColorFlag)
			$s = 'q '+this.TextColor+' '+$s+' Q';
        this._out($s);
	},

    AcceptPageBreak : function() {
        // Accept automatic page break or not
        return this.AutoPageBreak;
},

    Cell : function($w, $h, $txt, $border, $ln, $align, $fill, $link) {
		$h = $h ? $h : 0;
		$txt = $txt ? $txt : '';
		$border = $border ? $border : 0;
		$ln = $ln ? $ln : 0;
		$align = $align ? $align : '';
		$fill = $fill ? $fill : false;
		$link = $link ? $link : '';
		
        var $k, $x, $ws, $s, $op, $y, $dx, $txt2;
        // Output a cell

        $k = this.k;
        if(this.y+$h > this.PageBreakTrigger && !this.InHeader && !this.InFooter && this.AcceptPageBreak())
        {
            // Automatic page break

            $x = this.x;
            $ws = this.ws;
            if($ws>0)
            {
                this.ws = 0;
                this._out('0 Tw');
            }
            this.AddPage(this.CurOrientation,this.CurPageSize);
            this.x = $x;
            if($ws>0)
            {
                this.ws = $ws;
                this._out(sprintf('%.3F Tw',$ws*$k));
            }
        }
        if($w==0)
			$w = this.w-this.rMargin-this.x;
        $s = '';
        if($fill || $border==1)
        {
            if($fill)
				$op = ($border==1) ? 'B' : 'f';
            else
				$op = 'S';
            $s = sprintf('%.2F %.2F %.2F %.2F re %s ',this.x*$k,(this.h-this.y)*$k,$w*$k,-$h*$k,$op);
        }
        if(is_string($border))
        {
            $x = this.x;
            $y = this.y;
            if(strpos($border,'L')!==false)
            $s += sprintf('%.2F %.2F m %.2F %.2F l S ',$x*$k,(this.h-$y)*$k,$x*$k,(this.h-($y+$h))*$k);
            if(strpos($border,'T')!==false)
            $s += sprintf('%.2F %.2F m %.2F %.2F l S ',$x*$k,(this.h-$y)*$k,($x+$w)*$k,(this.h-$y)*$k);
            if(strpos($border,'R')!==false)
            $s += sprintf('%.2F %.2F m %.2F %.2F l S ',($x+$w)*$k,(this.h-$y)*$k,($x+$w)*$k,(this.h-($y+$h))*$k);
            if(strpos($border,'B')!==false)
            $s += sprintf('%.2F %.2F m %.2F %.2F l S ',$x*$k,(this.h-($y+$h))*$k,($x+$w)*$k,(this.h-($y+$h))*$k);
        }
        if($txt!=='')
        {
            if($align=='R')
            $dx = $w-this.cMargin-this.GetStringWidth($txt);
            else if($align=='C')
            $dx = ($w-this.GetStringWidth($txt))/2;
            else
            $dx = this.cMargin;
            if(this.ColorFlag)
            $s += 'q '+this.TextColor+' ';
            $txt2 = str_replace(')','\\)',str_replace('(','\\(',str_replace('\\','\\\\',$txt)));
            $s += sprintf('BT %.2F %.2F Td (%s) Tj ET',
				(this.x+$dx)*$k,
				(this.h-(this.y+0.5*$h+0.3*this.FontSize))*$k,
				$txt2
				);
            if(this.underline)
            $s += ' '+this._dounderline(this.x+$dx,this.y+0.5*$h+0.3*this.FontSize,$txt);
            if(this.ColorFlag)
            $s += ' Q';
            if($link)
            this.Link(this.x+$dx,this.y+0.5*$h-0.5*this.FontSize,this.GetStringWidth($txt),this.FontSize,$link);
        }
        if($s)
        this._out($s);
        this.lasth = $h;
        if($ln>0)
        {
            // Go to next line

            this.y += $h;
            if($ln==1)
            this.x = this.lMargin;
        }
        else
        this.x += $w;
},

    MultiCell : function($w, $h, $txt, $border, $align, $fill) {
		$border = $border ? $border : 0;
		$align = $align ? $align : 'J';
		$fill = $fill ? $fill : false;
		
        var $cw, $wmax, $s, $nb, $b, $b2, $sep, $i, $j, $l, $ns, $nl, $c, $ls;
        // Output text with automatic or explicit line breaks

        $cw = this.CurrentFont['cw'];
        if($w==0)
        $w = this.w-this.rMargin-this.x;
        $wmax = ($w-2*this.cMargin)*1000/this.FontSize;
        $s = str_replace("\r",'',$txt);
        $nb = strlen($s);
        if($nb>0 && $s[$nb-1]=="\n")
        $nb--;
        $b = 0;
        if($border)
        {
            if($border==1)
            {
                $border = 'LTRB';
                $b = 'LRT';
                $b2 = 'LR';
            }
            else
            {
                $b2 = '';
                if(strpos($border,'L')!==false)
                $b2 += 'L';
                if(strpos($border,'R')!==false)
                $b2 += 'R';
                $b = (strpos($border,'T')!==false) ? $b2+'T' : $b2;
            }
        }
        $sep = -1;
        $i = 0;
        $j = 0;
        $l = 0;
        $ns = 0;
        $nl = 1;
        while($i<$nb)
        {
            // Get next character

            $c = $s[$i];
            if($c=="\n")
            {
                // Explicit line break

                if(this.ws>0)
                {
                    this.ws = 0;
                    this._out('0 Tw');
                }
                this.Cell($w,$h,substr($s,$j,$i-$j),$b,2,$align,$fill);
                $i++;
                $sep = -1;
                $j = $i;
                $l = 0;
                $ns = 0;
                $nl++;
                if($border && $nl==2)
                $b = $b2;
                continue;
            }
            if($c==' ')
            {
                $sep = $i;
                $ls = $l;
                $ns++;
            }
            $l += $cw[$c];
            if($l>$wmax)
            {
                // Automatic line break

                if($sep==-1)
                {
                    if($i==$j)
                    $i++;
                    if(this.ws>0)
                    {
                        this.ws = 0;
                        this._out('0 Tw');
                    }
                    this.Cell($w,$h,substr($s,$j,$i-$j),$b,2,$align,$fill);
                }
                else
                {
                    if($align=='J')
                    {
                        this.ws = ($ns>1) ? ($wmax-$ls)/1000*this.FontSize/($ns-1) : 0;
                        this._out(sprintf('%.3F Tw',this.ws*this.k));
                    }
                    this.Cell($w,$h,substr($s,$j,$sep-$j),$b,2,$align,$fill);
                    $i = $sep+1;
                }
                $sep = -1;
                $j = $i;
                $l = 0;
                $ns = 0;
                $nl++;
                if($border && $nl==2)
                $b = $b2;
            }
            else
            $i++;
        }
        // Last chunk

        if(this.ws>0)
        {
            this.ws = 0;
            this._out('0 Tw');
        }
        if($border && strpos($border,'B')!==false)
        $b += 'B';
        this.Cell($w,$h,substr($s,$j,$i-$j),$b,2,$align,$fill);
        this.x = this.lMargin;
},

    Write : function($h, $txt, $link) {
		$link = $link ? $link : '';;
        var $cw, $w, $wmax, $s, $nb, $sep, $i, $j, $l, $nl, $c;
        // Output text in flowing mode

        $cw = this.CurrentFont['cw'];
        $w = this.w-this.rMargin-this.x;
        $wmax = ($w-2*this.cMargin)*1000/this.FontSize;
        $s = str_replace("\r",'',$txt);
        $nb = strlen($s);
        $sep = -1;
        $i = 0;
        $j = 0;
        $l = 0;
        $nl = 1;
        while($i<$nb)
        {
            // Get next character

            $c = $s[$i];
            if($c=="\n")
            {
                // Explicit line break

                this.Cell($w,$h,substr($s,$j,$i-$j),0,2,'',0,$link);
                $i++;
                $sep = -1;
                $j = $i;
                $l = 0;
                if($nl==1)
                {
                    this.x = this.lMargin;
                    $w = this.w-this.rMargin-this.x;
                    $wmax = ($w-2*this.cMargin)*1000/this.FontSize;
                }
                $nl++;
                continue;
            }
            if($c==' ')
            $sep = $i;
            $l += $cw[$c];
            if($l>$wmax)
            {
                // Automatic line break

                if($sep==-1)
                {
                    if(this.x>this.lMargin)
                    {
                        // Move to next line

                        this.x = this.lMargin;
                        this.y += $h;
                        $w = this.w-this.rMargin-this.x;
                        $wmax = ($w-2*this.cMargin)*1000/this.FontSize;
                        $i++;
                        $nl++;
                        continue;
                    }
                    if($i==$j)
                    $i++;
                    this.Cell($w,$h,substr($s,$j,$i-$j),0,2,'',0,$link);
                }
                else
                {
                    this.Cell($w,$h, substr($s,$j,$sep-$j),0,2,'',0,$link);
                    $i = $sep+1;
                }
                $sep = -1;
                $j = $i;
                $l = 0;
                if($nl==1)
                {
                    this.x = this.lMargin;
                    $w = this.w-this.rMargin-this.x;
                    $wmax = ($w-2*this.cMargin)*1000/this.FontSize;
                }
                $nl++;
            }
            else
            $i++;
        }
        // Last chunk

        if($i!=$j)
        this.Cell($l/1000*this.FontSize,$h,substr($s,$j),0,0,'',0,$link);
},

    Ln : function($h) {
        $h = $h ? $h : null;
        // Line feed; default value is last cell height

        this.x = this.lMargin;
        if($h===null)
			this.y += this.lasth;
        else
			this.y += $h;
},

    Image : function($file, $x, $y, $w, $h, $type, $link) {
		$x = $x !== null ? $x : null;
		$y = $y !== null ? $y : null;
		$w = $w ? $w : 0;
		$h = $h ? $h : 0;
		
		$link = $link ? $link : '';
		
		$type = $type ? $type : '';
		
        var $pos, $mtd, $info, $x2;
        // Put an image on the page

        if(!isset(this, "images", $file))
        {
            // First use of this image, get info

            if($type=='')
            {
                $pos = strrpos($file,'.');
                if(!$pos) {
					this.PDFError('Image file has no extension and no type was specified: '+$file);
				}
                $type = substr($file,$pos+1);
            }
            $type = strtolower($type);
            if($type=='jpeg')
            $type = 'jpg';
            $mtd = '_parse'+$type;
            if(!method_exists(this,$mtd)) {
				this.PDFError('Unsupported image type: '+$type);
			} else {
				
			}
            $info = this[$mtd]($file);
            $info['i'] = count(this.images, true)+1;
            
            
            this.images[$file] = $info;
        }
        else {
			$info = this.images[$file];
		}
        
        // Automatic width and height calculation if needed
        if($w==0 && $h==0)
        {
            // Put image at 96 dpi
            $w = -96;
            $h = -96;
        }
        if($w < 0){
			$w = -$info['w']*72/$w/this.k;
			
		}
        if($h<0) {
			$h = -$info['h']*72/$h/this.k;
		}
        if($w==0) {
			$w = $h*$info['w']/$info['h'];
			
		}
        if($h==0) {
			$h = $w*$info['h']/$info['w'];
		}
        // Flowing mode
        if($y===null)
        {
            if(this.y+$h>this.PageBreakTrigger && !this.InHeader && !this.InFooter && this.AcceptPageBreak())
            {
                // Automatic page break
                $x2 = this.x;
                this.AddPage(this.CurOrientation,this.CurPageSize);
                this.x = $x2;
            }
            $y = this.y;
            this.y += $h;
        }
        
        if($x===null)
			$x = this.x;
		
        this._out(sprintf('q %.2F 0 0 %.2F %.2F %.2F cm /I%d Do Q',$w*this.k,$h*this.k,$x*this.k,(this.h-($y+$h))*this.k,$info['i']));
        if($link)
			this.Link($x,$y,$w,$h,$link);
},

    GetX : function() {
        
        // Get x position

        return this.x;
},

    SetX : function($x) {
        
        // Set x position

        if($x>=0)
        this.x = $x;
        else
        this.x = this.w+$x;
},

    GetY : function() {
        
        // Get y position

        return this.y;
},

    SetY : function($y) {
        
        // Set y position and reset x

        this.x = this.lMargin;
        if($y>=0)
        this.y = $y;
        else
        this.y = this.h+$y;
},

    SetXY : function($x, $y) {
        
        // Set x and y positions

        this.SetY($y);
        this.SetX($x);
},

    Output : function($name, $dest) {
		$name = $name ? $name : '';
		$dest = $dest ? $dest : '';
        var $f;
        // Output PDF to some destination

        if(this.state<3)
			this.Close();
        $dest = strtoupper($dest);
        if($dest=='')
        {
            if($name=='')
            {
                $name = 'doc.pdf';
                $dest = 'I';
            }
            else
				$dest = 'F';
        }
        switch($dest)
        {
            case 'I':
            // Send to standard output

            this._checkoutput();
            if(PHP_SAPI!='cli')//TODO define it
            {
                // We send to a browser

                header('Content-Type: application/pdf');
                header('Content-Disposition: inline; filename="'+$name+'"');
                header('Cache-Control: private, max-age=0, must-revalidate');
                header('Pragma: public');
            }
            //echo this.buffer;
            
            break;
            case 'D':
            // Download file

            this._checkoutput();
            header('Content-Type: application/x-download');
            header('Content-Disposition: attachment; filename="'+$name+'"');
            header('Cache-Control: private, max-age=0, must-revalidate');
            header('Pragma: public');
            //echo this.buffer;
            
            break;
            case 'F':
            // Save to local file

            /*$f = fopen($name,'wb');
            if(!$f)
            this.PDFError('Unable to create output file: '+$name);
            fwrite($f,this.buffer,strlen(this.buffer));
            fclose($f);*/
            //PHP.file_put_contents($name, this.buffer);
            Qt.writefile($name, this.buffer);
            break;
            case 'S':
            // Return as a string

            return this.buffer;
            default:
            this.PDFError('Incorrect output destination: '+$dest);
        }
        return '';
},

/*******************************************************************************
*                                                                              *
*                              Protected methods                               *
*                                                                              *
*******************************************************************************/
    _dochecks : function() {
        
        // Check availability of %F

        ////if(sprintf('%.1F',1.0)!='1.0')
			////this.PDFError('This version of PHP is not supported');
        // Check mbstring overloading

        ////if(ini_get('mbstring.func_overload') & 2)
			////this.PDFError('mbstring overloading must be disabled');
        // Ensure runtime magic quotes are disabled

        /*if(get_magic_quotes_runtime())
			@set_magic_quotes_runtime(0);*/
},

    _checkoutput : function() {
        /*var $file, $line;
        if(PHP_SAPI!='cli')
        {
            if(headers_sent($file,$line))
            this.PDFError("Some data has already been output, can't send PDF file (output started at $file:$line)");
        }
        if(ob_get_length())
        {
            // The output buffer is not empty

            if(preg_match('/^(\xEF\xBB\xBF)?\s*$/',ob_get_contents()))
            {
                // It contains only a UTF-8 BOM and/or whitespace, let's clean it

                ob_clean();
            }
            else
            this.PDFError("Some data has already been output, can't send PDF file");
        }*/
},

    _getpagesize : function($size) {
		
        var $a;
        if(is_string($size))
        {
            $size = strtolower($size);
            if(!isset(this, "StdPageSizes", $size))
				this.PDFError('Unknown page size: '+$size);
            $a = this.StdPageSizes[$size];
            return [$a[0]/this.k, $a[1]/this.k];
        }
        else
        {
            if($size[0]>$size[1])
				return [$size[1], $size[0]];
            else
				return $size;
        }
},

    _beginpage : function($orientation, $size) {
        this.page++;
        this.pages[this.page] = '';
        this.state = 2;
        this.x = this.lMargin;
        this.y = this.tMargin;
        this.FontFamily = '';
        // Check page size and orientation

        if($orientation=='')
        $orientation = this.DefOrientation;
        else
        $orientation = strtoupper($orientation[0]);
        if($size=='') {
			$size = this.DefPageSize;
		}
        else {
			$size = this._getpagesize($size);
		}
        if($orientation!=this.CurOrientation || $size[0]!=this.CurPageSize[0] || $size[1]!=this.CurPageSize[1])
        {
            // New size or orientation

            if($orientation=='P')
            {
                this.w = $size[0];
                this.h = $size[1];
            }
            else
            {
                this.w = $size[1];
                this.h = $size[0];
            }
            this.wPt = this.w*this.k;
            this.hPt = this.h*this.k;
            this.PageBreakTrigger = this.h-this.bMargin;
            this.CurOrientation = $orientation;
            this.CurPageSize = $size;
        }
        if($orientation!=this.DefOrientation || $size[0]!=this.DefPageSize[0] || $size[1]!=this.DefPageSize[1])
			this.PageSizes[this.page] = [this.wPt, this.hPt];
},

    _endpage : function() {
        
        this.state = 1;
},

    _loadfont : function($font) {
        if(!isset(window, $font)) {
			this.PDFError('Could not include font definition file ' + $font);
		}
        return window[$font];
},

    _escape : function($s) {
        // Escape special characters in strings
        $s = str_replace('\\','\\\\',$s);
        $s = str_replace('(','\\(',$s);
        $s = str_replace(')','\\)',$s);
        $s = str_replace("\r",'\\r',$s);
        return $s;
},

    _textstring : function($s) {
        
        // Format a text string

        return '('+this._escape($s)+')';
},

    _UTF8toUTF16 : function($s) {
        var $res, $nb, $i, $c1, $c2, $c3;
        // Convert UTF-8 to UTF-16BE with BOM

        $res = "\xFE\xFF";//TODO тут много думать, как такое в JS провернуть Скорее всего массив чисел
        $nb = strlen($s);
        $i = 0;
        while($i<$nb)
        {
            $c1 = ord( $s.charAt($i++) );
            if($c1>=224)
            {
                // 3-byte character

                $c2 = ord($s[$i++]);
                $c3 = ord($s[$i++]);
                $res += chr((($c1 & 0x0F)<<4) + (($c2 & 0x3C)>>2)); //тут помещаем это в массив
                $res += chr((($c2 & 0x03)<<6) + ($c3 & 0x3F));
            }
            else if($c1>=192)
            {
                // 2-byte character

                $c2 = ord( $s.charAt($i++) );
                $res += chr(($c1 & 0x1C)>>2);	//тут помещаем это в массив
                $res += chr((($c1 & 0x03)<<6) + ($c2 & 0x3F));
            }
            else
            {
                // Single-byte character
                $res += "\0"+chr($c1); //тут помещаем это в массив
            }
        }
        //TODO тут по одному числу цепляем к строке use fromCharCode
        return $res;
},

    _dounderline : function($x, $y, $txt) {
        var $up, $ut, $w;
        // Underline text

        $up = this.CurrentFont['up'];
        $ut = this.CurrentFont['ut'];
        $w = this.GetStringWidth($txt)+this.ws*substr_count($txt,' ');
        return sprintf('%.2F %.2F %.2F %.2F re f',$x*this.k,(this.h-($y-$up/1000*this.FontSize))*this.k,$w*this.k,-$ut/1000*this.FontSizePt);
},

    _parsejpg : function($file) {
		
		return;	

        var $a, $colspace, $bpc, $data;
        // Extract info from a JPEG file

        $a = getimagesize($file);
        if(!$a)
        this.PDFError('Missing or incorrect image file: '+$file);
        if($a[2]!=2)
        this.PDFError('Not a JPEG file: '+$file);
        if(!isset($a, 'channels') || $a['channels']==3)
        $colspace = 'DeviceRGB';
        else if($a['channels']==4)
        $colspace = 'DeviceCMYK';
        else
        $colspace = 'DeviceGray';
        $bpc = isset($a, 'bits') ? $a['bits'] : 8;
        $data = file_get_contents($file);
        return {'w':$a[0], 'h':$a[1], 'cs':$colspace, 'bpc':$bpc, 'f':'DCTDecode', 'data':$data};
},

    _parsepng : function($file) {
        var $f, $info;
        // Extract info from a PNG file

        /*$f = fopen($file,'rb');
        if(!$f)
			this.PDFError('Can\'t open image file: '+$file);
        $info = this._parsepngstream($f,$file);
        fclose($f);*/
        if (!PHP.file_exists($file)) {
			this.PDFError('Can\'t open image file: '+$file);
		}
		window.binaryFiles = window.binaryFiles || {};
		window.binaryFiles[$file] = {offset:0};
		$info = this._parsepngstream($file,$file);//!! специально, т к будем работать с именем файла
		delete window.binaryFiles[$file];//это вместо fclose
        return $info;
},

    _parsepngstream : function($f, $file) {
		
		
		var $w, $h, $bpc, $ct, $colspace, $dp, $pal, $trns, $data, $n, $type, $t, $pos, $info, $color, $alpha, $len, $i, $line;
        // Check signature
		var r = this._readstream($f, 8);
		
        if(r != chr(137)+'PNG'+chr(13)+chr(10)+chr(26)+chr(10))
			this.PDFError('Not a PNG file: '+$file);
        // Read header chunk
        
		
		
        this._readstream($f,4);
        
        
        
        if(this._readstream($f,4)!='IHDR') {
			this.PDFError('Incorrect PNG file: '+$file);
		}
		
        $w = this._readint($f);
        $h = this._readint($f);
        $bpc = ord(this._readstream($f,1));
        if($bpc>8)
			this.PDFError('16-bit depth not supported: '+$file);
        $ct = ord(this._readstream($f,1));
        
        if($ct==0 || $ct==4)
			$colspace = 'DeviceGray';
        else if($ct==2 || $ct==6)
			$colspace = 'DeviceRGB';
        else if($ct==3)
			$colspace = 'Indexed';
        else
			this.PDFError('Unknown color type: '+$file);
        if(ord(this._readstream($f,1))!=0)
			this.PDFError('Unknown compression method: '+$file);
        if(ord(this._readstream($f,1))!=0)
			this.PDFError('Unknown filter method: '+$file);
        if(ord(this._readstream($f,1))!=0)
			this.PDFError('Interlacing not supported: '+$file);
        this._readstream($f,4);
        $dp = '/Predictor 15 /Colors '+($colspace=='DeviceRGB' ? 3 : 1)+' /BitsPerComponent '+$bpc+' /Columns '+$w;
        
        // Scan chunks looking for palette, transparency and image data

        $pal = '';
        $trns = '';
        $data = '';
        do
        {
            $n = this._readint($f);
            $type = this._readstream($f,4);
            if($type=='PLTE')
            {
                // Read palette

                $pal = this._readstream($f,$n);
                this._readstream($f,4);
            }
            else if($type=='tRNS')
            {
                // Read transparency info

                $t = this._readstream($f,$n);
                if($ct==0)
                $trns = [ord(substr($t,1,1))];
                else if($ct==2)
                $trns = [ord(substr($t,1,1)), ord(substr($t,3,1)), ord(substr($t,5,1))];
                else
                {
                    $pos = strpos($t,chr(0));
                    if($pos !== false)
                    $trns = [$pos];
                }
                this._readstream($f,4);
            }
            else if($type=='IDAT')
            {
                // Read image data block

                $data += this._readstream($f,$n);
                this._readstream($f,4);
            }
            else if($type=='IEND')
            break;
            else
            this._readstream($f,$n+4);
        }
        while($n);
        
        if($colspace=='Indexed' && empty($pal))
			this.PDFError('Missing palette in '+$file);
        $info = {'w':$w, 'h':$h, 'cs':$colspace, 'bpc':$bpc, 'f':'FlateDecode', 'dp':$dp, 'pal':$pal, 'trns':$trns};
        if($ct>=4)
        {
            // Extract alpha channel

            if(!function_exists('gzuncompress'))
            this.PDFError('Zlib not available, can\'t handle alpha channel: '+$file);
            $data = gzuncompress($data);
            $color = '';
            $alpha = '';
            if($ct==4)
            {
                // Gray image

                $len = 2*$w;
                for($i=0;$i<$h;$i++)
                {
                    $pos = (1+$len)*$i;
                    $color += $data[$pos];
                    $alpha += $data[$pos];
                    $line = substr($data,$pos+1,$len);
                    $color += preg_replace('/(.)./s','$1',$line);
                    $alpha += preg_replace('/.(.)/s','$1',$line);
                }
            }
            else
            {
                // RGB image

                $len = 4*$w;
                for($i=0;$i<$h;$i++)
                {
                    $pos = (1+$len)*$i;
                    $color += $data[$pos];
                    $alpha += $data[$pos];
                    $line = substr($data,$pos+1,$len);
                    $color += preg_replace('/(.{3})./s','$1',$line);
                    $alpha += preg_replace('/.{3}(.)/s','$1',$line);
                }
            }
            unset($data);
            $data = gzcompress($color);
            $info['smask'] = gzcompress($alpha);
            if(this.PDFVersion<'1.4')
            this.PDFVersion = '1.4';
        }
        $info['data'] = $data;
        
        return $info;
},

    _readstream : function($f, $n) {
		var s = this.readFileAsBinaryString($f), a, i, r = '',
			offset = window.binaryFiles[$f].offset;
		
		a = s.split(',');
		for (i = window.binaryFiles[$f].offset; i < offset + $n; i++) {
			r += chr(parseInt(a[i]));
			window.binaryFiles[$f].offset++;
		}
		return r;
		
        var $res, $s;
        // Read n bytes from stream
        $res = '';
        while($n>0 && !feof($f))
        {
            $s = fread($f,$n);
            if($s===false)
            this.PDFError('Error while reading stream');
            $n -= strlen($s);
            $res += $s;
        }
        if($n>0)
			this.PDFError('Unexpected end of stream');
        return $res;
},

    _readint : function($f) {
		var arr = this._readstream($f,4), i, res = 0;
		for (i = 0; i < arr.length; i++) {
			res  = res << 8;
			var n = parseInt(arr.charCodeAt(i));
			
			res += n;
		}
		
		return res;
		
        var $a;
        // Read a 4-byte integer from stream
        $a = unpack('Ni',this._readstream($f,4));
        return $a['i'];
},

    _parsegif : function($file) {
		
		return;	
        var $im, $f, $data, $info, $tmp;
        // Extract info from a GIF file (via PNG conversion)

        if(!function_exists('imagepng'))
        this.PDFError('GD extension is required for GIF support');
        if(!function_exists('imagecreatefromgif'))
        this.PDFError('GD has no GIF read support');
        $im = imagecreatefromgif($file);
        if(!$im)
        this.PDFError('Missing or incorrect image file: '+$file);
        imageinterlace($im,0);
        $f = fopen('php://temp','rb+');
        if($f)
        {
            // Perform conversion in memory

            ob_start();
            imagepng($im);
            $data = ob_get_clean();
            imagedestroy($im);
            fwrite($f,$data);
            rewind($f);
            $info = this._parsepngstream($f,$file);
            fclose($f);
        }
        else
        {
            // Use temporary file

            $tmp = tempnam('.','gif');
            if(!$tmp)
            this.PDFError('Unable to create a temporary file');
            if(!imagepng($im,$tmp))
            this.PDFError('Error while saving to temporary file');
            imagedestroy($im);
            $info = this._parsepng($tmp);
            unlink($tmp);
        }
        return $info;
},

    _newobj : function() {
        // Begin a new object
        this.n++;
        this.offsets[this.n] = strlen(this.buffer);
        this._out(this.n+' 0 obj');
},

    _putstream : function($s, isBinaryString) {
        
        this._out('stream');
        this._out($s, isBinaryString);
        this._out('endstream');
},

    _out : function($s, isBinaryString) {
        // Add a line to the document
        if (isBinaryString) {
			var tag = 'QDJS_BINARY';
			$s = tag + '10,' + $s + '/' + tag;
		}
        if(this.state==2){
			this.pages[this.page] += $s+"\n";
		}
        else {
			this.buffer += $s+"\n";
		}
},

    _putpages : function() {
        var $nb, $n, $wPt, $hPt, $filter, $annots, $pl, $rect, $l, $h, $p, $kids, $i, phpjslocvar_0;
        $nb = this.page;
        if(!empty(this.AliasNbPages))
        {
            // Replace number of pages

            for($n=1;$n<=$nb;$n++)
            this.pages[$n] = str_replace(this.AliasNbPages,$nb,this.pages[$n]);
        }
        if(this.DefOrientation=='P')
        {
            $wPt = this.DefPageSize[0]*this.k;
            $hPt = this.DefPageSize[1]*this.k;
        }
        else
        {
            $wPt = this.DefPageSize[1]*this.k;
            $hPt = this.DefPageSize[0]*this.k;
        }
        $filter = (this.compress) ? '/Filter /FlateDecode ' : '';
        for($n=1;$n<=$nb;$n++)
        {
            // Page

            this._newobj();
            this._out('<</Type /Page');
            this._out('/Parent 1 0 R');
            if(isset(this, "PageSizes", $n))
            this._out(sprintf('/MediaBox [0 0 %.2F %.2F]',this.PageSizes[$n][0],this.PageSizes[$n][1]));
            this._out('/Resources 2 0 R');
            if(isset(this, "PageLinks", $n))
            {
                // Links

                $annots = '/Annots [';
                for (phpjslocvar_0 in this.PageLinks[$n]) { $pl = this.PageLinks[$n][phpjslocvar_0];
                    $rect = sprintf('%.2F %.2F %.2F %.2F',$pl[0],$pl[1],$pl[0]+$pl[2],$pl[1]-$pl[3]);
                    $annots += '<</Type /Annot /Subtype /Link /Rect ['+$rect+'] /Border [0 0 0] ';
                    if(is_string($pl[4]))
                    $annots += '/A <</S /URI /URI '+this._textstring($pl[4])+'>>>>';
                    else
                    {
                        $l = this.links[$pl[4]];
                        $h = isset(this, "PageSizes", $l, "0") ? this.PageSizes[$l[0]][1] : $hPt;
                        $annots += sprintf('/Dest [%d 0 R /XYZ 0 %.2F null]>>',1+2*$l[0],$h-$l[1]*this.k);
                    }
                }
                this._out($annots+']');
            }
            if(this.PDFVersion>'1.3')
            this._out('/Group <</Type /Group /S /Transparency /CS /DeviceRGB>>');
            this._out('/Contents '+(this.n+1)+' 0 R>>');
            this._out('endobj');
            // Page content

            $p = (this.compress) ? gzcompress(this.pages[$n]) : this.pages[$n];
            this._newobj();
            this._out('<<'+$filter+'/Length '+strlen($p)+'>>');
            this._putstream($p);
            this._out('endobj');
        }
        // Pages root

        this.offsets[1] = strlen(this.buffer);
        this._out('1 0 obj');
        this._out('<</Type /Pages');
        $kids = '/Kids [';
        for($i=0;$i<$nb;$i++)
        $kids += (3+2*$i)+' 0 R ';
        this._out($kids+']');
        this._out('/Count '+$nb);
        this._out(sprintf('/MediaBox [0 0 %.2F %.2F]',$wPt,$hPt));
        this._out('>>');
        this._out('endobj');
},

    _putfonts : function() {
        var $nf, $diff, $file, $info, $font, $compressed, $k, $type, $name, $cw, $s, $i, $v, $mtd, phpjslocvar_0;
        $nf = this.n;
        for (phpjslocvar_0 in this.diffs) { $diff = this.diffs[phpjslocvar_0];
            // Encodings

            this._newobj();
            this._out('<</Type /Encoding /BaseEncoding /WinAnsiEncoding /Differences ['+$diff+']>>');
            this._out('endobj');
        }
        for ($file in this.FontFiles) { $info = this.FontFiles[$file];
            // Font file embedding

            this._newobj();
            this.FontFiles[$file]['n'] = this.n;
            //$font = Qt.readFileAsBinaryString(Qt.appDir() + '/' + $file);
            $font = 'QDJS_BIN_FILE' + Qt.appDir() + '/' + $file + '/QDJS_BIN_FILE';
            
            
            if(!$font)
				this.PDFError('Font file not found: '+$file);
			var a = $file.split('.');
            $compressed = (a[1] == 'z');
            
            if(!$compressed && isset($info, 'length2')) {
				$font = substr($font,6,$info['length1'])+substr($font,6+$info['length1']+6,$info['length2']);
			}
            this._out('<</Length '+strlen($font));
            if($compressed) {
				this._out('/Filter /FlateDecode');
			}
            this._out('/Length1 '+$info['length1']);
            if(isset($info, 'length2'))
				this._out('/Length2 '+$info['length2']+' /Length3 0');
            this._out('>>');
            this._putstream($font);
			
            this._out('endobj');
        }
        
        for ($k in this.fonts) { $font = this.fonts[$k];
            // Font objects

            this.fonts[$k]['n'] = this.n+1;
            $type = $font['type'];
            $name = $font['name'];
            if($type=='Core')
            {
                // Core font

                this._newobj();
                this._out('<</Type /Font');
                this._out('/BaseFont /'+$name);
                this._out('/Subtype /Type1');
                if($name!='Symbol' && $name!='ZapfDingbats')
                this._out('/Encoding /WinAnsiEncoding');
                this._out('>>');
                this._out('endobj');
            }
            else if($type=='Type1' || $type=='TrueType')
            {
                // Additional Type1 or TrueType/OpenType font

                this._newobj();
                this._out('<</Type /Font');
                this._out('/BaseFont /'+$name);
                this._out('/Subtype /'+$type);
                this._out('/FirstChar 32 /LastChar 255');
                this._out('/Widths '+(this.n+1)+' 0 R');
                this._out('/FontDescriptor '+(this.n+2)+' 0 R');
                if(isset($font, 'diffn'))
                this._out('/Encoding '+($nf+$font['diffn'])+' 0 R');
                else
                this._out('/Encoding /WinAnsiEncoding');
                this._out('>>');
                this._out('endobj');
                // Widths

                this._newobj();
                $cw = $font['cw'];
                $s = '[';
                for($i=32;$i<=255;$i++)
                $s += $cw[chr($i)]+' ';
                this._out($s+']');
                this._out('endobj');
                // Descriptor

                this._newobj();
                $s = '<</Type /FontDescriptor /FontName /'+$name;
                for(var $k in $font['desc'] ) {
					$v = $font['desc'][$k];
					$s += ' /'+$k+' '+$v;
				}
                if(!empty($font['file']))
					$s += ' /FontFile'+($type=='Type1' ? '' : '2')+' '+this.FontFiles[$font['file']]['n']+' 0 R';
                this._out($s+'>>');
                this._out('endobj');
            }
            else
            {
                // Allow for additional types
                $type = null;
                $mtd = '_put' + strtolower($type);
                if(!method_exists(this, $mtd))
					this.PDFError('Unsupported font type: '+$type);
                this[$mtd]($font);
            }
        }
},

    _putimages : function() {
        var $file, phpjslocvar_0;
        for (phpjslocvar_0 in this.images) {
			$file = this.images[phpjslocvar_0];
			
            //this._putimage(this.images[$file]);
            this._putimage($file);
            //delete this.images[$file]['data'];
            //delete this.images[$file]['smask'];
            delete $file['data'];
            delete $file['smask'];
        }
},

    _putimage : function($info) {
		
        var $trns, $i, $dp, $smask, $filter, $pal;
        this._newobj();
        $info['n'] = this.n;
        this._out('<</Type /XObject');
        this._out('/Subtype /Image');
        this._out('/Width '+$info['w']);
        this._out('/Height '+$info['h']);
        if($info['cs']=='Indexed')
        this._out('/ColorSpace [/Indexed /DeviceRGB '+(strlen($info['pal'])/3-1)+' '+(this.n+1)+' 0 R]');
        else
        {
            this._out('/ColorSpace /'+$info['cs']);
            if($info['cs']=='DeviceCMYK')
            this._out('/Decode [1 0 1 0 1 0 1 0]');
        }
        this._out('/BitsPerComponent '+$info['bpc']);
        if(isset($info, 'f'))
        this._out('/Filter /'+$info['f']);
        if(isset($info, 'dp'))
        this._out('/DecodeParms <<'+$info['dp']+'>>');
        if(isset($info, 'trns') && is_array($info['trns']))
        {
            $trns = '';
            for($i=0;$i<count($info['trns']);$i++)
            $trns += $info['trns'][$i]+' '+$info['trns'][$i]+' ';
            this._out('/Mask ['+$trns+']');
        }
        if(isset($info, 'smask'))
        this._out('/SMask '+(this.n+1)+' 0 R');
        this._out('/Length '+strlen($info['data'])+'>>');
        this._putstream($info['data']);
        this._out('endobj');
        // Soft mask

        if(isset($info, 'smask'))
        {
            $dp = '/Predictor 15 /Colors 1 /BitsPerComponent 8 /Columns '+$info['w'];
            $smask = {'w':$info['w'], 'h':$info['h'], 'cs':'DeviceGray', 'bpc':8, 'f':$info['f'], 'dp':$dp,
            'data':$info['smask']};
            this._putimage($smask);
        }
        // Palette

        if($info['cs']=='Indexed')
        {
            $filter = (this.compress) ? '/Filter /FlateDecode ' : '';
            $pal = (this.compress) ? gzcompress($info['pal']) : $info['pal'];
            this._newobj();
            this._out('<<'+$filter+'/Length '+strlen($pal)+'>>');
            this._putstream($pal);
            this._out('endobj');
        }
},

    _putxobjectdict : function() {
        var $image, ppjjss0;
        for(ppjjss0 in this.images  ) {
			$image = this.images[ppjjss0];
			this._out('/I'+$image['i']+' '+$image['n']+' 0 R');
		}
},

    _putresourcedict : function() {
        var $font, ppjjss1;
        this._out('/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]');
        this._out('/Font <<');
        for(ppjjss1 in this.fonts) {
			$font = this.fonts[ppjjss1];
			this._out('/F'+$font['i']+' '+$font['n']+' 0 R');
		}
        this._out('>>');
        this._out('/XObject <<');
        this._putxobjectdict();
        this._out('>>');
},

    _putresources : function() {
        
        this._putfonts();
        this._putimages();
        // Resource dictionary

        this.offsets[2] = strlen(this.buffer);
        this._out('2 0 obj');
        this._out('<<');
        this._putresourcedict();
        this._out('>>');
        this._out('endobj');
},

    _putinfo : function() {
        
        this._out('/Producer '+this._textstring('FPDF '+FPDF_VERSION));
        if(!empty(this.title))
        this._out('/Title '+this._textstring(this.title));
        if(!empty(this.subject))
        this._out('/Subject '+this._textstring(this.subject));
        if(!empty(this.author))
        this._out('/Author '+this._textstring(this.author));
        if(!empty(this.keywords))
        this._out('/Keywords '+this._textstring(this.keywords));
        if(!empty(this.creator))
        this._out('/Creator '+this._textstring(this.creator));
        this._out('/CreationDate '+this._textstring('D:'+ date('YmdHis')));
},

    _putcatalog : function() {
        
        this._out('/Type /Catalog');
        this._out('/Pages 1 0 R');
        if(this.ZoomMode=='fullpage')
        this._out('/OpenAction [3 0 R /Fit]');
        else if(this.ZoomMode=='fullwidth')
        this._out('/OpenAction [3 0 R /FitH null]');
        else if(this.ZoomMode=='real')
        this._out('/OpenAction [3 0 R /XYZ null null 1]');
        else if(!is_string(this.ZoomMode))
        this._out('/OpenAction [3 0 R /XYZ null null '+sprintf('%.2F',this.ZoomMode/100)+']');
        if(this.LayoutMode=='single')
        this._out('/PageLayout /SinglePage');
        else if(this.LayoutMode=='continuous')
        this._out('/PageLayout /OneColumn');
        else if(this.LayoutMode=='two')
        this._out('/PageLayout /TwoColumnLeft');
},

    _putheader : function() {
        
        this._out('%PDF-'+this.PDFVersion);
},

    _puttrailer : function() {
        
        this._out('/Size '+(this.n+1));
        this._out('/Root '+this.n+' 0 R');
        this._out('/Info '+(this.n-1)+' 0 R');
},

    _enddoc : function() {
        var $o, $i;
        this._putheader();
        this._putpages();
        this._putresources();
        // Info

        this._newobj();
        this._out('<<');
        this._putinfo();
        this._out('>>');
        this._out('endobj');
        // Catalog

        this._newobj();
        this._out('<<');
        this._putcatalog();
        this._out('>>');
        this._out('endobj');
        // Cross-ref

        $o = strlen(this.buffer);
        this._out('xref');
        this._out('0 '+(this.n+1));
        this._out('0000000000 65535 f ');
        for($i=1;$i<=this.n;$i++)
        this._out(sprintf('%010d 00000 n ',this.offsets[$i]));
        // Trailer

        this._out('trailer');
        this._out('<<');
        this._puttrailer();
        this._out('>>');
        this._out('startxref');
        this._out($o);
        this._out('%%EOF');
        this.state = 3;
},

readFileAsBinaryString:function($f) {
	window.binaryFilesCache =  window.binaryFilesCache || {};
	if (window.binaryFilesCache[$f]) {
		return window.binaryFilesCache[$f];
	}
	window.binaryFilesCache[$f] = Qt.readFileAsBinaryString($f);
	
	return window.binaryFilesCache[$f];
}

// End of class

};
