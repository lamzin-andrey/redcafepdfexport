'use strict';
/**
 * Finally Singleton - не наследоваться от него, создается только один экземпляр класса
 * @description Логика формы настройки печати
 * 
 * @param {Sprite} S    спрайт, в котором отображаются выкройки
 * @param {Graphics} G  S.graphics 
 * @param {Function} plural Функция, таким образом экономлю на объеме кода (не надо создавать shared объект - библотеку)
 * @param {Function} req Функция, таким образом экономлю на объеме кода
 * @param {Function} preloader Функция, таким образом экономлю на объеме кода
 * @param {Function} appErrorHandle Функция, таким образом экономлю на объеме кода
 * @param {Function} showError Функция, таким образом экономлю на объеме кода
 * @param {Function} cb Функция, таким образом экономлю на объеме кода
*/
function PersonalFormSetting(G, S, callback, plural, req, preloader, appErrorHandle, showError, cb) {
	if (PersonalFormSetting.inst) {
		return PersonalFormSetting.inst;
	}
	this.plural = plural;
	this.req = req;
	this.preloader = preloader;
	this.appErrorHandle = appErrorHandle;
	this.alert = showError;
	this.cb = cb;
	this.G = G;
	this.S = S;
	this.callback = callback;
	this.pageNumperMargin = 4;
	this.PAGE_WILL_PRINT = 1;
	this.PAGE_OVER_LIMIT = 2;
	this.PAGE_SKIP       = 3;
	this.MODE_ALL        = 1;
	this.MODE_SELECTED   = 2;
	/** @property printMode Определяет режим печати: с ожиданием или за деньги */
	/** @property MODE_PRINT_LIMITED Определяет, что пользователь находится в режиме печати с ожиданием */
	this.MODE_PRINT_LIMITED = 1;
	/** @property MODE_PRINT_COIN Определяет, что пользователь находится в режиме печати за деньги */
	this.MODE_PRINT_COIN = 2;
	this.format = 'A4';
	this.frameColor = 0x909090;
	/** @property {Number} fileId текущий файл */
	/** @property {Number} balance баланс пользователя */
	/** @property {Number} listsPerCoin  сколько листов пользователь может распечатать за 1 redcoin */
	/** @property {$(HTMLInput)} iSelectPage поле ввода для выбора страниц, которые будут экспортироваться */
	/** @property {$(HTMLInput)} iPrintAll поле ввода для выбора всех страниц */
	/** @property {$(HTMLInput)} iGridOn поле ввода для включения и выключения сантиметровой разметки */
	/** @property {$(HTMLInput)} iPortrait поле ввода для выбора портретной ориентации */
	/** @property {$(HTMLInput)} iAlbum поле ввода для выбора альбомной ориентации */
	/** @property {$(HTMLButton)} bPrintNow кнопка экспорта в pdf */
	/** @property {$(HTMLButton)} iPlotFrameOff чекбокс для установки, печатаем или не печатаем рамку и ушолки при печати на плоттере*/
	/** @property {$(HTMLButton)} bShowInputMetaForm кнопка открытия формы ввода имени файла и даты */
	/** @property {$(HTMLSelect)} iFormat поле ввода для выбора формата страницы */
	/** @property {$(HTMLElement)} vBalance представление текущего баланса */
	/** @property {$(HTMLElement)} vTotalPages представление общего количества страниц */
	/** @property {$(HTMLElement)} vSelectedPages представление количества страниц, которые будут распечатаны */
	/** @property {$(HTMLElement)} vСoinPricePrint представление стоимости печати в редкоинах */
	/** @property {$(HTMLElement)} vСoinPricePrint2 представление стоимости печати в редкоинах */
	/** @property {$(HTMLElement)} vBalanceAfterPrint представление баланса после печати */
	/** @property {$(HTMLElement)} vInfoPrintModeCoin представление информации о балансе в режиме печати за деньги */
	/** @property {$(HTMLElement)} vInfoPrintModeLim представление информации о балансе в режиме печати за время ожидания */
	/** @property {$(HTMLElement)} vListsPerCoin представление информации о количестве листов, которые можно напечатать за один раз */
	/** @property {$(HTMLElement)} vListsPerCoinLegend представление суффикса информации (листа - литов - лист) о количестве листов, которые можно напечатать за один раз */
	
	$('#iDateLabel').val('Дата / Date');
	$('#iFilenameLabel').val('Имя файла / Filename');
	$('#iDateVal').val('');
	$('#iFilenameVal').val('');
	//TODO все методы класса определить через this.fName =  function(){} так как наследоваться не будем и это синглтон 
	this.setListeners();
	PersonalFormSetting.inst = this;
}//end class

