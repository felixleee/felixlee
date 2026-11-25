/*
 * 입고정보 등록(wh_new.html) · 변경(wh_edit.html?id=) — 필수값 검증 → 저장 → 목록(wh_view)에 반영
 *  검증·저장할 행 만들기는 wh_shared.js (StxWh)
 */
$(function () {
	'use strict';
	var NAME = StxWh.NAME;
	var isEdit = /wh_edit\.html$/i.test(location.pathname);
	var id = Mock.qs('id');
	var $form = $('#whForm');
	var $f = {
		model: $('#model'), sn: $('#sn_num'), ship: $('#ship_name'), over: $('#over'), hours: $('#runningtime'),
		inDate: $('#Date1'), pjt: $('#pjt_no'), manager: $('#manager'), stage: $('#stage'), outDate: $('#Date2')
	};
	var $save = $('#btnSave');
	var record = null, saving = false;

	StxWh.fillDatalists($('#modelList'), $('#shipList'));
	$('#btnList').attr('href', StxDemo.listUrl('wh_view', 'wh_view.html'));
	$form.on('input change', 'input, select', function () { $(this).removeClass('demo_invalid').removeAttr('aria-invalid'); });

	function fill(r) {
		$f.model.val(r.model); $f.sn.val(r.sn); $f.ship.val(r.ship); $f.over.val(r.overhaul);
		$f.hours.val(StxDemo.hours(r.runHours)); $f.pjt.val(r.pjtNo); $f.manager.val(r.manager); $f.stage.val(r.stage);
		StxDemo.setDateField($f.inDate, r.inDate, window.picker);
		StxDemo.setDateField($f.outDate, r.outDate, window.picker2);
	}

	if (isEdit) {
		$form.find('input, select').prop('disabled', true);
		if (!id) {
			Mock.toast('변경할 입고정보를 목록에서 골라 주세요', { type: 'error' });
			$save.addClass('demo_busy');
		} else {
			MockApi.get(NAME, id).then(function (r) {
				record = r;
				fill(r);
				$form.find('input, select').prop('disabled', false);
			}).catch(function () {
				Mock.toast('입고정보를 찾을 수 없어요 (삭제되었을 수 있어요)', { type: 'error' });
				$save.addClass('demo_busy');
			});
		}
	} else {
		$f.stage.val('입고');
		StxDemo.setDateField($f.inDate, StxDemo.today(), window.picker);
		$f.manager.val('김태섭');
	}

	$save.on('click', function (ev) {
		ev.preventDefault();
		if (saving || $save.hasClass('demo_busy')) return;
		if (!StxWh.validate($f, record)) return;
		var row = StxWh.buildRow($f, record);
		saving = true;
		StxDemo.busy($save, true);
		var p = record ? MockApi.update(NAME, record.id, row) : MockApi.create(NAME, row);
		p.then(function (saved) {
			location.href = Mock.url('wh_view.html', { saved: saved.id, mode: record ? 'edit' : 'new' });
		}).catch(function (err) {
			saving = false;
			StxDemo.busy($save, false);
			Mock.toast((err && err.message) || '저장하지 못했어요', { type: 'error' });
		});
	});
});
