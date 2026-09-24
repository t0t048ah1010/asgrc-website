/* ==========================================================================
   ASGRC — "Hermès" Redesign · main.js
   Vanilla JS. No dependencies. Progressive enhancement only —
   every page remains fully usable with JavaScript disabled.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     1 · Sticky header state (transparent → frosted on scroll)
  ------------------------------------------------------------------ */
  var header = document.querySelector('[data-header]');

  if (header) {
    var setHeaderState = function () {
      header.classList.toggle('is-solid', window.scrollY > 24);
    };
    setHeaderState();
    window.addEventListener('scroll', setHeaderState, { passive: true });
  }

  /* ------------------------------------------------------------------
     2 · Mobile menu (hamburger → fullscreen overlay)
  ------------------------------------------------------------------ */
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');

  if (menuToggle && menu) {
    var setMenuOpen = function (open) {
      document.documentElement.classList.toggle('has-menu-open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-hidden', String(!open));
    };

    menuToggle.addEventListener('click', function () {
      setMenuOpen(!document.documentElement.classList.contains('has-menu-open'));
    });

    /* Close after tapping any link inside the menu */
    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenuOpen(false);
    });

    /* Close on Escape */
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setMenuOpen(false);
    });
  }

  /* ------------------------------------------------------------------
     3 · Reveal-on-scroll (IntersectionObserver)
  ------------------------------------------------------------------ */
  var revealEls = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ------------------------------------------------------------------
     4 · Stat count-up (markup keeps final value — JS only animates)
  ------------------------------------------------------------------ */
  var counters = document.querySelectorAll('[data-count]');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (counters.length && !reducedMotion && 'IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countObserver.unobserve(entry.target);

        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        var duration = 1400;
        var start = null;

        var tick = function (timestamp) {
          if (start === null) start = timestamp;
          var progress = Math.min((timestamp - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3); /* easeOutCubic */
          el.textContent = String(Math.round(target * eased));
          if (progress < 1) window.requestAnimationFrame(tick);
        };
        window.requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });

    counters.forEach(function (el) { countObserver.observe(el); });
  }

  /* ------------------------------------------------------------------
     5 · Project grid filters (projects / portfolio pages)
         Cards carry space-separated tokens, e.g. data-category="emaar commercial"
  ------------------------------------------------------------------ */
  var filterGroup = document.querySelector('[data-filter-group]');

  if (filterGroup) {
    var filterButtons = filterGroup.querySelectorAll('[data-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-category]'));

    var applyFilter = function (filter) {
      var visibleIndex = 0;

      cards.forEach(function (card) {
        var categories = (card.getAttribute('data-category') || '').split(/\s+/);
        var show = filter === 'all' || categories.indexOf(filter) !== -1;

        card.classList.toggle('is-hidden', !show);
        card.classList.remove('card-in');

        if (show) {
          card.style.setProperty('--i', String(visibleIndex++));
          void card.offsetWidth; /* restart the entry animation */
          card.classList.add('card-in');
        }
      });
    };

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        filterButtons.forEach(function (other) {
          var active = other === button;
          other.classList.toggle('is-active', active);
          other.setAttribute('aria-pressed', String(active));
        });
        applyFilter(button.getAttribute('data-filter'));
      });
    });

    applyFilter('all'); /* initial staggered entrance */
  }

  /* ------------------------------------------------------------------
     6 · Footer year
  ------------------------------------------------------------------ */
  var yearEls = document.querySelectorAll('[data-year]');
  yearEls.forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
