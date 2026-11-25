/*!
 * TourOffice 메인 — 오늘의 추천상품(탭 6개)·이달의 여행지·이달의 숙소를 가상 데이터에서 그림
 * 원래 하드코딩돼 있던 카드 마크업을 그대로 템플릿으로 씀 (결과 화면이 원래와 같게)
 */
(function ($) {
	'use strict';
	var D = ToDemo, esc = Mock.esc;

	/* 오늘의 추천상품 카드 (원래 마크업) */
	function recomItem(t, last) {
		if (!t) {
			return '\n                            <li class="' + (last ? 'last' : '') + '">\n' +
				'                                <a href="javascript:;">\n' +
				'                                    <img src="../FileData/good_thum/nodata_2.gif" alt="">\n\n' +
				'                                    <div class="exp">\n' +
				'                                        <p class="tit"></p>\n' +
				'                                        <p class="txt"></p>\n' +
				'                                        <p class="price2"></p>\n' +
				'                                    </div>\n' +
				'                                </a>\n' +
				'                            </li>';
		}
		return '\n                            <li class="' + (last ? 'last' : '') + '">\n' +
			'                                <a href="' + esc(D.detailUrl(t)) + '">\n' +
			'                                    <img src="' + esc(D.img(t)) + '"\n' +
			'                                        alt="' + esc(t.title) + '">\n\n' +
			'                                    <div class="exp">\n' +
			'                                        <p class="tit">' + esc(D.cut(t.title, 30)) + '</p>\n' +
			'                                        <p class="txt">' + esc(D.cut(t.summary, 74)) + '</p>\n' +
			'                                        <p class="price2">' + D.priceHtml(t) + '</p>\n' +
			'                                    </div>\n' +
			'                                </a>\n' +
			'                            </li>';
	}

	/* 이달의 여행지 카드 (원래 마크업) */
	function monthlyTour(t) {
		return '\n                    <li>\n' +
			'                        <div class="item">\n' +
			'                            <a href="' + esc(D.detailUrl(t)) + '"><img\n' +
			'                                    class="transition" src="' + esc(D.img(t)) + '"\n' +
			'                                    title="' + esc(t.title) + '">\n' +
			'                                <div class="context">\n' +
			'                                    <p class="tit" title="">' + esc(t.title) + '</p>\n' +
			'                                    <p class="price">' + D.priceHtml(t, "'") + '</p>\n' +
			'                                </div>\n' +
			'                            </a>\n' +
			'                        </div>\n' +
			'                    </li>';
	}

	/* 이달의 숙소 카드 (원래 마크업) */
	function monthlyHotel(t) {
		return '\n                    <li>\n' +
			'                        <div class="item">\n' +
			'                            <a href="' + esc(D.detailUrl(t)) + '">\n' +
			'                                <div class="hotel_img_wrap">\n' +
			'                                    <img class="transition" src="' + esc(D.img(t)) + '"\n' +
			'                                        title="' + esc(t.title) + '">\n' +
			'                                </div>\n\n' +
			'                                <div class="context">\n' +
			'                                    <p class="tit" title="">' + esc(t.title) + '</p>\n' +
			'                                    <span class="h_info">\n' +
			'                                        <span class="h_star"><img src="../image/hotel_level/' + esc(t.star) + '" alt=""></span>\n' +
			'                                    </span>\n' +
			'                                    <p class="price">' + D.priceHtml(t) + '</p>\n' +
			'                                </div>\n' +
			'                            </a>\n' +
			'                        </div>\n' +
			'                    </li>';
	}

	function fail($el, tag) {
		return function () { $el.html(D.stateHtml('empty', '상품을 불러오지 못했어요. 새로고침해 주세요.', tag)); };
	}

	$(function () {
		// 오늘의 추천상품 — 탭마다 4칸 (모자라면 원래처럼 nodata 칸)
		$('#ajax_recomm > ul.m_recom_info').each(function () {
			var $ul = $(this), tab = Number($ul.attr('data-tab'));
			$ul.html(D.stateHtml('loading', '추천상품을 불러오는 중…', 'li'));
			MockApi.list('touroffice.tours', {
				filter: function (t) { return t.recommend && t.recommend.tab === tab; },
				sort: 'recommend.order', size: 4
			}).then(function (res) {
				var html = '';
				for (var i = 0; i < 4; i++) html += recomItem(res.items[i], i === 3);
				$ul.html(html + '\n                        ');
			}, fail($ul, 'li'));
		});

		// 이달의 여행지 / 이달의 숙소
		[['#demo_monthly_tour', 'monthly.tour', monthlyTour], ['#demo_monthly_hotel', 'monthly.hotel', monthlyHotel]].forEach(function (x) {
			var $ul = $(x[0]), key = x[1].split('.')[1];
			$ul.html(D.stateHtml('loading', '불러오는 중…', 'li'));
			MockApi.list('touroffice.tours', {
				filter: function (t) { return t.monthly && t.monthly[key]; },
				sort: x[1], size: 3
			}).then(function (res) {
				$ul.html(res.items.length ? res.items.map(x[2]).join('') + '\n                ' : D.stateHtml('empty', '준비 중인 상품이 없어요', 'li'));
			}, fail($ul, 'li'));
		});
	});
})(jQuery);
