// Shared behaviour across all pages: mobile nav toggle, nav scroll shadow,
// scroll-reveal animations and animated number counters.
var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Auto-tag common content blocks as reveal targets, with a light stagger
  // for anything sitting inside a grid/row so groups animate in sequence.
  var autoSelectors = [
    '.section-head', '.t-item', '.achieve-cell', '.skill-group',
    '.edu-col', '.price-card', '.cta-strip .wrap > *', '.contact-section .wrap > *'
  ];
  document.querySelectorAll(autoSelectors.join(',')).forEach(function (el, i) {
    el.classList.add('reveal');
    if (!el.style.transitionDelay) {
      el.style.transitionDelay = Math.min(i % 6, 5) * 70 + 'ms';
    }
  });

  initScrollReveal();
  initCounters(document);
});

// Observes every .reveal element currently in the DOM and fades/slides it in
// the first time it enters the viewport. Safe to call again after injecting
// new content (e.g. dynamically-rendered project/pricing cards).
function initScrollReveal() {
  var targets = document.querySelectorAll('.reveal:not(.is-visible)');
  if (!targets.length) return;
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  var observer = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(function (el) { observer.observe(el); });
}

// Animates any [data-count] element's leading number from 0 up to its real
// value once it scrolls into view. Non-numeric stats (e.g. "0 \u2192 1") are
// left as static text. Call with a root element to scope the search.
function initCounters(root) {
  var els = root.querySelectorAll('.stat-num[data-count], .achieve-cell .num[data-count]');
  if (!els.length) return;
  if (prefersReducedMotion || !('IntersectionObserver' in window)) return;
  var observer = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      runCount(entry.target);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.4 });
  els.forEach(function (el) { observer.observe(el); });
}

