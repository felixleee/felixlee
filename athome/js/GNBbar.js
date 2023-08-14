/**
 * class GNBbar.js (네이게이션바 클래스)
 *
 * 작성일 : 2008.11.13
 * 수정일 : 2009.06.27 (가로/세로 옵션 추가 및 더쉽게(?) 사용할 수 있도록 변경)
 * 수정일 : 2009.07.08 (prototype.js 과의 충돌 수정)
 * 수정일 : 2009.08.17 (최근)
 * 수정일 : 2009.10.05 (함수 수정)
 * 수정일 : 2009.10.06 (레이어 위치 조정)
 * 수정일 : 2010.06.09 (오버하지 못하도록 자동으로 위치 잡기를 선택적으로 할수 있도록 수정)
 */

var GNBbar = function(option) {
	option = (option) ? option : {};
	this.option = option;

	this.offsetX	= (option.offsetX != undefined) ? option.offsetX : 0; // 메뉴 레이어(X위치 조정)
	this.offsetY	= (option.offsetY != undefined) ? option.offsetY : 5; // 메뉴 레이어(Y위치 조정)
	this.direction	= (option.direction) ? option.direction : 'vertical'; // horizon(가로) or vertical(세로)
	this.click_hide = (option.click_hide) ? option.click_hide : false; // 클릭숨김 (true or false)
	this.delay_hide = (option.delay_hide) ? option.delay_hide : false; // 딜레이숨김 (true or false)
	this.delay		= (option.delay) ? option.delay * 1000 : 1 * 1000; // 딜레이숨김 시간 (1초=1000)
	this.use_blend	= (option.use_blend) ? option.use_blend : false; // blend 효과 (true or false)
	this.duration	= (option.duration != undefined) ? option.duration : 0.2; // blend 효과 시간
	this.class_name = (option.class_name) ? option.class_name : 'on'; // 선택객체 변경 클래스명
	this.callback	= (option.callback) ? option.callback : null; // 콜백 함수
	this.is_fixed	= (option.is_fixed == true) ? true : false; // 오버하지 못하도록 자동으로 위치 잡기

	this.save = null;
	this.save_menu = null;
	this.delay_timer = null;
	this.view_menu = false;

	this.event_click = null;
	if (this.click_hide) {
		this.event_click = this.click.bind(this);
		Evt.add(document, 'click', this.event_click);
	}
}

