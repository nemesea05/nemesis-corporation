(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const root = document.documentElement;
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = () => window.matchMedia('(min-width: 861px)').matches;

  const DIVISIONS = {
    holdings: { name: 'NEM Holdings', line: 'Finance and investments for the group.' },
    ventures: { name: 'NEM Ventures', line: 'Partnerships, venture building, and co-creation.' },
    media: { name: 'NEM Media', line: 'Communications, content, and public relations.' },
    technologies: { name: 'NEM Technologies', line: 'Technology and digital transformation for the group.' }
  };

  /* ==================================================================
     Splash screens
       Home page:      the logo, once per browser session (add ?splash to replay).
       Division pages: the logo, then the chosen division's shape is picked out.
                       Plays whenever the page is opened by navigating to it.
  ================================================================== */
  function runSplash({ selector, activeClass, showMs, remember }) {
    const splash = $(selector);
    if (!splash) return;

    if (!root.classList.contains(activeClass)) {
      splash.remove();
      return;
    }

    const SHOW = prefersReducedMotion() ? 500 : showMs;   // how long the splash stays (ms)
    const MAX = showMs + 2500;                             // never wait longer than this (ms)
    const start = performance.now();
    let loaded = document.readyState === 'complete';
    let finished = false;

    window.addEventListener('load', () => { loaded = true; });

    const finish = () => {
      if (finished) return;
      finished = true;
      if (remember) { try { sessionStorage.setItem(remember, '1'); } catch (e) { /* storage unavailable */ } }
      root.classList.remove(activeClass);            // lets the hero shapes assemble as the curtain lifts
      splash.classList.add('is-leaving');
      splash.addEventListener('transitionend', (e) => { if (e.target === splash) splash.remove(); });
      setTimeout(() => splash.remove(), 1600);       // safety net
    };

    const check = () => {
      if (finished) return;
      const elapsed = performance.now() - start;
      if ((loaded && elapsed >= SHOW) || elapsed >= MAX) finish();
      else setTimeout(check, 100);
    };

    splash.addEventListener('click', finish);        // click anywhere to skip
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') finish(); });
    check();
  }

  /* ==================================================================
     Global listeners (bound once)
  ================================================================== */
  const setNav = (open) => {
    const nav = $('#site-nav');
    const toggle = $('.nav-toggle');
    if (!nav || !toggle) return;
    nav.dataset.open = String(open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  document.addEventListener('keydown', (event) => {
    const toggle = $('.nav-toggle');
    if (event.key === 'Escape' && toggle && toggle.getAttribute('aria-expanded') === 'true') {
      setNav(false);
      toggle.focus();
    }
  });

  window.matchMedia('(min-width: 861px)').addEventListener('change', (event) => {
    if (event.matches) setNav(false);
  });

  /* ==================================================================
     Dropdown menus: every top-level item has one.
     Opens on hover (mouse) or click / Enter (touch, keyboard). One at a time.
  ================================================================== */
  function initMenus() {
    const items = $$('.has-menu');

    items.forEach((item) => {
      if (item.dataset.ready) return;
      item.dataset.ready = 'true';

      const btn = $('.menu-btn', item);
      let timer = null;

      const set = (open) => {
        if (open) items.forEach((other) => {
          if (other !== item && other.classList.contains('is-open')) {
            other.classList.remove('is-open');
            $('.menu-btn', other).setAttribute('aria-expanded', 'false');
          }
        });
        item.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', String(open));
      };

      btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));

      item.addEventListener('pointerenter', (event) => {
        if (event.pointerType !== 'mouse' || !isDesktop()) return;
        clearTimeout(timer);
        set(true);
      });
      item.addEventListener('pointerleave', (event) => {
        if (event.pointerType !== 'mouse' || !isDesktop()) return;
        timer = setTimeout(() => set(false), 140);
      });
      item.addEventListener('focusout', (event) => {
        if (!item.contains(event.relatedTarget)) set(false);
      });
      item.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
          event.stopPropagation();
          set(false);
          btn.focus();
        }
      });
      item.addEventListener('click', (event) => {
        if (event.target.closest('.mega a')) set(false);
      });
      document.addEventListener('pointerdown', (event) => {
        if (!item.contains(event.target)) set(false);
      });
    });
  }

  /* ==================================================================
     Page behaviour (safe to call again if the page content is swapped)
  ================================================================== */
  let sectionObserver = null;
  let revealObserver = null;

  function init() {
    /* ---------- Footer year ---------- */
    const yearEl = $('#year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- Portrait: fall back to the monogram if no photo exists ---------- */
    const portrait = $('.portrait-frame img');
    if (portrait) {
      portrait.addEventListener('error', () => portrait.remove());
      if (portrait.complete && portrait.naturalWidth === 0 && portrait.getAttribute('loading') !== 'lazy') {
        portrait.remove();
      }
    }

    /* ---------- Mobile navigation ---------- */
    const nav = $('#site-nav');
    const toggle = $('.nav-toggle');
    if (nav && toggle) {
      toggle.addEventListener('click', () => {
        setNav(toggle.getAttribute('aria-expanded') !== 'true');
      });
      nav.addEventListener('click', (event) => {
        if (event.target.closest('a')) setNav(false);
      });
    }

    initMenus();

    /* ---------- Highlight the current section in the navigation (home page) ---------- */
    if (sectionObserver) sectionObserver.disconnect();
    const navButtons = new Map(
      $$('.menu-btn[data-section]')
        .filter((btn) => btn.getAttribute('aria-current') !== 'page')
        .map((btn) => [btn.dataset.section, btn])
    );
    const watched = ['top', ...navButtons.keys()]
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if ('IntersectionObserver' in window && watched.length) {
      sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            navButtons.forEach((btn) => btn.removeAttribute('aria-current'));
            const active = navButtons.get(entry.target.id);
            if (active) active.setAttribute('aria-current', 'true');
          });
        },
        { rootMargin: '-40% 0px -55% 0px' }
      );
      watched.forEach((section) => sectionObserver.observe(section));
    }

    /* ---------- Scroll reveal ---------- */
    if (revealObserver) revealObserver.disconnect();
    if ('IntersectionObserver' in window && !prefersReducedMotion()) {
      const targets = $$(
        '.about-grid > *, .split-head, .division, .leader-grid > *, .outlook-grid > *, ' +
        '.mandate-item, .initiative, .other, .entity, .pillar, .guidelines li'
      );
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-in');
            revealObserver.unobserve(entry.target);
          });
        },
        { rootMargin: '0px 0px -6% 0px', threshold: 0.06 }
      );
      targets.forEach((el) => {
        if (el.classList.contains('reveal')) return;
        const siblings = el.parentElement ? [...el.parentElement.children].filter((c) => targets.includes(c)) : [];
        el.style.setProperty('--rd', `${Math.max(siblings.indexOf(el), 0) * 0.08}s`);
        el.classList.add('reveal');
        revealObserver.observe(el);
      });
    }

    /* ---------- Emblem: point at a tile to preview a division, select it to open its page ---------- */
    const emblem = $('#emblem-wrap');
    const caption = $('#emblem-caption');

    if (emblem && caption) {
      const nameEl = $('.cap-name', caption);
      const lineEl = $('.cap-line', caption);
      const current = emblem.dataset.current || '';

      const DEFAULT = current
        ? { name: DIVISIONS[current].name, line: 'You are viewing this division. Select another tile to switch.' }
        : { name: 'NEM', line: 'Point to a tile to preview a division. Select it to open the profile.' };

      const show = (key) => {
        const target = DIVISIONS[key] ? key : current;
        const info = !target || target === current ? DEFAULT : DIVISIONS[target];
        if (target) emblem.dataset.active = target;
        else delete emblem.dataset.active;
        nameEl.textContent = info.name;
        lineEl.textContent = info.line;
      };

      $$('.tile', emblem).forEach((tile) => {
        const key = tile.dataset.division;
        tile.addEventListener('pointerenter', () => show(key));
        tile.addEventListener('focus', () => show(key));
        tile.addEventListener('pointerleave', () => show());
        tile.addEventListener('blur', () => show());
      });
    }
  }

  window.NEM_INIT = init;   // used by the single-file preview; harmless on a normal site
  runSplash({ selector: '#splash', activeClass: 'splashing', showMs: 2600, remember: 'nem-splash' });
  runSplash({ selector: '#dsplash', activeClass: 'div-splashing', showMs: 3500, remember: null });
  runSplash({ selector: '#csplash', activeClass: 'comm-splashing', showMs: 2300, remember: null });
  init();
})();
