(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function textOf(card) {
    return [
      card.getAttribute("data-title") || "",
      card.getAttribute("data-region") || "",
      card.getAttribute("data-type") || "",
      card.getAttribute("data-year") || "",
      card.getAttribute("data-genre") || "",
      card.getAttribute("data-tags") || ""
    ].join(" ").toLowerCase();
  }

  function setupNavigation() {
    var button = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupCarousel() {
    var carousel = document.querySelector("[data-carousel]");

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-dot]"));
    var previous = carousel.querySelector("[data-carousel-prev]");
    var next = carousel.querySelector("[data-carousel-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupFilters() {
    var blocks = Array.prototype.slice.call(document.querySelectorAll("[data-filter-block]"));

    blocks.forEach(function (block) {
      var input = block.querySelector("[data-filter-input]");
      var typeSelect = block.querySelector("[data-filter-type]");
      var regionSelect = block.querySelector("[data-filter-region]");
      var cards = Array.prototype.slice.call(block.querySelectorAll("[data-card]"));
      var empty = block.querySelector("[data-empty]");
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");

      if (input && query) {
        input.value = query;
      }

      function apply() {
        var term = input ? input.value.trim().toLowerCase() : "";
        var selectedType = typeSelect ? typeSelect.value : "";
        var selectedRegion = regionSelect ? regionSelect.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var matchedText = !term || textOf(card).indexOf(term) !== -1;
          var matchedType = !selectedType || card.getAttribute("data-type") === selectedType;
          var matchedRegion = !selectedRegion || card.getAttribute("data-region") === selectedRegion;
          var shouldShow = matchedText && matchedType && matchedRegion;

          card.hidden = !shouldShow;
          if (shouldShow) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (typeSelect) {
        typeSelect.addEventListener("change", apply);
      }
      if (regionSelect) {
        regionSelect.addEventListener("change", apply);
      }

      apply();
    });
  }

  ready(function () {
    setupNavigation();
    setupCarousel();
    setupFilters();
  });
})();

function initMoviePlayer(streamUrl) {
  var video = document.getElementById("movie-player");
  var start = document.getElementById("player-start");
  var attached = false;
  var hls = null;

  if (!video) {
    return;
  }

  function attach() {
    if (attached) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    attached = true;
  }

  function begin() {
    attach();

    if (start) {
      start.classList.add("is-hidden");
    }

    var result = video.play();

    if (result && typeof result.catch === "function") {
      result.catch(function () {
        if (start) {
          start.classList.remove("is-hidden");
        }
      });
    }
  }

  if (start) {
    start.addEventListener("click", begin);
  }

  video.addEventListener("click", function () {
    if (video.paused || !attached) {
      begin();
    }
  });

  video.addEventListener("play", function () {
    if (start) {
      start.classList.add("is-hidden");
    }
  });
}
