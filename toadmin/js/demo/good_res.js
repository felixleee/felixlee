/*!
 * TMS 여행예약 > 예약관리 (main/good_res.html)
 *  - 검색폼(GET 제출 → 주소의 조건을 다시 읽음): 검색어·기간·예약경로·결제수단·회원·예약상태·입금·카테고리/국가/도시
 *  - 정렬·개수·페이징, 전체선택 + 상태 일괄변경 / 입금 일괄처리, 엑셀(CSV) 저장
 *  - 행 클릭 → 예약 상세/수정 창(good_res_edit.html, 모달 iframe)
 *  - 다른 탭에서 예약이 들어오면(MockDB.on) 자동으로 다시 그림
 */
(function (w, $) {
	'use strict';
	var T = w.TmsDemo, esc = Mock.esc;
	var $tbody = $('#res_list_body'), $sum = $('#res_summary'), $pg = $('#res_paging');
	var form = document.frm_search;
	var params = new URLSearchParams(location.search);
	var view = {
		order: params.get('order_by_s') || 'ins_dt desc',
		size: parseInt(params.get('list_count_s'), 10) || 20,
		page: parseInt(params.get('page'), 10) || 1
	};
	var knownIds = null;          // 새 예약 알림용
	var lastRows = [];            // 엑셀 저장용 (현재 검색 결과 전체)

	/* ---------- 기간 버튼·연월 (원래 2023년 날짜가 박혀 있던 부분을 오늘 기준으로) ---------- */
	var today = Mock.rel(0);
	function back(days, months) {
		var d = Mock.toDate(today);
		if (months) d.setMonth(d.getMonth() - months);
		if (days) d.setDate(d.getDate() - days);
		return Mock.date(d);
	}
	var PERIODS = [
		['yesterday', back(1), back(1)], ['today', today, today], ['bebore7day', back(7), today], ['bebore15day', back(15), today],
		['bebore1month', back(0, 1), today], ['bebore3month', back(0, 3), today], ['bebore1year', back(0, 12), today]
	];
	$('.item_period_date li a').each(function (i) {
		var p = PERIODS[i];
		if (!p) return;
		this.removeAttribute('onclick');
		$(this).on('click', function () {
			$('#date_s1').val(p[1]); $('#date_s2').val(p[2]); $('#period_date_s').val(p[0]);
		});
	});
	var thisYear = new Date().getFullYear();
	$('#item_period_yy').html([thisYear + 1, thisYear, thisYear - 1].map(function (y) { return '<option value="' + y + '">' + y + '년</option>'; }).join('')).val(thisYear);
	$('.item_period_mm li').removeClass('on').eq(new Date().getMonth()).addClass('on');
	// 달력에서 날짜를 직접 고르면 기간 버튼 선택을 풂 (원래 no-op 이던 함수)
	w.clear_period_date = function () { $('.item_period_date li').removeClass('on'); $('#period_date_s').val(''); };
	$('.item_period_mm li').on('click', function () { $('.item_period_date li').removeClass('on'); $('#period_date_s').val(''); });

	// 1차 카테고리에 숙소·픽업도 (데이터에 있는 분류)
	TourOfficeData.cate.forEach(function (c) {
		if (!$('#srh_b_uid_s option[value="' + c.uid + '"]').length) $('#srh_b_uid_s').append('<option value="' + c.uid + '">' + esc(c.name) + '</option>');
	});

	/* ---------- 주소 → 폼 ---------- */
	function applyParams() {
		var has = false;
		params.forEach(function (v, k) {
			if (!form.elements[k] || k === 'period_yy_s') return;
			has = true;
			var el = form.elements[k];
			if (el.length && el[0] && el[0].type === 'radio') { $(form).find('input[name="' + k + '"]').each(function () { this.checked = this.value === v; }); }
			else if (el.tagName === 'SELECT' || el.type === 'text' || el.type === 'hidden') $(el).val(v);
		});
		// 카테고리·국가 연쇄 select 채우기
		var b = params.get('srh_b_uid_s'), m = params.get('srh_m_uid_s'), s = params.get('srh_s_uid_s');
		if (b) { w.ajax_loader('ajax_selectbox_mc.html?srh_b_uid=' + b); $('#srh_m_uid_s').val(m || ''); }
		if (m) { w.ajax_loader('ajax_selectbox_sc.html?srh_m_uid=' + m); $('#srh_s_uid_s').val(s || ''); }
		var cc = params.get('srh_Bidx_s');
		if (cc) { w.ajax_loader('ajax_selectbox_areac.html?srh_Bidx=' + cc); $('#srh_Cidx_s').val(params.get('srh_Cidx_s') || ''); }
		// 날짜가 주소에 없으면: 기간 버튼 값(없으면 1개월)으로 채우고, 기간 값이 빈 문자열이면 기간 조건 없이 검색
		// (마크업에 박혀 있던 2023년 날짜가 조건으로 쓰이지 않게)
		if (!params.has('date_s1') && !params.has('date_s2')) {
			var want = params.has('period_date_s') ? params.get('period_date_s') : 'bebore1month';
			var hit = PERIODS.filter(function (p) { return p[0] === want; })[0];
			if (hit) { $('#date_s1').val(hit[1]); $('#date_s2').val(hit[2]); $('#period_date_s').val(hit[0]); }
			else { $('#date_s1').val(''); $('#date_s2').val(''); $('#period_date_s').val(''); }
		}
		var pd = $('#period_date_s').val();
		$('.item_period_date li').removeClass('on');
		PERIODS.forEach(function (p, i) { if (p[0] === pd) $('.item_period_date li').eq(i).addClass('on'); });
		$('#order_by_s').val(view.order);
		$('#list_count_s').val(String(view.size));
	}

	/* ---------- 폼 → 조건 ---------- */
	function digits(s) { return String(s || '').replace(/\D/g, ''); }
	function readFilter() {
		var f = {};
		$(form).serializeArray().forEach(function (x) { if (!(x.name in f)) f[x.name] = $.trim(x.value); });
		return f;
	}
	var KEY_FIELD = {
		res_cust_nm: function (r) { return r.customer.name; },
		mb_id: function (r) { return r.memberId; },
		res_cust_tel: function (r) { return r.customer.phone; },
		res_cust_hp: function (r) { return r.customer.phone; },
		res_cust_email: function (r) { return r.customer.email; },
		res_no: function (r) { return r.id; },
		srh_persons_nm: function (r) { return r.travelers.map(function (t) { return t.name; }).join(' '); },
		srh_persons_tel: function (r) { return r.customer.phone; },
		srh_persons_hp: function (r) { return r.customer.phone; },
		g_title: function (r) { return r.tourTitle; },
		ev_title: function (r) { return r.evTitle; },
		ev_code: function (r) { return r.tourCode + ' ' + r.tourId; },
		agent_corp_nm: function (r) { return r.agent; },
		admin_nm: function (r) { return r.manager; }
	};
	function makeFilter(f) {
		var bName = f.srh_b_uid_s ? (TourOfficeData.findCate(f.srh_b_uid_s) || { b: {} }).b.name : '';
		var mName = f.srh_m_uid_s ? ((TourOfficeData.findCate(f.srh_m_uid_s) || {}).m || {}).name : '';
		var dateField = { ins_dt: 'createdAt', ev_start: 'departDate', ev_end: 'returnDate' }[f.mode_period_s || 'ins_dt'];
		var kw = (f.search_word_s || '').toLowerCase(), getter = KEY_FIELD[f.search_key_s] || KEY_FIELD.res_cust_nm;
		var phoneKey = /tel|hp/.test(f.search_key_s || '');
		return function (r) {
			if (f.contract_s === 'agent' && r.channel !== '제휴사') return false;
			if (f.contract_s === 'person' && r.channel === '제휴사') return false;
			if (kw) {
				var v = String(getter(r) || '');
				if (phoneKey ? digits(v).indexOf(digits(kw)) < 0 || !digits(kw) : v.toLowerCase().indexOf(kw) < 0) return false;
			}
			var d = String(r[dateField] || '').slice(0, 10);
			if (f.date_s1 && d < f.date_s1) return false;
			if (f.date_s2 && d > f.date_s2) return false;
			switch (f.ins_route_s) {
				case 'B': if (r.channel !== '홈페이지' || r.device === 'MO') return false; break;
				case 'C': if (r.channel !== '홈페이지' || r.device !== 'MO') return false; break;
				case 'A': if (r.channel !== '방문' && r.channel !== '제휴사') return false; break;
				case 'A1': if (r.channel !== '전화') return false; break;
			}
			if (f.srh_payment_s === 'A' && r.payMethod !== '무통장') return false;
			if (f.srh_payment_s === 'B' && r.payMethod !== '카드') return false;
			if (f.srh_payment_s === 'C' && r.payMethod !== '포인트') return false;
			if (f.is_member_s === 'member' && !r.member) return false;
			if (f.is_member_s === 'nomember' && r.member) return false;
			if (f.order_state_s && r.status !== TourRes.CODE[f.order_state_s]) return false;
			if (f.srh_pay_stat_s) {
				var ps = { A: '미입금', B: '부분입금', C: '입금완료', D: '과입금' }[f.srh_pay_stat_s];
				if (TourRes.payState(r) !== ps) return false;
			}
			var cate = String(r.cate || '').split('>');
			if (bName && cate[0] !== bName) return false;
			if (mName && cate[1] !== mName) return false;
			if (f.srh_s_uid_s && cate[2] !== f.srh_s_uid_s) return false;
			if (f.srh_Bidx_s && r.countryCode !== f.srh_Bidx_s) return false;
			if (f.srh_Cidx_s && r.city !== f.srh_Cidx_s) return false;
			return true;
		};
	}
	var SORT = {
		'ins_dt desc': ['-createdAt'], 'ins_dt': ['createdAt'],
		'ev_start desc': ['-departDate', '-createdAt'], 'ev_start': ['departDate', '-createdAt'],
		'ev_end desc': ['-returnDate', '-createdAt'], 'ev_end': ['returnDate', '-createdAt'],
		'sales_total desc': ['-amount', '-createdAt'], 'sales_total': ['amount', '-createdAt']
	};

	/* ---------- 그리기 (원래 행 마크업 그대로) ---------- */
	function rowHtml(r, fresh) {
		var hotel = r.kind === 'hotel';
		var sub = hotel && r.hotel ? esc(r.evTitle) + ' · ' + esc(r.hotel.room) + ' ' + r.hotel.rooms + '실' : esc(r.evTitle || '');
		var depInfo = hotel && r.hotel ? r.hotel.nights + '박' : T.flight(r.departFlight);
		var retInfo = hotel ? '체크아웃' : T.flight(r.returnFlight);
		var title = '여행상품예약 수정 - ' + r.id;
		return '\n                                        <tr class="' + (r.status === '취소완료' ? 'demo_cancel' : '') + (fresh ? ' demo_fresh' : '') + '" data-id="' + esc(r.id) + '">\n' +
			'                                            <td><input type="checkbox" name="res_no_arr[]" class="item_checkbox_res"\n' +
			'                                                    value="' + esc(r.id) + '" aria-label="' + esc(r.id) + ' 선택"></td>\n' +
			'                                            <td>' + esc(r.createdAt) + (T.isNew(r) ? ' <span class="demo_new" title="24시간 안에 들어온 예약">N</span>' : '') + '</td><!-- 예약접수일 -->\n' +
			'                                            <td>\n                                                ' + T.statusCell(r) + '\n                                            </td><!-- 진행전달 -->\n' +
			'                                            <td>' + esc(r.customer.name) + '<br>' + esc(r.customer.phone) + '</td><!-- 예약자 -->\n' +
			'                                            <td>' + TourRes.paxTotal(r) + '</td><!-- 인원 -->\n' +
			'                                            <td class="t_title" style="cursor:pointer;" tabindex="0" role="button"\n' +
			'                                                onclick="to_dialog.iframe(\'good_res_edit.html?res_no=' + esc(r.id) + '\',\'' + esc(title) + '\',\'1400\',\'700\',true,true,\'yes\');">\n' +
			'                                                <strong>' + esc(r.tourTitle) + '</strong><br>' + sub + '</td><!-- 행사명 -->\n' +
			'                                            <td>' + T.ymdw(r.departDate) + '<br>&nbsp;' + depInfo + '</td><!-- 출발일/출발편 -->\n' +
			'                                            <td>' + T.ymdw(r.returnDate) + '<br>&nbsp;' + retInfo + '</td><!-- 도착일/도착편 -->\n' +
			'                                            <td class="txt_r ls-1">' + Mock.num(r.amount) + '&nbsp;</td><!-- 판매금액 -->\n' +
			'                                            <td class="txt_r ls-1">' + Mock.num(Math.max(0, TourRes.unpaid(r))) + '</td><!-- 미납요금 -->\n' +
			'                                            <td>\n                                                ' + (r.manager ? esc(r.manager) : '<span class="demo_muted">미배정</span>') + '\n                                            </td><!-- 담당자 -->\n' +
			'                                        </tr>';
	}
	function pagingHtml(page, pages) {
		var r = Mock.pageRange(page, pages, 10), h = '';
		function btn(p, img, alt) { return '<li><a href="javascript:;" data-page="' + p + '"><img src="../image/btn/' + img + '" alt="' + alt + '"></a></li>\n'; }
		h += '<ul class="list_no01">\n' + btn(1, 'btn_first.gif', '처음목록보기') + btn(r.hasPrev ? r.prev : Math.max(1, page - 1), 'btn_prev.gif', '앞목록보기');
		h += '<li class="list_no02"><ul>' + r.list.map(function (n) {
			return n === page ? '<li class="on"><span>' + n + '</span></li>' : '<li><a href="javascript:;" data-page="' + n + '"><span>' + n + '</span></a></li>';
		}).join('') + '</ul></li>\n';
		h += btn(r.hasNext ? r.next : Math.min(pages, page + 1), 'btn_next.gif', '뒤목록보기') + btn(pages, 'btn_last.gif', '마지막목록보기') + '</ul>';
		return '<ul class="c_paging_wrap">' + h + '</ul>';
	}

	var seq = 0;
	function render(opts) {
		opts = opts || {};
		var my = ++seq;
		if (!opts.quiet) $tbody.html('<tr class="demo_state_row"><td colspan="11"><span class="demo_spinner"></span> 예약 목록을 불러오는 중…</td></tr>');
		var filter = makeFilter(readFilter());
		MockApi.resolve(function () {
			var all = MockDB.all('tms.reservations');
			var rows = all.filter(filter);
			return { all: all, rows: MockApi.query(rows, { sort: SORT[view.order] || SORT['ins_dt desc'] }).items, page: MockApi.query(rows, { sort: SORT[view.order] || SORT['ins_dt desc'], page: view.page, size: view.size }) };
		}).then(function (res) {
			if (my !== seq) return;
			lastRows = res.rows;
			var valid = res.rows.filter(function (r) { return r.status !== '취소완료'; });
			var sales = valid.reduce(function (s, r) { return s + (r.amount || 0); }, 0);
			var paid = valid.reduce(function (s, r) { return s + (r.paid || 0); }, 0);
			var unpaid = valid.reduce(function (s, r) { return s + Math.max(0, TourRes.unpaid(r)); }, 0);
			$sum.html('<a href="javascript:;" class="c_red">검색 ' + res.rows.length + '개</a> ／ <a href="javascript:;"\n                                            class="c_blue">전체 ' + res.all.length + '개</a>&nbsp;&nbsp;(검색된 예약&nbsp;&nbsp;&nbsp;총 판매금액 :\n                                        ' +
				Mock.won(sales) + '&nbsp;&nbsp;&nbsp;총 결제금액 : ' + Mock.won(paid) + '&nbsp;&nbsp;&nbsp;총 미입금액 :\n                                        ' + Mock.won(unpaid) + ')');
			var ids = res.all.map(function (r) { return r.id; });
			var fresh = knownIds ? ids.filter(function (id) { return knownIds.indexOf(id) < 0; }) : [];
			if (fresh.length && opts.remote) Mock.toast('새 예약 ' + fresh.length + '건이 들어왔어요', { type: 'success' });
			knownIds = ids;
			var p = res.page;
			view.page = p.page;
			$('#checkall').prop('checked', false);
			if (!p.items.length) {
				$tbody.html('<tr class="demo_state_row"><td colspan="11">검색 조건에 맞는 예약이 없습니다. 기간이나 조건을 넓혀 보세요.</td></tr>');
				$pg.html(pagingHtml(1, 1));
				return;
			}
			$tbody.html(p.items.map(function (r) { return rowHtml(r, fresh.indexOf(r.id) >= 0); }).join('') + '\n                                    ');
			$pg.html(pagingHtml(p.page, p.pages));
		}, function (e) {
			$tbody.html('<tr class="demo_state_row"><td colspan="11">목록을 불러오지 못했습니다: ' + esc(e.message) + '</td></tr>');
		});
	}

	function syncUrl() {
		var q = new URLSearchParams(location.search);
		q.set('order_by_s', view.order); q.set('list_count_s', view.size); q.set('page', view.page);
		try { history.replaceState(null, '', 'good_res.html?' + q.toString()); } catch (e) { /* file:// 에서 막히면 무시 */ }
	}

	/* ---------- 원래 화면 함수가 부르는 진입점 ---------- */
	w.TmsResList = {
		setView: function (o) {
			if (o.order_by_s) view.order = o.order_by_s;
			if (o.list_count_s) view.size = parseInt(o.list_count_s, 10) || 20;
			view.page = 1;
			syncUrl();
			render();
		},
		render: render
	};
	$pg.on('click', 'a[data-page]', function () { view.page = Number($(this).attr('data-page')); syncUrl(); render(); });
	$tbody.on('keydown', 'td.t_title', function (e) { if (e.keyCode === 13 || e.keyCode === 32) { e.preventDefault(); this.click(); } });
	$tbody.on('click', 'td:not(.t_title)', function (e) {
		if ($(e.target).is('input')) return;
		var $cb = $(this).closest('tr').find('.item_checkbox_res');
		$cb.prop('checked', !$cb.prop('checked'));
	});

	// 엑셀저장 — 현재 검색 결과를 CSV 로 (원래 good_res_excel.html)
	w.to_excel = function () {
		if (!lastRows.length) { Mock.toast('저장할 예약이 없어요'); return; }
		if (!w.confirm('검색된 예약 ' + lastRows.length + '건을 엑셀(CSV) 파일로 저장할까요?')) return;
		var head = ['예약번호', '예약접수일', '예약상태', '입금상태', '예약경로', '결제수단', '고객명', '연락처', '인원', '상품명', '출발일', '도착일', '판매액', '입금액', '미납액', '담당자'];
		var lines = [head].concat(lastRows.map(function (r) {
			return [r.id, r.createdAt, r.status, TourRes.payState(r), r.channel, r.payMethod, r.customer.name, r.customer.phone, TourRes.paxTotal(r), r.tourTitle, r.departDate, r.returnDate, r.amount, r.paid, TourRes.unpaid(r), r.manager];
		})).map(function (cols) { return cols.map(function (c) { c = String(c == null ? '' : c); return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(','); });
		var blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
		var a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = 'tms_reservations_' + Mock.date(new Date(), 'YYYYMMDD_HHmm') + '.csv';
		document.body.appendChild(a); a.click();
		setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
	};

	// 데이터가 바뀌면(이 화면 일괄처리 · 상세 창 저장 · 다른 탭 예약) 다시 그림
	var timer = null;
	MockDB.on('tms.reservations', function (src) {
		clearTimeout(timer);
		timer = setTimeout(function () { render({ quiet: src !== 'reset', remote: src === 'remote' }); }, 80);
	});

	applyParams();
	render();
})(window, jQuery);
