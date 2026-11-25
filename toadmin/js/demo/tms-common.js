/*!
 * TMS 데모 공통 — 원래 서버/공통 라이브러리(admin.lib.js 등)가 하던 일을 가상 데이터로 대신함
 *  - to_dialog      : 모달 iframe 창 (good_res_edit.html 등). 데모에 없는 화면은 Mock.notInDemo
 *  - ajax_loader    : 카테고리 2·3차, 도시 select 를 데이터로 채움 (ajax_selectbox_*.html 대체)
 *  - ajax_post      : 상태 일괄변경 (good_res_proc.html 대체)
 *  - AjaxCal        : 날짜 입력 → jQuery UI datepicker
 *  - help_box, MM_swapImage, MM_swapImgRestore, clipboardData 같은 빠진 함수 보충
 *  - TmsDemo        : 상태 표시·날짜 표기·입금 처리 같은 공통 도우미
 * 필요: jQuery, jQuery UI, mock/mock-api.js, mock/shared/touroffice-tours.js, mock/shared/tms-reservations.js
 */
(function (w, $) {
	'use strict';
	var esc = Mock.esc;
	var ADMIN = '클릭';   // 상단에 로그인돼 있는 관리자 이름

	var T = w.TmsDemo = { admin: ADMIN };

	/* ---------- 표기 ---------- */
	T.ymdw = function (d) { return d ? Mock.date(d, 'YYYY-MM-DD(ddd)') : ''; };
	T.flight = function (f) {
		if (!f || (!f.airline && !f.no)) return '';
		if (f.no && f.airline && String(f.no).indexOf(f.airline) === 0) return esc(f.no);
		return esc([f.airline, f.no].filter(Boolean).join(' '));
	};
	/** 목록의 예약상태 칸 — 원래 마크업: 상태 글자 + 입금 표시 */
	T.payLabel = function (r) {
		var st = TourRes.payState(r);
		if (r.status === '취소완료') return r.paid > 0 ? '<span style="color:#FF0000;font-weight:bold;">환불대기</span>' : '-';
		if (st === '입금완료') return '<b>완납</b>';
		if (st === '과입금') return '<b style="color:#0066CC;">과입금</b>';
		if (st === '미입금' && r.status === '예약접수') return '대기';
		return '<span style="color:#FF0000;font-weight:bold;">미납</span>';
	};
	T.statusCell = function (r) {
		return '<span style="color:' + (TourRes.COLOR[r.status] || '#999999') + ';">' + esc(r.status) + ' </span>\n' +
			'                                                <span color="">' + T.payLabel(r) + '</span>';
	};
	T.isNew = function (r) { return Date.now() - Mock.toDate(r.createdAt).getTime() < 24 * 3600 * 1000; };

	/** 같은 탭 안에서 데이터가 바뀌었다고 알림 (iframe 에서 저장했을 때 부모의 캐시를 비우려고) */
	T.invalidate = function (name) {
		try { w.dispatchEvent(new StorageEvent('storage', { key: 'felixlee.mock:' + name })); }
		catch (e) { try { var ev = document.createEvent('Event'); ev.initEvent('storage', false, false); ev.key = 'felixlee.mock:' + name; w.dispatchEvent(ev); } catch (er) { /* 무시 */ } }
	};

	/** 부모 창(목록)에 알림 — iframe 안에서 씀 */
	T.notifyParent = function (type, data) {
		if (w.parent && w.parent !== w) {
			try { w.parent.postMessage({ source: 'tms-demo', type: type, data: data || null }, '*'); } catch (e) { /* 무시 */ }
		}
	};

	/* ---------- 입금·상태 처리 (목록 일괄처리와 상세 창이 같이 씀) ---------- */
	T.applyDeposit = function (row, amount, method, date) {
		var before = row.paid || 0;
		row.paid = before + amount;
		row.deposits = (row.deposits || []).concat([{ at: Mock.now(), date: date || Mock.rel(0), amount: amount, method: method || '무통장', by: ADMIN }]);
		row.memos = (row.memos || []).concat([{ at: Mock.now(), by: ADMIN, text: '입금 확인 ' + Mock.won(amount) + ' (누계 ' + Mock.won(row.paid) + ', 미납 ' + Mock.won(Math.max(0, row.amount - row.paid)) + ')', public: true }]);
		return row;
	};
	T.applyStatus = function (row, status) {
		if (row.status === status) return row;
		row.memos = (row.memos || []).concat([{ at: Mock.now(), by: ADMIN, text: '예약상태 변경: ' + row.status + ' → ' + status, public: true }]);
		row.status = status;
		return row;
	};

	/* ---------- 모달 창 (to_dialog) ---------- */
	var stack = [];
	function openDialog(title, w0, h0, bodyHtml) {
		var vw = $(w).width(), vh = $(w).height();
		var width = Math.min(parseInt(w0, 10) || 900, vw - 40), height = Math.min(parseInt(h0, 10) || 600, vh - 40);
		var id = 'tms_dlg_' + (stack.length + 1) + '_' + Date.now();
		var $bg = $('<div class="tms_dlg_bg" id="' + id + '"><div class="tms_dlg" role="dialog" aria-modal="true" aria-label="' + esc(title) + '" style="width:' + width + 'px;height:' + height + 'px;">' +
			'<div class="tms_dlg_head"><strong>' + esc(title) + '</strong><button type="button" class="tms_dlg_close" aria-label="닫기">&times;</button></div>' +
			'<div class="tms_dlg_body">' + bodyHtml + '</div></div></div>');
		$('body').append($bg).addClass('tms_dlg_open');
		stack.push(id);
		$bg.find('.tms_dlg_close').focus();
		return $bg;
	}
	function closeDialog(id) {
		var target = id && stack.indexOf(id) >= 0 ? id : stack[stack.length - 1];
		if (!target) return;
		$('#' + target).remove();
		stack = stack.filter(function (x) { return x !== target; });
		if (!stack.length) $('body').removeClass('tms_dlg_open');
	}
	$(document).on('click', '.tms_dlg_close', function () { closeDialog($(this).closest('.tms_dlg_bg').attr('id')); });
	$(document).on('mousedown', '.tms_dlg_bg', function (e) { if (e.target === this) closeDialog(this.id); });
	$(document).on('keydown', function (e) { if (e.keyCode === 27 && stack.length) closeDialog(); });

	w.to_dialog = {
		iframe: function (url, title) {
			var page = String(url).split('?')[0].split('/').pop();
			if (page === 'good_res_edit.html') {
				var $d = openDialog(title, arguments[2], arguments[3], '<iframe src="' + esc(url) + '" title="' + esc(title) + '"></iframe>');
				return $d.attr('id');
			}
			if (page === 'good_res_account_all.html') {
				var p = new URLSearchParams(String(url).split('?')[1] || '');
				T.batchDeposit((p.get('res_no_all') || '').split('||').filter(Boolean));
				return null;
			}
			Mock.notInDemo(title);
			return null;
		},
		html: function (html, title, w0, h0) { return openDialog(title, w0 || 640, h0 || 460, '<div class="tms_dlg_html">' + html + '</div>').attr('id'); },
		close: closeDialog
	};

	// iframe(상세 창)에서 보내는 알림
	w.addEventListener('message', function (e) {
		var m = e.data;
		if (!m || m.source !== 'tms-demo') return;
		if (m.type === 'saved') { T.invalidate('tms.reservations'); }
		if (m.type === 'close') closeDialog();
		if (m.type === 'toast' && m.data) Mock.toast(m.data.msg, { type: m.data.type });
	});

	/* ---------- 입금 일괄처리 (good_res_account_all.html 대체) ---------- */
	T.batchDeposit = function (ids) {
		var rows = ids.map(function (id) { return MockDB.find('tms.reservations', id); }).filter(Boolean);
		var targets = rows.filter(function (r) { return TourRes.unpaid(r) > 0 && r.status !== '취소완료'; });
		if (!targets.length) { Mock.toast('선택한 예약은 모두 완납 상태예요'); return; }
		var sum = targets.reduce(function (s, r) { return s + TourRes.unpaid(r); }, 0);
		if (!w.confirm('선택한 ' + targets.length + '건의 미납액 ' + Mock.won(sum) + ' 을 입금 처리할까요?\n(완납되면 예약상태가 입금완료로 바뀌어요)')) return;
		targets.forEach(function (r) {
			MockDB.update('tms.reservations', r.id, function (row) {
				T.applyDeposit(row, TourRes.unpaid(row), '무통장');
				if (['예약접수', '예약확정', '계약금입금'].indexOf(row.status) >= 0) T.applyStatus(row, '입금완료');
			});
		});
		Mock.toast(targets.length + '건 입금 처리했어요', { type: 'success' });
		$(document).trigger('tms:changed');
	};

	/* ---------- 원래 공통 라이브러리 함수 대체 ---------- */
	// 상태 일괄변경 — good_res.html 의 '일괄처리' 버튼이 ajax_post("ajax_proc", "good_res_proc.html", "frm_list") 를 부름
	w.ajax_post = function (target, url, formId) {
		if (String(url).indexOf('good_res_proc.html') < 0) { Mock.notInDemo(); return; }
		var $f = $('#' + formId);
		var code = $f.find('select[name=order_state]').val(), status = TourRes.CODE[code];
		var ids = $f.find('.item_checkbox_res:checked').map(function () { return this.value; }).get();
		if (!status || !ids.length) return;
		ids.forEach(function (id) { MockDB.update('tms.reservations', id, function (row) { T.applyStatus(row, status); }); });
		Mock.toast(ids.length + '건을 \'' + status + '\' 로 바꿨어요', { type: 'success' });
		$(document).trigger('tms:changed');
	};

	// 카테고리·도시 select — 원래 ajax_selectbox_mc / sc / areac.html 을 불러오던 부분
	function fill($sel, first, list) {
		$sel.html('<option value="">' + first + '</option>' + list.map(function (x) {
			return '<option value="' + esc(x.value) + '">' + esc(x.name) + '</option>';
		}).join(''));
	}
	T.subCates = function (b) {
		var c = TourOfficeData.findCate(b);
		return c && !c.m ? c.b.children.map(function (x) { return { value: x.uid, name: x.name }; }) : [];
	};
	T.countriesOf = function (m) {
		var out = [];
		MockDB.all('touroffice.tours').forEach(function (t) { if (String(t.m_uid) === String(m) && out.indexOf(t.country) < 0) out.push(t.country); });
		return out.map(function (x) { return { value: x, name: x }; });
	};
	T.citiesOf = function (code) {
		var out = [];
		MockDB.all('touroffice.tours').concat(MockDB.all('tms.reservations')).forEach(function (t) {
			if (t.countryCode === code && t.city && out.indexOf(t.city) < 0) out.push(t.city);
		});
		return out.map(function (x) { return { value: x, name: x }; });
	};
	w.ajax_loader = function (url) {
		var page = String(url).split('?')[0], p = new URLSearchParams(String(url).split('?')[1] || '');
		if (page === 'ajax_selectbox_mc.html') fill($('#srh_m_uid_s'), '2차 카테고리', T.subCates(p.get('srh_b_uid')));
		else if (page === 'ajax_selectbox_sc.html') fill($('#srh_s_uid_s'), '3차 카테고리', p.get('srh_m_uid') ? T.countriesOf(p.get('srh_m_uid')) : []);
		else if (page === 'ajax_selectbox_areac.html') fill($('#srh_Cidx_s'), '도시', p.get('srh_Bidx') ? T.citiesOf(p.get('srh_Bidx')) : []);
	};

	// 날짜 입력 — 원래 AjaxCalendar(PHP) 를 jQuery UI datepicker 로
	if ($.datepicker) {
		$.datepicker.setDefaults({
			dateFormat: 'yy-mm-dd', changeMonth: true, changeYear: true, showMonthAfterYear: true, yearSuffix: '년',
			monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
			monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
			dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'], prevText: '이전 달', nextText: '다음 달'
		});
	}
	w.AjaxCal = function (el, ev, opts) {
		if (!$.datepicker) return;
		var $el = $(el);
		if (!$el.hasClass('hasDatepicker')) {
			$el.datepicker({
				onSelect: function () {
					var fn = opts && opts.add_event && String(opts.add_event).replace(/\(\)\s*;?$/, '');
					if (fn && typeof w[fn] === 'function') w[fn]();
				}
			});
		}
		$el.datepicker('show');
	};

	w.help_box = function () { /* 풍선도움말 — 데모에서는 없음 */ };
	var swapped = [];
	w.MM_swapImage = function (name, x, src) {
		var img = document.querySelector('img[name="' + name + '"]');
		if (!img) return;
		swapped.push([img, img.getAttribute('src')]);
		img.setAttribute('src', src);
	};
	w.MM_swapImgRestore = function () {
		swapped.forEach(function (x) { x[0].setAttribute('src', x[1]); });
		swapped = [];
	};
	// 화면ID 클릭 시 쓰던 IE 전용 clipboardData
	if (!w.clipboardData) {
		w.clipboardData = { setData: function (t, v) { try { navigator.clipboard.writeText(v); Mock.toast('화면ID 를 복사했어요: ' + v); } catch (e) { /* 무시 */ } } };
	}
})(window, jQuery);
