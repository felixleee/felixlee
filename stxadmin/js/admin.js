window.addEventListener('DOMContentLoaded', function(){
	var acc = document.getElementsByClassName("m_menu_list");
	 
	    for (i = 0; i < acc.length; i++) {
	        acc[i].addEventListener("click", function () {
	            this.parentElement.classList.toggle("on");
	            var panel = this.nextElementSibling;
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
