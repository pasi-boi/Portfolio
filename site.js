// Shared behaviour across all pages: mobile nav toggle.
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
});

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

// Renders the project card grid on the home page.
function renderProjectCards(containerEl, projects) {
  if (!containerEl) return;
  containerEl.innerHTML = projects.map(function (p) {
    var stats = (p.stats || []).slice(0, 3).map(function (s) {
      return '<div><div class="v">' + escapeHtml(s.value) + '</div><div class="l">' + escapeHtml(s.label) + '</div></div>';
    }).join('');
    return (
      '<a class="project-card" href="project.html?slug=' + encodeURIComponent(p.slug) + '">' +
        '<div class="card-visual">' +
          '<div class="card-browserbar">' +
            '<div class="dots"><span></span><span></span><span></span></div>' +
            '<div class="domain">' + escapeHtml(p.domainLabel || p.title) + '</div>' +
            '<div class="tagline">' + escapeHtml(p.tag) + '</div>' +
          '</div>' +
          '<div class="card-stats">' + stats + '</div>' +
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

  heroWrap.innerHTML =
    '<div class="wrap">' +
      '<a class="back-link" href="index.html#projects">&larr; Back to all projects</a>' +
      '<div class="card-tag">' + escapeHtml(project.tag) + '</div>' +
      '<h1>' + escapeHtml(project.title) + '</h1>' +
      '<p class="summary">' + escapeHtml(project.summary) + '</p>' +
      '<div class="detail-browserbar">' +
        '<div class="dots"><span></span><span></span><span></span></div>' +
        '<div class="domain">' + escapeHtml(project.domainLabel || project.title) + '</div>' +
      '</div>' +
      '<div class="detail-stats">' + stats + '</div>' +
    '</div>';

  var paragraphs = (project.description || []).map(function (p) {
    return '<p>' + escapeHtml(p) + '</p>';
  }).join('');

  var highlights = (project.highlights || []).map(function (h) {
    return '<li>' + escapeHtml(h) + '</li>';
  }).join('');

  bodyWrap.innerHTML =
    '<div class="wrap">' +
      '<div class="content">' +
        '<h2>The project</h2>' +
        paragraphs +
        (highlights ? '<h2>Key details</h2><ul>' + highlights + '</ul>' : '') +
        '<div class="detail-cta">' +
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
  containerEl.innerHTML = plans.map(function (plan) {
    var features = (plan.features || []).map(function (f) {
      return '<li>' + escapeHtml(f) + '</li>';
    }).join('');
    return (
      '<div class="price-card' + (plan.featured ? ' featured' : '') + '">' +
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
