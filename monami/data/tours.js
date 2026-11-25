/*
 * Monami France — 가상 투어 데이터
 *  - monami.countries : Where to go (국가 4)
 *  - monami.tours     : 투어 16개 (가이드투어 · 박물관투어 · 단독맞춤투어)
 * 이미지 경로는 monami 폴더 기준이고, 화면에서 '../' 를 붙여 씁니다.
 * 요일(days)은 0=일 ~ 6=토 입니다. 가격은 1인 기준 원화(성인/아동)입니다.
 * 가이드 이름·연락처는 모두 가상입니다.
 */
MockDB.define('monami.countries', [
	{ id: 'france', en: 'France', ko: '프랑스', sort: 1, mSort: 1,
		image: 'FileData/hotel/20200828_7F4FDE1DFBC3B6B9.png', mImage: 'FileData/hotel/20200825_2412FD92B2D76C0D.png', visual: 'image/main/france.jpg',
		desc: '파리 시내와 미술관, 베르사유·지베르니·몽생미셸·루아르 고성까지' },
	{ id: 'italy', en: 'Italia', ko: '이탈리아', sort: 2, mSort: 3,
		image: 'FileData/hotel/20200828_1A155468BD8DC6EF.png', mImage: 'FileData/hotel/20201023_34D67EACD868081F.jpg', visual: 'image/main/italy.jpg',
		desc: '베네치아 골목 산책과 로마·피렌체 단독 맞춤 일정' },
	{ id: 'portugal', en: 'Portugal', ko: '포르투갈', sort: 3, mSort: 2,
		image: 'FileData/hotel/20200828_7DF92627521837D0.png', mImage: 'FileData/hotel/20200810_6EDA7DBEA5AFA42D.jpg', visual: 'tmbi_images/main/m_portugal.jpg',
		desc: '리스본 트램과 알파마, 포르투·도루 밸리' },
	{ id: 'belgium', en: 'Belgium', ko: '벨기에', sort: 4, mSort: 4,
		image: 'FileData/hotel/20200828_C5A5E4C7065865D8.png', mImage: 'FileData/hotel/20200825_5EAB2C8570989231.png', visual: 'image/main/belgium.jpg',
		desc: '파리에서 기차로 1시간 반, 브뤼셀·브뤼헤·겐트' }
], { version: '1' });

