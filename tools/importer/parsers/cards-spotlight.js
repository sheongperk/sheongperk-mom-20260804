/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-spotlight variant. Base: cards.
 * Source: https://www.mom.gov.sg/
 * Selector: #maincontent_0_homesmallspotlight_0_DivCode a.ui-banner
 * Model: container with `card` items — fields: image (reference), text (richtext).
 *
 * The selector matches 3 banner <a> elements, each in its own wrapper under the
 * #maincontent_0_homesmallspotlight_0_DivCode container. `parse` is invoked once per
 * matched element, so the FIRST (leader) banner aggregates all banners into a single
 * block and removes the others; subsequent (now-detached) invocations bail.
 */
export default function parse(element, { document }) {
  // The stable common ancestor holding every banner
  const container = element.closest('#maincontent_0_homesmallspotlight_0_DivCode')
    || element.parentElement;
  if (!container) return; // detached — already handled by the leader

  const group = Array.from(container.querySelectorAll('a.ui-banner'));
  if (group.length === 0 || group[0] !== element) return; // only the leader builds

  const cells = [];

  group.forEach((banner) => {
    const href = banner.getAttribute('href');
    const img = banner.querySelector('img');
    // Overlaid caption text
    const caption = banner.querySelector('.banner-text, strong');
    const captionText = caption ? caption.textContent.trim() : '';

    // Column 1: image field
    const imageFrag = document.createDocumentFragment();
    if (img) {
      imageFrag.appendChild(document.createComment(' field:image '));
      imageFrag.appendChild(img);
    }

    // Column 2: text field — linked caption
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));
    if (captionText) {
      if (href) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = captionText;
        textFrag.appendChild(a);
      } else {
        textFrag.appendChild(document.createTextNode(captionText));
      }
    }

    cells.push([imageFrag, textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-spotlight', cells });
  element.replaceWith(block);

  // Remove the remaining banners so they are not left as stray content
  group.slice(1).forEach((el) => el.remove());
}
