# MOM.gov.sg Homepage Migration Plan

## Objective
Perform a **full migration** of the Singapore Ministry of Manpower homepage (`https://www.mom.gov.sg/`) into this AEM Edge Delivery Services project — scraping the source, analyzing its structure, building reusable import infrastructure, importing the content, styling the blocks to visually match the original, **and instrumenting the global header (navigation) and footer**.

## Target
- **Source URL:** `https://www.mom.gov.sg/`
- **Scope:** Full page migration (structure + content + design) **plus header/navigation and footer**
- **Project:** `sheongperk-mom-20260804` (fresh EDS boilerplate — standard block set present: hero, cards, columns, carousel, tabs, accordion, header, footer, etc.)

## Approach
The migration is orchestrated end-to-end by the site-migration workflow, which coordinates scraping, page analysis, block mapping, import infrastructure generation, content import, and visual styling. The homepage body runs as a single-page migration. The **header/navigation** and **footer** are instrumented separately using their dedicated orchestrators (which rely on screenshots and per-element behavior mapping) and then wired into the site.

## Checklist

- [ ] **Determine project type & block palette** — confirm doc/da/xwalk project type and the available block library endpoint for this project.
- [ ] **Scrape the homepage** — capture `https://www.mom.gov.sg/`: metadata, cleaned HTML, screenshots, and download images.
- [ ] **Analyze page structure** — identify section boundaries, content sequences, authoring decisions (default content vs. blocks), and required block variants.
- [ ] **Survey/select blocks** — match sections to existing blocks (hero, cards, columns, carousel, etc.); flag any new variants that need to be created.
- [ ] **Map blocks** — record DOM selectors for each block variant in `page-templates.json`.
- [ ] **Generate import infrastructure** — create block parsers and page transformers under `tools/importer/`.
- [ ] **Build & run the import script** — bundle the parsers/transformers and run the bulk import to produce the page content (no hand-written HTML).
- [ ] **Preview & verify content** — render the imported page in the local preview and compare structure against the original.
- [ ] **Migrate design/styling** — extract computed styles from the source and apply EDS-ready CSS so blocks match the original appearance.
- [ ] **Instrument the header / navigation** — extract the MOM top navigation (menus, links, any mega-menu/dropdown and mobile behavior) via the navigation orchestrator and build the EDS header.
- [ ] **Instrument the footer** — extract the MOM footer structure (link groups, social, legal/contact) via the footer orchestrator and build the EDS footer.
- [ ] **Visual critique & fixes** — full-page comparison against the original (including header and footer); iterate on styling until it matches.
- [ ] **Final review** — confirm the migrated homepage, header, and footer render correctly and report results.

## Notes & Considerations
- **Header & footer included:** Per confirmation, global navigation and footer are part of this pass. They are handled after the body content is imported, since accurate instrumentation depends on screenshots and hover/click behavior from the live site.
- **Optional plugins:** Commerce, Forms, and Project-Management plugins are available but **not required** for a standard content homepage. If the homepage contains a significant form (e.g., search/subscribe), enabling the Forms plugin may improve fidelity — I'll confirm before enabling anything.
- **Content generation rule:** All page HTML will be produced via the generated import script, never authored by hand.

> **Execution note:** This plan requires **Execute mode** to run (scraping, infrastructure generation, import, styling, and header/footer instrumentation all modify files). Approve the plan to proceed.
