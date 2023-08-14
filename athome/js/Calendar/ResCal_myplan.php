<? include "../../Lib/_common.php"; // 공통 인클루드 ?>
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

global $currYear,$currMonth,$currDay,$obj,$StDate,$EnDate,$Type;
global $cnt;
global $cf;

$Type			= $_REQUEST[Type];
$obj			= $_REQUEST[obj];
//$StDate = $cf['start_add_day'];
$StDate = $_REQUEST[StDate];
$EnDate		= $_REQUEST[EnDate];
$Num_Fr		= $_REQUEST[Num_Fr];

$InDate		=	$_REQUEST[InDate];

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

//지정일
$InDate = $cf['start_add_day2'];

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


$prev_view = true;
$next_view = true;
//지정달이 있으면 그전달 보기 안되게, 지정달의 1년후까지만 보이게.
if($InDate){
	$prevs = date("Ymd", mktime(0,0,0,$prevMonth,1,$prevYear));
	$minday = date("Ymd", mktime(0,0,0,$InMonth,1,$InYear));
	if($prevs < $minday) $prev_view = false;

	$maxday = date("Ymd", mktime(0,0,0,$InMonth,1,(int)$InYear+1));
	$nexts = date("Ymd", mktime(0,0,0,$nextMonth,1,$nextYear));
	if($nexts > $maxday) $next_view = false;
}

/*
axCalList4('/js/Calendar/ResCal_myplan.php?currMonth=<?=$prevMonth?>&currYear=<?=$prevYear?>&StDate=<?=$StDate?>&EnDate=<?=$EnDate?>&obj=<?=$obj?>','<?=$obj?>');

*/
?>


	<div class="year_wrap">
		<p class="cal_pre"><img src="../image/common/cal_arrow_left.gif" alt="이전달" onclick="<?if($prev_view){?>
		MY_CAL('<?=$obj?>', '', '', '<?=$prevYear?>','<?=$prevMonth?>');<?}?>return false;" style="cursor:pointer;" /></p>
		<p class="cal_year"><?=$currYear?>년&nbsp;<?=$currMonth?>월</p>
		<p class="cal_next"><img src="../image/common/cal_arrow_right.gif" alt="다음달" onclick="<?if($next_view){?>MY_CAL('<?=$obj?>', '', '', '<?=$nextYear?>','<?=$nextMonth?>');<?}?>return false;" style="cursor:pointer;" /></p>
	</div>

	<table width="100%" border="0" cellspacing="0" cellpadding="0" summary="날짜별 출발일정보기" class="cal_t" id='myplan_calendar_table'>
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




<?
//StDate와 EnDate 는 항상 들어오게 한다.

function day_call($currYear,$currMonth,$currDay,$InDate){
	global $obj,$StDate,$EnDate,$Type,$cf;
	global $firstDayOfMonth,$totalDays,$Num_Fr,$days;

	$StDate_num = str_replace('-','',$StDate);
	$EnDate_num = str_replace('-','',$EnDate);
	
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
		echo "<td > </td>\n";
	}

	$dayCount=1;

	while ($dayCount <= $totalDays[$currMonth])
	{
		$class="";
		$istoday = false;

		$curDay = LPADZERO($dayCount);
		$curMon = LPADZERO($currMonth);

		$cDate=$currYear.$curMon.$curDay;

		
		$StDate_num = str_replace('-','',$StDate);
		$EnDate_num = str_replace('-','',$EnDate);

		//$today = date('Ymd');
		$today=str_replace("-","",date("Y-m-d",strtotime(date("Y-m-d")." + ".$cf['start_add_day']." day")));

		if ($rowCount % 7 == 0) // 1주일 씩 나누어야 하므로
		{
			echo "</tr>\n<tr>\n";
		}

		if ($dayCount == date("j") && $currYear == date("Y") && $currMonth == date("n")) // 오늘 인 경우
		{
			$class = "today";
			$istoday = true;
		}else if($StDate_num<=$cDate && $cDate<=$EnDate_num){//선택일
			$class = "select";
		}else{
			$class = "";
		}

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
			$OnClick=" id='myplan_".$ReturnDate."' onclick=\"fnc_Value_Return4('".$ReturnDate."');\" ";
		}else{
			$OnClick=" id='myplan_".$ReturnDate."' onclick=\"fnc_Value_Return4('".$ReturnDate."');\" ";
		}
		
		if($class!="select"){
			if($cDate < $today  ){
				$OnClick="";
				$cursor = "";
				$class = "end";
			}else if($cDate==$today){
				$OnClick="";
				$cursor = "";
				$msg = "오늘";
				$class = "today";
			}else{
				//$OnClick = "";
				$cursor = "cursor:pointer;";
				$class = "able";
				$msg = "";
			}
		} else {
			//$OnClick = "";
			$class = "able select";
			$cursor = "cursor:pointer;";
			$msg = "";
		}

		echo "<td align=center ".$OnClick." class='".$class."' style='".$cursor."' title='".$msg."'>".$dayCount."</td>";

		$dayCount++;
		$rowCount++;
	}

	//마지막 공백이 생기면 빈칸 출력
	$EndCnt = 7-($rowCount % 7);
	if($EndCnt < 7){
		for ($xe=1; $xe<=$EndCnt; $xe++)
		{
			echo "<td > </td>\n";
		}
	}
}

?>

