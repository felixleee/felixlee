<? include $_SERVER['DOCUMENT_ROOT']."/Lib/_common.php"; // 공통 인클루드 ?>

<?

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
$more_view = $_REQUEST[more_view];

$Type			= $_REQUEST[Type];
$obj			= $_REQUEST[obj];
$StDate		= $cf['start_add_day'];
//$StDate = 0;
$EnDate		= $_REQUEST[EnDate];
$Num_Fr		= $_REQUEST[Num_Fr];
$Module			= $_REQUEST[Module];
$g_uid		=	$_REQUEST[g_uid];
$InDate		=	$_REQUEST[InDate];

$b_uid = $_REQUEST[b_uid];
$m_uid = $_REQUEST[m_uid];
$s_uid = $_REQUEST[s_uid];

$obj = $_REQUEST[obj];

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
 $InDate_arr = explode('-',date('Y-m-d'));
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

$nextMonth2 = $nextMonth+1;
$nextYear2 = $nextYear;
if ($nextMonth2 > 12)
{
	$nextMonth2=1;
	$nextYear2++;
}



$prev_view = true;
$next_view = true;

?>



<div class="calendar_wrap5">
	<div class="year_wrap">
		<p class="cal_pre"><img src="/js/ajaxcalendar/cal_arrow_left" alt="이전달" onclick="<?if($prev_view){?>axCalList3('/js/Calendar/ResCal_admin.php?currMonth=<?=$prevMonth?>&currYear=<?=$prevYear?>&InDate=<?=$InDate?>&b_uid=<?=$b_uid?>&m_uid=<?=$m_uid?>&s_uid=<?=$s_uid?>&Module=<?=$Module?>&g_uid=<?=$g_uid?>&obj=<?=$obj?>','<?=$obj?>','<?=$Module?>');<?}?>return false;" style="cursor:pointer;" /></p>
		<p class="cal_year"><?=$currYear?>년&nbsp;<?=$currMonth?>월</p>
		<p class="cal_next"><img src="/js/ajaxcalendar/cal_arrow_right" alt="다음달" onclick="<?if($next_view){?>axCalList3('/js/Calendar/ResCal_admin.php?currMonth=<?=$nextMonth?>&currYear=<?=$nextYear?>&InDate=<?=$InDate?>&b_uid=<?=$b_uid?>&m_uid=<?=$m_uid?>&s_uid=<?=$s_uid?>&Module=<?=$Module?>&g_uid=<?=$g_uid?>&obj=<?=$obj?>','<?=$obj?>','<?=$Module?>');<?}?>return false;" style="cursor:pointer;" /></p>
	</div>
	<table width="100%" border="0" cellspacing="0" cellpadding="0" summary="날짜별 출발일정보기" class="cal_t">
		<caption>출발일정</caption>
			<colgroup>
			<col width="60px">
			<col width="60px">
			<col width="60px">
			<col width="60px">
			<col width="60px">
			<col width="60px">
			<col width="60px">
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
</div>