/**
 * @param {Object} view - получен вызовом Sprite::toArray (на клиенте этого метода нет для экономии места), но есть fromObject восстанавливающий данные)
 * @param {Number} balance - баланс пользователя в редкоинах
 * @param {Number} listsPerCoin - сколько листов можно распечатать за один редкоин
*/
PersonalFormSetting.prototype.onViewData = function(view, balance, listsPerCoin) {
	this.balance = balance ? balance : this.balance;
	this.listsPerCoin = listsPerCoin ? listsPerCoin : this.listsPerCoin;
	this.scaleViewData(view);
	this.S.fromObject(this.S, view);
	this._mapPages();
	//console.log(this.S);
	this.addGridSprites();
	this.setPagesStatusIcon();
	//TODO в зависимости от режима показывать соотв. инфо поле
	if (this.printMode == this.MODE_PRINT_LIMITED) {
		this.vInfoPrintModeCoin.addClass('hide');
		this.vInfoPrintModeLim.removeClass('hide');
	} else {
		this.vInfoPrintModeCoin.removeClass('hide');
		this.vInfoPrintModeLim.addClass('hide');
	}
}
/**
 * @description Переписывает координаты таким образом, чтобы превью в начальном масштабе 1:1 "помещалось" на холсте
 * @param {Object} view - получен вызовом Sprite::toArray (на клиенте этого метода нет для экономии места), но есть fromObject восстанавливающий данные)
*/
PersonalFormSetting.prototype.scaleViewData = function(view) {
	//console.log(view);
	this.shiftPoints(view);//избавиться от отрицательных
	this.sc = (SE2D.w - view.x) / this.vdMaxX;
	var scy = (SE2D.h - view.y) / this.vdMaxY;
	if (scy < this.sc) {
		this.sc = scy;
	}
	this.scaleData(view); //масштабировать
}
/**
 * @description Находит максимальные координаты, попутно корректирует толщину линий и задает параметры текста
 * @param {Object} view - получен вызовом Sprite::toArray (на клиенте этого метода нет для экономии места), но есть fromObject восстанавливающий данные)
*/
PersonalFormSetting.prototype.shiftPoints = function(view) {
	this.vdMaxX = (this.vdMaxX ? this.vdMaxX : 0);
	this.vdMaxY = (this.vdMaxY ? this.vdMaxY : 0);
	this._searchMax([view], 0, 0);
}
/**
 * @description рекурсивно находит максимальные координаты в viewData
 * @param {Array} sprites - каждый элемент получен вызовом Sprite::toArray (на клиенте этого метода нет для экономии места), но есть fromObject восстанавливающий данные)
*/
PersonalFormSetting.prototype._searchMax = function(sprites, offsetX, offsetY) {
	var i, j, g, x, srcOX = offsetX, srcOY = offsetY;
	for (i = 0; i < sprites.length; i++) {
		if (sprites[i].text) {
			sprites[i].textFormat.size = 12;
			sprites[i].textFormat.font = 'Arial';
			sprites[i].textFormat.color = 0xAA0000;
			sprites[i].stroke = 1;
			var szSpr = sprites[i - 2];
			if (szSpr && szSpr.w && szSpr.h) {
				sprites[i].y = szSpr.h;
				sprites[i].x = szSpr.w;
			}
		}
		for (j = 0; j < sprites[i].graphics.length; j++) {
			g = sprites[i].graphics[j];
			if (g.thikness) {
				g.thikness /= 3;
			}
			
			offsetX += sprites[i].x;
			offsetY += sprites[i].y;
			
			x = g.x + offsetX;
			if (this.vdMaxX < x) {
				this.vdMaxX = x;
			}
			x = g.y + offsetY;
			if (this.vdMaxY < x) {
				this.vdMaxY = x;
			}
			if (g.type == this.G.TYPE_RECT) {
				x = g.x + g.w + offsetX;
				if (this.vdMaxX < x) {
					this.vdMaxX = x;
				}
				x = g.y + g.h + offsetY;
				if (this.vdMaxY < x) {
					this.vdMaxY = x;
				}
			}
			offsetX = srcOX;
			offsetY = srcOY;
		}
		this._searchMax(sprites[i].children, srcOX + sprites[i].x, srcOY + sprites[i].y);
	}
}
/**
 * @description Умножает все координаты на canwas.width / vdMaxX
 * @param {Object} view - получен вызовом Sprite::toArray (на клиенте этого метода нет для экономии места), но есть fromObject восстанавливающий данные)
*/
PersonalFormSetting.prototype.scaleData = function(view) {
	this._scaleData([view]);
}
/**
 * @description рекурсивно умножает все координаты на canwas.width / vdMaxX
 * @param {Array} sprites - каждый элемент получен вызовом Sprite::toArray (на клиенте этого метода нет для экономии места), но есть fromObject восстанавливающий данные)
*/
PersonalFormSetting.prototype._scaleData = function(sprites) {
	var i, j, g, x, sc = this.sc, t = new TextField('d');
	
	for (i = 0; i < sprites.length; i++) {
		for (j = 0; j < sprites[i].graphics.length; j++) {
			g = sprites[i].graphics[j];
			g.x *= sc;
			g.y *= sc;
			if (g.type == this.G.TYPE_RECT) {
				g.w *= sc;
				g.h *= sc;
			}
		}
		sprites[i].x *= sc;
		sprites[i].y *= sc;
		if (sprites[i].text) {
			t.setTextFormat( sprites[i].textFormat );
			t.text = sprites[i].text;
			sprites[i].y -= sprites[i].textFormat.size + this.pageNumperMargin;
			sprites[i].x -= t.textWidth + this.pageNumperMargin;
		}
		
		if (sprites[i].w) {
			sprites[i].w *= sc;
		}
		if (sprites[i].h) {
			sprites[i].h *= sc;
		}
		this._scaleData(sprites[i].children);
	}
}
/**
 * @description Отмена печати
*/
PersonalFormSetting.prototype.onCancelExport = function(e) {
	var o = this;
	o._clearViewMap();
	o.callback();
	if (o.printMode == o.MODE_PRINT_LIMITED) {
		o.req({fileId:o.fileId}, function(){}, function(){}, 'deleteWaitFile');
		o.printMode = o.MODE_PRINT_COIN;
	}
	return false;
}
/**
 * @description Выравнивание номера страницы и символа "будет распечатано" относительно правого нижнего угла листа
*/
PersonalFormSetting.prototype.setMetadataPosition = function() {
	//this._mapPages();
	if (this.textFields instanceof Array) {
		var i, t = new TextField('tmp'), S = this.S, iOk, iFail, buf;
		for (i = 0; i < this.textFields.length; i++) {
			if (this.pages[i]) {
				t.setTextFormat(this.textFields[i].textFormat);
				t.text = this.textFields[i].text;
				this.textFields[i].x = this.pages[i].w - (t.textWidth + this.pageNumperMargin) / S.scaleX;
				this.textFields[i].y = this.pages[i].h - (this.textFields[i].textFormat.size + this.pageNumperMargin) / S.scaleX;
				
				buf = this._getStatusIcons(this.pages[i]);
				iOk = buf[0];
				iFail = buf[1];
				iFail.x = iOk.x = this.textFields[i].x - (iOk.w/2 /*+ this.pageNumperMargin*/) / S.scaleX;
				iFail.y = iOk.y = this.pages[i].h - (iOk.h + 3 * this.pageNumperMargin) / S.scaleX;
			}
		}
	}
}
/**
 * @description В зависимости от средств у пользователя на балансе ставит соответствующую иконку на превью страницы
*/
PersonalFormSetting.prototype.setPagesStatusIcon = function() {
	//this._mapPages();
	var i, pair, status, cWillPrint = 0, L = this.pages.length;
	for (i = 0; i < L; i++) {
		pair = this._getStatusIcons(this.pages[i]);
		this.setMetadataPosition();
		status = this._pageWillPrint(i + 1);
		if (status == this.PAGE_WILL_PRINT) {
			pair[0].visible = true;
			pair[1].visible = false;
			this.pages[i].graphics._objects[0].color = this.frameColor;
			cWillPrint++;
		}
		if (status == this.PAGE_OVER_LIMIT) {
			pair[0].visible = false;
			pair[1].visible = true;
			this.pages[i].graphics._objects[0].color = 0xff0000;
		}
		if (status == this.PAGE_SKIP) {
			pair[1].visible = pair[0].visible = false;
			this.pages[i].graphics._objects[0].color = this.frameColor;
		}
	}
	
	this.vTotalPages.text(L + ' '  + this.plural(L, ['лист', 'листа', 'листов']) + ' ' + this.format);
	this.vSelectedPages.text(cWillPrint + ' ' + this.plural(cWillPrint, ['лист', 'листа', 'листов']) + ' ' + this.format);
	this.vBalance.text(this.balance);
	
	i = Math.ceil(cWillPrint * this._getA4InFormat(this.format) / this.listsPerCoin );
	this.vСoinPricePrint.text(i);
	this.vСoinPricePrint2.text(i);
	this.vBalanceAfterPrint.text(this.balance - i < 0 ? 0 : this.balance - i);
	this.vListsPerCoin.text(this.listsPerCoin);
	this.vListsPerCoinLegend.text( this.plural(this.listsPerCoin, ['лист', 'листа', 'листов']) );
}
/**
 * @description если иконок статуса нет, создает их
 * @return {Array} || {Boolean} массив с двумя иконками, галка и крест, (первая галка) или false если иконуи еще не загружены
*/
PersonalFormSetting.prototype._getStatusIcons = function(sprite) {
	var s = sprite.parentClip,
		gr = s.getChildByName('ok'),
		r = s.getChildByName('fail'),
		o = this;
	function t(id) {
		var q = SE2D._root[id].clone(0, 0, id + '_temp', 0);
		s.addChild(q);
		q.id = id;
		s.childsMap[id] = s.childsMap[id + '_temp'];
		q.fixSize = 1;
		return q;
	}
	if (!gr) {
		gr = t('ok');
	}
	if (!r) {
		r = t('fail');
	}
	return [gr, r];
}
/**
 * @description Создает ссылки на текстовые номера страниц и иконки рамки для более быстрого доступа
*/
PersonalFormSetting.prototype._mapPages = function() {
	var S = this.S;
	if (!this.textFields && S.childs && S.childs[0] && S.childs[0].childs) {
		this.textFields = [];
		this.pages 		= [];
		var pages = S.childs[0].childs, i, ch, j, iT, jT;
		for (i = 0; i < pages.length; i++) {
			ch = pages[i].childs ? pages[i].childs : 0;
			if (ch && ch[2 ]&& ch[2].text && ch[0] && ch[0].w && ch[0].h) {
				this.pages.push( ch[0] );
				this.textFields.push( ch[2] );
			}
		}
		for (i = 0; i < this.pages.length; i++) {
			for (j = i; j < this.pages.length; j++) {
				iT = +this.textFields[i].text;
				jT = +this.textFields[j].text;
				if (iT > jT) {
					ch = this.pages[i];
					this.pages[i] = this.pages[j];
					this.pages[j] = ch;
					
					ch = this.textFields[i];
					this.textFields[i] = this.textFields[j];
					this.textFields[j] = ch;
				}
			}
		}
	}
}
/**
 * @description
 * @param {Number} i номер страницы от 1 до ...
*/
PersonalFormSetting.prototype._pageWillPrint = function(i) {
	var q = this._getLimitWithFormat(this.format), map;
	if (this._printMode() == this.MODE_ALL) {
		q = (i > q ? this.PAGE_OVER_LIMIT : this.PAGE_WILL_PRINT);
		return q;
	} else {
		map = this._getSelectedPages();
		if (map[i] && map[i] <= q) {
			return this.PAGE_WILL_PRINT;
		} else if (map[i]) {
			return this.PAGE_OVER_LIMIT;
		}
		return this.PAGE_SKIP;
	}
}
/**
 * @description 
 * @return {Object} ключ - номер страницы, значение, ее порядковый номер среди выбраных
*/
PersonalFormSetting.prototype._getSelectedPages = function() {
	var text = this._getEnumPagesText(),
		allow = "1234567890,-", r = '', re, copyText, res = {}, nTest,
		arr, i, sKey, arr2, min, max, j, key, counter = 1;
	if (!$.trim(text)) {
		return {};
	}
	for (i = 0; i < text.length; i++ ) {
		if (allow.indexOf(text.charAt(i)) != -1) r += text.charAt(i);
	}
	re = /^\-/;
	text = r.replace(re, ''); 
	re = /^\,/;
	while (text.indexOf("--") != -1) {
		text = text.replace("--", "-");
	}
	while (text.indexOf(",,") != -1) {
		text = text.replace(",,", ",");
	}
	text = text.replace(re, ""); 
	copyText = text;
	re = /\,$/;
	text = text.replace(re, ""); 
	re = /\-$/;
	text = text.replace(re, ""); 
	
	/*if (setTextInLine) formView.pagesLine.text = text;
	else formView.pagesLine.text = copyText;*/
	if (~this.iSelectPage.val().indexOf('?') || ~this.iSelectPage.val().indexOf('б')) {
		this.iSelectPage.val(text);
	}
	nTest = +text;
	if (!isNaN(nTest)) {
		res[nTest] = 1;
		return res;
	}
	if ( ~text.indexOf(",") && text != "," ) {
		arr = text.split(",");
		for (i = 0; i < arr.length; i++ ) {
			sKey = String (arr[i]);
			if ( ~sKey.indexOf("-") && text != "-" ) {
				arr2 = sKey.split("-");
				min = +arr2[0];
				max = +arr2[1];
				if ( !isNaN(min) && !isNaN(max)) {
					for (j = min; j <= max; j++ ) {
						if (!res[j]) {
							res[j] = counter;
							counter++;
						}
					}
				}
			}
			key = +arr[i];
			if (!isNaN(key)) {
				if (!res[key]) {
					res[key] = counter;
					counter++;
				}
			}
		}
	} else if ( ~text.indexOf("-") && text != "-" ) {
		arr2 = text.split("-");
		min = +arr2[0];
		max = +arr2[1];
		//if ((String(min) != "NaN") && (String(max) != "NaN"))
		if ( !isNaN(min) && !isNaN(max) ) {
			for (j = min; j <= max; j++ ) {
				if (!res[j]) {
					res[j] = counter;
					counter++;
				}
			}
		}
	}
	return res;
}
/**
 * @description
*/
PersonalFormSetting.prototype.onChangeSelectedPages = function(e) {
	this.setPagesStatusIcon();
}
/**
 * @description Устанавливает маску ввода на поле ввода страниц для экспорта
*/
PersonalFormSetting.prototype.inputMask = function(e) {
	//allow codes: 0123456789-, arrowR, arrowL, home , end, shift, delete, backspace
	var codes = {8:1,37:1, 39:1, 16:1, 46:1, 36:1, 35:1, 109:1, 188:1, 191:1, 108:1, 189:1, 190:1},
		i, s, p,
		//,- variants
		o2 = {109:1, 189:1, 188:1, 191:1, 108:1, 190:1};
	for (i = 96; i < 106; i++) {
		codes[i] = 1;
	}
	for (i = 48; i < 58; i++) {
		codes[i] = 1;
	}
	if (!codes[e.keyCode] || (e.keyCode == 191 && !e.shiftKey) || (e.keyCode == 189 && e.shiftKey) ) {
		e.preventDefault();
		return false;
	} else if (o2[e.keyCode]){
		p = this.iSelectPage[0].selectionStart;
		s = this.iSelectPage.val();
		if (!p || s.charAt(p - 1) == ',' || s.charAt(p - 1) == '-' || s.charAt(p + 1) == '-' || s.charAt(p - 1) == ',' ) {
			e.preventDefault();
			return false;
		}
	}
}
/**
 * @description
*/
PersonalFormSetting.prototype._getEnumPagesText = function() {
	return $.trim( this.iSelectPage.val() );
}
/**
 * @description
*/
PersonalFormSetting.prototype.reset = function() {
	this.iPrintAll.prop('checked', true);
	this.iGridOn.prop('checked', true);
	this.iPortrait.prop('checked', true);
	setRadioButtons();
	$('#laPlotW').text = 'Ширина';
	$('#laPlotH').text = 'Высота';
	//this.format = 'A4';
	
	var i, s = this.iFormat[0];
	for (i = 0; i < s.options.length; i++) {
		if ( s.options[i].text == this.format) {
			s.options.selectedIndex = i;
			break;
		}
	}
	
	this.iSelectPage.val('');
}
/**
 * @description Добавляет спрайты "сетки" в спрайты рамок превью
*/
PersonalFormSetting.prototype.addGridSprites = function() {
	var i, s, g, step = 17 * this.sc, j;
	for (i = 0; i < this.pages.length; i++) {
		s = new Sprite(null, 'grid', 0);
		j = step;
		s.graphics.lineStyle(0.25, 0xA0A0A0);
		//vertical lines
		while (j < this.pages[i].sourceW - step) {
			s.graphics.moveTo(j, 0);
			s.graphics.lineTo(j, this.pages[i].sourceH);
			j += step;
		}
		//horizontal lines
		j = step;
		while (j < this.pages[i].sourceH - step) {
			s.graphics.moveTo(0, j);
			s.graphics.lineTo(this.pages[i].sourceW, j);
			j += step;
		}
		s.id = 'grid';
		this.pages[i].addChild(s);
	}
}
/**
 * @description
*/
PersonalFormSetting.prototype.onChangeDrawGrid = function() {
	var i, s;
	for (i = 0; i < this.pages.length; i++) {
		s = this.pages[i].getChildByName('grid');
		s.visible = this.iGridOn.prop('checked');
	}
}
/**
 * @description Обработка полученных данных
*/
PersonalFormSetting.prototype.onSuccessViewData = function(data) {
	this.preloader();
	if (!this.appErrorHandle(data)) {
		this._clearViewMap();
		this.onViewData(data);
	}
	
	
}
/**
 * @description Обработка не полученных данных
*/
PersonalFormSetting.prototype.onFailViewData = function(data) {
	this.preloader();
	alert('Видимо, что-то случилось!');
}
/**
 * @description Реакция на смену параметров бумаги, формат, ориентация
*/
PersonalFormSetting.prototype.onPaperChange = function() {
	var o = this, or = o.iAlbum.prop('checked') ? 'landscape' : 'portrait',
		data;
	switch (pfFormat.value) {
		case 'A5':
			$('.paperParams').addClass('paperParamDisabled');
			iPlotW.disabled = true;
			iPlotH.disabled = true;
			iPlotW.value = 148;
			iPlotH.value = 210;
			break;
		case 'A4':
			$('.paperParams').addClass('paperParamDisabled');
			iPlotW.disabled = true;
			iPlotH.disabled = true;
			iPlotW.value = 210;
			iPlotH.value = 297;
			break;
		case 'A3':
			$('.paperParams').addClass('paperParamDisabled');
			iPlotW.disabled = true;
			iPlotH.disabled = true;
			iPlotW.value = 297;
			iPlotH.value = 420;
			break;
		case 'A2':
			$('.paperParams').addClass('paperParamDisabled');
			iPlotW.disabled = true;
			iPlotH.disabled = true;
			iPlotW.value = 420;
			iPlotH.value = 594;
			break;
		case 'A1':
			$('.paperParams').addClass('paperParamDisabled');
			iPlotW.disabled = true;
			iPlotH.disabled = true;
			iPlotW.value = 594;
			iPlotH.value = 841;
			break;
		case 'A0':
			$('.paperParams').addClass('paperParamDisabled');
			iPlotW.disabled = true;
			iPlotH.disabled = true;
			iPlotW.value = 841;
			iPlotH.value = 1189;
			break;
		case 'plot':
			$('.paperParams').removeClass('paperParamDisabled');
			iPlotW.disabled = false;
			iPlotH.disabled = false;
			iPlotW.value = (storage('setPlotterW') ? storage('setPlotterW') : 1000);
			iPlotH.value = (storage('setPlotterH') ? storage('setPlotterH') : 6000);
			
			iPlotW.value = iPlotW.value < 101 ? 1000 : iPlotW.value;
			iPlotH.value = iPlotH.value < 101 ? 6000 : iPlotH.value;
			
			iPlotW.value = iPlotW.value > 5000 ? 1000 : iPlotW.value;
			iPlotH.value = iPlotH.value > 20000 ? 6000 : iPlotH.value;
			
			break;
	}
	data = {fileId:o.fileId, f:o.iFormat.val(), o: or};
	if (pfFormat.value == 'plot') {
		data.plotW = parseInt(iPlotW.value, 10) ? parseInt(iPlotW.value, 10) : 1000;
		data.plotH = parseInt(iPlotH.value, 10) ? parseInt(iPlotH.value, 10) : 6000;
		data.iPlotFrameOff = o.iPlotFrameOff.prop('checked');
	}
	this.format = this.iFormat.val();
	if(o.iAlbum.prop('checked')) {
		$('#laPlotW').text('Высота');
		$('#laPlotH').text('Ширина');
	} else {
		$('#laPlotW').text('Ширина');
		$('#laPlotH').text('Высота');
	}
	this.preloader(1);
	this.req(data, o.cb(o.onSuccessViewData, o), o.cb(o.onFailViewData, o), 'getViewData');
}
/**
 * @description Принудительная установка формата
*/
PersonalFormSetting.prototype.setDefaultFormat = function() {
	var sel = this.iFormat[0], i;
	for (i = 0; i < sel.options.length; i++) {
		sel.options[i].selected = false;
	}
	sel.options[4].selected = true;
	this.format = 'A4';
}
/**
 * @description
*/
PersonalFormSetting.prototype._clearViewMap = function() {
	this.vdMaxX = this.vdMaxY = 0;
	this.textFields = null;
	this.pages = null;
	
	this.S.removeAllChilds();
	this.G.clear();
	
	this.S.scaleX = this.S.scaleY = 1;
	this.S.x = this.S.y = 0;
	this.S.setWidth(0);
	this.S.setHeight(0);
}
/**
 * @description Обработка клика на кнопке "Задать имя файла"
*/
PersonalFormSetting.prototype.onShowMetadataClick = function(evt) {
	$('#inputMetadataSrceen').removeClass('hide');
}
/**
 * @description Обработка клика на кнопке "Настройки печати" на экране ввода параметров текста первой страницы печати
*/
PersonalFormSetting.prototype.onHideMetadataClick = function(evt) {
	$('#inputMetadataSrceen').addClass('hide');
}
/**
 * @description
*/
PersonalFormSetting.prototype.onPrintNowClick = function(evt) {
	var o = this, or = o.iAlbum.prop('checked') ? 'landscape' : 'portrait',
		data, rawPages, i, pages = [], q = 0, qs = 0,
		limit = this._getLimitWithFormat(this.format), pagesLength;
	q = this.pages.length;
	q = (q > limit ? limit : q);
	if (!this.iPrintAll.prop('checked')) {
		q = 0;
		rawPages = o._getSelectedPages();
		//console.log(rawPages);
		for (i in rawPages) {
			pages.push(i);
			q++;
			if (q <= limit) {
				qs++;
			}
		}
		pagesLength = pages.length;
		pages = pages.join(',');
		q = qs;//quantity selected and available
		if (!pages.length || !q) {
			this.alert('Вы должны выбрать одну или несколько страниц!');
			return false;
		}
	} else {
		if (!q) {
			this.alert('Вы должны выбрать одну или несколько страниц!');
			return false;
		}
	}
	data = {f:o.iFormat.val(), o:or, fileId:this.fileId, p:pages};
	if (!o.iGridOn.prop('checked')) {
		data.gridOff = 1;
	}
	data.plotW = 1000;
	data.plotH = 6000;
	data.targetDir = Qt.openDirectoryDialog("Выберите каталог для сохранения файла", getLastSelectedDir());
	storage('lastSelectedDir', data.targetDir);
	
	if (pfFormat.value == 'plot') {
		data.plotW = parseInt(iPlotW.value, 10) ? parseInt(iPlotW.value, 10) : 1000;
		data.plotH = parseInt(iPlotH.value, 10) ? parseInt(iPlotH.value, 10) : 6000;
		data.iPlotFrameOff = o.iPlotFrameOff.prop('checked');
		//throw new Error('on send = ' + (o.iPlotFrameOff.prop('checked') ? 'tr' : 'fa') );
	}
	if (this.printMode == this.MODE_PRINT_COIN) {
		if (confirm('Вы уверены, что хотите распечатать файл?\n\nИмя файла: ' + this.fileId + '\nКоличество листов: ' + q + '\n\nСтоимость печати: ' + Math.ceil(q / this.listsPerCoin) )) {
			this.req(data, o.cb(o.onPdfExportQuery, o), o.cb(o.onPdfExportQueryFail, o), 'getPdf');
		}
	} else {
		this.req(data, o.cb(o.onPdfExportQuery, o), o.cb(o.onPdfExportQueryFail, o), 'getPdf');
	}
	return false;
}
/**
 * @desc 
 * @param {JSON} data
*/
PersonalFormSetting.prototype.onPdfExportQuery = function(data) {
	if (!this.appErrorHandle(data)) {
		this.vBalance.text(data.balance);
		Log.value += JSON.stringify(data) + '\n';
		$('#balanceText').text(data.balance);
		//window.open('/exec.php?action=download&v=2&id=' + data.id + '&t=' + data.t, 'pdf');
		
		var object = data;
		var viewer = '"C:\\Program Files\\Internet Explorer\\iexplore.exe"';//Qt.appDir() + '/bin/STDU_Viewer/STDUViewerApp.exe'; //LIN 'evince'
		//alert(viewer + ' ' + object.pdfPath);
		//alert("file://localhost//" + object.pdfPath);
		
		/*
		 * variant with IE
		 * var ds = '/', cmd = viewer + ' "file://localhost//' + object.pdfPath + '"';
		PHP.file_put_contents(Qt.appDir() + ds + 'run.bat', cmd);
		Exec.exec(Qt.appDir() + ds + 'run.bat', 'F');*/
		//alert('Will open ' + data.pdfPath);
		OS.ShellExecuteQ('open', data.pdfPath, '', '', true);
		
		this.onCancelExport();
	}
}
/**
 * @desc 
 * @param {JSON} data
*/
PersonalFormSetting.prototype.onPdfExportQueryFail = function(data) {
	this.alert('Не удалось выполнить запрос к серверу. Проверьте соединение с Интернетом и повторите попытку.');
}
/**
 * @desc Возвращает количество листов A4 в листе формата AN
 * @param {String} formatStr - A0 - A5
 * @return {Number}  количество листов A4
*/
PersonalFormSetting.prototype._getA4InFormat = function(formatStr) {
	switch (formatStr) {
		case 'A5':
			return 0.5;
		case 'A4':
			return 1;
		case 'A4A':
			return 1;
		case 'A3':
			 return 2;
		case 'A2':
			return 4;
		case 'A1':
			return 8;
		case 'A0':
			return 16;
	}
	return 1;
}
/**
 * @desc Возвращает количество листов AN которое можно распечатать в зависмости от установленного LIST_PER_PRINT и баланса пользователя
 * @param {String} formatStr - A0 - A5
 * @return {Number}  количество листов AN которые можно распечатать располагаемым бюалансом
*/
PersonalFormSetting.prototype._getLimitWithFormat = function(formatStr) {
	var multiplier = this._getA4InFormat(formatStr);
	var lim = this.listsPerCoin;
	if (this.balance  > 0) {
		lim *= this.balance;
	}
	if (this.printMode == this.MODE_PRINT_LIMITED) {
		lim = this.listsPerCoin;
	}
	return Math.floor(lim / multiplier);
}
//==============================DOM=====================================
/**
 * @description
*/
PersonalFormSetting.prototype.setListeners = function() {
	this.iSelectPage = $('#pfSelectpage');
	this.iPlotFrameOff = $('#iPlotFrameOff');
	this.vBalance = $('#pfBalance');
	this.vTotalPages = $('#qLF');
	this.vSelectedPages = $('#pqLF');
	this.vСoinPricePrint = $('#pfP');
	this.vСoinPricePrint2 = $('#pfP2');
	this.vBalanceAfterPrint = $('#pfBalanceA');
	this.iPrintAll = $('#pfAll');
	this.iGridOn = $('#pfSm');
	this.iPortrait = $('#pfPort');
	this.iAlbum = $('#pfLand');
	this.iFormat = $('#pfFormat');
	this.bPrintNow = $('#printNow');
	this.bShowInputMetaForm = $('#bShowInputMetaForm');
	this.bHideInputMetaScreen = $('#bCloseMetadataScreen');
	this.vInfoPrintModeCoin = $('#pfInfoCoinMode');
	this.vInfoPrintModeLim = $('#pfInfoLimMode');
	this.vListsPerCoin = $('#listsPerCoin');
	this.vListsPerCoinLegend = $('#listsPerCoinLegend');
	
	var o = this, c = o.onChangeSelectedPages;
	$('#cancelPrintNow').click(o.cb(o.onCancelExport, o));
	this.iPrintAll.bind('change', o.cb(c, o));
	this.iGridOn.bind('change', o.cb(o.onChangeDrawGrid, o));
	$('#pfSl').bind('change', o.cb(c, o));
	this.iSelectPage.bind('keydown', o.cb(o.inputMask, o));
	this.iSelectPage.bind('keydown', function(evt){
		setTimeout(function() {
			o.onChangeSelectedPages.apply(o, [evt]);
		}, 100);
	});
	c = o.onPaperChange;
	this.iPortrait.bind('change', o.cb(c, o));
	this.iAlbum.bind('change', o.cb(c, o));
	this.iFormat.bind('change', o.cb(c, o));
	this.bPrintNow.click(o.cb(o.onPrintNowClick, o));
	this.bShowInputMetaForm.click(o.cb(o.onShowMetadataClick, o));
	this.bHideInputMetaScreen.click(o.cb(o.onHideMetadataClick, o));
	
	$('#iPlotW').bind('change', function() {
		storage('setPlotterW', iPlotW.value);
	});
	$('#iPlotH').bind('change', function() {
		storage('setPlotterH', iPlotH.value);
	});
	$('#iPlotW').bind('change', o.cb(c, o));
	$('#iPlotH').bind('change', o.cb(c, o));
	
	//TODO init bIPlotFrameOffChecked (Что у нас там вместо localStorage)
	var bIPlotFrameOffChecked = storage('iPlotFrameOff');
	bIPlotFrameOffChecked = String(bIPlotFrameOffChecked) == 'undefinerd' ? false : bIPlotFrameOffChecked;
	this.iPlotFrameOff.prop('checked', bIPlotFrameOffChecked);
	this.iPlotFrameOff.bind('change', o.cb(o.onChangeIPlotFrameOffChecked, o))
}
/**
 * @description
 * @return выбранный режим экспорта в pdf, все (.MODE_ALL) или выбранные (.MODE_SELECTED) страницы
*/
PersonalFormSetting.prototype._printMode = function() {
	return ( $('#pfAll').prop('checked') ? this.MODE_ALL : this.MODE_SELECTED );
}


/**
 * @description Обработка клика на  iPlotFrameOff
*/
PersonalFormSetting.prototype.onChangeIPlotFrameOffChecked = function() {
	storage('iPlotFrameOff', this.iPlotFrameOff.prop('checked'));
}
window.F = function(){}
