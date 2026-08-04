/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-iconlink variant. Base: cards.
 * Source: https://www.mom.gov.sg/
 * Selector: #primarynavigation_0_homequicklinks_0_DivCode > nav.nav-secondary > a.link-has-image
 * Model: container with `card` items — fields: image (reference), text (richtext).
 *
 * The selector matches 5 sibling <a> icon links. `parse` is invoked once per matched
 * element, so the FIRST (leader) element aggregates all siblings into a single block and
 * removes the others; subsequent (now-detached) invocations bail.
 */
export default function parse(element, { document }) {
  const parent = element.parentElement;
  if (!parent) return; // already aggregated & removed by the leader — bail

  // All sibling icon-link cards under the same nav container, in document order
  const group = Array.from(parent.querySelectorAll(':scope > a.link-has-image'));
  if (group.length === 0 || group[0] !== element) return; // only the leader builds

  const cells = [];

  group.forEach((card) => {
    const href = card.getAttribute('href');
    const img = card.querySelector('img');
    // Label is the anchor's own text content (the direct text node, not the img alt)
    const label = card.textContent.trim();

    // Column 1: image field
    const imageFrag = document.createDocumentFragment();
    if (img) {
      imageFrag.appendChild(document.createComment(' field:image '));
      imageFrag.appendChild(img);
    }

    // Column 2: text field — linked label
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));
    if (label) {
      if (href) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = label;
        textFrag.appendChild(a);
      } else {
        textFrag.appendChild(document.createTextNode(label));
      }
    }

    cells.push([imageFrag, textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-iconlink', cells });
  element.replaceWith(block);

  // Remove the remaining sibling cards so they are not left as stray content
  group.slice(1).forEach((el) => el.remove());
}
