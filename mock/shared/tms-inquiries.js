/*!
 * 상담 문의 가상 데이터 — TourOffice 고객센터(site/contact.html) 문의가 여기에 쌓이고,
 * TMS 대시보드의 '예약관리 상담기록'·'상담/예약현황' 에 나타난다.
 *
 *  MockDB 컬렉션 : 'tms.inquiries'
 *  { id:'Q2611250001', createdAt, kind:'여행'|'호텔', status:'접수'|'답변완료', name, phone, email,
 *    tourId, tourTitle, wishDate, pax, content, notifyDate, answer, site:'touroffice' }
 */
(function () {
	'use strict';

	function q(no, ago, time, kind, name, tourId, tourTitle, wishOff, pax, content, status, answer) {
		var createdAt = Mock.rel(-ago, time);
		return {
			id: 'Q' + Mock.date(createdAt, 'YYMMDD') + String(no),
			createdAt: createdAt,
			kind: kind,
			status: status || '접수',
			name: name,
			phone: '010-0000-' + no,
			email: 'ask' + no + '@example.com',
			tourId: tourId || '',
			tourTitle: tourTitle || '',
			wishDate: wishOff == null ? '' : Mock.rel(wishOff),
			pax: pax || 0,
			content: content,
			notifyDate: Mock.rel(-ago + 1),
			answer: answer || '',
			site: 'touroffice'
		};
	}

	MockDB.define('tms.inquiries', [
		q(2001, 0, '09:42:10', '여행', '서하준', 1005, '[선착순+좌석확보](싱글팩)스페인 일주 9일-QR', 26, 2, '스페인 일주 9일 상품 싱글차지가 얼마인지 궁금합니다. 혼자 참여해도 되나요?'),
		q(2002, 1, '16:05:33', '호텔', '유가은', 1020, '씨에스 호텔 앤 리조트', 20, 2, '초가 스위트 2박 요금 문의드립니다. 조식 포함 여부도 알려 주세요.'),
		q(2003, 1, '10:12:48', '여행', '남도윤', 1001, '[대구출발] 제주도 3대특식 3박4일 흑돼지+제주갈치+회정식', 13, 4, '4인 가족(초등학생 2명)인데 아동 요금이 따로 있나요?', '답변완료', '아동은 성인 요금의 80%입니다. 상담원이 전화드렸습니다.'),
		q(2004, 2, '13:30:02', '여행', '백서윤', 1015, '[대구출발] 부산 당일 버스투어', 6, 12, '회사 워크숍으로 12명 단체 예약하려고 합니다. 단체 할인 가능할까요?'),
		q(2005, 4, '11:08:57', '여행', '노지율', 1011, '[1박3일] 첫번째 자유여행으로 제주도 완전정복 >_<', 9, 2, '렌터카 차종을 업그레이드할 수 있나요?', '답변완료', '중형 → SUV 업그레이드는 1일 2만원 추가입니다.'),
		q(2006, 5, '18:44:21', '호텔', '심예린', 1022, '포 시즌스 호텔', 45, 2, '허니문으로 3박 예정입니다. 가든뷰 객실 가능 여부 문의드려요.'),
		q(2007, 6, '15:20:14', '여행', '탁건우', 1012, '홍도/흑산도 1박2일', 15, 3, '배 멀미가 심한데 일정 중 배 타는 시간이 얼마나 되나요?', '답변완료', '목포-흑산도 약 2시간, 흑산도-홍도 약 30분입니다.'),
		q(2008, 9, '10:03:39', '여행', '국하람', '', '', null, 0, '여행자보험 보장 내용을 자세히 알고 싶습니다.', '답변완료', '보장 내용 안내 메일을 보내드렸습니다.')
	], { version: '1' });
})();
