/*
 * jquery.sidemenu.js
 * https://github.com/kami30k/jquery.sidemenu.js
 *
 * Copyright 2015 kami.
 * Released under the MIT license.
 */

(function($) {
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
    $('[data-role=sidemenu-toggle]').on('click', function(e) {
		e.preventDefault();

		$("#sidemenu").toggle("slide", { direction: "left" },300);
		$("#wrap_bg").toggle();
		$("#wrap_bg").bind('touchmove', function(e){e.preventDefault()});
		$("#canvas").bind('touchmove', function(e){e.preventDefault()});

		$("#Wrap").css('height',leng);
		$("#Wrap").css('overflow','hidden');
    });

	$('[data-role=sidemenu-close]').on('click', function(e) {
		$("#sidemenu").toggle("slide", { direction: "left" },300);
		$("#wrap_bg").toggle();
		$("#canvas").unbind('touchmove');
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