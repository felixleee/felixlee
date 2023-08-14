<? include "../../Lib/_common.php"; // 공통 인클루드 ?>
<!-- <link href="/Calendar/cal.css" rel="stylesheet" type="text/css"> -->
<!-- 달력시작 -->
<!-- ********내용시작*********************************************************************************************************************** -->
<?
/*--------------------------------------------------------------------------------------
@brief : 다른날짜 불러오기 달력
@parameters : Array
					(
					    [g_uid] => 101
					    [b_uid] => 30
					    [m_uid] => 100
					    [StDate] => 0
					    [s_uid] => 97
					    [Type] => 
					    [Mode] => 
					    [InDate] => 2015-03-08
					    [Module] => 01
					    [obj] => @air_date_div_101
					    [POST] => 
					)
@return : 
--------------------------------------------------------------------------------------*/

extract($_GET);
extract($_POST);
extract($_SERVER);


function LPADZERO($GetStr){
	$ZeroStr = "000000000000000000000000";
	$LAPDStr = substr($ZeroStr.$GetStr,-2);
	return $LAPDStr;
}

//===================================================================
// Calendar() 함수
//===================================================================

global $currYear,$currMonth,$currDay,$obj,$StDate,$EnDate,$Type,$b_uid,$m_uid,$s_uid;
global $cnt;
global $cf;

//더보기관련
$more_view 	= $_REQUEST['more_view'];
$Type			= $_REQUEST['Type'];
$obj				= $_REQUEST['obj'];
//$StDate		= $_REQUEST['StDate'];
$StDate 			= $cf['daytour_start_add_day'];
$EnDate			= $_REQUEST['EnDate'];
$Num_Fr			= $_REQUEST['Num_Fr'];
$Module			= $_REQUEST['Module'];
$g_uid			= $_REQUEST['g_uid'];
$InDate			= $_REQUEST['InDate'];

$b_uid 			= $_REQUEST['b_uid'];
$m_uid 			= $_REQUEST['m_uid'];
$s_uid 			= $_REQUEST['s_uid'];

$obj 				= $_REQUEST['obj'];

if(!$Num_Fr || $Num_Fr=="undefined"){
	$Num_Fr="10";
}
$days = array("일", "월", "화", "수", "목", "금", "토");

$Engdays = array("SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT");

$months = array
("", "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월");

// 각 달의 날(day)의 수
$totalDays = array(0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);

#echo $InDate;

if($InDate){//지정일
 $InDate_arr = explode('-',$InDate);
 $InYear = $InDate_arr[0];
 $InMonth = (int)$InDate_arr[1];
 $InDay = (int)$InDate_arr[2];
}else{
 //$InDate_arr = explode('-',date('Y-m-d'));
 $InDate_arr = explode('-',$cf['start_add_day2']); 
 $InYear = $InDate_arr[0];
 $InMonth = (int)$InDate_arr[1];
 $InDay = (int)$InDate_arr[2];
}

if(!$currYear && $InDate){//최초시작은 선택일로
 $currYear = $InYear;
 $currMonth = $InMonth;
 $currDay = $InDay;
}

if(!$currYear) {
	$currYear = date("Y");
}
//년도
if(!$currMonth) {
	$currMonth = date("n");
}
//달
if(!$currDay) {
	$currDay = date("j");
}
//일

// 윤년에는 28일을 29일로 수정! 2004년,2008년에 29일 --> 2월
if (date("L", mktime(0,0,0,$currMonth,1,$currYear)))
{
	$totalDays[2] = 29;
}

$prevMonth = $currMonth-1;
$prevYear = $currYear;

if ($prevMonth < 1)
{
	$prevMonth=12;
	$prevYear--;
}

$nextMonth = $currMonth+1;
$nextYear = $currYear;

if ($nextMonth > 12)
{
	$nextMonth=1;
	$nextYear++;
}


//달력 2개씩 보이기용
/*
$nextMonth2 = $nextMonth+1;
$nextYear2 = $nextYear;
if ($nextMonth2 > 12)
{
	$nextMonth2=1;
	$nextYear2++;
}
*/