GNBbar.prototype = {
	// 객체 얻음
	$: function(element) {
		if (typeof(element) == 'string') element = document.getElementById(element);
		return element;
	},

	// 레이어 처리
	view: function(obj, menu_id, option) {
		option = (option) ? option : {};
		var url = option.url;
		var target = option.target;
		var x = option.x;
		var y = option.y;
		var bool = option.bool;
		var opt = (option.opt) ? option.opt : '';

		// 선택한 객체 처리
		var t = this;
		t.show(obj);

		// url 처리
		if (url) window.open(url, target, opt);

		// menu 처리 (서브레이어 처리)
		if (menu_id) this.menu(obj, menu_id, x, y, bool);

		// 사용자 함수 실행
		if (this.callback) this.callback();
	},

	// 선택한 객체 처리
	show: function(obj, className) {
		obj = this.$(obj);
		if (!obj || obj == null) return;

		if (this.save != null) {
			this.save.className = '';
		}

		// 선택한 객체의 클래스 처리
		if (this.class_name) {
			obj.className = (obj.className) ? obj.className + ' ' + this.class_name : this.class_name;
		}
		obj.onfocus = function() { obj.blur(); }

		this.save = obj;
	},

	// 서브레이어 처리
	menu: function(obj, menu_id, x, y, bool) {
		obj = this.$(obj);
		var menu_obj = this.$(menu_id);

		// 서브레이어 숨김
		this.hide();

		if (obj == null || menu_obj == null) return;

		x = (x) ? x : this.offsetX;
		y = (y) ? y : this.offsetY;

		if (bool == 'hide') {
			menu_obj.style.display = 'none';
			this.view_menu = false;
		}
		else {
			var t = this;

			// 블렌드 효과 처리 (IE용) => 나중에 크로스 브라우저용으로 처리할꺼임(--;)
			if (this.use_blend && menu_obj.filters != undefined) {
				menu_obj.style.filter = 'blendTrans(duration=' + this.duration + ')';
				menu_obj.filters.blendTrans.Stop();
				menu_obj.filters.blendTrans.Apply();
				menu_obj.style.display = '';
				menu_obj.filters.blendTrans.Play();
			}
			else menu_obj.style.display = '';

			x = parseInt(x);
			y = parseInt(y);
			var position = this.position(obj); // 객체 위치
			var size = this.get_size(obj); // 객체 크기
			var left = position.x + x + ((this.direction == "horizon") ? size.width : 0);
			var top = position.y + y + ((this.direction == "vertical") ? size.height : 0);
			var pos = this.get_position(menu_obj, left, top); // 객체 위치 설정

			// 서브레이어 위치 설정
			var objBody = document.getElementsByTagName("body").item(0);	
			objBody.appendChild(menu_obj);		
			with (menu_obj.style) {
				position = 'absolute';
				zIndex = 100;
				left = pos.x + 'px';
				top = pos.y + 'px';
			}

			this.view_menu = true;

			if (this.click_hide) {
				menu_obj.onmouseover = function() { Evt.remove(document, 'click', t.event_click); }
				menu_obj.onmouseout = function() { Evt.add(document, 'click', t.event_click); }
			}

			if (this.delay_hide) {
				menu_obj.onmouseover = function() { if (t.delay_timer) clearTimeout(t.delay_timer); }
				menu_obj.onmouseout = function() { t.delay_timer = setTimeout(function() { t.hide(); }, t.delay); }
			}
		}

		this.save_menu = menu_obj;
	},

	// 서브레이어 숨김
	hide: function() {
		if (this.save_menu) this.save_menu.style.display = 'none';
	},

	// 클릭 이벤트
	click: function() {
		if (!this.view_menu) {
			this.hide();
		}
		else {
			this.view_menu = false;
		}
	},

	// 객체 위치 가져옴
	position: function(el) {
		var left = 0;
		var top = 0;
		while (el) {
			left += el.offsetLeft;
			top += el.offsetTop;
			el = el.offsetParent;
		}

		return {x:left, y:top};
	},

	// 객체 사이즈
	get_size: function(el) {
		return {
			width:el.offsetWidth,
			height:el.offsetHeight
		};
	},

	// 클라이언트 사이즈
	get_client: function() {
		return {
			width:(document.body.clientWidth || document.documentElement.clientWidth) + (document.body.scrollLeft || document.documentElement.scrollLeft),
			height:(document.body.clientHeight || document.documentElement.clientHeight) + (document.body.scrollTop || document.documentElement.scrollTop)
		};
	},

	// 객체 위치 설정
	// 오버하지 못하도록 자동으로 위치 잡기 (20090627 )
	// 오버하지 못하도록 자동으로 위치 잡기를 선택적으로 할수 있도록 수정 (20100609 )
	get_position: function(obj, x, y) {
		if (this.is_fixed == true) return {x:x, y:y};
		
		var size = this.get_size(obj);
		var client = this.get_client();
		var max_x = (client.width - size.width) - 0;
		var max_y = (client.height - size.height) - 0;
		return {
			x:(x > max_x) ? max_x : x,
			y:(y > max_y) ? max_y - (client.height - y) : y
		};
	}
}

/* bind js */
Function.prototype.bind = function() {
	var method = this, args = [], object = null;
	for (var i=0, len=arguments.length; i<len; i++) args[i] = arguments[i];
	object = args.shift();
	return function() {
		return method.apply(object, args);
	}
}

Function.prototype.bindAsEvent = function(object) {
	var method = this, args = [];
	for (var i=0, len=arguments.length; i<len; i++) args[i] = arguments[i];
	object = args.shift();
	return function(e) {
		return method.apply(object, [e || window.event].concat(args));
	}
}

/* event js */
var Evt = new Object();
Evt.add = function(obj, evt, fnc) {
	if (obj.addEventListener) obj.addEventListener(evt, fnc, false);
	else obj.attachEvent('on' + evt, fnc);
}
Evt.remove = function(obj, evt, fnc) {
	if (obj.addEventListener) obj.removeEventListener(evt, fnc, false);
	else obj.detachEvent('on' + evt, fnc);
}