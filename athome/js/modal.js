	function openModal(modalname){
	  document.get
	  $("#modal").fadeIn(300);
	  $("."+modalname).fadeIn(300);
	}

$(document).ready(function() {	
	$("#modal, .close").on('click',function(){
	  $("#modal").fadeOut(300);
	  $(".modal-con").fadeOut(300);
	});
});