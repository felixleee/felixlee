function MY_CAL(obj, StDate, EnDate, currYear, currMonth){
	
	/*loading_html = "<div><table width='100%' height='274'><tr><td align='center'><img src='/image/ajax-loader.gif' ></td></tr></table></div>";
	jQuery(obj).html(loading_html);*/

	obj = obj.replace('#','@');//jquery id셀렉터의 #문자 처리
	if(!currYear) currYear='';
	if(!currMonth) currMonth='';

	if(!StDate) StDate = top_sDate;
	if(!EnDate) EnDate = top_eDate;

	var param = "?StDate="+StDate+"&EnDate="+EnDate+"&obj="+obj+'&currYear='+currYear+'&currMonth='+currMonth;
	axCalList4(encodeURI("/js/Calendar/ResCal_myplan.php"+param), obj);
}



function axCalList4(url, obj) {
	if (!url) return;
	if(!obj) return;

	obj = obj.replace('@','#');//jquery id셀렉터의 #문자 처리
	
	var TO_Ajax = jQuery.ajax({
		type:"POST",
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



function fnc_Value_Return4(DateStr){
	if(started==true){
		if(!confirm('새로시작합니다.')){
			return false;
		}
		top_sDate = DateStr;
		myplan.top_change();
		myplan_start();
	}else{
		top_sDate = DateStr;
		myplan.top_change();
	}

	

}