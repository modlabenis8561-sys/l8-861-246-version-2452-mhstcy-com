(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = $('[data-menu-toggle]');
    var nav = $('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slides = $all('[data-hero-slide]');
    var tabs = $all('[data-hero-tab]');
    if (!slides.length || !tabs.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      tabs.forEach(function (tab, i) {
        tab.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () {
        activate(index);
        start();
      });
    });

    var hero = $('[data-hero]');
    if (hero) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
    }

    activate(0);
    start();
  }

  function setupFilters() {
    var input = $('[data-filter-input]');
    var typeSelect = $('[data-filter-type]');
    var regionSelect = $('[data-filter-region]');
    var cards = $all('[data-movie-card]');
    if (!cards.length) {
      return;
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var cardType = card.getAttribute('data-type') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        var matchedQuery = !query || text.indexOf(query) !== -1;
        var matchedType = !type || cardType === type;
        var matchedRegion = !region || cardRegion === region;
        card.classList.toggle('is-filter-hidden', !(matchedQuery && matchedType && matchedRegion));
      });
    }

    [input, typeSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  function setupPlayer() {
    var video = $('[data-video-player]');
    var cover = $('[data-player-cover]');
    var trigger = $('[data-play-trigger]');
    if (!video || !trigger) {
      return;
    }

    var stream = video.getAttribute('data-stream') || '';
    var playerReady = false;
    var hlsInstance = null;

    function preparePlayer() {
      if (playerReady || !stream) {
        return;
      }
      playerReady = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function play() {
      preparePlayer();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.controls = true;
      var request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {});
      }
    }

    trigger.addEventListener('click', play);
    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
