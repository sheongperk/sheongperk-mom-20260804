import { getMetadata } from '../../scripts/aem.js';

// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

// Singapore Government masthead crest (inline SVG — the source uses the
// <sgds-masthead> web component; we reproduce the standard crest + banner).
const SG_CREST = '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false" fill="currentColor"><path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M10 4a6 6 0 100 12A6 6 0 0010 4zm0 10.5a4.5 4.5 0 110-9 4.5 4.5 0 010 9z"/></svg>';

/**
 * Build the Singapore Government masthead bar from the first nav section.
 * @param {Element} section The first fragment section (label + how-to-identify)
 * @returns {Element} the masthead element
 */
function buildMasthead(section) {
  const masthead = document.createElement('div');
  masthead.className = 'nav-masthead';
  const inner = document.createElement('div');
  inner.className = 'nav-masthead-inner';

  const crest = document.createElement('span');
  crest.className = 'nav-masthead-crest';
  crest.innerHTML = SG_CREST;
  inner.append(crest);

  // The label is the first paragraph; the how-to-identify link is the second.
  const paras = section.querySelectorAll('p');
  if (paras[0]) {
    const label = document.createElement('span');
    label.className = 'nav-masthead-label';
    label.textContent = paras[0].textContent.trim();
    inner.append(label);
  }
  if (paras[1] && paras[1].querySelector('a')) {
    const link = paras[1].querySelector('a').cloneNode(true);
    link.className = 'nav-masthead-identify';
    inner.append(link);
  }
  masthead.append(inner);
  return masthead;
}

/**
 * Build the brand bar (logo + top links + search) from the second nav section.
 * @param {Element} section The second fragment section
 * @returns {Element} the brand bar element
 */
function buildBrandBar(section) {
  const bar = document.createElement('div');
  bar.className = 'nav-brand-bar';
  const inner = document.createElement('div');
  inner.className = 'nav-brand-inner';

  // Logo: first <p><a><img></a>
  const logoLink = section.querySelector('p a');
  if (logoLink) {
    const brand = document.createElement('a');
    brand.className = 'nav-brand';
    brand.href = logoLink.getAttribute('href') || '/';
    const img = logoLink.querySelector('img');
    if (img) brand.append(img.cloneNode(true));
    inner.append(brand);
  }

  // Top links list
  const tools = document.createElement('ul');
  tools.className = 'nav-tools';
  section.querySelectorAll('ul > li').forEach((li) => {
    const a = li.querySelector('a');
    if (!a) return;
    const item = document.createElement('li');
    const link = a.cloneNode(true);
    const href = link.getAttribute('href') || '';
    if (/#search$/i.test(href) || link.textContent.trim().toLowerCase() === 'search') {
      link.classList.add('nav-tools-search');
      link.setAttribute('aria-label', 'Search');
    }
    item.append(link);
    tools.append(item);
  });
  inner.append(tools);
  bar.append(inner);
  return bar;
}

/**
 * Build the primary navigation band (megamenu triggers + secondary links).
 * @param {Element} section The third fragment section
 * @returns {Element} the primary nav element
 */
