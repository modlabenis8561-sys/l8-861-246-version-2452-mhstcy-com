(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-slide-dot]'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
            });
        });

        window.setInterval(function () {
            showSlide(current + 1);
        }, 5000);
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function cardText(card) {
        return normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.tags,
            card.dataset.year,
            card.dataset.category
        ].join(' '));
    }

    function filterCards(options) {
        var cards = Array.prototype.slice.call(document.querySelectorAll(options.cards));
        var keyword = normalize(options.keyword && options.keyword.value);
        var category = normalize(options.category && options.category.value);
        var year = normalize(options.year && options.year.value);
        var type = normalize(options.type && options.type.value);
        var visibleCount = 0;

        cards.forEach(function (card) {
            var text = cardText(card);
            var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchesCategory = !category || normalize(card.dataset.category) === category;
            var matchesYear = !year || normalize(card.dataset.year) === year;
            var matchesType = !type || normalize(card.dataset.type).indexOf(type) !== -1;
            var isVisible = matchesKeyword && matchesCategory && matchesYear && matchesType;

            card.style.display = isVisible ? '' : 'none';

            if (isVisible) {
                visibleCount += 1;
            }
        });

        if (options.status) {
            options.status.textContent = visibleCount ? '已匹配到相关影片' : '没有匹配结果';
        }
    }

    var searchPage = document.querySelector('[data-search-page]');

    if (searchPage) {
        var searchInput = searchPage.querySelector('[data-search-input]');
        var categoryFilter = searchPage.querySelector('[data-category-filter]');
        var yearFilter = searchPage.querySelector('[data-year-filter]');
        var status = searchPage.querySelector('[data-filter-status]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query && searchInput) {
            searchInput.value = query;
        }

        function updateSearch() {
            filterCards({
                cards: '[data-search-results] .searchable-card',
                keyword: searchInput,
                category: categoryFilter,
                year: yearFilter,
                status: status
            });
        }

        [searchInput, categoryFilter, yearFilter].forEach(function (element) {
            if (element) {
                element.addEventListener('input', updateSearch);
                element.addEventListener('change', updateSearch);
            }
        });

        updateSearch();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-list-filter]')).forEach(function (bar) {
        var keyword = bar.querySelector('[data-local-search]');
        var type = bar.querySelector('[data-local-type]');
        var list = bar.parentElement.querySelector('[data-filter-list]');

        function updateList() {
            filterCards({
                cards: '[data-filter-list] .searchable-card',
                keyword: keyword,
                type: type
            });
        }

        if (list) {
            [keyword, type].forEach(function (element) {
                if (element) {
                    element.addEventListener('input', updateList);
                    element.addEventListener('change', updateList);
                }
            });
        }
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play]');
        var stream = player.getAttribute('data-stream');
        var hlsInstance = null;
        var hasLoaded = false;

        function loadVideo() {
            if (!video || !stream) {
                return;
            }

            player.classList.add('is-playing');

            if (!hasLoaded) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls();
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = stream;
                }

                hasLoaded = true;
            }

            var playAction = video.play();

            if (playAction && typeof playAction.catch === 'function') {
                playAction.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                loadVideo();
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!hasLoaded || video.paused) {
                    loadVideo();
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    });
})();
