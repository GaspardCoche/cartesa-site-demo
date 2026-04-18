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
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
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
    var c = el.closest('.hero-stats-bar, .page-hero-stats, .stat-row, .values-mosaic, .stat-banner');
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

  // ===== VOLETS HORIZONTAUX (multi-instance) =====
  function initVolets(wrap) {
    var track = wrap.querySelector('.volets-track');
    var items = wrap.querySelectorAll('.volet');
    var dots = wrap.querySelectorAll('.volet-dot');
    if (!track || !items.length) return;

    var panelCount = items.length;
    var lastIndex = -1;

    function updateVolets() {
      var rect = wrap.getBoundingClientRect();
      var scrolled = -rect.top;
      var total = wrap.offsetHeight - window.innerHeight;
      if (scrolled < 0 || total <= 0) return;
      var progress = Math.max(0, Math.min(1, scrolled / total));
      var idx = Math.min(panelCount - 1, Math.floor(progress * panelCount));

      if (idx !== lastIndex) {
        lastIndex = idx;
        track.style.transform = 'translateX(-' + (idx * (100 / panelCount)) + '%)';
        items.forEach(function(v, i) {
          v.classList.toggle('volet--active', i === idx);
        });
        dots.forEach(function(d, i) {
          d.classList.toggle('active', i === idx);
        });
      }
    }

    window.addEventListener('scroll', function() {
      requestAnimationFrame(updateVolets);
    }, { passive: true });
    updateVolets();
  }

  document.querySelectorAll('.volets-wrap').forEach(function(wrap) {
    initVolets(wrap);
  });

  // Anchor links targeting tab panels — activate the correct tab
  document.querySelectorAll('a[href^="#tab-"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      var targetId = link.getAttribute('href').slice(1);
      var panel = document.getElementById(targetId);
      if (!panel) return;
      var group = panel.closest('.container') || panel.parentElement;
      if (!group) return;
      // Deactivate all tabs and panels in this group
      group.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
      group.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
      // Activate matching button and panel
      var btn = group.querySelector('.tab-btn[data-tab="' + targetId + '"]');
      if (btn) btn.classList.add('active');
      panel.classList.add('active');
      // Scroll to the tab section after a short delay to let the panel render
      e.preventDefault();
      var tabSection = group.closest('section') || group;
      setTimeout(function() {
        tabSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    });
  });

  // Tab switching (services page)
  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var target = btn.getAttribute('data-tab');
      var tabNav = btn.closest('.tab-nav');
      var group = tabNav ? tabNav.parentElement : null;
      if (!group) return;
      group.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
      group.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
      btn.classList.add('active');
      var panel = group.querySelector('#' + target);
      if (panel) panel.classList.add('active');
    });
  });

  // Filter tabs (temoignages page)
  var filterTabs = document.querySelectorAll('.filter-tab');
  for (var ft = 0; ft < filterTabs.length; ft++) {
    filterTabs[ft].addEventListener('click', function() {
      var filter = this.getAttribute('data-filter');
      var allTabs = document.querySelectorAll('.filter-tab');
      for (var t = 0; t < allTabs.length; t++) { allTabs[t].classList.remove('active'); }
      this.classList.add('active');
      var cards = document.querySelectorAll('[data-category]');
      for (var c = 0; c < cards.length; c++) {
        var cat = cards[c].getAttribute('data-category');
        cards[c].style.display = (filter === 'all' || cat === filter) ? '' : 'none';
      }
    });
  }

})();

// Tab activation from URL hash (must be outside IIFE so listeners fire on DOMContentLoaded/hashchange)
function activateTabFromHash() {
  var hash = window.location.hash;
  if (!hash) return;
  var targetPanel = document.querySelector(hash);
  if (!targetPanel || !targetPanel.classList.contains('tab-panel')) return;
  var tabId = targetPanel.id;
  var btn = document.querySelector('.tab-btn[data-tab="' + tabId + '"]');
  if (!btn) return;
  var group = btn.closest('.container') || btn.parentElement.parentElement;
  if (group) {
    var allBtns = group.querySelectorAll('.tab-btn');
    var allPanels = group.querySelectorAll('.tab-panel');
    for (var i = 0; i < allBtns.length; i++) { allBtns[i].classList.remove('active'); }
    for (var j = 0; j < allPanels.length; j++) { allPanels[j].classList.remove('active'); }
  }
  btn.classList.add('active');
  targetPanel.classList.add('active');
  setTimeout(function() {
    var tabNav = document.querySelector('.tab-nav');
    if (tabNav) tabNav.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 150);
}
document.addEventListener('DOMContentLoaded', activateTabFromHash);
window.addEventListener('hashchange', activateTabFromHash);
