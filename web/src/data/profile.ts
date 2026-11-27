/** 소개 · 연락처 · 스택 — 화면 문구는 여기서만 고친다 */
export const profile = {
	nameKo: '이재윤',
	nameEn: 'Lee Jae Youn',
	handle: 'jaeyoun.lee',
	roleLine: 'Front-end Developer · UX/UI Designer · Stable & Communicative',
	headline: ['디자인부터', '프런트 개발까지,'],
	headlineEm: '한 사람이 끝까지.',
	lead: '여행·교육·제조 관리자 시스템까지, 화면을 디자인, 설계하고 개발해 온 이재윤입니다.',
	years: '2020 — 2026',
	resume: 'files/lee_resume_ns.pdf',
	whatIDo: ['UX/UI 디자인', '퍼블리싱', '프런트엔드 개발', '운영·유지보수'],
	stack: ['HTML', 'CSS · SCSS', 'JavaScript', 'jQuery', 'Vue.js', 'Next.js', 'React', '반응형 · 적응형 웹'],
	howIWork: {
		title: '고객사와 직접 이야기하며, 한 사람이 처음부터 끝까지.',
		/** icon 은 Home.tsx 의 WORK_ICONS 키 */
		steps: [
			{ icon: 'chat', title: '요구 정리', desc: '고객사와 직접 만나 필요한 것을 정리' },
			{ icon: 'layout', title: '화면 설계 · 디자인', desc: '흐름을 그리고 화면을 디자인' },
			{ icon: 'code', title: '퍼블리싱', desc: '반응형 · 적응형 웹으로 구현' },
			{ icon: 'braces', title: '프런트 개발', desc: 'React · Vue 로 기능을 연결' },
			{ icon: 'cycle', title: '운영 · 유지보수', desc: '오픈 뒤에도 고치고 다듬기' }
		],
		owner: '이 다섯 단계를 모두 직접 해요'
	},
	about: [
		'디지털 Web & App 디자인 과정을 수료한 뒤 웹 솔루션 기업에서 Web Designer 겸 Web Publisher로 일하며 쇼핑몰, 여행사, 유치원생 교육용 플랫폼 등 여러 프로젝트를 경험해 왔습니다. 그 경험과 꾸준한 자기 개발로 HTML, CSS, JavaScript 기본기를 다듬어 왔습니다.',
		'여기에 안주하지 않고 JavaScript 라이브러리(React.js, Vue.js)를 공부하며, 지금은 **UI/UX 디자인**과 **퍼블리싱**은 물론 **Front-End 개발**까지 맡고 있습니다.',
		'여러 프로젝트에서 다양한 사람과 협업하고 클라이언트와 직접 소통하며, 혼자만 잘해서는 일이 진행되지 않는다는 것을 배웠습니다. 그래서 지식과 기술은 기본, 사람들과 이야기가 잘 통하고 맡은 일에 책임감 있게 임하는 개발자가 되는 것이 가장 큰 목표입니다.'
	],
	photo: 'img/itsme.jpg',
	contact: {
		phone: '010.4534.4084',
		tel: '01045344084',
		email: 'younyoun708@naver.com',
		location: '부산광역시 동래구'
	}
} as const;
