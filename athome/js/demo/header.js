/*
 * AthomeTrip 데모 — 공통 헤더 동작 (모든 화면이 같은 헤더 마크업을 쓴다)
 *
 * 원래 pure_main.html 헤더 안에 있던 인라인 스크립트(검색 탭·인원/객실·Lightpick·언어·사이드메뉴 등)를
 * 그대로 옮기고, 비어 있던 부분을 채웠다.
 *  - 헤더 검색창 클릭 → 통합검색 레이어(호텔/여행 탭) 열기  (원래 주석 처리돼 있던 동작)
 *  - 지역 레이어: 권역(미동부·미서부·하와이·괌·사이판) → 도시 선택  (athome.cities 에서 그림)
 *  - 검색 → good/list.html 로 조건(kind·city·region·q·cate·date·checkin·checkout·adult·child·room) 전달
 *  - 모바일 돋보기 검색(#top_sfrm) → 목록 키워드 검색
 * 의존: jQuery, mock-api.js, data/cities.js, js/demo/common.js, (있으면) moment + lightpick
 */

/* 인원·객실 +/- — 마크업의 onclick="person_set(...)" 에서 부르므로 전역 함수로 둔다 (원래 코드 + 최소/최대 보정) */
function person_set(type, sign, form) {
	var max, min;
	if (type == "child") { max = 3; min = 0; }
	else { max = 9; min = 1; }
	var $f = $("#" + form);
	var num = Number($f.find("input[name=" + type + "Num]").val()) || 0;
	num = sign == 'plus' ? num + 1 : num - 1;
	if (num > max || num < min) return;
	$f.find("." + type + " .minus").css('color', num == min ? '#ffd5d1' : '#ff6f61');
	$f.find("." + type + " .plus").css('color', num == max ? '#ffd5d1' : '#ff6f61');

	$f.find("input[name=" + type + "Num]").val(num);
	$f.find("." + type + "Num").text(num);
	if (type == "room") {
		$f.find(".roomNumCheck").val(num + " 객실");
	} else {
		var adultNum = $f.find("input[name=adultNum]").val();
		var childNum = $f.find("input[name=childNum]").val();
		$f.find(".personNumCheck").val("성인 " + adultNum + "명 / " + "소아 " + childNum + "명");
	}
}

