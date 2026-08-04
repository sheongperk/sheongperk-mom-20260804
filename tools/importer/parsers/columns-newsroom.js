/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-newsroom variant. Base: columns.
 * Source: https://www.mom.gov.sg/
 * Selector: #maincontent_0_homelatest_0_DivCode > div.row.content-highlights > section.columns
 * Model: columns block (core columns component).
 *   Per hinting rules, Columns blocks use NO field comments — only default content in cells.
 *
 * The selector matches 3 sibling <section.columns> (Announcements / Press releases /
 * Speeches). `parse` is invoked once per matched element, so the FIRST (leader) section
 * aggregates all three into a single one-row, three-column block and removes the others;
 * subsequent (now-detached) invocations bail.
 */
export default function parse(element, { document }) {
  const parent = element.parentElement;
  if (!parent) return; // already aggregated & removed by the leader — bail

  const group = Array.from(parent.querySelectorAll(':scope > section.columns'));
  if (group.length === 0 || group[0] !== element) return; // only the leader builds

  // One row; each column cell holds that section's heading, dated item(s) and View All.
  const row = group.map((section) => {
    const cellContent = [];

    // Column heading (e.g. "Announcements") — strip decorative icon <em>
    const headingEl = section.querySelector('h2.section-title, h2');
    if (headingEl) {
      const textSpan = headingEl.querySelector('.text');
      const headingText = (textSpan ? textSpan.textContent : headingEl.textContent).trim();
      if (headingText) {
        const h2 = document.createElement('h2');
        h2.textContent = headingText;
        cellContent.push(h2);
      }
    }

    // Dated linked item(s): time + linked heading + optional summary paragraph
    const articles = Array.from(section.querySelectorAll('article.item, article'));
    articles.forEach((article) => {
      const time = article.querySelector('time');
      if (time && time.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = time.textContent.trim();
        cellContent.push(p);
      }

      const itemHeading = article.querySelector('h3, h4');
      const itemLink = itemHeading ? itemHeading.querySelector('a') : null;
      if (itemLink && itemLink.getAttribute('href')) {
        const h3 = document.createElement('h3');
        const a = document.createElement('a');
        a.setAttribute('href', itemLink.getAttribute('href'));
        a.textContent = itemLink.textContent.trim();
        h3.appendChild(a);
        cellContent.push(h3);
      } else if (itemHeading && itemHeading.textContent.trim()) {
        const h3 = document.createElement('h3');
        h3.textContent = itemHeading.textContent.trim();
        cellContent.push(h3);
      }

      const summary = article.querySelector('p');
      if (summary && summary.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = summary.textContent.trim();
        cellContent.push(p);
      }
    });

    // "View All" CTA
    const viewAll = section.querySelector('a.link--more, a[class*="more"]');
    if (viewAll && viewAll.getAttribute('href')) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', viewAll.getAttribute('href'));
      a.textContent = viewAll.textContent.trim();
      p.appendChild(a);
      cellContent.push(p);
    }

    return cellContent;
  });

  const cells = [row];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-newsroom', cells });
  element.replaceWith(block);

  // Remove the remaining sibling sections so they are not left as stray content
  group.slice(1).forEach((el) => el.remove());
}
