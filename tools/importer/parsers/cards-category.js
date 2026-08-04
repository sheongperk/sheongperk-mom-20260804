/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-category variant. Base: cards.
 * Source: https://www.mom.gov.sg/
 * Selector: #primary-navigation > nav.nav-main > a.link-has-image.home-page-menu
 * Model: container with `card` items — fields: image (reference), text (richtext).
 *
 * The selector matches 4 sibling <a> category cards. `parse` is invoked once per
 * matched element, so the FIRST (leader) element aggregates all sibling cards into a
 * single block and removes the others; subsequent (now-detached) invocations bail.
 */
export default function parse(element, { document }) {
  const parent = element.parentElement;
  if (!parent) return; // already aggregated & removed by the leader — bail

  // All sibling category cards under the same nav container, in document order
  const group = Array.from(
    parent.querySelectorAll(':scope > a.link-has-image.home-page-menu, :scope > a.home-page-menu'),
  );
  if (group.length === 0 || group[0] !== element) return; // only the leader builds

  const cells = [];

  group.forEach((card) => {
    const href = card.getAttribute('href');
    const img = card.querySelector('img');
    const descSpan = card.querySelector(':scope > span.nav-desc, :scope span.nav-desc');
    const descText = descSpan && descSpan.textContent.trim() ? descSpan.textContent.trim() : '';

    // Title resolution. In the live browser DOM the title is a <span>, but in the
    // importer's raw fetched HTML it is a BARE TEXT NODE sitting between the icon
    // <div> and the .nav-desc <span> (e.g. `</div>Work passes<span class=…>`).
    // So read a non-description <span> if present, else fall back to the card's
    // direct child text nodes (excluding the description text).
    let titleText = '';
    const titleSpan = card.querySelector(':scope > span:not(.nav-desc)');
    if (titleSpan && titleSpan.textContent.trim()) {
      titleText = titleSpan.textContent.trim();
    } else {
      // Collect direct child text nodes of the anchor
      const descTextForCompare = descText;
      const parts = [];
      card.childNodes.forEach((node) => {
        if (node.nodeType === 3) {
          const t = node.textContent.trim();
          if (t && t !== descTextForCompare) parts.push(t);
        }
      });
      titleText = parts.join(' ').trim();
    }

    // Column 1: image field. The card title ("Work passes", etc.) is carried on
    // the image's alt attribute — alt text round-trips reliably through
    // html2md/md2da, whereas an extra title paragraph in the text cell is
    // dropped by html2md's block-table serialization. cards-category.js renders
    // the image alt as the visible card title at decoration time.
    const imageFrag = document.createDocumentFragment();
    if (img) {
      if (titleText) img.setAttribute('alt', titleText);
      imageFrag.appendChild(document.createComment(' field:image '));
      imageFrag.appendChild(img);
    }

    // Column 2: text field — a SINGLE paragraph holding the title (bold) then a
    // line break then the description. NOTE: html2md drops all but the last
    // block element from a block cell, so title and description cannot be two
    // separate paragraphs; combined into one paragraph they survive as
    // "**Title**\<br>description". cards-category.js splits the leading <strong>
    // out into a title heading at decoration time.
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));

    if (titleText || descText) {
      const p = document.createElement('p');
      if (titleText) {
        const strong = document.createElement('strong');
        strong.textContent = titleText;
        p.appendChild(strong);
      }
      if (titleText && descText) p.appendChild(document.createElement('br'));
      if (descText) p.appendChild(document.createTextNode(descText));
      textFrag.appendChild(p);
    }

    cells.push([imageFrag, textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-category', cells });
  element.replaceWith(block);

  // Remove the remaining sibling cards so they are not left as stray content
  group.slice(1).forEach((el) => el.remove());
}
