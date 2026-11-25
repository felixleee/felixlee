/*
 * Monami France 데모 — 투어 상세 (tour/detail.html?id=)
 * 소개 · 코스 타임라인 · 포함/불포함 · 만나는 장소 · 유의사항 · 후기 · 함께 보면 좋은 투어
 * 오른쪽 예약 박스: 운영 요일만 고를 수 있는 달력 → 인원 → 금액 → booking.html 로 이동
 */
(function ($, D) {
	'use strict';
	var C = D.COL;
	var id = Mock.qs('id');

	D.loading($('#dtState'), '투어 정보를 불러오는 중이에요…');

	MockApi.get(C.tours, id).then(render, function () {
		$('#dmPageTitle').text('투어를 찾을 수 없어요');
		D.empty($('#dtState'), '찾는 투어가 없거나 판매가 끝났어요. 목록에서 다시 골라 주세요.',
			'<a class="dm-btn dm-btn-primary" href="list.html">투어 목록 보기</a>');
	});

	function li(arr, icon) {
		return (arr || []).map(function (x) { return '<li>' + (icon ? '<i class="' + icon + '"></i>' : '') + Mock.esc(x) + '</li>'; }).join('');
	}

	function render(t) {
		var c = D.country(t.country) || {}, st = D.reviewStat(t.id);
		$('#dtState').empty();
		$('#dtDetail').show();

		// 제목 · 위치
		document.title = t.name + ' :: 모나미프랑스 · LJY Port (실제 운영되는 페이지가 아닙니다)';
		$('#dmPageTitle').text(t.name);
		$('#dmLoc').html('<a href="../main/pure_main.html"><i class="xi-home"></i> Home</a>' +
			' <i class="xi-angle-right-min"></i> <a href="' + D.url.list({ type: t.type }) + '">' + D.TYPE[t.type] + '</a>' +
			' <i class="xi-angle-right-min"></i> <a href="' + D.url.list({ country: t.country }) + '">' + Mock.esc(c.ko) + '</a>' +
			' <i class="xi-angle-right-min"></i> <strong>상세</strong>');

		// 요약
		$('#dtImg').attr({ src: D.img(t.image), alt: t.name });
		$('#dtType').text(D.TYPE[t.type]);
		$('#dtCountry').text(c.en);
		$('#dtRegion').text(t.region);
		$('#dtName').text(t.name);
		$('#dtRate').html(st.count ? D.stars(st.avg) + ' <strong>' + st.avg.toFixed(1) + '</strong> <a href="#sec-review">후기 ' + st.count + '개</a>' : '<span class="dm-muted">아직 후기가 없어요</span>');
		$('#dtSummary').html(D.br(t.summary));
		$('#dtTime').text(t.time);
		$('#dtDays').text(t.daysText);
		$('#dtDuration').text(t.duration);
		$('#dtMeetShort').text(t.meeting.place);
		$('#dtPeople').text(t.minPeople > 1 ? t.minPeople + '인 이상 ~ 최대 ' + t.maxPeople + '명' : '1명부터 ~ 최대 ' + t.maxPeople + '명');
		$('#dtPriceA').text(D.won(t.priceAdult));
		$('#dtPriceC').text(D.won(t.priceChild));

		// 본문
		$('#dtGuide').text('담당 가이드 ' + t.guide);
		$('#dtIntro').html(D.paras(t.intro));
		$('#dtCourse').html((t.course || []).map(function (s) {
			return '<li><span class="t">' + Mock.esc(s.time) + '</span><div class="c"><strong>' + Mock.esc(s.title) + '</strong><span>' + Mock.esc(s.desc) + '</span></div></li>';
		}).join(''));
		$('#dtInc').html(li(t.include, 'xi-check'));
		$('#dtExc').html(li(t.exclude, 'xi-close'));
		$('#dtMeetPlace').text(t.meeting.place);
		$('#dtMeetTime').text('미팅 시간 ' + t.meeting.time + (t.meeting.time === '협의' ? '' : ' (투어 시작 10분 전)'));
		$('#dtMeetDetail').text(t.meeting.detail);
		$('#dtNotes').html(li(t.notes));
		$('#dtPolicy').text(D.REFUND_TEXT);

		renderReviews(t, st);
		renderRelated(t);
		initBooking(t);

		D.pushRecent(t.id);
		D.renderRecent();
		if (location.hash) { var $h = $(location.hash); if ($h.length) $('html, body').scrollTop($h.offset().top - 100); }
	}

	function renderReviews(t, st) {
		$('#dtTabRv').text('(' + st.count + ')');
		$('#dtRvSum').text(st.count ? '평점 ' + st.avg.toFixed(1) + ' · ' + st.count + '개' : '');
		$('#dtRvMore').attr('href', D.url.reviews({ tourId: t.id }));
		$('#dtRvWrite').attr('href', D.url.write({ tourId: t.id }));
		D.loading($('#dtReviews'), '후기를 불러오는 중이에요…');
		MockApi.list(C.reviews, { filter: { tourId: t.id }, sort: '-createdAt', size: 3 }).then(function (res) {
			if (!res.total) {
				$('#dtReviews').html('<p class="dm-rv-empty">아직 이 투어의 후기가 없어요. 다녀오셨다면 첫 후기를 남겨 주세요!</p>');
				return;
			}
			$('#dtReviews').html('<ul class="dm-rv-list">' + res.items.map(function (r) {
				return '<li><div class="dm-rv-head">' + D.stars(r.rating) + '<a href="' + D.url.review(r.id) + '">' + Mock.esc(r.title) + '</a>' +
					'<span class="dm-rv-meta">' + Mock.esc(r.author) + ' · ' + Mock.date(r.createdAt, 'YYYY.MM.DD') + '</span></div>' +
					'<p class="dm-rv-body">' + Mock.esc(D.cut(r.content, 120)) + '</p></li>';
			}).join('') + '</ul>');
		}, function (e) { D.fail($('#dtReviews'), e); });
	}

	function renderRelated(t) {
		var all = MockDB.all(C.tours).filter(function (x) { return x.id !== t.id; });
		var same = all.filter(function (x) { return x.country === t.country; }).sort(function (a, b) { return a.sort - b.sort; });
		var more = all.filter(function (x) { return x.country !== t.country && x.type === t.type; });
		var pick = same.concat(more).slice(0, 3);
		$('#dtRelated').html(D.tplAll('tpl-related', pick, function (x) {
			var c = D.country(x.country) || {};
			return { href: D.url.tour(x.id), image: D.img(x.image), name: x.name, typeLabel: D.TYPE[x.type], countryEn: c.en, region: x.region, time: x.time, daysText: x.daysText, price: D.won(x.priceAdult) };
		}));
	}

	/* ---------- 예약 박스 ---------- */
	function initBooking(t) {
		var pre = Mock.qs('date');
		var sel = D.canBook(t, pre) ? pre : D.firstOpenDay(t);
		var adults, children;

		$('#bbPa').text(D.won(t.priceAdult));
		$('#bbPc').text(D.won(t.priceChild) + ' · 만 12세 이하');
		$('#bbNote').text(t.minPeople > 1 ? t.minPeople + '인 이상 예약할 수 있어요 · 최대 ' + t.maxPeople + '명' : '최대 ' + t.maxPeople + '명까지 예약할 수 있어요');

		function total() { return adults.get() * t.priceAdult + children.get() * t.priceChild; }
		function update() {
			$('#bbDate').toggleClass('on', !!sel).text(sel ? D.dateKo(sel) + ' 출발' : '날짜를 선택해 주세요');
			$('#bbTotal').text(D.won(total()));
		}
		var limit = function () { Mock.toast('이 투어는 최대 ' + t.maxPeople + '명까지 예약할 수 있어요'); };
		adults = D.qty($('#bbAdults'), { min: 1, value: Math.max(1, t.minPeople), max: function () { return t.maxPeople - (children ? children.get() : 0); }, onChange: function () { if (children) children.refresh(); update(); }, onLimit: limit });
		children = D.qty($('#bbChildren'), { min: 0, value: 0, max: function () { return t.maxPeople - adults.get(); }, onChange: function () { adults.refresh(); update(); }, onLimit: limit });

		D.datepicker($('#bbCal'), t, function (d) { sel = d; update(); }, { defaultDate: sel || null });
		update();

		$('#bbGo').on('click', function () {
			var n = adults.get() + children.get();
			if (!D.canBook(t, sel)) { Mock.toast('투어 날짜를 선택해 주세요', { type: 'error' }); return; }
			if (n < t.minPeople) { Mock.toast(t.minPeople + '인 이상 예약할 수 있어요', { type: 'error' }); return; }
			location.href = D.url.book(t.id, { date: sel, adults: adults.get(), children: children.get() });
		});
	}
})(jQuery, window.Demo);
