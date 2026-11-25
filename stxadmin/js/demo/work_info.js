/*
 * 영업정보·생산정보·품질정보 수정 (work_info.html?id=) — 저장하면 이력관리(record.html)의 상세에 반영
 *  같은 입고정보 행을 고치므로 함명·입고일·가동시간 등은 입고정보 목록에도 그대로 반영됨
 */
$(function () {
	'use strict';
	var NAME = 'stxadmin.warehouse';
	var e = Mock.esc;
	var $form = $('#workForm'), $save = $('#btnSave');
	var id = Mock.qs('id'), record = null, saving = false;

	// 입력칸 id → 데이터 필드
	var MAP = {
		contract_num: 'contractNo', ship_name: 'ship', contract_name: 'contractName', ship_num: 'shipNo',
		Date1: 'outDate', Date2: 'inDate', supplier: 'supplier', etc: 'etc', significant: 'note',
		pd_significant: 'pdNote', distance: 'distance', repair_history: 'repairHistory',
		rpm: 'rpm', horse_power: 'hp', kw: 'kw', size: 'size', weight: 'weight', types: 'milType', q_significant: 'qNote'
	};
	function $el(k) { return $form.find('#' + k); }

	function fill(r) {
		record = r;
		var sep = '<em class="demo_sep">·</em>';
		$('#recordTitle').html(e(r.model) + sep + 'S/N ' + e(r.sn) + sep + 'PJT ' + e(r.pjtNo) + sep + e(r.ship) + ' ' + StxDemo.stageBadge(r.stage));
		$.each(MAP, function (k, f) { $el(k).val(r[f] == null ? '' : r[f]); });
		StxDemo.setDateField($el('Date1'), r.outDate, window.picker);
		StxDemo.setDateField($el('Date2'), r.inDate, window.picker2);
		$el('running_time').val(StxDemo.hours(r.runHours));
		$el('repair_count').val(r.overhaul);
		$el('Date1').attr('placeholder', '출하 전이면 비워 두세요');
		var back = Mock.url('record.html', { id: r.id });
		$('#btnList, #btnBackRecord').attr('href', back);
		$form.find('input, textarea').prop('disabled', false);
	}

	$form.find('input, textarea').prop('disabled', true);
	$form.on('input change', 'input, textarea', function () { $(this).removeClass('demo_invalid'); });

	var getId = id ? Promise.resolve(id) : MockApi.list(NAME, { sort: ['-inDate', '-id'], size: 1 }).then(function (res) {
		// 주소에 id 가 없으면 가장 최근 이력을 보여 줌
		if (res.items[0]) { Mock.toast('가장 최근 이력을 보여 드려요. 이력관리에서 다른 엔진을 고를 수 있어요'); return res.items[0].id; }
		return null;
	});
	getId.then(function (rid) {
		if (!rid) { $('#recordTitle').text('등록된 이력이 없어요'); return; }
		return MockApi.get(NAME, rid).then(fill);
	}).catch(function () {
		$('#recordTitle').text('이력을 찾을 수 없어요 (삭제되었을 수 있어요)');
		Mock.toast('이력을 찾을 수 없어요', { type: 'error' });
	});

	/* ---------- 저장 ---------- */
	$save.on('click', function (ev) {
		ev.preventDefault();
		if (!record || saving) return;
		var inDate = $.trim($el('Date2').val());
		var ok = StxDemo.validate([
			{ el: $el('ship_name'), label: '함명', required: true },
			{ el: $el('Date2'), label: '입고일', required: true, test: function (v) { return StxDemo.isDate(v) ? '' : '입고일은 YYYY-MM-DD 형식으로 입력해 주세요'; } },
			{ el: $el('Date1'), label: '출하일', test: function (v) {
				if (!StxDemo.isDate(v)) return '출하일은 YYYY-MM-DD 형식으로 입력해 주세요';
				return StxDemo.isDate(inDate) && v < inDate ? '출하일이 입고일보다 빠를 수 없어요' : '';
			} },
			{ el: $el('running_time'), label: '가동시간', required: true, test: function (v) {
				var n = StxDemo.parseNum(v); return isNaN(n) || n <= 0 ? '가동시간은 숫자로 입력해 주세요 (예: 10,000H)' : '';
			} },
			{ el: $el('repair_count'), label: '정비회차', required: true, test: function (v) {
				var n = StxDemo.parseNum(v); return isNaN(n) || n < 1 || n > 99 ? '정비회차는 1 이상의 숫자로 입력해 주세요' : '';
			} }
		]);
		if (!ok) return;
		var patch = { updatedAt: Mock.now() };
		$.each(MAP, function (k, f) { patch[f] = $.trim($el(k).val() || ''); });
		patch.runHours = StxDemo.parseNum($el('running_time').val());
		patch.overhaul = StxDemo.parseNum($el('repair_count').val());
		// 출하일을 넣으면 '출고', 지우면 '시운전' 으로 진행 단계를 맞춤
		var note = '';
		if (patch.outDate && record.stage !== '출고') { patch.stage = '출고'; note = ' (진행 단계를 \'출고\'로 바꿨어요)'; }
		else if (!patch.outDate && record.stage === '출고') { patch.stage = '시운전'; note = ' (출하일이 없어 진행 단계를 \'시운전\'으로 바꿨어요)'; }

		saving = true;
		StxDemo.busy($save, true);
		MockApi.update(NAME, record.id, patch).then(function (r) {
			if (note) { try { sessionStorage.setItem('stx.flash', '이력 정보를 저장했어요' + note); } catch (er) { /* 무시 */ } }
			location.href = Mock.url('record.html', { id: r.id, saved: 1 });
		}).catch(function (err) {
			saving = false;
			StxDemo.busy($save, false);
			Mock.toast((err && err.message) || '저장하지 못했어요', { type: 'error' });
		});
	});

	/* ---------- 성적서 ---------- */
	$form.on('click', '[data-doc]', function () {
		if (!record) return;
		$form.find('[data-doc]').removeClass('on');
		$(this).addClass('on');
		StxDocs.open(record, $(this).attr('data-doc'));
	});
});
