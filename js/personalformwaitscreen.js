'use strict';
var WaitScr = {
	/** @property {Function} onZeroTime - реакция драйвера объекта  на окончание ожидания файла для печати (при 0 балансе и активном аккаунте)*/
	/** @property {Function}onCancelWait - реакция драйвера объекта  на отмену ожидания файла для печати (при 0 балансе и активном аккаунте) */
	/** @property {Function} onGetPro - реакция драйвера объекта  на клик "купить редкоины" (при 0 балансе и активном аккаунте) */
	/** @property {Function} cb - удобная обертка вокруг apply */
	/** @property {Function} appErrorHandle - "стандартная" обработка ошибок приложения */
	
	/** @description  установить слушатили событий и т п*/
	init: function() {
		this.mode = this.MODE_WAIT;
		this.setListeners();
	},
	/** @property {$(HtmlElement)} view представление экрана ожидания */
	/** @property {$(HtmlElement)} vTime блок со строкой времени ожидания */
	/** @property {$(HtmlElement)} vWidgetTime блок со строкой времени ожидания на виджете*/
	/** @property {$(HtmlElement)} wviewCounter ссылка на vWidgetTime*/
	/** @property {$(HtmlElement)} wviewDone блок "Завершено" */

	/** @property {$(HtmlElement)} vWidget блок с виджетом времени ожидания (минимизированый экран ожидания )*/
	/** @property {$(HtmlElement)} vWaitFileName блок со строкой имени ожидаемого файла */
	/** @property {Number} timeWait время, которое надо ждать */
	/** @property {Number} fileId id загружаемого файла*/
	fileId:null,
	/** @property {Number} fileName имя загружаемого файла */
	fileName:null,
	/** @property {Number} mode режим, в зависимости от него работает ссылка Распечатать или отменить */
	/** @property {Number} MODE_WAIT режим ожидания */
	MODE_WAIT:1,
	/** @property {Number} MODE_TIMEOUT режим готовности к печати */
	MODE_TIMEOUT:2,
	/** @description  показать виджет ожидания  на основной форме*/
	showWidget: function(visible) {
		this.isVisible = visible;
		if (visible) {
			this.vWidget.removeClass('hide');
		} else {
			this.vWidget.addClass('hide');
		}
	},
	/** @description  показать экран ожидания
	 *  @param {Number} timeWait
	 *  @param {Number} fileId
	 *  @param {String} fileName
	*/
	show: function(timeWait, fileId, fileName) {
		this.timeWait = timeWait;
		this.fileId = fileId;
		this.fileName = fileName;
		this.vWaitFileName.text(fileName);
		
		if (timeWait > 0) {
			this.wviewCounter.removeClass('hide');
			this.wviewDone.addClass('hide');
			this.vWidgetPrintOrCancel.removeClass('hide');
			this.vwMore.removeClass('hide');
			this.vwGreenHint.addClass('hide');
			this.bigLoader.removeClass('hide');
			this.successIcon.addClass('hide');
		}
		this.viewData = null;
		var o = this, t, s, nM, nS, q;
		t = timeWait;
		q = o.sN(Math.floor(t / 60)) + ':' + o.sN(t - 60 * Math.floor(t / 60) );
		nM = Math.floor(t / 60);
		nS = t - 60 * Math.floor(t / 60) 
		s = nM + ' ' + this.plural(nM,['минута', 'минуты', 'минут']) + ' ' + nS + ' ' + this.plural(nS, ['секунда', 'секунды', 'секунд']);
		if (!nM) {
			s = nS + ' ' + this.plural(nS, ['секунда', 'секунды', 'секунд']);
		}
		o.vTime.text(s);
		o.vWidgetTime.text(q);
		o.mode = o.MODE_WAIT;
		this.vPrintOrCancel.text('ОТМЕНА');
		
		o.showWidget(1);
		if (o.I) {
			clearInterval(o.I);
		}
		o.I = setInterval(
			function() {
				o.timeWait -= 1;
				t = o.timeWait;
				if (t >=0 ) {
					q = o.sN(Math.floor(t / 60)) + ':' + o.sN(t - 60 * Math.floor(t / 60) );
					nM = Math.floor(t / 60);
					nS = t - 60 * Math.floor(t / 60);
					s = nM + ' ' + o.plural(nM,['минута', 'минуты', 'минут']) + ' ' + nS + ' ' + o.plural(nS, ['секунда', 'секунды', 'секунд']);
					if (!nM) {
						s = nS + ' ' +o.plural(nS, ['секунда', 'секунды', 'секунд']);
					}
					o.vTime.text(s);
					o.vWidgetTime.text(q);
				} else {
					o.timeout();
				}
			}, 1000
		);
		
		this.view.removeClass('hide');
	},
	/** @description  свернуть экран ожидания*/
	minimize: function() {
		WaitScr.view.addClass('hide');
		return false;
	},
	/** @description  развернуть экран ожидания*/
	maximize: function() {
		WaitScr.view.removeClass('hide');
		return false;
	},
	/** @description  Добавляет 0 перед цифрой если она менее 10*/
	sN:function(v) {
		return (v < 10 ? '0' + v : v );
	},
	/** @description Реакция на окончание времени ожидания*/
	timeout:function() {
		var o = this;
		o.req({fileId:o.fileId, fileName: o.fileName}, o.cb(o.onTimeWaitData, o), o.cb(o.onTimeWaitDataFail, o), 'getTimeWait');
	},
	/** @description Данные об окончании времени ожидания*/
	onTimeWaitData:function(data) {
		if (+data.timeWait === 0) {
			if (this.I) {
				clearInterval(this.I);
			}
			this.mode = this.MODE_TIMEOUT;
			this.vPrintOrCancel.text('Распечатать');
			
			this.vTime.text('Завершено');
			this.viewData = data.view;
			
			this.wviewCounter.addClass('hide');
			this.wviewDone.removeClass('hide');
			this.vWidgetPrintOrCancel.addClass('hide');
			this.vwMore.addClass('hide');
			this.vwGreenHint.removeClass('hide');
			
			
			this.bigLoader.addClass('hide');
			this.successIcon.removeClass('hide');
		}
	},
	/** @description Неудачный запрос*/
	onTimeWaitDataFail:function() {
	},
	/** @description */
	printOrCancel:function() {
		var o = this;
		o.showWidget(0);
		o.view.addClass('hide');
		if (o.mode == o.MODE_TIMEOUT) {
			o.onZeroTime(this.viewData);
		} else {
			o.req({fileId:o.fileId}, function(){}, function(){}, 'deleteWaitFile');
			if (o.I) {
				clearInterval(o.I);
			}
			o.onCancelWait();
		}
		return false;
	},
	//==============================DOM=================================
	
	/**
	 * @description минимизируем зависимость от верстки
	 * @return $(HTMLDiv) - представление экрана ожидания
	*/
	setListeners:function() {
		this.wviewDone = $('#wc');
		this.view = $('#waitScreen');
		this.vTime = $('#pfWtime');
		this.vPrintOrCancel = $('#pfWCancelOrPrint');
		this.vWidgetPrintOrCancel = $('#pfwwCancel');
		this.vwMore = $('#pfwwMaximize');
		
		this.vWaitFileName = $('#pfWfName');
		this.bigLoader = $('#bigLoader');
		this.successIcon = $('#bigSuccess');
		this.vwGreenHint = $('#grrenHint');
		
		this.wviewCounter = this.vWidgetTime = $('#pfwwTime');
		this.vWidget = $('#pfwwidget');
		
		this.vPrintOrCancel.click(this.cb(this.printOrCancel, this));
		
		$('#pfWHideWindow').click(this.minimize);
		$('#pfwwMaximize').click(this.maximize);
	}
}
