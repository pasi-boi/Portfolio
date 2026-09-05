// ---------- Simple client-side gate ----------
// NOTE: this is a casual deterrent only, not real security — the source of this
// page (including this passphrase check) is publicly visible to anyone who views
// the page source on GitHub Pages. Do not use this to protect anything sensitive.
// If you need real protection, keep this repo private or don't link this page
// from anywhere public.
var ADMIN_PASSPHRASE = 'pasilive-admin'; // change this to your own phrase before publishing

function checkAdminAccess() {
  var stored = sessionStorage.getItem('pasilive-admin-ok');
  if (stored === 'yes') {
    showAdmin();
    return;
  }
  document.getElementById('lockForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var val = document.getElementById('passInput').value;
    if (val === ADMIN_PASSPHRASE) {
      sessionStorage.setItem('pasilive-admin-ok', 'yes');
      showAdmin();
    } else {
      document.getElementById('lockError').style.display = 'block';
    }
  });
}

function showAdmin() {
  document.getElementById('adminLock').style.display = 'none';
  document.getElementById('adminMain').style.display = 'block';
  loadProjects().then(function (projects) {
    projectsState = projects;
    renderProjectsAdmin();
  });
  loadPricing().then(function (plans) {
    pricingState = plans;
    renderPricingAdmin();
  });
}

