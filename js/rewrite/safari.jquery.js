/**
 * Safari workarounds
 */
(function($) {

    /**
     * https://stackoverflow.com/a/31732310/2010246
     * @returns {*|boolean|string}
     */
    function isSafari() {
        return navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
            navigator.userAgent &&
            navigator.userAgent.indexOf('CriOS') == -1 &&
            navigator.userAgent.indexOf('FxiOS') == -1;
    }

    /**
     * Stacking context bug, Could not fix it gently tho
     * https://stackoverflow.com/questions/26108326/fixed-position-not-working-in-safari-7
     */
    function stackingContextBugfix() {
        $(document).on('scroll', function() {
            var $rightToggler = $('#rightToggler');
            var offset = $rightToggler.offset();
            console.log(offset);
            if(offset.top > 46) {
                $rightToggler.css('top', 0);
            }
        });
    }

    if(isSafari()) {
        console.log('Loading safari bugfixes');
        stackingContextBugfix();
    }

})(jQuery);