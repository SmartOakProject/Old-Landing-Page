(function ($) {
    var key = 'calendar2';
    var defaults = {
        locale: 'pl',
        url: {
            format: "js/calendar2/{Y}/{M}.json"
        },
        translation: {
            pl: {
                currentText: "Dziś",
                monthNames: [
                    "Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec",
                    "Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"
                ],
                monthNamesShort: [
                    "Sty","Lu","Mar","Kw","Maj","Cze",
                    "Lip","Sie","Wrz","Pa","Lis","Gru"
                ],
                weekDays: [ "Niedziela","Poniedziałek","Wtorek","Środa","Czwartek","Piątek","Sobota" ],
                weekDaysShort: [ "Niedz","Pon","Wt","Śr","Czw","Pt","Sob" ],
                dateFormat: "dd.mm.yy"
            }
        }
    };

    var methods = {
        init : function( options ) {
            return this.each(function() {
                var settings = {};

                if(typeof $(this).data(key) !== "undefined") {
                    settings = $.extend({}, $(this).data(key), options || {});
                } else {
                    settings = $.extend({}, defaults, options || {});
                }

                $(this).data(key, settings);

                getDataFromExternalSourcesAsync($(this), settings.data, settings.render);
            });
        },

        previous: function() {
            var settings = $(this).data(key);
            var urls = [];
            $.each(settings.responses, function() {
                var nextDate    = new Date(this.year, this.month-1, 1);
                nextDate.setMonth(nextDate.getMonth() - 1);
                urls.push(
                    settings.url.format.replace('{Y}', nextDate.getFullYear()).replace('{M}', nextDate.getMonth() + 1)
                );
            });

            $(this).calendar2({
                data: urls
            });
        },

        next: function() {
            var settings = $(this).data(key);
            var urls = [];
            $.each(settings.responses, function() {
                var nextDate    = new Date(this.year, this.month-1, 1);
                nextDate.setMonth(nextDate.getMonth() + 1);
                urls.push(
                    settings.url.format.replace('{Y}', nextDate.getFullYear()).replace('{M}', nextDate.getMonth() + 1)
                );
            });

            $(this).calendar2({
                data: urls
            });
        },
    };

    $.fn.calendar2 = function(method) {
        if ( methods[method] ) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.calendar2' );
        }
    };

    function getWeekDayIndexOfMonthStart(month) {
        var date = new Date();
        date.setFullYear(
            date.getFullYear(),
            (month-1),
            1
        );
        return date.getDay();
    }

    function getDataFromExternalSourcesAsync($element, sources, callback) {
        var sourcePromises = [];
        $.each(sources, function() {
            sourcePromises.push($.getJSON(this));
        });

        var settings = $element.data(key);
        settings.responses = [];

        Promise.all(sourcePromises).then(function(data) {
            var calendars = [];
            $.each(data, function() {
                settings.responses.push(this);
                calendars.push(prepareSingleCalendar($element.data(key), this));
            });
            callback($element, calendars);
        });

        $element.data(key, settings);
    }

    function getMonthDaysMatrix(month, year) {
        var maxMonthDays    = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
        var daysInMonth     = new Date(year, month, 0).getDate();
        var daysMatrix = maxMonthDays.filter(function(day) { return day <= daysInMonth; });
        for(var blankDay=0; blankDay<getWeekDayIndexOfMonthStart(month); blankDay++) {
            daysMatrix.unshift(null);
        }
        return daysMatrix;
    }

    function loadEventsIntoDays(days, data) {
        $.each(days, function(index) {
            var day = days[index];
            days[index] = {
                day: (day !== null) ? day : null,
                events: data.events.filter(function(event) {
                    return event.day == day;
                }).map(function(event) {
                    var labels = [];
                    $.each(event.labels, function() {
                        labels.push(data.labels[this]);
                    });
                    return {
                        title:  event.title,
                        labels: labels
                    };
                })
            };
        });
    }

    function splitDaysIntoWeeks(days) {
        var weeks = [];

        var i,j,chunk = 7;
        for (i=0,j=days.length; i<j; i+=chunk) {
            weeks.push(days.slice(i,i+chunk))
        }

        return weeks;
    }

    function prepareSingleCalendar(settings, data) {
        var calendar = {};

        calendar.monthNumber    = data.month-1;
        calendar.monthName      = settings.translation[settings.locale].monthNames[data.month-1];
        calendar.year           = data.year;
        calendar.weekDaysShort  = settings.translation[settings.locale].weekDaysShort;
        calendar.weekDays       = settings.translation[settings.locale].weekDays;
        calendar.days           = getMonthDaysMatrix(data.month, data.year);
        calendar.labels         = [];

        loadEventsIntoDays(calendar.days, data);

        $.each(data.labels, function() {
            calendar.labels.push(this);
        });

        calendar.weeks          = splitDaysIntoWeeks(calendar.days);

        $.each(calendar.weeks, function() {
            var daysInWeek = this;
            $.each(daysInWeek, function() {
                this.isEmpty = (this.events.length === 0);
            });
        });

        return calendar;
    }
})(jQuery);