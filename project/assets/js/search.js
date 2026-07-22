/* Sitewide nav search. Loaded on every page after its own inline scripts,
   so it can safely call the page's global closeNav(). Content is a static
   index (no backend exists) and every result of a given category links to
   that category's one populated example page, same convention already used
   for "Related Services" / "Related Industries" elsewhere on the site. */
(function () {
  var SEARCH_INDEX = [
    // Case studies
    { name: 'Intersight Holidays, Germany', category: 'Case Study', tag: 'Tourism', href: 'Case Study Detail.html' },
    { name: 'SAR Healthline, Chennai', category: 'Case Study', tag: 'Healthcare', href: 'Case Study Detail.html' },
    { name: 'EMC International Desk', category: 'Case Study', tag: 'Education', href: 'Case Study Detail.html' },
    { name: 'GMP Manufacturing', category: 'Case Study', tag: 'Manufacturing', href: 'Case Study Detail.html' },

    // Services
    { name: 'Digital Engineering', category: 'Service', tag: '', href: 'Service Category.html' },
    { name: 'Corporate & Institutional Websites', category: 'Service', tag: 'Digital Engineering', href: 'Service Detail.html' },
    { name: 'Custom Web Applications', category: 'Service', tag: 'Digital Engineering', href: 'Service Detail.html' },
    { name: 'End-to-End E-Commerce Platforms', category: 'Service', tag: 'Digital Engineering', href: 'Service Detail.html' },
    { name: 'Secure, Scalable Architecture', category: 'Service', tag: 'Digital Engineering', href: 'Service Detail.html' },
    { name: 'Digital Marketing & Performance Strategy', category: 'Service', tag: '', href: 'Service Detail.html' },
    { name: 'Performance Marketing Campaigns', category: 'Service', tag: 'Digital Marketing', href: 'Service Detail.html' },
    { name: 'Lead Generation Systems', category: 'Service', tag: 'Digital Marketing', href: 'Service Detail.html' },
    { name: 'Enhanced Social Media Growth Strategy', category: 'Service', tag: 'Digital Marketing', href: 'Service Detail.html' },
    { name: 'Conversion Optimization', category: 'Service', tag: 'Digital Marketing', href: 'Service Detail.html' },
    { name: 'Search Engine Optimization (SEO)', category: 'Service', tag: '', href: 'Service Detail.html' },
    { name: 'Keyword & Competitor Strategy', category: 'Service', tag: 'SEO', href: 'Service Detail.html' },
    { name: 'On-Page & Off-Page Optimization', category: 'Service', tag: 'SEO', href: 'Service Detail.html' },
    { name: 'Long-Term Organic Growth Planning', category: 'Service', tag: 'SEO', href: 'Service Detail.html' },
    { name: 'Technical SEO', category: 'Service', tag: 'SEO', href: 'Service Detail.html' },
    { name: 'Branding & Identity', category: 'Service', tag: '', href: 'Service Detail.html' },
    { name: 'Brand Strategy & Positioning', category: 'Service', tag: 'Branding & Identity', href: 'Service Detail.html' },
    { name: 'Logo & Visual Systems', category: 'Service', tag: 'Branding & Identity', href: 'Service Detail.html' },
    { name: 'Messaging Framework', category: 'Service', tag: 'Branding & Identity', href: 'Service Detail.html' },
    { name: 'Rebranding & Digital Revamp', category: 'Service', tag: 'Branding & Identity', href: 'Service Detail.html' },
    { name: 'CRM & Intelligent Automation', category: 'Service', tag: '', href: 'Service Detail.html' },
    { name: 'Custom CRM Development', category: 'Service', tag: 'CRM & Automation', href: 'Service Detail.html' },
    { name: 'Sales & Workflow Automation', category: 'Service', tag: 'CRM & Automation', href: 'Service Detail.html' },
    { name: 'WhatsApp & API Integrations', category: 'Service', tag: 'CRM & Automation', href: 'Service Detail.html' },
    { name: 'AI-Powered Engagement Systems', category: 'Service', tag: 'CRM & Automation', href: 'Service Detail.html' },

    // Insights (blog)
    { name: 'How Performance Marketing Is Reshaping B2B Growth in 2026', category: 'Insight', tag: '', href: 'Blog Detail.html' },
    { name: 'The Future of CRM: AI-Powered Automation for Smarter Teams', category: 'Insight', tag: '', href: 'Blog Detail.html' },
    { name: 'SEO in the Age of AI: What Actually Still Works', category: 'Insight', tag: '', href: 'Blog Detail.html' },
    { name: 'Why Brand Strategy Comes Before Design — Every Time', category: 'Insight', tag: '', href: 'Blog Detail.html' },
    { name: 'Building for Scale: Architecture Decisions That Matter', category: 'Insight', tag: '', href: 'Blog Detail.html' },
    { name: 'WhatsApp Marketing in 2026: A Playbook for B2C Brands', category: 'Insight', tag: '', href: 'Blog Detail.html' },
    { name: 'The Case for Minimal: Why Less Converts More', category: 'Insight', tag: '', href: 'Blog Detail.html' },
    { name: 'Measuring What Matters: A Practical Analytics Framework', category: 'Insight', tag: '', href: 'Blog Detail.html' },
    { name: 'From Kerala to Worldwide: Building a Global Digital Practice', category: 'Insight', tag: '', href: 'Blog Detail.html' }
  ];

  var GROUP_ORDER = ['Case Study', 'Service', 'Insight'];
  var GROUP_LABEL = { 'Case Study': 'Case Studies', 'Service': 'Services', 'Insight': 'Insights' };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function init() {
    var wrap = document.querySelector('.nav-wrap');
    var searchBtn = document.querySelector('.nav-btn[aria-label="Search"]');
    var closeBtn = document.getElementById('navSearchClose');
    var input = document.getElementById('navSearchInput');
    var panel = document.getElementById('navSearchPanel');
    var navDropdown = document.getElementById('navDropdown');
    var menuBtn = document.getElementById('menuBtn');
    if (!wrap || !searchBtn || !closeBtn || !input || !panel) return;

    // The page's own inline script watches #navDropdown with a
    // MutationObserver and unconditionally sets body's "nav-open" class from
    // navDropdown's state alone, any time navDropdown's class attribute is
    // touched at all (even a no-op classList.remove('open') still fires it,
    // per spec, since the update steps run regardless of an actual change).
    // Closing the hamburger menu from openSearch() below triggers exactly
    // that no-op touch, so that old observer's callback would otherwise run
    // straight after ours and stomp our lock back off. Mirroring the same
    // observer here — on .nav-wrap instead — guarantees our callback runs
    // after it (mutations on navDropdown queue first, then wrap's own
    // "search-open" mutation queues second, and microtasks run in that
    // order), so we always get the last, correct word on body's lock state.
    function syncBodyLock() {
      var dropdownOpen = !!(navDropdown && navDropdown.classList.contains('open'));
      var searchOpen = wrap.classList.contains('search-open');
      document.body.classList.toggle('nav-open', dropdownOpen || searchOpen);
    }
    new MutationObserver(syncBodyLock).observe(wrap, { attributes: true, attributeFilter: ['class'] });

    function openSearch() {
      if (navDropdown && navDropdown.classList.contains('open') && typeof window.closeNav === 'function') {
        window.closeNav();
      }
      wrap.classList.add('search-open');
      syncBodyLock();
      render('');
      setTimeout(function () { input.focus(); }, 60);
    }
    function closeSearch() {
      if (!wrap.classList.contains('search-open')) return;
      wrap.classList.remove('search-open');
      syncBodyLock();
      input.value = '';
      // Deflate the panel back to nothing as part of closing, mirroring the
      // grow-in on open, instead of just leaving whatever content-height it
      // last held to disappear with the container's own fade.
      if (getComputedStyle(panel).position === 'absolute') {
        var startH = panel.getBoundingClientRect().height;
        panel.style.height = startH + 'px';
        void panel.offsetHeight;
        requestAnimationFrame(function () { panel.style.height = '0px'; });
        setTimeout(function () { panel.innerHTML = ''; }, 320);
      } else {
        panel.innerHTML = '';
      }
    }

    searchBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (wrap.classList.contains('search-open')) closeSearch();
      else openSearch();
    });
    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closeSearch();
    });
    if (menuBtn) menuBtn.addEventListener('click', closeSearch);
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav-search') && !e.target.closest('.nav-btn[aria-label="Search"]')) closeSearch();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSearch();
    });

    // On desktop the panel is an absolutely-positioned dropdown sized to its
    // content (capped by max-height + scroll); on mobile it's a flex:1 pane
    // filling the full-screen overlay instead, so there's no "natural
    // content height" for it to grow toward there — skip the height
    // animation on that layout and just swap content in directly.
    //
    // The explicit inline height set below is the box's permanent driver
    // from this point on (recomputed fresh on every call), not just a
    // transition scratch value cleared afterward — clearing it back to ''
    // would fall through to the base CSS's height:0 (used as the pre-first-
    // render collapsed state) and snap the panel shut right after every
    // animation finished.
    function growPanelTo(html) {
      if (getComputedStyle(panel).position !== 'absolute') {
        panel.innerHTML = html;
        return;
      }
      var startH = panel.getBoundingClientRect().height;
      panel.innerHTML = html;
      // Measure the new content's natural height with height:auto first —
      // if a previous render left an inline height near max-height (e.g. a
      // broad query), scrollHeight can never read back below whatever
      // height is currently set (it's max(clientHeight, content height)),
      // so a subsequent shorter query would look stuck at the old height
      // forever. max-height still clips the auto box during this
      // measurement, but scrollHeight always reports the true content
      // extent regardless of that clipping.
      panel.style.height = 'auto';
      var maxH = parseFloat(getComputedStyle(panel).maxHeight);
      if (!isFinite(maxH)) maxH = panel.scrollHeight;
      var targetH = Math.min(panel.scrollHeight, maxH);
      panel.style.height = startH + 'px';
      // Force a reflow so the browser registers the starting height as its
      // own frame before we change it — otherwise both assignments collapse
      // into one and there's nothing to transition from.
      void panel.offsetHeight;
      requestAnimationFrame(function () {
        panel.style.height = targetH + 'px';
      });
    }

    function render(qRaw) {
      var q = qRaw.trim().toLowerCase();
      if (!q) {
        growPanelTo('<div class="ns-empty">Start typing to search case studies, services, and insights.</div>');
        return;
      }
      var matches = SEARCH_INDEX.filter(function (it) {
        return it.name.toLowerCase().indexOf(q) !== -1;
      });
      if (!matches.length) {
        growPanelTo('<div class="ns-empty">No results for “' + escapeHtml(qRaw.trim()) + '”.</div>');
        return;
      }
      var html = '';
      GROUP_ORDER.forEach(function (cat) {
        var items = matches.filter(function (m) { return m.category === cat; });
        if (!items.length) return;
        html += '<div class="ns-group"><span class="ns-group-label">' + GROUP_LABEL[cat] + '</span>';
        items.forEach(function (it) {
          html += '<a href="' + it.href + '" class="ns-item">' +
            '<span class="ns-item-name">' + escapeHtml(it.name) + '</span>' +
            (it.tag ? '<span class="ns-item-tag">' + escapeHtml(it.tag) + '</span>' : '') +
            '</a>';
        });
        html += '</div>';
      });
      growPanelTo(html);
    }

    // Subtle refresh cue on each keystroke: a quick dip in opacity while the
    // (instant, synchronous) filter re-runs, so the results feel like they
    // update rather than just snap to a new list — the panel itself grows or
    // shrinks to the new content's height via growPanelTo() above.
    input.addEventListener('input', function () {
      var q = input.value;
      panel.classList.add('ns-refresh');
      requestAnimationFrame(function () {
        render(q);
        requestAnimationFrame(function () {
          panel.classList.remove('ns-refresh');
        });
      });
    });
    render('');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
