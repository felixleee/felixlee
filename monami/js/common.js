// common.js 대충 정리 (20090817 )

// 주민등록번호,이메일 자동 자리이동
function nextfocus(arg,len,nextname) {
	if(arg.value.length==len){
			nextname.focus();
	return;
	}
}

// 이메일체크
function check_email(email) {
	var filter=/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i
	if(filter.test(email)) {
		return true;
	}
	else {
		return false;
	}
}

// 중앙에 팝업
function WinOpen(link,title,w,h,sc){
	var winX = 0;
	var winY = 0;
	if (parseInt(navigator.appVersion) >= 4) {
		winX = (screen.availWidth - w)*.5;
		winY = (screen.availHeight - h)*.5;
	}
	var features = 'width=' + w + ',height=' + h + ',left=' + winX + ',top=' + winY+',scrollbars='+ sc;
	popupWin = window.open(link, title, features);
}

// 프린트 하기
var initBody;
function beforePrint() { 
	initBody = document.body.innerHTML; 
	if(document.getElementById("GoodsPrintForm")){
		document.body.innerHTML = document.getElementById("GoodsPrintForm").innerHTML; 
	}
}

function afterPrint(){ 
	document.body.innerHTML = initBody; 
} 

function printArea(){ 
	window.print(); 	
} 

// 숫자만 입력하기
function ChkNum(form,event){
	var key = event.keyCode;
	if(!(key==8||key==9||key==13||key==44||key==46||key==144||(key>=48&&key<=57)||(key>=96&&key<=107)|| key==110||key==190||key==188||key==37||key==39||key==109)){
		if( event.preventDefault ){//IE 9 & Chrome 호환
			event.preventDefault();
		}else{
			event.returnValue = false;
		}
	}
}

// 콤마 없애기
function replaceComma(str) {
	return str.replace(/,/g, '');
}

//콤마 넣기(문자만 해당)
function comma(num){

	var tmp = num.substring(0,1);
	var minus='';
	
	if(tmp=='-') {
		val = num;
		minus='-';
	}else val=num;
	
	val = get_number(val);

	if(val=='') return '0';
	
	if(val.length <= 3) return val;

	var loop = Math.ceil(val.length / 3);
	var offset = val.length % 3;
	if((val.length % 3)==0){
		offset = 3;
	}
	var ret = val.substring(0, offset);
	for(i=1;i<loop;i++){
		ret += "," + val.substring(offset, offset+3);
		offset += 3;
	}
	
	return minus+ret;
}

function number_format(num) {
	num = num.replace(/,/g, "")
	var num_str = num.toString()
	var result = ''

	for(var i=0; i<num_str.length; i++) {
		var tmp = num_str.length-(i+1)
		if(i%3==0 && i!=0) result = ',' + result
			result = num_str.charAt(tmp) + result
	}

	return result
}

// 문자열에서 숫자만 가져가기
function get_number(str){
	var val = str;
	var temp = "";
	var num = "";

	for(i=0; i<val.length; i++){
		temp = val.charAt(i);
		if(temp >= "0" && temp <= "9") num += temp;
	}
	return num;
}

// 한글만 입력하기
function checkKor(){
	if(event.keyCode>=33 && event.keyCode<=126){
		return false;
	}
}

// Wish List 에 추가하는 함수
function wishlist(g_uid){
	document.add.location.replace("../mypage/wishlist_add.html?g_uid="+g_uid);	
}

// 새창소스
function MM_openBrWindow(theURL,winName,features) { //v2.0
	window.open(theURL,winName,features);
}

// 토글메뉴
var old_menu = '';
function toggleMenu(submenu) {
	if( old_menu != submenu ) {
		if( old_menu !='' ) {
			old_menu.style.display = 'none';
		}
		submenu.style.display = '';
		old_menu = submenu;
	} else {
		submenu.style.display = 'none';
		old_menu = '';
	}
}

// 검색 체크
function search_formcheck(){
	var here = document.search_form

	if(here.b_uid.value == ""){
		alert("카테고리를 입력하세요")
		here.b_uid.focus()
		return
	}

	here.submit()
}



