# Yujie Fan Academic Website

This is a static personal academic website. It is designed to be easy to maintain without a frontend framework.

## Local Preview

From this folder:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## How To Update Content

Most text lives in:

```text
data/site.json
```

Common edits:

- Update the biography: edit `person.bio`.
- Update professional links: edit fields such as `person.linkedinHref`.
- Add publications: add items to the `publications` array.
- Add projects: add items to the `projects` array.
- Research interests are stored in the `interests` array, but they are not currently displayed.
- Research experience data is stored in the `experience` array, but it is not currently displayed.
- Update education: edit the `education` array.
- Update teaching: edit the `teaching` array.
- Replace the CV: overwrite `assets/Yujie-Fan-CV.pdf`.
- Replace the hero image: overwrite `assets/hero-academic.png`.

Publication format:

```json
{
  "title": "Paper Title",
  "authors": "Yujie Fan, Coauthor Name",
  "year": "2026",
  "venue": "Working paper",
  "links": {
    "paper": "",
    "code": "",
    "bibtex": ""
  }
}
```

## Files

- `index.html`: page structure.
- `styles.css`: visual design and responsive layout.
- `script.js`: loads `data/site.json` and renders lists.
- `data/site.json`: editable academic content.
- `assets/`: images and CV.

## Deployment

This site can be deployed to GitHub Pages, Netlify, Vercel, or a university server. Since it is static, any service that hosts HTML files will work.

Suggested GitHub Pages URL:

```text
https://yujiefan2000.github.io/academic-website/
```
