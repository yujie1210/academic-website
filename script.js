const getValue = (source, path) =>
  path.split(".").reduce((value, key) => (value ? value[key] : ""), source);

// Escape before interpolating into innerHTML. The data in site.json is
// author-controlled, so this is defence-in-depth rather than a fix for a live
// hole -- but it keeps the templates safe if content is ever pulled from an
// external source, and stops stray &, <, > from breaking the markup.
// person.bioHtml is deliberately exempt: it carries intentional <a> markup.
const esc = (value) =>
  String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const setTextFields = (data) => {
  document.querySelectorAll("[data-field]").forEach((element) => {
    const value = getValue(data, element.dataset.field);
    if (value) element.textContent = value;
  });

  document.querySelectorAll("[data-rich-field]").forEach((element) => {
    const value = getValue(data, element.dataset.richField);
    if (value) element.innerHTML = value;
  });

  document.querySelectorAll("[data-field-href]").forEach((element) => {
    const value = getValue(data, element.dataset.fieldHref);
    if (value) element.setAttribute("href", value);
  });
};

const renderInterests = (items) => items
  .map((item) => `
    <article class="interest-card">
      <h3>${esc(item.title)}</h3>
      <p>${esc(item.description)}</p>
    </article>
  `)
  .join("");

const renderResearch = (groups) => groups
  .map((group) => `
    <section class="research-group">
      <h3 class="group-label">${esc(group.group)}</h3>
      ${group.items.map((item) => `
        <article class="paper">
          <h4>${esc(item.title)}${item.coauthors ? `<span class="coauthors">, with ${esc(item.coauthors)}</span>` : ""}</h4>
          ${item.abstract ? `
            <div class="abstract-details">
              <span>Abstract</span>
              <p>${esc(item.abstract)}</p>
            </div>
          ` : ""}
        </article>
      `).join("")}
    </section>
  `)
  .join("");

// Grouped by year, newest first, listing conference names only. Falls back to
// the older flat {title, location, date} shape.
const renderConferences = (items) => items
  .map((group) => {
    if (group.items) {
      return `
        <article class="conference-year">
          <span class="year">${esc(group.year)}</span>
          <ul>
            ${group.items.map((name) => `<li>${esc(name)}</li>`).join("")}
          </ul>
        </article>
      `;
    }
    return `
      <article class="conference-row">
        <div>
          <h3>${esc(group.title)}</h3>
          <span class="meta">${esc(group.location)} · ${esc(group.date)}</span>
        </div>
      </article>
    `;
  })
  .join("");

const renderLists = (data) => {
  const renderers = {
    interests: renderInterests,
    research: renderResearch,
    conferences: renderConferences
  };

  Object.entries(renderers).forEach(([key, render]) => {
    const container = document.querySelector(`[data-list="${key}"]`);
    if (container) container.innerHTML = render(data[key] || []);
  });
};

const initNav = () => {
  const button = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  if (!button || !nav) return;

  const setOpen = (isOpen) => {
    nav.classList.toggle("open", isOpen);
    button.setAttribute("aria-expanded", String(isOpen));
    button.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  };

  button.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });
};

// Navigation and the year stamp must not depend on the data fetch succeeding --
// otherwise a failed/slow site.json leaves the mobile menu button dead.
initNav();
document.getElementById("year").textContent = new Date().getFullYear();

// GitHub Pages serves site.json with max-age=600, so without a version tag a
// content edit can take up to 10 minutes to appear even after a hard refresh.
// Tie the data URL to the same version stamp as this script.
const DATA_VERSION = (document.currentScript?.src.split("v=")[1]) || Date.now();

fetch(`data/site.json?v=${DATA_VERSION}`)
  .then((response) => {
    if (!response.ok) throw new Error(`site.json returned HTTP ${response.status}`);
    return response.json();
  })
  .then((data) => {
    setTextFields(data);
    renderLists(data);
  })
  .catch((error) => {
    console.error("Failed to load site data:", error);
  });
