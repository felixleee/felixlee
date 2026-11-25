/*
 * STX Engine 정비시스템 — 데모 공통 도우미 (모든 화면에서 씀)
 *  - 진행 단계, 날짜·시간 표기, 목록 로딩/빈 결과 표시, 페이징, 전체 선택, CSV 내려받기, 인쇄, 입력 검증
 *  - 데모에 없는 메뉴(data-na)는 Mock.notInDemo() 로 안내
 */
(function (global, $) {
	'use strict';

	var STAGES = ['입고', '분해', '검사', '조립', '시운전', '출고'];

	var S = {
		STAGES: STAGES,
		stageIndex: function (s) { return STAGES.indexOf(s); },
		/** 진행 단계 표시 (색 배지) */
		stageBadge: function (s) {
			var i = STAGES.indexOf(s);
			return '<span class="demo_stage s' + (i < 0 ? 0 : i) + '">' + Mock.esc(s || '-') + '</span>';
		},
		/** 입고 → … → 출고 단계 막대 */
		stepper: function (s) {
			var cur = STAGES.indexOf(s);
			return '<ol class="demo_stepper">' + STAGES.map(function (name, i) {
				var cls = i < cur ? 'done' : (i === cur ? 'now' : '');
				return '<li class="' + cls + '"><span>' + (i + 1) + '</span>' + name + '</li>';
			}).join('') + '</ol>';
		},
		/** 10000 → '10,000H' */
		hours: function (n) { return n == null || n === '' || isNaN(n) ? '' : Mock.num(n) + 'H'; },
		/** '10,000H' → 10000 (숫자가 없으면 NaN) */
		parseNum: function (v) {
			var s = String(v == null ? '' : v).replace(/[^\d.]/g, '');
			return s === '' ? NaN : Number(s);
		},
		/** '2026-03-21' → '2026.3.21' (원래 화면 표기) */
		dotDate: function (d) {
			if (!d) return '';
			var t = Mock.toDate(d);
			return isNaN(t) ? String(d) : t.getFullYear() + '.' + (t.getMonth() + 1) + '.' + t.getDate();
		},
		isDate: function (v) {
			if (!/^\d{4}-\d{2}-\d{2}$/.test(v || '')) return false;
			var t = Mock.toDate(v);
			return !isNaN(t) && Mock.date(t) === v;
		},
		today: function () { return Mock.rel(0); },
		daysBetween: function (a, b) {
			return Math.round((Mock.toDate(b) - Mock.toDate(a)) / 86400000);
		},
		/** 리드타임 표기 — 32 → '1개월 (32일)', 12 → '12일' */
		leadText: function (days) {
			if (days == null || isNaN(days)) return '';
			return days >= 28 ? Math.max(1, Math.round(days / 30)) + '개월 (' + days + '일)' : days + '일';
		},
		ymd: function (d) { return Mock.date(d, 'YYYYMMDD'); },

		/* ---------- 목록 ---------- */
		/** tbody 에 로딩·빈 결과·오류 한 줄 */
		stateRow: function ($tbody, colspan, kind, msg) {
			var text = msg || (kind === 'loading' ? '불러오는 중이에요…' : kind === 'error' ? '목록을 불러오지 못했어요' : '조건에 맞는 데이터가 없어요');
			$tbody.html('<tr class="demo_state demo_' + kind + '"><td colspan="' + colspan + '">' +
				(kind === 'loading' ? '<span class="demo_spinner" aria-hidden="true"></span>' : '') + Mock.esc(text) + '</td></tr>');
		},
		/** .paging 안의 ul 을 원래 마크업(처음/이전/번호/다음/마지막)대로 그림 */
		paging: function ($paging, res, onGo) {
			var r = Mock.pageRange(res.page, res.pages, 5);
			var html = '<li><a href="javascript:;" data-page="1">처음</a></li>' +
				'<li><a href="javascript:;" data-page="' + Math.max(1, res.page - 1) + '">이전</a></li>';
			r.list.forEach(function (n) {
				html += '<li' + (n === res.page ? ' class="on"' : '') + '><a href="javascript:;" data-page="' + n + '">' + n + '</a></li>';
			});
			html += '<li><a href="javascript:;" data-page="' + Math.min(res.pages, res.page + 1) + '">다음</a></li>' +
				'<li><a href="javascript:;" data-page="' + res.pages + '">마지막</a></li>';
			var $ul = $paging.find('ul');
			if (!$ul.length) $ul = $('<ul></ul>').appendTo($paging);
			$ul.html(html);
			$paging.toggle(res.total > 0);
			$ul.off('click.demo').on('click.demo', 'a[data-page]', function (e) {
				e.preventDefault();
				var p = +$(this).attr('data-page');
				if (p && p !== res.page) onGo(p);
			});
		},
		/** 머리줄 체크박스로 전체 선택 */
		bindCheckAll: function ($table) {
			$table.on('change', 'thead input[type=checkbox]', function () {
				$table.find('tbody input[type=checkbox]').prop('checked', this.checked);
			});
			$table.on('change', 'tbody input[type=checkbox]', function () {
				var $all = $table.find('tbody input[type=checkbox]');
				$table.find('thead input[type=checkbox]').prop('checked', $all.length > 0 && $all.filter(':checked').length === $all.length);
			});
		},
		checkedIds: function ($table) {
			return $table.find('tbody input[type=checkbox]:checked').map(function () { return this.value; }).get();
		},
		resetCheckAll: function ($table) { $table.find('thead input[type=checkbox]').prop('checked', false); },
		/** 방금 저장·등록한 행 강조 */
		flash: function ($el) {
			if (!$el || !$el.length) return;
			$el.addClass('demo_hl');
			setTimeout(function () { $el.removeClass("demo_hl"); }, 4000);
		},
		/** 주소창 검색 조건 갱신 (새로고침·뒤로가기에도 유지) */
		replaceQuery: function (params) {
			try { global.history.replaceState(null, '', Mock.url(global.location.pathname.split('/').pop(), params)); } catch (e) { /* file:// 등 */ }
		},
		/** 목록 주소를 기억 → 등록·변경 화면의 [목록] 이 같은 검색 조건으로 돌아감 */
		rememberList: function (key) {
			try { global.sessionStorage.setItem('stx.list.' + key, global.location.search); } catch (e) { /* 무시 */ }
		},
		listUrl: function (key, page) {
			var s = '';
			try { s = global.sessionStorage.getItem('stx.list.' + key) || ''; } catch (e) { /* 무시 */ }
			return page + s;
		},

		/* ---------- 내려받기·인쇄 ---------- */
		/** CSV (UTF-8 BOM, 엑셀에서 한글 안 깨짐) */
		csv: function (filename, header, rows) {
			function cell(v) {
				v = v == null ? '' : String(v);
				return /[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
			}
			var text = [header].concat(rows).map(function (r) { return r.map(cell).join(','); }).join('\r\n');
			S.download(filename, '﻿' + text, 'text/csv;charset=utf-8');
		},
		download: function (filename, text, type) {
			var blob = new Blob([text], { type: type || 'text/plain;charset=utf-8' });
			var url = URL.createObjectURL(blob);
			var a = document.createElement('a');
			a.href = url;
			a.download = filename;
			a.style.display = 'none';
			document.body.appendChild(a);
			a.click();
			setTimeout(function () { URL.revokeObjectURL(url); if (a.parentNode) a.parentNode.removeChild(a); }, 1000);
			Mock.toast(filename + ' 파일을 내려받았어요', { type: 'success' });
		},
		/** 인쇄 — 팝업이 열려 있으면 팝업 내용만 */
		print: function (popId) {
			var cls = popId ? 'demo_print_pop' : '';
			if (cls) document.body.classList.add(cls);
			try { global.print(); } finally {
				if (cls) setTimeout(function () { document.body.classList.remove(cls); }, 300);
			}
		},

		/* ---------- 팝업 ---------- */
		openPop: function (id) { global.addClassName(id); },
		closePop: function (id) { global.removeClassName(id); },

		/* ---------- 입력 검증 ---------- */
		/**
		 * rules: [{ el: $input, label: '기종', required: true, test: function(v){ return '오류 메시지' | '' } }]
		 * 첫 오류에 포커스·토스트, 오류 칸은 빨간 테두리. 통과하면 true
		 */
		validate: function (rules) {
			var first = null;
			rules.forEach(function (r) {
				var $el = r.el, v = $.trim($el.val() || ''), msg = '';
				if (r.required && !v) msg = r.label + S.josa(r.label, '을', '를') + ' ' + (r.verb || '입력해 주세요');
				else if (v && r.test) msg = r.test(v) || '';
				$el.toggleClass('demo_invalid', !!msg).attr('aria-invalid', msg ? 'true' : null);
				if (msg && !first) first = { $el: $el, msg: msg };
			});
			if (first) {
				Mock.toast(first.msg, { type: 'error' });
				try { first.$el[0].focus({ preventScroll: false }); } catch (e) { /* 무시 */ }
				return false;
			}
			return true;
		},
		/** 받침에 맞는 조사 — josa('기종','을','를') → '을', josa('S/N','을','를') → '을'(엔) */
		josa: function (word, withFinal, noFinal) {
			var c = String(word || '').slice(-1), code = c.charCodeAt(0);
			var has;
			if (code >= 0xAC00 && code <= 0xD7A3) has = (code - 0xAC00) % 28 > 0;
			else if (/[0-9]/.test(c)) has = '013678'.indexOf(c) >= 0;
			else has = /[lmnrLMNR]/.test(c);
			return has ? withFinal : noFinal;
		},
		clearInvalid: function ($scope) { $scope.find('.demo_invalid').removeClass('demo_invalid').removeAttr('aria-invalid'); },
		/** Lightpick 달력에도 값 반영 (달력이 없으면 값만) */
		setDateField: function ($el, value, picker) {
			$el.val(value || '');
			if (picker && value) { try { picker.setDate(value, true); } catch (e) { /* 무시 */ } }
		},
		/** 전화번호 — 010-0000-1234 형식 */
		isPhone: function (v) { return /^0\d{1,2}-\d{3,4}-\d{4}$/.test(v); },
		/** 저장 버튼 중복 클릭 막기 */
		busy: function ($btn, on, text) {
			if (on) { $btn.data('label', $btn.text()).addClass('demo_busy').text(text || '저장 중…'); }
			else { $btn.removeClass('demo_busy').text($btn.data('label') || $btn.text()); }
		}
	};

	/* ---------- 공통 동작 ---------- */
	$(document).on('click', '[data-na]', function (e) {
		e.preventDefault();
		Mock.notInDemo($(this).attr('data-na'));
	});
	// 팝업 바깥(어두운 영역) 클릭·Esc 로 닫기
	$(document).on('click', '.layer_pop', function (e) {
		if (e.target === this) this.classList.remove('pop_on');
	});
	$(document).on('keydown', function (e) {
		if (e.key === 'Escape') $('.layer_pop.pop_on').last().removeClass('pop_on');
	});
	// 검색창에서 Enter → 조회
	$(document).on('keydown', '.search_wrap input[type=text]', function (e) {
		if (e.key === 'Enter') { e.preventDefault(); $('#btnSearch').trigger('click'); }
	});
	global.addEventListener('afterprint', function () { document.body.classList.remove('demo_print_pop'); });

	global.StxDemo = S;
})(window, jQuery);
