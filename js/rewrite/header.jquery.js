/**
    Hide position fixed elements when they reach specific offset
*/
(function($) {
    var max = $('#header').height() * 1.5;

    var $elements = $('#header .js-hideable').filter(':visible');

    function onScroll() {
        $.each($elements, function() {
            var $element = $(this);
            $element.toggleClass('invisible', $element.offset().top > max);
        });
    }

    $(document).scroll(onScroll);
})(jQuery);