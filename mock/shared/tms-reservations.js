/*!
 * TMS 예약 가상 데이터 — TourOffice(B2C) 에서 예약하면 여기에 쌓이고, TMS 에서 상태·입금을 처리한다.
 *
 *  MockDB 컬렉션 : 'tms.reservations'
 *  전역 도우미   : window.TourRes  (예약상태·입금상태·잔여석 계산·예약번호 만들기)
 *
 *  ※ touroffice-tours.js 를 먼저 불러와야 합니다 (상품·출발일을 참조).
 *  ※ 원래 toadmin/main/good_res.html 에 하드코딩돼 있던 예약 19건을 옮긴 시드입니다.
 *     이름·연락처는 모두 가상(010-0000-xxxx, @example.com)으로 바꿨습니다.
 */
(function (w) {
	'use strict';

	var STATUS = ['예약접수', '예약확정', '계약금입금', '입금완료', '예약완료', '행사완료', '취소요청', '취소완료'];
	var CODE = { A: '예약접수', B: '예약확정', C: '계약금입금', D: '입금완료', E: '예약완료', F: '행사완료', G: '취소요청', H: '취소완료' };
	var COLOR = { '예약접수': '#999999', '예약확정': '#0066CC', '계약금입금': '#FF6600', '입금완료': '#FF0033', '예약완료': '#009933', '행사완료': '#333333', '취소요청': '#CC00CC', '취소완료': '#AAAAAA' };
	var MANAGERS = ['클릭', '투어테스트', '김상담', '이예약'];

	var COMPANIONS = ['김하윤', '이도현', '박서아', '최준우', '정다은', '강민서', '조은호', '윤지안', '장서진', '임도하', '한시은', '오태민'];

	function tourOf(id) { return MockDB.find('touroffice.tours', id); }

	/** 시드 예약 만들기 */
	function seed(o) {
		var t = tourOf(o.tour);
		var createdAt = Mock.rel(-o.ago, o.time);
		var pax = { adult: o.adult || 1, child: o.child || 0, infant: o.infant || 0 };
		var departDate, returnDate, unit;
		if (t.kind === 'hotel') {
			departDate = Mock.rel(o.depOff);
			returnDate = Mock.rel(o.depOff + o.nights);
			var room = t.rooms[o.room || 0];
			unit = { adult: 0, child: 0, infant: 0 };
		} else if (o.depOff != null) {
			departDate = Mock.rel(o.depOff);
			returnDate = Mock.rel(o.depOff + Math.max(0, t.days - 1));
			unit = { adult: t.price, child: Math.round(t.price * 0.8 / 100) * 100, infant: Math.round(t.price * 0.1 / 100) * 100 };
		} else {
			var d = t.deps[o.dep];
			departDate = d.date; returnDate = d.ret;
			unit = { adult: d.price, child: d.child, infant: d.infant };
		}
		var amount = t.kind === 'hotel' ? room.price * o.nights * (o.rooms || 1) : pax.adult * unit.adult + pax.child * unit.child + pax.infant * unit.infant;
		var travelers = [{ name: o.name, type: '성인', birth: o.birth || '' }];
		var k = o.no % COMPANIONS.length;
		for (var a = 1; a < pax.adult; a++) travelers.push({ name: COMPANIONS[(k + a) % COMPANIONS.length], type: '성인', birth: '' });
		for (var c = 0; c < pax.child; c++) travelers.push({ name: COMPANIONS[(k + 5 + c) % COMPANIONS.length], type: '아동', birth: '2016-0' + (c + 3) + '-14' });
		for (var f = 0; f < pax.infant; f++) travelers.push({ name: COMPANIONS[(k + 9 + f) % COMPANIONS.length], type: '유아', birth: '2024-08-0' + (f + 2) });
		if (t.kind === 'hotel') travelers = travelers.slice(0, Math.max(1, o.rooms || 1));
		var paid = o.paid === 'full' ? amount : (o.paid || 0);
		var memos = [{ at: createdAt, by: '시스템', text: (o.channel || '홈페이지') + ' 예약 접수 (' + (o.pay || '무통장') + ')' }];
		(o.memos || []).forEach(function (m) { memos.push({ at: Mock.rel(-m[0], m[1]), by: m[2], text: m[3] }); });
		return {
			id: 'R' + Mock.date(createdAt, 'YYMMDD') + String(o.no),
			createdAt: createdAt,
			status: o.status,
			channel: o.channel || '홈페이지',
			device: o.device || 'PC',
			agent: o.agent || '',
			payMethod: o.pay || '무통장',
			member: !!o.member,
			memberId: o.member ? 'user' + o.no : '',
			customer: { name: o.name, phone: '010-0000-' + o.no, email: 'user' + o.no + '@example.com' },
			pax: pax,
			travelers: travelers,
			kind: t.kind,
			tourId: t.id, tourTitle: t.title, evTitle: t.evTitle, tourCode: t.code,
			cate: t.cate, countryCode: t.countryCode, city: t.city,
			departDate: departDate, returnDate: returnDate,
			departFlight: t.flight ? { airline: t.flight.airline, no: t.flight.go } : { airline: '', no: '' },
			returnFlight: t.flight ? { airline: t.flight.airline, no: t.flight.back } : { airline: '', no: '' },
			hotel: t.kind === 'hotel' ? { room: room.name, nights: o.nights, rooms: o.rooms || 1, unit: room.price } : null,
			unit: unit,
			amount: amount,
			paid: paid,
			depositor: o.pay === '카드' ? '' : o.name,
			request: o.request || '',
			manager: o.manager || '',
			memos: memos,
			site: 'touroffice'
		};
	}

	var ROWS = [
		seed({ no: 1001, ago: 1, time: '11:38:03', tour: 1005, dep: 1, adult: 2, status: '예약접수', manager: '클릭', name: '김민준', request: '창가 좌석 희망합니다.' }),
		seed({ no: 1002, ago: 2, time: '14:06:02', tour: 1003, dep: 0, adult: 1, status: '계약금입금', paid: 50000, manager: '클릭', name: '이서연', member: true,
			memos: [[1, '10:20:00', '클릭', '계약금 50,000원 입금 확인. 잔금은 출발 3일 전까지 안내.']] }),
		seed({ no: 1003, ago: 2, time: '14:05:45', tour: 1002, dep: 0, adult: 1, status: '예약확정', paid: 19900, manager: '클릭', name: '박지훈', member: true }),
		seed({ no: 1004, ago: 3, time: '15:16:46', tour: 1002, dep: 1, adult: 2, child: 1, status: '예약접수', manager: '투어테스트', name: '최수아', channel: '전화' }),
		seed({ no: 1005, ago: 3, time: '15:14:38', tour: 1002, dep: 2, adult: 3, status: '입금완료', paid: 'full', manager: '투어테스트', name: '정우진', device: 'MO' }),
		seed({ no: 1006, ago: 5, time: '14:55:03', tour: 1002, dep: 3, adult: 1, status: '예약완료', paid: 'full', manager: '투어테스트', name: '한지민', channel: '방문', pay: '카드' }),
		seed({ no: 1007, ago: 8, time: '11:05:21', tour: 1003, dep: 1, adult: 1, status: '예약완료', paid: 'full', manager: '클릭', name: '윤서준', pay: '카드', member: true }),
		seed({ no: 1008, ago: 8, time: '11:05:01', tour: 1004, depOff: -2, adult: 1, status: '행사완료', paid: 'full', manager: '클릭', name: '강하은' }),
		seed({ no: 1009, ago: 8, time: '11:04:30', tour: 1002, depOff: -1, adult: 1, status: '행사완료', paid: 'full', manager: '투어테스트', name: '조예준', device: 'MO' }),
		seed({ no: 1010, ago: 10, time: '09:19:55', tour: 1003, dep: 0, adult: 9, status: '예약확정', manager: '클릭', name: '임채원', channel: '제휴사', agent: '여행나라(제휴)',
			memos: [[9, '16:40:00', '클릭', '동호회 단체 9명. 버스 앞좌석 배정 요청.']] }),
		seed({ no: 1011, ago: 12, time: '13:31:59', tour: 1016, dep: 4, adult: 1, status: '취소요청', paid: 'full', manager: '클릭', name: '오지호', pay: '카드',
			memos: [[1, '09:12:00', '고객', '일정 변경으로 취소를 요청합니다.']] }),
		seed({ no: 1012, ago: 14, time: '16:18:00', tour: 1014, dep: 3, adult: 1, status: '취소완료', manager: '클릭', name: '신유나', channel: '전화',
			memos: [[13, '11:00:00', '클릭', '고객 요청으로 취소 처리 (미입금).']] }),
		seed({ no: 1013, ago: 18, time: '11:21:23', tour: 1003, depOff: -10, adult: 1, status: '행사완료', paid: 'full', manager: '클릭', name: '권도윤' }),
		seed({ no: 1014, ago: 18, time: '11:21:09', tour: 1002, dep: 5, adult: 1, status: '예약확정', paid: 19900, manager: '투어테스트', name: '황시우' }),
		seed({ no: 1015, ago: 18, time: '10:58:48', tour: 1003, dep: 2, adult: 1, status: '예약확정', paid: 10000, manager: '클릭', name: '송지아', member: true }),
		seed({ no: 1016, ago: 18, time: '10:58:29', tour: 1002, dep: 6, adult: 1, status: '예약접수', paid: 19900, manager: '투어테스트', name: '안주원' }),
		seed({ no: 1017, ago: 18, time: '10:53:37', tour: 1003, dep: 3, adult: 1, status: '입금완료', paid: 'full', manager: '클릭', name: '류하린', pay: '카드' }),
		seed({ no: 1018, ago: 18, time: '10:53:19', tour: 1002, dep: 7, adult: 1, status: '예약완료', paid: 'full', manager: '투어테스트', name: '전은우', member: true }),
		seed({ no: 1019, ago: 26, time: '14:46:59', tour: 1002, depOff: -20, adult: 1, status: '행사완료', paid: 'full', manager: '투어테스트', name: '홍다인' }),
		// 숙소 예약 (대시보드 '호텔' 칸 확인용)
		seed({ no: 1020, ago: 4, time: '20:11:42', tour: 1019, depOff: 9, nights: 2, room: 0, adult: 2, status: '예약확정', paid: 'full', pay: '카드', manager: '김상담', name: '문태오', device: 'MO' }),
		seed({ no: 1021, ago: 6, time: '09:47:15', tour: 1021, depOff: 15, nights: 1, room: 1, adult: 2, status: '예약접수', manager: '', name: '배수빈' })
	];

	MockDB.define('tms.reservations', ROWS, { version: '1' });

	/* ---------- 도우미 ---------- */
	function payState(r) {
		var paid = Number(r.paid) || 0, amt = Number(r.amount) || 0;
		if (paid <= 0) return '미입금';
		if (paid < amt) return '부분입금';
		if (paid === amt) return '입금완료';
		return '과입금';
	}

	w.TourRes = {
		STATUS: STATUS,
		CODE: CODE,
		COLOR: COLOR,
		MANAGERS: MANAGERS,
		/** 진행 단계 (취소 제외) */
		STEPS: ['예약접수', '예약확정', '입금완료', '예약완료', '행사완료'],
		codeOf: function (status) { for (var k in CODE) if (CODE[k] === status) return k; return ''; },
		unpaid: function (r) { return (Number(r.amount) || 0) - (Number(r.paid) || 0); },
		payState: payState,
		paxTotal: function (r) { return (r.pax.adult || 0) + (r.pax.child || 0) + (r.pax.infant || 0); },
		isCanceled: function (r) { return r.status === '취소완료'; },
		/** 이 출발일에 이미 잡힌 좌석 수 (유아 제외, 취소완료 제외) */
		bookedPax: function (tourId, date) {
			return MockDB.where('tms.reservations', function (r) {
				return String(r.tourId) === String(tourId) && r.departDate === date && r.status !== '취소완료';
			}).reduce(function (s, r) { return s + (r.pax.adult || 0) + (r.pax.child || 0); }, 0);
		},
		/** 출발일의 잔여석·상태 */
		seatInfo: function (tour, dep) {
			var left = Math.max(0, dep.seats - dep.sold - w.TourRes.bookedPax(tour.id, dep.date));
			var booked = dep.seats - left;
			var state = dep.closed || left <= 0 ? '마감' : (dep.confirmed || booked >= dep.min) ? '출발확정' : '예약가능';
			return { left: left, booked: booked, state: state };
		},
		/** R + YYMMDD + 4자리 (겹치지 않게) */
		newId: function () {
			var id, n = 0;
			do { id = Mock.uid('R'); n++; } while (MockDB.find('tms.reservations', id) && n < 50);
			return id;
		}
	};
})(window);
