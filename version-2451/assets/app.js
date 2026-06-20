(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[char];
        });
    }

    function initMenu() {
        var button = qs("[data-menu-toggle]");
        var menu = qs("[data-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initSearchForms() {
        qsa(".site-search").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = qs("input[name='q']", form);
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    return;
                }
                event.preventDefault();
                window.location.href = "./search.html?q=" + encodeURIComponent(input.value.trim());
            });
        });
    }

    function initHero() {
        var slider = qs("[data-slider]");
        if (!slider) {
            return;
        }
        var slides = qsa("[data-slide]", slider);
        var dots = qsa("[data-slide-dot]", slider);
        var previous = qs("[data-slide-prev]", slider);
        var next = qs("[data-slide-next]", slider);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (previous) {
            previous.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide-dot") || 0));
                start();
            });
        });
        start();
    }

    function initCategoryFilter() {
        var input = qs(".category-filter");
        var grid = qs("#category-grid");
        if (!input || !grid) {
            return;
        }
        var cards = qsa(".movie-card", grid);
        input.addEventListener("input", function () {
            var value = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                card.style.display = !value || text.indexOf(value) !== -1 ? "" : "none";
            });
        });
    }

    function loadStream(video, stream, done) {
        if (!video || !stream) {
            return;
        }
        if (video.getAttribute("data-ready") === "1") {
            done();
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
            video.setAttribute("data-ready", "1");
            done();
            return;
        }
        var HlsCtor = window.Hls;
        if (HlsCtor && HlsCtor.isSupported && HlsCtor.isSupported()) {
            if (video.hlsPlayer) {
                video.hlsPlayer.destroy();
            }
            var hls = new HlsCtor({
                enableWorker: true,
                lowLatencyMode: true
            });
            video.hlsPlayer = hls;
            hls.loadSource(stream);
            hls.attachMedia(video);
            if (HlsCtor.Events && HlsCtor.Events.MANIFEST_PARSED) {
                hls.on(HlsCtor.Events.MANIFEST_PARSED, function () {
                    video.setAttribute("data-ready", "1");
                    done();
                });
            } else {
                video.setAttribute("data-ready", "1");
                done();
            }
            return;
        }
        video.src = stream;
        video.setAttribute("data-ready", "1");
        done();
    }

    function initPlayers() {
        qsa(".player-shell").forEach(function (shell) {
            var video = qs("video", shell);
            var button = qs(".player-start", shell);
            if (!video) {
                return;
            }
            var stream = video.getAttribute("data-stream");
            function play() {
                loadStream(video, stream, function () {
                    var promise = video.play();
                    if (promise && promise.catch) {
                        promise.catch(function () {});
                    }
                    if (button) {
                        button.classList.add("is-hidden");
                    }
                });
            }
            if (button) {
                button.addEventListener("click", play);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
        });
    }

    function renderSearchCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
            "<a href=\"./" + escapeHtml(movie.file) + "\" class=\"card-link\">" +
            "<div class=\"poster-wrap\">" +
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<div class=\"poster-mask\"><span class=\"play-mark\">▶</span></div>" +
            "<span class=\"card-badge\">" + escapeHtml(movie.category) + "</span>" +
            "</div><div class=\"card-body\">" +
            "<p class=\"card-meta\">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + "</p>" +
            "<h3>" + escapeHtml(movie.title) + "</h3>" +
            "<p class=\"card-line\">" + escapeHtml(movie.line) + "</p>" +
            "<div class=\"tag-row\">" + tags + "</div>" +
            "</div></a></article>";
    }

    function initSearchPage() {
        var target = qs("#search-results");
        if (!target || !window.siteMovies) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim().toLowerCase();
        var input = qs(".big-search input[name='q']");
        if (input) {
            input.value = params.get("q") || "";
        }
        var list = window.siteMovies.filter(function (movie) {
            if (!query) {
                return true;
            }
            var haystack = [
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.category,
                (movie.tags || []).join(" "),
                movie.line
            ].join(" ").toLowerCase();
            return haystack.indexOf(query) !== -1;
        }).slice(0, query ? 160 : 48);
        if (!list.length) {
            target.innerHTML = "<p class=\"empty-state\">没有匹配内容，请尝试其他关键词。</p>";
            return;
        }
        target.innerHTML = list.map(renderSearchCard).join("");
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initSearchForms();
        initHero();
        initCategoryFilter();
        initPlayers();
        initSearchPage();
    });
})();
