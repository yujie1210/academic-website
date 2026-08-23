"""Generate the static pages from one shared shell.

The site has no build step in production -- these files are committed as-is and
served directly by GitHub Pages. This script exists so the header, footer, and
<head> stay identical across pages instead of drifting as they're hand-edited.
Re-run it after changing the shell, then commit the generated .html files.
"""
import json
from pathlib import Path

ROOT = Path(__file__).parent
SITE = "https://yujie1210.github.io/academic-website"
VERSION = "20260823s"

NAV = [
    ("index.html", "Home"),
    ("research.html", "Research"),
    ("conferences.html", "Conferences"),
    ("contact.html", "Contact"),
    ("assets/Yujie-Fan-CV.pdf", "CV"),
]

FAVICON = ("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>"
           "<rect width='32' height='32' rx='6' fill='%231d3557'/><text x='16' y='22' "
           "font-family='Georgia,serif' font-size='15' font-weight='700' fill='%23fff' "
           "text-anchor='middle'>YF</text></svg>")


def nav_html(current):
    out = []
    for href, label in NAV:
        cls = ' class="active"' if href == current else ""
        ext = ' target="_blank" rel="noopener"' if href.endswith(".pdf") else ""
        out.append(f'        <a href="{href}"{cls}{ext}>{label}</a>')
    return "\n".join(out)


def page(current, title, description, body, canonical):
    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="{description}">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{SITE}/{canonical}">
    <meta property="og:image" content="{SITE}/assets/yujie-fan-portrait.jpg">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="canonical" href="{SITE}/{canonical}">
    <title>{title}</title>
    <link rel="icon" href="{FAVICON}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:wght@500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css?v={VERSION}">
  </head>
  <body>
    <header class="site-header" aria-label="Site header">
      <a class="brand" href="index.html" aria-label="Yujie Fan home">Yujie Fan</a>
      <button class="nav-toggle" type="button" aria-label="Open navigation" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <nav class="site-nav" aria-label="Primary navigation">
{nav_html(current)}
      </nav>
    </header>

    <noscript>
      <p style="padding:1rem;text-align:center;background:#fff4e5;color:#5c3d00;">
        This site loads its research and conference details with JavaScript.
        Please enable JavaScript, or <a href="assets/Yujie-Fan-CV.pdf">download the CV</a> instead.
      </p>
    </noscript>

    <main>
{body}
    </main>

    <footer class="site-footer">
      <span>&copy; <span id="year">2026</span> Yujie Fan.</span>
      <span>Last updated August 2026.</span>
    </footer>

    <script src="script.js?v={VERSION}"></script>
  </body>
</html>
"""


def main():
    data = json.loads((ROOT / "data" / "site.json").read_text())
    bio_html = data["person"]["bioHtml"]

    home_body = f"""      <section id="home" class="hero">
        <div class="hero-media" aria-hidden="true"></div>
        <div class="hero-inner">
          <div class="hero-content">
            <h1 class="sr-only" data-field="person.name">Yujie Fan (Nichole)</h1>
            <p class="intro" data-rich-field="person.bioHtml">{bio_html}</p>
          </div>
          <figure class="hero-portrait">
            <img src="assets/yujie-fan-portrait.jpg" alt="Portrait of Yujie Fan">
          </figure>
        </div>
      </section>"""

    research_body = """      <section class="section page-section" id="research">
        <div class="section-heading">
          <h1>Research</h1>
        </div>
        <div data-list="research"></div>
      </section>"""

    conf_body = """      <section class="section page-section" id="conferences">
        <div class="section-heading">
          <h1>Conferences and Seminars</h1>
        </div>
        <div class="conference-list" data-list="conferences"></div>
      </section>"""

    contact_body = """      <section class="section page-section contact-page" id="contact">
        <div class="section-heading">
          <h1>Contact</h1>
        </div>
        <div class="contact-card">
          <a data-field-href="person.emailHref" data-field="person.email"></a>
          <a data-field-href="person.linkedinHref" data-field="person.linkedin"></a>
          <span data-field="person.location"></span>
        </div>
      </section>"""

    pages = [
        ("index.html", "Yujie Fan | Economics PhD Candidate",
         "Yujie Fan (Nichole), PhD candidate in Economics at Nanyang Technological University. "
         "Research in experimental economics, human-AI interaction, and applied machine learning.",
         home_body, ""),
        ("research.html", "Research | Yujie Fan",
         "Working papers and work in progress by Yujie Fan, PhD candidate in Economics at NTU.",
         research_body, "research.html"),
        ("conferences.html", "Conferences | Yujie Fan",
         "Conferences and seminars where Yujie Fan has presented.",
         conf_body, "conferences.html"),
        ("contact.html", "Contact | Yujie Fan",
         "Contact details for Yujie Fan, PhD candidate in Economics at NTU.",
         contact_body, "contact.html"),
    ]

    for fname, title, desc, body, canon in pages:
        (ROOT / fname).write_text(page(fname, title, desc, body, canon))
        print("wrote", fname)

    urls = "\n".join(
        f"  <url>\n    <loc>{SITE}/{c}</loc>\n    <lastmod>2026-08-23</lastmod>\n  </url>"
        for _, _, _, _, c in pages)
    (ROOT / "sitemap.xml").write_text(
        f'<?xml version="1.0" encoding="UTF-8"?>\n'
        f'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}\n</urlset>\n')
    print("wrote sitemap.xml")


if __name__ == "__main__":
    main()
