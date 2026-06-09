(function () {
    'use strict';

    var root = document.documentElement;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---- Footer year ------------------------------------------------- */
    var year = String(new Date().getFullYear());
    document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = year; });

    /* ---- Light / dark toggle ----------------------------------------- */
    var toggle = document.querySelector('[data-theme-toggle]');
    function currentScheme() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
    if (toggle) {
        toggle.addEventListener('click', function () {
            var next = currentScheme() === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', next);
            try { localStorage.setItem('ckn:scheme', next); } catch (e) {}
        });
    }

    /* ---- Reading context --------------------------------------------- */
    var header   = document.querySelector('[data-site-header]');
    var bar      = document.querySelector('[data-reading-progress] span');
    var content  = document.querySelector('.post .gh-content');
    var toTop     = document.querySelector('[data-to-top]');
    var ring      = document.querySelector('[data-ring]');
    var headerNow = document.querySelector('[data-header-now]');
    var postTitle = document.querySelector('.post .post-title');
    var headerH   = header ? header.offsetHeight : 60;
    var ctxOn     = false;   /* current show-context state (with hysteresis) */

    /* Total reading minutes (parsed from the dedicated reading-time element) */
    var totalMins = 0;
    var rtEl = document.querySelector('.post .post-meta .rt');
    if (rtEl) {
        var m = rtEl.textContent.match(/(\d+)/);
        if (m) { totalMins = parseInt(m[1], 10); }
    }

    /* Populate the header's "now reading" label */
    if (headerNow && postTitle) {
        var t = headerNow.querySelector('.header-now-title');
        if (t) { t.textContent = postTitle.textContent.trim(); }
    }

    /* Ring geometry (r = 20) */
    var CIRC = 2 * Math.PI * 20;
    if (ring) {
        ring.style.strokeDasharray = CIRC.toFixed(2);
        ring.style.strokeDashoffset = CIRC.toFixed(2);
    }

    var lastRemaining = -1;

    function onScroll() {
        var y = window.scrollY || window.pageYOffset;

        if (header) { header.classList.toggle('is-scrolled', y > 8); }
        if (toTop)  { toTop.classList.toggle('is-visible', y > window.innerHeight * 0.9); }

        /* Top progress bar: article-based while reading, page-based elsewhere */
        var prog;
        if (content) {
            var rect = content.getBoundingClientRect();
            var dist = rect.height - window.innerHeight;
            var scrolled = Math.min(Math.max(-rect.top, 0), Math.max(dist, 0));
            prog = dist > 0 ? scrolled / dist : (rect.top <= 0 ? 1 : 0);

            /* Swap the header's site name for the story title once it scrolls
               behind the header. Hysteresis (dead-band) prevents flicker at the
               boundary: turn on a bit past the header, turn off well below it. */
            if (header && postTitle) {
                var tb = postTitle.getBoundingClientRect().bottom;
                if (!ctxOn && tb < headerH - 8) { ctxOn = true; header.classList.add('show-context'); }
                else if (ctxOn && tb > headerH + 18) { ctxOn = false; header.classList.remove('show-context'); }
            }

            /* Time remaining */
            if (headerNow && totalMins > 0) {
                var timeEl = headerNow.querySelector('.header-now-time');
                if (timeEl) {
                    var remaining = Math.max(0, Math.ceil(totalMins * (1 - prog)));
                    if (remaining !== lastRemaining) {
                        lastRemaining = remaining;
                        timeEl.textContent = remaining <= 0 ? 'The end' : remaining + ' min left';
                    }
                }
            }
        } else {
            var docH = document.documentElement.scrollHeight - window.innerHeight;
            prog = docH > 0 ? Math.min(Math.max(y / docH, 0), 1) : 0;
        }

        if (bar)  { bar.style.width = (prog * 100).toFixed(2) + '%'; }
        if (ring) { ring.style.strokeDashoffset = (CIRC * (1 - prog)).toFixed(2); }
    }

    var ticking = false;
    function requestScroll() {
        if (!ticking) { window.requestAnimationFrame(function () { onScroll(); ticking = false; }); ticking = true; }
    }
    window.addEventListener('scroll', requestScroll, { passive: true });
    window.addEventListener('resize', requestScroll, { passive: true });
    onScroll();

    /* Back to top */
    if (toTop) {
        toTop.removeAttribute('hidden');
        toTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        });
    }

    /* ---- Keyboard: ← / → move between stories ------------------------ */
    document.addEventListener('keydown', function (e) {
        if (e.metaKey || e.ctrlKey || e.altKey) { return; }
        var tag = (e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) { return; }
        var sel;
        if (e.key === 'ArrowLeft')  { sel = '.post-nav-cell:not(.post-nav-cell--right) .post-nav-link'; }
        if (e.key === 'ArrowRight') { sel = '.post-nav-cell--right .post-nav-link'; }
        if (sel) {
            var link = document.querySelector(sel);
            if (link) { window.location.href = link.getAttribute('href'); }
        }
    });

    /* ---- Homepage: dateline, shelf stats, read markers --------------- */
    function normPath(p) { return (p || '').replace(/\/+$/, '') || '/'; }
    function getReadSet() {
        try { return new Set(JSON.parse(localStorage.getItem('ckn:read') || '[]')); }
        catch (e) { return new Set(); }
    }

    /* Record the current story as read */
    if (document.body.classList.contains('post-template')) {
        try {
            var rs = getReadSet();
            rs.add(normPath(location.pathname));
            localStorage.setItem('ckn:read', JSON.stringify(Array.prototype.slice.call(rs)));
        } catch (e) {}
    }

    /* Dateline — today's date, broadsheet style */
    var todayEl = document.querySelector('[data-today]');
    if (todayEl) {
        try {
            var d = new Date();
            var wd = new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(d);
            var mo = new Intl.DateTimeFormat(undefined, { month: 'long' }).format(d);
            todayEl.textContent = wd + ' · ' + d.getDate() + ' ' + mo + ' ' + d.getFullYear();
        } catch (e) {}
    }

    /* Shelf stats + read markers on any index of stories */
    var indexCards = document.querySelectorAll('.story-list .story-card');
    if (indexCards.length) {
        var readSet = getReadSet();
        var totalMin = 0;
        indexCards.forEach(function (card) {
            var rt = card.querySelector('.rt');
            var mm = rt ? rt.textContent.match(/(\d+)/) : null;
            if (mm) { totalMin += parseInt(mm[1], 10); }

            var a = card.querySelector('.story-card-title a');
            if (a) {
                var path = '';
                try { path = normPath(new URL(a.href, location.origin).pathname); } catch (e) {}
                if (path && readSet.has(path)) {
                    card.classList.add('is-read');
                    var meta = card.querySelector('.story-card-meta');
                    if (meta && !meta.querySelector('.read-flag')) {
                        var f = document.createElement('span');
                        f.className = 'read-flag';
                        f.textContent = 'Read';
                        meta.appendChild(f);
                    }
                }
            }
        });

        var shelfEl = document.querySelector('[data-shelf]');
        if (shelfEl) {
            var n = indexCards.length;
            var countStr = n + (n === 1 ? ' story' : ' stories');
            var timeStr = '';
            if (totalMin >= 60) {
                var h = Math.floor(totalMin / 60), mn = totalMin % 60;
                timeStr = h + ' hr' + (mn ? ' ' + mn + ' min' : '');
            } else if (totalMin > 0) {
                timeStr = totalMin + ' min';
            }
            shelfEl.textContent = timeStr ? (countStr + ' · ' + timeStr) : countStr;
        }
    }

    /* ---- Gentle scroll-reveal (large blocks only — never body text) -- */
    if (!reduceMotion && 'IntersectionObserver' in window) {
        root.classList.add('has-reveal');
        var targets = document.querySelectorAll(
            '.story-card, .post-figure, .post-nav, .subscribe-cta, .post-footer'
        );
        targets.forEach(function (el) { el.classList.add('reveal'); });

        var io = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    obs.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

        targets.forEach(function (el) { io.observe(el); });

        /* Safety net: reveal anything still hidden after load */
        window.addEventListener('load', function () {
            setTimeout(function () {
                targets.forEach(function (el) { el.classList.add('is-revealed'); });
            }, 1200);
        });
    }
})();
