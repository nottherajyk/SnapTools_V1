export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showDownloadConfirmationModal(filename, sizeText, onConfirm) {
  let overlay = document.querySelector('.download-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'download-modal-overlay';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="download-modal-container">
      <div class="download-modal-header">
        <span class="download-modal-title">DOWNLOAD CONFIRMATION</span>
        <button class="download-modal-close-btn" aria-label="Close modal">&times;</button>
      </div>
      <div class="download-modal-body">
        <div class="download-modal-icon-container">
          <div class="download-modal-icon">&#128190;</div>
        </div>
        <div class="download-modal-details-table">
          <div class="download-modal-row">
            <span class="download-modal-label">File Name:</span>
            <span class="download-modal-value download-modal-filename" title="${filename}">${filename}</span>
          </div>
          <div class="download-modal-row">
            <span class="download-modal-label">File Size:</span>
            <span class="download-modal-value download-modal-filesize">${sizeText}</span>
          </div>
        </div>
        <p class="download-modal-disclaimer">Would you like to authorize this download to your system?</p>
      </div>
      <div class="download-modal-footer">
        <button class="download-modal-btn download-modal-btn-cancel">Cancel</button>
        <button class="download-modal-btn download-modal-btn-confirm">Download File &#128640;</button>
      </div>
    </div>
  `;

  const closeModal = () => {
    overlay.classList.remove('active');
    document.removeEventListener('keydown', handleEscape);
    setTimeout(() => { overlay.remove(); }, 250);
  };

  const confirmDownload = () => {
    closeModal();
    onConfirm();
  };

  const handleEscape = (e) => {
    if (e.key === 'Escape') closeModal();
  };

  overlay.querySelector('.download-modal-close-btn').addEventListener('click', closeModal);
  overlay.querySelector('.download-modal-btn-cancel').addEventListener('click', closeModal);
  overlay.querySelector('.download-modal-btn-confirm').addEventListener('click', confirmDownload);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', handleEscape);

  requestAnimationFrame(() => { overlay.classList.add('active'); });
}

export function downloadBlob(blob, filename) {
  const sizeText = formatBytes(blob.size);
  showDownloadConfirmationModal(filename, sizeText, () => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  });
}

export function downloadDataURL(dataURL, filename) {
  let sizeText = 'Unknown';
  if (dataURL.startsWith('data:')) {
    const base64Str = dataURL.split(',')[1] || '';
    const sizeBytes = Math.floor((base64Str.length * 3) / 4);
    sizeText = formatBytes(sizeBytes);
  }
  showDownloadConfirmationModal(filename, sizeText, () => {
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); }, 1000);
  });
}

export function downloadURL(url, filename) {
  showDownloadConfirmationModal(filename, 'Remote / External Resource', () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); }, 1000);
  });
}

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
}

export function renderDropZone(id, accept, label = 'Drop your file here or click to browse') {
  return `
    <div class="drop-zone" id="${id}">
      <div class="drop-zone-icon">&#128194;</div>
      <h3>${label}</h3>
      <p>Supports ${accept.toUpperCase()} files</p>
      <input type="file" accept="${accept}" id="${id}Input" />
    </div>`;
}

export function renderMultiDropZone(id, accept, label = 'Drop your files here or click to browse') {
  return `
    <div class="drop-zone" id="${id}">
      <div class="drop-zone-icon">&#128194;</div>
      <h3>${label}</h3>
      <p>Supports ${accept.toUpperCase()} files &#8212; Multiple files allowed</p>
      <input type="file" accept="${accept}" id="${id}Input" multiple />
    </div>`;
}

export function setupDropZone(zoneId, inputId, onFile) {
  window.addEventListener('page-rendered', () => {
    const zone = document.getElementById(zoneId);
    const input = document.getElementById(inputId);
    if (!zone || !input) return;

    ['dragover', 'dragenter'].forEach(e => zone.addEventListener(e, (ev) => { ev.preventDefault(); zone.classList.add('drag-over'); }));
    ['dragleave', 'drop'].forEach(e => zone.addEventListener(e, () => zone.classList.remove('drag-over')));
    zone.addEventListener('drop', (e) => { e.preventDefault(); if (e.dataTransfer.files.length) onFile(e.dataTransfer.files); });
    input.addEventListener('change', () => { if (input.files.length) onFile(input.files); });
  });
}