function runCount(el) {
  var full = el.textContent;
  var match = full.match(/^([\d,]+)(.*)$/);
  if (!match) return;
  var target = parseInt(match[1].replace(/,/g, ''), 10);
  var suffix = match[2];
  if (isNaN(target)) return;
  var duration = 1100;
  var start = null;
  function step(ts) {
    if (start === null) start = ts;
    var progress = Math.min((ts - start) / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    var value = Math.round(target * eased);
    el.textContent = value.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = full;
  }
  requestAnimationFrame(step);
}

// Fetches /data/projects.json. Resolves to [] on failure so pages degrade gracefully.
function loadProjects() {
  return fetch('data/projects.json')
    .then(function (r) { return r.ok ? r.json() : []; })
    .catch(function () { return []; });
}

function loadPricing() {
  return fetch('data/pricing.json')
    .then(function (r) { return r.ok ? r.json() : []; })
    .catch(function () { return []; });
}

function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

// Safe to drop into an HTML attribute value (e.g. a style="background-image:url('...')" string).
function escapeAttr(str) {
  return escapeHtml(str).replace(/'/g, '&#39;').replace(/"/g, '&quot;');
}

// Renders the project card grid on the home page.
function renderProjectCards(containerEl, projects) {
  if (!containerEl) return;
  containerEl.innerHTML = projects.map(function (p, i) {
    var hasImage = !!p.image;
    var visualStyle = hasImage ? ' style="background-image:url(\'' + escapeAttr(p.image) + '\')"' : '';
    var visualTop = hasImage
      ? '<div class="card-photo-label">' + escapeHtml(p.domainLabel || p.title) + '</div>'
      : (
          '<div class="card-browserbar">' +
            '<div class="dots"><span></span><span></span><span></span></div>' +
            '<div class="domain">' + escapeHtml(p.domainLabel || p.title) + '</div>' +
            '<div class="tagline">' + escapeHtml(p.tag) + '</div>' +
          '</div>'
        );
    return (
      '<a class="project-card reveal" style="transition-delay:' + Math.min(i, 5) * 80 + 'ms" href="project.html?slug=' + encodeURIComponent(p.slug) + '">' +
        '<div class="card-visual' + (hasImage ? ' has-image' : '') + '"' + visualStyle + '>' +
          visualTop +
        '</div>' +
        '<div class="card-body">' +
          '<div class="card-tag">' + escapeHtml(p.tag) + '</div>' +
          '<h3>' + escapeHtml(p.title) + '</h3>' +
          '<p>' + escapeHtml(p.summary) + '</p>' +
          '<div class="card-footer">' +
            '<span class="type">' + escapeHtml(p.linkType || 'Case study') + '</span>' +
            '<span class="view">View project &rarr;</span>' +
          '</div>' +
        '</div>' +
      '</a>'
    );
  }).join('');
}

// Renders a single project's detail page based on ?slug= in the URL.
function renderProjectDetail(project) {
  var heroWrap = document.getElementById('detailHero');
  var bodyWrap = document.getElementById('detailBody');
  var notFound = document.getElementById('notFound');

  if (!project) {
    if (heroWrap) heroWrap.style.display = 'none';
    if (bodyWrap) bodyWrap.style.display = 'none';
    if (notFound) notFound.style.display = 'block';
    document.title = 'Project not found — Pasi.Live';
    return;
  }

  document.title = project.title + ' — Pasi.Live';

  var stats = (project.stats || []).map(function (s) {
    return '<div><div class="v">' + escapeHtml(s.value) + '</div><div class="l">' + escapeHtml(s.label) + '</div></div>';
  }).join('');

  var hasImage = !!project.image;
  var visualStyle = hasImage ? ' style="background-image:url(\'' + escapeAttr(project.image) + '\')"' : '';
  var visualTop = hasImage
    ? '<div class="card-photo-label">' + escapeHtml(project.domainLabel || project.title) + '</div>'
    : (
        '<div class="detail-browserbar">' +
          '<div class="dots"><span></span><span></span><span></span></div>' +
          '<div class="domain">' + escapeHtml(project.domainLabel || project.title) + '</div>' +
        '</div>'
      );

  heroWrap.innerHTML =
    '<div class="wrap">' +
      '<a class="back-link" href="index.html#projects">&larr; Back to all projects</a>' +
      '<div class="card-tag">' + escapeHtml(project.tag) + '</div>' +
      '<h1>' + escapeHtml(project.title) + '</h1>' +
      '<p class="summary">' + escapeHtml(project.summary) + '</p>' +
      '<div class="detail-visual' + (hasImage ? ' has-image' : '') + '"' + visualStyle + '>' +
        visualTop +
      '</div>' +
      '<div class="detail-stats" style="grid-template-columns:repeat(' + Math.max(project.stats ? project.stats.length : 1, 1) + ',1fr)">' + stats + '</div>' +
    '</div>';

  var paragraphs = (project.description || []).map(function (p) {
    return '<p>' + escapeHtml(p) + '</p>';
  }).join('');

  var highlights = (project.highlights || []).map(function (h) {
    return '<li>' + escapeHtml(h) + '</li>';
  }).join('');

  bodyWrap.innerHTML =
    '<div class="wrap">' +
      '<div class="content reveal is-visible">' +
        '<h2>The project</h2>' +
        paragraphs +
        (highlights ? '<h2>Key details</h2><ul>' + highlights + '</ul>' : '') +
        '<div class="detail-cta reveal">' +
          '<p>Interested in something like this for your business?</p>' +
          '<a class="btn btn-primary" href="index.html#contact">Get in touch</a>' +
        '</div>' +
      '</div>' +
    '</div>';
}

function initProjectDetailPage() {
  var params = new URLSearchParams(window.location.search);
  var slug = params.get('slug');
  loadProjects().then(function (projects) {
    var project = projects.find(function (p) { return p.slug === slug; });
    renderProjectDetail(project);
  });
}

// Renders pricing plan cards on the pricing page.
function renderPricingCards(containerEl, plans) {
  if (!containerEl) return;
  containerEl.innerHTML = plans.map(function (plan, i) {
    var features = (plan.features || []).map(function (f) {
      return '<li>' + escapeHtml(f) + '</li>';
    }).join('');
    return (
      '<div class="price-card reveal' + (plan.featured ? ' featured' : '') + '" style="transition-delay:' + i * 80 + 'ms">' +
        (plan.featured ? '<div class="price-badge">Most popular</div>' : '') +
        '<h3>' + escapeHtml(plan.name) + '</h3>' +
        '<div class="price">' + escapeHtml(plan.price) + (plan.period ? ' <small>' + escapeHtml(plan.period) + '</small>' : '') + '</div>' +
        '<div class="price-desc">' + escapeHtml(plan.description) + '</div>' +
        '<ul>' + features + '</ul>' +
        '<a class="btn ' + (plan.featured ? 'btn-primary' : 'btn-ghost-light') + '" href="index.html#contact">' + escapeHtml(plan.cta || 'Get in touch') + '</a>' +
      '</div>'
    );
  }).join('');
}
