(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function textOf(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function bindNavigation() {
    var button = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function bindFilters() {
    var input = document.querySelector("[data-filter-input]");
    var year = document.querySelector("[data-filter-year]");
    var type = document.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var empty = document.querySelector("[data-no-results]");
    if (!cards.length || (!input && !year && !type)) {
      return;
    }

    function apply() {
      var query = textOf(input && input.value);
      var selectedYear = textOf(year && year.value);
      var selectedType = textOf(type && type.value);
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = textOf([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-category"),
          card.textContent
        ].join(" "));
        var cardYear = textOf(card.getAttribute("data-year"));
        var genre = textOf(card.getAttribute("data-genre") + " " + card.textContent);
        var ok = true;

        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }
        if (selectedYear && cardYear !== selectedYear) {
          ok = false;
        }
        if (selectedType && genre.indexOf(selectedType) === -1) {
          ok = false;
        }

        card.classList.toggle("hidden-by-filter", !ok);
        if (ok) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", shown === 0);
      }
    }

    [input, year, type].forEach(function (node) {
      if (node) {
        node.addEventListener("input", apply);
        node.addEventListener("change", apply);
      }
    });
  }

  function bindHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });

    setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  window.initMoviePlayer = function (videoId, layerId, streamUrl) {
    var video = document.getElementById(videoId);
    var layer = document.getElementById(layerId);
    if (!video || !streamUrl) {
      return;
    }

    function attach() {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      attach();
      if (layer) {
        layer.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (layer) {
      layer.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
  };

  ready(function () {
    bindNavigation();
    bindFilters();
    bindHero();
  });
})();
