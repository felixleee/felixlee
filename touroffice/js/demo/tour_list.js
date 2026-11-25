/*!
 * TourOffice 상품 목록 — good/tour_list.html (여행) · hotel/hotel_list.html (숙소)
 *  주소 조건: b_uid_s(대분류) m_uid_s(중분류) areaa_cd_s(지역) areab_cd_s(도시) departDate month price_s g_title_s sort page
 *  숙소: checkIn checkOut adultNum childNum roomNum 은 상세 화면으로 그대로 넘김
 */
(function ($) {
	'use strict';
	var D = ToDemo, esc = Mock.esc;
	var $root = $('#demo_list');
	if (!$root.length) return;

	var KIND = $root.attr('data-kind') === 'hotel' ? 'hotel' : 'tour';
	var SIZE = 10;
	var KEYS = ['b_uid_s', 'm_uid_s', 'areaa_cd_s', 'areab_cd_s', 'location_input', 'departDate', 'month', 'price_s', 'g_title_s', 'sort', 'page', 'checkIn', 'checkOut', 'adultNum', 'childNum', 'roomNum'];
	var P = {};
	KEYS.forEach(function (k) { P[k] = Mock.qs(k) || ''; });
	if (KIND === 'hotel' && !P.b_uid_s) P.b_uid_s = '69';
	P.page = parseInt(P.page, 10) || 1;
	P.sort = P.sort || 'rec';
	var today = Mock.rel(0);

	var $list = $('#demo_plist'), $pg = $('#demo_paging'), $form = $('#demo_filter');

	/* ---------- 화면 틀 ---------- */
	function setupHead() {
		var c = P.b_uid_s ? TourOfficeData.findCate(P.b_uid_s) : null;
		var m = c && P.m_uid_s ? TourOfficeData.findCate(P.m_uid_s) : null;
		var title = c ? c.b.name : (KIND === 'hotel' ? '호텔/리조트' : '여행상품');
		var loc = '<a href="../main/pure_main.html"><i class="xi-home"></i> 홈</a><span>&gt;</span>';
		if (c && m && m.m) loc += '<a href="' + D.listUrl({ b_uid_s: c.b.uid }) + '">' + esc(c.b.name) + '</a><span>&gt;</span><strong>' + esc(m.m.name) + '</strong>';
		else loc += '<strong>' + esc(title) + '</strong>';
		$('#demo_loc').html(loc);
		var sub = m && m.m ? m.m.name : '';
		if (P.g_title_s) sub = '"' + P.g_title_s + '" 검색 결과';
		else if (P.location_input || P.areab_cd_s) sub = (P.location_input || P.areab_cd_s) + (P.departDate ? ' · ' + Mock.date(P.departDate, 'MM.DD') + ' 이후 출발' : '');
		else if (P.departDate) sub = Mock.date(P.departDate, 'YYYY.MM.DD') + ' 이후 출발';
		$('#demo_title').html(esc(title) + (sub ? '<small>' + esc(sub) + '</small>' : ''));
		document.title = title + ' :: ' + document.title;

		// 하위 분류 탭 (대분류가 없으면 대분류 탭)
		var tabs = [];
		if (c) {
			tabs.push({ name: '전체', on: !P.m_uid_s, url: D.listUrl({ b_uid_s: c.b.uid }) });
			c.b.children.forEach(function (x) { tabs.push({ name: x.name, on: String(x.uid) === P.m_uid_s, url: D.listUrl({ b_uid_s: c.b.uid, m_uid_s: x.uid }) }); });
		} else {
			tabs.push({ name: '전체', on: true, url: 'tour_list.html' });
			TourOfficeData.cate.forEach(function (x) { if (x.kind === KIND) tabs.push({ name: x.name, on: false, url: D.listUrl({ b_uid_s: x.uid }) }); });
		}
		$('#demo_subtabs').html(tabs.map(function (t) {
			return '<li class="' + (t.on ? 'on' : '') + '"><a href="' + esc(t.url) + '">' + esc(t.name) + '</a></li>';
		}).join(''));

		// 지역(도시) 선택지 — 이 분류에 있는 상품의 지역만
		var groups = {}, order = [];
		MockDB.all('touroffice.tours').forEach(function (t) {
			if (t.kind !== KIND) return;
			if (P.b_uid_s && String(t.b_uid) !== P.b_uid_s) return;
			if (!groups[t.region]) { groups[t.region] = []; order.push(t.region); }
			if (groups[t.region].indexOf(t.city) < 0) groups[t.region].push(t.city);
		});
		var opt = '<option value="">전체 지역</option>';
		order.forEach(function (r) {
			opt += '<optgroup label="' + esc(r) + '">' + groups[r].map(function (cty) { return '<option value="' + esc(cty) + '">' + esc(cty) + '</option>'; }).join('') + '</optgroup>';
		});
		$('#f_area').html(opt);
		if (P.areab_cd_s && !$('#f_area option[value="' + P.areab_cd_s.replace(/"/g, '') + '"]').length) {
			$('#f_area').append('<option value="' + esc(P.areab_cd_s) + '">' + esc(P.areab_cd_s) + '</option>');
		}

		// 출발월 — 이번 달부터 6개월
		var $m = $('#f_month');
		if ($m.length) {
			var d = new Date(); d.setDate(1);
			var mopt = '<option value="">전체</option>';
			for (var i = 0; i < 6; i++) {
				var v = Mock.date(d, 'YYYY-MM');
				mopt += '<option value="' + v + '">' + Mock.date(d, 'YYYY년 MM월').replace(/년 0/, '년 ') + '</option>';
				d.setMonth(d.getMonth() + 1);
			}
			$m.html(mopt);
		}
		$form.find('[name=b_uid_s]').val(P.b_uid_s);
		$form.find('[name=m_uid_s]').val(P.m_uid_s);
		$form.find('[name]').each(function () {
			if (this.type === 'hidden' && (this.name === 'b_uid_s' || this.name === 'm_uid_s')) return;
			if (P[this.name] != null && P[this.name] !== '') $(this).val(P[this.name]);
		});
		if (P.departDate && $m.length && !P.month) $m.val(P.departDate.slice(0, 7));
		$('#demo_sort').val(P.sort);
	}

	/* ---------- 조건 ---------- */
	function upcoming(t) {
		return (t.deps || []).filter(function (d) { return d.date > today; });
	}
	function matches(t) {
		if (t.kind !== KIND) return false;
		if (P.b_uid_s && String(t.b_uid) !== P.b_uid_s) return false;
		if (P.m_uid_s && String(t.m_uid) !== P.m_uid_s) return false;
		if (P.areab_cd_s) { if (t.city !== P.areab_cd_s && t.country !== P.areab_cd_s) return false; }
		else if (P.areaa_cd_s && t.region !== P.areaa_cd_s) return false;
		if (KIND === 'tour') {
			var deps = upcoming(t);
			if (P.month) deps = deps.filter(function (d) { return d.date.slice(0, 7) === P.month; });
			if (P.departDate) {
				var until = Mock.date(Mock.addDays(P.departDate, 30));
				deps = deps.filter(function (d) { return d.date >= P.departDate && d.date <= until; });
			}
			if ((P.month || P.departDate) && !deps.length) return false;
		}
		if (P.price_s) {
			if (P.price_s === 'ask') { if (t.price != null) return false; }
			else {
				var r = P.price_s.split('-'), lo = Number(r[0]) || 0, hi = r[1] ? Number(r[1]) : Infinity;
				var price = t.kind === 'hotel' ? minRoom(t) : t.price;
				if (price == null || price < lo || price >= hi) return false;
			}
		}
		if (P.g_title_s) {
			var kw = P.g_title_s.toLowerCase();
			var hay = [t.title, t.summary, t.city, t.country, t.region, t.cate1, t.cate2, t.evTitle].join(' ').toLowerCase();
			if (hay.indexOf(kw) < 0) return false;
		}
		return true;
	}
	function minRoom(t) { return (t.rooms || []).reduce(function (m, r) { return m == null || r.price < m ? r.price : m; }, null); }
	function sortSpec() {
		switch (P.sort) {
			case 'price': return ['_price', 'id'];
			case '-price': return ['-_price', 'id'];
			case 'dep': return ['_dep', 'id'];
			case 'title': return ['title'];
			case 'star': return ['-star', 'id'];
			default: return ['_rec', 'id'];
		}
	}

	/* ---------- 그리기 ---------- */
	function itemHtml(t) {
		var url = D.detailUrl(t);
		if (KIND === 'hotel') {
			url = Mock.url(url, { checkIn: P.checkIn, checkOut: P.checkOut, adultNum: P.adultNum, childNum: P.childNum, roomNum: P.roomNum });
			var low = minRoom(t);
			return '<li class="demo_pitem">' +
				'<a href="' + esc(url) + '" class="demo_pthumb"><img src="' + esc(D.img(t)) + '" alt="' + esc(t.title) + '"></a>' +
				'<div class="demo_pinfo">' +
				'<p class="demo_pcate">' + esc([t.cate2, t.country, t.city].join(' · ')) + '</p>' +
				'<h4><a href="' + esc(url) + '">' + esc(t.title) + '</a></h4>' +
				'<p class="demo_psum">' + esc(t.summary.trim()) + '</p>' +
				'<ul class="demo_ptags">' + t.facilities.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' +
				'<p class="demo_pdep"><span class="h_star"><img src="../image/hotel_level/' + esc(t.star) + '" alt="등급"></span> &nbsp;<i class="xi-maker"></i>' + esc(t.address) + '</p>' +
				'</div>' +
				'<div class="demo_pprice">' +
				(low == null ? '<span class="txt_price">요금문의</span>' : '<strong>' + Mock.num(low) + '<span>원~ / 1박</span></strong>') +
				'<a href="' + esc(url) + '" class="demo_btn demo_btn_line demo_btn_sm">객실 보기</a>' +
				'</div></li>';
		}
		var next = D.nextDep(t), info = next ? TourRes.seatInfo(t, next) : null;
		var confirmed = upcoming(t).some(function (d) { return TourRes.seatInfo(t, d).state === '출발확정'; });
		var tags = [D.period(t), t.trans + (t.trans === '항공' && t.flight ? ' · ' + t.flight.airline : '')].concat(t.tags || []);
		return '<li class="demo_pitem">' +
			'<a href="' + esc(url) + '" class="demo_pthumb"><img src="' + esc(D.img(t)) + '" alt="' + esc(t.title) + '">' + (confirmed ? '<span class="demo_badge is-confirm">출발확정</span>' : '') + '</a>' +
			'<div class="demo_pinfo">' +
			'<p class="demo_pcate">' + esc([t.cate1, t.cate2, t.country !== '대한민국' ? t.country : t.city].filter(Boolean).join(' · ')) + '</p>' +
			'<h4><a href="' + esc(url) + '">' + esc(t.title) + '</a></h4>' +
			'<p class="demo_psum">' + esc(t.summary) + '</p>' +
			'<ul class="demo_ptags">' + tags.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
			'<p class="demo_pdep"><i class="xi-calendar-check"></i>' + (next ? '가장 빠른 출발 ' + esc(Mock.date(next.date, 'MM.DD (ddd)')) + ' · ' + (info.state === '마감' ? '마감' : '잔여 ' + info.left + '석') : '출발일 상담') + '</p>' +
			'</div>' +
			'<div class="demo_pprice">' +
			(t.price == null ? '<span class="txt_price">요금문의</span>' : '<strong>' + Mock.num(t.price) + '<span>원~</span></strong>') +
			'<a href="' + esc(url) + '" class="demo_btn demo_btn_line demo_btn_sm">출발일 보기</a>' +
			'</div></li>';
	}

	var seq = 0;
	function render(scroll) {
		var my = ++seq;
		$list.html(D.stateHtml('loading', '상품을 불러오는 중…', 'li'));
		$pg.empty();
		MockApi.resolve(function () {
			var rows = MockDB.all('touroffice.tours').filter(matches).map(function (t) {
				var n = KIND === 'tour' ? D.nextDep(t) : null;
				t._dep = n ? n.date : null;
				t._price = KIND === 'hotel' ? minRoom(t) : t.price;
				t._rec = t.recommend ? t.recommend.order : (t.monthly ? 5 : 9);
				return t;
			});
			return MockApi.query(rows, { sort: sortSpec(), page: P.page, size: SIZE });
		}).then(function (res) {
			if (my !== seq) return;
			$('#demo_total').text(res.total);
			if (!res.items.length) {
				$list.html('<li class="demo_state demo_state_empty"><i class="xi-search"></i><span>조건에 맞는 상품이 없어요.<br><a href="javascript:;" class="demo_red" id="demo_reset_filter">검색 조건 초기화</a></span></li>');
				return;
			}
			$list.html(res.items.map(itemHtml).join(''));
			$pg.html(D.pagerHtml(res.page, res.pages));
			P.page = res.page;
			syncUrl();
			if (scroll) $('html, body').animate({ scrollTop: $root.offset().top - 80 }, 200);
		}, function (e) {
			$list.html(D.stateHtml('empty', '목록을 불러오지 못했어요: ' + e.message, 'li'));
		});
	}

	function syncUrl() {
		var q = {};
		KEYS.forEach(function (k) { if (P[k] !== '' && P[k] != null && !(k === 'page' && P[k] === 1) && !(k === 'sort' && P[k] === 'rec')) q[k] = P[k]; });
		try { history.replaceState(null, '', Mock.url(location.pathname.split('/').pop(), q)); } catch (e) { /* file:// 에서 막히면 무시 */ }
	}

	/* ---------- 이벤트 ---------- */
	$form.on('submit', function (e) {
		e.preventDefault();
		$form.find('[name]').each(function () { if (KEYS.indexOf(this.name) >= 0) P[this.name] = $.trim($(this).val() || ''); });
		P.departDate = '';
		P.areaa_cd_s = '';
		P.location_input = '';
		P.page = 1;
		setupHeadTitleOnly();
		render(false);
	});
	$form.on('change', 'select', function () { $form.trigger('submit'); });
	$('#demo_sort').on('change', function () { P.sort = this.value; P.page = 1; render(false); });
	$pg.on('click', 'a[data-page]', function () { P.page = Number($(this).attr('data-page')); render(true); });
	$list.on('click', '#demo_reset_filter', function () {
		['areaa_cd_s', 'areab_cd_s', 'location_input', 'departDate', 'month', 'price_s', 'g_title_s'].forEach(function (k) { P[k] = ''; });
		P.page = 1;
		$form[0].reset();
		$form.find('[name=b_uid_s]').val(P.b_uid_s);
		$form.find('[name=m_uid_s]').val(P.m_uid_s);
		setupHeadTitleOnly();
		render(false);
	});
	function setupHeadTitleOnly() {
		var c = P.b_uid_s ? TourOfficeData.findCate(P.b_uid_s) : null;
		var m = c && P.m_uid_s ? TourOfficeData.findCate(P.m_uid_s) : null;
		var title = c ? c.b.name : (KIND === 'hotel' ? '호텔/리조트' : '여행상품');
		var sub = P.g_title_s ? '"' + P.g_title_s + '" 검색 결과' : (m && m.m ? m.m.name : '');
		$('#demo_title').html(esc(title) + (sub ? '<small>' + esc(sub) + '</small>' : ''));
	}

	setupHead();
	render(false);
	// 다른 탭에서 예약이 생기면 잔여석이 바뀌므로 다시 그림
	MockDB.on('tms.reservations', function (src) { if (src !== 'local') render(false); });
})(jQuery);
