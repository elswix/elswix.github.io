// Unlock screen: shown on first visit or after a period of inactivity.
// Loaded in <head> so the blurred overlay is in place before the first paint.
// To disable it, remove the <script src="/js/unlock.js"> tag (or revert its commit).
(function () {
    var KEY = 'rtdb:lastSeen';
    var IDLE_MS = 30 * 60 * 1000;   // inactivity before locking again
    var MAX_MS = 4000;              // hard limit: the overlay never stays longer than this
    var root = document.documentElement;
    var timers = [];
    var locked = false;

    var CSS =
        'html.rtdb-locked::after{content:"";position:fixed;inset:0;z-index:9998;background:rgba(7,7,10,.55);' +
            '-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);transition:opacity .45s ease}' +
        'html.rtdb-unlocking::after{opacity:0}' +
        'html.rtdb-locked body{overflow:hidden}' +
        '#rtdb-lock{--c:#ff2e4d;position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;align-items:center;' +
            'justify-content:center;gap:1.1rem;cursor:pointer;font-family:"JetBrains Mono",Consolas,monospace;' +
            'transition:opacity .45s ease,transform .45s ease}' +
        '#rtdb-lock.rtdb-open{--c:#3dff9a}' +
        'html.rtdb-unlocking #rtdb-lock{opacity:0;transform:scale(1.06)}' +
        '#rtdb-lock svg{width:120px;height:120px;overflow:visible;filter:drop-shadow(0 0 22px var(--c));transition:filter .3s ease}' +
        '#rtdb-lock .rtdb-ring{fill:none;stroke:rgba(255,255,255,.08);stroke-width:2}' +
        '#rtdb-lock .rtdb-scan{fill:none;stroke:var(--c);stroke-width:2;stroke-linecap:round;stroke-dasharray:289;' +
            'stroke-dashoffset:289;transform:rotate(-90deg);transform-origin:60px 60px;animation:rtdb-scan .7s ease-out forwards;' +
            'transition:stroke .3s ease}' +
        '#rtdb-lock .rtdb-shackle{fill:none;stroke:var(--c);stroke-width:5;stroke-linecap:round;transform-box:view-box;' +
            'transform-origin:47px 56px;transition:stroke .3s ease}' +
        '#rtdb-lock.rtdb-open .rtdb-shackle{animation:rtdb-open .45s cubic-bezier(.3,1.4,.5,1) forwards}' +
        '#rtdb-lock .rtdb-body{fill:#101016;stroke:var(--c);stroke-width:2.5;transition:stroke .3s ease}' +
        '#rtdb-lock .rtdb-key{fill:var(--c);transition:fill .3s ease}' +
        '#rtdb-lock .rtdb-title{color:#f2f2f5;font-size:.8rem;font-weight:700;letter-spacing:.3em;text-transform:uppercase}' +
        '#rtdb-lock .rtdb-status{color:var(--c);font-size:.75rem;letter-spacing:.12em;transition:color .3s ease}' +
        '#rtdb-lock .rtdb-status::before{content:"> "}' +
        '#rtdb-lock .rtdb-status::after{content:"_";animation:rtdb-blink 1s steps(1) infinite}' +
        '@keyframes rtdb-scan{to{stroke-dashoffset:0}}' +
        '@keyframes rtdb-open{0%{transform:none}45%{transform:translateY(-8px)}100%{transform:translateY(-8px) rotate(-30deg)}}' +
        '@keyframes rtdb-blink{50%{opacity:0}}';

    var MARKUP =
        '<svg viewBox="0 0 120 120" aria-hidden="true">' +
            '<circle class="rtdb-ring" cx="60" cy="60" r="46"/>' +
            '<circle class="rtdb-scan" cx="60" cy="60" r="46"/>' +
            '<path class="rtdb-shackle" d="M47 56V46a13 13 0 0 1 26 0v10"/>' +
            '<rect class="rtdb-body" x="40" y="56" width="40" height="32" rx="5"/>' +
            '<circle class="rtdb-key" cx="60" cy="69" r="4"/>' +
            '<rect class="rtdb-key" x="58.5" y="71" width="3" height="8" rx="1.5"/>' +
        '</svg>' +
        '<div class="rtdb-title">Red Team Database</div>' +
        '<div class="rtdb-status">authenticating</div>';

    function getLastSeen() {
        try {
            return parseInt(localStorage.getItem(KEY), 10) || 0;
        } catch (e) {
            return null;
        }
    }

    function touch() {
        try {
            localStorage.setItem(KEY, String(Date.now()));
        } catch (e) {}
    }

    function shouldLock() {
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
        var last = getLastSeen();
        // Without storage we can't tell visits apart: never lock rather than lock on every page
        if (last === null) return false;
        return Date.now() - last > IDLE_MS;
    }

    function later(fn, ms) {
        timers.push(setTimeout(fn, ms));
    }

    function finish() {
        if (!locked) return;
        locked = false;
        timers.forEach(clearTimeout);
        timers = [];
        document.removeEventListener('keydown', finish);
        root.classList.add('rtdb-unlocking');
        setTimeout(function () {
            var el = document.getElementById('rtdb-lock');
            if (el) el.remove();
            root.classList.remove('rtdb-locked', 'rtdb-unlocking');
        }, 450);
        touch();
    }

    function open() {
        var el = document.getElementById('rtdb-lock');
        if (!el) return finish();
        el.classList.add('rtdb-open');
        el.querySelector('.rtdb-status').textContent = 'access granted';
        later(finish, 700);
    }

    function build() {
        if (!locked || document.getElementById('rtdb-lock')) return;
        var el = document.createElement('div');
        el.id = 'rtdb-lock';
        el.setAttribute('role', 'status');
        el.setAttribute('aria-label', 'Unlocking site');
        el.innerHTML = MARKUP;
        el.addEventListener('click', finish);
        document.body.appendChild(el);
        later(open, 800);
    }

    function lock() {
        if (locked) return;
        locked = true;
        root.classList.remove('rtdb-unlocking');
        root.classList.add('rtdb-locked');
        document.addEventListener('keydown', finish);
        later(finish, MAX_MS);
        if (document.body) build();
        else document.addEventListener('DOMContentLoaded', build);
    }

    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    if (shouldLock()) lock();
    touch();

    // Lock again when coming back to the tab after a long time away
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') touch();
        else if (shouldLock()) lock();
        else touch();
    });
    window.addEventListener('pagehide', touch);
    setInterval(function () {
        if (document.visibilityState === 'visible') touch();
    }, 60 * 1000);
})();
