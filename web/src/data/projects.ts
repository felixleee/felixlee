/**
 * 포트폴리오 프로젝트 데이터 — 카드·필터·히어로 숫자·상세 페이지가 모두 여기서 만들어진다.
 * 새 프로젝트는 이 배열에 하나 추가하면 끝. (최신순으로 둘 것)
 * 경로(thumb, demo, shots)는 저장소 루트 기준이며 화면에서 asset() 으로 바꿔 쓴다.
 */

export type FilterKey = 'demo' | 'dev' | 'responsive' | 'adaptive' | 'admin';

export interface CaseStudy {
	/** 어떤 상황에서 시작된 프로젝트인지 */
	background: string[];
	/** 내가 맡아서 한 일 */
	did: string[];
	/** 데모에서 직접 따라 해 볼 수 있는 흐름 */
	flow?: {
		steps: string[];
		links: { label: string; href: string }[];
		note?: string;
	};
	/** 데모 화면 캡처 (web/public/case/ 아래) */
	shots?: { src: string; caption: string }[];
}

export interface Project {
	slug: string;
	title: string;
	/** YYYY.MM */
	date: string;
	category: string;
	format: '반응형' | '적응형' | 'PC';
	stack?: string;
	/** 카드에 보이는 한 줄 포인트 */
	point: string;
	/** 카드에 보이는 역할 태그 */
	roles: string[];
	tags: FilterKey[];
	thumb: string;
	live?: string;
	demo?: string;
	/** 상세 페이지 소개 문단 */
	description: string;
	caseStudy?: CaseStudy;
}

export const FILTERS: { key: FilterKey | 'all'; label: string }[] = [
	{ key: 'all', label: '전체' },
	{ key: 'demo', label: '데모 체험' },
	{ key: 'dev', label: '프런트 개발' },
	{ key: 'responsive', label: '반응형' },
	{ key: 'adaptive', label: '적응형' },
	{ key: 'admin', label: '관리자' }
];