<?
function day_call($currYear,$currMonth,$currDay,$InDate){
	global $Module,$cf,$g_uid,$b_uid,$m_uid,$s_uid;
	global $obj,$StDate,$EnDate,$Type;
	global $firstDayOfMonth,$totalDays,$Num_Fr,$days;

	//$DateTable = $cf['module'][$Module]['date'];
	//$RoomTable = $cf['module'][$Module]['room'];

	$cf['module']['01'] = array('date'=>'date', 'room'=>'TB_GOOD_DATE_TYPE');
	$cf['module']['03'] = array('date'=>'TB_HOTEL_DATE', 'room'=>'TB_HOTEL_ROOM');
	$cf['module']['04'] = array('date'=>'TB_AIR_DATE');

	//$DateTable = 'date';
	$DateTable = $cf['module'][$Module]['date'];
	$RoomTable = $cf['module'][$Module]['room'];

	if($InDate){
		$InDate_arr = explode('-',$InDate);
	}

	$use_arr = Array();

	if($Module=='01'){//패키지
		$sql_day = "SELECT 
		d_start,d_money1, d_people1,d_people2 
		,COUNT(d_start) AS DCNT /* 일정갯수 */
		,(SELECT COUNT(*) FROM ".$DateTable." WHERE d_ok='C' AND d_start=A.d_start AND g_uid=A.g_uid) C_CNT /* 마감갯수 */
		,(SELECT COUNT(*) FROM ".$DateTable." WHERE d_ok='B' AND d_start=A.d_start AND g_uid=A.g_uid) B_CNT /* 대기예약 갯수 */
		FROM (SELECT d_uid, d_start, d_ok, g_uid, d_money1, d_people1, d_people2, dtid FROM ".$DateTable." where g_uid='".$g_uid."' ) A 
		WHERE g_uid='".$g_uid."' AND YEAR(d_start)='".$currYear."' AND MONTH(d_start)='".$currMonth."' ";
		if($b_uid){
			$sql_day .= "AND dtid ='".$b_uid."' ";
		}else{
			$sql_day .= "AND dtid IN(SELECT dtid FROM ".$RoomTable." WHERE g_uid='".$g_uid."' AND del_flag='N')  ";
		}
		$sql_day .= "GROUP BY d_start ORDER BY d_start ";

		$result_day = mysql_query($sql_day) or die(mysql_error());

		while($RS_DAY = mysql_fetch_array($result_day)){
			if($RS_DAY[DCNT]==$RS_DAY[C_CNT]) $use_arr[$RS_DAY[d_start]]['state'] = 'C';
			else if($RS_DAY[DCNT]==$RS_DAY[B_CNT]) $use_arr[$RS_DAY[d_start]]['state'] = 'B';
			else $use_arr[$RS_DAY[d_start]]['state'] = "A";

			$use_arr[$RS_DAY[d_start]]['price'] = $RS_DAY['d_money1'];
			$use_arr[$RS_DAY[d_start]]['left_seat'] = $RS_DAY['d_people1'];
			$use_arr[$RS_DAY[d_start]]['total_seat'] = $RS_DAY['d_people2'];
		}

	}else if($Module=='03'){
		$sql_day = "select price_sell,lodg_state_cd,room_date,left_seat, total_seat 
		from ".$DateTable." 
		where h_seq='{$g_uid}' and r_idx='{$b_uid}' and year(room_date)='{$currYear}' and month(room_date)='{$currMonth}' 
		order by room_date asc
		";

		$result_day = mysql_query($sql_day);
		while($RS_DAY = mysql_fetch_array($result_day)){
			$use_arr[$RS_DAY[room_date]]['state'] = $RS_DAY['lodg_state_cd'];
			$use_arr[$RS_DAY[room_date]]['price'] = $RS_DAY['price_sell'];
			$use_arr[$RS_DAY[room_date]]['left_seat'] =  $RS_DAY['left_seat'];
			$use_arr[$RS_DAY[room_date]]['total_seat'] =  $RS_DAY['total_seat'];
		}
	}else if($Module=='04'){
	

		$sql_day = "select (net_ad+net_ad_addon+person_ad) as price_sell,res_state as lodg_state_cd,start_dt,left_seat, total_seat 
		from ".$DateTable." 
		where ti_uid='{$g_uid}' and year(start_dt)='{$currYear}' and month(start_dt)='{$currMonth}' 
		order by start_dt asc
		";

		$result_day = mysql_query($sql_day);
		while($RS_DAY = mysql_fetch_array($result_day)){
			$use_arr[$RS_DAY[start_dt]]['state'] = $RS_DAY['lodg_state_cd'];
			$use_arr[$RS_DAY[start_dt]]['price'] = $RS_DAY['price_sell'];
			$use_arr[$RS_DAY[start_dt]]['left_seat'] =  $RS_DAY['left_seat'];
			$use_arr[$RS_DAY[start_dt]]['total_seat'] =  $RS_DAY['total_seat'];
		}

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
			//$class="select";
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

		$cursor = "cursor:pointer;";
		$OnClick=" id='date_cal_".$ReturnDate."' onclick=\"fnc_Value_Return3('','".$ReturnDate."','".$Module."','".$g_uid."','".$b_uid."','".$m_uid."','".$s_uid."');\" ";
		
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
					//$OnClick="";
					//$cursor = "";
					//$class = "end";
					$class = "";
					$msg = "지난날짜";
				/*}else if($cDate==$today){
					//$OnClick="";
					//$cursor = "";
					$msg = "당일예약불가";
					$class = "reserve_close";*/
				}else{
					if($use_arr[$ReturnDate]){
						if($use_arr[$ReturnDate]['state']=='C'){
							$class = "reserve_close";
							$msg = "예약마감";
							//$cursor = "";
							//$OnClick="";
						}else if($use_arr[$ReturnDate]['state']=='B'){
							$class = "reserve_wait";
							$msg = "대기예약";
							$cursor = "cursor:pointer;";
						}else{
							$class = "reserve_able";
							$msg = "예약가능";
							$cursor = "cursor:pointer;";
						}
					}else{
						//$OnClick = "";
						//$cursor = "";
						$class = "";
						$msg = "일정없음";
					}
				}
			} else {
				if($use_arr[$ReturnDate]){
					if($use_arr[$ReturnDate]['state']=='C'){
						$class = "reserve_close";
						$msg = "예약마감";
						//$cursor = "";
						//$OnClick="";
					}else if($use_arr[$ReturnDate]['state']=='B'){
						$class = "reserve_wait";
						$msg = "대기예약";
						$cursor = "cursor:pointer;";
					}else{
						$class = "reserve_able";
						$msg = "예약가능";
						$cursor = "cursor:pointer;";
					}
				}else{
					//$OnClick = "";
					//$cursor = "";
					$class = "";
					$msg = "일정없음";
				}
			}
			
			$price_str = "";
			if($use_arr[$ReturnDate]['price']){
				$price_str = "<br>￦".number_format($use_arr[$ReturnDate]['price']);
				$price_str.= "<br>".$use_arr[$ReturnDate]['left_seat']."/".$use_arr[$ReturnDate]['total_seat'];
			}

		//}

		echo "<td align=center ".$OnClick." class='".$class."' style='".$cursor."' title='".$msg."'><div>".$dayCount.$price_str."</div></td>";

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