$prev_view = true;
$next_view = true;
//지정달이 있으면 그전달 보기 안되게, 지정달의 1년후까지만 보이게.
//지정일을 다른날짜보기에서 값으로도 사용하기때문에 이전달 보기가능해야됨
/*
if($InDate){
	$prevs = date("Ymd", mktime(0,0,0,$prevMonth,1,$prevYear));
	$minday = date("Ymd", mktime(0,0,0,$InMonth,1,$InYear));
	if($prevs < $minday) $prev_view = false;

	$maxday = date("Ymd", mktime(0,0,0,$InMonth,1,(int)$InYear+1));
	$nexts = date("Ymd", mktime(0,0,0,$nextMonth,1,$nextYear));
	if($nexts > $maxday) $next_view = false;
}
*/
?>



<div class="calendar_wrap2" >
	<div class="year_wrap">
		<p class="cal_pre"><img src="../image/common/cal_arrow_left.gif" alt="이전달" onclick="<?if($prev_view){?>axCalList2('/js/Calendar/ResCal.php?currMonth=<?=$prevMonth?>&currYear=<?=$prevYear?>&InDate=<?=$InDate?>&b_uid=<?=$b_uid?>&m_uid=<?=$m_uid?>&s_uid=<?=$s_uid?>&Module=<?=$Module?>&g_uid=<?=$g_uid?>&obj=<?=$obj?>','<?=$obj?>');<?}?>return false;" style="cursor:pointer;" /></p>
		<p class="cal_year"><?=$currYear?>년&nbsp;<?=$currMonth?>월</p>
		<p class="cal_next"><img src="../image/common/cal_arrow_right.gif" alt="다음달" onclick="<?if($next_view){?>axCalList2('/js/Calendar/ResCal.php?currMonth=<?=$nextMonth?>&currYear=<?=$nextYear?>&InDate=<?=$InDate?>&b_uid=<?=$b_uid?>&m_uid=<?=$m_uid?>&s_uid=<?=$s_uid?>&Module=<?=$Module?>&g_uid=<?=$g_uid?>&obj=<?=$obj?>','<?=$obj?>');<?}?>return false;" style="cursor:pointer;" /></p>
	</div>

	<table width="100%" border="0" cellspacing="0" cellpadding="0" summary="날짜별 출발일정보기" class="cal_t">
		<caption>출발일정</caption>
			<colgroup>
			<col width="40px">
			<col width="40px">
			<col width="40px">
			<col width="40px">
			<col width="40px">
			<col width="40px">
			<col width="40px">
		</colgroup>
		<thead>
		<tr>
			<th scope="col">일</th>
			<th scope="col">월</th>
			<th scope="col">화</th>
			<th scope="col">수</th>
			<th scope="col">목</th>
			<th scope="col">금</th>
			<th scope="col">토</th>
		</tr>
		</thead>
		<tbody>
		<tr>
			<?day_call($currYear,$currMonth,$currDay,$InDate);?>
		</tr>
		</tbody>
	</table>
	<div class="date_check">
		<p class="able_day01"><span></span>예약가능</p>
		<p class="able_day02"><span></span>대기예약</p>
		<p class="able_day03"><span></span>예약마감</p>
	</div>
</div>
<div class="sch_list_wrap" <?if($more_view){?>style='height:auto;'<?}?>>
	<table width="100%" border="0" cellspacing="0" cellpadding="0" summary="날짜별 상세출발일정보기" class="shc_t">
		<?if($Module=='03'){?>
		<caption>상세출발일정</caption>
			<colgroup>
			<col width="20%">
			<col width="25%">
			<col width="*">
			<col width="22%">
		</colgroup>
		<thead>
		<tr>
			<th scope="col">출발일</th>
			<th scope="col">가격</th>
			<th scope="col">룸타입</th>
			<th scope="col" class="last">예약</th>
		</tr>
		</thead>
		<?}else{?>
		<caption>상세출발일정</caption>
			<colgroup>
			<col width="25%">
			<col width="*">
			<col width="20%">
			<col width="25%">
		</colgroup>
		<thead>
		<tr>
			<th scope="col">출발일</th>
			<th scope="col">가격</th>
			<th scope="col">항공편</th>
			<th scope="col" class="last">예약</th>
		</tr>
		</thead>
		<?}?>
		<tbody>
			<?list_call($currYear,$currMonth,$currDay);?>
		</tbody>
	</table>
</div>

<?if($cnt>7){?>
<p class="btn_more" id='more_view' onclick="more_view_toggle(this)"><?if($more_view){?>닫기<?}else{?>더보기<?}?></p>
<?}?>





