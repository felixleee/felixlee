function error() { // 우편번호 찾기를 이용하지 않았을 때의 에러
  alert('검색 버튼을 이용하세요!');
}


function reset(){
      document.form.reset();
	  document.form.id.focus();
	  return;
}

//이메일체크
function check_email(email){
	var filter=/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i
	if(filter.test(email))
	{
		return true;
	}
	else
	{
		return false;
	}
}

//숫자만 입력하기
function ChkNum(form,event){
	var key = event.keyCode;
	if(!(key==8||key==9||key==13||key==44||key==46||key==144||(key>=48&&key<=57)||(key>=96&&key<=107)|| key==110||key==190||key==188||key==37||key==39)){
		event.returnValue = false;
	}
}

function replaceComma(str) { // 콤마 없애기
	while(str.indexOf(",") > -1) {
		str = str.replace(",", "");
	}
	return str;
}
//콤마 넣기(정수만 해당)
function comma(val){

	val = get_number(val);

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
	return ret;
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
//문자열에서 숫자만 가져가기
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

//한글만 입력하기
function checkKor(){
	if(event.keyCode>=33 && event.keyCode<=126){
		return false;
	}
}


//사업자번호 체크
function is_binNo(num){
	var reg = /([0-9]{3})-?([0-9]{2})-?([0-9]{5})/;
	if(!reg.test(num))
		return false;

	num = RegExp.$1 + RegExp.$2 + RegExp.$3;
	var cVal = 0;
	for(var i=0; i<8; i++)
	{
		var cKeyNum = parseInt(((_tmp = i % 3) == 0) ? 1 : ( _tmp  == 1 ) ? 3 : 7);
		cVal += (parseFloat(num.substring(i,i+1)) * cKeyNum) % 10;
	}

	var li_temp = parseFloat(num.substring(i,i+1)) * 5 + '0';
	cVal += parseFloat(li_temp.substring(0,1)) + parseFloat(li_temp.substring(1,2));
	return (parseInt(num.substring(9,10)) == 10-(cVal % 10)%10);
}

//========================== 주민등록번호로 생년월일 입력 ======================
function inputbirth(){
	var temp1,temp2,temp3;
	temp1=document.form.me_jumin1.value.substring(0,2);
	temp2=document.form.me_jumin1.value.substring(2,4);
	temp3=document.form.me_jumin1.value.substring(4,6);
	if( temp1 < 30 ){ document.form.me_birth1.value="20"+temp1; }
	else { document.form.me_birth1.value="19"+temp1; }
	document.form.me_birth2.value=temp2;
	document.form.me_birth3.value=temp3;
}

//########################################################################################//

function join_check(){
	var f = document.form;

//#############################
// 아이디 체크
//#############################
	if(!f.me_id.value){
		alert("ID는 4~12자로 영문,숫자 조합가능.");
		f.me_id.focus();
		return false;
	}

//#############################
// 패스워드 체크
//#############################
	if(!f.me_passwd1.value){
		alert("비밀번호는 4~12자로 영문,숫자 조합가능.");
		f.me_passwd1.focus();
		return false;
	}

	if(!f.me_passwd2.value || f.me_passwd1.value != f.me_passwd2.value){
		alert("비밀번호가틀립니다.");
		f.me_passwd2.focus();
		return false;
	}

//#############################
// 이름 체크
//#############################
	if(!f.me_name.value){
		alert("이름을 입력하세요");
		f.me_name.focus();
		return false;
	}

//#############################
// 주민등록번호 체크
//#############################

	if(!f.me_jumin1.value || f.me_jumin1.value.length != 6){
		alert("주민등록번호를 입력하세요");
		f.me_jumin1.focus();
		return false;
	}else if(!f.me_jumin2.value || f.me_jumin2.value.length != 7){
		alert("주민등록번호를 입력하세요");
		f.me_jumin2.focus();
		return false;
	}else{
		var resident1 = f.me_jumin1.value;
		var resident2 = f.me_jumin2.value;
		var residentNum=resident1+resident2;

		a = new Array(13);

		for (var i=0; i < 13; i++) {

			a[i] = parseInt(residentNum.charAt(i));
		}

		var j = a[0]*2 + a[1]*3 + a[2]*4 + a[3]*5 + a[4]*6 + a[5]*7 + a[6]*8 + a[7]*9 + a[8]*2 + a[9]*3 + a[10]*4 + a[11]*5;
		var j = j % 11;
		var k = 11 - j;
		var m = a[0]
		var n = a[1]

		if (k > 9){
			k = k % 10
		}

		if (k != a[12]){
			alert("주민등록번호가 올바르지 않습니다.");
			f.me_jumin1.focus();
			return false;
		}
	}

//#############################
// E-Mail 체크
//#############################
	if(!f.me_email.value){
		alert("E-Mail를 입력하세요");
		f.me_email.focus();
		return false;
	}else{
		if(!check_email(f.me_email.value)){
			alert("잘못된 E-Mail 입니다.");
			f.me_email.focus();
			return false;
		}
	}

//#############################
// 전화번호 체크
//#############################
	if(!f.me_phone.value){
		alert("연락처를 입력하세요");
		f.me_phone.focus();
		return false;
	}


//#############################
// 주소 체크
//#############################

	if(!f.me_address1.value){
		alert("주소를 입력하세요");
		f.me_address1.focus();
		return false;
	}
	if(!f.me_address2.value){
		alert("상세 주소를 입력하세요");
		f.me_address2.focus();
		return false;
	}

	f.submit();
}

//======================== 아이디 중복 검사 ====================================
function IDCheck(){

	var fm = document.form;

	if ( fm.me_id.value == "" ) {
		alert("사용하실 ID를 먼저 입력해 주세요");
		fm.me_id.focus();
	}
	else if( fm.me_id.value == "admin" ){
		alert("해당 아이디는 등록이 불가능한 아이디입니다.");
		fm.me_id.focus();
	}
	else {
		window.open('id_search.html?me_id='+fm.me_id.value,'IDCheck','width=420,height=235,toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=no');
	}
}

//========================== 주민등록번호,이메일 자동 자리이동 =================
function nextfocus(arg,len,nextname){
	if(arg.value.length==len){
			nextname.focus();
	return;
	}
}