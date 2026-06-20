(function () {
    function queryAll(selector, context) {
        return Array.prototype.slice.call((context || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    queryAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('is-missing');
        });
    });

    var toggle = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    queryAll('[data-hero]').forEach(function (hero) {
        var slides = queryAll('[data-hero-slide]', hero);
        var dots = queryAll('[data-hero-dot]', hero);
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function schedule() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        if (previous) {
            previous.addEventListener('click', function () {
                show(index - 1);
                schedule();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                schedule();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                schedule();
            });
        });

        show(0);
        schedule();
    });

    function filterCards(scope) {
        var input = scope.querySelector('[data-filter-input]');
        var year = scope.querySelector('[data-filter-year]');
        var type = scope.querySelector('[data-filter-type]');
        var cards = queryAll('[data-filter-card]', scope);
        var empty = scope.querySelector('[data-empty-state]');

        function apply() {
            var keyword = normalize(input && input.value);
            var yearValue = normalize(year && year.value);
            var typeValue = normalize(type && type.value);
            var visibleCount = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-filter-text'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var cardType = normalize(card.getAttribute('data-type'));
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchYear = !yearValue || cardYear === yearValue;
                var matchType = !typeValue || cardType.indexOf(typeValue) !== -1;
                var visible = matchKeyword && matchYear && matchType;
                card.classList.toggle('hidden-by-filter', !visible);
                if (visible) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visibleCount === 0);
            }
        }

        [input, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && input) {
            input.value = q;
        }

        apply();
    }

    queryAll('[data-filter-scope]').forEach(filterCards);

    queryAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var cover = player.querySelector('[data-player-cover]');
        var button = player.querySelector('[data-play-button]');
        var source = video ? video.getAttribute('data-src') : '';
        var loaded = false;
        var hlsInstance = null;

        function load() {
            if (!video || !source || loaded) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
            loaded = true;
        }

        function play() {
            load();
            player.classList.add('is-playing');
            if (video) {
                var request = video.play();
                if (request && typeof request.catch === 'function') {
                    request.catch(function () {});
                }
            }
        }

        if (cover) {
            cover.addEventListener('click', play);
        }
        if (button) {
            button.addEventListener('click', play);
        }
        if (video) {
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
            video.addEventListener('emptied', function () {
                if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
                loaded = false;
            });
        }
    });
})();
