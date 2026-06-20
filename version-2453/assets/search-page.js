(function () {
    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function getQueryValue() {
        var params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    }

    function renderCard(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card compact-card">',
            '<a class="card-poster" href="' + item.url + '">',
            '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
            '<span class="play-badge">▶</span>',
            '<span class="year-badge">' + escapeHtml(item.year) + '</span>',
            '</a>',
            '<div class="card-body">',
            '<div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
            '<h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>',
            '<p>' + escapeHtml(item.summary) + '</p>',
            '<div class="tag-row">' + tags + '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function setupSearch() {
        var input = document.getElementById('global-search-input');
        var summary = document.getElementById('global-search-summary');
        var results = document.getElementById('global-search-results');
        var data = window.MOVIE_SEARCH_DATA || [];
        if (!input || !summary || !results) {
            return;
        }

        function perform() {
            var keyword = normalize(input.value);
            if (!keyword) {
                results.innerHTML = '';
                summary.textContent = '输入关键词后显示匹配影片。';
                return;
            }
            var matched = data.filter(function (item) {
                var text = normalize([
                    item.title,
                    item.region,
                    item.type,
                    item.year,
                    item.genre,
                    (item.tags || []).join(' '),
                    item.summary
                ].join(' '));
                return text.indexOf(keyword) !== -1;
            }).slice(0, 96);
            summary.textContent = matched.length ? '已显示匹配影片，点击卡片进入详情播放。' : '没有找到匹配影片，请尝试其他关键词。';
            results.innerHTML = matched.map(renderCard).join('');
        }

        input.value = getQueryValue();
        input.addEventListener('input', perform);
        perform();
    }

    document.addEventListener('DOMContentLoaded', setupSearch);
}());
