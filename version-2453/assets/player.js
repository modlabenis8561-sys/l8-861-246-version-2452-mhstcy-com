var playerState = {
    hls: null,
    ready: false
};

async function attachSource(video, source) {
    if (playerState.ready) {
        return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        playerState.ready = true;
        return;
    }
    var module = await import('./hls-dru42stk.js');
    var Hls = module.H;
    if (Hls && Hls.isSupported()) {
        if (playerState.hls) {
            playerState.hls.destroy();
        }
        playerState.hls = new Hls();
        playerState.hls.loadSource(source);
        playerState.hls.attachMedia(video);
        playerState.ready = true;
        return;
    }
    video.src = source;
    playerState.ready = true;
}

async function startVideo(video, overlay) {
    var source = video.getAttribute('data-hls');
    if (!source) {
        return;
    }
    await attachSource(video, source);
    overlay.classList.add('is-hidden');
    try {
        await video.play();
    } catch (error) {
        overlay.classList.remove('is-hidden');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    var video = document.getElementById('movie-player');
    var overlay = document.getElementById('play-overlay');
    if (!video || !overlay) {
        return;
    }
    overlay.addEventListener('click', function () {
        startVideo(video, overlay);
    });
    video.addEventListener('click', function () {
        if (video.paused) {
            startVideo(video, overlay);
        }
    });
    video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
        if (!video.ended) {
            overlay.classList.remove('is-hidden');
        }
    });
});
