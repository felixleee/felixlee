//달력 불러오기함수, axCalList2
function RES_CAL3(Module,g_uid,b_uid,m_uid,s_uid,InDate, obj){
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

	//행사명은 필수선택사항
	if(Module=='01' && !b_uid){
		jQuery(obj).html('<b>행사명을 선택해주세요↑</b>');
		return;
	}

	obj = obj.replace('#','@');//jquery id셀렉터의 #문자 처리

	axCalList3(encodeURI("/js/Calendar/ResCal_admin.php?g_uid="+g_uid+"&b_uid="+b_uid+"&m_uid="+m_uid+"&StDate="+StDate+"&s_uid="+s_uid+"&Type="+Type+"&Mode="+Mode+"&InDate="+InDate+'&Module='+Module+'&obj='+obj), obj, Module);

	
}

function axCalList3(url, obj, Module) {

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
				//다음달로 넘겼다가 돌아왔을때 td 색칠
				if(Module=='03' || Module=='01' || Module=='04'){
					$("input[name='room_date_s2[]']").each(function(){
						DateStr = $(this).val();
						$('#date_cal_'+DateStr).children('div').addClass('select');
					});
				}
			}
	});
}


function fnc_Value_Return3(d_uid, DateStr, Module, g_uid, b_uid, m_uid, s_uid){

	if(!Module) return;

	if(Module=='01' || Module=='03' || Module=='04'){
		if($('#room_date_s2_'+DateStr).size()){
			fnc_Value_remove3(Module,DateStr);
			return;
		}

		var str = "<input name='room_date_s2[]' id='room_date_s2_"+DateStr+"' type='hidden' class='input_text' size='12' value='"+DateStr+"' title='클릭시 삭제' readonly onclick=\"fnc_Value_remove3('"+Module+"','"+DateStr+"')\" style='margin:3px;'/>";
		$('#check_date_view').append(str);
		$('#date_cal_'+DateStr).children('div').addClass('select');
	}
}

function fnc_Value_remove3(Module, DateStr){

	if(Module=='03' || Module=='01' || Module=='04'){
		$('#room_date_s2_'+DateStr).remove();
		$('#date_cal_'+DateStr).children('div').removeClass('select');
	}

	return;
}