MockDB.define('monami.tours', [
	{
		id: 1, name: '파리시내+베르사유', type: 'guide', country: 'france', region: '파리 근교',
		best: 1, sort: 1, sales: 428, guide: '서하늘',
		image: 'FileData/hotel/20200820_E2942F954A24A1BC.jpg', mImage: 'FileData/hotel/20201022_F838AD40608FEABF.png',
		summary: '파리지앵이 안내하는 숨어있는\n파리의 역사, 문화, 맛을\n모두 느낄 수 있는 시간!\n세계에서 제일 아름다운 성이라고\n알려져 있는 베르사유 궁전에서\n잊지 못할 추억을 담아 가세요!',
		intro: '오전에는 오페라 가르니에에서 출발해 루브르·튈르리·콩코드 광장으로 이어지는 파리의 중심을 걷고, 오후에는 RER 을 타고 베르사유 궁전으로 이동합니다.\n거울의 방과 왕의 아파트, 끝이 보이지 않는 정원까지 — 하루에 파리와 베르사유를 모두 담고 싶은 분께 가장 많이 추천하는 투어예요.',
		time: '09:00~18:00', duration: '약 9시간', days: [0, 2, 3, 4, 5, 6], daysText: '매일(월요일 제외)',
		priceAdult: 98000, priceChild: 78000, minPeople: 1, maxPeople: 12,
		meeting: { place: '오페라 가르니에 정문 계단 앞', time: '08:50', detail: '메트로 3·7·8호선 Opéra 역 1번 출구로 나오면 바로 보여요. 모나미 깃발을 든 가이드를 찾아 주세요.' },
		include: ['한국인 전문 가이드 안내', '무선 오디오 수신기', '베르사유 왕복 RER 티켓'],
		exclude: ['베르사유 궁전 입장료 (현장 구매 약 21€)', '점심 식사', '개인 경비'],
		course: [
			{ time: '09:00', title: '오페라 가르니에 미팅', desc: '가르니에 궁의 건축 이야기로 투어를 시작해요.' },
			{ time: '10:00', title: '루브르 피라미드 · 튈르리 정원', desc: '루브르 외관과 카루젤 개선문, 튈르리 정원을 걸어요.' },
			{ time: '11:30', title: '콩코드 광장 · 샹젤리제', desc: '오벨리스크와 샹젤리제 거리, 개선문까지 이어지는 축을 봐요.' },
			{ time: '12:30', title: '자유 점심', desc: '가이드가 근처 추천 식당을 안내해 드려요.' },
			{ time: '14:00', title: '베르사유 궁전', desc: '거울의 방, 왕과 왕비의 아파트, 왕실 예배당을 둘러봐요.' },
			{ time: '16:00', title: '베르사유 정원', desc: '대운하와 분수 정원을 산책해요. (계절별 분수 쇼)' },
			{ time: '18:00', title: '베르사유 리브 고슈 역 해산', desc: '파리로 돌아가는 기차 시간을 안내해 드려요.' }
		],
		notes: ['베르사유 궁전이 쉬는 월요일에는 투어가 없어요.', '궁전 입장 대기 줄 때문에 일정이 30분가량 밀릴 수 있어요.', '하루 12,000보 이상 걷습니다. 편한 신발을 신고 오세요.', '만 26세 미만 EU 거주자는 궁전 입장이 무료예요(증빙 필요).']
	},
	{
		id: 2, name: '파리시내+파리야경', type: 'guide', country: 'france', region: '파리 시내',
		best: 2, sort: 2, sales: 512, guide: '윤도담',
		image: 'FileData/hotel/20200820_39DF192F04F3E6A7.jpg', mImage: 'FileData/hotel/20201022_D457DB141C5532C1.png',
		summary: '잡힐 듯 잡히지 않는 따뜻한 노을\n길을 걷다 들리는\n연인들의 사랑의 대화\n눈이 부시게 아름다운 파리 야경과\n세느강을 거닐며 느끼는 밤공기를\n모나미프랑스와 함께 느껴보세요.',
		intro: '해가 지는 트로카데로에서 시작해 세느강을 따라 걷는 야경 투어예요.\n정각마다 반짝이는 에펠탑, 알렉상드르 3세 다리, 불 밝힌 루브르까지 — 파리의 밤을 가장 아름다운 동선으로 안내하고 스냅 사진도 찍어 드려요.',
		time: '20:20~23:20', duration: '약 3시간', days: [0, 3, 5], daysText: '수요일 금요일 일요일',
		priceAdult: 59000, priceChild: 45000, minPeople: 1, maxPeople: 15,
		meeting: { place: '트로카데로 광장 (인권의 광장) 분수 앞', time: '20:10', detail: '메트로 6·9호선 Trocadéro 역 에펠탑 방향 출구에서 1분 거리예요.' },
		include: ['한국인 전문 가이드 안내', '야경 스냅 사진 3컷 (보정본 메일 발송)'],
		exclude: ['세느강 유람선 탑승권 (선택, 약 17€)', '메트로 교통비', '개인 경비'],
		course: [
			{ time: '20:20', title: '트로카데로 미팅', desc: '에펠탑 정면 포토 스폿에서 스냅을 찍어요.' },
			{ time: '21:00', title: '세느강변 · 알렉상드르 3세 다리', desc: '파리에서 가장 화려한 다리를 건너요.' },
			{ time: '21:40', title: '콩코드 광장 · 튈르리', desc: '불 켜진 샹젤리제 축을 바라봐요.' },
			{ time: '22:20', title: '루브르 야경 · 퐁데자르', desc: '조명이 들어온 피라미드와 예술의 다리를 걸어요.' },
			{ time: '23:00', title: '에펠탑 반짝임 감상', desc: '정각에 5분 동안 반짝이는 에펠탑을 봐요.' },
			{ time: '23:20', title: '퐁뇌프 해산', desc: '숙소로 돌아가는 교통편을 안내해 드려요.' }
		],
		notes: ['비가 많이 오면 일부 동선이 실내 위주로 바뀔 수 있어요.', '밤 공기가 차요. 여름에도 얇은 겉옷을 챙겨 주세요.', '소지품 관리에 특히 신경 써 주세요.']
	},
	{
		id: 3, name: '고흐+지베르니+베르사유', type: 'guide', country: 'france', region: '파리 근교',
		best: 3, sort: 3, sales: 377, guide: '강다온',
		image: 'FileData/hotel/20200810_AC1A286621D53EDE.jpg', mImage: 'FileData/hotel/20201022_EA52820FED7A94FD.png',
		summary: '파리지앵이 안내하는 숨어있는\n파리의 역사, 문화, 맛을\n모두 느낄 수 있는 시간!\n화가들이 직접 그렸던 장소로\n들어가 그림 속에서의 생생한\n스토리텔링을 들어보세요.',
		intro: '고흐가 마지막 70일을 보낸 오베르쉬르우아즈, 모네가 수련을 그린 지베르니 정원, 그리고 베르사유 궁전까지 차량으로 하루에 돌아보는 근교 투어예요.\n그림 속 장소에 서서 작품 이야기를 듣는, 모나미의 대표 스토리텔링 투어입니다.',
		time: '07:50~19:40', duration: '약 12시간', days: [0, 3, 5], daysText: '수요일, 금요일, 일요일',
		priceAdult: 149000, priceChild: 119000, minPeople: 1, maxPeople: 8,
		meeting: { place: '모나미 차량투어 미팅 포인트 (Bir-Hakeim 역)', time: '07:40', detail: '메트로 6호선 Bir-Hakeim 역 2번 출구 앞, 모나미 승합차 앞에서 만나요.' },
		include: ['전용 차량 및 기사', '한국인 전문 가이드 안내', '지베르니 모네의 정원 입장권'],
		exclude: ['베르사유 궁전 입장료 (현장 구매 약 21€)', '점심 식사', '개인 경비'],
		course: [
			{ time: '07:50', title: '파리 출발', desc: '차량으로 오베르쉬르우아즈까지 약 1시간이에요.' },
			{ time: '09:00', title: '오베르쉬르우아즈', desc: '오베르 교회, 까마귀 나는 밀밭, 고흐 형제의 묘를 찾아가요.' },
			{ time: '11:30', title: '지베르니 모네의 정원', desc: '수련 연못과 일본식 다리, 모네의 집을 둘러봐요.' },
			{ time: '13:00', title: '점심 (자유식)', desc: '지베르니 마을 식당을 추천해 드려요.' },
			{ time: '15:00', title: '베르사유 궁전', desc: '거울의 방과 왕의 아파트를 둘러봐요.' },
			{ time: '17:30', title: '베르사유 정원', desc: '대운하와 정원을 산책해요.' },
			{ time: '19:40', title: '파리 도착', desc: '출발 장소에서 해산해요.' }
		],
		notes: ['지베르니 모네의 정원은 4월~10월에만 문을 열어요. 그 밖의 기간에는 오베르 일정이 늘어나요.', '차량 좌석은 선착순 배정이에요.', '멀미가 있는 분은 미리 알려 주세요.']
	},
	{
		id: 4, name: '몽생미셸 1일 투어', type: 'guide', country: 'france', region: '노르망디',
		best: 0, sort: 4, sales: 296, guide: '민서진',
		image: 'FileData/hotel/20200812_FDBBCE7E6E1155BE.jpg',
		summary: '바다 위에 떠 있는 수도원,\n노을이 지는 몽생미셸과\n그림 같은 항구 마을 옹플뢰르를\n하루에 다녀오는 차량 투어',
		intro: '파리에서 차로 약 4시간, 노르망디 해안의 몽생미셸까지 다녀오는 하루 투어예요.\n가는 길에 인상파 화가들이 사랑한 항구 마을 옹플뢰르에 들르고, 해 질 무렵 몽생미셸이 가장 아름답게 보이는 전망 포인트까지 안내합니다.',
		time: '07:00~22:30', duration: '약 15시간', days: [2, 4, 6], daysText: '화요일 목요일 토요일',
		priceAdult: 169000, priceChild: 139000, minPeople: 1, maxPeople: 8,
		meeting: { place: '모나미 차량투어 미팅 포인트 (Bir-Hakeim 역)', time: '06:50', detail: '메트로 6호선 Bir-Hakeim 역 2번 출구 앞, 모나미 승합차 앞에서 만나요.' },
		include: ['전용 차량 및 기사', '한국인 전문 가이드 안내', '몽생미셸 셔틀버스'],
		exclude: ['몽생미셸 수도원 입장료 (약 13€)', '식사', '개인 경비'],
		course: [
			{ time: '07:00', title: '파리 출발', desc: '노르망디로 이동하며 몽생미셸의 역사를 들어요.' },
			{ time: '10:00', title: '옹플뢰르 구 항구', desc: '생트카트린 목조 성당과 항구를 산책해요.' },
			{ time: '12:30', title: '점심 (자유식)', desc: '노르망디 명물 수플레 오믈렛을 추천해요.' },
			{ time: '14:00', title: '몽생미셸 수도원', desc: '그랑드 뤼를 지나 수도원 꼭대기까지 올라가요.' },
			{ time: '17:30', title: '노을 전망 포인트', desc: '물 위에 비친 몽생미셸을 담아요.' },
			{ time: '22:30', title: '파리 도착', desc: '출발 장소에서 해산해요.' }
		],
		notes: ['이동 시간이 길어요. 목 베개를 챙기면 편해요.', '수도원 계단이 많아 거동이 불편한 분은 미리 알려 주세요.', '만조 시각에 따라 일정 순서가 바뀔 수 있어요.']
	},
	{
		id: 5, name: '루아르 고성 투어', type: 'guide', country: 'france', region: '루아르',
		best: 0, sort: 5, sales: 214, guide: '민서진',
		image: 'FileData/hotel/20200820_575ED6FEAC86596C.jpg',
		summary: '왕과 귀족이 사랑한\n루아르 계곡의 고성들,\n샹보르와 슈농소를 지나\n앙부아즈 마을까지',
		intro: '프랑스 왕실의 여름 별장이던 루아르 계곡의 고성을 하루에 돌아보는 차량 투어예요.\n다빈치가 설계에 참여했다는 샹보르 성, 강 위에 놓인 슈농소 성, 다빈치가 잠든 앙부아즈 마을을 차례로 들릅니다.',
		time: '07:30~20:00', duration: '약 12시간 30분', days: [1, 3, 6], daysText: '월요일 수요일 토요일',
		priceAdult: 159000, priceChild: 129000, minPeople: 1, maxPeople: 8,
		meeting: { place: '모나미 차량투어 미팅 포인트 (Bir-Hakeim 역)', time: '07:20', detail: '메트로 6호선 Bir-Hakeim 역 2번 출구 앞, 모나미 승합차 앞에서 만나요.' },
		include: ['전용 차량 및 기사', '한국인 전문 가이드 안내', '루아르 와인 시음 (성인)'],
		exclude: ['고성 입장료 (샹보르 약 16€, 슈농소 약 17€)', '식사', '개인 경비'],
		course: [
			{ time: '07:30', title: '파리 출발', desc: '루아르 계곡까지 약 2시간 30분 이동해요.' },
			{ time: '10:00', title: '샹보르 성', desc: '이중 나선 계단과 지붕 테라스를 둘러봐요.' },
			{ time: '12:30', title: '점심 (자유식)', desc: '루아르 강변 비스트로를 추천해요.' },
			{ time: '14:00', title: '슈농소 성', desc: '셰르 강 위의 갤러리와 정원을 걸어요.' },
			{ time: '16:00', title: '앙부아즈 마을 · 와인 시음', desc: '다빈치의 마지막 집 클로뤼세 앞을 지나 와인을 맛봐요.' },
			{ time: '20:00', title: '파리 도착', desc: '출발 장소에서 해산해요.' }
		],
		notes: ['와인 시음은 만 18세 이상만 가능해요.', '고성 내부는 계단이 많아요.', '겨울철(11~2월)에는 해가 빨리 져 일정이 1시간 당겨져요.']
	},
	{
		id: 6, name: '루브르 박물관 투어 (모나리자·나폴레옹)', type: 'museum', country: 'france', region: '파리 시내',
		best: 0, sort: 6, sales: 389, guide: '박루아',
		image: 'FileData/hotel/20200810_FB2CF4953ED49009.jpg',
		summary: '세계 최대의 박물관,\n꼭 봐야 할 명작만 골라\n3시간 동안 깊이 있게',
		intro: '40만 점이 넘는 소장품 가운데 꼭 봐야 할 작품만 골라 3시간 동안 안내하는 박물관 투어예요.\n모나리자와 사모트라케의 니케, 밀로의 비너스는 물론 나폴레옹 대관식과 나폴레옹 3세의 아파트까지 동선을 짜서 다닙니다.',
		time: '09:30~12:30', duration: '약 3시간', days: [0, 1, 3, 4, 5, 6], daysText: '매일(화요일 휴관)',
		priceAdult: 55000, priceChild: 40000, minPeople: 1, maxPeople: 15,
		meeting: { place: '루브르 피라미드 앞 (카루젤 개선문 쪽)', time: '09:20', detail: '메트로 1·7호선 Palais Royal–Musée du Louvre 역에서 걸어서 5분이에요.' },
		include: ['한국인 전문 가이드 안내', '무선 오디오 수신기', '박물관 입장 예약 대행'],
		exclude: ['루브르 입장료 (약 22€, 만 18세 미만 무료)', '개인 경비'],
		course: [
			{ time: '09:30', title: '피라미드 미팅 · 입장', desc: '예약 시간에 맞춰 함께 입장해요.' },
			{ time: '10:00', title: '드농관 — 니케 · 모나리자', desc: '사모트라케의 니케와 모나리자, 이탈리아 회화실을 봐요.' },
			{ time: '11:00', title: '드농관 — 나폴레옹 대관식', desc: '프랑스 대형 회화실에서 다비드와 들라크루아를 만나요.' },
			{ time: '11:40', title: '쉴리관 — 밀로의 비너스', desc: '그리스 조각실을 둘러봐요.' },
			{ time: '12:10', title: '리슐리외관 — 나폴레옹 3세 아파트', desc: '화려한 제2제정 실내를 보고 해산해요.' }
		],
		notes: ['루브르 박물관은 화요일 휴관이에요.', '큰 가방은 보안 검색대에서 제지될 수 있어요.', '박물관 안에서는 플래시 촬영이 금지돼요.']
	},
	{
		id: 7, name: '오르세 미술관 투어', type: 'museum', country: 'france', region: '파리 시내',
		best: 0, sort: 7, sales: 301, guide: '박루아',
		image: 'FileData/hotel/20200825_B13A3B03DB757234.png',
		summary: '기차역을 고친 미술관에서\n밀레와 마네, 모네와 고흐까지\n인상파의 모든 것',
		intro: '옛 기차역을 고쳐 만든 오르세 미술관에서 19세기 미술의 흐름을 따라가는 투어예요.\n밀레의 만종, 마네의 올랭피아, 모네와 르누아르, 그리고 고흐의 자화상과 별이 빛나는 밤까지 인상파 명작을 이야기와 함께 봅니다.',
		time: '13:30~16:30', duration: '약 3시간', days: [0, 2, 3, 4, 5, 6], daysText: '매일(월요일 휴관)',
		priceAdult: 49000, priceChild: 35000, minPeople: 1, maxPeople: 15,
		meeting: { place: '오르세 미술관 정문 코뿔소 조각 앞', time: '13:20', detail: 'RER C선 Musée d\'Orsay 역 바로 앞이에요.' },
		include: ['한국인 전문 가이드 안내', '무선 오디오 수신기'],
		exclude: ['오르세 입장료 (약 16€, 만 18세 미만 무료)', '개인 경비'],
		course: [
			{ time: '13:30', title: '정문 미팅 · 입장', desc: '기차역 시절의 대형 시계 아래에서 시작해요.' },
			{ time: '14:00', title: '사실주의 — 밀레 · 쿠르베', desc: '만종과 이삭줍기를 봐요.' },
			{ time: '14:40', title: '마네와 인상파의 시작', desc: '풀밭 위의 점심 식사, 올랭피아.' },
			{ time: '15:20', title: '5층 인상파 갤러리', desc: '모네, 르누아르, 드가의 작품을 봐요.' },
			{ time: '16:00', title: '고흐 · 고갱', desc: '자화상과 별이 빛나는 밤을 보고 해산해요.' }
		],
		notes: ['오르세 미술관은 월요일 휴관이에요.', '목요일은 야간 개장으로 대기 줄이 길 수 있어요.']
	},
	{
		id: 8, name: '오랑주리+로댕 미술관 투어', type: 'museum', country: 'france', region: '파리 시내',
		best: 0, sort: 8, sales: 158, guide: '박루아',
		image: 'FileData/hotel/20200820_5CBD99EDCD85987A.jpg',
		summary: '모네의 수련 연작 앞에 앉아\n잠시 쉬어 가고,\n로댕의 정원에서\n생각하는 사람을 만나는 시간',
		intro: '튈르리 정원 끝의 오랑주리 미술관에서 모네의 대형 수련 연작을 감상하고, 세느강을 건너 로댕 미술관의 조각 정원까지 걷는 반나절 투어예요.\n붐비지 않는 미술관 두 곳을 여유 있게 보고 싶은 분께 추천해요.',
		time: '10:00~14:00', duration: '약 4시간', days: [0, 3, 4, 5, 6], daysText: '수요일~일요일 (월·화 휴관)',
		priceAdult: 52000, priceChild: 38000, minPeople: 1, maxPeople: 12,
		meeting: { place: '오랑주리 미술관 입구 앞 (튈르리 정원 서쪽)', time: '09:50', detail: '메트로 1·8·12호선 Concorde 역에서 걸어서 3분이에요.' },
		include: ['한국인 전문 가이드 안내', '무선 오디오 수신기'],
		exclude: ['오랑주리 입장료 (약 12.5€)', '로댕 미술관 입장료 (약 15€)', '개인 경비'],
		course: [
			{ time: '10:00', title: '오랑주리 미술관', desc: '타원형 전시실의 수련 연작을 감상해요.' },
			{ time: '11:00', title: '지하 전시실', desc: '르누아르, 세잔, 모딜리아니를 봐요.' },
			{ time: '11:40', title: '콩코드 다리 · 앵발리드', desc: '세느강을 건너 걸어서 이동해요.' },
			{ time: '12:30', title: '로댕 미술관 · 조각 정원', desc: '생각하는 사람, 지옥의 문, 칼레의 시민.' },
			{ time: '14:00', title: '해산', desc: '정원 카페에서 쉬어 가도 좋아요.' }
		],
		notes: ['오랑주리는 화요일, 로댕 미술관은 월요일 휴관이라 수~일에만 진행해요.', '두 미술관 사이를 약 20분 걸어서 이동해요.']
	},
	{
		id: 9, name: '마레 지구 갤러리 투어 (퐁피두센터 대체)', type: 'museum', country: 'france', region: '파리 시내',
		best: 0, sort: 9, sales: 87, guide: '박루아',
		image: 'FileData/hotel/20200820_526D11D3649C45FB.jpg',
		summary: '골목마다 갤러리가 숨은\n마레 지구를 걸으며\n피카소 미술관과 현대미술을',
		intro: '퐁피두센터가 리노베이션으로 휴관하는 동안 운영하는 대체 투어예요.\n퐁피두센터 외관과 스트라빈스키 분수에서 시작해 마레 지구의 갤러리 골목을 걷고, 피카소 미술관에서 마무리합니다.',
		time: '14:00~17:00', duration: '약 3시간', days: [0, 2, 3, 4, 5, 6], daysText: '매일(월요일 제외)',
		priceAdult: 45000, priceChild: 32000, minPeople: 1, maxPeople: 12,
		meeting: { place: '스트라빈스키 분수 앞 (퐁피두센터 남쪽)', time: '13:50', detail: '메트로 11호선 Rambuteau 역에서 걸어서 3분이에요.' },
		include: ['한국인 전문 가이드 안내'],
		exclude: ['피카소 미술관 입장료 (약 16€)', '개인 경비'],
		course: [
			{ time: '14:00', title: '퐁피두센터 외관 · 스트라빈스키 분수', desc: '하이테크 건축과 분수 조각 이야기.' },
			{ time: '14:40', title: '마레 지구 갤러리 골목', desc: '현대미술 갤러리 두세 곳을 들러요.' },
			{ time: '15:30', title: '보주 광장', desc: '파리에서 가장 오래된 광장에서 쉬어 가요.' },
			{ time: '16:00', title: '피카소 미술관', desc: '청색 시대부터 말년까지 작품을 봐요.' },
			{ time: '17:00', title: '해산', desc: '마레 지구 맛집을 추천해 드려요.' }
		],
		notes: ['퐁피두센터는 리노베이션으로 휴관 중이라 내부 관람은 없어요.', '갤러리 전시는 시기에 따라 바뀌어요.']
	},
	{
		id: 10, name: '파리 단독 맞춤 차량투어', type: 'custom', country: 'france', region: '파리 시내·근교',
		best: 0, sort: 10, sales: 133, guide: '강다온',
		image: 'FileData/hotel/20200810_805F8D50C1264E97.jpg',
		summary: '우리 가족만을 위한 차량과 가이드,\n가고 싶은 곳만 골라\n일정을 함께 만들어요',
		intro: '일행만 전용 차량과 가이드를 이용하는 단독 맞춤 투어예요.\n예약 후 담당 가이드가 연락드려 가고 싶은 곳, 아이·어르신 동반 여부, 식사 취향에 맞춰 하루 일정을 함께 짭니다. 첫날 파리 시내를 한 바퀴 둘러보는 일정으로 가장 많이 이용하세요.',
		time: '09:00~17:00 (시간 협의)', duration: '기본 8시간', days: [0, 1, 2, 3, 4, 5, 6], daysText: '매일',
		priceAdult: 210000, priceChild: 160000, minPeople: 2, maxPeople: 6,
		meeting: { place: '숙소 픽업 (파리 시내)', time: '협의', detail: '예약할 때 숙소 이름과 주소를 남겨 주시면 숙소 앞으로 모시러 가요.' },
		include: ['전용 차량 및 기사', '한국인 전문 가이드 안내', '숙소 픽업·샌딩 (파리 시내)'],
		exclude: ['각종 입장료', '식사', '8시간 초과 시 추가 요금 (시간당 60€)'],
		course: [
			{ time: '09:00', title: '숙소 픽업', desc: '담당 가이드가 숙소 앞으로 찾아가요.' },
			{ time: '09:30', title: '맞춤 일정 1', desc: '예: 몽마르트르 언덕 · 사크레쾨르 성당' },
			{ time: '12:00', title: '점심', desc: '취향에 맞는 식당을 예약해 드려요.' },
			{ time: '13:30', title: '맞춤 일정 2', desc: '예: 개선문 · 샹젤리제 · 에펠탑 포토 스폿' },
			{ time: '17:00', title: '숙소 샌딩', desc: '숙소 앞까지 모셔다 드려요.' }
		],
		notes: ['2인 이상부터 예약할 수 있어요.', '예약 후 48시간 안에 담당 가이드가 카카오톡으로 연락드려요.', '차량 크기는 인원에 맞춰 배정돼요.']
	},
	{
		id: 11, name: '이탈리아 단독 맞춤투어 (로마·피렌체)', type: 'custom', country: 'italy', region: '로마·피렌체',
		best: 0, sort: 11, sales: 64, guide: '이리안',
		image: 'image/main/italy.jpg',
		summary: '파리에서 이어지는 이탈리아 일정,\n로마와 피렌체를\n우리 일행만의 속도로',
		intro: '파리 일정과 이어서 이탈리아를 여행하는 분을 위한 단독 맞춤 투어예요.\n로마의 바티칸과 콜로세움, 피렌체의 두오모와 우피치까지 원하는 도시와 장소를 골라 하루 일정을 만듭니다.',
		time: '09:00~18:00 (시간 협의)', duration: '기본 9시간', days: [0, 1, 2, 3, 4, 5, 6], daysText: '매일',
		priceAdult: 230000, priceChild: 180000, minPeople: 2, maxPeople: 6,
		meeting: { place: '숙소 또는 기차역 픽업', time: '협의', detail: '로마 테르미니역, 피렌체 산타 마리아 노벨라역 픽업도 가능해요.' },
		include: ['한국인 전문 가이드 안내', '전용 차량 (도시 간 이동 제외)', '입장 예약 대행'],
		exclude: ['각종 입장료', '도시 간 기차표', '식사'],
		course: [
			{ time: '09:00', title: '픽업', desc: '숙소 또는 역에서 만나요.' },
			{ time: '09:30', title: '맞춤 일정 1', desc: '예: 바티칸 박물관 · 성 베드로 대성당' },
			{ time: '13:00', title: '점심', desc: '현지 트라토리아를 예약해 드려요.' },
			{ time: '14:30', title: '맞춤 일정 2', desc: '예: 콜로세움 · 포로 로마노 · 트레비 분수' },
			{ time: '18:00', title: '해산', desc: '숙소 앞까지 모셔다 드려요.' }
		],
		notes: ['2인 이상부터 예약할 수 있어요.', '바티칸은 일요일 휴관(마지막 일요일 제외)이에요.', '성당 입장 시 어깨와 무릎을 가리는 옷을 입어 주세요.']
	},
	{
		id: 12, name: '베네치아 골목 워킹투어', type: 'guide', country: 'italy', region: '베네치아',
		best: 0, sort: 12, sales: 119, guide: '이리안',
		image: 'FileData/hotel/20201023_34D67EACD868081F.jpg',
		summary: '미로 같은 골목과 운하,\n산마르코 광장에서\n리알토 다리까지 걷는 아침',
		intro: '길을 잃기 쉬운 베네치아의 골목을 현지 가이드와 함께 걷는 오전 워킹 투어예요.\n산마르코 광장과 두칼레 궁전, 탄식의 다리, 리알토 시장까지 베네치아의 핵심을 걸으며 운하 도시가 생겨난 이야기를 들려 드려요.',
		time: '09:30~13:00', duration: '약 3시간 30분', days: [1, 3, 5, 6], daysText: '월요일 수요일 금요일 토요일',
		priceAdult: 65000, priceChild: 50000, minPeople: 1, maxPeople: 12,
		meeting: { place: '산타 루치아역 정문 계단 앞', time: '09:20', detail: '베네치아 본섬 기차역 정문을 나와 운하 쪽 계단에서 만나요.' },
		include: ['한국인 전문 가이드 안내', '곤돌라 트라게토 1회 (대운하 건너기)'],
		exclude: ['곤돌라 탑승 (선택, 1척 약 90€)', '바포레토 승선권', '개인 경비'],
		course: [
			{ time: '09:30', title: '산타 루치아역 미팅', desc: '대운하를 바라보며 출발해요.' },
			{ time: '10:20', title: '리알토 시장 · 리알토 다리', desc: '아침 시장을 구경하고 다리를 건너요.' },
			{ time: '11:30', title: '산마르코 광장', desc: '대성당과 종탑, 두칼레 궁전 외관.' },
			{ time: '12:30', title: '탄식의 다리', desc: '감옥과 궁전을 잇는 다리 이야기.' },
			{ time: '13:00', title: '해산', desc: '곤돌라 승선장을 안내해 드려요.' }
		],
		notes: ['아쿠아 알타(만조) 때는 동선이 바뀔 수 있어요.', '다리 계단이 많아 유모차는 불편해요.']
	},
	{
		id: 13, name: '리스본 트램 28번+알파마 워킹투어', type: 'guide', country: 'portugal', region: '리스본',
		best: 0, sort: 13, sales: 96, guide: '조하람',
		image: 'FileData/hotel/20200810_6EDA7DBEA5AFA42D.jpg',
		summary: '노란 트램을 타고 언덕을 올라\n파두가 흐르는 알파마 골목과\n리스본 전망대까지',
		intro: '리스본의 상징인 노란 트램 28번을 타고 언덕 위 알파마 지구로 올라가 골목을 걷는 투어예요.\n상 조르즈 성 아래 전망대, 리스본 대성당, 에그타르트 명소까지 들르며 대항해 시대의 이야기를 들려 드려요.',
		time: '10:00~15:00', duration: '약 5시간', days: [2, 4, 6], daysText: '화요일 목요일 토요일',
		priceAdult: 69000, priceChild: 52000, minPeople: 1, maxPeople: 12,
		meeting: { place: '코메르시우 광장 개선문 아래', time: '09:50', detail: '메트로 파란선 Terreiro do Paço 역에서 걸어서 3분이에요.' },
		include: ['한국인 전문 가이드 안내', '트램 28번 1회 승차권', '에그타르트 1개'],
		exclude: ['상 조르즈 성 입장료 (약 15€)', '점심 식사', '개인 경비'],
		course: [
			{ time: '10:00', title: '코메르시우 광장', desc: '대지진 이후 다시 세운 리스본 이야기.' },
			{ time: '10:40', title: '트램 28번 탑승', desc: '언덕길을 오르며 창밖 골목을 봐요.' },
			{ time: '11:30', title: '포르타스 두 솔 전망대', desc: '알파마 지붕과 테주강을 내려다봐요.' },
			{ time: '12:30', title: '점심 (자유식)', desc: '정어리 구이 식당을 추천해요.' },
			{ time: '14:00', title: '알파마 골목 · 리스본 대성당', desc: '파두 하우스 골목을 걸어요.' },
			{ time: '15:00', title: '해산', desc: '에그타르트 명소에서 마무리해요.' }
		],
		notes: ['트램은 혼잡해 소매치기에 주의해 주세요.', '언덕길이 가팔라요. 운동화를 권해요.']
	},
	{
		id: 14, name: '포르투갈 단독 맞춤투어 (포르투·도루 밸리)', type: 'custom', country: 'portugal', region: '포르투',
		best: 0, sort: 14, sales: 41, guide: '조하람',
		image: 'tmbi_images/main/sns_box_m.jpg',
		summary: '알록달록한 포르투의 골목과\n포트와인 셀러, 도루 밸리의\n포도밭을 우리 일행만',
		intro: '포르투 시내와 도루 밸리 와이너리를 일행만 전용 차량으로 다녀오는 단독 맞춤 투어예요.\n렐루 서점과 동 루이스 1세 다리, 포트와인 셀러 시음, 도루 강변 포도밭 전망까지 원하는 대로 일정을 짭니다.',
		time: '09:00~18:00 (시간 협의)', duration: '기본 9시간', days: [0, 1, 2, 3, 4, 5, 6], daysText: '매일',
		priceAdult: 220000, priceChild: 170000, minPeople: 2, maxPeople: 6,
		meeting: { place: '숙소 픽업 (포르투 시내)', time: '협의', detail: '예약할 때 숙소 이름과 주소를 남겨 주세요.' },
		include: ['전용 차량 및 기사', '한국인 전문 가이드 안내', '포트와인 셀러 시음 (성인)'],
		exclude: ['렐루 서점 입장료 (약 10€)', '식사', '개인 경비'],
		course: [
			{ time: '09:00', title: '숙소 픽업', desc: '담당 가이드가 숙소 앞으로 찾아가요.' },
			{ time: '09:30', title: '포르투 시내', desc: '예: 상 벤투 역 아줄레주 · 렐루 서점' },
			{ time: '12:00', title: '점심', desc: '포르투 명물 프란세지냐를 추천해요.' },
			{ time: '14:00', title: '도루 밸리', desc: '예: 강변 전망대 · 와이너리 시음' },
			{ time: '18:00', title: '숙소 샌딩', desc: '숙소 앞까지 모셔다 드려요.' }
		],
		notes: ['2인 이상부터 예약할 수 있어요.', '와인 시음은 만 18세 이상만 가능해요.']
	},
	{
		id: 15, name: '파리→브뤼셀·브뤼헤 당일 연계투어', type: 'guide', country: 'belgium', region: '브뤼셀·브뤼헤',
		best: 0, sort: 15, sales: 152, guide: '문가온',
		image: 'FileData/hotel/20200825_5EAB2C8570989231.png',
		summary: '파리에서 기차로 1시간 반,\n그랑 플라스와 와플,\n운하 도시 브뤼헤까지 하루에',
		intro: '파리 북역에서 고속열차를 타고 벨기에로 넘어가 브뤼셀과 브뤼헤를 하루에 돌아보는 연계 투어예요.\n세상에서 가장 아름다운 광장이라는 그랑 플라스, 오줌싸개 동상, 그리고 중세 운하 도시 브뤼헤의 종탑과 운하 보트까지 안내합니다.',
		time: '07:00~21:30', duration: '약 14시간 30분', days: [2, 6], daysText: '화요일 토요일',
		priceAdult: 189000, priceChild: 159000, minPeople: 1, maxPeople: 10,
		meeting: { place: '파리 북역 (Gare du Nord) 출발 전광판 앞', time: '06:40', detail: '고속열차 탑승 30분 전까지 모여 주세요.' },
		include: ['한국인 전문 가이드 안내', '브뤼셀↔브뤼헤 기차표', '와플 1개'],
		exclude: ['파리↔브뤼셀 고속열차 왕복 (예약 시 대행, 약 120€~)', '브뤼헤 운하 보트 (약 15€)', '식사'],
		course: [
			{ time: '07:00', title: '파리 북역 출발', desc: '고속열차로 브뤼셀 남역까지 1시간 22분.' },
			{ time: '09:00', title: '브뤼셀 그랑 플라스', desc: '시청사와 길드 하우스, 오줌싸개 동상.' },
			{ time: '11:30', title: '갤러리 생튀베르 · 와플', desc: '유리 지붕 아케이드에서 와플을 맛봐요.' },
			{ time: '13:30', title: '브뤼헤 이동 · 점심', desc: '기차로 1시간, 홍합 요리를 추천해요.' },
			{ time: '15:00', title: '브뤼헤 마르크트 광장 · 종탑', desc: '중세 도시를 걷고 운하 보트를 타요.' },
			{ time: '21:30', title: '파리 북역 도착', desc: '도착 후 해산해요.' }
		],
		notes: ['여권을 꼭 챙겨 주세요 (국경 열차).', '고속열차 요금은 날짜에 따라 달라요. 예약 후 실제 요금을 안내해 드려요.']
	},
	{
		id: 16, name: '벨기에 단독 맞춤투어 (겐트·브뤼헤)', type: 'custom', country: 'belgium', region: '겐트·브뤼헤',
		best: 0, sort: 16, sales: 28, guide: '문가온',
		image: 'image/main/belgium.jpg',
		summary: '운하를 따라 늘어선\n중세 길드 하우스,\n겐트와 브뤼헤를 일행만 여유롭게',
		intro: '브뤼셀에서 출발해 겐트와 브뤼헤를 일행만 전용 차량으로 돌아보는 단독 맞춤 투어예요.\n반 에이크의 〈어린 양에 대한 경배〉가 있는 겐트 성 바보 대성당과 브뤼헤의 운하, 초콜릿 공방까지 원하는 대로 일정을 짭니다.',
		time: '09:00~18:00 (시간 협의)', duration: '기본 9시간', days: [0, 1, 2, 3, 4, 5, 6], daysText: '매일',
		priceAdult: 225000, priceChild: 175000, minPeople: 2, maxPeople: 6,
		meeting: { place: '숙소 픽업 (브뤼셀 시내)', time: '협의', detail: '예약할 때 숙소 이름과 주소를 남겨 주세요.' },
		include: ['전용 차량 및 기사', '한국인 전문 가이드 안내', '초콜릿 공방 체험'],
		exclude: ['각종 입장료', '식사', '개인 경비'],
		course: [
			{ time: '09:00', title: '숙소 픽업', desc: '담당 가이드가 숙소 앞으로 찾아가요.' },
			{ time: '10:00', title: '겐트', desc: '예: 성 바보 대성당 · 그라슬레이 운하' },
			{ time: '12:30', title: '점심', desc: '벨기에식 스튜 식당을 추천해요.' },
			{ time: '14:00', title: '브뤼헤', desc: '예: 마르크트 광장 · 운하 보트 · 초콜릿 공방' },
			{ time: '18:00', title: '숙소 샌딩', desc: '숙소 앞까지 모셔다 드려요.' }
		],
		notes: ['2인 이상부터 예약할 수 있어요.', '파리 출발을 원하면 고속열차 예약을 함께 도와드려요.']
	}
], { version: '1' });
