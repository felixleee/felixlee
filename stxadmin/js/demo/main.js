/*
 * 메인 — 즐겨찾기(바로가기) · 공지사항(내용 팝업) · 표출 중인 긴급일정 · 최근 입고 현황
 */
$(function () {
	'use strict';
	var e = Mock.esc;
	var $fav = $('#favTable'), $notice = $('#noticeTable'), $urgent = $('#urgentTable'), $recent = $('#recentTable');
	var notices = [];

	[$fav, $notice, $urgent].forEach(function ($t) { StxDemo.bindCheckAll($t); });
	StxDemo.stateRow($fav.find('tbody'), 3, 'loading');
	StxDemo.stateRow($notice.find('tbody'), 4, 'loading');
	StxDemo.stateRow($urgent.find('tbody'), 5, 'loading');
	StxDemo.stateRow($recent.find('tbody'), 7, 'loading');

	function chk(id) { return '<td><input type="checkbox" name="chk" value="' + e(id) + '"/></td>'; }
	// 체크박스를 누를 때는 행 이동을 하지 않음
	function rowClick($table, fn) {
		$table.on('click', 'tbody tr.demo_rowlink', function (ev) {
			if ($(ev.target).is('input, label')) return;
			fn($(this).attr('data-id'), this);
		});
	}

	/* 즐겨찾기 */
	MockApi.list('stxadmin.favorites', { sort: 'id' }).then(function (res) {
		if (!res.total) return StxDemo.stateRow($fav.find('tbody'), 3, 'empty', '등록된 즐겨찾기가 없어요');
		$fav.find('tbody').html(res.items.map(function (r, i) {
			return '<tr class="demo_rowlink" data-id="' + r.id + '" data-href="' + e(r.href) + '" title="' + e(r.label) + ' 화면으로 이동">' +
				chk(r.id) + '<td>' + (i + 1) + '</td><td>' + e(r.label) + '</td></tr>';
		}).join(''));
	}).catch(function () { StxDemo.stateRow($fav.find('tbody'), 3, 'error'); });
	rowClick($fav, function (id, tr) { location.href = $(tr).attr('data-href'); });

	/* 공지사항 */
	MockApi.list('stxadmin.notices', { sort: '-createdAt', size: 5 }).then(function (res) {
		notices = res.items;
		if (!res.total) return StxDemo.stateRow($notice.find('tbody'), 4, 'empty', '등록된 공지사항이 없어요');
		$notice.find('tbody').html(res.items.map(function (r, i) {
			var brief = r.content.replace(/\s+/g, ' ');
			return '<tr class="demo_rowlink" data-id="' + r.id + '" title="공지 내용 보기">' + chk(r.id) +
				'<td>' + (i + 1) + '</td><td class="demo_ellipsis">' + e(r.title) + '</td>' +
				'<td class="demo_ellipsis">' + e(brief.length > 14 ? brief.slice(0, 14) + '...' : brief) + '</td></tr>';
		}).join(''));
	}).catch(function () { StxDemo.stateRow($notice.find('tbody'), 4, 'error'); });

	var cur = -1;
	function openNotice(idx) {
		var n = notices[idx];
		if (!n) return;
		cur = idx;
		$('#noticeTitle').text(n.title);
		$('#noticeAuthor').text(n.author);
		$('#noticeDate').text(Mock.date(n.createdAt, 'YYYY-MM-DD HH:mm'));
		$('#noticeBody').text(n.content);
		$('#btnNoticePrev').toggleClass('demo_busy', idx <= 0);
		$('#btnNoticeNext').toggleClass('demo_busy', idx >= notices.length - 1);
		StxDemo.openPop('notice_pop');
	}
	rowClick($notice, function (id) {
		for (var i = 0; i < notices.length; i++) if (String(notices[i].id) === String(id)) return openNotice(i);
	});
	$('#btnNoticePrev').on('click', function () { openNotice(cur - 1); });
	$('#btnNoticeNext').on('click', function () { openNotice(cur + 1); });

	/* 긴급일정 (표출 중인 것만) */
	MockApi.list('stxadmin.schedules', { filter: { show: true }, sort: '-createdAt', size: 5 }).then(function (res) {
		if (!res.total) return StxDemo.stateRow($urgent.find('tbody'), 5, 'empty', '표출 중인 긴급일정이 없어요');
		$urgent.find('tbody').html(res.items.map(function (r, i) {
			return '<tr class="demo_rowlink" data-id="' + r.id + '" title="긴급일정 수정">' + chk(r.id) +
				'<td>' + (i + 1) + '</td><td>' + e(r.title) + '</td><td>' + e(Mock.date(r.createdAt)) + '</td><td>표출</td></tr>';
		}).join(''));
	}).catch(function () { StxDemo.stateRow($urgent.find('tbody'), 5, 'error'); });
	rowClick($urgent, function (id) { location.href = Mock.url('display/e_schedule.html', { id: id }); });

	/* 최근 입고 현황 */
	MockApi.resolve(function () {
		var all = MockDB.all('stxadmin.warehouse');
		var month = Mock.date(new Date(), 'YYYY-MM');
		var counts = StxDemo.STAGES.map(function (s) {
			return { stage: s, n: all.filter(function (r) { return r.stage === s && (s !== '출고' || (r.outDate || '').slice(0, 7) === month); }).length };
		});
		var working = all.filter(function (r) { return r.stage !== '출고'; }).length;
		var recent = MockApi.query(all, { sort: ['-inDate', '-createdAt'], size: 5 }).items;
		return { counts: counts, working: working, recent: recent };
	}).then(function (d) {
		$('#stageTiles').html(
			'<a class="demo_tile_total" href="display/wh_view.html" title="입고정보 목록">정비 진행 중<strong>' + d.working + '<small>대</small></strong></a>' +
			d.counts.map(function (c) {
				var label = c.stage === '출고' ? '이번 달 출고' : c.stage;
				return '<a href="' + e(Mock.url('display/wh_view.html', { stage: c.stage })) + '" title="' + e(c.stage) + ' 단계 목록">' + e(label) +
					'<strong>' + c.n + '<small>건</small></strong></a>';
			}).join('')
		);
		if (!d.recent.length) return StxDemo.stateRow($recent.find('tbody'), 7, 'empty', '입고된 엔진이 없어요');
		$recent.find('tbody').html(d.recent.map(function (r, i) {
			return '<tr class="demo_rowlink" data-id="' + r.id + '" title="입고정보 상세">' +
				'<td>' + (i + 1) + '</td><td>' + e(r.model) + '</td><td>' + e(r.sn) + '</td><td>' + e(r.ship) + '</td>' +
				'<td>' + e(r.pjtNo) + '</td><td>' + StxDemo.stageBadge(r.stage) + '</td><td>' + e(r.inDate) + '</td></tr>';
		}).join(''));
	}).catch(function () { StxDemo.stateRow($recent.find('tbody'), 7, 'error'); });
	rowClick($recent, function (id) { location.href = Mock.url('display/wh_view.html', { id: id }); });
});