function buildPrimaryNav(section) {
  const primary = document.createElement('div');
  primary.className = 'nav-primary';
  const inner = document.createElement('div');
  inner.className = 'nav-primary-inner';

  const lists = section.querySelectorAll(':scope > ul');
  // First list = category megamenu triggers
  const categoryList = lists[0];
  const secondaryList = lists[1];

  if (categoryList) {
    const catNav = document.createElement('nav');
    catNav.className = 'nav-categories';
    catNav.setAttribute('aria-label', 'Primary');
    const ul = document.createElement('ul');

    categoryList.querySelectorAll(':scope > li').forEach((li) => {
      const trigger = li.querySelector(':scope > a');
      const desc = li.querySelector(':scope > p');
      const panelList = li.querySelector(':scope > ul');
      const item = document.createElement('li');
      item.className = 'nav-category';

      if (panelList) item.classList.add('nav-has-panel');

      // Trigger card (icon + title + description)
      const card = document.createElement('a');
      card.className = 'nav-category-trigger';
      card.href = trigger.getAttribute('href') || '#';
      const img = trigger.querySelector('img');
      if (img) {
        const icon = img.cloneNode(true);
        icon.className = 'nav-category-icon';
        card.append(icon);
      }
      const title = document.createElement('span');
      title.className = 'nav-category-title';
      title.textContent = trigger.textContent.trim();
      card.append(title);
      if (desc) {
        const d = document.createElement('span');
        d.className = 'nav-category-desc';
        d.textContent = desc.textContent.trim();
        card.append(d);
      }
      item.append(card);

      // Megamenu panel
      if (panelList) {
        const panel = document.createElement('div');
        panel.className = 'nav-panel';
        const panelUl = panelList.cloneNode(true);
        panel.append(panelUl);
        item.append(panel);

        // Desktop hover open/close
        item.addEventListener('mouseenter', () => {
          if (isDesktop.matches) item.classList.add('nav-open');
        });
        item.addEventListener('mouseleave', () => {
          if (isDesktop.matches) item.classList.remove('nav-open');
        });
        // Click toggles panel (mobile + keyboard). On the trigger card, prevent
        // navigation only when toggling on mobile; desktop click follows the link.
        card.addEventListener('click', (e) => {
          if (!isDesktop.matches) {
            e.preventDefault();
            const open = item.classList.contains('nav-open');
            catNav.querySelectorAll('.nav-category.nav-open').forEach((o) => o.classList.remove('nav-open'));
            if (!open) item.classList.add('nav-open');
          }
        });
      }
      ul.append(item);
    });
    catNav.append(ul);
    inner.append(catNav);
  }

  if (secondaryList) {
    const secNav = document.createElement('nav');
    secNav.className = 'nav-secondary';
    secNav.setAttribute('aria-label', 'Secondary');
    secNav.append(secondaryList.cloneNode(true));
    inner.append(secNav);
  }

  primary.append(inner);
  return primary;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // Fetch nav fragment: localhost first, then production path.
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch(`${navPath}.plain.html`);
  if (!resp.ok) return;
  const html = await resp.text();

  const fragment = document.createElement('div');
  fragment.innerHTML = html;
  // Rebase relative image URLs to the nav fragment location.
  fragment.querySelectorAll('img[src^="images/"], img[src^="./images/"]').forEach((img) => {
    const src = img.getAttribute('src').replace(/^\.\//, '');
    img.src = new URL(`/content/${src}`, window.location).href;
  });

  const sections = fragment.querySelectorAll(':scope > div');

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', 'false');

  if (sections[0]) nav.append(buildMasthead(sections[0]));

  // Row that holds brand + hamburger + primary nav
  const bar = document.createElement('div');
  bar.className = 'nav-bar';

  // Hamburger (mobile)
  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-controls', 'nav');
  hamburger.setAttribute('aria-label', 'Open navigation');
  hamburger.innerHTML = '<span class="nav-hamburger-icon"></span>';

  if (sections[1]) bar.append(buildBrandBar(sections[1]));
  bar.append(hamburger);
  nav.append(bar);

  if (sections[2]) nav.append(buildPrimaryNav(sections[2]));

  // Mobile toggle
  const closeAllPanels = () => {
    nav.querySelectorAll('.nav-category.nav-open').forEach((o) => o.classList.remove('nav-open'));
  };
  const toggleMenu = (forceClose) => {
    const expanded = forceClose === true ? true : nav.getAttribute('aria-expanded') === 'true';
    nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    hamburger.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
    document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
    if (expanded) closeAllPanels();
  };
  hamburger.addEventListener('click', () => toggleMenu());

  // Keyboard: Escape closes menu/panels
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      closeAllPanels();
      if (!isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') toggleMenu(true);
    }
  });

  // Reset state when crossing the desktop/mobile breakpoint
  isDesktop.addEventListener('change', () => {
    closeAllPanels();
    nav.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open navigation');
    document.body.style.overflowY = '';
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
