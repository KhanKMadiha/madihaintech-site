#!/usr/bin/env python3
"""Write the shared principles (content/principles.json) into the homepage and About page.

Each page holds a marked region; everything between the markers is regenerated:
  index.html  <!-- principles:index:start --> ... <!-- principles:index:end -->   (principles.md tab, accordion)
  about.html  <!-- principles:about:start --> ... <!-- principles:about:end -->   (accordion)
Usage: python3 scripts/sync_principles.py   (run from the repo root)
"""
import html, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
items = json.loads((ROOT / 'content' / 'principles.json').read_text())['principles']
esc = lambda s: html.escape(s, quote=False)

def accordion(prefix, level, indent):
    pad = ' ' * indent
    rows = []
    for i, p in enumerate(items, 1):
        rows.append(
            f'{pad}<div class="pacc__item">\n'
            f'{pad}  <h{level} class="pacc__h"><button class="pacc__btn" type="button" id="{prefix}-btn-{i}" aria-expanded="false" aria-controls="{prefix}-panel-{i}">'
            f'<span class="t-num" aria-hidden="true">{i:02d}</span><span>{esc(p["title"])}</span><span class="pacc__icon" aria-hidden="true"></span></button></h{level}>\n'
            f'{pad}  <div class="pacc__panel" id="{prefix}-panel-{i}" role="region" aria-labelledby="{prefix}-btn-{i}" hidden><p>{esc(p["text"])}</p></div>\n'
            f'{pad}</div>')
    return '\n'.join(rows)

def index_block():
    # Homepage principles.md tab: headings sit under the section's h2, so h3.
    return accordion('hp-pa', 3, 12)

def about_block():
    # About hero: directly under the page h1, so h2. IDs kept as before.
    return accordion('pa', 2, 14)

def replace(path, name, body):
    f = ROOT / path
    s = f.read_text()
    pat = re.compile(rf'(<!-- principles:{name}:start -->)(.*?)([ \t]*<!-- principles:{name}:end -->)', re.S)
    if not pat.search(s):
        sys.exit(f'{path}: markers for "{name}" not found')
    s2 = pat.sub(lambda m: m.group(1) + '\n' + body + '\n' + m.group(3).lstrip(' \t').rjust(len(m.group(3).strip()) + 12), s, count=1)
    if s2 != s:
        f.write_text(s2)
    print(f'{path}: {"updated" if s2 != s else "already in sync"} ({len(items)} principles)')

replace('index.html', 'index', index_block())
replace('about.html', 'about', about_block())
