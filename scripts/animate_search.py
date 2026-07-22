#!/usr/bin/env python3
"""Replace the instant display:none/block nav<->search swap with a subtle
cross-fade (+ scale on desktop), add tap feedback to nav-btn, and stagger the
results panel in slightly after the bar. Run once from repo root."""
import glob

NAV_OLD = "nav{pointer-events:all;display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,.88);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:var(--r-pill);padding:9px;width:min(736px,calc(100% - 48px));box-shadow:0 1px 8px rgba(0,0,0,.06);transform-origin:top center;transition:box-shadow .3s var(--ease),transform .38s var(--ease)}"
NAV_NEW = ".nav-slot{position:relative;width:min(736px,calc(100% - 48px))}\nnav{pointer-events:all;display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,.88);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:var(--r-pill);padding:9px;width:100%;box-shadow:0 1px 8px rgba(0,0,0,.06);transform-origin:top center;transition:box-shadow .3s var(--ease),transform .38s var(--ease),opacity .2s var(--ease)}"

BTN_OLD = ".nav-btn{width:42px;height:42px;border-radius:var(--r-pill);border:none;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s}\n.nav-btn:hover{background:rgba(0,0,0,.06)}"
BTN_NEW = ".nav-btn{width:42px;height:42px;border-radius:var(--r-pill);border:none;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s,transform .15s var(--ease)}\n.nav-btn:hover{background:rgba(0,0,0,.06)}\n.nav-btn:active{transform:scale(.88)}"

# Only Phitany Homepage.html actually renders the news-ticker markup, so
# only its stylesheet has that extra line (added in a previous change).
DESKTOP_OLD_TICKER = """.nav-search{position:relative;width:min(736px,calc(100% - 48px));pointer-events:all;display:none}
.nav-wrap.search-open .nav-search{display:block}
.nav-wrap.search-open nav{display:none}
.nav-wrap.search-open .news-ticker{display:none}"""
DESKTOP_NEW_TICKER = """.nav-search{position:absolute;inset:0;width:100%;pointer-events:none;opacity:0;transform:scale(.96);transition:opacity .22s var(--ease),transform .28s var(--ease)}
.nav-wrap.search-open .nav-search{opacity:1;transform:scale(1);pointer-events:all}
.nav-wrap.search-open nav{opacity:0;pointer-events:none}
.nav-wrap.search-open .news-ticker{opacity:0;pointer-events:none}"""

DESKTOP_OLD_PLAIN = """.nav-search{position:relative;width:min(736px,calc(100% - 48px));pointer-events:all;display:none}
.nav-wrap.search-open .nav-search{display:block}
.nav-wrap.search-open nav{display:none}"""
DESKTOP_NEW_PLAIN = """.nav-search{position:absolute;inset:0;width:100%;pointer-events:none;opacity:0;transform:scale(.96);transition:opacity .22s var(--ease),transform .28s var(--ease)}
.nav-wrap.search-open .nav-search{opacity:1;transform:scale(1);pointer-events:all}
.nav-wrap.search-open nav{opacity:0;pointer-events:none}"""

PANEL_OLD = ".ns-panel{position:absolute;top:calc(100% + 10px);left:0;right:0;background:#fff;border-radius:24px;box-shadow:0 16px 56px rgba(0,0,0,.18);padding:10px;max-height:min(60vh,520px);overflow-y:auto;opacity:0;transform:translateY(-8px);pointer-events:none;transition:opacity .25s var(--ease),transform .3s var(--ease)}"
PANEL_NEW = ".ns-panel{position:absolute;top:calc(100% + 10px);left:0;right:0;background:#fff;border-radius:24px;box-shadow:0 16px 56px rgba(0,0,0,.18);padding:10px;max-height:min(60vh,520px);overflow-y:auto;opacity:0;transform:translateY(-8px);pointer-events:none;transition:opacity .25s .05s var(--ease),transform .3s .05s var(--ease)}"

MOBILE_OLD = """  .nav-search{position:fixed;inset:0;width:100%;z-index:250;display:none}
  .nav-wrap.search-open .nav-search{display:flex;flex-direction:column;background:#fff}"""
MOBILE_NEW = """  .nav-slot{width:100%}
  .nav-search{position:fixed;inset:0;width:100%;z-index:250;display:flex;flex-direction:column;background:#fff;opacity:0;transform:none;pointer-events:none;transition:opacity .28s var(--ease)}
  .nav-wrap.search-open .nav-search{opacity:1;pointer-events:all}"""

replacements = [
    (NAV_OLD, NAV_NEW),
    (BTN_OLD, BTN_NEW),
    (PANEL_OLD, PANEL_NEW),
    (MOBILE_OLD, MOBILE_NEW),
]

for f in sorted(glob.glob("src/tailwind/*.css")):
    with open(f, encoding="utf-8") as fh:
        content = fh.read()
    orig = content
    missing = []
    for old, new in replacements:
        if old not in content:
            missing.append(old[:60])
            continue
        content = content.replace(old, new, 1)

    if DESKTOP_OLD_TICKER in content:
        content = content.replace(DESKTOP_OLD_TICKER, DESKTOP_NEW_TICKER, 1)
    elif DESKTOP_OLD_PLAIN in content:
        content = content.replace(DESKTOP_OLD_PLAIN, DESKTOP_NEW_PLAIN, 1)
    else:
        missing.append("desktop .nav-search block")

    if missing:
        print(f"{f}: MISSING patterns: {missing}")
    if content != orig:
        with open(f, "w", encoding="utf-8") as fh:
            fh.write(content)
        print(f"{f}: updated")
    else:
        print(f"{f}: NO CHANGE")
