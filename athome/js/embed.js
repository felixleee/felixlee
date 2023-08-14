/**
 * IE embed 활성화(패치)
 *
 * 작성일 : 2007.10.15
 * 수정일 : 2009.07.24
 * 수정일 : 2009.08.17 (make_flash() 줄임 함수 : mf(), make_movie() 줄임 함수 : mm() 추가)
 * 수정일 : 2009.08.17 (최근)
 * 수정일 : 2009.11.10 (플래시 wmode값을 기본으로 transparent 사용하도록 변경 : 레이어 많이 사용하므로... )
 * 수정일 : 2009.12.04 (플래시 함수 사용쉽도록 변경 : mf('소스', '너비', '높이');)
 * 수정일 : 2010.04.14 (flashMenu() 함수 추가 : 드롭다운 플래시 메뉴용)
 */

/**
 * make flash contents
 *
 * @s : source url
 * @w : source width
 * @h : source height
 * @d : flash id
 * @t : wmode ("" for none, transparent, opaque ...)
 */
function make_flash(s, w, h, d, t) {
	if (!t) t = 'transparent';
	if (d == undefined) d = '';
	var embed = "";
	embed += "<object classid=\"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000\" width=\"" + w + "\" height=\"" + h + "\" id=\"" + d + "\">";
	embed += "<param name=\"Movie\" value=\"" + s + "\" />";
	embed += "<param name=\"Src\" value=\"" + s + "\" />";
	embed += "<param name=\"WMode\" value=\"" + t + "\" />";
	embed += "<param name=\"Quality\" value=\"high\" />";
	embed += "<param name=\"Menu\" value=\"false\" />";
	embed += "<embed type=\"application/x-shockwave-flash\" src=\"" + s +"\" id=\"" + d + " quality=\"high\" wmode=\"" + t + "\" width=\"" + w + "\" height=\"" + h + "\"></embed>";
	embed += "</object>";
	documentwrite(embed);
}

// make_flash() 줄임 함수 (쉽게쓰기 위함) (20090817 )
function mf(s, w, h, d, t) {
	make_flash(s, w, h, d, t);
}

/**
 * make movie contents
 *
 * @s : source url
 * @w : source width
 * @h : source height
 * @d : movie id
 * @auto: autostart
 * @ctrl : controls
 * @status : statusbar
 * @etc : etc options
 */
function make_movie(s, w, h, d, auto, ctrl, status, etc) {
	if (d == undefined) d = '';
	if (auto == undefined) auto = 1;
	if (ctrl == undefined) ctrl = 1;
	if (etc == undefined) etc = '';

	var wh = "";
	// controls : 45px, status : 23px;
	if (parseInt(w) || parseInt(h)) {
		h = parseInt(h, 10);
		if (h) {
			if (ctrl) h += 45;
			if (status) h += 23;
		}
		if (w) wh += " width='" + w + "'";
		if (h) wh += " height='" + h + "'";
	}

	// for FF! (true:1, false:0)
	var opt = " invokeURLs='false' loop='1'";
	opt += " autostart='" + auto + "'";
	opt += " showcontrols='" + ctrl + "'";
	if (status != undefined) opt += " showstatusbar='" + status + "'";
	//opt += " showaudiocontrols='0' showpositioncontrols='0' showtracker='0'";
	var embed = "<embed id='" + d + "' src='" + s + "'" + wh + opt + etc +"></embed>";
	documentwrite(embed);
}

// make_movie() 줄임 함수 (쉽게쓰기 위함) (20090817 )
function mm(s, w, h, d, auto, ctrl, status, etc) {
	make_movie(s, w, h, d, auto, ctrl, status, etc);
}

// write document contents
function documentwrite(src) {
	document.write(src);
}

// assign code innerHTML
function setcode(target, code) {
	target.innerHTML = code;
}

// 플래시 메뉴 사이즈 변경 함수 (20100414 )
// 드롭다운 플래시 메뉴일 경우 플래시 공간 아래에 클릭이 안되는 문제가 발생하기 때문에...
// 사용법 : flashMenu('드롭다운 플래시 메뉴 감싸는 ID', 조절할 높이)
function flashMenu(id, h) {
	if (!id || !h) return;
	var obj = document.getElementById(id);
	obj.style.height = parseInt(h, 10) + 'px';
}