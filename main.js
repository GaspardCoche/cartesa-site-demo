/* ===== CARTESA — Main JS (centralized) ===== */

(function() {
  'use strict';

  // Header scroll shadow
  var header = document.getElementById('siteHeader');
  if (header) {
    var ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          header.classList.toggle('scrolled', window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function() {
      links.classList.toggle('open');
    });
  }

  // Scroll reveal (all directions)
  var revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  var staggerEls = document.querySelectorAll('.reveal-stagger');
  if (revealEls.length || staggerEls.length) {
    var revealObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    revealEls.forEach(function(el) { revealObs.observe(el); });
    staggerEls.forEach(function(el) { revealObs.observe(el); });
  }

  // Counter animation
  function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
  function animateCounters(container) {
    container.querySelectorAll('[data-count]').forEach(function(el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      var duration = 2200, startTime = null;
      function step(ts) {
        if (!startTime) startTime = ts;
        var p = Math.min((ts - startTime) / duration, 1);
        el.textContent = Math.round(easeOutExpo(p) * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  document.querySelectorAll('[data-count]').forEach(function(el) {
    var c = el.closest('.hero-stats-bar, .page-hero-stats, .stat-row, .values-mosaic, .stat-banner, .impact-band');
    if (!c || c._cObs) return;
    c._cObs = true;
    new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) { animateCounters(c); e.target._cObs = null; }
      });
    }, { threshold: 0.3 }).observe(c);
  });

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(function(item) {
    var summary = item.querySelector('summary');
    var content = item.querySelector('p');
    if (!summary || !content) return;
    summary.addEventListener('click', function(e) {
      e.preventDefault();
      if (item.open) {
        content.style.maxHeight = content.scrollHeight + 'px';
        content.offsetHeight;
        content.style.maxHeight = '0';
        content.style.opacity = '0';
        content.style.paddingBottom = '0';
        setTimeout(function() { item.open = false; content.style.maxHeight = ''; content.style.opacity = ''; content.style.paddingBottom = ''; }, 250);
      } else {
        document.querySelectorAll('.faq-item[open]').forEach(function(o) {
          if (o !== item) {
            var p = o.querySelector('p');
            if (p) { p.style.maxHeight = '0'; p.style.opacity = '0'; }
            setTimeout(function() { o.open = false; if (p) { p.style.maxHeight = ''; p.style.opacity = ''; } }, 200);
          }
        });
        item.open = true;
        content.style.maxHeight = '0';
        content.style.opacity = '0';
        content.offsetHeight;
        content.style.transition = 'max-height 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease, padding 0.3s ease';
        content.style.maxHeight = content.scrollHeight + 'px';
        content.style.opacity = '1';
      }
    });
  });

  // Sticky CTA
  var marker = document.getElementById('scrollMarker');
  var stickyCta = document.getElementById('stickyCta');
  if (marker && stickyCta) {
    new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        stickyCta.classList.toggle('visible', !e.isIntersecting && e.boundingClientRect.top < 0);
      });
    }, { threshold: 0 }).observe(marker);
  }

  // ===== VOLETS HORIZONTAUX =====
  var voletsWrap = document.querySelector('.volets-wrap');
  var voletsTrack = document.querySelector('.volets-track');
  var voletItems = document.querySelectorAll('.volet');
  var voletDots = document.querySelectorAll('.volet-dot');

  if (voletsWrap && voletsTrack && voletItems.length) {
    var panelCount = voletItems.length;
    var lastIndex = -1;

    function updateVolets() {
      var rect = voletsWrap.getBoundingClientRect();
      var scrolled = -rect.top;
      var total = voletsWrap.offsetHeight - window.innerHeight;
      if (scrolled < 0 || total <= 0) return;
      var progress = Math.max(0, Math.min(1, scrolled / total));
      var idx = Math.min(panelCount - 1, Math.floor(progress * panelCount));

      if (idx !== lastIndex) {
        lastIndex = idx;
        voletsTrack.style.transform = 'translateX(-' + (idx * (100 / panelCount)) + '%)';
        voletItems.forEach(function(v, i) {
          v.classList.toggle('volet--active', i === idx);
        });
        voletDots.forEach(function(d, i) {
          d.classList.toggle('active', i === idx);
        });
      }
    }

    window.addEventListener('scroll', function() {
      requestAnimationFrame(updateVolets);
    }, { passive: true });
    updateVolets();
  }

  // Floating section nav (homepage)
  var sectionNav = document.getElementById('sectionNav');
  if (sectionNav) {
    var navLinks = sectionNav.querySelectorAll('a');
    var sectionIds = [];
    navLinks.forEach(function(link) {
      sectionIds.push(link.getAttribute('href').slice(1));
    });

    function updateSectionNav() {
      var scrollY = window.scrollY + window.innerHeight * 0.35;
      var show = window.scrollY > 400;
      sectionNav.classList.toggle('visible', show);
      if (!show) return;

      var activeId = sectionIds[0];
      for (var i = sectionIds.length - 1; i >= 0; i--) {
        var el = document.getElementById(sectionIds[i]);
        if (el && el.getBoundingClientRect().top + window.scrollY <= scrollY) {
          activeId = sectionIds[i];
          break;
        }
      }
      navLinks.forEach(function(link) {
        link.classList.toggle('active', link.getAttribute('href') === '#' + activeId);
      });
    }

    var navTicking = false;
    window.addEventListener('scroll', function() {
      if (!navTicking) {
        requestAnimationFrame(function() {
          updateSectionNav();
          navTicking = false;
        });
        navTicking = true;
      }
    }, { passive: true });
    updateSectionNav();
  }

  // Tab switching (services page)
  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var target = btn.getAttribute('data-tab');
      var group = btn.closest('.tab-nav')?.parentElement;
      if (!group) return;
      group.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
      group.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
      btn.classList.add('active');
      var panel = group.querySelector('#' + target);
      if (panel) panel.classList.add('active');
    });
  });

})();
