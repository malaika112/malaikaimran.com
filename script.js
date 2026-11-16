(function () {
  'use strict';

  // Clickjacking defence: GitHub Pages cannot send X-Frame-Options / frame-ancestors headers,
  // so refuse to run inside a frame on another site.
  if (window.top !== window.self) {
    try { window.top.location = window.self.location.href; } catch (e) { document.documentElement.hidden = true; }
    return;
  }

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Theme toggle
  var themeBtn = document.getElementById('theme-toggle');
  function currentTheme() {
    var set = root.getAttribute('data-theme');
    if (set) return set;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  themeBtn.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  // Mobile menu
  var menuBtn = document.getElementById('menu-toggle');
  var links = document.getElementById('nav-links');
  function closeMenu() {
    links.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
  }
  menuBtn.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  links.addEventListener('click', function (e) { if (e.target.tagName === 'A') closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', function (e) {
    if (links.classList.contains('open') && !links.contains(e.target) && !menuBtn.contains(e.target)) closeMenu();
  });

  // Scroll: nav border, progress bar, back-to-top
  var nav = document.querySelector('.nav');
  var progress = document.getElementById('progress');
  var toTop = document.getElementById('to-top');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle('scrolled', y > 8);
    progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    toTop.classList.toggle('show', y > 700);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  // Active section in nav
  var navLinks = Array.prototype.slice.call(links.querySelectorAll('a[href^="#"]'));
  var sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = '#' + entry.target.id;
          navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  // Reveal on scroll
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('visible'); });
  }

  // Timeline line draws in when the experience list comes into view
  var timeline = document.getElementById('timeline');
  if (timeline) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      var tlObs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { timeline.classList.add('drawn'); tlObs.disconnect(); }
      }, { threshold: 0.15 });
      tlObs.observe(timeline);
    } else {
      timeline.classList.add('drawn');
    }
  }

  // Count-up numbers. The final value is already in the HTML (works without JS);
  // this only animates from 0 to that exact value once it scrolls into view.
  var counters = document.querySelectorAll('[data-count]');
  function countUp(el) {
    var raw = el.getAttribute('data-count');
    var target = parseFloat(raw);
    var decimals = (raw.split('.')[1] || '').length;
    var suffix = el.getAttribute('data-suffix') || '';
    var final = target.toFixed(decimals) + suffix;
    if (isNaN(target)) return;
    var start = null, duration = 1300;
    function step(ts) {
      if (start === null) start = ts;
      var k = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - k, 3);
      el.textContent = k < 1 ? (target * eased).toFixed(decimals) + suffix : final;
      if (k < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }
  if (counters.length && 'IntersectionObserver' in window && !reduceMotion) {
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { countUp(entry.target); cObs.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cObs.observe(el); });
  }

  // Experience filters
  var filterBtns = document.querySelectorAll('.filter');
  var timelineItems = document.querySelectorAll('#timeline li');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      filterBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      timelineItems.forEach(function (li) {
        var show = f === 'all' || li.getAttribute('data-type') === f;
        li.classList.toggle('is-hidden', !show);
        if (show) li.classList.add('visible');
      });
    });
  });

  // Copy email
  var copyBtn = document.getElementById('copy-email');
  if (copyBtn) {
    var label = copyBtn.querySelector('span');
    copyBtn.addEventListener('click', function () {
      var email = copyBtn.getAttribute('data-email');
      function done(ok) {
        label.textContent = ok ? 'Copied!' : email;
        copyBtn.classList.toggle('copied', ok);
        setTimeout(function () { label.textContent = 'Copy email'; copyBtn.classList.remove('copied'); }, 2000);
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(function () { done(true); }, function () { done(false); });
      } else {
        done(false);
      }
    });
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
