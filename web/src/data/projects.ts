/**
 * 포트폴리오 프로젝트 데이터 — 카드·필터·히어로 숫자·상세 페이지가 모두 여기서 만들어진다.
 * 새 프로젝트는 이 배열에 하나 추가하면 끝. (최신순으로 둘 것)
 * 경로(thumb, demo, shots)는 저장소 루트 기준이며 화면에서 asset() 으로 바꿔 쓴다.
 */

export type FilterKey = 'demo' | 'side' | 'dev' | 'responsive' | 'adaptive' | 'admin';

export interface CaseStudy {
	/** 어떤 상황에서 시작된 프로젝트인지 */
	background: string[];
	/** 내가 맡아서 한 일 */
	did: string[];
	/** 데모에서 직접 따라 해 볼 수 있는 흐름 */
	flow?: {
		/** 섹션 제목 (기본: 데모로 직접 해 보기) */
		title?: string;
		steps: string[];
		links?: { label: string; href: string }[];
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
	format: '반응형' | '적응형' | 'PC' | '데스크톱 앱' | '웹앱';
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
	{ key: 'side', label: '개인 프로젝트' },
	{ key: 'dev', label: '프런트 개발' },
	{ key: 'responsive', label: '반응형' },
	{ key: 'adaptive', label: '적응형' },
	{ key: 'admin', label: '관리자' }
];

export const projects: Project[] = [
	{
		slug: 'mdeautify',
		title: 'MDeautify',
		date: '2026.07',
		category: '마크다운 → PDF 변환 앱',
		format: '데스크톱 앱',
		stack: 'JavaScript · Neutralino',
		point: '마크다운을 넣으면 표지 · 표 · 다이어그램까지 보고서처럼 정돈된 PDF로 바꿔 주는 오프라인 앱이에요.',
		roles: ['기획 · 디자인', '개발', 'exe 배포'],
		tags: ['side', 'dev'],
		thumb: 'img/mdeautify.jpg',
		description: '마크다운(.md) 문서를 페이지 단위로 정돈된 PDF로 바꿔 주는 데스크톱 앱이에요. 왼쪽에 원문, 오른쪽에 실제 PDF 모양을 나란히 보면서 테마 · 글꼴 · 여백 · 목차 · 머리말을 고르고, 인터넷 없이 exe 파일 하나로 동작해요.',
		caseStudy: {
			background: [
				'업무 문서를 마크다운으로 쓰는 일이 많은데, 그대로 PDF로 뽑으면 보고서처럼 보이지 않아 매번 손으로 다시 꾸며야 했어요.',
				'사내망이나 오프라인에서도 설치 없이 바로 쓸 수 있도록, 파일 하나로 끝나는 데스크톱 앱으로 만들었어요.'
			],
			did: [
				'기획 · UI 디자인 · 개발 · 빌드 · 배포를 직접 진행 (커밋 90여 개, v1.8 까지 릴리스)',
				'Paged.js 로 A4 페이지 나눔 미리보기 — 표지 · 자동 목차 · 머리말 · 바닥글 · 쪽 번호',
				'Mermaid 다이어그램 · KaTeX 수식 · 코드 구문 강조를 PDF에 그대로 담기',
				'여러 문서 탭 · 파일 탐색기 · 찾기 · 자동 저장 · 비정상 종료 복구',
				'설치된 Claude Code CLI 를 이용하는 AI 작성 도우미 — API 키를 앱에 저장하지 않는 구조',
				'폰트 · 라이브러리를 모두 넣은 단일 HTML / 단일 exe 빌드 스크립트'
			],
			flow: {
				title: '사용 흐름',
				steps: [
					'MDeautify.exe 를 실행해요 (설치 없음)',
					'.md 파일을 창에 끌어다 놓아요',
					'오른쪽 미리보기를 보며 PDF 설정에서 테마 · 글꼴 · 여백을 바꿔요',
					'[PDF 저장] 을 누르면 미리보기 그대로 PDF가 저장돼요'
				],
				note: '아래 화면 속 사용 안내서도 MDeautify 로 만든 문서예요.'
			},
			shots: [
				{ src: 'case/mdeautify-cover.jpg', caption: '원문과 PDF 미리보기 — 머리 정보로 표지를 자동으로 만들어요' },
				{ src: 'case/mdeautify-diagram.jpg', caption: 'Mermaid 다이어그램 · 섹션 배지 · 인용 상자' },
				{ src: 'case/mdeautify-settings.jpg', caption: 'PDF 설정 — 테마 색 · 글꼴 · 여백 · 목차 · 머리말' },
				{ src: 'case/mdeautify-ai.jpg', caption: 'AI 작성 도우미 패널 (브라우저에서는 모의 응답)' }
			]
		}
	},
	{
		slug: 'whoscoffee',
		title: 'WHOSCOFFEE',
		date: '2026.07',
		category: '커피 순번 알리미',
		format: '웹앱',
		stack: 'Cloudflare Workers · D1',
		point: '둘이 번갈아 커피를 살 때 다음 차례를 알려 주는 웹앱이에요. 화면부터 서버 · DB · 앱 창까지 직접 만들었어요.',
		roles: ['기획 · 디자인', '프런트 · 백엔드', '서버리스 배포'],
		tags: ['side', 'dev'],
		thumb: 'img/whoscoffee.jpg',
		live: 'https://whoscoffee.youn7084084.workers.dev',
		description: "동료와 번갈아 커피를 사는 '품앗이' 순번을 알려 주는 2인용 웹앱이에요. 날짜 계산 없이, 커피를 산 사람이 도장을 찍으면 차례가 상대에게 넘어가요. 브라우저로 바로 쓰거나 주소창 없는 데스크톱 앱 창으로 띄울 수 있어요.",
		caseStudy: {
			background: [
				'동료와 커피를 번갈아 사는데, 누구 차례인지 매번 헷갈려서 직접 만들었어요.',
				'처음엔 내 PC에서 도는 Node 서버였지만, PC를 켜 두지 않아도 되도록 Cloudflare Workers + D1 서버리스로 옮겼어요.'
			],
			did: [
				'프레임워크 없는 단일 파일 화면 (HTML · CSS · JS), 라이트 · 다크 테마',
				'Workers API 와 D1(SQLite) 스키마 설계 — 방 · 멤버 · 도장 · 세션 · 취소 요청',
				'4자리 PIN 으로 둘을 잇는 멀티룸, 기기가 바뀌어도 유지되는 사용자 키',
				'마지막 기록 취소는 상대가 승인해야 반영되는 승인제',
				'서버에 못 닿을 때 마지막 상태를 보여 주는 오프라인 캐시, PWA · 웹 푸시 알림',
				'C# + WebView2 로 주소창 없는 데스크톱 앱 창 (단일 exe)'
			],
			flow: {
				title: '직접 써 보기',
				steps: [
					'방을 만들면 4자리 PIN 이 나와요',
					'상대가 PIN 으로 들어오면 둘이 연결돼요',
					'커피를 산 사람이 [품앗이 수행] 도장을 찍으면 차례가 넘어가요',
					'지난 기록은 리스트나 달력으로 봐요'
				],
				links: [{ label: 'WHOSCOFFEE 열기', href: 'https://whoscoffee.youn7084084.workers.dev' }],
				note: '실제로 쓰고 있는 서비스예요. 아래 화면의 이름 · 기록은 가상 데이터예요.'
			},
			shots: [
				{ src: 'case/wc-turn.jpg', caption: '차례가 돌아오면 알려 주고, 도장을 찍으면 상대에게 넘어가요' },
				{ src: 'case/wc-history.jpg', caption: '달력으로 보는 기록 · 다크 모드' }
			]
		}
	},
	{
		slug: 'mdocify',
		title: 'MDocify',
		date: '2026.07',
		category: '마크다운 → Word 변환 앱',
		format: '데스크톱 앱',
		stack: 'JavaScript · docx.js',
		point: 'MDeautify 의 자매 앱이에요. 마크다운을 받는 사람이 고칠 수 있는 Word(.docx) 문서로 바꿔요.',
		roles: ['기획 · 디자인', '개발', 'exe 배포'],
		tags: ['side', 'dev'],
		thumb: 'img/mdocify.jpg',
		description: '마크다운(.md)을 Word(.docx)로 바꿔 주는 데스크톱 앱이에요. MDeautify 와 같은 화면 구조로, 왼쪽에서 편집하고 오른쪽에서 문서 모양을 확인한 뒤 .docx 로 저장해요.',
		caseStudy: {
			background: ['PDF 는 받는 쪽에서 고칠 수 없어서, 함께 수정해야 하는 문서는 Word 파일이 필요했어요.'],
			did: [
				'마크다운 → docx 변환기 작성 — 제목 · 표 · 목록 · 인용 · 코드 블록 스타일 연결',
				'Mermaid 다이어그램을 이미지로 바꿔 문서에 넣기',
				'MDeautify 와 편집기 · 탭 · 미리보기 · 자동 복구를 함께 쓰는 구조',
				'앱 안에서 새 버전을 알려 주는 업데이트 확인'
			],
			shots: [
				{ src: 'case/mdocify-cover.jpg', caption: '머리 정보로 만든 표지' },
				{ src: 'case/mdocify-body.jpg', caption: '본문 — 표 · 인용 · 코드 블록' }
			]
		}
	},
	{
		slug: 'mdhwpxify',
		title: 'MDhwpxify',
		date: '2026.07',
		category: '마크다운 → 한글(.hwpx) 변환 앱',
		format: '데스크톱 앱',
		stack: 'JavaScript · hwpxjs',
		point: '마크다운을 한글(.hwpx) 문서로 바꿔요. 보고서 · 매뉴얼 같은 공문서 양식을 골라 저장할 수 있어요.',
		roles: ['기획 · 디자인', '개발', 'exe 배포'],
		tags: ['side', 'dev'],
		thumb: 'img/mdhwpxify.jpg',
		description: '마크다운(.md)을 한글 문서(.hwpx)로 바꿔 주는 데스크톱 앱이에요. MDeautify(PDF) · MDocify(Word) 에 이은 세 번째 자매 앱으로, 한글 파일로 내야 하는 보고 문서를 위해 만들었어요.',
		caseStudy: {
			background: ['공공 · 사내 보고는 한글(.hwpx) 파일로 내야 할 때가 많아, 마크다운 원본 하나로 PDF · Word · 한글을 모두 만들 수 있게 했어요.'],
			did: [
				'hwpxjs 라이브러리를 브라우저용으로 묶어 넣고 마크다운 → hwpx 변환기 작성',
				'보고서 · 매뉴얼 등 공문서 양식 템플릿',
				'표지 · 머리말 · 바닥글 설정과 A4 미리보기'
			],
			shots: [
				{ src: 'case/mdhwpxify-cover.jpg', caption: '보고서 양식 표지' },
				{ src: 'case/mdhwpxify-body.jpg', caption: '본문 — 공문서 스타일 제목 · 표 · 목록' }
			]
		}
	},
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
export const metaLine = (p: Project) => [p.category, p.format, p.stack].filter(Boolean).join(' · ');
/** 상세 페이지 '형태' 칸 */
export const formatLabel = (p: Project) => {
	if (p.format === 'PC') return 'PC 전용';
	if (p.format === '반응형' || p.format === '적응형') return `${p.format} 웹`;
	if (p.format === '데스크톱 앱') return 'Windows 데스크톱 앱';
	return '웹 · 데스크톱 앱 창';
};
