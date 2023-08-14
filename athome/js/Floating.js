/**
 * class Floating.js
 *
 * 작성일 : 2007.11.08
 * 수정일 : 2009.04.06 (@base 추가 : 기준ID)
 * 수정일 : 2009.04.08 (기능 보완 및 버그 수정)
 * 수정일 : 2009.06.03 (IE6 버그 수정)
 * 수정일 : 2010.03.02 (this.smooth 추가)
 */

var Floating = function(obj, offsetY, base, align) {
	this.obj = (typeof(obj) == 'string') ? document.getElementById(obj) : obj;
	this.base = (typeof(base) == 'string') ? document.getElementById(base) : base; // 추가 (20090406 )
	this.speed = 1;
	this.smooth = 15; // 부드럽게 움직이기 (default:8(기본), 1~15로 설정, 숫자가 클수로 부드럽게 움직임) (20100302 )
	this.layer = null;
	this.timeId = null;
	this.align = (align) ? align : '';

	if (this.obj != null) {
		this.obj.style.display = '';
		this.layer_top = (this.obj.style.top) ? parseInt(this.obj.style.top) : 0;
		this.layer_left = (this.obj.style.left) ? parseInt(this.obj.style.left) : 0;
		this.layer_offsetY = (offsetY) ? offsetY : this.layer_top;

		if (this.align == 'center') {
			var doc_w = (window.innerWidth || self.innerWidth || document.documentElement.clientWidth || document.body.clientWidth);
			this.layer_left += doc_w / 2;
		}

		this.init();
	}
	else return;
}

Floating.prototype = {
	init: function() {
		this.layer = document.createElement('div');
		with (this.layer.style) {
			position = 'absolute';
			top = this.layer_top + 'px';
			left = this.layer_left + 'px';
			width = this.obj.style.width;
			padding = '0px';
			border = this.obj.style.border;
			backgroundColor = (this.obj.style.backgroundColor) ? this.obj.style.backgroundColor : 'transparent';
		}

		var parent = this.obj.parentNode;
		//parent.insertBefore(this.layer, null);
		parent.insertBefore(this.layer, this.obj);
		//this.layer.innerHTML = this.obj.innerHTML;
		this.layer.appendChild(this.obj);

		// 기존 객체 초기화
		// IE6 버그 때문에 함수로 초기화 하지 않고 바로 객체 초기화 시킴 (20090603 )
		//this.obj_init();
		with (this.obj.style) {
			position = '';
			top = '';
			left = '';
		}

		// 추가 (20090406 )
		if (this.base != null) {
			if (!this.base.style.position) this.base.style.position = 'relative';
			this.base.appendChild(this.layer);
		}

		this.move();
	},

	move: function() {
		this.layer_start = parseInt(this.layer.style.top, 10);
		this.layer_end = parseInt(this.scrollTop()) + parseInt(this.layer_offsetY, 10);

		//if (this.layer_end < parseInt(this.layer_top, 10)) this.layer_end = parseInt(this.layer_top, 10); // 초기위치고정
		if (this.layer_start != this.layer_end) {
			// 부드럽게 움직이게 하기 위함 (20100302 )
			this.layer_offset = Math.ceil(Math.abs(this.layer_end - this.layer_start) / this.smooth);
			move_top = parseInt(this.layer.style.top, 10) + ((this.layer_end < this.layer_start) ? this.layer_offset * -1 : this.layer_offset);
			this.layer.style.top = move_top + 'px';
		}

		var t = this;
		this.timeId = window.setTimeout(function() { t.move() }, this.speed);
	},

	obj_init: function() {
		with (this.obj.style) {
			position = '';
			top = '';
			left = '';
		}
	},

	scrollTop: function() {
		if (window.pageYOffset) {
			scroll_top = window.pageYOffset
		}
		else if (document.documentElement && document.documentElement.scrollTop) {
			scroll_top = document.documentElement.scrollTop;
		}
		else if (document.body) {
			scroll_top = document.body.scrollTop;
		}

		return scroll_top;
	},
 
	// 객체 위치 가져옴 (20090406 )
	position: function(el) {
		var left = 0;
		var top = 0;
		while (el) {
			left += el.offsetLeft;
			top += el.offsetTop;
			el = el.offsetParent;
		}

		return {x:left, y:top};
	}
}