// eslint-disable-next-line import/no-unresolved
import { moveInstrumentation } from '../../scripts/scripts.js';

// keep track globally of the number of tab blocks on the page
let tabBlockCnt = 0;

/**
 * Restructure a panel's flat content into semantic groups so it can be styled
 * to match the MOM "Highlights" module:
 *  - promo cards  (image + title link, laid out side by side)
 *  - useful-links box (header + arrow list)
 *  - eservice-columns (multiple arrow lists laid out in columns)
 * EDS's decorateMain() also auto-promotes standalone <p><a> links into
 * a.button / p.button-container -- undo that here so the links render plainly.
 */
function decoratePanelContent(content) {
  // undo EDS button auto-decoration
  content.querySelectorAll('a.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary'));
  content.querySelectorAll('p.button-container').forEach((p) => p.classList.remove('button-container'));

  const nodes = [...content.children];
  const wrapper = document.createElement('div');
  wrapper.className = 'tabs-highlights-content';

  let i = 0;
  while (i < nodes.length) {
    const el = nodes[i];

    // promo card: a <p> containing an image, optionally followed by a title <p>
    if (el.tagName === 'P' && el.querySelector('picture, img')) {
      const card = document.createElement('div');
      card.className = 'tabs-highlights-promo';
      card.append(el);
      const next = nodes[i + 1];
      if (next && next.tagName === 'P' && next.querySelector('a') && !next.querySelector('picture, img')) {
        card.append(next);
        i += 1;
      }
      wrapper.append(card);
      i += 1;
      // eslint-disable-next-line no-continue
      continue;
    }

    // useful-links box: a header <p> (with <strong>) followed by one or more <ul>
    if (el.tagName === 'P' && el.querySelector('strong') && !el.querySelector('a img, picture')) {
      const box = document.createElement('div');
      box.className = 'tabs-highlights-useful';
      box.append(el);
      let j = i + 1;
      while (j < nodes.length && nodes[j].tagName === 'UL') {
        box.append(nodes[j]);
        j += 1;
      }
      wrapper.append(box);
      i = j;
      // eslint-disable-next-line no-continue
      continue;
    }

    // arrow-list columns: consecutive standalone <ul> elements
    if (el.tagName === 'UL') {
      let cols = wrapper.lastElementChild;
      if (!cols || !cols.classList.contains('tabs-highlights-columns')) {
        cols = document.createElement('div');
        cols.className = 'tabs-highlights-columns';
        wrapper.append(cols);
      }
      cols.append(el);
      i += 1;
      // eslint-disable-next-line no-continue
      continue;
    }

    // headings and everything else pass through
    wrapper.append(el);
    i += 1;
  }

  content.append(wrapper);
}

export default async function decorate(block) {
  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-highlights-list';
  tablist.setAttribute('role', 'tablist');
  tablist.id = `tablist-${tabBlockCnt += 1}`;

  // the first cell of each row is the title of the tab
  const tabHeadings = [...block.children]
    .filter((child) => child.firstElementChild && child.firstElementChild.children.length > 0)
    .map((child) => child.firstElementChild);

  tabHeadings.forEach((tab, i) => {
    const id = `tabpanel-${tabBlockCnt}-tab-${i + 1}`;

    // decorate tabpanel
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-highlights-panel';
    tabpanel.id = id;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // build tab button
    const button = document.createElement('button');
    button.className = 'tabs-highlights-tab';
    button.id = `tab-${id}`;

    button.innerHTML = tab.innerHTML;

    button.setAttribute('aria-controls', id);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');

    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });

    // add the new tab list button, to the tablist
    tablist.append(button);

    // remove the tab heading from the dom, which also removes it from the UE tree
    tab.remove();

    // remove the instrumentation from the button's h1, h2 etc (this removes it from the tree)
    if (button.firstElementChild) {
      moveInstrumentation(button.firstElementChild, null);
    }

    // restructure the panel's remaining content for styling
    const contentCell = tabpanel.firstElementChild;
    if (contentCell) {
      decoratePanelContent(contentCell);
    }
  });

  block.prepend(tablist);
}
