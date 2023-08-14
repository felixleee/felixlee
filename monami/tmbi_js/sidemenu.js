/*
 * jquery.sidemenu.js
 * https://github.com/kami30k/jquery.sidemenu.js
 *
 * Copyright 2015 kami.
 * Released under the MIT license.
 */

;(function($) {
  /**
   * Initialize side menu.
   */
var  leng =  $(window).height();
  function sideMenu_initialize() {
		$("#wrap_bg").css('height',leng);
		$("#sidemenu").css('height',leng);
  }

  $(document).ready(function() {
    sideMenu_initialize();
	var direct = 'left';
	var w = '';
	var id = 'sidemenu';
	
    $('[data-role=sidemenu-toggle]').on('click', function(e) {
    	e.preventDefault();

    	w = '';
    	
    	if ($(this).attr("data-direction")) direct = $(this).attr("data-direction");
    	if ($(this).attr("data-id")) id = $(this).attr("data-id");
    	if(direct=='right' ) w = '0%';

    	$("#"+id).css('left',w).toggle('slide', { 'direction':direct },300);
    	$("#wrap_bg").toggle();
		$("#wrap_bg").bind('touchmove', function(e){e.preventDefault()});
		$("#contents").bind('touchmove', function(e){e.preventDefault()});
		$("#Wrap").css('height',leng);
		$("#Wrap").css('overflow','hidden');
    });

	$('[data-role=sidemenu-close]').on('click', function(e) {
		$("#"+id).toggle('slide', { 'direction':direct },300);
		$("#wrap_bg").toggle();
		$("#contents").unbind('touchmove');
		$("#Wrap").css('height','100%');
		$("#Wrap").css('overflow','');
    });
    // Support for Turbolinks
    if (typeof Turbolinks !== 'undefined') {
      $(document).on('page:load', function() {
        sideMenu_initialize();
      });
    }
  });
})(jQuery);