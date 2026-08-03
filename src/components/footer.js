export function renderFooter() {
  return `
  <footer class="footer">
    <p>© ${new Date().getFullYear()} <strong>wherearemytools</strong> — All-in-One Online Tools. Free & Open Source.</p>
    <p style="margin-top:.75rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem; flex-wrap: wrap;">
      Built by 
      <a href="https://github.com/nottherajyk" target="_blank" rel="noopener noreferrer" class="footer-author-link">
        @nottherajyk
        <span class="footer-github-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
        </span>
      </a> 
      — No data is uploaded to any server. All processing happens in your browser.
    </p>
  </footer>`;
}
