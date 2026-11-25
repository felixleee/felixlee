/*!
 * TMS 예약 상세/수정 창 — main/good_res_edit.html?res_no=예약번호 (목록에서 모달 iframe 으로 열림)
 *  - 예약 정보·예약자·여행자 확인
 *  - 예약상태 변경, 담당자 배정 → [저장]
 *  - 입금 처리 (입금액 입력 → 미납 재계산 미리보기 → [입금처리])
 *  - 상담 메모 추가
 *  저장·입금·메모는 곧바로 tms.reservations 에 반영되고, 부모(목록)에 postMessage 로 알림
 */
(function (w, $) {
	'use strict';
	var T = w.TmsDemo, esc = Mock.esc;
	var id = Mock.qs('res_no');
	var R = null;
	var $body = $('#e_body');
	var inDialog = w.self !== w.top;

	function close() {
		if (inDialog) T.notifyParent('close');
		else location.href = 'good_res.html';
	}
	$('#e_close').on('click', close);
	$(document).on('keydown', function (e) { if (e.keyCode === 27 && inDialog) close(); });

	function load() {
		return MockApi.get('tms.reservations', id).then(function (r) { R = r; draw(); }, function () {
			$body.html('<p class="demo_state_box">예약번호 <b>' + esc(id || '-') + '</b> 를 찾을 수 없습니다. <a href="javascript:;" class="Tbtn" id="e_close2">닫기</a></p>');
			$('#e_close2').on('click', close);
			$('#e_save').hide();
		});
	}

	function kv(rows) {
		return '<table width="100%" border="0" cellspacing="0" cellpadding="0" class="t_register"><colgroup><col width="160"><col><col width="160"><col></colgroup><tbody>' +
			rows.map(function (r) {
				if (r.length === 2) return '<tr><th scope="row">' + r[0] + '</th><td colspan="3">' + r[1] + '</td></tr>';
				return '<tr><th scope="row">' + r[0] + '</th><td>' + r[1] + '</td><th scope="row">' + r[2] + '</th><td>' + r[3] + '</td></tr>';
			}).join('') + '</tbody></table>';
	}

	function draw() {
		var r = R, hotel = r.kind === 'hotel';
		$('#e_id').text(r.id);
		$('#e_status_now').html('<span style="color:' + (TourRes.COLOR[r.status] || '#333') + '">' + esc(r.status) + '</span>');
		$('#e_created').text(r.createdAt);
		document.title = '예약 ' + r.id + ' :: ' + document.title.replace(/^예약 \S+ :: /, '');

		var statusOpt = TourRes.STATUS.map(function (s) { return '<option value="' + s + '"' + (s === r.status ? ' selected' : '') + '>' + s + '</option>'; }).join('');
		var mgrOpt = '<option value="">미배정</option>' + TourRes.MANAGERS.map(function (m) { return '<option value="' + esc(m) + '"' + (m === r.manager ? ' selected' : '') + '>' + esc(m) + '</option>'; }).join('');
		var unpaid = TourRes.unpaid(r);
		var who = '성인 ' + r.pax.adult + ' / 아동 ' + r.pax.child + ' / 유아 ' + r.pax.infant + ' (총 ' + TourRes.paxTotal(r) + '명)';
		var unitTxt = hotel && r.hotel ? esc(r.hotel.room) + ' 1박 ' + Mock.won(r.hotel.unit) + ' × ' + r.hotel.nights + '박 × ' + r.hotel.rooms + '실'
			: '성인 ' + Mock.won(r.unit.adult) + (r.pax.child ? ' / 아동 ' + Mock.won(r.unit.child) : '') + (r.pax.infant ? ' / 유아 ' + Mock.won(r.unit.infant) : '');

		var html = '';
		// 1. 처리
		html += '<h2><span class="bl">■</span>예약 처리</h2>' + kv([
			['예약상태', '<select id="e_status" aria-label="예약상태">' + statusOpt + '</select> <span class="demo_muted">바꾼 뒤 위의 [저장] 을 누르세요</span>',
				'담당자', '<select id="e_manager" aria-label="담당자">' + mgrOpt + '</select>']
		]);
		// 2. 입금
		html += '<h2 class="mt30"><span class="bl">■</span>입금 처리</h2>' + kv([
			['판매액', '<strong>' + Mock.won(r.amount) + '</strong>', '입금액(누계)', '<strong class="c_blue" id="e_paid">' + Mock.won(r.paid || 0) + '</strong> <span class="demo_muted">(' + esc(TourRes.payState(r)) + ')</span>'],
			['미납액', '<strong class="' + (unpaid > 0 ? 'c_red' : '') + '" id="e_unpaid">' + Mock.won(Math.max(0, unpaid)) + '</strong>' + (unpaid < 0 ? ' <span class="c_blue">(과입금 ' + Mock.won(-unpaid) + ')</span>' : ''),
				'결제수단', esc(r.payMethod) + (r.depositor ? ' <span class="demo_muted">(입금자 ' + esc(r.depositor) + ')</span>' : '')],
			['입금 등록', '<span class="demo_inline">' +
				'<input type="text" id="e_dep_amt" class="input_text demo_num" style="width:120px;" placeholder="입금액" aria-label="입금액" inputmode="numeric"> 원 ' +
				'<a href="javascript:;" class="Table_btn" id="e_dep_full">미납액 전액</a> ' +
				'<select id="e_dep_method" aria-label="입금방법"><option>무통장</option><option>카드</option><option>현금</option></select> ' +
				'<input type="text" id="e_dep_date" class="cal_input" value="' + Mock.rel(0) + '" readonly aria-label="입금일" onclick="AjaxCal(this,event,{});"> ' +
				'<a href="javascript:;" class="Table_btn blue2" id="e_dep_go">입금처리</a></span>' +
				'<p class="demo_muted mt5" id="e_dep_preview">입금액을 넣으면 처리 후 미납액을 미리 보여 드려요.</p>' +
				'<label class="demo_muted"><input type="checkbox" id="e_dep_auto" checked> 완납되면 예약상태를 \'입금완료\' 로 바꾸기 (예약접수·예약확정·계약금입금일 때)</label>']
		]);
		if ((r.deposits || []).length) {
			html += '<table width="100%" class="t_list mt10"><thead><tr><th>입금 일시</th><th>입금일</th><th>방법</th><th>금액</th><th>처리자</th></tr></thead><tbody>' +
				r.deposits.map(function (d) { return '<tr><td>' + esc(d.at) + '</td><td>' + esc(d.date) + '</td><td>' + esc(d.method) + '</td><td class="txt_r">' + Mock.won(d.amount) + '</td><td>' + esc(d.by) + '</td></tr>'; }).join('') + '</tbody></table>';
		}
		// 3. 예약 정보
		html += '<h2 class="mt30"><span class="bl">■</span>예약 정보</h2>' + kv([
			['예약번호', esc(r.id), '예약접수일', esc(r.createdAt)],
			['예약경로', esc(r.channel) + (r.channel === '홈페이지' ? ' (' + (r.device === 'MO' ? '모바일웹' : '웹사이트') + ')' : '') + (r.agent ? ' · ' + esc(r.agent) : ''), '상품코드', esc(r.tourCode || r.tourId)],
			['상품명', '<strong>' + esc(r.tourTitle) + '</strong><br><span class="demo_muted">' + esc(r.evTitle || '') + '</span>'],
			['카테고리', esc(String(r.cate || '').split('>').filter(Boolean).join(' > ')) + (r.city ? ' / ' + esc(r.city) : '')],
			[hotel ? '체크인' : '출발일/출발편', T.ymdw(r.departDate) + ' ' + (hotel ? '' : T.flight(r.departFlight)), hotel ? '체크아웃' : '도착일/도착편', T.ymdw(r.returnDate) + ' ' + (hotel ? '' : T.flight(r.returnFlight))],
			['인원', esc(who), '단가', unitTxt],
			['요청사항', r.request ? esc(r.request) : '<span class="demo_muted">없음</span>']
		]);
		// 4. 예약자
		html += '<h2 class="mt30"><span class="bl">■</span>예약자</h2>' + kv([
			['이름', esc(r.customer.name) + (r.member ? ' <span class="c_blue">(회원 ' + esc(r.memberId) + ')</span>' : ' <span class="demo_muted">(비회원)</span>'), '휴대폰', esc(r.customer.phone)],
			['이메일', esc(r.customer.email), '마케팅 수신', r.marketing ? '동의' : '<span class="demo_muted">미동의</span>']
		]);
		// 5. 여행자
		html += '<h2 class="mt30"><span class="bl">■</span>' + (hotel ? '투숙객' : '여행자') + ' 명단</h2>' +
			'<table width="100%" class="t_list"><colgroup><col width="60"><col><col width="120"><col width="160"></colgroup><thead><tr><th>No</th><th>이름</th><th>구분</th><th>생년월일</th></tr></thead><tbody>' +
			r.travelers.map(function (t, i) { return '<tr><td>' + (i + 1) + '</td><td>' + esc(t.name) + '</td><td>' + esc(t.type) + '</td><td>' + (esc(t.birth) || '-') + '</td></tr>'; }).join('') + '</tbody></table>';
		// 6. 상담 메모
		html += '<h2 class="mt30"><span class="bl">■</span>상담 메모</h2>' +
			'<table width="100%" class="t_list" id="e_memos"><colgroup><col width="150"><col width="90"><col><col width="70"></colgroup><thead><tr><th>일시</th><th>작성자</th><th>내용</th><th>공개</th></tr></thead><tbody>' +
			((r.memos || []).slice().reverse().map(function (m) {
				return '<tr><td>' + esc(m.at) + '</td><td>' + esc(m.by) + '</td><td class="txt_l" style="padding-left:10px;">' + esc(m.text) + '</td><td>' + (m.public ? '고객' : '<span class="demo_muted">내부</span>') + '</td></tr>';
			}).join('') || '<tr class="demo_state_row"><td colspan="4">메모가 없습니다.</td></tr>') + '</tbody></table>' +
			'<div class="demo_memo_form"><textarea id="e_memo" rows="3" placeholder="상담 내용을 남겨 주세요 (예: 고객 통화 — 출발 3일 전 안내문자 요청)" aria-label="상담 메모" maxlength="500"></textarea>' +
			'<div><label class="demo_muted"><input type="checkbox" id="e_memo_public"> 고객 예약조회에 보이기</label> <a href="javascript:;" class="Tbtn gray" id="e_memo_add">메모 추가</a></div></div>';
		$body.html(html);
	}

	/* ---------- 입금 ---------- */
	function depAmount() { return parseInt(String($('#e_dep_amt').val() || '').replace(/[^\d]/g, ''), 10) || 0; }
	$body.on('input', '#e_dep_amt', function () {
		var n = depAmount();
		this.value = n ? Mock.num(n) : '';
		var after = R.amount - (R.paid || 0) - n;
		$('#e_dep_preview').html(n ? '처리 후 입금 누계 <b>' + Mock.won((R.paid || 0) + n) + '</b> · 미납 <b class="' + (after > 0 ? 'c_red' : '') + '">' + Mock.won(Math.max(0, after)) + '</b>' + (after < 0 ? ' <span class="c_blue">(과입금 ' + Mock.won(-after) + ')</span>' : '') : '입금액을 넣으면 처리 후 미납액을 미리 보여 드려요.');
	});
	$body.on('click', '#e_dep_full', function () {
		var u = Math.max(0, TourRes.unpaid(R));
		if (!u) { Mock.toast('미납액이 없어요'); return; }
		$('#e_dep_amt').val(u).trigger('input');
	});
	$body.on('click', '#e_dep_go', function () {
		var n = depAmount();
		if (!n) { Mock.toast('입금액을 입력해 주세요', { type: 'error' }); $('#e_dep_amt').focus(); return; }
		if (n > 100000000) { Mock.toast('입금액이 너무 커요', { type: 'error' }); return; }
		if (R.status === '취소완료') { Mock.toast('취소완료된 예약은 입금 처리할 수 없어요', { type: 'error' }); return; }
		var after = R.amount - (R.paid || 0) - n;
		if (after < 0 && !w.confirm('미납액보다 ' + Mock.won(-after) + ' 많아요. 과입금으로 처리할까요?')) return;
		var auto = $('#e_dep_auto').prop('checked'), method = $('#e_dep_method').val(), date = $('#e_dep_date').val();
		var $b = $(this).addClass('demo_busy');
		MockApi.update('tms.reservations', R.id, function (row) {
			T.applyDeposit(row, n, method, date);
			if (auto && row.paid >= row.amount && ['예약접수', '예약확정', '계약금입금'].indexOf(row.status) >= 0) T.applyStatus(row, '입금완료');
		}).then(function (row) {
			R = row;
			draw();
			T.notifyParent('saved', { id: R.id });
			Mock.toast(Mock.won(n) + ' 입금 처리했어요 (미납 ' + Mock.won(Math.max(0, TourRes.unpaid(R))) + ')', { type: 'success' });
		}, function (e) { $b.removeClass('demo_busy'); Mock.toast(e.message, { type: 'error' }); });
	});

	/* ---------- 메모 ---------- */
	$body.on('click', '#e_memo_add', function () {
		var text = $.trim($('#e_memo').val());
		if (!text) { Mock.toast('메모 내용을 입력해 주세요', { type: 'error' }); $('#e_memo').focus(); return; }
		var pub = $('#e_memo_public').prop('checked');
		MockApi.update('tms.reservations', R.id, function (row) {
			row.memos = (row.memos || []).concat([{ at: Mock.now(), by: T.admin, text: text, public: pub }]);
		}).then(function (row) {
			R = row; draw();
			T.notifyParent('saved', { id: R.id });
			Mock.toast('메모를 남겼어요', { type: 'success' });
		});
	});

	/* ---------- 저장 (상태·담당자) ---------- */
	var saving = false;
	$('#e_save').on('click', function () {
		if (!R || saving) return;
		// 입금액·메모를 적어 두고 [저장]만 누르면 조용히 사라지지 않도록 먼저 알려 준다
		if (depAmount()) { Mock.toast('입력한 입금액이 아직 처리되지 않았어요 — [입금처리] 를 먼저 눌러 주세요', { type: 'error' }); $('#e_dep_go').focus(); return; }
		if ($.trim($('#e_memo').val())) { Mock.toast('작성한 메모가 아직 남겨지지 않았어요 — [메모 추가] 를 먼저 눌러 주세요', { type: 'error' }); $('#e_memo_add').focus(); return; }
		var status = $('#e_status').val(), manager = $('#e_manager').val();
		if (status === R.status && manager === (R.manager || '')) { Mock.toast('바뀐 내용이 없어요'); return; }
		if (status === '취소완료' && R.status !== '취소완료' && !w.confirm('예약을 취소완료 처리할까요?' + (R.paid > 0 ? '\n입금액 ' + Mock.won(R.paid) + ' 은 환불 대기로 표시돼요.' : ''))) return;
		saving = true;
		var $b = $(this).text('저장 중…');
		MockApi.update('tms.reservations', R.id, function (row) {
			if (manager !== (row.manager || '')) {
				row.memos = (row.memos || []).concat([{ at: Mock.now(), by: T.admin, text: '담당자 ' + (manager ? '배정: ' + manager : '배정 해제') + (row.manager ? ' (이전: ' + row.manager + ')' : ''), public: false }]);
				row.manager = manager;
			}
			T.applyStatus(row, status);
		}).then(function (row) {
			saving = false;
			$b.text('저장');
			R = row; draw();
			T.notifyParent('saved', { id: R.id });
			Mock.toast('저장했어요 — 예약상태 ' + R.status, { type: 'success' });
		}, function (e) { saving = false; $b.text('저장'); Mock.toast(e.message, { type: 'error' }); });
	});

	// 다른 곳(목록 일괄처리·다른 탭)에서 바뀌면 다시 읽음
	MockDB.on('tms.reservations', function (src) { if (src !== 'local' && R) load(); });

	if (!id) { $body.html('<p class="demo_state_box">예약번호가 없습니다.</p>'); $('#e_save').hide(); }
	else load();
})(window, jQuery);
