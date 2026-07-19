import { CONFIG } from "./config.js";
import { initRouter } from "./router.js";

const app = document.getElementById("app");

let contentListCache = null;

async function getContentList() {
  if (contentListCache) return contentListCache;
  const res = await fetch("data/content.json");
  contentListCache = await res.json();
  return contentListCache;
}

function renderTags(tags) {
  if (!tags || !tags.length) return "";

  const chips = tags.map((tag) => `<span class="tag">${tag}</span>`).join("");

  return `<div class="tags">${chips}</div>`;
}

function renderNavbar() {
  return `
    <header class="navbar">
      <a href="#/" class="navbar-home">${CONFIG.brand.title}</a>
    </header>
  `;
}

function renderFooter() {
  const linksHtml = CONFIG.footer.links
    .map(
      (l) =>
        `<li><a href="${l.url}" target="_blank" rel="noopener">${l.label}</a></li>`,
    )
    .join("");

  return `
    <footer class="footer">
      <div class="footer-col">
        <h3>Sobre</h3>
        <p>${CONFIG.footer.about}</p>
      </div>
      <div class="footer-col">
        <h3>Contato</h3>
        <p><a href="mailto:${CONFIG.footer.contact.email}">${CONFIG.footer.contact.email}</a></p>
        <p><a href="https://t.me/${CONFIG.footer.contact.whatsapp}" target="_blank" rel="noopener">Telegram</a></p>
      </div>
      <div class="footer-col">
        <h3>Links</h3>
        <ul>${linksHtml}</ul>
      </div>
    </footer>
  `;
}

async function renderHome() {
  const list = await getContentList();
  const RECENT_LIMIT = 5;

  app.innerHTML = `
    ${renderNavbar()}
    <main class="content">
      <h1>${CONFIG.brand.title}</h1>
      <p class="description">${CONFIG.brand.description}</p>
      <input type="text" id="search-input" class="search-input" placeholder="🔍 Pesquisar palavras-chave web, javascript, python..." />
      <p class="list-note" id="list-note"></p>
      <ul class="article-list" id="article-list"></ul>
    </main>
    ${renderFooter()}
  `;

  const listEl = document.getElementById("article-list");
  const searchInput = document.getElementById("search-input");
  const listNoteEl = document.getElementById("list-note");

  function renderList(items, { isSearch }) {
    if (!items.length) {
      listEl.innerHTML = `<li class="empty">Nenhum resultado encontrado.</li>`;
      listNoteEl.textContent = "";
      return;
    }

    listNoteEl.textContent = isSearch
      ? ""
      : `▼ Os ${Math.min(items.length, RECENT_LIMIT)} últimos artigos`;

    listEl.innerHTML = items
      .map(
        (item) => `
          <li>
            <a href="#/${item.slug}">
              <span class="item-title">${item.title}</span>
              ${renderTags(item.tags)}
            </a>
          </li>
        `,
      )
      .join("");
  }

  renderList(list.slice(0, RECENT_LIMIT), { isSearch: false });

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
      renderList(list.slice(0, RECENT_LIMIT), { isSearch: false });
      return;
    }

    const filtered = list.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(query);
      const tagMatch = (item.tags || []).some((tag) =>
        tag.toLowerCase().includes(query),
      );
      return titleMatch || tagMatch;
    });
    renderList(filtered, { isSearch: true });
  });
}

async function renderArticle(slug) {
  const list = await getContentList();
  const entry = list.find((item) => item.slug === slug);

  if (!entry) {
    app.innerHTML = `
      ${renderNavbar()}
      <main class="content">
        <a href="#/" class="back-link">&larr; Voltar</a>
        <h1>404</h1>
        <p>Artigo não encontrado.</p>
      </main>
      ${renderFooter()}
    `;
    return;
  }

  const res = await fetch(`content/${entry.file}`);
  const md = await res.text();
  const html = marked.parse(md);

  // Insere o bloco de tags logo depois do primeiro </h1> do markdown renderizado,
  // para que apareçam como um "subtítulo" do artigo.
  const tagsBlock = renderTags(entry.tags);
  const htmlWithTags = html.includes("</h1>")
    ? html.replace("</h1>", `</h1>${tagsBlock}`)
    : `${tagsBlock}${html}`;

  app.innerHTML = `
    ${renderNavbar()}
    <main class="content article">
      <a href="#/" class="back-link">&larr; Voltar</a>
      ${htmlWithTags}
    </main>
    ${renderFooter()}
  `;
}

initRouter({
  home: renderHome,
  article: renderArticle,
});
