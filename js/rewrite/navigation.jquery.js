/**
    Simple bootstrap collapse is not efficient enough to expand
    element using full screen height
*/
(function($) {
    var SEARCH_INPUT_STATE_OPENING  = 'opening';
    var SEARCH_INPUT_STATE_OPENED   = 'opened';
    var SEARCH_INPUT_STATE_CLOSING  = 'closing';
    var SEARCH_INPUT_STATE_CLOSED   = 'closed';

    var expandedSelector        = '[data-toggle="collapse-fh"][aria-expanded="true"]';
    var collapsedSelector       = '[data-toggle="collapse-fh"][aria-expanded="false"]';
    var searchAnchorSelector    = 'a.search';

    var leftTogglerSelector     = '.navbar-toggler:eq(0)';
    var rightTogglerSelector    = '.navbar-toggler:eq(1)';

    var $fullHeightNavbar       = $('.navbar-fh');
    var $body                   = $('body');
    var $primaryNav             = $('#primaryNav');
    var $secondaryNav           = $('#secondaryNav');
    var $listWithSearchInput    = $primaryNav.find('ul:eq(1)');
    var $listWithoutSearchInput = $primaryNav.find('ul:eq(2)');
    var $searchInput            = $listWithSearchInput.find('input');

    var $leftToggler            = $(leftTogglerSelector);
    var $rightToggler           = $(rightTogglerSelector);

    var currentSearchInputState = SEARCH_INPUT_STATE_CLOSED; // Default state

    var previousScrollTop = $(window).scrollTop();

    var debug = false;

    function dbg(message) {
        if(debug === false) {
            return;
        }

        if(arguments.length === 1) {
            console.log(message);
        } else {
            console.log(arguments);
        }
    }

    /**
     * Expand given element
     * @param e
     */
    function expand(e) {
        var $target     = $(e.target);
        var $expand     = $($target.data('target'));

        $expand.addClass("navbar-collapse-fh");
        $body.addClass('no-scroll');
        $target.attr('aria-expanded', 'true');
    }

    /**
     * Collapse given element
     * @param e
     */
    function collapse(e) {
        var $target     = $(e.target);
        var $collapse   = $($target.data('target'));
        $collapse.removeClass("navbar-collapse-fh");
        $target.attr('aria-expanded', 'false');
    }

    function isLeftTogglerExpanded() {
        return $('.navbar-toggler:eq(0)[aria-expanded="true"]').length > 0;
    }

    function isRightTogglerExpanded() {
        return $('.navbar-toggler:eq(1)[aria-expanded="true"]').length > 0;
    }

    function closeLeftToggler() {
        if($leftToggler.is(":visible") && isLeftTogglerExpanded()) {
            $leftToggler.click();
        }
    }

    function closeRightToggler() {
        if($rightToggler.is(":visible") && isRightTogglerExpanded()) {
            $rightToggler.click();
        }
    }

    /**
     * Checks whenever there is expanded toggler
     * @returns {boolean}
     */
    function isAnyTogglerExpanded() {
        return isLeftTogglerExpanded() || isRightTogglerExpanded();
    }

    /**
     * Remove the scrolling lock from body if there are no expanded togglers
     */
    function onTransitionEnd() {
        if(!isAnyTogglerExpanded()) {
            $body.removeClass('no-scroll');
        }
    }

    /**
     * Collapse menu if we resize window or it will look glitchy
     */
    function onResize() {
        var $expanded = $('[data-toggle="collapse-fh"][aria-expanded="true"]');
        if($expanded.length) {
            $expanded.trigger('click');
        }
    }

    /**
     * It may be either fading in or fading out
     */
    function onAnimationStart(e) {
        if(currentSearchInputState === SEARCH_INPUT_STATE_CLOSED) {
            currentSearchInputState = SEARCH_INPUT_STATE_OPENING;
            onSearchInputOpening(e);
        }

        if(currentSearchInputState === SEARCH_INPUT_STATE_OPENED) {
            currentSearchInputState = SEARCH_INPUT_STATE_CLOSING;
            onSearchInputClosing(e);
        }
    }

    /**
     * It may be either fading in or fading out
     */
    function onAnimationEnd(e) {
        if(currentSearchInputState === SEARCH_INPUT_STATE_OPENING) {
            currentSearchInputState = SEARCH_INPUT_STATE_OPENED;
            onSearchInputOpened(e);
        }

        if(currentSearchInputState === SEARCH_INPUT_STATE_CLOSING) {
            currentSearchInputState = SEARCH_INPUT_STATE_CLOSED;
            onSearchInputClosed(e);
        }
    }

    function onSearchAnchorClick(e) {
        if(currentSearchInputState !== SEARCH_INPUT_STATE_OPENING && currentSearchInputState !== SEARCH_INPUT_STATE_CLOSING) {
            $listWithoutSearchInput.addClass("faster fadeOut");
            openSearchInput(e);
        }
    }

    function onSearchInputOpening(e) {
        dbg('onSearchInputOpening');
        $searchInput.focus();
    }

    function onSearchInputOpened(e) {
        dbg('onSearchInputOpened');
    }

    function onSearchInputClosing(e) {
        dbg('onSearchInputClosing');
        $('div.searchResults').addClass('fadeOut');
        $('body').removeClass('no-scroll');
        setTimeout(function() {
            $('div.searchResults').removeClass('d-md-block');
        }, 250);

    }

    function onSearchInputClosed(e) {
        dbg('onSearchInputClosed');
    }

    function onSearchInputFocusOut(e) {
        dbg('onSearchInputFocusOut');
        if(currentSearchInputState === SEARCH_INPUT_STATE_OPENING) {
            $searchInput.focus();
            return;
        }

        closeSearchInput(e);
    }

    function openSearchInput(e) {
        if(currentSearchInputState === SEARCH_INPUT_STATE_CLOSED) {
            $listWithoutSearchInput.addClass("w-0");
            $listWithSearchInput.removeClass("w-0");
            $listWithSearchInput.addClass("faster fadeIn");

            $('div.searchResults').addClass('d-md-block');

            // When we open the search input, a transparency layer appears
            var $transparencyLayer = $('#transparency-layer');
            $transparencyLayer.removeClass('d-none fadeOut');
            $transparencyLayer.addClass('faster fadeIn');

            $listWithSearchInput.find('input').trigger('keyup');
        } else if(debug) {
            throw "[openSearchInput] Incorrect search input state: " + currentSearchInputState;
        }
    }

    function closeSearchInput(e) {
        if(currentSearchInputState === SEARCH_INPUT_STATE_OPENED) {
            $listWithoutSearchInput.removeClass("w-0 fadeOut");
            $listWithoutSearchInput.addClass("faster fadeIn");

            $listWithSearchInput.addClass("w-0");
            $listWithSearchInput.removeClass("faster fadeIn");

            var $transparencyLayer = $('#transparency-layer');

            // Register event on animation end, we need to add d-none after fadeOut animation end
            $transparencyLayer.on('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd', function() {
                $(this).addClass('d-none');

                // Unregister the event so it won't be triggered when fadeIn applied
                $(this).off('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd');
            });

            // Apply fadeOut
            $transparencyLayer.addClass("fadeOut");
        } else if(debug) {
            throw "[closeSearchInput] Incorrect search input state: " + currentSearchInputState;
        }
    }

    function onLeftTogglerClick(e) {
        $rightToggler.toggleClass("invisible");
    }

    function onRightTogglerClick(e) {
        $leftToggler.toggleClass("invisible");
    }

    var onScrollDown = function(e) {
        if ($secondaryNav.offset().top > 110 && $(document).width >= 992) {
            $secondaryNav.removeClass('slideInDown');
            $secondaryNav.addClass('slideOutUp');
        }
    };

    var onScrollUp = function(e) {
        $secondaryNav.removeClass('slideOutUp');
        $secondaryNav.addClass('slideInDown');
    };

    var onScroll = function(e) {
        var currentScrollTop = $(this).scrollTop();

        if ($secondaryNav.width() > 540) {
            if (currentScrollTop < 110) {
                $secondaryNav.removeClass("animated");
                //$secondaryNav.css('animation-duration', '0s');
            } else {
                $secondaryNav.addClass("animated");
                //$secondaryNav.css('animation-duration', '1s');
            }

            if (previousScrollTop > currentScrollTop) {
                onScrollUp(e);
            } else {
                onScrollDown(e);
            }
            previousScrollTop = currentScrollTop;
        }
    };

    function onDocumentClick() {
        var isLanguageMenuOpen = ($('#languageDropdown[aria-expanded="true"]').length === 1);
        //$('#languageDropdown').click();
    }

    $fullHeightNavbar.on('transitionend webkitTransitionEnd oTransitionEnd', onTransitionEnd);

    $listWithoutSearchInput.on('animationstart webkitAnimationStart onAnimationStart MSAnimationStart', onAnimationStart);
    $listWithoutSearchInput.on('animationend webkitAnimationEnd onAnimationEnd MSAnimationEnd', onAnimationEnd);
    $listWithSearchInput.on('animationstart webkitAnimationStart onAnimationStart MSAnimationStart', onAnimationStart);
    $listWithSearchInput.on('animationend webkitAnimationEnd onAnimationEnd MSAnimationEnd', onAnimationEnd);

    $(document).scroll(onScroll);

    $(document).on('click', leftTogglerSelector, onLeftTogglerClick);
    $(document).on('click', rightTogglerSelector, onRightTogglerClick);

    $(document).on('click', searchAnchorSelector, onSearchAnchorClick);
    $(document).on('focusout', $searchInput, onSearchInputFocusOut);

    $(document).on('click', collapsedSelector, expand);
    $(document).on('click', expandedSelector, collapse);

    $(document).on('click', onDocumentClick);
    $(document).on('tap', onDocumentClick);
    
    $primaryNav.on('click', 'a:not(#languageDropdown)', closeLeftToggler);
    $secondaryNav.on('click', 'a:not(#languageDropdown)', closeRightToggler);

    $(window).on('resize', onResize);
})(jQuery);