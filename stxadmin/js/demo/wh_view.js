/*
 * 입고정보 조회(목록) — 검색(기종·S/N·함명·단계·입고일 기간) · 페이징 · 행 클릭 → 상세 팝업 · 선택 삭제 · CSV
 *  주소: wh_view.html?model=&sn=&ship=&stage=&from=&to=&page=   (id= 상세 팝업 열기, saved= 저장한 행 강조)
 */
$(function () {
	'use strict';
	var NAME = 'stxadmin.warehouse', SIZE = 10, COLS = 9;
	var e = Mock.esc;
	var $table = $('#whTable'), $tbody = $table.find('tbody'), $paging = $('#whPaging');
	var $f = { model: $('#model'), sn: $('#sn_number'), ship: $('#ship_name'), stage: $('#stage'), from: $('#startDate'), to: $('#endDate') };
	var state = { page: 1 }, reqSeq = 0, current = null;

	StxDemo.bindCheckAll($table);

	/* ---------- 검색 조건 ---------- */
	function readForm() {
		return {
			model: $.trim($f.model.val()), sn: $.trim($f.sn.val()), ship: $.trim($f.ship.val()),
			stage: $f.stage.val(), from: $f.from.val(), to: $f.to.val()
		};
	}
	function fillForm(q) {
		$f.model.val(q.model || ''); $f.sn.val(q.sn || ''); $f.ship.val(q.ship || ''); $f.stage.val(q.stage || '');
		if (window.picker && (q.from || q.to)) { try { window.picker.setDateRange(q.from || null, q.to || null, true); } catch (er) { /* 무시 */ } }
		$f.from.val(q.from || ''); $f.to.val(q.to || '');
	}
	function has(v, kw) { return !kw || String(v || '').toLowerCase().indexOf(kw.toLowerCase()) >= 0; }
	function filterFn(q) {
		return function (r) {
			return has(r.model, q.model) && has(r.sn, q.sn) && has(r.ship, q.ship) &&
				(!q.stage || r.stage === q.stage) &&
				(!q.from || r.inDate >= q.from) && (!q.to || r.inDate <= q.to);
		};
	}
	var SORT = ['-createdAt', '-id'];

	/* ---------- 목록 ---------- */
	function load(page, opts) {
		opts = opts || {};
		var q = readForm(), seq = ++reqSeq;
		state = { q: q, page: page || 1 };
		StxDemo.stateRow($tbody, COLS, 'loading');
		StxDemo.resetCheckAll($table);
		var params = $.extend({}, q, { page: state.page > 1 ? state.page : '' });
		StxDemo.replaceQuery(params);
		StxDemo.rememberList('wh_view');
		return MockApi.list(NAME, { filter: filterFn(q), sort: SORT, page: state.page, size: SIZE }).then(function (res) {
			if (seq !== reqSeq) return;
			state.page = res.page;
			$('#whCount').html('총 <strong>' + Mock.num(res.total) + '</strong>건' + (isFiltered(q) ? ' <span style="color:#8a8f98">(검색 결과)</span>' : ''));
			StxDemo.paging($paging, res, function (p) { load(p); });
			if (!res.total) {
				StxDemo.stateRow($tbody, COLS, 'empty', isFiltered(q) ? '검색 조건에 맞는 입고정보가 없어요' : '등록된 입고정보가 없어요');
				return;
			}
			$tbody.html(res.items.map(function (r, i) {
				return '<tr class="demo_rowlink" data-id="' + r.id + '" title="상세 보기">' +
					'<td><input type="checkbox" name="chk" value="' + r.id + '"/></td>' +
					'<td>' + ((res.page - 1) * SIZE + i + 1) + '</td>' +
					'<td>' + e(r.model) + '</td>' +
					'<td>' + e(r.sn) + '</td>' +
					'<td>' + e(r.ship) + '</td>' +
					'<td>' + e(r.overhaul) + '</td>' +
					'<td>' + StxDemo.hours(r.runHours) + '</td>' +
					'<td><input class="search_cal demo_cell_date" type="text" value="' + e(r.inDate) + '" style="cursor:pointer;" readonly tabindex="-1" /></td>' +
					'<td>' + StxDemo.stageBadge(r.stage) + '</td>' +
					'</tr>';
			}).join(''));
			if (opts.flash) StxDemo.flash($tbody.find('tr[data-id="' + opts.flash + '"]'));
		}).catch(function () {
			if (seq === reqSeq) StxDemo.stateRow($tbody, COLS, 'error');
		});
	}
	function isFiltered(q) { return !!(q.model || q.sn || q.ship || q.stage || q.from || q.to); }

	$('#btnSearch').on('click', function (ev) {
		ev.preventDefault();
		var q = readForm();
		if (q.from && q.to && q.from > q.to) return Mock.toast('입고일 기간을 다시 확인해 주세요', { type: 'error' });
		load(1);
	});
	$f.stage.on('change', function () { load(1); });
	$('#btnReset').on('click', function () {
		fillForm({});
		if (window.picker) { try { window.picker.setDateRange(null, null, true); } catch (er) { /* 무시 */ } }
		load(1);
	});

	/* ---------- 상세 팝업 ---------- */
	function openDetail(id) {
		return MockApi.get(NAME, id).then(function (r) {
			current = r;
			var $p = $('#view_pop');
			var val = {
				sn: r.sn, ship: r.ship, model: r.model, overhaul: r.overhaul + '회차', runHours: StxDemo.hours(r.runHours),
				inDate: r.inDate, outDate: r.outDate || '정비 중', pjtNo: r.pjtNo, manager: r.manager, shipNo: r.shipNo
			};
			$p.find('[data-f]').each(function () {
				var k = $(this).attr('data-f');
				if (k === 'stage') $(this).html(StxDemo.stepper(r.stage));
				else $(this).text(val[k] == null || val[k] === '' ? '-' : val[k]);
			});
			StxDemo.openPop('view_pop');
		}).catch(function () {
			Mock.toast('입고정보를 찾을 수 없어요 (삭제되었을 수 있어요)', { type: 'error' });
		});
	}
	$table.on('click', 'tbody tr.demo_rowlink', function (ev) {
		if ($(ev.target).is('input[type=checkbox]')) return;
		openDetail($(this).attr('data-id'));
	});
	$('#btnGoEdit').on('click', function () { if (current) location.href = Mock.url('wh_edit.html', { id: current.id }); });
	$('#btnGoRecord').on('click', function () { if (current) location.href = Mock.url('record.html', { sn: current.sn, id: current.id }); });

	/* ---------- 삭제 · 엑셀 ---------- */
	$('#btnDelete').on('click', function () {
		var ids = StxDemo.checkedIds($table);
		if (!ids.length) return Mock.toast('삭제할 입고정보를 선택해 주세요');
		if (!window.confirm('선택한 ' + ids.length + '건을 삭제할까요?\n삭제한 입고정보는 이력관리에서도 사라져요.')) return;
		var $b = $(this);
		StxDemo.busy($b, true, '삭제 중…');
		MockApi.remove(NAME, ids).then(function (n) {
			Mock.toast(n + '건을 삭제했어요', { type: 'success' });
			return load(state.page);
		}).finally(function () { StxDemo.busy($b, false); });
	});
	$('#btnExcel').on('click', function () {
		var q = readForm();
		MockApi.list(NAME, { filter: filterFn(q), sort: SORT }).then(function (res) {
			if (!res.total) return Mock.toast('내려받을 입고정보가 없어요');
			StxDemo.csv('입고정보_' + StxDemo.ymd(new Date()) + '.csv',
				['No', '기종', 'S/N', '함명', '함번호', 'PJT No', '오버홀 회차', '가동시간', '입고일', '출고일', '진행 단계', '담당자'],
				res.items.map(function (r, i) {
					return [i + 1, r.model, r.sn, r.ship, r.shipNo, r.pjtNo, r.overhaul, StxDemo.hours(r.runHours), r.inDate, r.outDate, r.stage, r.manager];
				}));
		});
	});

	/* ---------- 처음 열 때 ---------- */
	var q0 = {
		model: Mock.qs('model'), sn: Mock.qs('sn'), ship: Mock.qs('ship'),
		stage: Mock.qs('stage'), from: Mock.qs('from'), to: Mock.qs('to')
	};
	fillForm(q0);
	var savedId = Mock.qs('saved'), openId = Mock.qs('id'), savedMode = Mock.qs('mode');
	if (savedId) {
		// 저장·등록한 행이 있는 페이지를 찾아서 보여 주고 강조
		MockApi.list(NAME, { filter: filterFn(readForm()), sort: SORT }).then(function (res) {
			var idx = -1;
			res.items.some(function (r, i) { if (String(r.id) === String(savedId)) { idx = i; return true; } return false; });
			load(idx < 0 ? 1 : Math.floor(idx / SIZE) + 1, { flash: savedId });
			Mock.toast(savedMode === 'new' ? '입고정보를 등록했어요' : '입고정보를 저장했어요', { type: 'success' });
		});
	} else {
		load(parseInt(Mock.qs('page'), 10) || 1);
	}
	if (openId) openDetail(openId);
});
