// public/js/topCategories.js
// Touch-friendly category selector; fetches /api/places?category=<slug>
// Renders results into #top-cat-results

(function () {
  if (!document) return;
  const container = document.querySelector('.top-categories-root');
  if (!container) return;

  const buttons = container.querySelectorAll('.category-btn');
  const resultsArea = document.getElementById('top-cat-results');

  let selected = null;

  function clearActive() {
    buttons.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    });
  }

  function renderLoading() {
    resultsArea.innerHTML = '<div class="tc-loader">Loading…</div>';
  }

  function renderEmpty(cat) {
    resultsArea.innerHTML = `<div class="tc-empty">No places found for "${cat}"</div>`;
  }

  function renderPlaces(list) {
    if (!Array.isArray(list) || list.length === 0) {
      resultsArea.innerHTML = '<div class="tc-empty">No places found.</div>';
      return;
    }
    const grid = document.createElement('div');
    grid.className = 'places-grid';
    list.forEach(p => {
      const id = p._id || p.id || '';
      const card = document.createElement('article');
      card.className = 'place-card';
      card.innerHTML = `
        <img loading="lazy" class="place-img" src="${p.image || p.imageUrl || '/images/placeholder.png'}" alt="${escapeHtml(p.name || '')}">
        <div class="place-body">
          <h4 class="place-title">${escapeHtml(p.name || 'Untitled')}</h4>
          <p class="place-sub">${escapeHtml(p.address || p.location || '')}</p>
        </div>
      `;
      grid.appendChild(card);
    });
    resultsArea.innerHTML = '';
    resultsArea.appendChild(grid);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  }

  async function fetchCategory(cat) {
    try {
      renderLoading();
      const url = `/api/places?category=${encodeURIComponent(cat)}&limit=24`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!res.ok) {
        throw new Error('Fetch error ' + res.status);
      }
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        renderEmpty(cat);
      } else {
        renderPlaces(data);
      }
    } catch (err) {
      resultsArea.innerHTML = `<div class="tc-empty">Unable to load places. Try again later.</div>`;
      console.error('topCategories fetch error', err);
    }
  }

  function handleSelect(btn) {
    const cat = btn.getAttribute('data-cat');
    const next = (selected === cat) ? null : cat; // toggle
    if (!next) {
      // clear
      selected = null;
      clearActive();
      resultsArea.innerHTML = '';
      return;
    }
    // activate button
    selected = next;
    clearActive();
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    // fetch and render results
    fetchCategory(selected);
  }

  // keyboard accessibility
  function handleKey(e, btn) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(btn);
    }
  }

  // attach events
  buttons.forEach(btn => {
    btn.addEventListener('click', () => handleSelect(btn));
    btn.addEventListener('keydown', (e) => handleKey(e, btn));
    // improve touch target: ensure tap area responds
    btn.addEventListener('touchstart', () => {}, { passive: true });
  });
})();