export const projects: Project[] = [
	{
		slug: 'airbike',
		title: '에어바이크',
		date: '2024.08',
		category: '자전거 라이딩 플랫폼',
		format: '반응형',
		stack: 'Vue.js',
		point: '운영 중인 라이딩 플랫폼의 UI/UX를 다시 정리하고 Vue.js로 프런트를 개발했어요.',
		roles: ['UI/UX 재정리', '퍼블리싱', 'Vue.js 개발'],
		tags: ['dev', 'responsive'],
		thumb: 'img/airbike.jpg',
		live: 'https://airbike.tours',
		description: '자전거 라이딩 플랫폼이에요. Vue.js로 개발된 프로젝트로, 서비스의 UI/UX를 다시 정리하고 퍼블리싱을 포함한 프런트 개발을 맡았어요.'
	},
	{
		slug: 'bs-uhak',
		title: 'BS유학',
		date: '2023.05',
		category: '어학연수 플랫폼',
		format: '반응형',
		stack: 'Next.js',
		point: '어학연수 플랫폼을 UI/UX 디자인부터 Next.js 프런트 개발까지 맡았어요.',
		roles: ['UI/UX 디자인', '퍼블리싱', 'Next.js 개발'],
		tags: ['dev', 'responsive'],
		thumb: 'img/bs_uhak.jpg',
		live: 'https://www.bs-uhak.com',
		description: '어학연수 플랫폼 프로젝트예요. Next.js로 개발했고, UI/UX 디자인부터 퍼블리싱을 포함한 프런트 개발까지 맡았어요.'
	},
	{
		slug: 'woojoo',
		title: 'Woojoo',
		date: '2023.03',
		category: '유학원 프로그램 소개',
		format: '반응형',
		stack: 'Next.js',
		point: '유학원 프로그램 소개 사이트 전체를 디자인하고 Next.js로 개발했어요.',
		roles: ['전체 디자인', 'Next.js 개발'],
		tags: ['dev', 'responsive'],
		thumb: 'img/woojoo.jpg',
		live: 'https://www.woo-joo.com',
		description: '유학원의 프로그램을 소개하는 사이트예요. Next.js로 개발했고, 사이트 전체의 디자인과 프런트 개발을 맡았어요.'
	},
	{
		slug: 'stx-engine',
		title: 'STX Engine 정비시스템',
		date: '2023.02',
		category: '국가과제 · 관리자',
		format: 'PC',
		point: '종이 문서로 하던 엔진 정비 기록을 웹 관리 화면으로 옮겼어요. 창원 STX엔진에 7개월 상주했어요.',
		roles: ['전체 디자인', '퍼블리싱', '7개월 상주'],
		tags: ['demo', 'admin'],
		thumb: 'img/stx.jpg',
		demo: 'stxadmin/index.html',
		description: 'STX엔진의 기존 아날로그식 문서 처리 방식을 대체하고자 발주된 프로젝트예요. 국가과제로 선정되어 창원에 있는 STX엔진에 7개월가량 상주하며 진행했고, 전체 디자인과 퍼블리싱을 맡았어요.',
		caseStudy: {
			background: [
				'엔진 정비(오버홀) 과정에서 오가는 입고·이력·품질 문서를 종이로 관리하던 것을 웹 시스템으로 옮기는 프로젝트였어요.',
				'국가과제로 선정되어, 현장과 바로 소통할 수 있도록 창원의 STX엔진에 7개월가량 상주하며 진행했어요.'
			],
			did: [
				'관리자 화면 전체의 UI 디자인',
				'모든 화면의 퍼블리싱 (HTML · CSS · jQuery)',
				'입고정보 · 이력관리 · 품질문서 · 긴급일정 · 소요율 집계 화면 구성'
			],
			flow: {
				steps: [
					'입고정보 조회에서 기종 · 함명 · 입고일로 검색해요',
					'행을 눌러 상세를 보고, 변경 화면에서 고쳐 저장하면 목록에 바로 반영돼요',
					'이력관리에서 엔진을 골라 영업 · 생산 · 품질 정보와 성적서를 확인해요',
					'소요율 집계에서 품번별 평균 소요율 차트를 봐요'
				],
				links: [
					{ label: '관리자 메인', href: 'stxadmin/index.html' },
					{ label: '입고정보 조회', href: 'stxadmin/display/wh_view.html' },
					{ label: '이력관리', href: 'stxadmin/display/record.html' }
				],
				note: '데모의 함명 · 인명 · 수치는 모두 가상 데이터예요. 바꾼 내용은 이 브라우저에만 저장되고, 왼쪽 아래 [초기화]로 되돌릴 수 있어요.'
			},
			shots: [
				{ src: 'case/stx-main.jpg', caption: '메인 — 즐겨찾기 · 공지 · 긴급일정 · 최근 입고 현황' },
				{ src: 'case/stx-wh-view.jpg', caption: '입고정보 조회 — 검색 · 진행 단계 · 페이징' },
				{ src: 'case/stx-record.jpg', caption: '이력관리 — 엔진별 영업 · 생산 · 품질 정보' },
				{ src: 'case/stx-quality.jpg', caption: '소요율 집계 — 품번별 평균 소요율' }
			]
		}
	},
	{
		slug: 'cielpia',
		title: 'Cielpia',
		date: '2022.05',
		category: '유아 · 부모 강의 플랫폼',
		format: '반응형',
		point: '유치원생과 부모를 위한 강의 플랫폼이에요. 클라이언트 디자이너 시안에 피드백하며 전체를 퍼블리싱했어요.',
		roles: ['시안 피드백', '전체 퍼블리싱'],
		tags: ['demo', 'responsive'],
		thumb: 'img/ciel.jpg',
		live: 'https://www.cielpia.com/',
		demo: 'cielpia/main/pure_main.html',
		description: '유치원생과 부모님을 대상으로 여러 강의를 제공하는 플랫폼형 사이트예요. 클라이언트 측에 디자이너가 있어, 전달받은 시안에 대한 피드백과 전체 퍼블리싱을 맡았어요.'
	},
	{
		slug: 'vipevent',
		title: 'VIPEVENT 투어',
		date: '2021.12',
		category: '해외 박람회 전문 여행사',
		format: '반응형',
		point: 'TourOffice 반응형 기본형을 해외 박람회 전문 사이트로 맞춤 개발하고, 이후 유지보수도 맡았어요.',
		roles: ['맞춤 개발', '퍼블리싱', '유지보수'],
		tags: ['responsive'],
		thumb: 'img/vipevent.jpg',
		live: 'http://www.vipevent.co.kr/',
		description: '해외 박람회를 전문으로 하는 여행사 사이트예요. TourOffice 반응형 기본형을 바탕으로, 박람회를 전문으로 하려는 클라이언트의 요구를 반영해 개발했고 이후 유지보수를 맡았어요.'
	},
	{
		slug: 'athometrip',
		title: 'AthomeTrip',
		date: '2021.09',
		category: '미국 전문 여행사 리뉴얼',
		format: '반응형',
		point: '클라이언트 디자이너와 시안을 정한 뒤, 퍼블리싱은 혼자 끝까지 진행했어요.',
		roles: ['디자이너 협업', '퍼블리싱 단독'],
		tags: ['demo', 'responsive'],
		thumb: 'img/athome.jpg',
		live: 'https://athometrip2.clickis.kr/',
		demo: 'athome/main/pure_main.html',
		description: '미국 전문 여행사 사이트의 리뉴얼 프로젝트예요. 클라이언트 측 디자이너와 협업해 시안을 결정한 뒤, 퍼블리싱은 단독으로 진행했어요.'
	},
	{
		slug: 'hidden-cliff',
		title: 'Hidden Cliff',
		date: '2021.05',
		category: '제주 호텔 공식 · 예약 사이트',
		format: '적응형',
		point: '호텔 공식 사이트의 메인 · 상세를 리뉴얼하고, 오픈 후 배너와 유지보수를 맡았어요.',
		roles: ['리뉴얼 퍼블리싱', '배너 제작', '유지보수'],
		tags: ['adaptive'],
		thumb: 'img/hiddencliff.jpg',
		live: 'https://www.hiddencliff.kr/',
		description: '제주도에 있는 호텔의 공식 · 예약 사이트예요. 메인과 상세 페이지 리뉴얼 작업을 했고, 완료 후 배너와 유지보수 일체를 맡았어요.'
	},
	{
		slug: 'rothem',
		title: '로뎀투어',
		date: '2021.05',
		category: '성지순례 전문 여행사',
		format: '적응형',
		point: '운영 중인 사이트의 전체 레이아웃을 리뉴얼하고, 이후 유지보수를 맡았어요.',
		roles: ['레이아웃 리뉴얼', '퍼블리싱', '유지보수'],
		tags: ['demo', 'adaptive'],
		thumb: 'img/rothem.jpg',
		live: 'http://www.rothemtour.co.kr/',
		demo: 'rothem/main/pure_main.html',
		description: '해외 성지순례 전문 여행사 사이트예요. 서비스 중인 사이트의 전반적인 레이아웃 리뉴얼 퍼블리싱과 그 후 유지보수를 맡았어요.'
	},
	{
		slug: 'treksta',
		title: 'Treksta',
		date: '2021.02',
		category: '아웃도어 브랜드 쇼핑몰',
		format: '적응형',
		point: '메인 · 상세를 리뉴얼하며 프런트 기능을 개발하고, 이벤트 페이지 제작까지 이어서 맡았어요.',
		roles: ['리뉴얼', '프런트 기능 개발', '이벤트 페이지'],
		tags: ['adaptive'],
		thumb: 'img/treksta.jpg',
		live: 'https://www.treksta.co.kr/',
		description: '아웃도어 브랜드의 공식 쇼핑몰이에요. 메인과 상세 페이지 리뉴얼, 프런트 기능 개발을 했고, 이후 배너와 이벤트 페이지 제작 등 유지보수를 맡았어요.'
	},
	{
		slug: 'touroffice-tms',
		title: 'TourOffice TMS',
		date: '2021.01',
		category: '여행사 운영자용 관리자',
		format: 'PC',
		point: '여행사 운영자가 쓰는 예약관리 시스템을 리뉴얼했어요. 예약 처리 흐름을 데모로 직접 해 볼 수 있어요.',
		roles: ['리뉴얼 디자인', '퍼블리싱'],
		tags: ['demo', 'admin'],
		thumb: 'img/toadmin.jpg',
		demo: 'toadmin/main/pure_main.html',
		description: 'TourOffice의 여행관리 시스템(TMS)으로, 업체와 계약한 여행사 운영자 전용 관리자(Admin) 페이지예요. 리뉴얼 디자인과 퍼블리싱을 맡았어요.',
		caseStudy: {
			background: [
				'TourOffice는 여행사용 홈페이지 솔루션이고, TMS는 그 솔루션을 쓰는 여행사 운영자가 상품 · 예약 · 회원을 관리하는 관리자 시스템이에요.',
				'기존 관리자 화면을 리뉴얼하는 프로젝트로, 디자인 리뉴얼과 퍼블리싱을 맡았어요.'
			],
			did: [
				'관리자 화면 리뉴얼 디자인',
				'대시보드 · 예약관리 등 관리자 화면 퍼블리싱'
			],
			flow: {
				steps: [
					'TourOffice 고객 화면에서 상품을 고르고 출발일 · 인원을 정해 예약해요',
					'TMS 예약관리 맨 위에 새 예약이 \'예약접수\'로 들어와요',
					'예약 상세 창에서 예약확정 · 입금 처리 · 담당자 배정을 해요',
					'고객 예약조회에서 바뀐 상태와 남은 금액을 확인해요'
				],
				links: [
					{ label: '고객 화면에서 예약', href: 'touroffice/main/pure_main.html' },
					{ label: 'TMS 예약관리', href: 'toadmin/main/good_res.html' },
					{ label: '고객 예약조회', href: 'touroffice/mypage/res_check.html' }
				],
				note: '데모의 예약자 · 연락처 · 금액은 모두 가상 데이터예요. 고객 화면과 관리자 화면을 다른 탭으로 열어 두면, 예약하는 즉시 관리자 목록이 갱신돼요.'
			},
			shots: [
				{ src: 'case/to-detail.jpg', caption: '고객 화면 — 출발일 · 인원 선택과 금액 계산' },
				{ src: 'case/tms-list.jpg', caption: 'TMS 예약관리 — 검색 · 상태 · 미납액' },
				{ src: 'case/tms-edit.jpg', caption: '예약 상세 — 상태 변경 · 입금 처리 · 메모' },
				{ src: 'case/tms-dashboard.jpg', caption: 'TMS 대시보드 — 상담 기록 · 출발 일정' }
			]
		}
	},
	{
		slug: 'tourboss',
		title: '여행대장',
		date: '2020.10',
		category: '국내여행 전문 여행사',
		format: '적응형',
		point: '메인 · 상세를 퍼블리싱하고, 오픈 후 추가 기능 개발 등 프런트 유지보수를 맡았어요.',
		roles: ['퍼블리싱', '추가 기능 개발', '유지보수'],
		tags: ['adaptive'],
		thumb: 'img/tourboss.jpg',
		live: 'https://www.tourboss.co.kr/',
		description: '국내여행 전문 여행사 사이트예요. 메인과 상세 페이지 퍼블리싱을 진행했고, 완료 후 추가 기능 개발 등 프런트 유지보수를 맡았어요.'
	},
	{
		slug: 'touroffice',
		title: 'TourOffice 기본형',
		date: '2020.08',
		category: '여행사 홈페이지 솔루션',
		format: '반응형',
		point: '여행사 솔루션 기본형을 반응형으로 리뉴얼하며 디자인과 퍼블리싱을 모두 맡았어요.',
		roles: ['전체 디자인', '반응형 퍼블리싱'],
		tags: ['demo', 'responsive'],
		thumb: 'img/touroffice.jpg',
		live: 'https://tour39sky.touroffice.co.kr/',
		demo: 'touroffice/main/pure_main.html',
		description: 'TourOffice 솔루션의 기본형을 반응형으로 리뉴얼한 프로젝트예요. 전체 디자인과 퍼블리싱을 맡았어요. 데모에서는 상품 목록 · 상세 · 예약을 해 보고, 그 예약을 TourOffice TMS 관리자 화면에서 처리할 수 있어요.'
	},
	{
		slug: 'monami',
		title: 'Monami France',
		date: '2020.06',
		category: '프랑스 현지투어 여행사',
		format: '적응형',
		point: '디자이너 시안에 피드백하며 퍼블리싱하고, 서비스 오픈 후 유지보수까지 맡았어요.',
		roles: ['시안 피드백', '퍼블리싱', '유지보수'],
		tags: ['demo', 'adaptive'],
		thumb: 'img/monami.jpg',
		live: 'https://monamifrance.com/',
		demo: 'monami/main/pure_main.html',
		description: '프랑스 전문 여행사 사이트예요. 클라이언트 측 디자이너의 시안을 받아 피드백과 퍼블리싱을 진행했고, 서비스 시작 후 유지보수도 맡았어요.'
	},
	{
		slug: 'songdo-cablecar',
		title: '부산 송도케이블카',
		date: '2020.04',
		category: '케이블카 공식 사이트',
		format: '반응형',
		point: '부산 송도 케이블카 공식 사이트의 배너를 디자인하고 퍼블리싱했어요.',
		roles: ['배너 디자인', '퍼블리싱'],
		tags: ['responsive'],
		thumb: 'img/songdo.jpg',
		live: 'http://busanaircruise.co.kr/main/main.html',
		description: '부산 송도에 있는 케이블카의 공식 사이트예요. 배너 디자인과 퍼블리싱을 맡았어요.'
	},
	{
		slug: 'mycultureis',
		title: 'MyCultureis',
		date: '2020.03',
		category: '원데이 클래스 예약',
		format: '반응형',
		point: '세계 요리부터 한국 전통문화까지, 클래스 예약 사이트의 레이아웃을 디자인하고 퍼블리싱했어요.',
		roles: ['레이아웃 디자인', '퍼블리싱', '유지보수'],
		tags: ['demo', 'responsive'],
		thumb: 'img/myculture.jpg',
		live: 'https://kor.mycultureis.com/',
		demo: 'myculture/main/pure_main.html',
		description: '세계 각국 요리부터 한국 전통문화까지 클래스를 예약하는 사이트예요. 레이아웃 디자인과 퍼블리싱에 참여해 완성했고, 유지보수까지 맡았어요.'
	},
	{
		slug: 'ryokanclub',
		title: '료칸클럽',
		date: '2020.03',
		category: '일본 료칸 여행사',
		format: '반응형',
		point: '이전 작업자의 작업을 이어받아 전체 퍼블리싱을 마무리하고, 이후 유지보수를 맡았어요.',
		roles: ['작업 인수', '퍼블리싱', '유지보수'],
		tags: ['responsive'],
		thumb: 'img/ryokan.jpg',
		live: 'https://www.ryokanclub.com/',
		description: '일본 료칸 여행 전문 여행사 사이트예요. 이전 작업자의 작업을 이어받아 전반적인 퍼블리싱을 맡았고, 완료 후 유지보수도 맡았어요.'
	}
];

export const findProject = (slug: string | undefined) => projects.find((p) => p.slug === slug);
export const countBy = (key: FilterKey | 'all') => (key === 'all' ? projects.length : projects.filter((p) => p.tags.includes(key)).length);
export const metaLine = (p: Project) => [p.category, p.format === 'PC' ? 'PC' : p.format, p.stack].filter(Boolean).join(' · ');
