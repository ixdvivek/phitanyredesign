#!/usr/bin/env python3
"""Insert Industries (between Case Studies & Services) and Testimonials +
Technologies (after Insights) links into every existing page's nav-dropdown.
Run once, from project/."""
import re
import glob

FILES = sorted(glob.glob("*.html"))

nav_pattern = re.compile(
    r'(<a href="Case Studies\.html"[^>]*>Case Studies</a>)(\s*)(<a href="Services\.html")'
)
sub_pattern = re.compile(
    r'(<a href="Careers\.html"[^>]*>Careers</a>)(\s*)(<a href="Insights\.html"[^>]*>Insights</a>)(\s*)(</div>)'
)


def onclick_of(tag):
    m = re.search(r'\sonclick="[^"]*"', tag)
    return m.group(0) if m else ""


for f in FILES:
    with open(f, encoding="utf-8") as fh:
        content = fh.read()
    orig = content

    m = nav_pattern.search(content)
    if m:
        cs_tag, sep, _ = m.groups()
        onclick = onclick_of(cs_tag)
        industries_tag = f'<a href="Industries.html" class="nd-link"{onclick}>Industries</a>'
        content = content[: m.start()] + m.group(1) + sep + industries_tag + sep + m.group(3) + content[m.end():]
    else:
        print(f"{f}: nav-links pattern not found")

    m = sub_pattern.search(content)
    if m:
        careers_tag, sep1, insights_tag, sep2, closing = m.groups()
        onclick = onclick_of(careers_tag)
        testi_tag = f'<a href="Testimonials.html" class="nd-sub-link"{onclick}>Testimonials</a>'
        tech_tag = f'<a href="Technologies.html" class="nd-sub-link"{onclick}>Technologies</a>'
        replacement = (
            m.group(1) + sep1 + m.group(3) + sep1 + testi_tag + sep1 + tech_tag + sep2 + closing
        )
        content = content[: m.start()] + replacement + content[m.end():]
    else:
        print(f"{f}: sub-links pattern not found")

    if content != orig:
        with open(f, "w", encoding="utf-8") as fh:
            fh.write(content)
        print(f"{f}: updated")
