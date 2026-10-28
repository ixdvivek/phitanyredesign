/* WhatsApp CTA — the "Hello" bubble mascot.
   A little green speech bubble with a face (Figma: Chat widget). It
   breathes, blinks and gets up to small things when left alone, turns to
   watch the cursor when it comes near, waves "HELLO!" on hover, leans when
   the page scrolls, dozes off when the visitor goes quiet and wakes with a
   start when they come back. Once per session it offers a short nudge.

   No dependencies. Every state is a data attribute or .do-* class on the
   root, so all looks live in wa-cta.css. The rAF loop only runs while
   something is actually moving. */
(function () {
  'use strict';

  var WA_URL = 'https://wa.me/917736078808';
  var NUDGE_AFTER_MS = 7000;   // idle time before the once-per-session nudge
  var NUDGE_HIDE_MS = 12000;   // nudge tucks itself away after this
  var SLEEP_AFTER_MS = 22000;  // idle time before it dozes off
  var NEAR_PX = 280;           // cursor distance that makes it look
  var NUDGE_KEY = 'waCtaNudged';

  var INK_D = 'M31 55H131Q139 55 139 63V127Q139 135 131 135H56L33.6 154.6Q30.5 157.3 26.8 156.1Q23 154.8 23 150.6V63Q23 55 31 55Z';
  var FRONT_D = 'M37 66L131 54.6L152 46V178H28.2L33.6 70.2Q34 66.4 37 66Z';
  var WA_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.15c-1.5 0-2.97-.4-4.24-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24s8.24 3.7 8.24 8.24-3.7 8.24-8.24 8.24zm4.53-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.14-1.18-.06-.11-.23-.17-.48-.29z"/></svg>';

  // "HELLO!" sits on an arc around (105,115); angles measured off the Figma frame
  var LETTERS = [['H', 8], ['E', 17.5], ['L', 26.5], ['L', 35], ['O', 44.5], ['!', 53.5]];

  function svgMarkup() {
    var hello = LETTERS.map(function (l, i) {
      return '<g transform="rotate(' + l[1] + ' 105 115)"><g class="wa-ch" style="--i:' + i + '">' +
        '<text x="105" y="40" text-anchor="middle">' + l[0] + '</text></g></g>';
    }).join('');
    var W = 'fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';
    return '' +
      '<svg class="wa-svg" viewBox="0 0 200 200" aria-hidden="true" focusable="false">' +
        '<defs>' +
          '<clipPath id="waClip"><path d="' + INK_D + '"/></clipPath>' +
          '<filter id="waBlur" x="-30%" y="-300%" width="160%" height="700%"><feGaussianBlur stdDeviation="2.2"/></filter>' +
        '</defs>' +
        '<g class="wa-shwrap"><ellipse class="wa-shadow" cx="48.5" cy="171" rx="29.5" ry="3" fill="#000" filter="url(#waBlur)"/></g>' +
        '<g class="wa-hello">' + hello + '</g>' +
        '<g class="wa-float"><g class="wa-lean"><g class="wa-squash">' +
          '<path d="' + INK_D + '" style="fill:var(--wa-green-d)"/>' +
          '<path d="' + FRONT_D + '" style="fill:var(--wa-green)" clip-path="url(#waClip)"/>' +
          '<g class="wa-face">' +
            '<ellipse class="wa-cheek" cx="59.5" cy="104" rx="4.5" ry="2.6" fill="#8ff0b8"/>' +
            '<ellipse class="wa-cheek" cx="107.5" cy="104" rx="4.5" ry="2.6" fill="#8ff0b8"/>' +
            '<g class="wa-eyes"><g class="wa-blink">' +
              '<path class="e e-happy l" style="--ox:73px" d="M68 90.5Q73 83 78 90.5" ' + W + '/>' +
              '<path class="e e-happy r" style="--ox:95px" d="M90 90.5Q95 83 100 90.5" ' + W + '/>' +
              '<circle class="e e-open l" style="--ox:73px" cx="73" cy="88.5" r="4" fill="#fff"/>' +
              '<circle class="e e-open r" style="--ox:95px" cx="95" cy="88.5" r="4" fill="#fff"/>' +
              '<path class="e e-sleep l" style="--ox:73px" d="M68 88Q73 93 78 88" ' + W + '/>' +
              '<path class="e e-sleep r" style="--ox:95px" d="M90 88Q95 93 100 88" ' + W + '/>' +
            '</g></g>' +
            '<path class="m m-smile" d="M68 98.5Q83.5 113 99 98.5" ' + W + '/>' +
            '<path class="m m-grin" d="M67.5 97.5Q83.5 119 99.5 97.5Z" fill="#fff" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/>' +
            '<ellipse class="m m-o" cx="83.5" cy="103" rx="4.6" ry="5.6" fill="#fff"/>' +
            '<path class="m m-sleep" d="M78.5 102.5Q83.5 105.5 88.5 102.5" ' + W + ' stroke-width="2.6"/>' +
          '</g>' +
        '</g></g></g>' +
        '<g class="wa-zzz"><text x="130" y="60" font-size="14">z</text><text x="130" y="60" font-size="18">z</text><text x="130" y="60" font-size="23">Z</text></g>' +
        '<g class="wa-fx"></g>' +
      '</svg>';
  }

  function build() {
    var root = document.createElement('div');
    root.className = 'wa-cta is-pre';
    root.setAttribute('data-state', 'idle');
    root.setAttribute('data-eyes', 'happy');
    root.setAttribute('data-mouth', 'smile');
    root.innerHTML = svgMarkup() +
      '<span class="wa-label" aria-hidden="true">' + WA_ICON + 'Chat on WhatsApp</span>' +
      '<div class="wa-nudge" role="status" aria-live="polite">' +
        '<a href="' + WA_URL + '" target="_blank" rel="noopener"><p>Over 100 brands believed in our services.<b>Will you be the next?</b></p></a>' +
        '<button type="button" class="wa-nudge-x" aria-label="Dismiss"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '</div>' +
      '<a class="wa-hit" href="' + WA_URL + '" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp"></a>';
    document.body.appendChild(root);
    return root;
  }

  function rand(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function init() {
    if (document.querySelector('.wa-cta')) return;
    var root = build();
    var hit = root.querySelector('.wa-hit');
    var face = root.querySelector('.wa-face');
    var eyes = root.querySelector('.wa-eyes');
    var lean = root.querySelector('.wa-lean');
    var fx = root.querySelector('.wa-fx');
    var nudge = root.querySelector('.wa-nudge');

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // ---- state -------------------------------------------------------
    var hovered = false, sleeping = false, near = false, pressed = false;
    var override = null, overrideTimer = null; // short expressions (wink, gasp...)
    var mx = -1e4, my = -1e4;                  // last pointer position
    var gaze = null;                           // scripted look target {x,y} in -1..1

    function setFace(eyesName, mouthName) {
      if (root.getAttribute('data-eyes') !== eyesName) root.setAttribute('data-eyes', eyesName);
      if (root.getAttribute('data-mouth') !== mouthName) root.setAttribute('data-mouth', mouthName);
    }
    function render() {
      var state = sleeping ? 'sleep' : hovered ? 'hover' : near ? 'look' : 'idle';
      if (root.getAttribute('data-state') !== state) root.setAttribute('data-state', state);
      if (override) return setFace(override[0], override[1]);
      if (state === 'sleep') setFace('sleep', 'sleep');
      else if (state === 'hover') setFace('happy', 'grin');
      else if (state === 'look') setFace('open', 'smile');
      else setFace('happy', 'smile');
    }
    function express(eyesName, mouthName, ms) {
      clearTimeout(overrideTimer);
      override = [eyesName, mouthName];
      render();
      overrideTimer = setTimeout(function () { override = null; render(); }, ms);
    }
    var playing = {};
    function play(name, ms) {
      if (reduce && name !== 'blink') return;
      clearTimeout(playing[name]);
      root.classList.remove('do-' + name);
      void root.getBoundingClientRect(); // restart the CSS animation
      root.classList.add('do-' + name);
      playing[name] = setTimeout(function () { root.classList.remove('do-' + name); }, ms);
    }

    // ---- motion loop: gaze + lean, eased, sleeps when settled ---------
    var cur = { fx: 0, fy: 0, ex: 0, ey: 0, r: 0 };
    var scrollV = 0, lastY = window.scrollY, lastT = performance.now();
    var running = false;
    function center() {
      var b = hit.getBoundingClientRect();
      return { x: b.left + b.width * .52, y: b.top + b.height * .4 };
    }
    function targets() {
      var t = { fx: 0, fy: 0, ex: 0, ey: 0, r: 0 };
      if (!sleeping) {
        var gx = 0, gy = 0;
        if (gaze) { gx = gaze.x; gy = gaze.y; }
        else if (near || hovered) {
          var c = center(), dx = mx - c.x, dy = my - c.y, d = Math.hypot(dx, dy) || 1;
          var k = clamp(d / 140, 0, 1);
          gx = dx / d * k; gy = dy / d * k;
        }
        t.fx = gx * 6; t.fy = gy * 4.5;
        t.ex = gx * 2.2; t.ey = gy * 1.8;
        t.r = gx * (hovered ? 2.5 : 4.5);
      }
      // scrolling drags the bubble a little and pulls its eyes along
      var s = clamp(scrollV * .012, -1, 1);
      t.r += -s * 7; t.fy += s * 3; t.ey += s * 1.5;
      return t;
    }
    function frame(now) {
      var dt = Math.min(64, now - lastT) || 16; lastT = now;
      var y = window.scrollY;
      scrollV = scrollV * .85 + ((y - lastY) / dt * 16) * .15; lastY = y;
      if (Math.abs(scrollV) < .05) scrollV = 0;
      var t = targets(), moving = false, a = 1 - Math.pow(1 - .16, dt / 16);
      for (var key in cur) {
        var d = t[key] - cur[key];
        if (Math.abs(d) > .01) { cur[key] += d * a; moving = true; } else cur[key] = t[key];
      }
      face.style.transform = 'translate(' + cur.fx.toFixed(2) + 'px,' + cur.fy.toFixed(2) + 'px)';
      eyes.style.transform = 'translate(' + cur.ex.toFixed(2) + 'px,' + cur.ey.toFixed(2) + 'px)';
      lean.style.transform = 'rotate(' + cur.r.toFixed(2) + 'deg)';
      var tracking = (near || hovered || gaze || scrollV) && !document.hidden;
      if (moving || tracking) requestAnimationFrame(frame); else running = false;
    }
    function kick() {
      if (reduce || running) return;
      running = true; lastT = performance.now(); lastY = window.scrollY;
      requestAnimationFrame(frame);
    }

    // ---- idle personality ---------------------------------------------
    var gestureTimer = null, blinkTimer = null;
    var gestures = {
      blink: function () { play('blink', 220); },
      doubleBlink: function () { play('blink', 220); setTimeout(function () { play('blink', 220); }, 300); },
      wink: function () { express('wink', 'grin', 900); play('nod', 650); },
      lookAround: function () {
        if (reduce) return;
        var seq = [{ x: -1, y: -.2 }, { x: 1, y: -.3 }, { x: .2, y: .6 }, null];
        seq.forEach(function (g, i) { setTimeout(function () { if (!near && !hovered) { gaze = g; kick(); } }, i * 650); });
        setTimeout(function () { gaze = null; kick(); }, seq.length * 650);
      },
      wiggle: function () { play('wiggle', 720); },
      hop: function () { express('happy', 'grin', 800); play('hop', 780); },
      bigSmile: function () { express('happy', 'grin', 1400); }
    };
    var idleBag = ['blink', 'doubleBlink', 'wink', 'lookAround', 'wiggle', 'hop', 'bigSmile', 'lookAround', 'blink'];
    function scheduleGesture() {
      clearTimeout(gestureTimer);
      gestureTimer = setTimeout(function () {
        if (!document.hidden && !sleeping && !hovered && !override) {
          var name = near ? 'blink' : idleBag[Math.floor(Math.random() * idleBag.length)];
          gestures[name]();
        }
        scheduleGesture();
      }, rand(5000, 10000));
    }
    function scheduleBlink() { // eyes stay alive while watching
      clearTimeout(blinkTimer);
      blinkTimer = setTimeout(function () {
        if (near && !hovered && !sleeping && !document.hidden) gestures.blink();
        scheduleBlink();
      }, rand(2200, 4800));
    }

    // ---- sleep / wake --------------------------------------------------
    var sleepTimer = null, nudgeTimer = null, nudgeHide = null;
    function nudgeSeen() { try { return sessionStorage.getItem(NUDGE_KEY) === '1'; } catch (e) { return false; } }
    function markNudged() { try { sessionStorage.setItem(NUDGE_KEY, '1'); } catch (e) {} }

    function goSleep() {
      if (hovered || document.hidden || sleeping) return;
      sleeping = true; override = null; gaze = null;
      hideNudge();
      render(); kick();
    }
    function wake() {
      if (!sleeping) return;
      sleeping = false;
      express('wide', 'o', 650);
      play('startle', 560);
      setTimeout(function () { play('hello', 900); if (!override) express('happy', 'grin', 700); }, 520);
      kick();
    }
    function activity() {
      if (sleeping) wake();
      clearTimeout(sleepTimer); clearTimeout(nudgeTimer);
      if (document.hidden) return;
      sleepTimer = setTimeout(goSleep, SLEEP_AFTER_MS);
      if (!nudgeSeen()) nudgeTimer = setTimeout(showNudge, NUDGE_AFTER_MS);
    }

    // ---- nudge ---------------------------------------------------------
    function showNudge() {
      if (nudgeSeen() || hovered || sleeping || document.hidden) return;
      markNudged();
      nudge.classList.add('is-on');
      gestures.hop();
      setTimeout(function () { express('wink', 'grin', 900); }, 800);
      clearTimeout(nudgeHide);
      nudgeHide = setTimeout(hideNudge, NUDGE_HIDE_MS);
    }
    function hideNudge() { clearTimeout(nudgeHide); nudge.classList.remove('is-on'); }
    nudge.querySelector('.wa-nudge-x').addEventListener('click', function (e) {
      e.preventDefault(); hideNudge(); express('happy', 'smile', 10); play('nod', 650);
    });

    // ---- pointer --------------------------------------------------------
    function onMove(e) {
      mx = e.clientX; my = e.clientY;
      var c = center();
      var wasNear = near;
      near = canHover && Math.hypot(mx - c.x, my - c.y) < NEAR_PX;
      if (near !== wasNear) {
        if (near && !sleeping && !hovered) play('blink', 220); // "oh, hi"
        render();
      }
      if (near || wasNear) kick();
      activity();
    }
    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', function () { near = false; mx = my = -1e4; render(); kick(); });

    function enter() {
      if (hovered) return;
      hovered = true; override = null;
      if (sleeping) wake();
      hideNudge();
      render(); play('hop', 780); kick();
    }
    function leave() { hovered = false; render(); kick(); }
    hit.addEventListener('mouseenter', enter);
    hit.addEventListener('mouseleave', leave);
    hit.addEventListener('focus', enter);
    hit.addEventListener('blur', leave);

    hit.addEventListener('pointerdown', function () { pressed = true; root.classList.add('is-press'); express('wide', 'o', 400); });
    window.addEventListener('pointerup', function () { if (pressed) { pressed = false; root.classList.remove('is-press'); } });
    hit.addEventListener('click', function () { burst(); express('happy', 'grin', 1600); play('hop', 780); markNudged(); hideNudge(); });

    function burst() {
      if (reduce) return;
      var colors = ['#26AE68', '#1C9F5C', 'var(--wa-ink)', '#8ff0b8'];
      for (var i = 0; i < 7; i++) {
        var ang = (-150 + i * 22 + rand(-8, 8)) * Math.PI / 180, dist = rand(48, 80);
        var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        var s = rand(1.3, 2), x = 84, y = 66;
        p.setAttribute('d', 'M' + x + ' ' + (y + 3 * s) + 'c-' + 6 * s + '-' + 4.5 * s + '-' + 6 * s + '-' + 9 * s + '-' + 3 * s + '-' + 9 * s + 'c' + 1.6 * s + ' 0 ' + 3 * s + ' 1.2 ' + 3 * s + ' 3c0-1.8 ' + 1.4 * s + '-3 ' + 3 * s + '-3c' + 3 * s + ' 0 ' + 3 * s + ' ' + 4.5 * s + '-' + 3 * s + ' ' + 9 * s + 'z');
        p.style.fill = colors[i % colors.length];
        p.setAttribute('class', 'wa-heart');
        p.style.setProperty('--hx', (Math.cos(ang) * dist).toFixed(1) + 'px');
        p.style.setProperty('--hy', (Math.sin(ang) * dist).toFixed(1) + 'px');
        p.style.setProperty('--hr', rand(-30, 30).toFixed(0) + 'deg');
        p.style.animationDelay = (i * 25) + 'ms';
        fx.appendChild(p);
        setTimeout(function (n) { return function () { n.remove(); }; }(p), 1100);
      }
    }

    // ---- scroll, keys, touch, tab focus ---------------------------------
    window.addEventListener('scroll', function () { kick(); activity(); }, { passive: true });
    ['keydown', 'wheel', 'touchstart', 'pointerdown'].forEach(function (ev) {
      window.addEventListener(ev, activity, { passive: true });
    });
    var hiddenAt = 0;
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { hiddenAt = Date.now(); clearTimeout(sleepTimer); clearTimeout(nudgeTimer); return; }
      if (hiddenAt && Date.now() - hiddenAt > 4000 && !sleeping) { // welcome back
        setTimeout(function () { play('hop', 780); play('hello', 900); express('wink', 'grin', 1000); }, 300);
      }
      activity();
    });

    // ---- keep clear of the footer ticker --------------------------------
    var ticker = document.querySelector('.fticker');
    var liftQueued = false;
    function updateLift() {
      liftQueued = false;
      if (!ticker) return;
      var widgetBottom = window.innerHeight - parseFloat(getComputedStyle(root).bottom);
      var limit = ticker.getBoundingClientRect().top - 8;
      var lift = Math.max(0, widgetBottom - limit);
      root.style.setProperty('--wa-lift', lift + 'px');
      // once the ticker would shove it off the top, bow out instead
      root.classList.toggle('is-parked', lift > window.innerHeight - 260);
    }
    function requestLift() { if (!liftQueued) { liftQueued = true; requestAnimationFrame(updateLift); } }
    window.addEventListener('scroll', requestLift, { passive: true });
    window.addEventListener('resize', requestLift);
    updateLift();

    // ---- go ---------------------------------------------------------------
    render();
    function reveal() {
      root.classList.remove('is-pre');
      play('enter', 1500);
      setTimeout(function () { express('wink', 'grin', 900); }, 1100);
      scheduleGesture(); scheduleBlink(); activity();
    }
    if (reduce) { root.classList.remove('is-pre'); activity(); }
    else setTimeout(reveal, 900);

    // handy for demos / QA: window.waMascot.sleep() etc.
    window.waMascot = {
      sleep: goSleep, wake: wake, nudge: function () { try { sessionStorage.removeItem(NUDGE_KEY); } catch (e) {} showNudge(); },
      gesture: function (n) { if (gestures[n]) gestures[n](); }, burst: burst
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
