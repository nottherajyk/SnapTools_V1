import { tools } from '../tools-data.js';

export function renderHome() {
  const route = window.location.hash.slice(1) || '/';
  let activeCat = 'image';
  if (route === '/pdf') activeCat = 'pdf';
  else if (route === '/social') activeCat = 'social';
  else if (route === '/text') activeCat = 'text';
  else if (route === '/image') activeCat = 'image';

  const imageTools = tools.filter(t => t.category === 'image');
  const pdfTools = tools.filter(t => t.category === 'pdf');
  const socialTools = tools.filter(t => t.category === 'social');
  const textTools = tools.filter(t => t.category === 'text');

  return `
  <section class="hero">
    <div class="hero-badge sr-fade-down">100% Free — No Signup Required</div>
    <h1 id="heroTitle" data-text="Every |Tool| you want\nall in One Place"></h1>

    <div class="hero-stats">
      <div class="hero-stat sr-scale-in sr-delay-4">
        <div class="stat-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </div>
        <div class="stat-content">
          <div class="num">${tools.length}+</div>
          <div class="label">Tools Available</div>
        </div>
      </div>
      <div class="hero-stat sr-scale-in sr-delay-5">
        <div class="stat-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div class="stat-content">
          <div class="num">4</div>
          <div class="label">Categories</div>
        </div>
      </div>
      <div class="hero-stat sr-scale-in sr-delay-6">
        <div class="stat-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
        </div>
        <div class="stat-content">
          <div class="num">0</div>
          <div class="label">Data Uploaded</div>
        </div>
      </div>
    </div>
  </section>

  <section class="tools-section" id="toolsSection">
    ${renderCategorySection('image', ' Image Tools', imageTools, activeCat === 'image')}
    ${renderCategorySection('pdf', ' PDF Tools', pdfTools, activeCat === 'pdf')}
    ${renderCategorySection('social', ' Social Media Tools', socialTools, activeCat === 'social')}
    ${renderCategorySection('text', ' Text & Lists Tools', textTools, activeCat === 'text')}
  </section>
  `;
}

function renderCategorySection(catId, title, toolsList, isActive) {
  return `
    <div class="tools-category" data-category="${catId}" id="cat-${catId}" style="display: ${isActive ? 'block' : 'none'}">
      <div class="tools-category-header sr-slide-left">
        <div class="cat-icon ${catId}">${
          catId === 'image'  ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' :
          catId === 'pdf'    ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>' :
          catId === 'social' ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>' :
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>'
        }</div>
        <h2>${title}</h2>
        <span class="cat-count">${toolsList.length} tools</span>
      </div>
      <div class="tools-grid">
        ${toolsList.map((t, i) => `
          <a class="tool-card ${t.category}-tool sr-blur-in sr-delay-${Math.min(i + 1, 10)}" href="#/tool/${t.id}" data-nav="/tool/${t.id}">
            ${t.badge ? `<span class="tool-badge">${t.badge}</span>` : ''}
            <div class="tool-card-icon">${t.icon}</div>
            <h3>${t.name}</h3>
            <p>${t.desc}</p>
          </a>
        `).join('')}
      </div>
    </div>
  `;
}

/* ══════════════════════════════════
   SCROLL REVEAL ENGINE
   ══════════════════════════════════ */
function initScrollAnimations() {
  // ── 1. WORD-BY-WORD HERO TEXT REVEAL ──
  const heroTitle = document.getElementById('heroTitle');
  if (heroTitle) {
    const rawText = heroTitle.dataset.text || '';
    const lines = rawText.split('\\n');
    heroTitle.innerHTML = '';
    heroTitle.style.perspective = '600px';

    let wordIndex = 0;
    lines.forEach((line, lineIdx) => {
      const words = line.split(' ');
      words.forEach((word, wi) => {
        // Check if word has gradient markers |word|
        const isGradient = word.startsWith('|') && word.endsWith('|');
        const cleanWord = isGradient ? word.slice(1, -1) : word;

        const span = document.createElement('span');
        span.className = 'reveal-word';
        span.style.transitionDelay = `${wordIndex * 0.09 + 0.25}s`;

        if (isGradient) {
          const gradientSpan = document.createElement('span');
          gradientSpan.className = 'gradient';
          gradientSpan.textContent = cleanWord;
          span.appendChild(gradientSpan);
        } else {
          span.textContent = cleanWord;
        }

        heroTitle.appendChild(span);

        // Space between words
        if (wi < words.length - 1) {
          heroTitle.appendChild(document.createTextNode(' '));
        }
        wordIndex++;
      });

      // Add line break between lines
      if (lineIdx < lines.length - 1) {
        heroTitle.appendChild(document.createElement('br'));
      }
    });

    // Trigger reveal after a short delay
    requestAnimationFrame(() => {
      setTimeout(() => {
        heroTitle.querySelectorAll('.reveal-word').forEach(w => w.classList.add('revealed'));
      }, 100);
    });
  }

  // ── 2. INTERSECTION OBSERVER FOR SCROLL REVEALS ──
  const scrollSelectors = [
    '.sr-fade-up', '.sr-fade-down',
    '.sr-slide-left', '.sr-slide-right',
    '.sr-scale-in', '.sr-blur-in'
  ];

  const allScrollEls = document.querySelectorAll(scrollSelectors.join(','));

  if (!allScrollEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  allScrollEls.forEach(el => observer.observe(el));
}

// Category filter logic + animation init
window.addEventListener('page-rendered', () => {
  const tabs = document.querySelectorAll('.cat-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const cat = tab.dataset.cat;
      if (cat === 'image') {
        window.location.hash = '#/';
      } else {
        window.location.hash = `#/${cat}`;
      }
    });
  });

  // Initialize scroll + text reveal animations
  initScrollAnimations();
});
