(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function() {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function() {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initCardFilter() {
    var input = document.querySelector("[data-card-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
    if (!cards.length) {
      return;
    }
    var activeTag = "all";

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function(card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var tags = (card.getAttribute("data-tags") || "").toLowerCase();
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchTag = activeTag === "all" || tags.indexOf(activeTag.toLowerCase()) !== -1;
        card.style.display = matchQuery && matchTag ? "" : "none";
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    chips.forEach(function(chip) {
      chip.addEventListener("click", function() {
        activeTag = chip.getAttribute("data-filter-chip") || "all";
        chips.forEach(function(item) {
          item.classList.toggle("is-active", item === chip);
        });
        apply();
      });
    });
  }

  function initSearchPage() {
    var grid = document.querySelector("[data-search-results]");
    if (!grid || !window.SEARCH_INDEX) {
      return;
    }
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var params = new URLSearchParams(window.location.search);
    var firstQuery = params.get("q") || "";
    if (input) {
      input.value = firstQuery;
    }

    function cardHTML(item) {
      var tags = item.tags.slice(0, 3).map(function(tag) {
        return '<span class="tag">' + escapeHTML(tag) + "</span>";
      }).join("");
      return [
        '<a class="movie-card" href="' + escapeHTML(item.href) + '">',
        '<div class="poster-frame">',
        '<img src="' + escapeHTML(item.img) + '" alt="' + escapeHTML(item.title) + '" loading="lazy">',
        '<span class="badge poster-badge">' + escapeHTML(item.region) + "</span>",
        '<span class="poster-year">' + escapeHTML(item.year) + "年</span>",
        "</div>",
        '<div class="card-body">',
        '<h3 class="card-title line-clamp-2">' + escapeHTML(item.title) + "</h3>",
        '<p class="card-desc line-clamp-2">' + escapeHTML(item.oneLine) + "</p>",
        '<div class="tag-list">' + tags + "</div>",
        "</div>",
        "</a>"
      ].join("");
    }

    function render(query) {
      var q = (query || "").trim().toLowerCase();
      var results = window.SEARCH_INDEX.filter(function(item) {
        if (!q) {
          return item.hot;
        }
        return item.searchText.toLowerCase().indexOf(q) !== -1;
      }).slice(0, q ? 120 : 80);

      if (!results.length) {
        grid.innerHTML = '<div class="empty-state">没有找到匹配影片，请更换关键词。</div>';
        return;
      }
      grid.innerHTML = results.map(cardHTML).join("");
    }

    if (form) {
      form.addEventListener("submit", function(event) {
        event.preventDefault();
        var value = input ? input.value.trim() : "";
        var url = value ? "search.html?q=" + encodeURIComponent(value) : "search.html";
        window.history.replaceState({}, "", url);
        render(value);
      });
    }

    render(firstQuery);
  }

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function(player) {
      var video = player.querySelector("video[data-hls-src]");
      var button = player.querySelector("[data-play-button]");
      if (!video || !button) {
        return;
      }
      var loaded = false;
      var hls = null;

      function load() {
        return new Promise(function(resolve) {
          if (loaded) {
            resolve();
            return;
          }
          var source = video.getAttribute("data-hls-src");
          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
              loaded = true;
              resolve();
            });
            hls.on(window.Hls.Events.ERROR, function() {
              loaded = true;
              resolve();
            });
          } else {
            video.src = source;
            loaded = true;
            resolve();
          }
        });
      }

      function playVideo() {
        load().then(function() {
          var result = video.play();
          if (result && typeof result.catch === "function") {
            result.catch(function() {
              player.classList.add("is-ready");
            });
          }
        });
      }

      button.addEventListener("click", function(event) {
        event.preventDefault();
        playVideo();
      });

      video.addEventListener("click", function() {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });

      video.addEventListener("play", function() {
        player.classList.add("is-playing");
      });

      video.addEventListener("pause", function() {
        player.classList.remove("is-playing");
      });

      window.addEventListener("beforeunload", function() {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function() {
    initMenu();
    initHero();
    initCardFilter();
    initSearchPage();
    initPlayers();
  });
})();
