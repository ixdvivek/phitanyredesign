#!/usr/bin/env python3
"""Replace a page's embedded <style>...</style> block with a <link> to its
compiled Tailwind stylesheet. Usage: swap_style_link.py "<Page File.html>" <slug>
"""
import sys

file_path = f"project/{sys.argv[1]}"
slug = sys.argv[2]

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

start = next(i for i, l in enumerate(lines) if l.strip() == "<style>")
end = next(i for i, l in enumerate(lines) if l.strip() == "</style>")

link = f'<link rel="stylesheet" href="assets/css/{slug}.css">\n'
new_lines = lines[:start] + [link] + lines[end + 1:]

with open(file_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print(f"Replaced lines {start+1}-{end+1} with link to assets/css/{slug}.css")