<?
function list_call($currYear,$currMonth,$currDay){
	global $Module,$cf,$g_uid,$b_uid,$m_uid,$s_uid;
	global $cnt;

	$cf['module'][$Module]['date'] = 'date';
	$DateTable = $cf['module'][$Module]['date'];
	//$RoomTable = $cf['module'][$Module]['room'];

	$sql_day = "SELECT g_uid,d_uid,d_start,d_ok,min(d_money1) d_money1,d_plane1,d_plane2 
	,(SELECT air_img FROM TB_AIR_LINE WHERE airline_code=left(A.d_plane1,2))AirImage1 
	,(SELECT airnm_kor FROM TB_AIR_LINE WHERE airline_code=left(A.d_plane1,2))AirNameKR1  
	,(SELECT air_img FROM TB_AIR_LINE WHERE airline_code=left(A.d_plane2,2))AirImage2 
	,(SELECT airnm_kor FROM TB_AIR_LINE WHERE airline_code=left(A.d_plane2,2))AirNameKR2 
	FROM (
		/* 각 일자마다 가장낮은 금액의 d_uid를 구해 그 일정의 정보를 가져온다 */
		 SELECT g_uid,d_uid,d_start,d_ok,d_money1,d_plane1,d_plane2 FROM `date` WHERE g_uid='".$g_uid."' and 
		 d_start >= ".$cf['daytour_start_add_day3']." AND YEAR(d_start)='".$currYear."' AND MONTH(d_start)='".$currMonth."'  and d_money1 > 0 ORDER BY d_start,d_ok,d_money1 
		) A 
	WHERE A.g_uid='".$g_uid."' 
	group by d_start ORDER BY d_start ";

	$result_day = mysql_query($sql_day);
	$cnt = mysql_num_rows($result_day);

	if($cnt>0){
		while($rs = mysql_fetch_array($result_day)){
			$mon = substr($rs['d_start'],5,2);
			$day = substr($rs['d_start'],8,2);
			
			$air = ($rs['AirNameKR1'])?"[".$rs['AirNameKR1']."]":"";
			$title = stripslashes($rs['d_title']);

			/*
			$air1_arr = TO_get_AirCode($rs[RoomAir1]);
			$air2_arr = TO_get_AirCode($rs[RoomAir2]);
			*/

			if($rs[AirImage1]) $air = "<img src='".$cf['img_path']['airline'].$rs['AirImage1']."' width='29' height='23' title='".$rs['AirNameKR1']."' align='absmiddle' >";

			$state = $rs['d_ok'];
			switch ($rs['d_ok']){
				case "A":
					$d_row['d_ok_str'] = "예약하기"; 
					$d_row['d_ok_color'] = $cf['d_ok_color_A']; 
					$d_row['d_ok_image'] = $cf['TO_IMG']['reserve_3'];
					$d_row['is_reserve'] = true;
					break;
				case "B": 
					$d_row['d_ok_str'] = "대기예약"; 
					$d_row['d_ok_color'] = $cf['d_ok_color_B']; 
					$d_row['d_ok_image'] = $cf['TO_IMG']['reserve_4'];
					$d_row['is_reserve'] = true;
					break;
				case "C": 
					$d_row['d_ok_str'] = "예약마감"; 
					$d_row['d_ok_color'] = $cf['d_ok_color_C']; 
					$d_row['d_ok_image'] = $cf['TO_IMG']['reserve_1'];
					$d_row['is_reserve'] = false;
					break;
				case "S": 
					$d_row['d_ok_str'] = "출발가능"; 
					$d_row['d_ok_color'] = $cf['d_ok_color_S']; 
					$d_row['d_ok_image'] = $cf['TO_IMG']['reserve_2'];
					$d_row['is_reserve'] = true;
					break;
				default :
					$d_row['d_ok_str'] = "예약하기"; 
					$d_row['d_ok_color'] = $cf['d_ok_color_A']; 
					$d_row['d_ok_image'] = $cf['TO_IMG']['reserve_3'];
					$d_row['is_reserve'] = true;
					break;
			}

			$link = ($d_row['is_reserve'])?"fnc_Value_Return2('".$rs['d_uid']."','".$rs['d_start']."','".$Module."','".$g_uid."','".$b_uid."','".$m_uid."','".$s_uid."');return false;" : "return false;";

			//$ButtonClass= ($d_row['is_reserve'])?"btn_01":"btn_02";
			if($rs[d_ok]=='A'){
				$ButtonClass = "reserve_able";
			}else if($rs[d_ok]=='B'){
				$ButtonClass = "reserve_wait";
			}else if($rs[d_ok]=='C'){
				$ButtonClass = "reserve_close";
			}

			$money = number_format($rs['d_money1']);

			echo 
			"<tr>
				<td>{$mon}.{$day}</td>
				<td class='price'>{$money}원</td>";
			if($Module=='03'){
				echo "<td>{$title}</td>";
			}else{
				echo "<td>{$air}</td>";
			}
			echo "
				<td class='".$ButtonClass." last'><a href='#' onclick=\"".$link."\">{$d_row['d_ok_str']}</a></td>
			</tr>";
		}
	}else{
		echo "<tr><td colspan='4'>등록된 일정이없습니다.</td></tr>";
	}
}

