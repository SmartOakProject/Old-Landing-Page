
    var element         = document.getElementById('header');

    if(element !== null) {
        var leftPolygon     = document.getElementById("left-polygon");
        var rightPolygon    = document.getElementById("right-polygon");

        var max             = element.offsetHeight;

        // Tu obliczamy procent animacji
        // current - aktualny scrolltop
        // max - wysokość elementu w którym mamy SVG, tj. #main-header
        // Tak więc jeżeli max = 500px a scrolltop to 250px, to jesteśmy w 50% animacji
        function getAnimationPercent(current, max) {
            return current /  max;
        }

        function requestAnimation(element, points) {
            var time = {
                start: performance.now(),
                total: 1200
            };

            var tick = function tick(now) {
                time.elapsed = now - time.start;
                var progress = Math.min(time.elapsed / time.total, 1);

                element.setAttribute("points", points.join(" "));

                if (progress < 1) {
                    requestAnimationFrame(tick);
                }
            };

            requestAnimationFrame(tick);
        }

        document.addEventListener('scroll', function() {
            var scrollPercent   = parseInt(($(document).scrollTop() / max)*100);

            // These factors are some kind of fixtures, used to manually adjust lines behaviour
            var leftFactor = 3.55;
            var rightFactor = 2.30;

            if(leftPolygon !== null) {
                requestAnimation(leftPolygon, [0,100, 0, (scrollPercent/leftFactor)+70, 100,100]);
                requestAnimation(rightPolygon, [100, 100, 100, (scrollPercent/rightFactor)+50, 0, 100]);
            }
        });
    }
