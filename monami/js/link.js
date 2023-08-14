/*태국 */
function goPage(type, param, param2, param3){
	if(typeof(param)=='undefined') param = '';
	if(typeof(param2)=='undefined') param2 = '';
	var this_href = location.pathname;
	var url = "";
	
	switch(type) {
		case "product" : 
			url="../product/list.html?b_uid="+param+"&m_uid="+param2;
		break;

		case "hotel": 
			url="../hotel/list.html?b_uid="+param;
		break;

		case "air": url="../air/list.html?b_uid="+param;
		break;

		case "area": 
			url="../area/list.html?Tpe="+param+"&b_uid="+param2;
		break;

		case "login": url="../member/login.html?Url="+param; //로그인
		break;
		case "reserv": url="../mypage/reserv.html"; //로그인
		break;
		case "join" : url="../member/index.html";
		break;

		case "logout" : url="../mypage/logout.html";
		break;
		case "mypage" : url="../mypage/reserv.html"; //로그인
		break;

		case "board": 
			if(param=='') param='NOTICE';
			url="../cmm/index.html?BD_CD="+param+'&b_uid='+param2;
		break;

		default : alert("잘못된 링크입니다");
		break;
	}

	if(param3 && this_href.indexOf('/product/list.html')>-1){
		start_date_view(param3,'open');
		return false;
	}

	if(url) location.href=url;
	return false;
}

var getParameter = function (param) {
    var returnValue;
    var url = location.href;
    var parameters = (url.slice(url.indexOf('?') + 1, url.length)).split('&');
    for (var i = 0; i < parameters.length; i++) {
        var varName = parameters[i].split('=')[0];
        if (varName.toUpperCase() == param.toUpperCase()) {
            returnValue = parameters[i].split('=')[1];
            return decodeURIComponent(returnValue);
        }
    }
};


function bchange(b_uid, m_uid){
	var this_href = location.href;
	var loc = this_href.substring(0,this_href.indexOf("?"));

	switch(b_uid){
		case "1":
			switch(m_uid){
				case "5": m_uid = 1; break;
				case "6": m_uid = 2; break;
				case "7": m_uid = 3; break;
				case "8": m_uid = 4; break;
				default : m_uid = 1; break;
			}
		break;
		
		case "2":
			switch(m_uid){
				case "1": m_uid = 5; break;
				case "2": m_uid = 6; break;
				case "3": m_uid = 7; break;
				case "4": m_uid = 8; break;
				default : m_uid = 5; break;
			}
		break;

		default : 
			b_uid=1;
		break;
	}
	
	var url = "";
	if(this_href.indexOf('/main/main.html')>-1){
		url = loc+'?b_uid='+b_uid;
	}else if(this_href.indexOf('/product/list.html')>-1){
		url = loc+'?b_uid='+b_uid+'&m_uid='+m_uid;
	}else if(this_href.indexOf('/hotel/list.html')>-1){
		url = loc+'?b_uid='+b_uid;
	}else if(this_href.indexOf('/air/list.html')>-1){
		url = loc+'?b_uid='+b_uid;
	}else{
		url = "/main/main.html?b_uid="+b_uid+"&m_uid="+m_uid;
	}

	if(url) location.href=url;
}


function go_goodMain(g_uid,b_uid,m_uid,s_uid,d_uid,sd){
	var url = "../product/info_main.html?";
	url += 'g_uid='+g_uid;
	if(b_uid) url += '&b_uid='+b_uid;
	if(m_uid) url += '&m_uid='+m_uid;
	if(s_uid) url += '&s_uid='+s_uid;
	if(d_uid) url += '&d_uid='+d_uid;
	if(sd) url += '&sd='+sd;

	if(url) location.href=url;
	return false;	
}

