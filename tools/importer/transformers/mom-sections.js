/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: mom.gov.sg section breaks + section metadata.
 *
 * Reads section definitions from payload.template.sections (page-templates.json)
 * and, for each section that resolves to an element in the DOM:
 *   - inserts an <hr> section break before it (except the first section), and
 *   - appends a "Section Metadata" block after it when the section has a style.
 *
 * Section selectors are the same DOM selectors used in page-templates.json /
 * page-structure.json, verified against migration-work/cleaned.html.
 *
 * Runs in afterTransform only (block parsers run between the hooks).
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const template = payload && payload.template;
    const sections = template && Array.isArray(template.sections) ? template.sections : [];
    if (!sections.length) return;

    const doc = element.ownerDocument;

    // Process in reverse so inserted nodes never shift earlier lookups.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section || !section.selector) continue;

      const target = element.querySelector(section.selector);
      if (!target) continue;

      // Section Metadata block after the section, when a style is defined.
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        target.after(metaBlock);
      }

      // Section break before every section except the first.
      if (i > 0) {
        target.before(doc.createElement('hr'));
      }
    }
  }
}
