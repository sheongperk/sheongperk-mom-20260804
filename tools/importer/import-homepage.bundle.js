/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/cards-spotlight.js
  function parse(element, { document }) {
    const container = element.closest("#maincontent_0_homesmallspotlight_0_DivCode") || element.parentElement;
    if (!container) return;
    const group = Array.from(container.querySelectorAll("a.ui-banner"));
    if (group.length === 0 || group[0] !== element) return;
    const cells = [];
    group.forEach((banner) => {
      const href = banner.getAttribute("href");
      const img = banner.querySelector("img");
      const caption = banner.querySelector(".banner-text, strong");
      const captionText = caption ? caption.textContent.trim() : "";
      const imageFrag = document.createDocumentFragment();
      if (img) {
        imageFrag.appendChild(document.createComment(" field:image "));
        imageFrag.appendChild(img);
      }
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      if (captionText) {
        if (href) {
          const a = document.createElement("a");
          a.setAttribute("href", href);
          a.textContent = captionText;
          textFrag.appendChild(a);
        } else {
          textFrag.appendChild(document.createTextNode(captionText));
        }
      }
      cells.push([imageFrag, textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-spotlight", cells });
    element.replaceWith(block);
    group.slice(1).forEach((el) => el.remove());
  }

  // tools/importer/parsers/tabs-highlights.js
  function parse2(element, { document }) {
    const tabList = element.querySelector("ul.nav-tabs.desktop-only") || element.querySelector("ul.nav-tabs");
    const labelLinks = tabList ? Array.from(tabList.querySelectorAll(":scope > li a, li a")) : [];
    const cells = [];
    labelLinks.forEach((labelEl) => {
      const labelText = labelEl.textContent.trim();
      const href = labelEl.getAttribute("href") || "";
      const paneId = href.startsWith("#") ? href.slice(1) : "";
      const pane = paneId ? element.querySelector(`#${paneId}.tab-pane, #${paneId}`) : null;
      if (!pane) return;
      const titleFrag = document.createDocumentFragment();
      titleFrag.appendChild(document.createComment(" field:title "));
      if (labelText) {
        titleFrag.appendChild(document.createTextNode(labelText));
      }
      const contentFrag = document.createDocumentFragment();
      const paneClone = pane.cloneNode(true);
      const paneHeadingEl = paneClone.querySelector("h2.section-title, h2, h3");
      let headingText = "";
      if (paneHeadingEl) {
        const textSpan = paneHeadingEl.querySelector(".text");
        headingText = (textSpan ? textSpan.textContent : paneHeadingEl.textContent).trim();
        paneHeadingEl.remove();
      }
      if (headingText) {
        contentFrag.appendChild(document.createComment(" field:content_heading "));
        const h3 = document.createElement("h3");
        h3.textContent = headingText;
        contentFrag.appendChild(h3);
      }
      paneClone.querySelectorAll("em.icon").forEach((em) => em.remove());
      contentFrag.appendChild(document.createComment(" field:content_richtext "));
      while (paneClone.firstChild) {
        contentFrag.appendChild(paneClone.firstChild);
      }
      cells.push([titleFrag, contentFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-highlights", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-newsroom.js
  function parse3(element, { document }) {
    const parent = element.parentElement;
    if (!parent) return;
    const group = Array.from(parent.querySelectorAll(":scope > section.columns"));
    if (group.length === 0 || group[0] !== element) return;
    const row = group.map((section) => {
      const cellContent = [];
      const headingEl = section.querySelector("h2.section-title, h2");
      if (headingEl) {
        const textSpan = headingEl.querySelector(".text");
        const headingText = (textSpan ? textSpan.textContent : headingEl.textContent).trim();
        if (headingText) {
          const h2 = document.createElement("h2");
          h2.textContent = headingText;
          cellContent.push(h2);
        }
      }
      const articles = Array.from(section.querySelectorAll("article.item, article"));
      articles.forEach((article) => {
        const time = article.querySelector("time");
        if (time && time.textContent.trim()) {
          const p = document.createElement("p");
          p.textContent = time.textContent.trim();
          cellContent.push(p);
        }
        const itemHeading = article.querySelector("h3, h4");
        const itemLink = itemHeading ? itemHeading.querySelector("a") : null;
        if (itemLink && itemLink.getAttribute("href")) {
          const h3 = document.createElement("h3");
          const a = document.createElement("a");
          a.setAttribute("href", itemLink.getAttribute("href"));
          a.textContent = itemLink.textContent.trim();
          h3.appendChild(a);
          cellContent.push(h3);
        } else if (itemHeading && itemHeading.textContent.trim()) {
          const h3 = document.createElement("h3");
          h3.textContent = itemHeading.textContent.trim();
          cellContent.push(h3);
        }
        const summary = article.querySelector("p");
        if (summary && summary.textContent.trim()) {
          const p = document.createElement("p");
          p.textContent = summary.textContent.trim();
          cellContent.push(p);
        }
      });
      const viewAll = section.querySelector('a.link--more, a[class*="more"]');
      if (viewAll && viewAll.getAttribute("href")) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.setAttribute("href", viewAll.getAttribute("href"));
        a.textContent = viewAll.textContent.trim();
        p.appendChild(a);
        cellContent.push(p);
      }
      return cellContent;
    });
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-newsroom", cells });
    element.replaceWith(block);
    group.slice(1).forEach((el) => el.remove());
  }

  // tools/importer/transformers/mom-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        // "Take a short tour" overlay + step popover (body-level, cleaned.html L745, L754)
        "div.trip-overlay",
        "div.trip-block",
        // Scam-alert notification bar (cleaned.html L127)
        "div.HomePageLocalNotification",
        // Legacy TLS browser-support dialog (cleaned.html L16)
        "#dialog",
        // Skip-navigation accessibility link (cleaned.html L29)
        "div.skip-navigation",
        // Hidden ASP.NET WebForms state fields (cleaned.html L5, L10)
        "div.aspNetHidden",
        // Stray hidden inputs left directly on the form (cleaned.html L14-L15)
        "#wogaEnabledFlag",
        "#globalnotification_1_textBrowser",
        // WOG sentiments web component appended after the form (cleaned.html L743)
        "wog-sentiments",
        // Hotjar safe-context iframe/link (leaks an about:blank "_hjSafeContext" link)
        'iframe[title="_hjSafeContext"]',
        "#_hjSafeContext_86",
        'iframe[src="about:blank"]'
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Site header: SG masthead + logo/login/search bar (cleaned.html L40-L69)
        "header.topbar",
        // Mobile header nav + inline search bar duplicate (cleaned.html L70-L124)
        "div.hide-in-desktop",
        // Empty utility bar left by the top-bar template (cleaned.html L33)
        "div.menu-holder",
        // Entire primary-navigation band — instrumented as the site header
        // (blocks/header), so it must not also appear as body content.
        "#primary-navigation",
        // Popular-keyword hint paragraph tied to the masthead search widget
        // (cleaned.html L304)
        "#popular-keyword-content",
        // "Share this page" widget + last-updated block (cleaned.html L598)
        "div.module-share",
        // Empty awards section (cleaned.html L642)
        "#homeawards_0_DivCode",
        // Footer region handled by footer instrumentation (cleaned.html L659)
        "#footer_0_DivCode",
        "footer",
        // Non-authorable leftover elements
        "link",
        "noscript",
        "style",
        "script"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("onclick");
        el.removeAttribute("data-track");
      });
    }
  }

  // tools/importer/transformers/mom-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const template = payload && payload.template;
      const sections = template && Array.isArray(template.sections) ? template.sections : [];
      if (!sections.length) return;
      const doc = element.ownerDocument;
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section || !section.selector) continue;
        const target = element.querySelector(section.selector);
        if (!target) continue;
        if (section.style) {
          const metaBlock = WebImporter.Blocks.createBlock(doc, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          target.after(metaBlock);
        }
        if (i > 0) {
          target.before(doc.createElement("hr"));
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Ministry of Manpower homepage \u2014 masthead search, eServices quick guide tabs, highlights/spotlight banners, and latest announcements/press releases/speeches listing. The primary navigation band is instrumented as the site header, not imported as body content.",
    urls: [
      "https://www.mom.gov.sg/"
    ],
    blocks: [
      {
        name: "tabs-highlights",
        instances: ["#MainContent > div.ui-module.module-eservices div.quickGuideDiv"]
      },
      {
        name: "cards-spotlight",
        instances: ["#maincontent_0_homesmallspotlight_0_DivCode a.ui-banner"]
      },
      {
        name: "columns-newsroom",
        instances: ["#maincontent_0_homelatest_0_DivCode > div.row.content-highlights > section.columns"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Masthead welcome + search",
        selector: "#mainform > div.mom-masthead.searchbar-container",
        style: "highlight",
        blocks: ["search"],
        defaultContent: ["#mainform > div.mom-masthead.searchbar-container h1"]
      },
      {
        id: "section-3",
        name: "Highlights / eServices quick-guide tabs",
        selector: "#MainContent > div.ui-module.module-eservices",
        style: "highlight",
        blocks: ["tabs-highlights"],
        defaultContent: [
          "#MainContent > div.ui-module.module-eservices .quickGuideDiv > h2.section-title",
          "#MainContent > div.ui-module.module-eservices .quickGuideDiv > p"
        ]
      },
      {
        id: "section-4",
        name: "Spotlight banners",
        selector: "#maincontent_0_homesmallspotlight_0_DivCode",
        style: "grey",
        blocks: ["cards-spotlight"],
        defaultContent: []
      },
      {
        id: "section-5",
        name: "Latest Announcements / Press releases / Speeches",
        selector: "#maincontent_0_homelatest_0_DivCode",
        style: "grey",
        blocks: ["columns-newsroom"],
        defaultContent: []
      }
    ]
  };
  var parsers = {
    "tabs-highlights": parse2,
    "cards-spotlight": parse,
    "columns-newsroom": parse3
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\.html$/, "").replace(/\/$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath || "/index");
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