// ---------- Shared helpers ----------
function download(filename, dataObj) {
  var blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function linesToArray(text) {
  return text.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
}

// ---------- Projects panel ----------
var projectsState = [];

function syncProjectsFromDOM() {
  var items = document.querySelectorAll('#projectsList .admin-item');
  var next = [];
  items.forEach(function (el) {
    next.push({
      slug: el.querySelector('[data-f="slug"]').value.trim(),
      domainLabel: el.querySelector('[data-f="domainLabel"]').value.trim(),
      tag: el.querySelector('[data-f="tag"]').value.trim(),
      title: el.querySelector('[data-f="title"]').value.trim(),
      summary: el.querySelector('[data-f="summary"]').value.trim(),
      linkType: el.querySelector('[data-f="linkType"]').value.trim(),
      stats: [0, 1, 2].map(function (i) {
        return {
          value: el.querySelector('[data-stat-value="' + i + '"]').value.trim(),
          label: el.querySelector('[data-stat-label="' + i + '"]').value.trim()
        };
      }).filter(function (s) { return s.value || s.label; }),
      description: linesToArray(el.querySelector('[data-f="description"]').value),
      highlights: linesToArray(el.querySelector('[data-f="highlights"]').value)
    });
  });
  projectsState = next;
}

function renderProjectsAdmin() {
  var list = document.getElementById('projectsList');
  list.innerHTML = projectsState.map(function (p, i) {
    var stats = p.stats || [];
    return (
      '<div class="admin-item" data-index="' + i + '">' +
        '<div class="row">' +
          '<div><label>Title</label><input data-f="title" value="' + escapeAttr(p.title) + '"></div>' +
          '<div><label>Slug (used in the URL)</label><input data-f="slug" value="' + escapeAttr(p.slug) + '"></div>' +
        '</div>' +
        '<div class="row">' +
          '<div><label>Tag line (shown above the title)</label><input data-f="tag" value="' + escapeAttr(p.tag) + '"></div>' +
          '<div><label>Domain / label shown in the card header</label><input data-f="domainLabel" value="' + escapeAttr(p.domainLabel) + '"></div>' +
        '</div>' +
        '<label>Card summary (2-3 sentences)</label><textarea data-f="summary">' + escapeHtml(p.summary) + '</textarea>' +
        '<label style="margin-top:10px;">Full description (one paragraph per line)</label><textarea data-f="description" style="min-height:110px;">' + escapeHtml((p.description || []).join('\n')) + '</textarea>' +
        '<label style="margin-top:10px;">Key details / bullet points (one per line)</label><textarea data-f="highlights">' + escapeHtml((p.highlights || []).join('\n')) + '</textarea>' +
        '<label style="margin-top:10px;">Link type label (e.g. "Case study", "Live", "Ongoing")</label><input data-f="linkType" value="' + escapeAttr(p.linkType) + '">' +
        '<label style="margin-top:10px;">Stats (up to 3, shown on the card and detail page)</label>' +
        '<div class="stat-fields">' +
          [0, 1, 2].map(function (idx) {
            var s = stats[idx] || { value: '', label: '' };
            return '<div class="stat-input">' +
              '<input placeholder="Value, e.g. 7" data-stat-value="' + idx + '" value="' + escapeAttr(s.value) + '">' +
              '<input placeholder="Label, e.g. Sites built" data-stat-label="' + idx + '" value="' + escapeAttr(s.label) + '">' +
            '</div>';
          }).join('') +
        '</div>' +
        '<div class="admin-actions">' +
          '<span></span>' +
          '<button type="button" class="btn-small danger" onclick="deleteProject(' + i + ')">Delete project</button>' +
        '</div>' +
      '</div>'
    );
  }).join('') || '<p style="color:#7c8a84; font-size:0.9rem;">No projects yet — add one below.</p>';
}

function addProject() {
  syncProjectsFromDOM();
  projectsState.push({
    slug: 'new-project-' + (projectsState.length + 1),
    domainLabel: '',
    tag: '',
    title: 'New project',
    summary: '',
    linkType: 'Case study',
    stats: [],
    description: [],
    highlights: []
  });
  renderProjectsAdmin();
}

function deleteProject(index) {
  syncProjectsFromDOM();
  projectsState.splice(index, 1);
  renderProjectsAdmin();
}

function exportProjects() {
  syncProjectsFromDOM();
  download('projects.json', projectsState);
}

// ---------- Pricing panel ----------
var pricingState = [];

function syncPricingFromDOM() {
  var items = document.querySelectorAll('#pricingList .admin-item');
  var next = [];
  items.forEach(function (el) {
    next.push({
      name: el.querySelector('[data-f="name"]').value.trim(),
      price: el.querySelector('[data-f="price"]').value.trim(),
      period: el.querySelector('[data-f="period"]').value.trim(),
      description: el.querySelector('[data-f="description"]').value.trim(),
      features: linesToArray(el.querySelector('[data-f="features"]').value),
      cta: el.querySelector('[data-f="cta"]').value.trim(),
      featured: el.querySelector('[data-f="featured"]').checked
    });
  });
  pricingState = next;
}

function renderPricingAdmin() {
  var list = document.getElementById('pricingList');
  list.innerHTML = pricingState.map(function (p, i) {
    return (
      '<div class="admin-item" data-index="' + i + '">' +
        '<div class="row">' +
          '<div><label>Plan name</label><input data-f="name" value="' + escapeAttr(p.name) + '"></div>' +
          '<div><label>Button text</label><input data-f="cta" value="' + escapeAttr(p.cta) + '"></div>' +
        '</div>' +
        '<div class="row">' +
          '<div><label>Price (e.g. $800 or Custom)</label><input data-f="price" value="' + escapeAttr(p.price) + '"></div>' +
          '<div><label>Period (e.g. /month, one-time, leave blank for none)</label><input data-f="period" value="' + escapeAttr(p.period) + '"></div>' +
        '</div>' +
        '<label>Short description</label><textarea data-f="description" style="min-height:56px;">' + escapeHtml(p.description) + '</textarea>' +
        '<label style="margin-top:10px;">Features included (one per line)</label><textarea data-f="features">' + escapeHtml((p.features || []).join('\n')) + '</textarea>' +
        '<label style="margin-top:10px; display:flex; align-items:center; gap:8px; font-weight:600;"><input type="checkbox" data-f="featured" style="width:auto;" ' + (p.featured ? 'checked' : '') + '> Highlight as "Most popular"</label>' +
        '<div class="admin-actions">' +
          '<span></span>' +
          '<button type="button" class="btn-small danger" onclick="deletePricing(' + i + ')">Delete plan</button>' +
        '</div>' +
      '</div>'
    );
  }).join('') || '<p style="color:#7c8a84; font-size:0.9rem;">No plans yet — add one below.</p>';
}

function addPricing() {
  syncPricingFromDOM();
  pricingState.push({
    name: 'New plan',
    price: '$0',
    period: '',
    description: '',
    features: [],
    cta: 'Get in touch',
    featured: false
  });
  renderPricingAdmin();
}

function deletePricing(index) {
  syncPricingFromDOM();
  pricingState.splice(index, 1);
  renderPricingAdmin();
}

function exportPricing() {
  syncPricingFromDOM();
  download('pricing.json', pricingState);
}

// ---------- small escaping helpers (attribute-safe) ----------
function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, '&quot;');
}
