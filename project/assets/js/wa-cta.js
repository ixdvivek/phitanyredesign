/* WhatsApp CTA. A white pill while the visitor is active; after IDLE_MS
   without input it expands (once per browser session) into a looping
   video card above a green pill. GSAP is only fetched at that moment, so
   pages that never go idle never download it. */
(function () {
  var IDLE_MS = 6000;
  var SEEN_KEY = 'waCtaShown';
  var WA_URL = 'https://wa.me/917736078808';
  var GSAP_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
  var GREEN = '#2aa81a';
  var ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.15c-1.5 0-2.97-.4-4.24-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24s8.24 3.7 8.24 8.24-3.7 8.24-8.24 8.24zm4.53-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.14-1.18-.06-.11-.23-.17-.48-.29z"/></svg>';

  function seen() {
    try { return sessionStorage.getItem(SEEN_KEY) === '1'; } catch (e) { return false; }
  }
  function markSeen() {
    try { sessionStorage.setItem(SEEN_KEY, '1'); } catch (e) {}
  }

  function build() {
    var root = document.createElement('div');
    root.className = 'wa-cta';
    root.innerHTML =
      '<div class="wa-card">' +
        '<a class="wa-card-link" href="' + WA_URL + '" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">' +
          '<video muted loop playsinline preload="none" poster="assets/wa/wa-cta-poster.jpg">' +
            '<source src="assets/wa/wa-cta.webm" type="video/webm">' +
            '<source src="assets/wa/wa-cta.mp4" type="video/mp4">' +
          '</video>' +
          '<span class="wa-card-scrim"></span>' +
          '<div class="wa-card-copy">' +
            '<p class="wa-card-l1">Over 100<br>brands<br>believed in<br>our services</p>' +
            '<p class="wa-card-l2">Will you be<br>the next?</p>' +
          '</div>' +
        '</a>' +
        '<button type="button" class="wa-close" aria-label="Close"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '</div>' +
      '<a class="wa-pill" href="' + WA_URL + '" target="_blank" rel="noopener">' + ICON + '<span>Chat with Us Now</span></a>';
    document.body.appendChild(root);
    return root;
  }

  function init() {
    var root = build();
    var card = root.querySelector('.wa-card');
    var pill = root.querySelector('.wa-pill');
    var video = card.querySelector('video');
    var lines = card.querySelectorAll('.wa-card-copy p');
    card.hidden = true;

    // Keep the widget parked above the footer's ticker band instead of
    // sliding over it once the visitor scrolls that far down.
    var ticker = document.querySelector('.fticker');
    var ticking = false;
    function updateLift() {
      ticking = false;
      if (!ticker) return;
      var gap = 24;
      var widgetBottom = window.innerHeight - parseFloat(getComputedStyle(root).bottom);
      var limit = ticker.getBoundingClientRect().top - gap;
      root.style.setProperty('--wa-lift', Math.max(0, widgetBottom - limit) + 'px');
    }
    function requestLift() {
      if (!ticking) { ticking = true; requestAnimationFrame(updateLift); }
    }
    window.addEventListener('scroll', requestLift, { passive: true });
    window.addEventListener('resize', requestLift);
    updateLift();

    // Idle expansion: desktop pointers only for now (mobile gets its own
    // treatment later), and never again once shown this session.
    var desktop = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 761px)').matches;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!desktop || seen()) return;

    var isExpanded = false;
    var tl = null;
    var timer = null;
    var warmTimer = null;
    var events = ['scroll', 'mousemove', 'mousedown', 'keydown', 'wheel', 'touchstart'];

    // Idle time only counts while the tab is on screen — otherwise a
    // backgrounded tab would expand unseen and burn the once-per-session
    // showing before the visitor ever comes back. Halfway through the idle
    // window everything the reveal needs is fetched quietly, so nothing
    // is still downloading or decoding when the animation runs.
    function resetTimer() {
      clearTimeout(timer);
      clearTimeout(warmTimer);
      if (document.hidden) return;
      warmTimer = setTimeout(warm, IDLE_MS / 2);
      timer = setTimeout(expand, IDLE_MS);
    }
    function stopWatching() {
      clearTimeout(timer);
      clearTimeout(warmTimer);
      events.forEach(function (ev) { window.removeEventListener(ev, resetTimer); });
      document.removeEventListener('visibilitychange', resetTimer);
    }
    events.forEach(function (ev) { window.addEventListener(ev, resetTimer, { passive: true }); });
    document.addEventListener('visibilitychange', resetTimer);
    resetTimer();

    var gsapReady = null;
    var videoReady = null;
    function loadGsap() {
      if (gsapReady) return gsapReady;
      gsapReady = new Promise(function (res) {
        if (window.gsap) return res(true);
        var s = document.createElement('script');
        s.src = GSAP_SRC;
        s.onload = function () { res(true); };
        s.onerror = function () { res(false); };
        document.head.appendChild(s);
      });
      return gsapReady;
    }
    function loadVideo() {
      if (videoReady) return videoReady;
      videoReady = new Promise(function (res) {
        if (video.readyState >= 3) return res();
        video.addEventListener('canplay', function () { res(); }, { once: true });
        video.addEventListener('error', function () { res(); }, { once: true });
        video.preload = 'auto';
        video.load();
      });
      return videoReady;
    }
    function warm() {
      if (reduceMotion) { loadVideo(); return; }
      loadGsap();
      loadVideo();
    }

    // Only GPU-friendly properties are tweened (clip-path, translate,
    // opacity, colors); the card sits above the pill so nothing reflows.
    function buildTimeline() {
      var g = window.gsap;
      tl = g.timeline({ paused: true, defaults: { ease: 'expo.out' } });
      tl.fromTo(card,
          { autoAlpha: 0, y: 28, clipPath: 'inset(100% 0% 0% 0% round 12px)' },
          { autoAlpha: 1, y: 0, clipPath: 'inset(0% 0% 0% 0% round 12px)', duration: 1 }, 0)
        .fromTo(pill,
          { backgroundColor: '#ffffff', color: GREEN },
          { backgroundColor: GREEN, color: '#ffffff', duration: .55, ease: 'power2.out' }, 0)
        .fromTo(lines,
          { y: 16, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: .7, stagger: .12 }, .35);
    }

    function withTimeout(promise, ms) {
      return Promise.race([promise, new Promise(function (res) { setTimeout(res, ms); })]);
    }

    function expand() {
      if (isExpanded || document.hidden) return;
      isExpanded = true;
      stopWatching();
      markSeen();
      warm();
      // Normally already settled by the warm-up; the cap stops a slow
      // network from delaying the reveal indefinitely.
      withTimeout(Promise.all([reduceMotion ? false : loadGsap(), loadVideo()]), 2500).then(function (r) {
        if (!isExpanded) return;
        var ok = !reduceMotion && r && r[0] && window.gsap;
        if (ok) {
          if (!tl) buildTimeline();
          tl.progress(0).pause();
        }
        card.hidden = false;
        root.classList.add('is-open');
        var p = video.play();
        if (p && p.catch) p.catch(function () {});
        if (ok) requestAnimationFrame(function () { tl.timeScale(1).play(); });
      });
    }

    function collapse() {
      if (!isExpanded) return;
      isExpanded = false;
      function done() {
        card.hidden = true;
        video.pause();
      }
      if (tl && !reduceMotion) {
        tl.eventCallback('onReverseComplete', function () { root.classList.remove('is-open'); done(); });
        tl.timeScale(1.6).reverse();
      } else {
        root.classList.remove('is-open');
        done();
      }
    }

    card.querySelector('.wa-close').addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      collapse();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
