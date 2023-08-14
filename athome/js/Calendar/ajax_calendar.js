//달력 불러오기함수, axCalList2
function RES_CAL(Module,g_uid,b_uid,m_uid,s_uid,InDate, obj){
	//hideSelect();
	if(!g_uid) return;

	if(!Module) Module = "01";

	StDate = 0;

	Mode="";
	Type="";
	if(!b_uid) b_uid="";
	if(!m_uid) m_uid="";
	if(!s_uid) s_uid="";
	if(!InDate) InDate="";

	loading_html = "<div><table width='100%' height='274'><tr><td align='center'><img src='/image/ajax-loader.gif' ></td></tr></table></div>";
	jQuery(obj).html(loading_html);

	obj = obj.replace('#','@');//jquery id셀렉터의 #문자 처리

	axCalList2(encodeURI("/js/Calendar/ResCal.php?g_uid="+g_uid+"&b_uid="+b_uid+"&m_uid="+m_uid+"&StDate="+StDate+"&s_uid="+s_uid+"&Type="+Type+"&Mode="+Mode+"&InDate="+InDate+'&Module='+Module+'&obj='+obj), obj);
}

function axCalList2(url, obj) {

	if (!url) return;
	if(!obj) return;
	
	obj = obj.replace('@','#');//jquery id셀렉터의 #문자 처리
	if($(obj).attr('more-view')=='Y'){
		url += '&more_view=Y';
	}

	var TO_Ajax = jQuery.ajax({
		data:"POST",
		async:true,
		cache:false,
		url: url,
		dataType: "html",
		success: function(data){
			//alert(html);
				jQuery(obj).html(data);
			}
	});
}

function fnc_Value_Return2(d_uid, DateStr, Module, g_uid, b_uid, m_uid, s_uid){

	/* 오늘날짜 */
	/*
	var dt = new Date();
	dt.setHours(0, 0, 0, 0);
	var dm = (parseInt(dt.getMonth() + 1) > 9)?dt.getMonth() + 1:"0"+(dt.getMonth() + 1);
	var dd = (dt.getDate()>9)?dt.getDate():"0"+dt.getDate();
	var dtStr = dt.getFullYear() + "-" + dm + "-" + dd;
	*/

	if(!Module) return;

	if(Module=='01'){
		var file_name = "./tour_view.html";
		var url = file_name+"?b_uid_s="+b_uid+"&m_uid_s="+m_uid+"&s_uid_s="+s_uid+"&g_uid="+g_uid+'&sd='+DateStr+'&Module='+Module+'&d_uid='+d_uid;
	}else if(Module=='03'){
		var file_name = "./tour_view.html";
		var url = file_name+"?b_uid_s="+b_uid+"&m_uid_s="+m_uid+"&s_uid_s="+s_uid+"&g_uid="+g_uid+'&sd='+DateStr+'&Module='+Module+'&d_uid='+d_uid;
	}
	self.location.href = url;
}


//패키지리스트용 출발일정보기
function start_date_view(g_uid, type, start_date, b_uid, m_uid, s_uid){
	if(!g_uid) return;
	var obj = '#air_date_div_'+g_uid; // 달력출력대상 레이어
	if(typeof(b_uid)=='undefined') b_uid = '';
	if(typeof(m_uid)=='undefined') m_uid = '';
	if(typeof(s_uid)=='undefined') s_uid = '';
	if(typeof(start_date)=='undefinded') start_date ='';

	var btntext = $('#date_view_btn_'+g_uid).html();

	if(typeof(start_date)=='undefined') start_date = '';

	if($('#date_view_btn_'+g_uid).size()==0){
		location.href="list.html?b_uid_s="+b_uid+"&m_uid_s="+m_uid+"&s_uid_s="+s_uid+"&g_uid_s="+g_uid+"&min_date="+start_date;
		return;
	}

	if(type == 'open' || jQuery(obj).is(':hidden')){//숨김상태면
		
		//한번만 실행
		if(jQuery(obj).html()=='') RES_CAL('01',g_uid,b_uid,m_uid,s_uid, start_date, obj);

		jQuery(obj).slideDown(300);
		jQuery('#date_view_btn_'+g_uid).html(btntext.replace('보기','닫기'));
		jQuery('#date_view_btn_'+g_uid).parent().removeClass('btn_sch_on').addClass('btn_sch_off');
		scrollLink('#top_'+g_uid, 10);
	}else{
		scrollLink('#top_'+g_uid, 10);
		jQuery(obj).slideUp(300);
		jQuery('#date_view_btn_'+g_uid).html(btntext.replace('닫기','보기')).parent('P').removeClass('btn_sch_off').addClass('btn_sch_on');
	}
}

//더보기
function more_view_toggle(obj){
	var $list = jQuery(obj).siblings('div.sch_list_wrap');//일정목록 오른쪽
	var $good = jQuery(obj).parent('div').siblings('div.product_info_w');//상품
	
	var position = $good.offset();
	if(position) jQuery('html, body').animate({scrollTop : position.top-10 }, 'fast', 'swing'); //상품상세에서는 동작안함

	if(jQuery(obj).parent('div').attr('more-view')!='Y'){
		$list.animate({
			height: ($list.children('table').height()+10) + "px"
		}, 'fast', function(){
			jQuery(obj).html('닫기');
			jQuery(obj).attr('class','btn_close');
			jQuery(obj).parent('div').attr('more-view','Y');
		});
	}else{
		$list.animate({
			height: "270px"
		}, 'fast', function(){
			jQuery(obj).html('더보기');
			jQuery(obj).attr('class','btn_more');
			jQuery(obj).parent('div').attr('more-view','N');
		});
	}
}