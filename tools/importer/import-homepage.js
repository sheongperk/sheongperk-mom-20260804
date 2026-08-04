/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
// Note: cards-category / cards-iconlink parsers still exist for the block library,
// but are not wired here — the primary-navigation band is the site header, not body content.
import cardsSpotlightParser from './parsers/cards-spotlight.js';
import tabsHighlightsParser from './parsers/tabs-highlights.js';
import columnsNewsroomParser from './parsers/columns-newsroom.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/mom-cleanup.js';
import sectionsTransformer from './transformers/mom-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Ministry of Manpower homepage — masthead search, eServices quick guide tabs, highlights/spotlight banners, and latest announcements/press releases/speeches listing. The primary navigation band is instrumented as the site header, not imported as body content.',
  urls: [
    'https://www.mom.gov.sg/'
  ],
  blocks: [
    {
      name: 'tabs-highlights',
      instances: ['#MainContent > div.ui-module.module-eservices div.quickGuideDiv']
    },
    {
      name: 'cards-spotlight',
      instances: ['#maincontent_0_homesmallspotlight_0_DivCode a.ui-banner']
    },
    {
      name: 'columns-newsroom',
      instances: ['#maincontent_0_homelatest_0_DivCode > div.row.content-highlights > section.columns']
    }
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Masthead welcome + search',
      selector: '#mainform > div.mom-masthead.searchbar-container',
      style: 'highlight',
      blocks: ['search'],
      defaultContent: ['#mainform > div.mom-masthead.searchbar-container h1']
    },
    {
      id: 'section-3',
      name: 'Highlights / eServices quick-guide tabs',
      selector: '#MainContent > div.ui-module.module-eservices',
      style: 'highlight',
      blocks: ['tabs-highlights'],
      defaultContent: [
        '#MainContent > div.ui-module.module-eservices .quickGuideDiv > h2.section-title',
        '#MainContent > div.ui-module.module-eservices .quickGuideDiv > p'
      ]
    },
    {
      id: 'section-4',
      name: 'Spotlight banners',
      selector: '#maincontent_0_homesmallspotlight_0_DivCode',
      style: 'grey',
      blocks: ['cards-spotlight'],
      defaultContent: []
    },
    {
      id: 'section-5',
      name: 'Latest Announcements / Press releases / Speeches',
      selector: '#maincontent_0_homelatest_0_DivCode',
      style: 'grey',
      blocks: ['columns-newsroom'],
      defaultContent: []
    }
  ]
};

// PARSER REGISTRY
const parsers = {
  'tabs-highlights': tabsHighlightsParser,
  'cards-spotlight': cardsSpotlightParser,
  'columns-newsroom': columnsNewsroomParser,
};

// TRANSFORMER REGISTRY
// Cleanup runs first; section transformer runs after (adds <hr> + Section Metadata).
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document
 * @param {Object} template
 * @returns {Array}
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Discover blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block. Skip elements already replaced/detached by an earlier parser
    //    (multi-match variants aggregate on the leader element and remove siblings).
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path. The homepage pathname is "/", which collapses to an empty
    //    string after stripping the trailing slash; map that to "/index" so sanitizePath
    //    receives an absolute path (an empty path triggers a process.cwd() call that is
    //    unavailable in the browser context).
    const rawPath = new URL(params.originalURL).pathname.replace(/\.html$/, '').replace(/\/$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath || '/index');

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      }
    }];
  }
};
