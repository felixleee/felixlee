/*
 * 20V538 소요율 집계 — stxadmin.usage(오버홀별 소요 수량)로 표와 Chart.js 그래프를 그림
 *  - PJT 열 제목: 과거 PJT 번호 + 입고정보에서 출고 완료된 20V538 건의 PJT 번호 (최근 것이 오른쪽)
 *  - 평균 수량 = 오버홀 1회당 평균 소요, 평균 소요율 = 평균 수량 ÷ 대당수량
 *  - AI 예측수량 = 최근 6회 가중 평균(최근일수록 무겁게) × 1.1 올림 — 재고가 이보다 적으면 빨간색
 *  - 행을 누르면 오른쪽 추이 그래프가 그 품번으로 바뀜
 */
$(function () {
	'use strict';
	var e = Mock.esc;
	var $table = $('#usageTable'), $tbody = $table.find('tbody');
	var HISTORY = ['E19R562', 'E19R580', 'E20R573', 'E20R588', 'E21R571', 'E21R590', 'E22R544', 'E22R567', 'E23R512', 'E23R538', 'E24R521', 'E24R549', 'E24R575'];
	// 차트 색 — 검증 스크립트(dataviz validate_palette)로 색각이상 구분·채도·명도 확인한 두 색
	var C_ALL = '#d97706', C_RECENT = '#007bff', C_REF = '#9aa3ad', INK = '#555', GRID = '#eef1f4';
	var parts = [], pjts = [], rateChart = null, trendChart = null, selected = null;

	StxDemo.stateRow($tbody, 12, 'loading');

	function avg(a) { return a.length ? a.reduce(function (s, n) { return s + n; }, 0) / a.length : 0; }
	function fmtQty(n) { return Math.round(n * 10) / 10 === Math.round(n) ? String(Math.round(n)) : (Math.round(n * 10) / 10).toFixed(1); }
	function pct(n) { return Math.round(n * 100) + '%'; }
	function forecast(q) {
		var last = q.slice(-6), ws = 0, s = 0;
		last.forEach(function (n, i) { ws += i + 1; s += n * (i + 1); });
		return ws ? Math.ceil(s / ws * 1.1) : 0;
	}

	MockApi.resolve(function () {
		var done = MockDB.where('stxadmin.warehouse', function (r) { return /^20V538/.test(r.model) && r.stage === '출고' && r.pjtNo; })
			.sort(function (a, b) { return a.inDate < b.inDate ? -1 : a.inDate > b.inDate ? 1 : 0; });
		return { usage: MockDB.all('stxadmin.usage'), done: done };
	}).then(function (d) {
		var known = {};
		d.done.forEach(function (r) { known[r.pjtNo] = r.id; });
		var n = d.usage.reduce(function (m, p) { return Math.max(m, p.qty.length); }, 0);
		pjts = HISTORY.concat(d.done.map(function (r) { return r.pjtNo; })).slice(-n);
		parts = d.usage.map(function (p) {
			var q = p.qty.slice(-pjts.length), recent = q.slice(-15);
			var all = avg(q), rec = avg(recent);
			return {
				id: p.id, partNo: p.partNo, partName: p.partName, perUnit: p.perUnit, stock: p.stock, qty: q,
				allAvg: all, allRate: p.perUnit ? all / p.perUnit : 0, recAvg: rec, recRate: p.perUnit ? rec / p.perUnit : 0,
				last4: q.slice(-4), ai: forecast(q)
			};
		});

		// 열 제목 (PJT No) — 입고정보에 있는 건 이력관리로 연결
		$table.find('th[data-pjt]').each(function () {
			var k = +$(this).attr('data-pjt'), code = pjts[pjts.length - k] || '-';
			$(this).html(known[code]
				? '<a class="demo_th_link" href="' + e(Mock.url('record.html', { pjt: code, id: known[code] })) + '" title="' + e(code) + ' 이력 보기">' + e(code) + '</a>'
				: e(code)).attr('title', known[code] ? null : '데이터 이관 전 과거 이력');
		});

		if (!parts.length) return StxDemo.stateRow($tbody, 12, 'empty', '집계할 부품 소요 데이터가 없어요');
		$tbody.html(parts.map(function (p) {
			var short = p.stock < p.ai;
			var last4 = [0, 1, 2, 3].map(function (i) { var v = p.last4[p.last4.length - 4 + i]; return '<td>' + (v ? v : '') + '</td>'; }).join('');
			return '<tr class="demo_rowlink" data-id="' + p.id + '" title="' + e(p.partName) + ' — 행을 누르면 추이 그래프로">' +
				'<td>' + e(p.partNo) + '</td><td>' + p.perUnit + '</td>' +
				'<td>' + fmtQty(p.allAvg) + '</td><td>' + pct(p.allRate) + '</td>' +
				'<td>' + fmtQty(p.recAvg) + '</td><td>' + pct(p.recRate) + '</td>' + last4 +
				'<td' + (short ? ' class="demo_short" title="AI 예측수량보다 재고가 적어요"' : '') + '>' + p.stock + '</td>' +
				'<td>' + (p.ai || '') + '</td></tr>';
		}).join(''));
		var shortN = parts.filter(function (p) { return p.stock < p.ai; }).length;
		$('#usageHint').text('20V538 오버홀 ' + pjts.length + '회 기준 · 평균 소요율 = 평균 수량 ÷ 대당수량 · 재고가 AI 예측수량보다 적은 품번 ' + shortN +
			'개는 빨간색 · 행을 누르면 아래 추이 그래프가 그 품번으로 바뀌어요.');

		drawRate();
		select(parts.reduce(function (a, b) { return b.recRate > a.recRate ? b : a; }).id);
	}).catch(function (err) {
		StxDemo.stateRow($tbody, 12, 'error');
		if (window.console) console.error(err);
	});

	$tbody.on('click', 'tr.demo_rowlink', function () { select($(this).attr('data-id')); });

	/* ---------- 그래프 ---------- */
	function baseOptions() {
		return {
			responsive: true,
			maintainAspectRatio: false,
			animation: { duration: 400 },
			legend: { position: 'bottom', labels: { fontColor: INK, boxWidth: 12, padding: 14 } },
			tooltips: { mode: 'index', intersect: false, backgroundColor: 'rgba(17,24,39,.92)', xPadding: 10, yPadding: 8 },
			hover: { mode: 'index', intersect: false },
			layout: { padding: { top: 4, right: 6 } }
		};
	}
	function drawRate() {
		if (typeof Chart === 'undefined') return;
		var ctx = document.getElementById('rateChart');
		if (!ctx) return;
		var opt = baseOptions();
		opt.scales = {
			xAxes: [{ gridLines: { color: GRID, zeroLineColor: '#cfd5db' }, ticks: { fontColor: INK, beginAtZero: true, callback: function (v) { return v + '%'; } } }],
			yAxes: [{ gridLines: { display: false }, ticks: { fontColor: INK, autoSkip: false } }]
		};
		opt.tooltips.mode = 'index'; opt.tooltips.axis = 'y';
		opt.hover.axis = 'y';
		opt.tooltips.callbacks = {
			title: function (items) { var p = parts[items[0].index]; return p.partName + ' (' + p.partNo + ')'; },
			label: function (it, data) { return ' ' + data.datasets[it.datasetIndex].label + ': ' + it.xLabel + '%'; }
		};
		opt.onClick = function (ev, els) { if (els && els[0]) select(parts[els[0]._index].id); };
		rateChart = new Chart(ctx, {
			type: 'horizontalBar',
			data: {
				labels: parts.map(function (p) { return p.partName; }),
				datasets: [
					{ label: '전체 평균 소요율', data: parts.map(function (p) { return Math.round(p.allRate * 100); }), backgroundColor: C_ALL, borderColor: '#fff', borderWidth: 1, barPercentage: 0.8, categoryPercentage: 0.62 },
					{ label: '최근 15개 평균 소요율', data: parts.map(function (p) { return Math.round(p.recRate * 100); }), backgroundColor: C_RECENT, borderColor: '#fff', borderWidth: 1, barPercentage: 0.8, categoryPercentage: 0.62 }
				]
			},
			options: opt
		});
	}
	function select(id) {
		var p = null;
		parts.forEach(function (x) { if (String(x.id) === String(id)) p = x; });
		if (!p) return;
		selected = p;
		$tbody.find('tr').removeClass('demo_sel').filter('[data-id="' + p.id + '"]').addClass('demo_sel');
		$('#trendTitle').html('오버홀별 소요 수량<small>' + e(p.partName) + ' · ' + e(p.partNo) + ' · 최근 15회</small>');
		if (typeof Chart === 'undefined') return;
		var labels = pjts.slice(-15), q = p.qty.slice(-15);
		if (trendChart) {
			trendChart.data.labels = labels;
			trendChart.data.datasets[0].data = q;
			trendChart.data.datasets[1].data = labels.map(function () { return p.perUnit; });
			trendChart.update();
			return;
		}
		var ctx = document.getElementById('trendChart');
		if (!ctx) return;
		var opt = baseOptions();
		opt.scales = {
			xAxes: [{ gridLines: { display: false }, ticks: { fontColor: INK, maxRotation: 0, autoSkipPadding: 8 } }],
			yAxes: [{ gridLines: { color: GRID, zeroLineColor: '#cfd5db' }, ticks: { fontColor: INK, beginAtZero: true, precision: 0 } }]
		};
		opt.tooltips.callbacks = { label: function (it, data) { return ' ' + data.datasets[it.datasetIndex].label + ': ' + it.yLabel + '개'; } };
		trendChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: labels,
				datasets: [
					{ label: '소요 수량', data: q, borderColor: C_RECENT, backgroundColor: C_RECENT, borderWidth: 2, fill: false, lineTension: 0.2,
						pointRadius: 4, pointHoverRadius: 6, pointBackgroundColor: '#fff', pointBorderWidth: 2 },
					{ label: '대당수량', data: labels.map(function () { return p.perUnit; }), borderColor: C_REF, backgroundColor: C_REF, borderWidth: 2,
						borderDash: [6, 4], fill: false, pointRadius: 0, pointHoverRadius: 0 }
				]
			},
			options: opt
		});
	}
});
