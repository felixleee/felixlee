/*
 * Monami France — 가상 여행후기 (monami.reviews)
 *  - best: 메인 BEST REVIEW 순서 (0 이면 일반 후기)
 *  - summary: 메인 슬라이더에 보이는 두 줄 요약 (없으면 본문 앞부분)
 *  - image: 없으면 투어 대표 이미지를 씁니다.
 * 작성자 이름은 가려진 가상 이름이고, 가이드 이름도 가상입니다.
 */
MockDB.define('monami.reviews', [
	{
		id: 1, tourId: 1, best: 1, rating: 5, author: '김*연', views: 1284,
		title: '너무 즐겁고 편안한 여행이었습니다',
		summary: '하늘 가이드님이 재미있게 이야기 해주셔서 평소엔\n관심 없던 내용도 주의 깊게 들을 수 있었어요!',
		content: '하늘 가이드님이 재미있게 이야기 해주셔서 평소엔 관심 없던 내용도 주의 깊게 들을 수 있었어요!\n\n오전에는 파리 시내를 걸으면서 건물마다 숨은 이야기를 들었고, 오후에는 베르사유 궁전에서 거울의 방을 봤는데 설명을 듣고 보니 같은 방도 완전히 다르게 보이더라고요.\n중간중간 사진 포인트도 알려 주셔서 인생샷도 많이 건졌습니다. 부모님도 하루 종일 걸었는데 하나도 안 힘들었다고 하셨어요. 다음에 파리 오면 야경 투어도 꼭 할게요!',
		image: 'FileData/hotel/20200820_575ED6FEAC86596C.jpg', travelDate: Mock.rel(-24), createdAt: Mock.rel(-20, '21:14')
	},
	{
		id: 2, tourId: 10, best: 2, rating: 5, author: '이*호', views: 962,
		title: '파리 간 첫날 했으면 너무 좋았을 것 같고 투어 추천해드려요.',
		summary: '가이드님 엄청 유쾌하시고 드라이브할때 나오는 음악선곡이\n정말 소름끼치게 제가 좋아하는 곡들만 나와서 기억에 남아요.',
		content: '가이드님 엄청 유쾌하시고 드라이브할때 나오는 음악선곡이 정말 소름끼치게 제가 좋아하는 곡들만 나와서 기억에 남아요.\n\n여행 마지막 날에 단독 차량투어를 했는데, 파리 전체 지리가 한 번에 정리되는 느낌이라 첫날 했으면 남은 일정이 훨씬 편했을 것 같아요.\n몽마르트르에서 내려다본 풍경, 개선문 옥상, 에펠탑 포토 스폿까지 저희가 원하는 대로 동선을 짜 주셔서 정말 만족했습니다.',
		image: 'FileData/hotel/20200820_526D11D3649C45FB.jpg', travelDate: Mock.rel(-33), createdAt: Mock.rel(-29, '10:02')
	},
	{
		id: 3, tourId: 3, best: 3, rating: 5, author: '박*진', views: 1107,
		title: '시부모님과 은퇴기념으로 가족여행했던 사람입니다^^',
		summary: '2018년 6월에 똑같은 투어신청했었는데\n알찬 일정으로 스냅까지 너무 좋았어서 또 신청했어요',
		content: '2018년 6월에 똑같은 투어신청했었는데 알찬 일정으로 스냅까지 너무 좋았어서 또 신청했어요.\n\n이번에는 시부모님 은퇴 기념 여행이라 걱정이 많았는데, 다온 가이드님이 어르신 걸음에 맞춰 천천히 안내해 주시고 차 안에서도 그림 이야기를 계속 들려 주셔서 시간 가는 줄 몰랐어요.\n지베르니 수련 연못 앞에서 찍어 주신 가족사진은 거실에 걸어 두었습니다. 감사합니다!',
		image: 'FileData/hotel/20200820_5CBD99EDCD85987A.jpg', travelDate: Mock.rel(-45), createdAt: Mock.rel(-41, '08:47')
	},
	{
		id: 4, tourId: 1, best: 0, rating: 5, author: '최*아', views: 534,
		title: '하늘 가이드님과 함께 했습니다',
		content: '하늘 가이드님과 함께 했습니다.\n그래서 지루할뻔한 베르사유 투어가 가이드님의 재치와 열정으로, 흥미있고 늘 웃는 즐거운 투어가 되었습니다.\n\n궁전 입장 줄이 길었는데 기다리는 동안에도 루이 14세 이야기를 해 주셔서 지루할 틈이 없었어요.',
		image: 'FileData/hotel/20200831_B81245678D0983B1.jpg', travelDate: Mock.rel(-12), createdAt: Mock.rel(-9, '22:31')
	},
	{
		id: 5, tourId: 2, best: 0, rating: 5, author: '정*우', views: 488,
		title: '에펠탑 반짝이는 순간 소름 돋았어요',
		content: '야경 투어 강력 추천합니다. 트로카데로에서 해 지는 걸 보고 세느강 따라 걷는데 걸음마다 사진 스폿이에요.\n도담 가이드님이 찍어 주신 스냅 사진이 너무 잘 나와서 프로필 사진 바꿨어요 ㅎㅎ\n\n밤에는 생각보다 추우니 겉옷 꼭 챙기세요!',
		image: 'FileData/hotel/20200820_39DF192F04F3E6A7.jpg', travelDate: Mock.rel(-7), createdAt: Mock.rel(-5, '00:12')
	},
	{
		id: 6, tourId: 6, best: 0, rating: 4, author: '강*희', views: 311,
		title: '모나리자만 보고 나올 뻔했는데 다행이에요',
		content: '혼자 갔으면 모나리자 앞에서 사람에 치이고 끝났을 텐데, 루아 가이드님이 동선을 미리 짜 오셔서 3시간 동안 핵심 작품을 다 봤어요.\n나폴레옹 대관식 그림 크기에 놀라고, 나폴레옹 3세 아파트는 정말 화려하더라고요.\n\n다만 오디오 수신기 배터리가 중간에 한 번 나가서 별 하나 뺍니다.',
		image: '', travelDate: Mock.rel(-18), createdAt: Mock.rel(-16, '19:40')
	},
	{
		id: 7, tourId: 7, best: 0, rating: 5, author: '윤*서', views: 276,
		title: '고흐 자화상 앞에서 한참 서 있었어요',
		content: '미술 잘 모르는 남편도 끝까지 집중해서 들었어요.\n기차역이던 시절 이야기부터 인상파가 어떻게 시작됐는지까지 흐름으로 설명해 주셔서 그림이 머리에 쏙쏙 들어왔습니다.\n5층 시계 앞에서 사진도 꼭 찍으세요!',
		image: '', travelDate: Mock.rel(-27), createdAt: Mock.rel(-25, '13:05')
	},
	{
		id: 8, tourId: 4, best: 0, rating: 5, author: '장*민', views: 402,
		title: '이동은 길지만 그만한 가치가 있어요',
		content: '왕복 8시간 이동이라 걱정했는데 차가 편하고 가는 길에 옹플뢰르에 들러서 지루하지 않았어요.\n몽생미셸은 사진으로 보던 것보다 훨씬 웅장하고, 해 질 녘 전망 포인트는 정말 잊지 못할 것 같아요.\n서진 가이드님 운전도 안전하게 해 주셔서 감사했습니다.',
		image: 'FileData/hotel/20200812_FDBBCE7E6E1155BE.jpg', travelDate: Mock.rel(-38), createdAt: Mock.rel(-35, '07:55')
	},
	{
		id: 9, tourId: 5, best: 0, rating: 4, author: '임*정', views: 198,
		title: '샹보르 성 계단이 인상적이었어요',
		content: '루아르 고성 투어는 정보가 많지 않아 고민하다 신청했는데 만족해요.\n샹보르 성의 이중 나선 계단, 강 위에 떠 있는 슈농소 성 모두 좋았고 마지막 와인 시음도 즐거웠어요.\n겨울이라 해가 빨리 져서 앙부아즈는 조금 급하게 본 게 아쉬워요.',
		image: '', travelDate: Mock.rel(-60), createdAt: Mock.rel(-56, '16:20')
	},
	{
		id: 10, tourId: 12, best: 0, rating: 5, author: '한*솔', views: 167,
		title: '베네치아에서 길 잃을 걱정 끝',
		content: '파리 일정 마치고 이탈리아로 넘어가서 리안 가이드님 투어 들었어요.\n골목이 진짜 미로인데 가이드님 따라다니니 핵심만 쏙쏙 보고, 오후에는 알려주신 대로 혼자 다녀도 길을 안 잃었어요.\n트라게토로 대운하 건넌 건 소소한 재미였습니다.',
		image: 'FileData/hotel/20201023_34D67EACD868081F.jpg', travelDate: Mock.rel(-21), createdAt: Mock.rel(-19, '11:11')
	},
	{
		id: 11, tourId: 13, best: 0, rating: 5, author: '오*경', views: 142,
		title: '트램 타고 올라간 전망대 최고',
		content: '하람 가이드님 덕분에 리스본이 더 좋아졌어요.\n트램 28번은 혼자 타면 사람이 많아 정신없는데 같이 타니 내릴 곳도 알려 주시고 창밖 설명도 해 주셔서 좋았어요.\n마지막에 먹은 에그타르트는 지금도 생각나요.',
		image: 'FileData/hotel/20200810_6EDA7DBEA5AFA42D.jpg', travelDate: Mock.rel(-15), createdAt: Mock.rel(-13, '20:48')
	},
	{
		id: 12, tourId: 15, best: 0, rating: 4, author: '서*준', views: 133,
		title: '하루에 두 나라, 알차게 다녀왔습니다',
		content: '파리에서 벨기에까지 당일로 가능할까 싶었는데 일정이 정말 효율적이었어요.\n그랑 플라스는 사진보다 훨씬 화려했고 브뤼헤 운하 보트는 동화 속 같았습니다.\n돌아오는 기차가 조금 지연된 것 빼고는 다 좋았어요.',
		image: 'FileData/hotel/20200825_5EAB2C8570989231.png', travelDate: Mock.rel(-30), createdAt: Mock.rel(-27, '23:03')
	},
	{
		id: 13, tourId: 8, best: 0, rating: 5, author: '신*영', views: 121,
		title: '수련 앞에 앉아 있던 시간이 가장 좋았어요',
		content: '사람 많은 루브르·오르세와 달리 조용하게 그림을 볼 수 있어 좋았어요.\n타원형 전시실에서 수련 연작을 둘러싸고 앉아 설명을 듣는데 마음이 편안해지더라고요.\n로댕 미술관 정원도 꼭 들러 보세요.',
		image: '', travelDate: Mock.rel(-11), createdAt: Mock.rel(-10, '15:37')
	},
	{
		id: 14, tourId: 2, best: 0, rating: 4, author: '권*빈', views: 98,
		title: '비가 왔지만 운치 있었어요',
		content: '투어 날 비가 와서 걱정했는데 가이드님이 동선을 바꿔 아케이드 쪽으로 안내해 주셨어요.\n젖은 돌길에 비친 불빛이 오히려 더 예뻤습니다. 사진은 조금 아쉬웠지만 분위기는 최고였어요.',
		image: '', travelDate: Mock.rel(-4), createdAt: Mock.rel(-3, '09:15')
	},
	{
		id: 15, tourId: 1, best: 0, rating: 5, author: '황*리', views: 87,
		title: '부모님 모시고 다녀왔어요',
		content: '부모님이 많이 걸으실까 걱정했는데 중간중간 쉬는 시간을 잘 챙겨 주셨어요.\n베르사유 정원 분수 쇼 시간에 딱 맞춰 들어가서 운이 좋았습니다. 하늘 가이드님 감사해요!',
		image: '', travelDate: Mock.rel(-3), createdAt: Mock.rel(-2, '18:22')
	},
	{
		id: 16, tourId: 3, best: 0, rating: 5, author: '안*수', views: 76,
		title: '그림 속으로 들어간 하루',
		content: '오베르 교회 앞에서 고흐 그림을 펼쳐 놓고 비교해 주시는데 소름이 돋았어요.\n지베르니 정원은 꽃이 한창이라 어딜 찍어도 그림이었고요. 하루가 길지만 하나도 안 아까워요.',
		image: 'FileData/hotel/20200810_AC1A286621D53EDE.jpg', travelDate: Mock.rel(-9), createdAt: Mock.rel(-7, '21:50')
	},
	{
		id: 17, tourId: 9, best: 0, rating: 4, author: '송*현', views: 54,
		title: '퐁피두 대신이었지만 만족',
		content: '퐁피두센터가 휴관이라 아쉬웠는데 마레 지구 갤러리 골목을 걷는 게 오히려 더 재미있었어요.\n피카소 미술관도 생각보다 작품이 많았고, 보주 광장에서 쉬어 간 시간도 좋았습니다.',
		image: '', travelDate: Mock.rel(-6), createdAt: Mock.rel(-6, '17:30')
	},
	{
		id: 18, tourId: 11, best: 0, rating: 5, author: '전*우', views: 61,
		title: '로마 단독 투어, 아이와 함께 편하게',
		content: '초등학생 아이 둘과 함께라 단체 투어는 엄두가 안 났는데, 단독 투어라 아이 속도에 맞춰 다닐 수 있었어요.\n바티칸 입장 예약까지 대신 해 주셔서 줄 서지 않고 바로 들어갔습니다.',
		image: '', travelDate: Mock.rel(-50), createdAt: Mock.rel(-47, '12:12')
	}
], { version: '1' });
