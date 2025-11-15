// public/js/topCategories.js
// Touch-friendly category selector; fetches /api/places?category=<slug>
// Renders results into #top-cat-results
(function () {
  if (typeof document === 'undefined') return;

  const container = document.querySelector('.top-categories-root');
  if (!container) return;

  const buttons = Array.from(container.querySelectorAll('.category-btn') || []);
  const resultsArea = document.getElementById('top-cat-results');
  if (!resultsArea) return;

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
    resultsArea.innerHTML = `<div class="tc-empty">No places found for "${escapeHtml(cat)}"</div>`;
  }

  // Build DOM nodes safely instead of innerHTML to avoid injection issues
  function renderPlaces(list) {
    if (!Array.isArray(list) || list.length === 0) {
      resultsArea.innerHTML = '<div class="tc-empty">No places found.</div>';
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'places-grid';

    for (const p of list) {
      const card = document.createElement('article');
      card.className = 'place-card';

      const img = document.createElement('img');
      img.loading = 'lazy';
      img.className = 'place-img';
      // choose a safe fallback and prevent broken src
      img.src = (typeof p.image === 'string' && p.image.trim()) ? p.image : (typeof p.imageUrl === 'string' && p.imageUrl.trim() ? p.imageUrl : '/images/placeholder.png');
      img.alt = p.name ? String(p.name) : 'Place image';

      const body = document.createElement('div');
      body.className = 'place-body';

      const h4 = document.createElement('h4');
      h4.className = 'place-title';
      h4.textContent = p.name ? String(p.name) : 'Untitled';

      const psub = document.createElement('p');
      psub.className = 'place-sub';
      psub.textContent = p.address || p.location || '';

      body.appendChild(h4);
      body.appendChild(psub);
      card.appendChild(img);
      card.appendChild(body);

      // optionally make entire card clickable to detail page
      if (p._id || p.id) {
        const link = document.createElement('a');
        link.href = '/listings/' + encodeURIComponent(p._id || p.id);
        link.className = 'place-link';
        link.appendChild(card);
        grid.appendChild(link);
      } else {
        grid.appendChild(card);
      }
    }

    // clear and append
    resultsArea.innerHTML = '';
    resultsArea.appendChild(grid);
  }

  function escapeHtml(str) {
    if (str == null) return '';
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
    if (!btn) return;
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

  // keyboard accessibility (Enter, Space)
  function handleKey(e, btn) {
    const key = e.key || e.keyIdentifier || e.keyCode;
    if (key === 'Enter' || key === ' ' || key === 'Spacebar' || key === 13 || key === 32) {
      e.preventDefault();
      handleSelect(btn);
    }
  }

  // attach events
  try {
    buttons.forEach(btn => {
      btn.addEventListener('click', () => handleSelect(btn));
      btn.addEventListener('keydown', (e) => handleKey(e, btn));
      // improve touch target: ensure tap area responds
      btn.addEventListener('touchstart', () => {}, { passive: true });
    });
  } catch (err) {
    // if something goes wrong attaching events, log and fail silently
    console.error('topCategories attach events error', err);
  }
})();
