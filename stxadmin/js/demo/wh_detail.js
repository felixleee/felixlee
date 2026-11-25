/*
 * 입고정보 조회(월별) — 기종 × 월 입고 건수. 숫자를 누르면 그 기종·월의 목록(wh_view)으로
 *  - 기간을 고르지 않으면 이번 달까지 최근 5개월, 고르면 그 기간의 달(최대 12개월)
 *  - [입고정보입력] 팝업으로 바로 등록 → 표에 반영
 */
$(function () {
	'use strict';
	var NAME = StxWh.NAME, MAX_MONTHS = 12;
	var e = Mock.esc;
	var $table = $('#monthTable'), $head = $table.find('thead tr'), $tbody = $table.find('tbody');
	var $from = $('#startDate'), $to = $('#endDate');
	var seq = 0;

	function ym(d) { return Mock.date(d, 'YYYY-MM'); }
	function monthList(from, to) {
		var out = [], t = Mock.toDate(from.slice(0, 7) + '-01'), end = to.slice(0, 7);
		while (ym(t) <= end && out.length < 60) { out.push(ym(t)); t = new Date(t.getFullYear(), t.getMonth() + 1, 1); }
		return out;
	}
	function lastDay(m) { var t = Mock.toDate(m + '-01'); return Mock.date(new Date(t.getFullYear(), t.getMonth() + 1, 0)); }

	function render() {
		var from = $from.val(), to = $to.val(), months;
		if (from && to) {
			if (from > to) return Mock.toast('기간을 다시 확인해 주세요', { type: 'error' });
			months = monthList(from, to);
			if (months.length > MAX_MONTHS) {
				Mock.toast('최대 ' + MAX_MONTHS + '개월까지 볼 수 있어서 마지막 ' + MAX_MONTHS + '개월만 보여 드려요');
				months = months.slice(-MAX_MONTHS);
			}
		} else {
			var now = new Date();
			months = monthList(ym(new Date(now.getFullYear(), now.getMonth() - 4, 1)), ym(now));
		}
		var crossYear = months[0].slice(0, 4) !== months[months.length - 1].slice(0, 4);
		$head.html('<th style="width: 170px;"></th>' + months.map(function (m) {
			var mm = +m.slice(5, 7);
			return '<th>' + (crossYear ? m.slice(2, 4) + '년 ' : '') + mm + '월</th>';
		}).join(''));
		var cols = months.length + 1, my = ++seq;
		StxDemo.stateRow($tbody, cols, 'loading');

		MockApi.resolve(function () {
			var rows = MockDB.all(NAME);
			var names = MockDB.all('stxadmin.models').map(function (m) { return m.name; });
			rows.forEach(function (r) { if (r.model && names.indexOf(r.model) < 0) names.push(r.model); });
			var grid = {};
			rows.forEach(function (r) {
				var k = r.model + '|' + (r.inDate || '').slice(0, 7);
				grid[k] = (grid[k] || 0) + 1;
			});
			return { names: names, grid: grid };
		}).then(function (d) {
			if (my !== seq) return;
			var total = months.map(function () { return 0; }), any = false;
			var html = d.names.map(function (name) {
				return '<tr><td>' + e(name) + '</td>' + months.map(function (m, i) {
					var n = d.grid[name + '|' + m] || 0;
					total[i] += n;
					if (n) any = true;
					return '<td>' + (n ? '<a class="demo_link" href="' + e(Mock.url('wh_view.html', { model: name, from: m + '-01', to: lastDay(m) })) +
						'" title="' + e(name + ' · ' + m + ' 입고 ' + n + '건 보기') + '">' + n + '</a>' : '') + '</td>';
				}).join('') + '</tr>';
			}).join('');
			if (!any) return StxDemo.stateRow($tbody, cols, 'empty', '이 기간에 입고된 엔진이 없어요');
			html += '<tr class="demo_total"><td>합계</td>' + total.map(function (n, i) {
				return '<td>' + (n ? '<a class="demo_link" href="' + e(Mock.url('wh_view.html', { from: months[i] + '-01', to: lastDay(months[i]) })) + '">' + n + '</a>' : '0') + '</td>';
			}).join('') + '</tr>';
			$tbody.html(html);
			$('#monthHint').text('기간: ' + months[0] + ' ~ ' + months[months.length - 1] + ' · 숫자를 누르면 해당 기종·월의 입고정보 목록으로 이동해요.');
		});
	}

	$('#btnSearch').on('click', function (ev) { ev.preventDefault(); render(); });

	/* ---------- 빠른 입고정보 입력 팝업 ---------- */
	var $f = { model: $('#model'), sn: $('#sn_num'), ship: $('#ship_name'), over: $('#over'), hours: $('#runningtime'), inDate: $('#Date1') };
	var $save = $('#btnQuickSave'), saving = false;
	StxWh.fillDatalists($('#modelList'), $('#shipList'));
	$('#quickForm').on('input change', 'input', function () { $(this).removeClass('demo_invalid'); });

	$('#btnQuickNew').on('click', function () {
		$.each($f, function (k, $el) { $el.val(''); });
		StxDemo.clearInvalid($('#quickForm'));
		StxDemo.setDateField($f.inDate, StxDemo.today(), window.picker2);
		StxDemo.openPop('edit_pop');
		setTimeout(function () { $f.model.trigger('focus'); }, 50);
	});
	$save.on('click', function () {
		if (saving) return;
		if (!StxWh.validate($f, null)) return;
		saving = true;
		StxDemo.busy($save, true);
		MockApi.create(NAME, StxWh.buildRow($f, null)).then(function (r) {
			StxDemo.closePop('edit_pop');
			Mock.toast(r.model + ' (S/N ' + r.sn + ') 입고정보를 등록했어요', { type: 'success' });
			render();
		}).catch(function (err) {
			Mock.toast((err && err.message) || '저장하지 못했어요', { type: 'error' });
		}).finally(function () {
			saving = false;
			StxDemo.busy($save, false);
		});
	});

	render();
});
