(function () {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const input = form.querySelector("input[name='q']");
      const query = input ? input.value.trim() : "";
      const url = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
      window.location.href = url;
    });
  });

  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  let heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === heroIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === heroIndex);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      showHero(i);
    });
  });

  if (slides.length > 1) {
    showHero(0);
    setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  const filterInput = document.querySelector("[data-filter-input]");
  const cards = Array.from(document.querySelectorAll("[data-search-card]"));
  const emptyState = document.querySelector("[data-empty-state]");

  function applyFilter(value) {
    const query = (value || "").trim().toLowerCase();
    let visible = 0;

    cards.forEach(function (card) {
      const text = (card.getAttribute("data-search-text") || "").toLowerCase();
      const matched = !query || text.indexOf(query) !== -1;
      card.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visible === 0);
    }
  }

  if (filterInput) {
    const params = new URLSearchParams(window.location.search);
    const keyword = params.get("q") || "";
    if (keyword) {
      filterInput.value = keyword;
    }
    filterInput.addEventListener("input", function () {
      applyFilter(filterInput.value);
    });
    applyFilter(filterInput.value);
  }
}());

function setupVideo(streamUrl) {
  const video = document.querySelector("[data-player-video]");
  const cover = document.querySelector("[data-player-cover]");
  let attached = false;
  let hlsInstance = null;

  if (!video || !cover || !streamUrl) {
    return;
  }

  function attach() {
    if (attached) {
      return Promise.resolve();
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls();
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);

      return new Promise(function (resolve) {
        let done = false;
        const finish = function () {
          if (!done) {
            done = true;
            resolve();
          }
        };
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, finish);
        setTimeout(finish, 1200);
      });
    }

    video.src = streamUrl;
    return Promise.resolve();
  }

  function play() {
    cover.classList.add("is-hidden");
    attach().then(function () {
      return video.play();
    }).catch(function () {});
  }

  cover.addEventListener("click", play);
  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });
}