(function ($) {
	'use strict';

	var hotelPicker = null, tourPicker = null;

	/* ---------- 지역 레이어 ---------- */
	function buildLocationLayers() {
		var regions = window.ATHOME_REGIONS || [];
		var cities = ATH.cities();
		$('.location_wrap.for_top').each(function () {
			var $wrap = $(this);
			var cate = '', area = '';
			regions.forEach(function (r, i) {
				cate += '<li class="' + (i === 0 ? 'on' : '') + '" data-region="' + r.id + '"><i class="xi-maker"></i>' + Mock.esc(r.name) + '</li>';
				area += '<div class="city_wrap menu' + i + '"' + (i === 0 ? '' : ' style="display:none;"') + '><ul>' +
					'<li class="all"><a href="javascript:;" data-region="' + r.id + '" data-name="' + Mock.esc(r.name) + ' 전체">' + Mock.esc(r.name) + ' 전체</a></li>' +
					cities.filter(function (c) { return c.region === r.id; }).map(function (c) {
						return '<li><a href="javascript:;" data-city="' + c.id + '" data-name="' + Mock.esc(c.name) + '">' + Mock.esc(c.name) + '</a></li>';
					}).join('') + '</ul></div>';
			});
			$wrap.find('.mainCate').html(cate);
			$wrap.find('.scrolling_area').html(area);
		});
	}

	function setLocation($areaLi, city, region, name) {
		$areaLi.find('input[name=city]').val(city || '');
		$areaLi.find('input[name=region]').val(region || '');
		$areaLi.find('input[type=text]').val(name || '');
		$areaLi.find('.location_wrap').hide();
	}

	/* ---------- 검색 탭 ---------- */
	function setTab(kind) {
		var hotel = kind !== 't';
		$('#searchTabRadio1').prop('checked', hotel).closest('li').toggleClass('on', hotel);
		$('#searchTabRadio2').prop('checked', !hotel).closest('li').toggleClass('on', !hotel);
		$('#hotel_search').toggle(hotel);
		$('#tour_search').toggle(!hotel);
		$('#topSearchBtn').data('kind', hotel ? 'h' : 't').attr('data-kind', hotel ? 'h' : 't');
		$('.hotel_search_area .tit_for_mobile h3').text(hotel ? '호텔 검색하기' : '여행 상품 검색하기');
	}

	function openSearch(kind) {
		if (kind) setTab(kind);
		$('.hotel_search_area').fadeIn(200).addClass('search-on');
	}
	function closeSearch() {
		$('.hotel_search_area').fadeOut(200).removeClass('search-on');
		$('.location_wrap.for_top').hide();
		if (hotelPicker) hotelPicker.hide();
		if (tourPicker) tourPicker.hide();
	}

	/* ---------- 검색 실행 → 목록 ---------- */
	function fmt(m) { return m ? m.format('YYYY-MM-DD') : ''; }

	function submitSearch(kind) {
		var params;
		if (kind == 'h') {
			var $f = $('#searchHotelForm');
			var s = hotelPicker ? hotelPicker.getStartDate() : null;
			var e = hotelPicker ? hotelPicker.getEndDate() : null;
			if (s && !e) {
				Mock.toast('체크아웃 날짜를 선택하세요', { type: 'error' });
				return false;
			}
			params = {
				kind: 'hotel', cate: 'hotel',
				city: $f.find('input[name=city]').val(), region: $f.find('input[name=region]').val(),
				checkin: fmt(s), checkout: fmt(e),
				adult: $f.find('input[name=adultNum]').val(), child: $f.find('input[name=childNum]').val(), room: $f.find('input[name=roomNum]').val()
			};
		} else {
			var $t = $('#searchTourForm');
			params = {
				kind: 'tour',
				city: $t.find('input[name=city]').val(), region: $t.find('input[name=region]').val(),
				q: $.trim($t.find('input[name=g_title_s]').val()),
				cate: $t.find('select[name=cate]').val(),
				date: $t.find('input[name=departDate]').val()
			};
		}
		location.href = ATH.href('list', params);
		return false;
	}

	/* ---------- 목록 화면에서 들어온 조건을 검색 레이어에 다시 채우기 ---------- */
	function prefill() {
		var q = function (k) { return Mock.qs(k) || ''; };
		if (!/good\/list\.html/.test(location.pathname)) return;
		var city = q('city'), region = q('region');
		var name = city ? ATH.cityName(city) : '';
		if (!name && region) (window.ATHOME_REGIONS || []).forEach(function (r) { if (r.id === region) name = r.name + ' 전체'; });
		$('.hotel_search_area li.area_form').each(function () { setLocation($(this), city, region, name); });
		if (q('q')) { $('#searchTourForm input[name=g_title_s]').val(q('q')); $('#searching_box').val(q('q')); $('#top_sfrm input[name=g_title_s]').val(q('q')); }
		if (q('cate') && q('cate') !== 'hotel') $('#searchTourForm select[name=cate]').val(q('cate'));
		if (q('date') && tourPicker) tourPicker.setDate(q('date'));
		if (q('checkin') && q('checkout') && hotelPicker) hotelPicker.setDateRange(q('checkin'), q('checkout'));
		['adult', 'child', 'room'].forEach(function (k) {
			var v = parseInt(q(k), 10);
			if (v >= 0) { $('#searchHotelForm input[name=' + k + 'Num]').val(v); $('#searchHotelForm .' + k + 'Num').text(v); }
		});
		var $h = $('#searchHotelForm');
		$h.find('.personNumCheck').val('성인 ' + $h.find('input[name=adultNum]').val() + '명 / 소아 ' + $h.find('input[name=childNum]').val() + '명');
		$h.find('.roomNumCheck').val($h.find('input[name=roomNum]').val() + ' 객실');
		setTab(q('kind') === 'hotel' ? 'h' : 't');
	}

	/* ---------- Lightpick (원래 설정 그대로, 연도 드롭다운만 내년까지) ---------- */
	function initPickers() {
		if (!window.Lightpick || !window.moment) return;
		var minDateFormat = moment().add(1, 'days').format('YYYY-MM-DD');
		var thisYear = moment().format('YYYY'), nextYear = moment().add(1, 'year').format('YYYY');
		if (document.getElementById('checkinout_ok')) {
			hotelPicker = new Lightpick({
				field: document.getElementById('checkinout_ok'),
				singleDate: false,
				tooltipNights: false,
				firstDay: 7,
				disabledDatesInRange: false,
				dropdowns: { years: { min: thisYear, max: nextYear }, months: true },
				separator: ' ~ ',
				hoveringTooltip: false,
				selectForward: true,
				selectBackward: false,
				repick: false,
				minDate: minDateFormat,
				minDays: 2,
				format: 'YYYY-MM-DD',
				numberOfMonths: 2,
				numberOfColumns: 2,
				autoclose: false, //[son]검색폼도 같이 닫혀서 false 지정
				parentEl: "#hotel_search",
				onSelect: function (start, end) {
					$("#searchHotelForm input[name=checkIn]").val(fmt(start));
					$("#searchHotelForm input[name=checkOut]").val(fmt(end));
				}
			});
		}
		if (document.getElementById('departDate')) {
			tourPicker = new Lightpick({
				field: document.getElementById('departDate'),
				singleDate: true,
				tooltipNights: false,
				firstDay: 7,
				disabledDatesInRange: false,
				dropdowns: { years: { min: thisYear, max: nextYear }, months: true },
				hoveringTooltip: false,
				selectForward: true,
				selectBackward: false,
				repick: false,
				minDate: minDateFormat,
				format: 'YYYY-MM-DD',
				numberOfMonths: 1,
				numberOfColumns: 1,
				autoclose: true,
				parentEl: "#tour_search"
			});
		}
		// 처음 값 ' ~ ' 은 비워서 placeholder 가 보이게
		if ($.trim($('#checkinout_ok').val()) === '~') $('#checkinout_ok').val('');
	}

	$(function () {
		/* ===== 원래 헤더 인라인 스크립트 ===== */
		$("ul.top_right > li.language").click(function () {
			$(this).find("ul.det_menu").stop().fadeToggle(300);
		});
		$(".inwon_area .child .minus").css('color', '#ffd5d1');
		$(".room_area .room .minus").css('color', '#ffd5d1');

		$('.personNumCheck').on('click', function () { $(this).siblings('.personNumArea').toggleClass('show'); });
		$('.roomNumCheck').on('click', function () { $(this).siblings('.roomNumArea').toggleClass('show'); });

		// 타겟영역을 제외하고 클릭했을 시 팝업 숨김처리.
		$('body').on('click', function (e) {
			var $tg = $(e.target);
			if (!$tg.hasClass('personNumCheck') && !$tg.is('.personNumArea *')) $('.personNumArea').removeClass('show');
			if (!$tg.hasClass('roomNumCheck') && !$tg.is('.roomNumArea *')) $('.roomNumArea').removeClass('show');
			if (!$tg.closest('li.area_form').length) $('.location_wrap.for_top').hide();
		});

		$(document).on("click", ".side_category > p", function () {
			if (!$(this).hasClass('one')) {
				if ($(this).next().css("display") == "none") {
					$(this).next().slideDown();
					$(this).children("span").html("<i class=\"xi-angle-up\"></i>");
				} else {
					$(this).next().slideUp();
					$(this).children("span").html("<i class=\"xi-angle-down\"></i>");
				}
			}
		});

		$('.mb_search_btn').on('click', function () { $('.hd_search_wrap').slideToggle(); });
		$('.for_mobile_close, .sch_closeBtn').on('click', closeSearch);

		if (document.body.clientWidth < 767 && window.Swiper) {
			new Swiper('.swiper-container-top', {
				slidesPerView: 'auto',
				scrollbar: '.swiper-scrollbar',
				scrollbarHide: true,
				centeredSlides: false,
				freeMode: true
			});
		}

		/* ===== 통합검색 레이어 ===== */
		buildLocationLayers();
		initPickers();

		// 헤더 검색창 → 레이어 열기 (원래 주석 처리돼 있던 .search-open 동작)
		$('.search-open').on('click', function () { openSearch('t'); setTimeout(function () { $('#searchTourForm input[name=g_title_s]').focus(); }, 250); });
		$('#searching_box').attr('readonly', 'readonly').css('cursor', 'pointer');
		// 어두운 바탕을 누르면 닫기
		$('.hotel_search_area').on('click', function (e) { if (e.target === this) closeSearch(); });
		$(document).on('keydown', function (e) { if (e.keyCode === 27 && $('.hotel_search_area').is(':visible')) closeSearch(); });

		$('input[name=searchTabRadio]').on('change click', function () { setTab($(this).val() == '2' ? 't' : 'h'); });

		// 지역 레이어
		$('#top_hotel_location_input, #top_tour_location_input').on('click', function () {
			$('.location_wrap.for_top').not($(this).siblings('.location_wrap')).hide();
			$(this).siblings('.location_wrap').toggle();
		});
		$(document).on('click', '.location_wrap.for_top .mainCate li', function () {
			var $wrap = $(this).closest('.location_wrap');
			$(this).addClass('on').siblings().removeClass('on');
			$wrap.find('.city_wrap').hide().eq($(this).index()).fadeIn(150);
		});
		$(document).on('click', '.location_wrap.for_top .city_wrap a', function () {
			var $a = $(this);
			setLocation($a.closest('li.area_form'), $a.data('city') || '', $a.data('city') ? '' : ($a.data('region') || ''), $a.data('name'));
		});
		$('p.location_close').on('click', function () { $(this).parents('.location_wrap').hide(); });

		// 여행 탭 카테고리 (원래 '출발지 선택' 자리)
		var $cate = $('#searchTourForm select[name=cate]');
		if ($cate.length) {
			$cate.html('<option value="">카테고리 전체</option>' + ATH.categories().filter(function (c) { return c.id !== 'hotel'; }).map(function (c) {
				return '<option value="' + c.id + '">' + Mock.esc(c.name) + '</option>';
			}).join(''));
		}

		$('#topSearchBtn').on('click', function () { return submitSearch($(this).data('kind')); });
		$('#searchHotelForm, #searchTourForm').on('submit', function () { return submitSearch(this.id === 'searchHotelForm' ? 'h' : 't'); });
		$('#searchTourForm input[name=g_title_s]').on('keydown', function (e) { if (e.keyCode === 13) { e.preventDefault(); submitSearch('t'); } });

		// 모바일 키워드 검색
		$('#top_sfrm').on('submit', function () {
			var kw = $.trim($(this).find('input[name=g_title_s]').val());
			location.href = ATH.href('list', { q: kw });
			return false;
		});
		$('#top_sfrm .search_btn').on('click', function () { $('#top_sfrm').trigger('submit'); return false; });
		$('form[name=top_search_frm]').on('submit', function () { openSearch('t'); return false; });

		// 현재 카테고리 GNB 표시
		var curCate = Mock.qs('cate');
		if (curCate && /good\/list\.html/.test(location.pathname)) {
			$('#gnb_c .gnb_wrap span.swiper-slide').each(function () {
				var a = $(this).find('a')[0];
				if (a && a.search && Mock.qs('cate', a.search) === curCate) $(this).addClass('on');
			});
		}

		prefill();
	});
})(jQuery);
