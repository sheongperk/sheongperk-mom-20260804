import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-category-card-image';
      else div.className = 'cards-category-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  // The card title is imported as a leading <strong> followed by <br> then the
  // description, all inside the body paragraph. Promote that <strong> into a
  // proper title heading and drop the <br> so title and description are
  // distinct, stylable elements.
  ul.querySelectorAll('.cards-category-card-body').forEach((body) => {
    const p = body.querySelector('p');
    if (!p) return;
    const strong = p.querySelector(':scope > strong:first-child');
    if (!strong) return;
    const h = document.createElement('h3');
    h.className = 'cards-category-card-title';
    h.textContent = strong.textContent.trim();
    // Remove the <strong> and an immediately-following <br> from the paragraph.
    const next = strong.nextSibling;
    if (next && next.nodeName === 'BR') next.remove();
    strong.remove();
    // Trim a leading whitespace text node left after the <br>.
    if (p.firstChild && p.firstChild.nodeType === 3) {
      p.firstChild.textContent = p.firstChild.textContent.replace(/^\s+/, '');
    }
    body.prepend(h);
  });

  block.textContent = '';
  block.append(ul);
}
