/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: mom.gov.sg site-wide cleanup.
 *
 * Removes non-authorable site chrome so the import contains only page-level
 * authorable content (masthead search/welcome, primary-nav quick-link cards,
 * eServices quick-guide tabs, spotlight banners, latest news listing).
 *
 * ALL selectors below were verified against migration-work/cleaned.html.
 * Header (SG masthead + primary nav megamenu), footer, and the SearchSG
 * masthead widget are handled separately by navigation/footer instrumentation.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Overlays / notifications / interstitials that would otherwise interfere
    // with block parsing or leak into body content.
    WebImporter.DOMUtils.remove(element, [
      // "Take a short tour" overlay + step popover (body-level, cleaned.html L745, L754)
      'div.trip-overlay',
      'div.trip-block',
      // Scam-alert notification bar (cleaned.html L127)
      'div.HomePageLocalNotification',
      // Legacy TLS browser-support dialog (cleaned.html L16)
      '#dialog',
      // Skip-navigation accessibility link (cleaned.html L29)
      'div.skip-navigation',
      // Hidden ASP.NET WebForms state fields (cleaned.html L5, L10)
      'div.aspNetHidden',
      // Stray hidden inputs left directly on the form (cleaned.html L14-L15)
      '#wogaEnabledFlag',
      '#globalnotification_1_textBrowser',
      // WOG sentiments web component appended after the form (cleaned.html L743)
      'wog-sentiments',
      // Hotjar safe-context iframe/link (leaks an about:blank "_hjSafeContext" link)
      'iframe[title="_hjSafeContext"]',
      '#_hjSafeContext_86',
      'iframe[src="about:blank"]',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome (header, footer, navigation shells).
    WebImporter.DOMUtils.remove(element, [
      // Site header: SG masthead + logo/login/search bar (cleaned.html L40-L69)
      'header.topbar',
      // Mobile header nav + inline search bar duplicate (cleaned.html L70-L124)
      'div.hide-in-desktop',
      // Empty utility bar left by the top-bar template (cleaned.html L33)
      'div.menu-holder',
      // Entire primary-navigation band — instrumented as the site header
      // (blocks/header), so it must not also appear as body content.
      '#primary-navigation',
      // Popular-keyword hint paragraph tied to the masthead search widget
      // (cleaned.html L304)
      '#popular-keyword-content',
      // "Share this page" widget + last-updated block (cleaned.html L598)
      'div.module-share',
      // Empty awards section (cleaned.html L642)
      '#homeawards_0_DivCode',
      // Footer region handled by footer instrumentation (cleaned.html L659)
      '#footer_0_DivCode',
      'footer',
      // Non-authorable leftover elements
      'link',
      'noscript',
      'style',
      'script',
    ]);

    // Attribute cleanup on remaining authorable elements.
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('data-track');
    });
  }
}
