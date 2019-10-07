// DO NOT use jQuery functions for animations
(function() {
    var $rotatable = $('.rotatable');   // Its the only one jQuery usage at the bottom of the file

    var useDeviceJs = (typeof DEVICE !== "undefined");
    var disableOnSmallAndMediumDevices = false;

    var viewport = {
        height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    };

    var _elements = document.getElementsByClassName('rotatable');
    var elements = [];

    function getElementData(element) {
        var elementComputedStyle        = window.getComputedStyle(element);

        var height                      = elementComputedStyle['height'].replace('px', '');

        var bodyBoundingClientRect      = document.body.getBoundingClientRect();
        var elementBoundingClientRect   = element.getBoundingClientRect();
        var top                         = parseInt(elementBoundingClientRect.top - bodyBoundingClientRect.top);

        return {
            element:            element,
            height:             height,
            top:                top,
            rotation: {
                max: 10,
                maxAttitude: viewport.height
            }
        };
    }

    // Should be called on page load and window resize
    function initializeElements() {
        elements = [];

        for(var i = 0; i < _elements.length; i++) {
            elements.push(getElementData(_elements[i]));
        }
    }

    var rotate = function(element, direction, forceAngle) {
        // Used to reset element position on window resize
        if(typeof forceAngle !== "undefined") {
            element.element.style.transform = 'rotate(' + forceAngle + 'deg)';
            return;
        }

        var currentScrollTop    = $(document).scrollTop();
        var currentAttitude     = -1 * (currentScrollTop - (element.top + (element.height/2)));
        var landingAttitude     = element.rotation.maxAttitude;
        var maximumLandingAngle = element.rotation.max;
        var rotationFix         = 0.6*maximumLandingAngle;
        var currentLandingAngle = (-1 * ((currentAttitude * maximumLandingAngle) / landingAttitude)) + rotationFix;

        if(direction === 'left') {
            currentLandingAngle = -currentLandingAngle;
        }

        element.element.style.transform = 'rotate(' + currentLandingAngle + 'deg)';
    };

    var onScroll = function(e) {
        for(var i = 0; i < elements.length; i++) {
            rotate(elements[i], i % 2 === 0 ? 'left' : 'right');
        }
    };

    function onResize(e) {
        initializeElements();
        onScroll();
    }

    if(disableOnSmallAndMediumDevices) {
        window.addEventListener('resize', function () {
            if (useDeviceJs) {
                if (DEVICE.SIZE === DEVICE.DEVICE_SIZE_SMALL || DEVICE.SIZE === DEVICE.DEVICE_SIZE_MEDIUM) {
                    window.removeEventListener('scroll', onScroll);
                    for (var i = 0; i < elements.length; i++) {
                        rotate(elements[i], i % 2 === 0 ? 'left' : 'right', 0);
                    }
                } else {
                    window.addEventListener('scroll', onScroll);
                }
            } else {
                // This code should not be reachable unless somebody delete device.js file
                window.addEventListener('scroll', onScroll);
            }
        });
    }
    else {
        window.addEventListener('scroll', onScroll);
    }

    window.addEventListener('scroll', onScroll);
    window.onresize = onResize;

    initializeElements();
    onScroll();

    $rotatable.removeClass("d-none");
})();