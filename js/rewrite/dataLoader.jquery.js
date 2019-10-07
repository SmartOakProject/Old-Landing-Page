var cached_templates    = [];

(function($) {
    var API_URL             = 'https://api.oak.protean.pl';
    var DEFAULT_PALCEHOLDER = $('#main');

    var defaultLastLoader = {
        name: "neuron_foundation",
        type: "api"
    };

    var loaderMappings = {
        'download':             'Pobierz',
        'neuron_foundation':    'NeuroN Foundation',
        'new_neuropsychiatry':  'New Neuropsychiatry',
        'neuron_direction':     'NeuroN Direction',
        'oakes_innovate':       'Oakes Innovate',
        'ntv_channel':          'NeuroN TV',
        'oakes_clinic':         'Oakes Clinic',
        'oak_atlantis':         'Oak Atlantis',
        'neuron_currency':      'NeuroN Currency',
        'about_us':             'O nas',
        'contact':              'Kontakt',
        'events':               'Wydarzenia',
    };

    var templates   = [
        'templates/events.html',
        'templates/events/filters.html',
        'templates/events/incoming.html',
        'templates/events/news.html',
        'templates/events/calendar/calendar.html',
        'templates/events/calendar/wrapper.html',

        'templates/about_us.html',
        'templates/contact.html',
        'templates/default_content_template.html',
        'templates/default_header_template.html',
        'templates/default_news_template.html',
        'templates/default_template.html',
        'templates/download_template.html',
        'templates/footer_social_links.html',
        'templates/privacy_policy.html',
        'templates/social_links.html',
        'templates/search_results.html',
    ];

    function loadTemplates() {
        var templatePromises = [];
        $.each(templates, function() {
            templatePromises.push($.ajax({url: this}));
        });

        Promise.all(templatePromises).then(function(responses) {
            $.each(responses, function(index) {
                var key = (''+templates[index].split("/").slice(-1)).replace(/.html/g, "");
                cached_templates[key] = this;
            });
            $(document).trigger('templates-loaded');
        });
    }

    function defaultRenderer(response, $element, postRenderCallback) {
        $.each(response.articles, function(index) {
            this.isEven = (index % 2 === 0);
            this.index  = (index+1);
        });
        $.each(response.news, function(index) {
            this.isEven         = (index % 2 === 0);
        });

        $element.html(Mustache.render(
            cached_templates['default_template'].valueOf(),
            {
                header:     response.header,
                articles:   response.articles,
                news:       response.news
            },
            {
                content: cached_templates['default_content_template'],
                news: cached_templates['default_news_template'],
                header: cached_templates['default_header_template']
            }
        ));

        if(postRenderCallback !== null) {
            postRenderCallback();
        }
    }

    function defaultPostRenderCallback(additionalScripts = []) {
        var scripts = [
            '<script src="js/rewrite/line.js"></script>',
            '<script src="js/rewrite/rotator.jquery.js"></script>',
            '<script src="js/rewrite/header.jquery.js"></script>'
        ];

        scripts = scripts.concat(additionalScripts);

        $('#js').html(scripts.join(''));
        if(document.documentElement.scrollTop !== 0) {
            $('html, body').animate({
                scrollTop: 0
            }, 1000);
        }
    }

    function loadApiContent(loader, $element, postRenderCallback) {
        $.ajax({
            url: API_URL + '/api/tab/' + loader,
            success: function (response) {
                setLastLoader(loader, "api");
                switch(loader) {
                    case "about_us":
                        aboutUsLoader(response, $element, postRenderCallback);
                        break;
                    case "download":
                        downloadLoader(response, $element, postRenderCallback);
                        break;
                    default:
                        defaultLoader(response, $element, postRenderCallback);
                }
            }
        });
    }

    function getApiContent(loader) {
        return $.ajax({
            url: API_URL + '/api/tab/' + loader
        });
    }

    function loadTplContent(loader, $element, postRenderCallback) {
        setLastLoader(loader, "tpl");
        switch(loader) {
            case "privacy_policy":
                privacyPolicyLoader($element, postRenderCallback);
                break;
            case "contact":
                contactLoader($element, postRenderCallback);
                break;
            case "events":
                eventsLoader($element, function() {
                    defaultPostRenderCallback([
                        '<script src="js/calendar2/calendar2.jquery.js"></script>'
                    ]);

                    $(document).on('click', '#clnd-previous', function() {
                        $('#calendars').calendar2('previous');
                        return false;
                    });
                    $(document).on('click', '#clnd-next', function() {
                        $('#calendars').calendar2('next');
                        return false;
                    });

                    var currentDate     = new Date();
                    var currentMonth    = (currentDate.getMonth()+1);
                    var currentYear     = currentDate.getFullYear();

                    $('#calendars').calendar2({
                        data: [
                            'js/calendar2/' + currentYear + '/' + currentMonth + '.json'
                        ],
                        render: function($element, calendars) {
                            var html = Mustache.render(cached_templates['wrapper'].valueOf(), {
                                calendars: calendars
                            }, {
                                calendar: cached_templates['calendar'].valueOf()
                            });

                            $element.html(html);
                        }
                    });
                });
                break;
            default:
                throw "Unknown loader: " + loader;
        }
    }

    /**
     * Load data from remote source (API_URL)
     * @param e
     */
    function onDataApiLoaderClick(e) {
        var loader = $(e.target).data('api_loader');
        loadApiContent(loader);
        return false;
    }

    /**
     * Loads from template directly, no remote data has been received
     * @param e
     */
    function onDataTplLoaderClick(e) {
        var loader = $(e.target).data('tpl_loader');
        loadTplContent(loader);
    }

    function defaultLoader(json, $element, postRenderCallback) {
        $element                = $element || DEFAULT_PALCEHOLDER;
        postRenderCallback      = postRenderCallback || defaultPostRenderCallback;
        return defaultRenderer(json, $element, postRenderCallback);
    }

    // ABOUT US
    function aboutUsRenderer(response, $element, postRenderCallback) {
        $element.html(Mustache.render(
            cached_templates['about_us'].valueOf(),
            {
                header:     response.header,
                articles:   response.articles
            },
            {
                header: cached_templates['default_header_template']
            }
        ));

        if(postRenderCallback !== null) {
            postRenderCallback();
        }
    }

    function aboutUsLoader(response, $element, postRenderCallback) {
        $element                = $element || DEFAULT_PALCEHOLDER;
        postRenderCallback      = postRenderCallback || function() {
            var scripts = [
                '<script src="js/rewrite/line.js"></script>',
                '<script src="js/rewrite/header.jquery.js"></script>'
            ];

            $('#js').html(scripts.join(''));
            if(document.documentElement.scrollTop !== 0) {
                $('html, body').animate({
                    scrollTop: 0
                }, 1000);
            }
        };

        return aboutUsRenderer(response, $element, postRenderCallback);
    }

    // DOWNLOAD
    function downloadRenderer(response, $element, postRenderCallback) {
        $element.html(Mustache.render(
            cached_templates['download_template'].valueOf(),
            {
                articles:   response.articles
            }
        ));

        if(postRenderCallback !== null) {
            postRenderCallback();
        }
    }

    function downloadLoader(response, $element, postRenderCallback) {
        $element                = $element || DEFAULT_PALCEHOLDER;
        postRenderCallback      = postRenderCallback || defaultPostRenderCallback;
        return downloadRenderer(response, $element, postRenderCallback);
    }

    // CONTACT
    function contactRenderer(response, $element, postRenderCallback) {
        $element.html(Mustache.render(
            cached_templates['contact'].valueOf(), response
        ));

        if(postRenderCallback !== null) {
            postRenderCallback();
        }
    }

    function createContactResponse() {
        return {
            projects: [
                {
                    name: "Neuron Foundation",
                    subprojects:  []
                },
                {
                    name: "Oakes Innovate",
                    subprojects: []
                },
                {
                    name: "New Neuropsychiatry",
                    subprojects: []
                },
                {
                    name: "NeuroN Direction",
                    subprojects: []
                },
                {
                    name: "NTV Channel",
                    subprojects: []
                },
                {
                    name: "Oakes Clinic",
                    subprojects: []
                },
                {
                    name: "Oak Atlantis",
                    subprojects: []
                }
            ],
            contacts: [
                {
                    name:   'NeuroN Foundation',
                    email:  'contact@neuronfoundation.com',
                    phone:  '+48 514 438 369‬‬'
                },
                {
                    name:   'New Neuropsychiatry',
                    email:  'institut@newneuropsychiatry.com ',
                    phone:  '+48 795 553 121'
                },
                {
                    name:   'NeuroN Direction',
                    email:  'office@neurondirection.com',
                    phone:  '+48 797 620 025'
                },
                {
                    name:   'Oakes Innovate',
                    email:  'office@oakesinnovate.com',
                    phone:  '‭+48 889 222 988‬'
                },
                {
                    name:   'NTV Channel',
                    email:  'channel@neurontv.com',
                    phone:  '+48 514 438 369‬‬'
                },
                {
                    name:   'Oakes Clinic',
                    email:  'office@oakesclinic.com',
                    phone:  '+48 889 222 988'
                },
                {
                    name:   'Oak Atlantis',
                    email:  'nation@oakatlantis.com',
                    phone:  '+48 889 222 988'
                },
                /*
                {
                    name:   'Neuron Store',
                    email:  'shopping@neuronstore.com',
                    phone:  ''
                },*/
                {
                    name:   'Media i współpraca',
                    email:  'media@smartoakproject.com',
                    phone:  '+48 889 222 988‬'
                },
                {
                    name:   'Pomoc techniczna',
                    email:  'help@smartoakproject.com',
                    phone:  '+48 516 003 690'
                }
            ]
        };
    }

    function contactLoader($element, postRenderCallback) {
        $element                = $element || DEFAULT_PALCEHOLDER;
        postRenderCallback      = postRenderCallback || null;
        var response            = createContactResponse();

        // Malform response for Mustache template purpose
        $.each(response.projects, function() {
            this.isRoot = (this.subprojects.length === 0);
        });

        return contactRenderer(response, $element, postRenderCallback);
    }

    // PRIVACY POLICY

    function privacyPolicyRenderer(data, $element, postRenderCallback) {
        $element.html(Mustache.render(cached_templates['privacy_policy'].valueOf()));

        if(postRenderCallback !== null) {
            postRenderCallback();
        }
    }

    function privacyPolicyLoader($element, postRenderCallback) {
        $element                = $element || DEFAULT_PALCEHOLDER;
        postRenderCallback      = postRenderCallback || null;
        return privacyPolicyRenderer(null, $element, postRenderCallback);
    }

    // EVENTS

    function createEventsResponse(f) {
        return $.ajax({
            url: 'json/example-incoming-events-response.json',
            success: f
        });
    }

    function eventsRenderer(data, $element, postRenderCallback) {
        $element.html(Mustache.render(cached_templates['events'].valueOf(), data, {
            header:     cached_templates['default_header_template'].valueOf(),
            news:       cached_templates['news'].valueOf(),
            incoming:   cached_templates['incoming'].valueOf(),
            filters:    cached_templates['filters'].valueOf()
        }));

        if(postRenderCallback !== null) {
            postRenderCallback();
        }
    }

    function eventsLoader($element, postRenderCallback) {
        $element                = $element || DEFAULT_PALCEHOLDER;
        postRenderCallback      = postRenderCallback || defaultPostRenderCallback;

        createEventsResponse(function (data) {
            eventsRenderer(data, $element, postRenderCallback);
        });
    }

    /**
     * Indexes the page contents so it can be searched later, also preloads page requests
     *
     * This one is little messy as the data sources are not in union
     * Some data are loaded via template and static content, other are loaded from API
     */
    function indexContenet() {
        var apiLoaders = [
            'download',
            'neuron_foundation',
            'new_neuropsychiatry',
            'neuron_direction',
            'oakes_innovate',
            'ntv_channel',
            'oakes_clinic',
            'oak_atlantis',
            'neuron_currency',
            'about_us',
        ];

        createEventsResponse(function (events) {
            var indexedContent = [];

            var contacts = createContactResponse();

            indexedContent.push($.extend({ loader: "events" }, events));
            indexedContent.push($.extend({ loader: "contact" }, contacts));

            var apiPromises = [];
            $.each(apiLoaders, function() {
                apiPromises.push(getApiContent(this));
            });

            Promise.all(apiPromises).then(function(data) {
                $.each(data, function(key) {
                    this.loader = apiLoaders[key];
                    this.tab    = loaderMappings[this.loader];
                    indexedContent.push(this);
                });
                localStorage.setItem('INDEXED_CONTENT', JSON.stringify(indexedContent));
                $(document).trigger('content-indexed');
            });
        });
    }

    /**
     * Searches the indexed content
     *
     * @param term
     * @returns {Array}
     */
    function search(term) {
        term = term.toLowerCase();

        var content = JSON.parse(localStorage.getItem('INDEXED_CONTENT'));
        var results = [];

        $.each(content, function () {
            if(this.tab != null && this.tab.toLowerCase().indexOf(term) >= 0) {
                if(this.loader === "events" || this.loader === "contact") {
                    this.loadWith = "tpl_loader";
                } else {
                    this.loadWith = "api_loader";
                }
                this.displayText = loaderMappings[this.loader];
                results.push(this);
                return true;
            }

            if(this.loader === "events") {
                if(searchEvents(this, term)) {
                    this.loadWith = "tpl_loader";
                    this.displayText = loaderMappings[this.loader];
                    results.push(this);
                }
                return true;
            }
            if(this.loader === "contact") {
                if(searchContacts(this, term)) {
                    this.loadWith = "tpl_loader";
                    this.displayText = loaderMappings[this.loader];
                    results.push(this);
                }
                return true;
            }

            if(searchTermInHeader(this, term) || searchTermInArticles(this, term)) {
                this.loadWith = "api_loader";
                this.displayText = loaderMappings[this.loader];
                results.push(this);
            }
        });

        return results;
    }

    function searchContacts(page, term) {
        term = term.toLowerCase();
        var result = false;

        $.each(page.contacts, function() {
            if(result === true) {
                return true;
            }

            if(this.name.toLowerCase().indexOf(term) >= 0) {
                result = true;
                return true;
            }
            if(this.email.toLowerCase().indexOf(term) >= 0) {
                result = true;
                return true;
            }
            if(this.phone.toLowerCase().indexOf(term) >= 0) {
                result = true;
                return true;
            }
        });

        if(result) {
            return true;
        }

        $.each(page.projects, function() {
            if(result === true) {
                return true;
            }

            if(this.name.toLowerCase().indexOf(term) >= 0) {
                result = true;
                return true;
            }
        });

        return result;
    }

    function searchEvents(page, term) {
        term = term.toLowerCase();

        var result = false;

        $.each(page.events, function() {
            if(result === true) {
                return true;
            }

            var event = this;

            if(event.description.toLowerCase().indexOf(term) >= 0) {
                result = true;
                return true;
            }

            if(JSON.stringify(event.time).toLowerCase().indexOf(term) >= 0) {
                result = true;
                return true;
            }

            if(JSON.stringify(event.title).toLowerCase().indexOf(term) >= 0) {
                result = true;
                return true;
            }
        });

        return result;
    }

    function searchTermInHeader(page, term) {
        term = term.toLowerCase();

        if(page.header.content.toLowerCase().indexOf(term) >= 0) {
            return true;
        }
        if(page.header.text1 !== null && page.header.text1.toLowerCase().indexOf(term) >= 0) {
            return true;
        }
        if(page.header.text2 !== null && page.header.text2.toLowerCase().indexOf(term) >= 0) {
            return true;
        }
        if(page.header.text3 !== null && page.header.text3.toLowerCase().indexOf(term) >= 0) {
            return true;
        }
        if(page.header.text4 !== null && page.header.text4.toLowerCase().indexOf(term) >= 0) {
            return true;
        }
        if(page.header.text5 !== null && page.header.text5.toLowerCase().indexOf(term) >= 0) {
            return true;
        }

        return false;
    }

    function searchTermInArticles(page, term) {
        term = term.toLowerCase();

        var result = false;
        $.each(page.articles, function() {
            if(result === false) {
                var article = this;
                if(article.content.toLowerCase().indexOf(term) >= 0) {
                    result = true;
                    return true;
                }
                if(article.title.toLowerCase().indexOf(term) >= 0) {
                    result = true;
                    return true;
                }
            }
        });
        return result;
    }

    function handleDesktopInputSearchKeyUp(e) {
        $('body').addClass('no-scroll');
        var $input  = $(e.target);
        var term    = $input.val();

        var html = Mustache.render(cached_templates['search_results'].valueOf(), {
            results: search(term)
        });

        var $existingSearchResults = $('.searchResults');
        if($existingSearchResults.length) {
            $existingSearchResults.remove();
        }
        $('body').append(html);

        // This is previous state, if this is a first time search attempt use animation
        // This is to prevent spamming fadeIn with every input key press
        if($existingSearchResults.length === 0) {
            $('.searchResults').addClass('fadeIn');
        }
    }

    function handleMobileInputSearchKeyUp(e) {
        $('body').addClass('no-scroll');

        var $input  = $(e.target);
        var term    = $input.val();

        var html = Mustache.render(cached_templates['search_results'].valueOf(), {
            results: search(term)
        });

        var $mobileSearchPlaceholder    = $('#mobileSearchPlaceholder');
        $mobileSearchPlaceholder.html(html);

        var $searchResults  = $mobileSearchPlaceholder.find('div.searchResults');
        $searchResults.removeClass('d-none');
        $searchResults.addClass('open');

        // Intentionally we want to do this on mobile devices as
        // desktop devices hides search input when you click on anything
        $('.close').click(function() {
            $searchResults.removeClass('open');
            $(e.target).val("");
        });
    }

    function onInputSearchKeyUp(e) {
        if($(document).width() >= 992) {
            handleDesktopInputSearchKeyUp(e);
        } else {
            handleMobileInputSearchKeyUp(e);
        }
    }

    /**
     * Once we reload the page we land in default neuron foundation page, this is NOT desired
     * We need to save in local storage the last used loader and fetch it on page load
     *
     * @param name Just a loader name like "events" or "neuron_foundation"
     * @param type A type that may be "api" or "tpl"
     */
    function setLastLoader(name, type) {
        localStorage.setItem("lastLoader", JSON.stringify({
            name: name,
            type: type
        }));
    }

    function getLastLoader() {
        var lastLoader = localStorage.getItem("lastLoader");
        if(lastLoader === null) {
            return defaultLastLoader;
        }

        return JSON.parse(lastLoader);
    }

    function setLastLoaderActiveTab(name, type) {
        if(type === "api") {
            return $('[data-api_loader="' + name + '"]:first').addClass("active");
        }

        if(type === "tpl") {
            return $('[data-tpl_loader="' + name + '"]:first').addClass("active");
        }

        throw "Unknown type: " + type;
    }

    function onTemplatesLoaded() {
        var lastLoader = getLastLoader();
        setLastLoaderActiveTab(lastLoader.name, lastLoader.type);
        if(lastLoader.type === "api") {
            return loadApiContent(lastLoader.name);
        }
        if(lastLoader.type === "tpl") {
            return loadTplContent(lastLoader.name);
        }

        throw "Could not determine last loader";
    }

    function onContentIndexed() {
        // Nothing to do here so far
    }

    $(document).on('click', '[data-api_loader]', onDataApiLoaderClick);
    $(document).on('click', '[data-tpl_loader]', onDataTplLoaderClick);
    $(document).on('keyup', 'input.search', onInputSearchKeyUp);
    $(document).on('templates-loaded', onTemplatesLoaded);
    $(document).on('content-indexed', onContentIndexed);

    loadTemplates();
    indexContenet();
})(jQuery);