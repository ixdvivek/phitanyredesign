#!/usr/bin/env python3
"""Insert nav-search CSS into every page's Tailwind source (src/tailwind/*.css)
and the .nav-search markup + search.js <script> tag into every page's HTML
(project/*.html). Run once from repo root."""
import re
import glob

DESKTOP_CSS = """.nd-social:hover{opacity:1}

/* SEARCH */
.nav-search{position:relative;width:min(736px,calc(100% - 48px));pointer-events:all;display:none}
.nav-wrap.search-open .nav-search{display:block}
.nav-wrap.search-open nav{display:none}
.ns-bar{display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.88);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:var(--r-pill);padding:9px 9px 9px 22px;box-shadow:0 1px 8px rgba(0,0,0,.06)}
.ns-icon{flex-shrink:0;opacity:.4}
.ns-input{flex:1;min-width:0;border:none;background:transparent;outline:none;font-family:var(--f);font-size:15px;color:#000}
.ns-input::placeholder{color:rgba(0,0,0,.35)}
.ns-close{width:42px;height:42px;border-radius:50%;border:none;background:rgba(0,0,0,.06);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background .2s}
.ns-close:hover{background:rgba(0,0,0,.12)}
.ns-panel{position:absolute;top:calc(100% + 10px);left:0;right:0;background:#fff;border-radius:24px;box-shadow:0 16px 56px rgba(0,0,0,.18);padding:10px;max-height:min(60vh,520px);overflow-y:auto;opacity:0;transform:translateY(-8px);pointer-events:none;transition:opacity .25s var(--ease),transform .3s var(--ease)}
.nav-wrap.search-open .ns-panel{opacity:1;transform:translateY(0);pointer-events:all}
.ns-group{padding:12px 10px 4px}
.ns-group-label{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:rgba(0,0,0,.35);font-weight:700;margin-bottom:4px;display:block}
.ns-item{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px;border-radius:14px;transition:background .16s;color:#000}
.ns-item:hover{background:rgba(0,0,0,.05)}
.ns-item-name{font-size:15px;font-weight:500}
.ns-item-tag{font-size:12px;color:rgba(0,0,0,.4);flex-shrink:0;white-space:nowrap}
.ns-empty{padding:26px 14px;font-size:14px;color:rgba(0,0,0,.4);text-align:center}"""

MOBILE_CSS = """  .nav-dropdown{position:fixed;inset:0;width:100%;height:100dvh;max-height:none;transform:none;border-radius:0;opacity:0;pointer-events:none;display:flex;flex-direction:column;overflow-y:auto;background:#fff;box-shadow:none;transition:opacity .32s var(--ease)}
  .nav-search{position:fixed;inset:0;width:100%;z-index:250;display:none}
  .nav-wrap.search-open .nav-search{display:flex;flex-direction:column;background:#fff}
  .ns-bar{border-radius:0;padding:18px 16px;box-shadow:none;border-bottom:1px solid rgba(0,0,0,.08);backdrop-filter:none;-webkit-backdrop-filter:none}
  .ns-close{width:48px;height:48px}
  .ns-panel{position:static;flex:1;margin:0;border-radius:0;box-shadow:none;max-height:none;overflow-y:auto}"""

css_files = sorted(glob.glob("src/tailwind/*.css"))
for f in css_files:
    with open(f, encoding="utf-8") as fh:
        content = fh.read()
    orig = content
    content = content.replace(".nd-social:hover{opacity:1}", DESKTOP_CSS, 1)
    content = content.replace(
        "  .nav-dropdown{position:fixed;inset:0;width:100%;height:100dvh;max-height:none;transform:none;border-radius:0;opacity:0;pointer-events:none;display:flex;flex-direction:column;overflow-y:auto;background:#fff;box-shadow:none;transition:opacity .32s var(--ease)}",
        MOBILE_CSS,
        1,
    )
    if content == orig:
        print(f"{f}: NO CHANGE (pattern not found)")
    else:
        with open(f, "w", encoding="utf-8") as fh:
            fh.write(content)
        print(f"{f}: updated")

# --- HTML: insert .nav-search markup + script tag ---
SEARCH_MARKUP = '''  <div class="nav-search" id="navSearch">
    <div class="ns-bar">
      <svg class="ns-icon" width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#000" stroke-width="1.75"><circle cx="8.5" cy="8.5" r="6.5"/><path d="M13.5 13.5L18 18" stroke-linecap="round"/></svg>
      <input type="text" id="navSearchInput" class="ns-input" placeholder="Search case studies, services & insights" autocomplete="off">
      <button class="ns-close" id="navSearchClose" aria-label="Close search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    </div>
    <div class="ns-panel" id="navSearchPanel"></div>
  </div>
'''

nav_dropdown_open = re.compile(r'(\s*)<div class="nav-dropdown" id="navDropdown">')

html_files = sorted(glob.glob("project/*.html"))
for f in html_files:
    with open(f, encoding="utf-8") as fh:
        content = fh.read()
    orig = content

    m = nav_dropdown_open.search(content)
    if m:
        indent = m.group(1)
        content = content[: m.start()] + indent + SEARCH_MARKUP.rstrip("\n") + indent + m.group(0)[len(indent):] + content[m.end():]
    else:
        print(f"{f}: nav-dropdown anchor not found for markup insert")

    if "assets/js/search.js" not in content:
        content = content.replace("</body>", '<script src="assets/js/search.js"></script>\n</body>')

    if content == orig:
        print(f"{f}: NO CHANGE")
    else:
        with open(f, "w", encoding="utf-8") as fh:
            fh.write(content)
        print(f"{f}: updated")