function day_call($currYear,$currMonth,$currDay,$InDate){
	global $Module,$cf,$g_uid,$b_uid,$m_uid,$s_uid;
	global $obj,$StDate,$EnDate,$Type;
	global $firstDayOfMonth,$totalDays,$Num_Fr,$days;

	//$DateTable = $cf['module'][$Module]['date'];
	//$RoomTable = $cf['module'][$Module]['room'];

	$DateTable = 'date';

	if($InDate){
		$InDate_arr = explode('-',$InDate);
	}

	$use_arr = Array();

	$sql_day = "SELECT 
	d_start 
	,COUNT(d_ok) AS DCNT /* 일정갯수 */
	,(SELECT COUNT(*) FROM ".$DateTable." WHERE d_ok='C' AND d_start=A.d_start AND g_uid=A.g_uid) C_CNT /* 마감갯수 */
	,(SELECT COUNT(*) FROM ".$DateTable." WHERE d_ok='B' AND d_start=A.d_start AND g_uid=A.g_uid) B_CNT /* 대기예약 갯수 */
	FROM (SELECT d_uid, d_start, d_ok, g_uid FROM ".$DateTable.") A 
	WHERE g_uid='".$g_uid."' AND YEAR(d_start)='".$currYear."' AND MONTH(d_start)='".$currMonth."' 
	/*AND Ridx IN(SELECT Ridx FROM ".$RoomTable." WHERE g_uid='".$g_uid."' AND DelFlag='N')  */
	GROUP BY d_start 
	ORDER BY d_start ";

	$result_day = mysql_query($sql_day);
	while($RS_DAY = mysql_fetch_array($result_day)){
		if($RS_DAY['DCNT']==$RS_DAY['C_CNT']) $use_arr[$RS_DAY['d_start']] = 'C';
		else if($RS_DAY['DCNT']==$RS_DAY['B_CNT']) $use_arr[$RS_DAY['d_start']] = 'B';
		else $use_arr[$RS_DAY['d_start']] = "A";
	}


	// 이번달의 첫번째 요일 구하기
	$firstDayOfMonth = date("w", mktime(0,0,0,$currMonth,1,$currYear));

	$x=0;

	//해당월의 데이타 읽어오기
	if($currMonth<10){
		$View_currMonth = "0".$currMonth;
	}
	else{
		$View_currMonth = $currMonth;
	}
	$FindDate = $currYear."-".$View_currMonth;

	//이달의 첫번째 날 출력 하기 - 첫번째 날이 나올때 까지 공백 출력
	for ($x=1; $x<=$firstDayOfMonth; $x++)
	{
		$rowCount++;
		echo "<td> </td>\n";
	}

	$WeekValue="";
	$dayCount=1;

	while ($dayCount <= $totalDays[$currMonth])
	{
		$class="";
		$istoday = false;
		

		if ($rowCount % 7 == 0) // 1주일 씩 나누어야 하므로
		{
			echo "</tr>\n<tr>\n";
		}

		if ($dayCount == date("j") && $currYear == date("Y") && $currMonth == date("n")) // 오늘 인 경우
		{
			$class = "today";
			$istoday = true;
		}else if($InDate_arr[2]==$dayCount && $currYear == $InDate_arr[0] && $currMonth == $InDate_arr[1]){
			//선택일
			$class="select";
		}
		else{
			
			// 오늘이 아닌 경우
			if($rowCount % 7 == 0){
				//$bgcolor="#FF0000";
				if($WeekValue==""){
					$WeekValue=$dayCount;
				}
				else{
					$WeekValue=$WeekValue.",".$dayCount;
				}
			}
			elseif($rowCount % 7 == 6){
				//$bgcolor="#0066CC";
				if($WeekValue==""){
					$WeekValue=$dayCount;
				}
				else{
					$WeekValue=$WeekValue.",".$dayCount;
				}
			}
			else{
				//$bgcolor="#000000";
			}
		}

		$SungsuType = $SetArray[$dayCount-1];

		//날짜폼 구하기
		if($Num_Fr=="10"){
			$ReturnDate = $FindDate."-".LPADZERO($dayCount);
		}
		elseif($Num_Fr=="8"){
			$ReturnDate = str_replace("-","",$FindDate).LPADZERO($dayCount);
		}
		if($Add_Day){
			$ReturnAddDate = date("Y-m-d",strtotime($ReturnDate." + ".($Add_Day-1)." day"));	//귀국일
		}
		else{
			$ReturnAddDate="";
		}

		

		$DateStr = $days[date("w",mktime(0,0,0,$View_currMonth,$dayCount,$currYear))];

		if($istoday){
			$OnClick=" id='".$ReturnDate."'  onclick=\"fnc_Value_Return2('','".$ReturnDate."','".$Module."','".$g_uid."','".$b_uid."','".$m_uid."','".$s_uid."');\" ";
		}else{
			$OnClick=" id='".$ReturnDate."' onclick=\"fnc_Value_Return2('','".$ReturnDate."','".$Module."','".$g_uid."','".$b_uid."','".$m_uid."','".$s_uid."');\" ";
		}
		
		//echo $StDate;
		//if($StDate!=""){
			if(strlen($dayCount)==1){
				$curDay="0".$dayCount;
			}
			else{
				$curDay=$dayCount;
			}
			if(strlen($currMonth)==1){
				$curMon="0".$currMonth;
			}
			else{
				$curMon=$currMonth;
			}

			$cDate=$currYear.$curMon.$curDay;
			$today=str_replace("-","",date("Y-m-d",strtotime(date("Y-m-d")." + ".$StDate." day")));
			$today2=str_replace("-","",date("Y-m-d",strtotime(date("Y-m-d",strtotime(date("Y-m-d")." + ".$StDate." day"))." + ".$EnDate." day")));

			/*
				if($EnDate>0){
					if($cDate < $today || $cDate>=$today2 ){
						$bgcolor="#BBBBBB";
						$OnClick="";
					}
				}else if($StDate==0){
					if($cDate < $today  ){
						$bgcolor="#BBBBBB";
						$OnClick="";
					}
			}*/

			if($class!="select"){
				if($cDate < $today  ){
					$OnClick="";
					$cursor = "";
					//$class = "end";
					$class = "";
					$msg = "지난날짜";
				/*}else if($cDate==$today){
					$OnClick="";
					$cursor = "";
					$msg = "오늘";
					$class = "";
					$class = "reserve_close";*/
				}else{
					if($use_arr[$ReturnDate]){
						if($use_arr[$ReturnDate]=='C'){
							$class = "reserve_close";
							$msg = "예약마감";
							$cursor = "";
							$OnClick="";
						}else if($use_arr[$ReturnDate]=='B'){
							$class = "reserve_wait";
							$msg = "대기예약";
							$cursor = "cursor:pointer;";
						}else{
							$class = "reserve_able";
							$msg = "예약가능";
							$cursor = "cursor:pointer;";
						}
					}else{
						$OnClick = "";
						$cursor = "";
						$class = "";
						$msg = "일정없음";
					}
				}
			} else {
				if($use_arr[$ReturnDate]){
					if($use_arr[$ReturnDate]=='C'){
						$class = "reserve_close";
						$msg = "예약마감";
						$cursor = "";
						$OnClick="";
					}else if($use_arr[$ReturnDate]=='B'){
						$class = "reserve_wait";
						$msg = "대기예약";
						$cursor = "cursor:pointer;";
					}else{
						$class = "reserve_able";
						$msg = "예약가능";
						$cursor = "cursor:pointer;";
					}
				}else{
					$OnClick = "";
					$cursor = "";
					$class = "";
					$msg = "일정없음";
				}
			}
		//}

		echo "<td align=center ".$OnClick." class='".$class."' style='".$cursor."' title='".$msg."'>".$dayCount."</td>";

		$dayCount++;
		$rowCount++;

	}

	//마지막 공백이 생기면 빈칸 출력
	$EndCnt = 7-($rowCount % 7);
	if($EndCnt < 7){
		for ($xe=1; $xe<=$EndCnt; $xe++)
		{
			echo "<td> </td>\n";
		}
	}
}


?>

<?
##### 달력 보여주기
//Calendar();
?>