function MM_jumpMenu(targ,selObj,restore){ //v3.0
  eval(targ+".location='"+selObj.options[selObj.selectedIndex].value+"'");
  if (restore) selObj.selectedIndex=0;
}

function MM_swapImgRestore() { //v3.0
  var i,x,a=document.MM_sr; for(i=0;a&&i<a.length&&(x=a[i])&&x.oSrc;i++) x.src=x.oSrc;
}

function MM_preloadImages() { //v3.0
  var d=document; if(d.images){ if(!d.MM_p) d.MM_p=new Array();
    var i,j=d.MM_p.length,a=MM_preloadImages.arguments; for(i=0; i<a.length; i++)
    if (a[i].indexOf("#")!=0){ d.MM_p[j]=new Image; d.MM_p[j++].src=a[i];}}
}

function MM_findObj(n, d) { //v4.01
  var p,i,x;  if(!d) d=document; if((p=n.indexOf("?"))>0&&parent.frames.length) {
    d=parent.frames[n.substring(p+1)].document; n=n.substring(0,p);}
  if(!(x=d[n])&&d.all) x=d.all[n]; for (i=0;!x&&i<d.forms.length;i++) x=d.forms[i][n];
  for(i=0;!x&&d.layers&&i<d.layers.length;i++) x=MM_findObj(n,d.layers[i].document);
  if(!x && d.getElementById) x=d.getElementById(n); return x;
}

function MM_swapImage() { //v3.0
  var i,j=0,x,a=MM_swapImage.arguments; document.MM_sr=new Array; for(i=0;i<(a.length-2);i+=3)
   if ((x=MM_findObj(a[i]))!=null){document.MM_sr[j++]=x; if(!x.oSrc) x.oSrc=x.src; x.src=a[i+2];}
}

function MM_showHideLayers() { //v6.0
  var i,p,v,obj,args=MM_showHideLayers.arguments;
  for (i=0; i<(args.length-2); i+=3) if ((obj=MM_findObj(args[i]))!=null) { v=args[i+2];
    if (obj.style) { obj=obj.style; v=(v=='show')?'visible':(v=='hide')?'hidden':v; }
    obj.visibility=v; }
}

function MM_reloadPage(init) {  //reloads the window if Nav4 resized
  if (init==true) with (navigator) {if ((appName=="Netscape")&&(parseInt(appVersion)==4)) {
    document.MM_pgW=innerWidth; document.MM_pgH=innerHeight; onresize=MM_reloadPage; }}
  else if (innerWidth!=document.MM_pgW || innerHeight!=document.MM_pgH) location.reload();
}

MM_reloadPage(true);
 
// 이메일 도메인 선택 및 직접입력으로 변경
function email_input(domain_nm,input_obj)
{
	if(!domain_nm){
		alert('이메일 도메인을 선택하세요.');
		input_obj.value=domain_nm;
		input_obj.readOnly=true;
		return;
	}
	
	if(domain_nm=="direct") {
		input_obj.readOnly=false;
		input_obj.value="";
		input_obj.focus();
	}else{
		input_obj.value=domain_nm;
		input_obj.readOnly=true;
	}
}


// 레이어중앙에
function LayerCenter(obj,layerbg,top) {

	if (obj) {

		var h = (window.innerHeight || self.innerHeight || document.documentElement.clientHeight || document.body.clientHeight);
		var w = (window.innerWidth || self.innerWidth || document.documentElement.clientWidth || document.body.clientWidth);
		var l = ((window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft) + ((w-(obj.width||parseInt(obj.style.width)||obj.offsetWidth))/2));
		var t = ((window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop) + ((h-(obj.height||parseInt(obj.style.height)||obj.offsetHeight))/2));

						
		if((obj.width||parseInt(obj.style.width)||obj.offsetWidth) >= w) l = 0;
		if((obj.height||parseInt(obj.style.height)||obj.offsetHeight) >= h) t = (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop);
					
		obj.style.display = 'block';
		
		obj.style.left = l + "px";
		if(top=="top"){
			obj.style.top="10px";
		}else{
			obj.style.top = t + "px";
		}
		if(layerbg!="N"){

			document.getElementById("inputLayerBg").style.display = 'block';
			if (document.documentElement.scrollHeight > document.body.scrollHeight) {
				document.getElementById("inputLayerBg").style.height = document.documentElement.scrollHeight + 'px';
			} else { 
				document.getElementById("inputLayerBg").style.height = document.body.scrollHeight + 'px';
			}
		}
	}
}  
  

