const getValue = (source, path) =>
  path.split(".").reduce((value, key) => (value ? value[key] : ""), source);

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
      <h3>${item.title}</h3>
      <p>${item.description}</p>
    </article>
  `)
  .join("");

const renderProjects = (items) => items
  .map((item, index) => `
    <article class="project-card">
      <span class="project-index">${String(index + 1).padStart(2, "0")}</span>
      <h3>${item.title}</h3>
      <span class="meta">${item.status}</span>
      ${item.description ? `
        <div class="project-abstract">
          <span>Abstract</span>
          <p>${item.description}</p>
        </div>
      ` : ""}
    </article>
  `)
  .join("");

const renderTeaching = (items) => items
  .map((item) => `
    <article class="timeline-row">
      <span class="term">${item.term}</span>
      <span class="course">${item.course}</span>
      <span class="load">${item.load}</span>
    </article>
  `)
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
        <h3>${item.title}</h3>
        <span class="meta">${item.authors}</span>
        ${item.venue ? `<p>${item.venue}</p>` : ""}
        ${item.abstract ? `
          <div class="abstract-details">
            <span>Abstract</span>
            <p>${item.abstract}</p>
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
        <h3>${item.title}</h3>
        <span class="meta">${item.location} · ${item.date}</span>
      </div>
    </article>
  `)
  .join("");

const renderEntries = (items) => items
  .map((item) => `
    <article class="entry">
      <h3>${item.title}</h3>
      <span class="meta">${item.place} · ${item.period}</span>
      ${item.description ? `<p>${item.description}</p>` : ""}
      ${item.details ? `
        <dl class="detail-list">
          ${item.details.map((detail) => `
            <div>
              <dt>${detail.label}</dt>
              <dd>${detail.value}</dd>
            </div>
          `).join("")}
        </dl>
      ` : ""}
      ${item.tags ? `
        <div class="coursework-list" aria-label="Selected coursework">
          <span>Selected coursework</span>
          <ul>
            ${item.tags.map((tag) => `<li>${tag}</li>`).join("")}
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

  button.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    button.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      button.setAttribute("aria-expanded", "false");
    });
  });
};

fetch("data/site.json")
  .then((response) => response.json())
  .then((data) => {
    setTextFields(data);
    renderLists(data);
    document.getElementById("year").textContent = new Date().getFullYear();
    initNav();
  })
  .catch((error) => {
    console.error("Failed to load site data:", error);
  });
