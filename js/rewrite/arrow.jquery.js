(function ($) {
    var animationDuration   = 500;
    var animationType       = 'swing';        // swing || linear, more with jquery-ui

    var hideOffsetTop       = 50;
    var hideOffsetBottom    = 50;


    function onScrollTopClick(e) {
        var $target = $(e.target);
        $target.css('pointer-events', 'none');
        $('html, body').stop().animate(
            {
                scrollTop: 0
            },
            animationDuration,
            animationType,
            function() {
                $target.css('pointer-events', 'auto');
            }
        );
    }

    function onScrollDownClick(e) {
        var currentPosition     = $(window).scrollTop();
        var visibleAreaHeight   = window.innerHeight;

        var $target = $(e.target);
        $target.css('pointer-events', 'none');
        $('html, body').stop().animate(
            {
                scrollTop: currentPosition + visibleAreaHeight
            },
            animationDuration,
            animationType,
            function() {
                $target.css('pointer-events', 'auto');
            }
        );
    }

    function onScroll(e) {
        var currentOffset = $(this).scrollTop();
        if(currentOffset <= hideOffsetTop) {
            $('#scroll-top').css('visibility', 'hidden');
        } else {
            $('#scroll-top').css('visibility', 'visible');
        }

        if($(window).scrollTop() + $(window).height() > $(document).height() - hideOffsetBottom) {
            $('#scroll-down').css('visibility', 'hidden');
        } else {
            $('#scroll-down').css('visibility', 'visible');
        }
    }

    $(document).on('click', '#scroll-top', onScrollTopClick);
    $(document).on('click', '#scroll-down', onScrollDownClick);
    $(document).on('scroll', onScroll);
})(jQuery);