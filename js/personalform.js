'use strict';
(
	function () {
		//Форма просмотра и загрузки файлов пользователя
		var $ = jQuery,
			/**@var {SE2D::Graphics} G  */
			G,
			/**@var {SE2D::Sprite} S  */
			S,
			/**@var {Number} scaleStep*/
			scaleStep = 0.02,
			/**@var {Number} canvasWidth */
			canvasW,
			/**@var {Number} canvasHeight */
			canvasH,
			/**@var {Boolean} canvasMouseLeftButtonIsDown */
			canvasMouseLeftButtonIsDown = false,
			/**@var {Number} canvasMouseClientY */
			canvasMouseClientY,
			/**@var {Number} canvasMouseClientX */
			canvasMouseClientX,
			/**@var {Number} spriteX хранит x на момент начала перетаскивания*/
			spriteX,
			/**@var {Number} spriteY хранит y на момент начала перетаскивания*/
			spriteY,
			/**@var {Object} fileListData хранит последний запрос файлов от сервера, проиндексированный по fileID*/
			fileListData,
			/**@var {Object} fileListData хранит последний запрос каталогов от сервера, проиндексированный по folderID*/
			folderListData,
			/**@var {Number} loadingFileId хранит идентификатор последнего загружаемого файла*/
			loadingFileId,
			/**@var {Number} fileId хранит идентификатор последнего загруженного файла*/
			fileId,
			/**@var {Number} loadingFolderId хранит идентификатор последнего загружаемого каталога*/
			loadingFolderId,
			/**@var {Number} folderId хранит идентификатор последнего загруженного каталога*/
			folderId = 0,
			/**@var {Number} vmode 0 - обычный режим, 1 - режим переименования, 2 - режим удаления, 3 - режим выбора параметров печати */
			mode = 0,
			MODE_NORMAL = 0,
			MODE_EDIT   = 1,
			MODE_DELETE = 2,
			MODE_PRINT_PARAMS = 3,
			MODE_WAIT   = 4,
			MODE_EXPORT_DXF = 5,
			/**@var {Number} loadingProcess 1 - загрузка данных, 0 - нет */
			loadingProcess = 0,
			/**@var {Object} {id,dir} movedItem информация о перетаскиваемом объекте в списке файлов, dir - 1 если каталог */
			movedItem = {},
			/**@var {Object} {height,x,y,G,scale} canvasState информация о состоянии холста на момент показа формы выбора параметров печати */
			canvasState = {},
			/**@var {PersonalFormSetting}  printForm объект для управления формой свойств экспорта в pdf*/
			printForm,
			/**@var {String}  Пути к графическим ресурсам холста*/
			OK_ICON_PATH = window.OK_ICON_PATH,
			/**@var {String}  Стиль выбранного файла в списке*/
			FAIL_ICON_PATH = window.FAIL_ICON_PATH,
			/**@var {$DOMElement}  Представление Список ранее распечатанныхх файлов, DOM*/
			pdfListView,
			/**@var {$DOMUlElement} Список (<ul>) ранее распечатанныхх файлов, DOM*/
			pdfItems,
			/**@var {Function} текущий слушатель успешного выполнения программы */
			successListener,
			/**@var {Function} текущий слушатель окончания выполнения программы */
			finishListener,
			/**@var {Function} текущий слушатель неуспешного выполнения программы */
			failListener,
			/**@var {Boolean} истина когда первоначальное масштабирование произошло по оси Y*/
			isScaleByY = false
			;
		$(onReady);
		function onReady() {
			patchLocalStorage();
			//if (window.location.href.indexOf('/personalhtml5.php') != -1 && $('#preview')[0]) {
				if (isOldBrowser()) {
					//TODO
				}
				//init canvas
				new SimpleEngine2D("preview", 44);
				SE2D.onLoadImages = onLoadIcons;
				SE2D.addGraphResources([OK_ICON_PATH, 'ok', FAIL_ICON_PATH, 'fail']);
			//}
		}
		function onLoadIcons() {
			S = new Sprite(null, '...', 0);
			window.SE2D._root.addChild(S);
			G = S.graphics;
				
			printForm = new PersonalFormSetting(G, S, setNormalMode, plural, req, preloader, appErrorHandle, showError, cb);
			WaitScr.req = req;
			WaitScr.plural = plural;
			WaitScr.cb = cb;
			WaitScr.appErrorHandle = appErrorHandle;
			WaitScr.init();
			canvasW = SE2D.w;
			canvasH = SE2D.h;
			// /init canvas
			setEventListeners();
			loadUserFiles(0);
		}
		/**
		 * @description AJAX handler обработка данных списка файлов в папке пользователя
		*/
		function onUserFiles(data) {
			folderId = loadingFolderId;
			fileListData = {};
			folderListData = {};
			var buttons = '<span class="right icontrols"><span class="iedit left"><img src="/static/i/icons/edit-n.png"></span><span class="irem left"><img src="/static/i/icons/rem-n.png"></span></span><span class="clearfix"></span>';
			var html = '<li data-id="' + data.pfld + '" class="folder"><a style="width:100%" data-id="' + data.pfld + '" href="#"><img data-id="' + data.pfld + '" title="folder" alt="folder" src="/static/i/icons/pfolder.png"><span>' + data.pfn + '</span></a></li>';
			if (data.cf == 0) {
				html = '';
			}
			if (data.folders.length) {
				var F = data.folders;
				for (var i = 0; i < F.length; i++) {
					folderListData[ F[i].id ] = {fldname:F[i].fldname};
					var hFolder = '<li class="folder" data-id="' + F[i].id + '"><a class="left inamewidth" data-id="' + F[i].id + '" href="#"><img  data-id="' + F[i].id + '" title="folder" alt="folder" src="/static/i/icons/folder.png"><span>' + F[i].fldname + '</span></a>' + buttons + '</li>';
					html += hFolder;
				}
			}
			
			if (data.files.length) {
				F = data.files;
				for (var i = 0; i < F.length; i++) {
					fileListData[ F[i].id ] = {link:F[i].fname, fname:F[i].fname, fdesc:F[i].fdesc};
					var css, hFile;
					css = (F[i].id == fileId ? (' class="' + CSS_FILE_ACTIVE + '"') : '');
					hFile = '<li ' + css + ' data-id="' + F[i].id + '"><a class="left inamewidth" data-id="' + F[i].id + '" href="#">' + F[i].fname + '</a>' + buttons + '</li>';
					html += hFile;
				}
			}
			var safeScrollTop = $('#files').scrollTop();
			$('#files').css('max-height', 'none');
			$('#files').css('overflow-y', 'auto');
			$('#files').html(html);
			
			
			var s = data.name;
			$('#currentFolder').text(s);
			while ($('#currentFolder').height() > 27) {
				s = s.substring(0, s.length - 1);
				$('#currentFolder').text(s);
			}
			setScrollbar(safeScrollTop);
			setListItemsHandlers();
			preloader(0);
			if (!data.fileWait.empty && !WaitScr.isVisible) {
				WaitScr.onZeroTime   = onZeroTime;
				WaitScr.onCancelWait = onCancelWait;
				WaitScr.onGetPro     = onGetPro;
				WaitScr.balance      = data.fileWait.balance;
				WaitScr.listsPerCoin  = data.fileWait.listsPerCoin;
				WaitScr.show(data.fileWait.timeWait, data.fileWait.waitFileId, data.fileWait.fileName);
				WaitScr.minimize();
				$('#files li').each(function(i, a) {
					a = $(a);
					if (a.data('id') == data.fileWait.waitFileId) {
						a.first().addClass(CSS_FILE_ACTIVE);
					} else {
						a.first().removeClass(CSS_FILE_ACTIVE);
					}
				});
				loadUserFile(data.fileWait.waitFileId);
			}
		}
		/**
		 * @description AJAX запрос списка файлов в папке пользователя
		 * @param {Number} parentId идентификатор родительской папки
		 * @param {Boolean} showPreloader = true показывать или нет прелоадер
		*/
		function loadUserFiles(parentId, showPreloader) {
			preloader(0);
			/*showPreloader = String(showPreloader) == 'undefined' ? true : showPreloader;
			if (showPreloader) {
				preloader(1);
			} else {
				loadingProcess = 1;
			}
			loadingFolderId = parentId;
			req({pfid:parentId}, onUserFiles, null, 'getUserFiles');*/
		}
		/**
		 * @description обработка кликов на папках и файлах
		*/
		function setListItemsHandlers() {
			$('#files a').each( function(i, a) {
				a = $(a);
				var li = a.parent();
				if (li.hasClass('folder')) {
					a.click(function() {
						//mode == MODE_NORMAL ? loadUserFiles(a.data('id')) : ( mode == MODE_EDIT ? showRenameDialog(a.data('id'), 'd') : showDeleteDialog( a.data('id'), 'd' ));
						loadUserFiles(a.data('id'))
						return false;
					});
					if (a.data('id') != 0) {
						a.bind('dragstart', function() {
							saveDraggingItemId(a.data('id'), 1);
						});
					}
					a.bind('drop', function() {
						moveItem(a.data('id'));
					});
					a.bind('dragover', function(e) {
						if (movedItem.id) {
							e.preventDefault();
						}
					});
				} else {
					a.click(function() {
						$('#files li').each(function(i, j) {
							$(j).removeClass(CSS_FILE_ACTIVE);
						});
						a.parents('li').first().addClass(CSS_FILE_ACTIVE);
						//mode == MODE_NORMAL ? loadUserFile(a.data('id')) : ( mode == MODE_EDIT ? showRenameDialog(a.data('id')) : showDeleteDialog( a.data('id') ));
						loadUserFile(a.data('id'));
						return false;
					});
					a.bind('mouseover', function() {
						showActiveFileInfo(a.data('id'));
						//return false;
					});
					a.bind('mouseout', function() {
						showSelectedFileInfo();
						//return false;
					});
					a.bind('dragstart', function(e) {
						return saveDraggingItemId(a.data('id'));
					});
				}
			});
			
			$('.iedit,.irem').bind('mouseover', function(){
				var t = '/static/i/icons/', o = $(this).find('img').first(), s = 'edit';
				if (o.attr('src').indexOf('edit') == -1) {
					s = 'rem';
				}
				o.attr('src', '' + t + s + '-over.png');
			});
			$('.iedit,.irem').bind('mouseout', function(){
				var t = '/static/i/icons/', o = $(this).find('img').first(), s = 'edit';
				if (o.attr('src').indexOf('edit') == -1) {
					s = 'rem';
				}
				o.attr('src', t + s + '-n.png');
			});
			$('.iedit').each(function(i, img){
				$(img).click(function(){
					var li = $(img).parents('li').first();
					i = li.data('id');
					showRenameDialog(i, li.hasClass('folder') ? 'd' : 0);
				});
				
			});
			$('.irem').each(function(i, img){
				$(img).click(function(){
					var li = $(img).parents('li').first();
					i = li.data('id');
					showDeleteDialog(i, li.hasClass('folder') ? 'd' : 0);
				});
			});
		}
		
		function loadUserFile(id) {
			preloader(1);
			S.scaleX = S.scaleY = 1;
			S.x = S.y = 0;
			loadingFileId = id;
			req({id:id}, onUserFile, null, 'getUserFile');
		}
		/**
		 * @description обработка курсора над именем файла в списке
		*/
		function showActiveFileInfo(id) {
			_setFileInfo(id);
		}
		/**
		 * @description обработка ухода курсора над именем файла в списке
		*/
		function showSelectedFileInfo() {
			_setFileInfo(fileId);
		}
		/**
		 * @description AJAX handler обработка данных превью файла
		*/
		function onUserFile(data) {
			preloader(0);
			printForm.setDefaultFormat();
			if (!appErrorHandle(data)) {
				var max = {}, min = {}, i, L, qA4 = {};
				_setFileInfo(loadingFileId);
				data = parseData(data, min, qA4);
				data = shiftScene(data, min, max);
				data = scaleScene(data, max);
				L = data.length;
				G.clear();
				for (i = 0; i < L; i++) {
					G.lineStyle(1, data[i].color);
					G.moveTo(data[i].startX, data[i].startY);
					G.lineTo(data[i].endX, data[i].endY);
				}
				if (loadingFileId) {
					fileId = loadingFileId;
				}
				i = qA4.val;
				$('#qA4 .bg .t').text( i + ' ' + plural(i, ['ЛИСТ','ЛИСТА','ЛИСТОВ']) + ' А4' );
				$('#qA4').removeClass('hide');
			}
			loadingFileId = null;
		}
		/**
		 * @description Преобразует плоский массив в массив объектов, при этом получает минимальные x  и y
		 * @param {Array} data
		 * @param {Object} {x,y} min сохраняем в нем минимальные координаты
		 * @param {Object} {val} qA4 количество листов формата А4
		 * @return {Array} of {startX, startY, endX, endY, color}
		*/
		function parseData(data, min, qA4) {
			min.y = min.x = 1000000;
			var i, j, L = data.length - 1, f = ['startX', 'startY', 'endX', 'endY', 'color'], o, r = [], v;
			for (i = 0, j = 0; i < L; i++, j++) {
				v = data[i];
				if (j == 0) {
					o = new Object();
				}
				if (j == 0 || j == 2) {
					if (v < min.x) {
						min.x = v;
					}
				}
				if (j == 1 || j == 3) {
					if (v < min.y) {
						min.y = v;
					}
				}
				o[ f[j] ] = v;
				if (j == 4) {
					r.push(o);
					j = -1;
				}
			}
			qA4.val = data[L];
			return r;
		}
		/**
		 * @description Избавляется от отрицательных координат чертежа, сдвигает все в положительные
		 * @param {Array} data @see parseData
		 * @param {Object} {x,y} min минимальные координаты точек чертежа
		 * @param {Object} {w,h} max сохраняем в нем максимальные координаты
		 * @return {Array} координаты в положительной плоскости, смещенные к началу координат
		*/
		function shiftScene(data, min, max) {
			var i, L = data.length, dx = 2;
			max.w = max.h = 0;
			for (i = 0; i < L; i++) {
				//сдвинуть вправо, если есть отриц. икс
				//если не было отриц. икс, сдвинуть влево на мин. икс
				data[i].startX -= min.x;
				data[i].endX -= min.x;
				data[i].startX += dx;
				data[i].endX   += dx;
				//сдвинуть вниз, если есть отриц. игрек
				//если не было отриц. игрек, сдвинуть вверх на мин. игрек
				data[i].startY -= min.y;
				data[i].endY -= min.y;
				//засечь маскимум
				if (data[i].startX > max.w) {
					max.w = data[i].startX;
				}
				if (data[i].endX > max.w) {
					max.w = data[i].endX;
				}
				if (data[i].startY > max.h) {
					max.h = data[i].startY;
				}
				if (data[i].endY > max.h) {
					max.h = data[i].endY;
				}
			}
			return data;
		}
		/**
		 * @description Масштабирует всё, чтобы поместилось на превью
		 * @param {Array} data @see parseData
		 * @param {Object} {w,h} size  ширина и высота чертежа
		 * @return {Array} координаты после масштабирования
		*/
		function scaleScene(data, size) {
			isScaleByY = false;
			var cW = $(SE2D.canvas).attr('width') - 2, i, L = data.length,
				cH = $(SE2D.canvas).attr('height') - 2, dy,
				scX = cW / size.w, maxH = 0, scY = cH / size.h;
			if (scY < scX) {
				scX = scY;
				isScaleByY = true;
			}
				
			for (i = 0; i < L; i++) {
				data[i].startX *= scX;
				data[i].endX   *= scX;
				data[i].startY *= scX;
				data[i].endY   *= scX;
				if (data[i].endY > maxH) {
					maxH = data[i].endY;
				}
				if (data[i].startY > maxH) {
					maxH = data[i].startY;
				}
			}
			
			if (maxH < cH) {
				dy = (cH - maxH) / 2;
				for (i = 0; i < L; i++) {
					data[i].startY += dy;
					data[i].endY   += dy;
				}
			}
			
			return data;
		}
		/**
		 * @description Выводит сообщение об ошибке уровня приложения, если в данных есть поле error
		 * @param {Object} || {Array} data
		 * @return {Boolean} true если поле error eсть
		*/
		function appErrorHandle(data) {
			if (data.error) {
				if (data.error instanceof Array) {
					data.error = data.error.join('\n');
				}
				alert(data.error);
				return true;
			}
			return false;
		}
		function setScrollbar(scrollTop) {
			if ($('#files').height() > 272) {
				$('#files').css('max-height', '272px');
				$('#files').css('overflow-y', 'scroll');
				$('#files').scrollTop(scrollTop);
			}
		}
		function preloader(visible) {
			if (visible) {
				$('.h5v .loader').removeClass('hide');
				loadingProcess = 1;
			} else {
				$('.h5v .loader').addClass('hide');
				loadingProcess = 0;
			}
		}
		function defaultAjaxError() {
			alert('Не удалось выполнить действие, попробуйте обновить страницу');
		}
		//ajax helper
		function req(data, success, fail, id, url, page, method, json) {
			window.successListener = success;
			window.finishListener = success;
			window.failListener = fail;
			window.output = '';
			window.rOutput = '';
			var ds = '/';
			var iniPath = ' -c "' + Qt.appDir() + '\\bin\\php\\php.ini"';
			phpIni();
			var php = getPhpCommand(),
				tempF = OS.getTempFolderPath(),
				$argv;
			switch (id) {
				case 'getUserFile':
					$argv = [0, 'getUserFile', window.lastSelected, 0, 0, 0, 0, 0, 0, tempF];
					phpjsPatchAjaxBehavior($argv);
					break;
				case 'getPrintPermission':
					var w = data.plotW ? data.plotW : '0';
					var h = data.plotH ? data.plotH : '0';
					$argv = [0, 'getPrintPermission', window.lastSelected, data.f, data.o, w, h, '0', '0', OS.getTempFolderPath()];
					phpjsPatchAjaxBehavior($argv);
					break;
				case 'getViewData':
					Log.value += 'Get vd\n';
					var w = data.plotW ? data.plotW : '0';
					var h = data.plotH ? data.plotH : '0';
					var iPlotFrameOff  = data.iPlotFrameOff ? '1' : '0';
					$argv = [0, 'getViewData', window.lastSelected, data.f, data.o, w, h, '0', '0', tempF, iPlotFrameOff];
					phpjsPatchAjaxBehavior($argv);
					break;
				case 'getPdf':
					var pages = data.p.length ? data.p : 'ALL';
					var grid  = data.gridOff ? '1' : '0';
					var iPlotFrameOff  = data.iPlotFrameOff ? '1' : '0';
					$argv = [0, 'getPdf', window.lastSelected, pages, grid, data.f, data.o, data.plotW, 
								data.plotH, OS.getTempFolderPath(), data.targetDir, iPlotFrameOff
							];
					phpjsPatchAjaxBehavior($argv);
					break;
			}
			//patchRequest();
		}
		'onExecuteFinish', 'onExecuteSuccess', 'onExecuteFail'
		window.onExecuteFinish = function(stdout, stderr) {
			Log.value += "onExecuteFinish:" + stdout + "\n";
			window.reqProcessing = false;
			if (window.finishListener instanceof Function) {
				try {
					stdout = JSON.parse(stdout);
					window.finishListener(stdout);
				}catch(e) {;}
			}
		}
		window.onExecuteSuccess = function(stdout) {
			Log.value += "onExecuteSuccess:" + stdout + "\n";
			window.reqProcessing = false;
			if (window.successListener instanceof Function) {
				try {
					stdout = dropRcsExit(stdout);
					if (stdout == 'rcsexit') {
						stdout = PHP.file_get_contents(OS.getTempFolderPath() + '/out.json');
					}
					stdout = JSON.parse(stdout);
					window.successListener(stdout);
				}catch(e) {;}
				window.rOutput = stdout + window.rOutput;
				window.output = window.output + stdout;
				
				try {
					var s = dropRcsExit(window.rOutput);
					s = JSON.parse(s);
					window.finishListener(s);
				}catch(e) {;}
				try {
					var s = dropRcsExit(window.output);
					s = JSON.parse(s);
					window.finishListener(s);
				}catch(e) {;}
			}
		}
		window.onExecuteFail = function(stderr) {
			window.reqProcessing = false;
			if (window.failListener instanceof Function) {
				alert(stderr);
				window.failListener(stderr);
			}
		}
		function dropRcsExit(s) {
			return s;
			/*var sign = 'rcsexit', q;
			q = s.substring(s.length - sign.length);
			if (q == sign) {
				s = s.substring(0, s.length - sign.length);
			}*/
			var iQ = s.indexOf('['), iF = s.indexOf('{');
			if (iQ == -1) {
				iQ = 1000000;
			}
			if (iF == -1) {
				iF = 1000000;
			}
			iQ = iQ < iF ?  iQ : iF;
			if (iQ < 1000000) {
				s = s.substring(iQ);
			}
			return s;
		}
		function setEventListeners() {
			$('#zoomIn').click(onZoomIn);
			$('#zoomOut').click(onZoomOut);
			$('#zoomReset').click(onZoomReset);
			if ($('#preview')[0].attachEvent) {
				$('#preview')[0].attachEvent('onmousewheel',onCanvasMouseWheel);
			} else {
				$('#preview')[0].addEventListener('wheel', onCanvasMouseWheel);
				$('#preview')[0].addEventListener('mousewheel', onCanvasMouseWheel);//Opera 12.16
			}
			$('#preview').bind('mousedown', onCanvasMouseDown);
			$('#preview').bind('mouseup', onCanvasMouseUp);
			$(window).bind('mouseup', onCanvasMouseUp);
			$('#preview').bind('mousemove', onCanvasMouseMove);
			
			$('#edit').click(onEditClick);
			$('#delete').click(onDeleteClick);
			$('#pform').bind('mousemove', onFormMouseMove);
			$(window).bind('mousemove', onWindowMouseMove);
			$('#selectFile').click(onSelectFClick);
			$('#print').click(onPrintClick);
			$('#dxf').click(onDxfClick);
			
			pdfListView = $('#pdfs');
			pdfItems = $('#pdfItems');
			$('#showPrintFiles').click(onShowPdfClick);
			$('#pdfGotoCab').click(onReturnToCabinetFromPdfFormClick);
			
			setInterval(reloadFileList, 5*1000);
		}
		function onZoomIn(event) {
			var o;
			if (!event.isWheel && S.scaleX == 1) {
				SE2D.mouseX = U.round(SE2D.w / 2);
				SE2D.mouseY = U.round(SE2D.h / 2);
			}
			o = {x:SE2D.mouseX - S.x, y:SE2D.mouseY - S.y, sc:S.scaleX};
			
			S.scaleX += scaleStep;
			S.scaleY = S.scaleX;
			if (!event.isWheel && SE2D.mouseX == U.round(SE2D.w / 2)) {
				setPatternOnCenter();
			} else {
				setPatternOnMouseCursor(o, event);
			}
			if (mode == MODE_PRINT_PARAMS) {
				printForm.setMetadataPosition();
			}
		}
		function onZoomOut(event) {
			var sc =  S.scaleX - scaleStep, o;
			o = {x:SE2D.mouseX - S.x, y:SE2D.mouseY - S.y, sc:S.scaleX};
			/*if (isScaleByY) {
				sc = S.scaleY - scaleStep;
			}*/
			if (sc < 1) {
				sc = 1;
			}
			S.scaleX = S.scaleY = sc;
			if (!event.isWheel) {
				setPatternOnMouseCursor(o, event, 1);
			} else {
				setPatternOnMouseCursor(o, event, 1);
			}
			if (mode == MODE_PRINT_PARAMS) {
				printForm.setMetadataPosition();
			}
		}
		function onZoomReset(event) {
			S.scaleX = S.scaleY = 1;
			S.x = S.y = 0;
		}
		/**
		 * @description Выравнивает выкройку по центру при масштабировании приложения
		*/
		function setPatternOnCenter() {
			var move = 0;
			if (S.w > canvasW) {
				S.x = -1 * U.round( (S.w - canvasW) / 2  );
				move = 1;
			}
			if(S._height > canvasH) {
				move = 1;
				S.y = U.round( (canvasH - S._height) / 2  );
			}
			if (!move) {
				S.y = S.x = 0;
			}
		}
		function onCanvasMouseWheel(event) {
			event.preventDefault ? event.preventDefault() : 0;
			var d = event.wheelDelta ? event.wheelDelta / 60 : -1*event.deltaY;
			event.isWheel = 1;
			if (d > 0) {
				onZoomIn(event);
			} else {
				onZoomOut(event);
			}
			return false;
		}
		function onCanvasMouseUp(event) {
			canvasMouseLeftButtonIsDown = false;
		}
		function onCanvasMouseDown(event) {
			canvasMouseLeftButtonIsDown = true;
			canvasMouseClientX = event.clientX;
			canvasMouseClientY = event.clientY;
			spriteX = S.x;
			spriteY = S.y;
		}
		function onCanvasMouseMove(event) {
			if (canvasMouseLeftButtonIsDown && S.scaleX > 1) {
				var dx = event.clientX - canvasMouseClientX,
					dy = event.clientY - canvasMouseClientY,
					info = {};
				if (!spriteIsOutside(spriteX + dx / S.scaleX , spriteY + dy/ S.scaleX, info)) {
					S.x = spriteX + dx / S.scaleX;
					S.y = spriteY + dy  / S.scaleX;
				} else {
					if (info.x) {
						S.x = info.x;
					}
					if (info.y) {
						S.y = info.y;
					}
				}
			}
			setRemoveCursorVisible(0);
			$('#preview').css('cursor', 'default');
			return false;
		}
		/**
		 * @description Определяет допустимое смещение клипа на холсте
		 * @param {Number} x кордината клипа
		 * @param {Number} y кордината клипа
		 * @param {Object} {x,y} рекомендованные координаты в случае неуспеха
		*/
		function spriteIsOutside(x, y, p) {
			if (isScaleByY) {
				if (y + S.h  < canvasH - 1) {
					return 'y';
				}
				if (y > 1) {
					p.y = 1;
					if (x > 1) {
						p.x = 1;
					}
					return 'y';
				}
				if (x >  1) {
					p.x = 1;
					if (y > 1) {
						p.y = 1;
					}
					return 'x';
				}
				return false;
			}
			
			if (x + S.w  < canvasW - 1) {
				return 'x';
			}
			if (x > 1) {
				p.x = 1;
				if (y > 1) {
					p.y = 1;
				}
				return 'x';
			}
			if (y >  1) {
				p.y = 1;
				if (x > 1) {
					p.x = 1;
				}
				return 'y';
			}
			return false;
		}
		/**
		 * @description Смещает клип так, чтобы под курсором мыши была та же точка, что и до масштабирования
		 * @param {Object} o {x,y,sc} кординаты мыши в системе координат клипа и значение множителя масштабирования до действия масштабирования
		*/
		function setPatternOnMouseCursor(o, e, out) {
			var sc = S.scaleX / o.sc;
			/*if (isScaleByY) {
				sc = S.scaleY / o.sc;
			}*/
			var dx = (o.x * sc - o.x);
			var dy = (o.y * sc - o.y);
			var x = S.x - dx;
			var y = S.y - dy, p = {};
			var outside = spriteIsOutside(x, y, p);
			S.x = x;
			S.y = y;
			if (!isScaleByY) {
				if (out && S.scaleX > 1){
					if (outside == 'x') {
						if (S.x + S.w < SE2D.w) {
							S.x = SE2D.w -  S.w;
						} else {
							S.x = 0;
						}
					}
					if (outside == 'y') {
						if (S.y + S.h < SE2D.h) {
							y = SE2D.h -  S.h;
							if (y <= 0) {
								S.y = y;
							}
						} else if(S.y < 0){
							S.y = 0;
						}
					}
					if ( S.y > 1) {
						S.y = 0;
					}
				} else if (S.scaleX == 1){
					S.y = S.x = 0;
				}
			} else {
				if (out && S.scaleY > 1){
					
					if (outside == 'y') {
						if (S.y + S.h < SE2D.h) {
							S.h = SE2D.h -  S.h;
						} else {
							S.y = 0;
						}
					}
					if (outside == 'x') {
						if (S.x + S.w < SE2D.w) {
							x = SE2D.x -  S.w;
							if (x <= 0) {
								S.x = x;
							}
						} else if(S.x < 0){
							S.x = 0;
						}
					}
					if ( S.x > 1) {
						S.x = 0;
					}
				} else if (S.scaleY == 1){
					S.y = S.x = 0;
				}
			}
		}
		/**
		 * @description Вывод информации о файле на панельках формы
		 * @param {Number} id
		*/
		function _setFileInfo(id) {return;
			var fInfo = fileListData[id];
			if (fInfo) {
				_cutText(fInfo.fname ? fInfo.fname : '', '#currentFile', 25, id);
				_cutText(fInfo.fdesc ? fInfo.fdesc : '', '#currentFileD', 78, id);
			} else {
				$('#currentFile').html('&nbsp;');
				$('#currentFileD').html('&nbsp;');
			}
		}
		/**
		 * TODO заменить на css overflow:hidden + max-height
		 * @description Обрезает текст на панельке так, чтобы он не выходил зе ее пределы
		 * @param {String} s    текст, который должен быть установлен
		 * @param {String} $id  идентификатор панельки в виде "#idHtmlElement"
		 * @param {Number} minH высота, которая не должна быть первышена
		 * @param {Number} fid  идентификатор файла
		*/
		function _cutText(s, $id, minH, fid) {
			$($id).text(s);
			return;
			if (fileListData[fid] && fileListData[fid]['st' + $id] ) {
				$($id).text(fileListData[fid]['st' + $id]);
				return;
			}
			var h = $($id).height();
			$($id).css('height', 'auto');
			$($id).text(s);
			while ($($id).height() > minH) {
				s = s.substring(0, s.length - 1);
				$($id).text(s);
			}
			if (fileListData[fid] && fileListData[fid].fdesc) {
				fileListData[fid]['st' + $id] = s;
			}
			$($id).css('height', h + 'px');
		}
		/**
		 * @deprecated
		 * @description Listener клик на кнопкке Редактировать
		 * @param {Event} e
		*/
		function onEditClick(e) {
			if (mode == MODE_NORMAL) {
				$('#pform').addClass('textcursor');
				mode = MODE_EDIT;
			}
			return false;
		}
		/**
		 * @deprecated
		 * @description Listener клик на кнопкке Удалить
		 * @param {Event} e
		*/
		function onDeleteClick(e) {
			if (mode == MODE_NORMAL) {
				$('#pform').addClass('nocursor');
				mode = MODE_DELETE;
			}
			return false;
		}
		/**
		 * @description показывает форму перенования файла или каталога
		 * @param {String} id файла или каталога
		 * @param {String} type определяет файл это или каталог, если 'd' - каталог 
		*/
		function showRenameDialog(id, type) {
			type = type == 'd' ? 'd' : 'f';
			var L = (type == 'd' ? folderListData : fileListData),
				field = (type == 'd' ? 'fldname' : 'fname');
			if (L && L[id]) {
				var newname = prompt('Введите имя ' + (type == 'd' ? 'каталога' : 'файла'), L[id][field]),
					data = {name:newname, id:id, t:type};
				$('#pform').removeClass('textcursor');
				mode = MODE_NORMAL;
				if (newname) {
					preloader(1);
					req(data, onUserFiles, null, 'renameListItem');
				}
			}
		}
		/**
		 * @description показывает форму удаления файла или каталога
		 * @param {String} id файла или каталога
		 * @param {String} type определяет файл это или каталог, если 'd' - каталог 
		*/
		function showDeleteDialog(id, type) {
			var s;
			if (type != 'd') {
				s = 'Вы уверены, что хотите произвести удаление файла?\nИмя файла: ' + fileListData[id].fname;
			} else {
				s = 'Вы уверены, что хотите удалить папку со всем содержимым?\nИмя папки: ' + folderListData[id].fldname;
			}
			if (confirm(s)) {
				preloader(1);
				req({id:id, t:type}, onUserFiles, null, 'removeListItem');
			}
			mode = MODE_NORMAL;
			setRemoveCursorVisible(0);
			$('#pform').removeClass('nocursor');
		}
		/**
		 * @deprecated
		 * @description 
		 * @param {Event} evt
		*/
		function onFormMouseMove(evt) {
			var o = $('#cremove');
			if (mode == MODE_DELETE) {
				setRemoveCursorVisible(1);
				o.css('left', evt.originalEvent.clientX + 1 + 'px');
				o.css('top', evt.originalEvent.clientY + 1 + $(window).scrollTop() + 'px');
				return false;
			}
		}
		/**
		 * @deprecated
		 * @description 
		 * @param {Event} evt
		*/
		function onWindowMouseMove(evt) {
			setRemoveCursorVisible(0);
		}
		/**
		 * @deprecated
		 * @description Показать либо спрятать курсор удаления
		 * @param {Event} evt
		*/
		function setRemoveCursorVisible(v) {
			var a = 1, c = 'auto';
			if (!v) {
				a = 0;
				c = '1px';
			}
			$('#cremove').css('opacity', a)
					.css('filter', 'alpha(opacity=' + a + ')')
					.css('width', c)
					.css('height', c)
				;
		}
		/**
		 * @description Обработка клика на кнопке Выбор файла
		*/
		function onSelectFClick(evt) {
			evt.preventDefault();
			if (mode == MODE_NORMAL) {
				var file = Qt.openFileDialog("Выбор файла", Qt.appDir(), "dss(*.dss)");
				if(PHP.file_exists(file)) {
					var arr = file.split('/');
					var s = arr[arr.length - 1];
					window.lastSelected = file;
					loadUserFile(1);
				} else {
					alert('Надо выбрать dss файл');
				}
				
				/*var s = prompt('Введите имя файла', 'Новая папка');
				if ($.trim(s)) {
					preloader(1);
					req({name:s, p:folderId}, onCreateFolder, null, 'createFolder');
				} else {
					alert('Надо ввести имя длинее');
				}*/
			}
			return false;
		}
		function onCreateFolder(data) {
			preloader(0);
			if (!appErrorHandle(data)) {
				onUserFiles(data);
			} 
		}
		/**
		 * @description Формат слова в зваисимотси от значения n
		 * @param {Number} n
		 * @param {Array} for example = ['день', 'дня', 'дней']
		*/
		function plural(n, titles) {
			var cases = [2, 0, 1, 1, 1, 2];
			return titles[ (n % 100 > 4 && n % 100 < 20) ? 2 : cases[ Math.min( n % 10, 5) ] ];
		}
		/**
		 * @description Автоматическая перезагрузка списка файлов
		*/
		function reloadFileList() {
			if (mode == MODE_NORMAL && loadingProcess == 0) {
				loadUserFiles(folderId, 0);
			}
		}
		/**
		 * 
		*/
		function saveDraggingItemId(id, dir) {
			if (dir && id == 0) {
				movedItem = {};
				return;
			}
			movedItem.id = id;
			movedItem.dir = dir ? dir : 0;
		}
		/**
		 * @param {Number} id - идентификатор каталога назначения
		*/
		function moveItem(id) {
			if (!movedItem.id) {
				return false;
			}
			if (movedItem.dir && id == movedItem.id) {
				return;
			}
			loadingProcess = 1;
			removeListItem();
			movedItem.fid = id;
			req(movedItem, onMoveItem, null, 'moveItem');
			movedItem = {};
			return false;
		}
		/**
		 * @description AJAX HANDLER перемещение файла или каталога в каталог
		*/
		function onMoveItem(data) {
			preloader(0);
			appErrorHandle(data);
		}
		function onPrintClick() {
			if (!fileId) {
				alert('Необходимо выбрать файл');
				return false;
			}
			preloader(1);
			var data = {fileId:fileId, f:pfFormat.value};
			//data.o = (pfLand.checked ? 'landscape' : 'portrait');
			data.o = 'portrait'; //толи глюк то ли нет, но на сайте пока так
			if (pfFormat.value == 'plot') {
				data.plotW = iPlotW.value;
				data.plotH = iPlotH.value;
			}
			req(data, onPrintPermissionResult, null, 'getPrintPermission');
			return false;
		}
		function onDxfClick() {
			if (!fileId) {
				alert('Необходимо выбрать файл');
				return false;
			}
			//req(data, onPrintPermissionResultForDxf, null, 'getPrintPermission');
			var parser = new DssParser(), sDxf, outputFile;
            parser.parseData(lastSelected);
            if (parser.lines[0].startX || parser.lines[0].startY) {
				DxfCreator.init();
				sDxf = DxfCreator.createDxf(parser);
				outputFile = Qt.openDirectoryDialog("Выберите каталог для сохранения файла", getLastSelectedDir());
				outputFile = outputFile + '/d' + date('Y-m-d-H-i-s') +  '.dxf';
				PHP.file_put_contents(outputFile, sDxf);
				OS.ShellExecuteQ('open', outputFile, '', '', true);
			} else {
				alert('Ошибка при парсинге dss файла');
			}
			return false;
		}
		function onPrintPermissionResult(data) {
			preloader(0);
			if (WaitScr.isVisible) {
				WaitScr.viewData = data.view;
			}
			if(+data.is_active && +data.balance) {
				setPrintFormMode(data.view, data.balance, data.listsPerCoin);
			}
			if ( !(+data.balance) && +data.is_active) {
				showWaitScreen(data);
			}
			if ( !(+data.balance) && !(+data.is_active) ) {
				window.location.href = '/activation.php';
			}
		}
		window.getLastSelectedDir = function getLastSelectedDir() {
			var s = storage('lastSelectedDir');
			s = s ? s : OS.getTempFolderPath();
			return s;
		}
		/**
		 * @param {Object} view - получен вызовом Sprite::toArray (на клиенте этого метода нет, но есть fromArray восстанавливающий данные)
		 * @param {Number} balance - баланс пользователя в редкоинах
		 * @param {Number} listsPerCoin - сколько листов можно распечатать за один редкоин
		*/
		function setPrintFormMode(view, balance, listsPerCoin) {
			mode = MODE_PRINT_PARAMS;
			canvasState.G = canvasState.G ? canvasState.G : {};
			_cloneGraphics(G, canvasState.G);
			canvasState.scale = S.scaleX;
			canvasState.w = S.w;
			canvasState.h = S.h;
			canvasState.x = S.x;
			canvasState.y = S.y;
			G.clear();
			S.scaleX = S.scaleY = 1;
			S.x = S.y = 0;
			showPrintForm();
			printForm.reset();
			printForm.fileId = fileId;
			printForm.onViewData(view, balance, listsPerCoin);
			return false;
		}
		/**
		 * @description Устанавливает "нормальный" режим, то есть диалог настроек экспорта в pdf закрыт,
		 * 				выкройка отображавшаяся до его открытия отображается в том же положении, mode == MODE_NORMAL
		*/
		function setNormalMode() {
			mode = MODE_NORMAL;
			S.removeAllChilds();
			hidePrintForm();
			S.scaleX = S.scaleY = canvasState.scale;
			S.x = canvasState.x;
			S.y = canvasState.y;
			S.setWidth(canvasState.w);
			S.setHeight(canvasState.h);
			_cloneGraphics(canvasState.G, G);
			WaitScr.showWidget(0);
			
			S.clear();
			fileId = 0;
			window.lastSelected = 0;
			setRadioButtons();
		}
		/**
		 * @description Копирует свойства Graphics для последующего восстановления
		 * @param {Graphics} object что клонируем
		 * @param {Graphics} clone клон
		*/
		function _cloneGraphics(object, clone) {
			var i, o, j, L = object._objects.length;
			for (i in object) {
				if (i != '_objects') {
					clone[i] = object[i];
				}
			}
			clone._objects = [];
			for (i = 0; i < L; i++) {
				o = new Object();
				for (j in object._objects[i]) {
					o[j] = object._objects[i][j]; 
					clone._objects[i] = o;
				}
			}
		}
		/**
		 * @description Реакция на окончание ожидания файла для печати (при 0 балансе и активном аккаунте)
		*/
		function onZeroTime(data) {
			if (WaitScr.viewData) {
				printForm.printMode = printForm.MODE_PRINT_LIMITED;//TODO снять этот режим всякий раз при закрытии формы НО НЕ В !! .reset()
				setPrintFormMode(WaitScr.viewData, WaitScr.balance, WaitScr.listsPerCoin);
			}else if (data.view) {
				printForm.printMode = printForm.MODE_PRINT_LIMITED;//TODO снять этот режим всякий раз при закрытии формы НО НЕ В !! .reset()
				setPrintFormMode(data.view, data.balance, data.listsPerCoin);
			}
		}
		/**
		 * @description Реакция на отмену ожидания файла для печати (при 0 балансе и активном аккаунте)
		*/
		function onCancelWait() {
			mode = MODE_NORMAL;
			printForm.printMode = printForm.MODE_PRINT_COIN;
		}
		/**
		 * @description Реакция на клик "купить редкоины" (при 0 балансе и активном аккаунте)
		*/
		function onGetPro() {
		}
		/**
		 * @description Cокращенное apply для callback
		*/
		function cb(callback, This) {
			return function (evt) {
				return callback.apply(This, [evt]);
			}
		}
		/**
		 * @description Показать экран ожидания
		*/
		function showWaitScreen(data) {
			//mode = MODE_WAIT;
			WaitScr.onZeroTime   = onZeroTime;
			WaitScr.onCancelWait = onCancelWait;
			WaitScr.onGetPro     = onGetPro;
			WaitScr.balance      = data.balance;
			WaitScr.listsPerCoin  = data.listsPerCoin;
			
			//WaitScr.showWidget(1);
			if (data.timeWait) {
				WaitScr.show(data.timeWait, fileId, (fileListData[fileId] && fileListData[fileId].fname ? fileListData[fileId].fname : 'Id ' + fileId ));
			} else {
				//TODO get data ????
				//setPrintFormMode(data.view, data.balance, data.listsPerCoin);
				onZeroTime(data);
			}
		}
		/**
		 * @description Показать список распечатанных файлов пользователя
		*/
		function onShowPdfClick() {
			preloader(1);
			pdfListView.removeClass('hide');
			req({}, onLoadPdfFileList, null, 'getPdfFiles');
			return false;
		}
		/**
		 * @description Скрыть список распечатанных файлов пользователя
		*/
		function onReturnToCabinetFromPdfFormClick() {
			pdfListView.addClass('hide');
			return false;
		}
		function onLoadPdfFileList(data) {
			if (!appErrorHandle(data)) {
				preloader();
				var i, list = data.list, tpl = '<li>\
						<div class="left pdfitemFilename">NAME</div>\
						<div class="left pdfitemDate">DATE</div>\
						<div class="left pdfitemLinks">\
							<div><a href="LINK" target="_blank">Скачать</a></div>\
						</div>\
						<div class="clearfix"></div>\
					</li>', s;
				pdfItems.html('');
				if (list.length) {
					for (i = 0; i < list.length; i++) {
						s = tpl.replace('NAME', list[i].filename);
						s = s.replace('DATE', list[i].datePrint);
						s = s.replace('LINK', list[i].link);
						pdfItems.append($(s));
					}
				} else {
					pdfItems.html('<li class="noPdf">У вас пока нет файлов</li>');
				}
			}
		}
		//===========================DOM================================
		
		function showPrintForm() {
			$('#explorer').addClass('hide');
			$('#qA4').addClass('hide');
			$('#zoomBtns').addClass('hide');
			canvasState.height = $('#preview').height();
			canvasState.width = $('#preview').width();
			$('#preview').height(384);
			$('#preview').parent().height(384);
			$('#preview').width(340);
			$('#settings').removeClass('hide');
		}
		function hidePrintForm() {
			$('#preview').height(canvasState.height);
			$('#preview').parent().height(canvasState.height);
			$('#preview').width(canvasState.width);
			$('#settings').addClass('hide');
			$('#explorer').removeClass('hide');
			$('#qA4').removeClass('hide');
			$('#zoomBtns').removeClass('hide');
		}
		function removeListItem() {
			$('#files li').each(function(i, j){
				j = $(j);
				if (j.data('id') == movedItem.id && (!movedItem.dir || j.hasClass('folder'))) {
					j.remove();
				}
			});
		}
		function showError(s) {
			alert(s);
		}
		/**
		 *
		*/
		function isOldBrowser() {
			/*var cBrowser = function() {
				var ua = navigator.userAgent;
				var bName = function () {
					if (ua.search(/MSIE/) > -1) return "ie";
					if (ua.search(/Firefox/) > -1) return "firefox";
					if (ua.search(/Opera/) > -1) return "opera";
					if (ua.search(/Chrome/) > -1) return "chrome";
					if (ua.search(/Safari/) > -1) return "safari";
					if (ua.search(/Konqueror/) > -1) return "konqueror";
					if (ua.search(/Iceweasel/) > -1) return "iceweasel";
					if (ua.search(/SeaMonkey/) > -1) return "seamonkey";}();
				var version = function (bName) {
					switch (bName) {
						case "ie" : return (ua.split("MSIE ")[1]).split(";")[0];break;
						case "firefox" : return ua.split("Firefox/")[1];break;
						case "opera" : return ua.split("Version/")[1];break;
						case "chrome" : return (ua.split("Chrome/")[1]).split(" ")[0];break;
						case "safari" : return (ua.split("Version/")[1]).split(" ")[0];break;
						case "konqueror" : return (ua.split("KHTML/")[1]).split(" ")[0];break;
						case "iceweasel" : return (ua.split("Iceweasel/")[1]).split(" ")[0];break;
						case "seamonkey" : return ua.split("SeaMonkey/")[1];break;
					}}(bName);
				return [bName, version.split(".")[0] + '.' + version.split(".")[1]];
			}
			var b = cBrowser();
			if (b[0] == 'ie' && +b[1] < 9) {
				return true;
			}
			if (b[0] == 'chrome' && +b[1] < 6) {
				return true;
			}
			if (b[0] == 'firefox' && +b[1] < 4) {
				return true;
			}
			if (b[0] == 'opera' && parseFloat(b[1]) < 9.6) {
				return true;
			}
			if (b[0] == 'safari' && parseFloat(b[1]) < 3.1) {
				return true;
			}*/
			return false;
		}
		
		function patchLocalStorage() {
			if (!window.localStorage) {
				window.LocalStorage = {
					getItem:function(key) {
						var o = this;
						if (o._data[key]) {
							return o._data[key];
						}
					},
					setItem:function(key, val) {
						var increment = 0, o = window.LocalStorage;
						if (!o._data[key]) {
							increment = 1;
						}
						o._data[key] = val;
						var bytes = PHP.file_put_contents(o._file, JSON.stringify(o._data));
						
						if (bytes) {
							o.length += increment;
						}
					},
					removeItem:function(key, val) {
						var decrement = 0, o = window.LocalStorage;
						if (o._data[key]) {
							decrement = 1;
						}
						delete o._data[key];
						var bytes = PHP.file_put_contents(o._file, JSON.stringify(o._data));
						if (bytes) {
							o.length -= increment;
						}
					},
					_loadData:function() {
						var o = this, c;
						c = PHP.file_get_contents(o._file);
						try {
							o._data = JSON.parse(c);
							for (var i in o._data) {
								o.length++;
							}
						} catch(e) {
							PHP.file_put_contents(o._file, '{}');
						}
					},
					length:0,
					_file :Qt.appDir() + '/' + 'ls.json',
					_data : {}
				};
				window.LocalStorage._loadData();
			}
			window.storage = function(key, val) {
				var LS = window.localStorage ? window.localStorage : window.LocalStorage;
				if (String(val) !== 'undefined') {
					LS.setItem(key, val);
				}
				return LS.getItem(key);
			}
			window.removeStorageItem = function(key) {
				var LS = window.localStorage ?window.localStorage: window.LocalStorage;
				LS.removeItem(key);
			}
		}
		
		function patchRequest() {
			var q = PHP.file_get_contents(OS.getTempFolderPath() + '/out.json');
			var interval = setInterval(function(){
				if (window.reqProcessing) {
					var s = PHP.file_get_contents(OS.getTempFolderPath() + '/out.json');
					if (s != q) {
						try {
							s = JSON.parse(s);
							if ((s instanceof Object) || (s instanceof Array)) {
								if (s.error) {
									onExecuteError('rcsexit');
								} else {
									onExecuteSuccess('rcsexit');
								}
								clearInterval(interval);
							}
						} catch(e) {;}
					}
				} else {
					clearInterval(interval);
				}
			}, 500);
		}
		
	    function phpjsPatchAjaxBehavior($argv) {
		    var r = new Cmdline2HttpRequestAdapter($argv.length, $argv);
			if (r.result.error) {
				window.failListener(r.result);
			} else {
				
				window.successListener(r.result);
			}
	    }

	}//end anonymous function
)
();
