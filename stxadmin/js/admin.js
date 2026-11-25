window.addEventListener('DOMContentLoaded', function(){
	var acc = document.getElementsByClassName("m_menu_list");
	 
	    for (var i = 0; i < acc.length; i++) {
	        acc[i].addEventListener("click", function () {
	            var panel = this.nextElementSibling;
	            // 하위 메뉴가 없는 항목(이력관리·예측소요 등)은 링크로만 동작 — 예전에는 여기서 null 오류가 났음
	            if (!panel || !panel.classList.contains("sub_menu")) return;
	            this.parentElement.classList.toggle("on");
	            if (panel.classList.contains("on")) {
	                panel.classList.remove("on");
	            } else {
	                panel.classList.add("on");
	            }
	        });
	    }
});




function addClassName(POP_ID) {
	document.getElementById(POP_ID).classList.add('pop_on');
}

function removeClassName(POP_ID) {
   	document.getElementById(POP_ID).classList.remove('pop_on');
}

$(function(){
	$("a.share_file_btn").click(function(){
		$("div#share_file_pop").load("../share/share_file_pop.html");
		$("div#share_file_pop").addClass("pop_on");		
	});
});
