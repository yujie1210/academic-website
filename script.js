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

const renderProjects = (items) => items
  .map((item, index) => `
    <article class="project-card">
      <span class="project-index">${String(index + 1).padStart(2, "0")}</span>
      <h3>${esc(item.title)}</h3>
      <span class="meta">${esc(item.status)}</span>
      ${item.description ? `
        <div class="project-abstract">
          <span>Abstract</span>
          <p>${esc(item.description)}</p>
        </div>
      ` : ""}
    </article>
  `)
  .join("");

// Grouped by course: one row per course, with each term it was taught listed
// underneath. Falls back to the older flat {term, course, load} shape so an
// out-of-date site.json still renders.
const renderTeaching = (items) => items
  .map((item) => {
    if (item.terms) {
      return `
        <article class="teaching-row">
          <h3 class="course">${esc(item.course)}</h3>
          <ul class="term-list">
            ${item.terms.map((t) => `<li>${esc(t)}</li>`).join("")}
          </ul>
        </article>
      `;
    }
    return `
      <article class="timeline-row">
        <span class="term">${esc(item.term)}</span>
        <span class="course">${esc(item.course)}</span>
        <span class="load">${esc(item.load)}</span>
      </article>
    `;
  })
  .join("");

const renderPublications = (items) => {
  if (!items.length) {
    return `
      <article class="publication-card">
        <h3>Research outputs coming soon</h3>
        <p>Formal titles, author order, abstracts, and links can be added as the projects mature.</p>
      </article>
    `;
  }

  return items
    .map((item) => `
      <article class="publication-card">
        <h3>${esc(item.title)}</h3>
        <span class="meta">${esc(item.authors)}</span>
        ${item.venue ? `<p>${esc(item.venue)}</p>` : ""}
        ${item.abstract ? `
          <div class="abstract-details">
            <span>Abstract</span>
            <p>${esc(item.abstract)}</p>
          </div>
        ` : ""}
      </article>
    `)
    .join("");
};

const renderConferences = (items) => items
  .map((item) => `
    <article class="conference-row">
      <div>
        <h3>${esc(item.title)}</h3>
        <span class="meta">${esc(item.location)} · ${esc(item.date)}</span>
      </div>
    </article>
  `)
  .join("");

const renderEntries = (items) => items
  .map((item) => `
    <article class="entry">
      <h3>${esc(item.title)}</h3>
      <span class="meta">${esc(item.place)} · ${esc(item.period)}</span>
      ${item.description ? `<p>${esc(item.description)}</p>` : ""}
      ${item.details ? `
        <dl class="detail-list">
          ${item.details.map((detail) => `
            <div>
              <dt>${esc(detail.label)}</dt>
              <dd>${esc(detail.value)}</dd>
            </div>
          `).join("")}
        </dl>
      ` : ""}
      ${item.tags ? `
        <div class="coursework-list" aria-label="Selected coursework">
          <span>Selected coursework</span>
          <ul>
            ${item.tags.map((tag) => `<li>${esc(tag)}</li>`).join("")}
          </ul>
        </div>
      ` : ""}
    </article>
  `)
  .join("");

const renderLists = (data) => {
  const renderers = {
    interests: renderInterests,
    projects: renderProjects,
    teaching: renderTeaching,
    publications: renderPublications,
    conferences: renderConferences,
    education: renderEntries,
    experience: renderEntries,
    activities: renderEntries
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

fetch("data/site.json")
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
