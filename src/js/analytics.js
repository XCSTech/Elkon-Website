/* =====================================================================
   Elkon Products: analytics (Microsoft Clarity + Plausible)
   Shared by the static mockup and the WP theme (copied by sync-theme.sh).

   Configure BEFORE this file loads:
     window.ELKON_ANALYTICS = {
       clarityId: 'abcd1234ef',          // Clarity > Settings > Overview > Project ID
       plausibleDomain: 'elkonproducts.com'  // exactly as entered in Plausible
     };
   Empty values = that service is not loaded. Both empty = this file does nothing.

   What each tool gives you:
   - Clarity: real-user Core Web Vitals (Performance tab), session recordings,
     heatmaps, scroll depth, rage/dead clicks. Custom events below appear as
     "Custom tags" you can filter recordings by.
   - Plausible: traffic, sources, pages, devices, plus the goals below.
     Add each event name as a Custom Event goal in Plausible to see it.
     Outbound links and file downloads (PDF spec sheets) are tracked automatically.

   Custom events
     Phone Click        { location: header | hero | contact | footer | page }
     Email Click        { location }
     Quote Request      quote form submitted successfully
     Product CTA        { product: densified | undensified }
     Calculator Used    { application }
     Calculator Quote   "Quote this order" clicked after calculating
     Project Viewed     { project }
   ===================================================================== */
(function () {
  'use strict';

  var cfg = window.ELKON_ANALYTICS || {};
  var clarityId = (cfg.clarityId || '').trim();
  var plausibleDomain = (cfg.plausibleDomain || '').trim();
  if (!clarityId && !plausibleDomain) return;

  /* ---------- Plausible ---------- */
  if (plausibleDomain) {
    window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments); };
    var p = document.createElement('script');
    p.defer = true;
    p.setAttribute('data-domain', plausibleDomain);
    // Extensions: outbound link clicks + file downloads (PDF etc.) tracked automatically
    p.src = 'https://plausible.io/js/script.file-downloads.outbound-links.js';
    document.head.appendChild(p);
  }

  /* ---------- Microsoft Clarity (official snippet) ---------- */
  if (clarityId) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', clarityId);
  }

  /* ---------- One function to send to both ---------- */
  function track(name, props) {
    props = props || {};
    if (plausibleDomain && window.plausible) window.plausible(name, { props: props });
    if (clarityId && window.clarity) {
      window.clarity('event', name);
      Object.keys(props).forEach(function (k) { window.clarity('set', k, String(props[k])); });
    }
  }
  window.elkonTrack = track;

  function where(el) {
    if (el.closest('header')) return 'header';
    if (el.closest('.hero')) return 'hero';
    if (el.closest('#contact')) return 'contact';
    if (el.closest('footer')) return 'footer';
    return 'page';
  }

  /* ---------- Clicks (delegated, so it also catches JS-built content) ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0) track('Phone Click', { location: where(a) });
    else if (href.indexOf('mailto:') === 0) track('Email Click', { location: where(a) });
    else if (a.hasAttribute('data-product')) track('Product CTA', { product: a.getAttribute('data-product') });
    else if (a.id === 'calcQuoteBtn') track('Calculator Quote');
  }, true);

  /* ---------- Hooks emitted by site.js ---------- */
  document.addEventListener('elkon:quote-sent', function (e) {
    if (e.detail && e.detail.mockup) return; // the static mockup's fake submit isn't a real lead
    track('Quote Request');
  });
  document.addEventListener('elkon:calculated', function (e) { track('Calculator Used', { application: e.detail.application }); });
  document.addEventListener('elkon:project-open', function (e) { track('Project Viewed', { project: e.detail.title }); });
})();