function loadingBarOffTime()
{
   setTimeout("loadingBarOff()", 50);

}


function loadingBarOn(layerbg)
{
	document.getElementById("loadingBar").style.display = "block";
	if(layerbg=="N"){
		LayerCenter(document.getElementById("loadingBar"),layerbg);	
	}else{
		LayerCenter(document.getElementById("loadingBar"));	
	}
}

function loadingBarOff(layerbg)
{
	document.getElementById("loadingBar").style.display = "none";

	if(layerbg!="N"){
		document.getElementById("inputLayerBg").style.display = 'none';
	}

}

//이미지뷰
function OnViewGood(imgObj,imgSrc,imgExp,ImgWidth,ImgHeight){

	if((navigator.appName.indexOf('Microsoft')+1)){
		if(document.getElementById(imgObj).filters.blendTrans ){
			document.getElementById(imgObj).filters.blendTrans.stop();
			document.getElementById(imgObj).filters.blendTrans.Apply();
			document.getElementById(imgObj).filters.blendTrans.Play();
		}
	}

	document.getElementById(imgObj).src = imgSrc;
	
	if(document.getElementById('ImgMemo')){
		
		if(imgExp){
			document.getElementById('ImgMemo').innerHTML = imgExp;
		}else{
			document.getElementById('ImgMemo').innerHTML = "&nbsp;";
		}
	
	}
	if(ImgWidth){
		document.getElementById(imgObj).width = ImgWidth;
	}
	if(ImgHeight){
		document.getElementById(imgObj).height = ImgHeight;
	}

}

//스크롤바 함수 시작
function scrollTop()	{
	var scrollTop = document.scrollTop ? document.scrollTop : document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop;
	return scrollTop;
}

//quickSlide("quick","15","58","0");// 지정 엘레멘트 id, 적용 setInterval 속도, 퀵바 초기 top 위치, footer로부터 떨어질 최소 위치style="position:absolute;"

function	quickSlide(elId,speed,topPosition,botPosition)	{
	var quickId = document.getElementById(elId);
	var topPosition = topPosition;
	var botPosition = botPosition;
		
	var wrapperHeight = document.getElementById("wrapper").offsetHeight;


	quickId.style.top = parseInt(topPosition) + "px";

	var speedPlus = 0;

	var quickSlide = setInterval(function()	{
		if (parseInt(quickId.style.top) < parseInt(scrollTop()) + parseInt(topPosition) && parseInt(quickId.style.top) < parseInt(wrapperHeight) - parseInt(quickId.offsetHeight) - parseInt(botPosition))
		{
			quickId.style.top = parseInt(quickId.style.top) + speedPlus + "px";
			speedPlus = speedPlus + 1;
			if (parseInt(quickId.style.top) >= parseInt(scrollTop()) + parseInt(topPosition))
			{
				quickId.style.top = parseInt(scrollTop()) + parseInt(topPosition) + "px";
				speedPlus = 0;
				if (parseInt(quickId.style.top) >= parseInt(wrapperHeight) - parseInt(quickId.offsetHeight) - parseInt(botPosition))
				{
					quickId.style.top = parseInt(wrapperHeight) - parseInt(quickId.offsetHeight) - parseInt(botPosition) + "px";
				}
			}
		}

		if (parseInt(quickId.style.top) > parseInt(scrollTop()) + parseInt(topPosition))
		{
			quickId.style.top = parseInt(quickId.style.top) - speedPlus + "px";
			speedPlus = speedPlus + 1;
			if (parseInt(quickId.style.top) <= parseInt(scrollTop()) + parseInt(topPosition))
			{
				quickId.style.top = parseInt(scrollTop()) + parseInt(topPosition) + "px";
				speedPlus = 0;
			}
		}


	},speed);
}

//스크롤바 함수 끝



