/* eslint-disable */
/* global WebImporter */

/**
 * Parser for tabs-highlights variant. Base: tabs.
 * Source: https://www.mom.gov.sg/
 * Selector: #MainContent > div.ui-module.module-eservices div.quickGuideDiv
 * Model: container with `tabs-highlights-item` children.
 *   Item fields: title (text, tab label), content_heading (text),
 *   content_headingType (collapsed/skipped), content_image (reference),
 *   content_richtext (richtext).
 *
 * The selector matches ONE container. The real tabs are defined by the desktop tab list
 * (`ul.nav-tabs.desktop-only`); each label's href (e.g. "#gettingStarted") points to its
 * panel by id. The `.tab-content` also holds empty placeholder panes (faq, formsRequired)
 * with no matching tab label — those are intentionally skipped. One row per real tab:
 *   [ title | grouped content_* cell ].
 */
export default function parse(element, { document }) {
  // Prefer the desktop tab list; fall back to the first nav-tabs list
  const tabList = element.querySelector('ul.nav-tabs.desktop-only')
    || element.querySelector('ul.nav-tabs');
  const labelLinks = tabList
    ? Array.from(tabList.querySelectorAll(':scope > li a, li a'))
    : [];

  const cells = [];

  labelLinks.forEach((labelEl) => {
    const labelText = labelEl.textContent.trim();

    // Resolve the matching panel by the label's href fragment (e.g. "#gettingStarted")
    const href = labelEl.getAttribute('href') || '';
    const paneId = href.startsWith('#') ? href.slice(1) : '';
    const pane = paneId ? element.querySelector(`#${paneId}.tab-pane, #${paneId}`) : null;
    if (!pane) return; // no real panel for this label — skip

    // Column 1: title field (tab label — plain text)
    const titleFrag = document.createDocumentFragment();
    titleFrag.appendChild(document.createComment(' field:title '));
    if (labelText) {
      titleFrag.appendChild(document.createTextNode(labelText));
    }

    // Column 2: grouped content_* fields, in model order:
    //   content_heading (text), content_headingType (collapsed/skipped),
    //   content_image (reference), content_richtext (richtext)
    const contentFrag = document.createDocumentFragment();

    // Clone the pane so we can strip its own section-title before richtext capture
    const paneClone = pane.cloneNode(true);

    // content_heading: the panel's own section heading, if any (e.g. "Popular eServices")
    const paneHeadingEl = paneClone.querySelector('h2.section-title, h2, h3');
    let headingText = '';
    if (paneHeadingEl) {
      const textSpan = paneHeadingEl.querySelector('.text');
      headingText = (textSpan ? textSpan.textContent : paneHeadingEl.textContent).trim();
      paneHeadingEl.remove(); // avoid duplicating inside richtext
    }
    if (headingText) {
      contentFrag.appendChild(document.createComment(' field:content_heading '));
      const h3 = document.createElement('h3');
      h3.textContent = headingText;
      contentFrag.appendChild(h3);
    }

    // content_richtext: remaining panel content (image cards, links, lists, CTAs)
    // Strip decorative icon <em> elements which carry no textual content
    paneClone.querySelectorAll('em.icon').forEach((em) => em.remove());
    contentFrag.appendChild(document.createComment(' field:content_richtext '));
    while (paneClone.firstChild) {
      contentFrag.appendChild(paneClone.firstChild);
    }

    cells.push([titleFrag, contentFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-highlights', cells });
  element.replaceWith(block);
}
