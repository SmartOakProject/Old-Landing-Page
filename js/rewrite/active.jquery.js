/**
 * Toggles active class on specific elements
 */
(function($) {
    function toggleActiveState(e) {
        $('.active').removeClass('active');
        $(e.target).addClass('active');
    }

    $(document).on('click', 'a:not(.search,.dropdown-item)', toggleActiveState);
})(jQuery);

/* docker run -d -v $(pwd):/usr/share/nginx/html -e VIRTUAL_HOST=landing.s1.oak.protean.pl -e LETSENCRYPT_HOST=landing.s1.oak.protean.pl --network=webproxy --name landing-page nginx:alpine */
