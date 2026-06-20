(function () {
    function toggleMobileNavigation() {
        var button = document.querySelector('.mobile-menu-button');
        var nav = document.querySelector('.mobile-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            var isOpen = nav.classList.toggle('is-open');
            button.setAttribute('aria-expanded', String(isOpen));
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        if (!slides.length) {
            return;
        }
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        var prev = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 6500);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-target')) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        restart();
    }

    function setupCardFilter() {
        var input = document.querySelector('[data-card-search]');
        var list = document.querySelector('[data-card-list]');
        if (!input || !list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.children);
        var activeChip = '';
        var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function apply() {
            var keyword = normalize(input.value);
            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.textContent
                ].join(' '));
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedChip = !activeChip || text.indexOf(normalize(activeChip)) !== -1;
                card.setAttribute('data-hidden', matchedKeyword && matchedChip ? 'false' : 'true');
            });
        }

        input.addEventListener('input', apply);
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                activeChip = chip.getAttribute('data-filter-chip') || '';
                chips.forEach(function (item) {
                    item.classList.toggle('is-active', item === chip);
                });
                apply();
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        toggleMobileNavigation();
        setupHero();
        setupCardFilter();
    });
}());
