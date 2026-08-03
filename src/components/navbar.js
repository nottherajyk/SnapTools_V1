import { tools } from '../tools-data.js';

export function renderNavbar() {
  const route = window.location.hash.slice(1) || '/';
  const isHome = route === '/' || route === '';
  const isImage = route === '/image' || (route.startsWith('/tool/') && ['webp-to-jpg','jpg-to-svg','base64-to-image','compress-image','png-to-jpg','svg-to-png','png-to-svg','image-cropper','invert-colors','jpg-to-png','image-to-base64','black-and-white'].includes(route.replace('/tool/','')));
  const isPdf = route === '/pdf' || (route.startsWith('/tool/') && ['protect-pdf','unlock-pdf','pdf-metadata','jpg-to-pdf','merge-pdf','split-pdf','pdf-to-word','word-to-pdf','compress-pdf','acrobat-downloader','pdf-to-images'].includes(route.replace('/tool/','')));
  const isSocial = route === '/social' || (route.startsWith('/tool/') && ['thumbnail-grabber','tweet-generator','youtube-tags','instagram-post','x-image-slicer','instagram-downloader','youtube-downloader'].includes(route.replace('/tool/','')));
  const isText = route === '/text' || (route.startsWith('/tool/') && !isImage && !isPdf && !isSocial && route.startsWith('/tool/'));

  return `
  <nav class="navbar">
    <div class="navbar-inner">
      <div class="navbar-top">
        <button class="hamburger" aria-label="Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        </button>
        <a class="logo" href="#">
          <div class="logo-icon">★</div>
          <div class="logo-text">Snap<span>tools</span></div>
        </a>
      </div>
      
      <div class="nav-links">
        <a class="nav-link ${isHome ? 'active' : ''}" data-nav="/">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span>Home</span>
        </a>
        <a class="nav-link ${isImage ? 'active' : ''}" data-nav="/image">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <span>Image</span>
        </a>
        <a class="nav-link ${isPdf ? 'active' : ''}" data-nav="/pdf">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span>PDF</span>
        </a>
        <a class="nav-link ${isSocial ? 'active' : ''}" data-nav="/social">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          <span>Social</span>
        </a>
        <a class="nav-link ${isText ? 'active' : ''}" data-nav="/text">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
          <span>Text</span>
        </a>
        <button class="nav-link theme-toggle-btn" id="themeNavLink" aria-label="Toggle Dark Mode" title="Toggle Light/Dark Mode">
          <svg class="theme-icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg class="theme-icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          <span>Dark Mode</span>
        </button>
      </div>
      
      <div class="navbar-bottom">
        <button class="theme-toggle-btn" id="themeToggleBtn" aria-label="Toggle theme" title="Toggle Light/Dark Theme">
          <svg class="theme-icon-sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg class="theme-icon-moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
        <button class="nav-search-btn" id="navSearchBtn" aria-label="Search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <span class="search-kbd">Search</span>
        </button>
        <div class="sidebar-smiley">
          <div class="smiley-eyes">★ ★</div>
          <div class="smiley-mouth">◡</div>
        </div>
      </div>
    </div>
  </nav>
  
  <div class="search-overlay" id="searchOverlay">
    <div class="search-modal">
      <div class="search-input-row">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" placeholder="Search all tools..." id="globalSearch" autocomplete="off" />
        <kbd class="search-esc" id="searchCloseBtn">esc</kbd>
      </div>
      <div class="search-results" id="searchResults">
        <div class="search-placeholder">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".35"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <p>Type to search ${tools.length} tools...</p>
        </div>
      </div>
    </div>
  </div>`;
}
