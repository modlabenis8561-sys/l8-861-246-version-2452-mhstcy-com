(function () {
  function setupPlayer(videoId, playId, shellId, mediaUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(playId);
    var shell = document.getElementById(shellId);
    var attached = false;
    var hls = null;

    if (!video || !button || !shell || !mediaUrl) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = mediaUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(mediaUrl);
        hls.attachMedia(video);
        return;
      }

      video.src = mediaUrl;
    }

    function start() {
      attach();
      shell.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      start();
    });

    shell.addEventListener('click', function (event) {
      if (event.target === button) {
        return;
      }
      if (!attached || video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });

    video.addEventListener('ended', function () {
      shell.classList.remove('is-playing');
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  window.setupPlayer = setupPlayer;
})();