function Proc_Ajax(tagName,para_type,N) {//파일명,폼타입,로딩바
	if(N=="N"){
		loadingBarOn('N');
	}
	if(para_type){
		parameter_type=$(para_type).serialize()
	}else{
		parameter_type={v:tagName}
	}
	
    var url = tagName;
    var myAjax = new Ajax.Updater  (
		 { success : 'ajax_Proc' },    // 성공시 실행할 함수

		  url,
		  {
		  method            : 'POST',
		   parameters        :  parameter_type,    // 파라메터
		  onFailure        :  function() { alert('문제가 발생하였습니다');loadingBarOff();} ,    // 실패시 실행할 함수
		  evalScripts              :  true        // 읽어들이는 파일내에 스크립트허용

		  }
	  );
	  
}
function isMs(){
	if ((navigator.appName.indexOf('Microsoft')+1)) {
		return true
	}else{
		return false
	}
}
function ViewLayer(event,id,Left,Top){

	//위, 왼쪽 스크롤 레퍼런스화
	if(!Left){
		Left=-85;
	}
	if(!Top){
		Top=-10;
	}

	if(document.body.scrollTop){
		var intScrollTop = document.body.scrollTop;
		var intScrollLeft = document.body.scrollLeft;
	}else{
		var intScrollTop = document.documentElement.scrollTop;
		var intScrollLeft = document.documentElement.scrollLeft;
	}

	//이벤트 발생위치 좌표(마우스 클릭위치) 레퍼런스
	if(isMs()){
		var intClientY = window.event.clientY;
		var intClientX = window.event.clientX;
	}else{
		var intClientY = event.pageY-pageYOffset ;
		var intClientX = event.pageX-pageXOffset;
	}

	//나타낼 디스플레이 좌표 레퍼런스
	var intThisPositionTop = (intClientY + intScrollTop) +(parseInt(Top));
	var intThisPositionLeft = (intClientX + intScrollLeft) +(parseInt(Left));

	if(document.getElementById(id).style.display=="block"){
		document.getElementById(id).style.display="none";
	}else{
		document.getElementById(id).style.display="block";
	}

	document.getElementById(id).style.left = intThisPositionLeft+"px";

	document.getElementById(id).style.top  = intThisPositionTop+"px";

}


function AddPerson(obj,num,res_type) {
	var re_person1 = document.getElementById("re_person1").value;
	var re_person2 = document.getElementById("re_person2").value;
	var re_person3 = document.getElementById("re_person3").value;

	document.getElementById("t_person").value=parseInt(re_person1)+parseInt(re_person2)+parseInt(re_person3);

	var len = document.getElementById("t_person").value;

	if(obj=="hotel"){
		var chklen = parseInt(re_person1)+parseInt(re_person2);
		firNum=1;
	}else{
		
		var chklen = parseInt(re_person1)+parseInt(re_person2)+parseInt(re_person3);
		firNum=0;
	}
	
	if(res_type=='A' && parseInt(len) > parseInt(num)){
		if(confirm('예약가능인원을 초과하였습니다. 대기예약으로 진행하시겠습니까?')){		
			document.getElementById("res_type").value="B";
			document.getElementById("Res_Img").src="/image/btn/icorn_reservation04.gif";
			AddPersonProc(len,obj);

		}else{				
			document.getElementById("re_person1").value="0";
			document.getElementById("re_person2").value="0";
			document.getElementById("re_person3").value="0";
			document.getElementById("t_person").value="0";
			document.getElementById("res_type").value="A";
			document.getElementById("Res_Img").src="/image/btn/icorn_reservation01.gif";
			AddPersonProc(firNum,obj);
		}
	}else{
		//document.getElementById("res_type").value="A";
		AddPersonProc(len,obj);
	}
}

function AddPersonProc(len,obj){
	
	var tagName="/product/AddPerson.php?len="+len+"&type="+obj;
	var url = tagName;
	var myAjax = new Ajax.Request(url,
	{
	method: 'post',
	parameters: {v:tagName},
	onSuccess: AddPersonTagList
	}
	);
}

function AddPersonTagList(reqResult) {
	$('AddPersonDiv').innerHTML = reqResult.responseText ; //dataobj;

	if(document.getElementById("Chk_Same") && document.getElementById("Chk_Same").checked==true){
		
	}else{
		document.getElementById("Chk_Same").checked=false;
	}

	Chk_AddP();
}



