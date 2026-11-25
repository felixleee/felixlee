/*
 * 로뎀투어 데모 — 상품 상세 (good/detail.html?id=)
 *  - 요약 · 항공 · 출발일 표(출발확정/예약가능/마감 · 잔여석 · 가격) · 일차별 일정 · 포함/불포함 · 인솔자 · 여행후기
 *  - 출발일 표의 줄을 고르면 일정표 날짜와 [예약 신청] 버튼이 그 출발일로 바뀐다
 */
(function ($) {
	'use strict';

	var id = Mock.qs('id');
	var $box = $('#rdDetail');
	var good = null, selDep = null;

	function addDays(date, n) { return Mock.date(Mock.addDays(date, n), 'YYYY-MM-DD'); }
	function md(d) { return Mock.date(d, 'MM.DD (ddd)'); }

	function depRows(g) {
		var list = RD.upcoming(g);
		if (!list.length) return '<tr><td colspan="7">' + RD.empty('예정된 출발일이 없어요', '원하시는 날짜로 <a href="' + Mock.esc(RD.inquiryUrl({ goodId: g.id })) + '">단체 맞춤 견적</a>을 받아 보세요.') + '</td></tr>';
		return list.map(function (d) {
			var open = RD.isOpen(d), status = open ? d.status : '마감';
			return '<tr data-dep="' + d.date + '" class="' + (open ? '' : 'is-close') + (selDep === d.date ? ' is-sel' : '') + '">' +
				'<td><label><input type="radio" name="dep" value="' + d.date + '"' + (open ? '' : ' disabled') + (selDep === d.date ? ' checked' : '') + ' /> ' + Mock.date(d.date, 'YYYY.MM.DD (ddd)') + '</label></td>' +
				'<td>' + Mock.date(addDays(d.date, g.days - 1), 'MM.DD (ddd)') + '</td>' +
				'<td>' + Mock.esc(g.airline) + '</td>' +
				'<td>' + RD.badge(status) + '</td>' +
				'<td>' + (open ? d.seats + '석' : '-') + '</td>' +
				'<td class="price">' + Mock.won(d.price) + '</td>' +
				'<td>' + (open ? '<a class="rd-btn sm" href="' + Mock.esc(RD.reserveUrl(g.id, d.date)) + '">예약 신청</a>' : '<span class="rd-btn sm is-disabled" aria-disabled="true">마감</span>') + '</td>' +
			'</tr>';
		}).join('');
	}

	function planRows(g) {
		return g.itinerary.map(function (d, i) {
			var date = selDep ? md(addDays(selDep, i)) : '';
			return '<tr>' +
				'<td class="day"><b>' + (i + 1) + '일차</b>' + (date ? '<span>' + date + '</span>' : '') + '</td>' +
				'<td><h4>' + Mock.esc(d.title) + '</h4>' +
					'<ul class="places">' + d.places.map(function (p) { return '<li><i class="fa fa-map-marker"></i>' + Mock.esc(p) + '</li>'; }).join('') + '</ul>' +
					'<p class="desc">' + Mock.esc(d.desc) + '</p></td>' +
				'<td class="stay">' +
					'<p class="hotel"><i class="fa fa-building-o"></i>' + Mock.esc(d.hotel) + '</p>' +
					'<dl class="meals"><dt><i class="fa fa-cutlery"></i>식사</dt>' +
						'<dd><b>조</b>' + Mock.esc(d.meals[0]) + '</dd><dd><b>중</b>' + Mock.esc(d.meals[1]) + '</dd><dd><b>석</b>' + Mock.esc(d.meals[2]) + '</dd></dl>' +
				'</td>' +
			'</tr>';
		}).join('');
	}

	function reviewsHtml(g) {
		var list = MockDB.where('rothem.posts', function (p) { return p.bd === 'REVIEW' && String(p.goodId) === String(g.id); })
			.sort(function (a, b) { return a.createdAt < b.createdAt ? 1 : -1; });
		var html = list.length ? '<ul class="rd-review-list">' + list.slice(0, 5).map(function (p) {
			return '<li>' + RD.stars(p.rating) + '<a href="' + Mock.esc(RD.viewUrl('REVIEW', p.id)) + '">' + Mock.esc(p.title) + '</a>' +
				'<span class="who">' + Mock.esc(RD.mask(p.name)) + '</span><span class="date">' + Mock.date(p.createdAt, 'YYYY.MM.DD') + '</span></li>';
		}).join('') + '</ul>' : RD.empty('아직 이 상품의 후기가 없어요', '다녀오셨다면 첫 후기를 남겨 주세요.');
		html += '<p class="rd-review-more"><a class="rd-btn sm line" href="' + Mock.esc(RD.boardUrl('REVIEW')) + '">후기 전체보기</a> ' +
			'<a class="rd-btn sm" href="' + Mock.esc(Mock.url('../cmm/write.html', { BD_CD: 'REVIEW', goodId: g.id })) + '">후기 쓰기</a></p>';
		return { html: html, count: list.length };
	}

	function render(g) {
		var th = RD.theme(g.theme), cs = RD.course(g.course), logo = RD.airLogo(g.airline);
		var open = RD.upcoming(g).filter(RD.isOpen);
		var sel = selDep ? RD.upcoming(g).filter(function (d) { return d.date === selDep; })[0] : null;
		var rv = reviewsHtml(g);
		document.title = g.title + ' | 로뎀투어 - LJY Port :: 실제 운영되는 페이지가 아닙니다';
		$('#rdLoc').html('<a href="../main/pure_main.html"><img src="../image/common/ico_location_home.png" alt="" />홈</a>' +
			'<span class="sep">&gt;</span><a href="' + Mock.esc(RD.listUrl({ theme: g.theme })) + '">' + Mock.esc(th ? th.name : '여행상품') + '</a>' +
			(cs ? '<span class="sep">&gt;</span><a href="' + Mock.esc(RD.listUrl({ theme: g.theme, course: g.course })) + '">' + Mock.esc(cs.name) + '</a>' : '') +
			'<span class="sep">&gt;</span><strong>상품 상세</strong>');
		$('body').attr('data-gnb', th ? th.name : '');
		$('#gnb_re .menu > li > a').removeClass('on').filter(function () { return th && $(this).text() === th.name; }).addClass('on');

		$box.html(
			'<div class="rd-dt-top">' +
				'<div class="rd-dt-img"><img src="' + Mock.esc(g.thumb) + '" alt="' + Mock.esc(g.title) + '" /></div>' +
				'<div class="rd-dt-sum">' +
					'<p><span class="rd-chip">' + Mock.esc(th ? th.name : '') + '</span><span class="rd-chip line">' + Mock.esc(cs ? cs.name : '') + '</span> ' +
					(g.labels || []).map(function (l) { return '<span class="rd-label">' + Mock.esc(l) + '</span>'; }).join('') + '</p>' +
					'<h2>' + Mock.esc(g.title) + '</h2>' +
					'<dl>' +
						'<dt>상품코드</dt><dd>' + Mock.esc(g.code) + '</dd>' +
						'<dt>여행기간</dt><dd>' + RD.period(g) + '</dd>' +
						'<dt>항공</dt><dd>' + (logo ? '<img src="' + logo + '" alt="" />' : '') + Mock.esc(g.airline) + '</dd>' +
						'<dt>출발 · 국가</dt><dd>' + Mock.esc(g.from) + ' 출발 · ' + Mock.esc(RD.countriesText(g)) + '</dd>' +
						'<dt>인솔자</dt><dd>' + Mock.esc(g.guide.name) + ' 동행</dd>' +
						'<dt>출발일</dt><dd id="rdSelDep">' + (sel ? Mock.date(sel.date, 'YYYY.MM.DD (ddd)') + ' ' + RD.badge(sel.status) + ' 잔여 ' + sel.seats + '석' : '아래 출발일 표에서 골라 주세요') + '</dd>' +
					'</dl>' +
					'<div class="rd-dt-price"><span class="label">성인 1인 · ' + (sel ? '선택 출발일' : '최저가') + '</span><strong class="price">' + Mock.num(sel ? sel.price : RD.minPrice(g)) + '<span>원' + (sel ? '' : '~') + '</span></strong></div>' +
					'<div class="rd-dt-btns">' +
						(open.length ? '<a class="rd-btn lg" id="rdReserveBtn" href="' + Mock.esc(RD.reserveUrl(g.id, selDep || open[0].date)) + '"><i class="fa fa-check-square-o"></i>예약 신청</a>'
							: '<span class="rd-btn lg is-disabled">예약 가능한 출발일 없음</span>') +
						'<a class="rd-btn lg orange" href="' + Mock.esc(RD.inquiryUrl({ goodId: g.id })) + '"><i class="fa fa-users"></i>단체 상담</a>' +
					'</div>' +
				'</div>' +
			'</div>' +
			'<div class="rd-dt-points"><h3>여행 포인트</h3><ul>' + (g.points || []).map(function (p) { return '<li>' + Mock.esc(p) + '</li>'; }).join('') + '</ul></div>' +
			'<nav class="rd-dt-tab" aria-label="상세 메뉴">' +
				'<a href="#dt-dep" class="on">출발일 선택</a><a href="#dt-plan">여행 일정</a><a href="#dt-inc">포함/불포함</a><a href="#dt-guide">인솔자</a><a href="#dt-review">여행후기 (' + rv.count + ')</a>' +
			'</nav>' +
			'<section class="rd-dt-sec" id="dt-dep"><h3>출발일 선택<small>줄을 누르면 일정표 날짜가 바뀌어요 · 아동(만 2~11세) 성인가의 90%, 유아 20%</small></h3>' +
				'<table class="rd-table"><caption>출발일별 예약 상태</caption><thead><tr><th scope="col">출발일</th><th scope="col">귀국일</th><th scope="col">항공</th><th scope="col">상태</th><th scope="col">잔여석</th><th scope="col">상품가(성인)</th><th scope="col">예약</th></tr></thead>' +
				'<tbody id="rdDepRows">' + depRows(g) + '</tbody></table></section>' +
			'<section class="rd-dt-sec" id="dt-plan"><h3>여행 일정<small>' + RD.period(g) + ' · 현지 사정에 따라 순서가 바뀔 수 있어요</small></h3>' +
				'<table class="rd-plan"><caption>일차별 일정</caption><tbody id="rdPlanRows">' + planRows(g) + '</tbody></table></section>' +
			'<section class="rd-dt-sec" id="dt-inc"><h3>포함 / 불포함 사항</h3><div class="rd-inc">' +
				'<div class="yes"><h4>포함 사항</h4><ul>' + g.includes.map(function (t) { return '<li>' + Mock.esc(t) + '</li>'; }).join('') + '</ul></div>' +
				'<div class="no"><h4>불포함 사항</h4><ul>' + g.excludes.map(function (t) { return '<li>' + Mock.esc(t) + '</li>'; }).join('') + '</ul></div>' +
			'</div></section>' +
			'<section class="rd-dt-sec" id="dt-guide"><h3>함께하는 인솔자</h3><div class="rd-guide">' +
				'<div class="avatar" aria-hidden="true"><i class="fa fa-user"></i></div>' +
				'<div><h4>' + Mock.esc(g.guide.name) + '<small>' + Mock.esc(g.guide.role) + '</small></h4>' +
				'<ul>' + g.guide.career.map(function (c) { return '<li>' + Mock.esc(c) + '</li>'; }).join('') + '</ul>' +
				'<p>' + Mock.esc(g.guide.intro) + '</p></div>' +
			'</div></section>' +
			'<section class="rd-dt-sec" id="dt-review"><h3>여행후기<small>이 상품을 다녀온 분들의 후기</small></h3>' + rv.html + '</section>'
		);
	}

	function selectDep(date) {
		selDep = date;
		var y = $(window).scrollTop();
		render(good);
		$(window).scrollTop(y);
	}

	$box.on('click', 'tr[data-dep]', function (e) {
		if ($(e.target).closest('a').length) return;
		var d = $(this).attr('data-dep');
		if ($(this).hasClass('is-close')) { Mock.toast('마감된 출발일이에요. 다른 날짜를 골라 주세요.'); return; }
		selectDep(d);
	});
	$box.on('click', '.rd-dt-tab a', function () {
		$('.rd-dt-tab a').removeClass('on');
		$(this).addClass('on');
	});

	if (!id) {
		$box.html(RD.empty('상품 번호가 없어요', '<a href="list.html">상품 목록</a>에서 상품을 골라 주세요.'));
		return;
	}
	$box.html(RD.loading('상품 정보를 불러오는 중이에요…'));
	MockApi.get('rothem.goods', id).then(function (g) {
		good = g;
		var open = RD.upcoming(g).filter(RD.isOpen);
		var want = Mock.qs('dep');
		selDep = want && open.some(function (d) { return d.date === want; }) ? want : (open[0] ? open[0].date : null);
		RD.pushRecent(g.id);
		render(g);
		RD.renderRecent();
	}, function () {
		$box.html(RD.empty('상품을 찾을 수 없어요', '판매가 끝났거나 주소가 잘못되었어요. <a href="list.html">상품 목록</a>으로 이동해 보세요.'));
	});
})(jQuery);
