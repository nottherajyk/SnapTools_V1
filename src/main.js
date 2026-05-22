// ===== MAIN APP =====
import { router, navigateTo } from './router.js';
import { renderNavbar } from './components/navbar.js';
import { renderFooter } from './components/footer.js';
import { renderToastContainer, showToast } from './components/toast.js';
import { tools } from './tools-data.js';

const app = document.getElementById('app');

function render() {
  const page = router();
  app.innerHTML = renderNavbar() + page + renderFooter() + renderToastContainer();
  bindNavbar();
  window.dispatchEvent(new Event('page-rendered'));
}

/* ── Search helpers ── */
const catMeta = {
  image: { label: 'Image', color: '#d6c0a2' },
  pdf:   { label: 'PDF',   color: '#c4ae8d' },
  social:{ label: 'Social', color: '#b09c7a' },
  text:  { label: 'Text',  color: '#8c7d62' },
};

function highlightMatch(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return text.slice(0, idx) + '<mark>' + text.slice(idx, idx + query.length) + '</mark>' + text.slice(idx + query.length);
}

function renderSearchResults(query) {
  const results = document.getElementById('searchResults');
  if (!results) return;
  const q = query.trim().toLowerCase();

  if (!q) {
    results.innerHTML = `
      <div class="search-placeholder">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".35"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <p>Type to search ${tools.length} tools…</p>
      </div>`;
    return;
  }

  const matched = tools.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.desc.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q)
  );

  if (!matched.length) {
    results.innerHTML = `
      <div class="search-placeholder search-empty">
        <span class="empty-icon">🔍</span>
        <p>No tools found for "<strong>${q}</strong>"</p>
        <span class="empty-hint">Try "pdf", "image", or "tweet"</span>
      </div>`;
    return;
  }

  results.innerHTML = matched.map((t, i) => {
    const cat = catMeta[t.category] || { label: t.category, color: '#888' };
    return `
      <a class="search-result ${i === 0 ? 'active' : ''}" href="#/tool/${t.id}" data-idx="${i}">
        <span class="sr-icon">${t.icon}</span>
        <div class="sr-text">
          <span class="sr-name">${highlightMatch(t.name, q)}</span>
          <span class="sr-desc">${highlightMatch(t.desc, q)}</span>
        </div>
        <span class="sr-cat" style="--cat-clr:${cat.color}">${cat.label}</span>
      </a>`;
  }).join('');
}

function openSearch() {
  const overlay = document.getElementById('searchOverlay');
  const input = document.getElementById('globalSearch');
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => input && input.focus(), 60);
}

function closeSearch() {
  const overlay = document.getElementById('searchOverlay');
  const input = document.getElementById('globalSearch');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  if (input) input.value = '';
  renderSearchResults('');
}

/* ── Bind everything ── */
function bindNavbar() {
  // Logo
  const logo = document.querySelector('.logo');
  if (logo) logo.addEventListener('click', (e) => { e.preventDefault(); navigateTo('/'); });

  // Nav links
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', (e) => { e.preventDefault(); navigateTo(el.getAttribute('data-nav')); });
  });

  // ── Search ──
  const searchBtn = document.getElementById('navSearchBtn');
  const overlay = document.getElementById('searchOverlay');
  const input = document.getElementById('globalSearch');
  const closeBtn = document.getElementById('searchCloseBtn');

  if (searchBtn) searchBtn.addEventListener('click', openSearch);
  if (closeBtn) closeBtn.addEventListener('click', closeSearch);

  // Click backdrop to close
  if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSearch(); });

  // Live results
  if (input) {
    input.addEventListener('input', () => renderSearchResults(input.value));

    // Keyboard navigation inside results
    input.addEventListener('keydown', (e) => {
      const items = document.querySelectorAll('.search-result');
      if (!items.length) return;
      let cur = [...items].findIndex(i => i.classList.contains('active'));

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        items[cur]?.classList.remove('active');
        cur = (cur + 1) % items.length;
        items[cur].classList.add('active');
        items[cur].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        items[cur]?.classList.remove('active');
        cur = (cur - 1 + items.length) % items.length;
        items[cur].classList.add('active');
        items[cur].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const active = items[cur];
        if (active) {
          closeSearch();
          navigateTo('/tool/' + active.href.split('/tool/')[1]);
        }
      }
    });
  }

  // Ctrl+K / Cmd+K global shortcut
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const isOpen = overlay?.classList.contains('open');
      isOpen ? closeSearch() : openSearch();
    }
    if (e.key === 'Escape' && overlay?.classList.contains('open')) {
      closeSearch();
    }
  });

  // Click a result → navigate
  document.getElementById('searchResults')?.addEventListener('click', (e) => {
    const link = e.target.closest('.search-result');
    if (link) {
      e.preventDefault();
      closeSearch();
      navigateTo('/tool/' + link.href.split('/tool/')[1]);
    }
  });

  // Hover on result → make active
  document.getElementById('searchResults')?.addEventListener('mousemove', (e) => {
    const link = e.target.closest('.search-result');
    if (link) {
      document.querySelectorAll('.search-result').forEach(r => r.classList.remove('active'));
      link.classList.add('active');
    }
  });

  // Hamburger
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
}

window.addEventListener('hashchange', render);
window.addEventListener('load', () => {
  render();
  setupGlobalDragAndDrop();
});

/* ── Global Drag and Drop Integration ── */
function setupGlobalDragAndDrop() {
  let dragCounter = 0;

  function showGlobalDragOverlay() {
    let overlay = document.getElementById('global-drag-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'global-drag-overlay';
      overlay.className = 'global-drag-overlay';
      overlay.innerHTML = `
        <div class="global-drag-content">
          <div class="global-drag-icon">📥</div>
          <h2>DROP IT LIKE IT'S HOT!</h2>
          <p>Drop your Image or Document here to start processing instantly!</p>
          <div class="global-drag-formats">
            <span class="format-badge badge-image">🖼️ Images (JPG, PNG, WEBP)</span>
            <span class="format-badge badge-pdf">📄 PDF Documents</span>
            <span class="format-badge badge-word">📝 Word Docs (DOCX)</span>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    }
    overlay.classList.add('active');
  }

  function hideGlobalDragOverlay() {
    const overlay = document.getElementById('global-drag-overlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
  }

  window.addEventListener('dragenter', (e) => {
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
      dragCounter++;
      showGlobalDragOverlay();
    }
  });

  window.addEventListener('dragleave', (e) => {
    e.preventDefault();
    // Only decrement if we're leaving the window/overlay
    dragCounter--;
    if (dragCounter <= 0) {
      hideGlobalDragOverlay();
      dragCounter = 0;
    }
  });

  window.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  window.addEventListener('drop', (e) => {
    e.preventDefault();
    dragCounter = 0;
    hideGlobalDragOverlay();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleDroppedFile(e.dataTransfer.files[0]);
    }
  });
}

function handleDroppedFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || name.endsWith('.webp')) {
    window.pendingDroppedFile = file;
    navigateTo('/tool/compress-image');
  } else if (name.endsWith('.pdf')) {
    window.pendingDroppedFile = file;
    navigateTo('/tool/compress-pdf');
  } else if (name.endsWith('.docx')) {
    window.pendingDroppedFile = file;
    navigateTo('/tool/word-to-pdf');
  } else {
    // Show toast for unsupported file types
    showToast('Unsupported format for instant drop. Drop a JPG, PNG, WEBP, PDF, or DOCX!', 'warning');
  }
}

