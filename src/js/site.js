/* =====================================================================
   Elkon Products — site script
   Shared by the static mockup (index-v2.html) and the WP theme.
   Edit here, then run ./sync-theme.sh to copy into wp-theme/elkon/js/.

   The <head> must set html.js, plus html.motion when the user allows motion:
     <script>document.documentElement.classList.add('js');
       if(!matchMedia('(prefers-reduced-motion: reduce)').matches)
         document.documentElement.classList.add('motion');</script>
   ===================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var motionOK = root.classList.contains('motion');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  };
  // Analytics hooks: js/analytics.js listens for these (no-op if analytics is off)
  function emit(name, detail) {
    try { document.dispatchEvent(new CustomEvent('elkon:' + name, { detail: detail || {} })); } catch (e) {}
  }
  var arrow = '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="square" d="M13.5 4.5 21 12l-7.5 7.5M21 12H3"/></svg>';

  /* ---------- Nav: scrolled state ---------- */
  var nav = $('#nav');
  var hero = $('#hero');

  function onScroll() {
    var y = window.scrollY;
    // Pages without a hero (WP inner pages) keep a solid nav.
    if (nav) nav.classList.toggle('scrolled', !hero || y > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Nav: mobile menu ---------- */
  var toggle = $('#navToggle');
  var links = $('#navLinks');

  function setMenu(open) {
    if (!toggle || !links) return;
    links.classList.toggle('open', open);
    nav.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (toggle && links) {
    toggle.addEventListener('click', function () { setMenu(!links.classList.contains('open')); });
    $$('a', links).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('click', function (e) {
      if (links.classList.contains('open') && !nav.contains(e.target)) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) { setMenu(false); toggle.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 1024) setMenu(false); });
  }

  /* ---------- Headline line splitting ---------- */
  $$('[data-split]').forEach(function (el) {
    var parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map(function (p, i) {
      return '<span class="line" style="--i:' + i + '"><span>' + p.trim() + '</span></span>';
    }).join('');
  });

  /* ---------- Stagger: children of [data-stagger] get increasing delays ---------- */
  function applyStagger(container) {
    var step = parseInt(container.getAttribute('data-stagger'), 10) || 90;
    $$('[data-reveal]', container).forEach(function (el, i) {
      el.style.setProperty('--delay', (i * step) + 'ms');
    });
  }
  $$('[data-stagger]').forEach(applyStagger);

  /* ---------- Reveal observer ---------- */
  var revealObserver = null;
  if (motionOK && 'IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var t = entry.target;
          if (t.getAttribute('data-reveal') !== 'clip') t.classList.add('in');
          // Clip reveals are triggered via their parent (see observeReveal)
          $$('[data-reveal="clip"]', t).forEach(function (c) {
            if (c.parentElement === t) c.classList.add('in');
          });
          revealObserver.unobserve(t);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  }
  function observeReveal(el) {
    if (!revealObserver) { el.classList.add('in'); return; }
    // A fully clipped element never registers as intersecting in Chrome,
    // so watch its parent and reveal the clip from there.
    if (el.getAttribute('data-reveal') === 'clip') revealObserver.observe(el.parentElement);
    else revealObserver.observe(el);
  }
  $$('[data-reveal], [data-split], .coverage-map').forEach(observeReveal);

  /* ---------- Hero parallax (transform only, capped) ---------- */
  var heroImg = $('.hero-media img');
  if (motionOK && heroImg && hero) {
    var ticking = false;
    var settled = false;
    heroImg.addEventListener('animationend', function () { settled = true; heroImg.style.animation = 'none'; update(); });
    function update() {
      ticking = false;
      if (!settled) return;
      var y = window.scrollY;
      if (y > hero.offsetHeight) return;
      heroImg.style.transform = 'translate3d(0,' + Math.round(y * 0.12) + 'px,0)';
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
  }

  /* ---------- Counters (run once, tabular digits) ---------- */
  $$('[data-count]').forEach(function (el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (!motionOK || !('IntersectionObserver' in window)) { el.textContent = target.toLocaleString(); return; }
    el.textContent = '0';
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      var start = performance.now();
      var dur = 1100;
      (function tick(now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
      })(start);
    }, { threshold: 0.6 });
    io.observe(el);
  });

  /* ---------- Projects + modal ---------- */
  var projects = [];
  var dataEl = $('#projects-data');
  if (dataEl) { try { projects = JSON.parse(dataEl.textContent); } catch (e) { projects = []; } }
  var projectGrid = $('.project-grid');

  if (projectGrid && projects.length) {
    projects.forEach(function (p, i) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'project-card';
      card.setAttribute('data-reveal', '');
      card.style.setProperty('--delay', ((i % 2) * 90) + 'ms');
      card.setAttribute('aria-haspopup', 'dialog');
      card.innerHTML =
        '<div class="project-card-image">' +
          '<img src="' + esc(p.img) + '" alt="' + esc(p.alt || p.title) + '" loading="lazy" decoding="async" width="900" height="600">' +
          '<span class="img-tag mono">' + esc(p.badge) + '</span>' +
        '</div>' +
        '<div class="project-card-body">' +
          '<h3>' + esc(p.title) + '</h3>' +
          '<span class="project-loc mono">' + esc(p.loc) + '</span>' +
          '<p>' + esc(p.teaser) + '</p>' +
          '<span class="card-cta">Project details ' + arrow + '</span>' +
        '</div>';
      card.addEventListener('click', function () { openModal(p, card); });
      projectGrid.appendChild(card);
      observeReveal(card);
    });
  }

  var modal = $('#projectModal');
  var modalBody = $('#modalBody');
  var lastFocus = null;
  var savedScroll = 0;

  function focusables() {
    return $$('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', modal)
      .filter(function (el) { return el.offsetParent !== null; });
  }

  function openModal(p, trigger) {
    if (!modal) return;
    lastFocus = trigger || document.activeElement;
    emit('project-open', { title: p.title });
    modalBody.innerHTML =
      '<img class="modal-hero-img" src="' + esc(p.imgLarge || p.img) + '" alt="' + esc(p.alt || p.title) + '">' +
      '<div class="modal-text">' +
        '<span class="img-tag mono">' + esc(p.badge) + '</span>' +
        '<h3 id="modalTitle">' + esc(p.title) + '</h3>' +
        '<span class="project-loc mono">' + esc(p.loc) + '</span>' +
        (p.long || []).map(function (par) { return '<p>' + esc(par) + '</p>'; }).join('') +
        (p.stats && p.stats.length ? '<div class="modal-stats">' + p.stats.map(function (s) {
          return '<div><div class="modal-stat-num">' + esc(s[0]) + '</div><div class="modal-stat-label mono">' + esc(s[1]) + '</div></div>';
        }).join('') + '</div>' : '') +
        (p.gallery && p.gallery.length > 1 ? '<div class="modal-gallery">' + p.gallery.map(function (g) {
          return '<img src="' + esc(g) + '" alt="' + esc(p.title) + ', additional view" loading="lazy">';
        }).join('') + '</div>' : '') +
        '<p style="margin-top:2rem"><a class="btn btn-orange" href="#contact" data-close-then>Working on something like this? Get a quote ' + arrow + '</a></p>' +
      '</div>';

    // Lock background scroll (iOS-safe)
    savedScroll = window.scrollY;
    document.body.style.top = (-savedScroll) + 'px';
    document.body.classList.add('modal-open');

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    $('.project-modal-content', modal).scrollTop = 0;
    setTimeout(function () { var c = $('.project-modal-close', modal); if (c) c.focus(); }, 50);

    var ctaLink = $('[data-close-then]', modal);
    if (ctaLink) ctaLink.addEventListener('click', function (e) {
      e.preventDefault();
      closeModal(true);
      var target = $('#contact');
      if (target) target.scrollIntoView({ behavior: motionOK ? 'smooth' : 'auto' });
    });
  }

  function closeModal(skipFocus) {
    if (!modal || !modal.classList.contains('open')) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    document.body.style.top = '';
    window.scrollTo(0, savedScroll);
    if (!skipFocus && lastFocus) lastFocus.focus();
  }

  if (modal) {
    $$('[data-modal-close]', modal).forEach(function (el) { el.addEventListener('click', function () { closeModal(); }); });
    document.addEventListener('keydown', function (e) {
      if (!modal.classList.contains('open')) return;
      if (e.key === 'Escape') { closeModal(); return; }
      if (e.key === 'Tab') {
        var f = focusables();
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Quote form helpers ---------- */
  var form = $('#quoteForm');

  function preselectProduct(value) {
    if (!form || !value) return;
    var input = form.querySelector('input[name="product[]"][value="' + value + '"]');
    if (input) input.checked = true;
  }

  // Product cards link to the form with the product preselected
  $$('[data-product]').forEach(function (a) {
    a.addEventListener('click', function () { preselectProduct(a.getAttribute('data-product')); });
  });

  /* ---------- Dosage calculator ---------- */
  var dosageRanges = {
    general: [5, 8], marine: [8, 10], bridge: [7, 9],
    shotcrete: [8, 12], uhpc: [15, 25], oilwell: [10, 15]
  };
  var calcBtn = $('#calcBtn');
  var lastCalc = null;

  if (calcBtn) {
    calcBtn.addEventListener('click', function () {
      var appSel = $('#application');
      var app = appSel.value;
      var volume = parseFloat($('#volume').value);
      var cement = parseFloat($('#cement').value);
      if (!volume || !cement) { $('#volume').focus(); return; }

      var range = dosageRanges[app];
      var mid = (range[0] + range[1]) / 2;
      var totalKg = Math.round(volume * cement * (mid / 100));
      var sacks = Math.ceil(totalKg / 1000);
      var tonnes = (totalKg / 1000).toFixed(1);

      $('#dosageRate').innerHTML = range[0] + '–' + range[1] + '<span class="unit">%</span>';
      $('#totalKg').innerHTML = totalKg.toLocaleString() + '<span class="unit">kg</span>';
      $('#sacks').textContent = sacks;
      $('#tonnes').innerHTML = tonnes + '<span class="unit">t</span>';

      lastCalc = { app: appSel.options[appSel.selectedIndex].text, volume: volume, tonnes: tonnes, oil: app === 'oilwell' };
      emit('calculated', { application: app });

      var quoteBtn = $('#calcQuoteBtn');
      if (quoteBtn) quoteBtn.hidden = false;

      var result = $('#calcResult');
      result.classList.remove('calc-flash');
      void result.offsetWidth;
      result.classList.add('calc-flash');
    });
  }

  var calcQuoteBtn = $('#calcQuoteBtn');
  if (calcQuoteBtn) {
    calcQuoteBtn.addEventListener('click', function () {
      if (!form || !lastCalc) return;
      var qty = form.querySelector('[name="quantity"]');
      var msg = form.querySelector('[name="message"]');
      if (qty && !qty.value) qty.value = '~' + lastCalc.tonnes + ' t';
      if (msg && !msg.value) msg.value = 'From the dosage calculator: ' + lastCalc.app + ', ' + lastCalc.volume + ' m³, approx. ' + lastCalc.tonnes + ' tonnes.';
      preselectProduct(lastCalc.oil ? 'undensified' : 'densified');
    });
  }

  /* ---------- Quote form submit ---------- */
  if (form) {
    var status = $('#formStatus');
    var params = new URLSearchParams(window.location.search);
    if (params.get('quote') === 'sent') emit('quote-sent', {});
    if (status && params.get('quote') === 'sent') {
      status.hidden = false; status.className = 'form-status ok';
      status.textContent = 'Thanks. Your request is in. We’ll call or email you shortly.';
    } else if (status && params.get('quote') === 'error') {
      status.hidden = false; status.className = 'form-status err';
      status.textContent = 'Something went wrong sending your request. Please call us instead.';
    }

    // Static mockup: no backend. Validate and show a success message.
    if (form.hasAttribute('data-static')) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        var btn = form.querySelector('[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Sending…';
        setTimeout(function () {
          emit('quote-sent', { mockup: true });
          form.reset();
          btn.disabled = false;
          btn.textContent = 'Send Quote Request';
          if (status) {
            status.hidden = false; status.className = 'form-status ok';
            status.textContent = 'Mockup only: this form is not connected yet. On the live site this request would be emailed to Elkon.';
          }
        }, 600);
      });
    } else {
      form.addEventListener('submit', function () {
        var btn = form.querySelector('[type="submit"]');
        if (btn && form.checkValidity()) { btn.disabled = true; btn.textContent = 'Sending…'; }
      });
    }
  }

  /* ---------- Footer year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
