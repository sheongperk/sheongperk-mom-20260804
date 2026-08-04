import { getMetadata } from '../../scripts/aem.js';

// Inline SVG social icons keyed by URL host fragment (source uses an icon font
// that isn't available in EDS, so we reproduce recognisable brand glyphs).
const SOCIAL_ICONS = {
  facebook: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0022 12z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M6.94 5a2 2 0 11-4 0 2 2 0 014 0zM3.2 8.5h3.5V22H3.2zM9.5 8.5h3.35v1.84h.05c.47-.88 1.6-1.8 3.3-1.8 3.53 0 4.18 2.32 4.18 5.34V22h-3.5v-5.32c0-1.27-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.8V22H9.5z"/></svg>',
  't.me': '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M9.8 15.6l-.4 4.1c.5 0 .8-.2 1.1-.5l2.6-2.5 5.4 3.9c1 .5 1.7.3 1.9-.9l3.5-16.3c.3-1.4-.5-2-1.5-1.6L1.1 9.5c-1.4.5-1.3 1.3-.2 1.7l5 1.6L17.5 5.7c.5-.3 1-.2.6.2z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M23 7.5s-.2-1.6-.9-2.3c-.8-.9-1.8-.9-2.2-1C16.7 4 12 4 12 4h0s-4.7 0-7.9.2c-.4.1-1.4.1-2.2 1C1.2 5.9 1 7.5 1 7.5S.8 9.4.8 11.3v1.8c0 1.9.2 3.8.2 3.8s.2 1.6.9 2.3c.8.9 1.9.8 2.4.9 1.7.2 7.7.2 7.7.2s4.7 0 7.9-.2c.4-.1 1.4-.1 2.2-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.8v-1.8c0-1.9-.2-3.8-.2-3.8zM9.7 15.1V8.9l6.2 3.1z"/></svg>',
};

function iconForHref(href) {
  const h = (href || '').toLowerCase();
  if (h.includes('facebook')) return SOCIAL_ICONS.facebook;
  if (h.includes('linkedin')) return SOCIAL_ICONS.linkedin;
  if (h.includes('t.me') || h.includes('telegram')) return SOCIAL_ICONS['t.me'];
  if (h.includes('youtube')) return SOCIAL_ICONS.youtube;
  return '';
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch(`${footerPath}.plain.html`);
  if (!resp.ok) return;
  const html = await resp.text();

  const fragment = document.createElement('div');
  fragment.innerHTML = html;
  // Rebase relative image URLs to the footer fragment location.
  fragment.querySelectorAll('img[src^="images/"], img[src^="./images/"]').forEach((img) => {
    const src = img.getAttribute('src').replace(/^\.\//, '');
    img.src = new URL(`/content/${src}`, window.location).href;
  });

  const sections = fragment.querySelectorAll(':scope > div');

  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer-inner';

  // Section 0: Information and Services (links + social)
  if (sections[0]) {
    const info = document.createElement('div');
    info.className = 'footer-info';
    const infoInner = document.createElement('div');
    infoInner.className = 'footer-info-inner';

    // Move all children over, then tag the two link lists (nav links, social).
    while (sections[0].firstElementChild) infoInner.append(sections[0].firstElementChild);

    const lists = infoInner.querySelectorAll('ul');
    if (lists[0]) lists[0].classList.add('footer-links');
    if (lists[1]) {
      lists[1].classList.add('footer-social');
      // Replace social link text with brand icons (keep aria-label from text).
      lists[1].querySelectorAll('a').forEach((a) => {
        const label = a.textContent.trim();
        const icon = iconForHref(a.getAttribute('href'));
        if (icon) {
          a.setAttribute('aria-label', label);
          a.innerHTML = icon;
          a.setAttribute('target', '_blank');
          a.setAttribute('rel', 'noopener');
        }
      });
    }
    info.append(infoInner);
    footer.append(info);
  }

  // Section 1: legal bar
  if (sections[1]) {
    const legal = document.createElement('div');
    legal.className = 'footer-legal';
    const legalInner = document.createElement('div');
    legalInner.className = 'footer-legal-inner';
    while (sections[1].firstElementChild) legalInner.append(sections[1].firstElementChild);
    const legalList = legalInner.querySelector('ul');
    if (legalList) legalList.classList.add('footer-legal-links');
    legal.append(legalInner);
    footer.append(legal);
  }

  block.append(footer);
}