function check_photo(obj)
{
	var img_type_arr = [".gif",".jpeg",".jpg",".GIF",".JPEG",".JPG"];
	var chk_img = false;

	for(var i=0 ; i < img_type_arr.length ; i++){
		if(obj.indexOf(img_type_arr[i]) > 0){
			chk_img = true;
		}
	}

	if(chk_img==false)return false;
	else return true;
}


function layer_ctl(str,target) {
	document.getElementById('Layer_popup_1').style.display='none';
	document.getElementById('Layer_popup_'+target).style.top = document.body.scrollTop + 50 +'px';
	document.getElementById('Layer_popup_'+target).style.left = 50+'px' ;
	document.getElementById('Layer_popup_'+target).style.display=str;
}


//우편번호찾기
function CheckFormZip(z1,z2,z3){
	var f = document.zipform;
	if(f.SearchWord.value.split(" ").join("") == false){
		alert("찾으시는 주소(지역명-동,읍,면)를 입력하세요");
		f.SearchWord.focus();
		return false;
	}

	if(f.SearchWord.value.length <2){
		alert("지역명은 두글자 이상 입력하세요");
		f.SearchWord.focus();
		return false;
	}
	f.submit();
}


// 우편번호 주소 선택 함수
// @address 추가
function selectIt(zipcode, sido, gugun, dong, z1, z2, z3, address) {
	var juso = sido + " " + gugun + " " + dong;
	if (address != undefined) juso = address;

	parent.document.getElementById(z1).value = zipcode;
	parent.document.getElementById(z2).value = juso;
	if (z3) parent.document.getElementById(z3).focus();
}


//파라메터의 n일 후 
function setafterday(date,n)
{
	if(!n) n=1;

	var selectDate = date.split("-");
	var changeDate = new Date();

	changeDate.setFullYear(selectDate[0], selectDate[1]-1, selectDate[2]);
	ndate = changeDate.valueOf()+1000*60*60*24*n;
	newdate = new Date(ndate);

	var y = newdate.getFullYear();
	var m = newdate.getMonth() + 1;
	var d = newdate.getDate();
	if( m<10 ) m = "0" + m;
	if( d<10 ) d = "0" + d;
	
	var resultDate = y + "-" + m + "-" + d;
	return resultDate;
}

//두 날짜사이에 차이일수(edate-sdate)
function date_between_date(sdate,edate)
{
	var sdt,edt;

	sdate_arr = sdate.split("-");
	sdt=new Date();
	sdt.setFullYear(sdate_arr[0],sdate_arr[1]-1,sdate_arr[2])

	edate_arr = edate.split("-");
	edt=new Date();
	edt.setFullYear(edate_arr[0],edate_arr[1]-1,edate_arr[2])

	return (edt-sdt)/1000/60/60/24;
}

// 날짜 더하기 빼기
// dateAddDel('2017-09-25', -7, 'd') => 2017-09-18
// dateAddDel('2017-09-25', -1, 'm') => 2017-08-25
// dateAddDel('2017-09-25', -1, 'y') => 2016-09-25
function dateAddDel(sDate, nNum, type) {
	var yy = parseInt(sDate.substr(0, 4), 10);
	var mm = parseInt(sDate.substr(5, 2), 10);
	var dd = parseInt(sDate.substr(8), 10);

	if (type == "d") {
			d = new Date(yy, mm - 1, dd + nNum);
	}
	else if (type == "m") {
			d = new Date(yy, mm - 1 + nNum, dd);
	}
	else if (type == "y") {
			d = new Date(yy + nNum, mm - 1, dd);
	}

	yy = d.getFullYear();
	mm = d.getMonth() + 1; mm = (mm < 10) ? '0' + mm : mm;
	dd = d.getDate(); dd = (dd < 10) ? '0' + dd : dd;

	return '' + yy + '-' +  mm  + '-' + dd;
}

// 오늘날짜
function cur_date()
{
	var date = new Date();
	var yyyy = date.getFullYear();
	var m = parseInt(date.getMonth())+1;
	var dd = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
	 
	var mm = m>9 ? m : '0'+m.toString();
	
	return yyyy+"-"+mm+"-"+dd;
}



