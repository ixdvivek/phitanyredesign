#!/usr/bin/env python3
"""Wrap <nav id="main-nav">...</nav> and the following .nav-search block in
a shared .nav-slot div, so .nav-search can be absolutely positioned over nav
for a cross-fade instead of an instant display swap. Run once from project/."""
import re
import glob

# Matches from "  <nav id="main-nav">" through the matching "</nav>", then
# ANY content in between (e.g. the homepage's news-ticker, which sits between
# nav and .nav-search in the DOM today), then the .nav-search block itself.
# nav and .nav-search get grouped into .nav-slot; anything in between (the
# ticker) is preserved as a sibling right after, so its position in the flex
# column is unchanged (nav-slot's own height always equals nav's height,
# since .nav-search is absolutely positioned inside it).
pattern = re.compile(
    r'(  <nav id="main-nav">.*?</nav>\n)(.*?)(    <div class="nav-search" id="navSearch">.*?\n  </div>\n)',
    re.DOTALL,
)


def repl(m):
    nav_block = m.group(1)
    middle = m.group(2)
    search_block = m.group(3)
    return '  <div class="nav-slot">\n' + nav_block + search_block + '  </div>\n' + middle


count = 0
for f in sorted(glob.glob("*.html")):
    with open(f, encoding="utf-8") as fh:
        content = fh.read()
    new_content, n = pattern.subn(repl, content, count=1)
    if n == 0:
        print(f"{f}: PATTERN NOT FOUND")
        continue
    with open(f, "w", encoding="utf-8") as fh:
        fh.write(new_content)
    print(f"{f}: wrapped")
    count += 1

print(f"Done: {count} files updated")
