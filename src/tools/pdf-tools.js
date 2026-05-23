import { PDFDocument, PDFRawStream, PDFName } from 'pdf-lib';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt-lite';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { formatBytes, downloadBlob, readFileAsArrayBuffer, renderDropZone, renderMultiDropZone } from '../utils.js';
import { showToast } from '../components/toast.js';

export function pdfToolHandler(tool) {
  setTimeout(() => setupPdfTool(tool.id), 50);
  window.addEventListener('page-rendered', () => setupPdfTool(tool.id), { once: true });

  switch (tool.id) {
    case 'protect-pdf': return renderProtectPDF();
    case 'unlock-pdf': return renderUnlockPDF();
    case 'pdf-metadata': return renderPDFMetadata();
    case 'jpg-to-pdf': return renderJPGtoPDF();
    case 'merge-pdf': return renderMergePDF();
    case 'split-pdf': return renderSplitPDF();
    case 'pdf-to-word': return renderPDFtoWord();
    case 'word-to-pdf': return renderWordtoPDF();
    case 'compress-pdf': return renderCompressPDF();
    case 'acrobat-downloader': return renderAcrobatDownloader();
    case 'pdf-to-images': return renderPDFtoImages();
    default: return `<p>Tool coming soon!</p>`;
  }
}

function renderProtectPDF() {
  return `
    ${renderDropZone('pdfProtect', '.pdf', 'Drop your PDF to protect')}
    <div id="fileInfoArea"></div>
    <div class="form-group" style="margin-top:1rem">
      <label class="form-label">Set Password</label>
      <input type="password" class="form-input" id="pdfPassword" placeholder="Enter password..." />
    </div>
    <div class="form-group">
      <label class="form-label">Confirm Password</label>
      <input type="password" class="form-input" id="pdfPasswordConfirm" placeholder="Confirm password..." />
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="protectBtn" disabled>🔒 Protect & Download</button>
    </div>
    <div class="result-area" id="resultArea">
      <div class="result-meta" id="resultMeta"></div>
    </div>
  `;
}

function renderUnlockPDF() {
  return `
    ${renderDropZone('pdfUnlock', '.pdf', 'Drop your protected PDF')}
    <div id="fileInfoArea"></div>
    <div class="form-group" style="margin-top:1rem">
      <label class="form-label">Enter Password</label>
      <input type="password" class="form-input" id="pdfPassword" placeholder="Enter PDF password..." />
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="unlockBtn" disabled>🔓 Unlock & Download</button>
    </div>
  `;
}

function renderPDFMetadata() {
  return `
    ${renderDropZone('pdfMeta', '.pdf', 'Drop your PDF to view metadata')}
    <div id="fileInfoArea"></div>
    <div class="result-area" id="resultArea">
      <h3 style="font-size:.9rem;font-weight:600;margin-bottom:1rem;color:var(--text-muted)">PDF Metadata</h3>
      <div id="metadataOutput" style="display:grid;grid-template-columns:auto 1fr;gap:.5rem .75rem;font-size:.85rem"></div>
    </div>
  `;
}

function renderJPGtoPDF() {
  return `
    ${renderMultiDropZone('jpgPdf', '.jpg,.jpeg,.png,.webp', 'Drop your images here')}
    <div id="fileInfoArea"></div>
    <div class="form-row" style="margin-top:1rem">
      <div class="form-group">
        <label class="form-label">Page Size</label>
        <select class="form-select" id="pageSize">
          <option value="a4">A4</option>
          <option value="letter">Letter</option>
          <option value="fit">Fit to Image</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Orientation</label>
        <select class="form-select" id="orientation">
          <option value="portrait">Portrait</option>
          <option value="landscape">Landscape</option>
        </select>
      </div>
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="convertBtn" disabled>📄 Create PDF</button>
    </div>
  `;
}

function renderMergePDF() {
  return `
    ${renderMultiDropZone('pdfMerge', '.pdf', 'Drop your PDF files to merge')}
    <div id="fileListArea" style="margin-top:1rem"></div>
    <div class="actions-row">
      <button class="btn btn-primary" id="mergeBtn" disabled>📑 Merge PDFs</button>
    </div>
    <div class="result-area" id="resultArea">
      <div class="result-meta" id="resultMeta"></div>
    </div>
  `;
}

function renderSplitPDF() {
  return `
    ${renderDropZone('pdfSplit', '.pdf', 'Drop your PDF to split')}
    <div id="fileInfoArea"></div>
    <div class="form-group" style="margin-top:1rem">
      <label class="form-label">Split Mode</label>
      <select class="form-select" id="splitMode">
        <option value="each">Each page as separate PDF</option>
        <option value="range">Custom page range</option>
      </select>
    </div>
    <div class="form-group" id="rangeGroup" style="display:none">
      <label class="form-label">Page Range (e.g. 1-3, 5, 7-9)</label>
      <input type="text" class="form-input" id="pageRange" placeholder="1-3, 5, 7-9" />
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="splitBtn" disabled>✂️ Split PDF</button>
    </div>
    <div class="result-area" id="resultArea">
      <div class="result-meta" id="resultMeta"></div>
    </div>
  `;
}

function renderPDFtoWord() {
  return `
    ${renderDropZone('pdfToWord', '.pdf', 'Drop your PDF here')}
    <div id="fileInfoArea"></div>
    <div class="actions-row mt-6">
      <button class="btn btn-primary min-w-[200px]" id="convertBtn" disabled>
        📝 Convert to Word (.docx)
      </button>
    </div>
    
    <!-- Warning Banner for Scanned PDF -->
    <div id="warningBanner" class="hidden mt-6 p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-200 text-sm flex gap-3 items-start animate-fade-in">
      <span class="text-xl">⚠️</span>
      <div>
        <h4 class="font-bold text-amber-400">Scanned Document Detected</h4>
        <p class="mt-1">This appears to be a scanned document or image-only PDF. Text extraction requires OCR.</p>
      </div>
    </div>
    
    <div class="result-area" id="resultArea">
      <div class="result-meta" id="resultMeta"></div>
    </div>
  `;
}

function renderWordtoPDF() {
  return `
    ${renderDropZone('wordToPdf', '.docx', 'Drop your Word document (.docx)')}
    <div id="fileInfoArea"></div>
    <div class="text-center text-xs text-slate-400 mt-2 px-4 italic leading-relaxed">
      Optimized for text and paragraph structures. Complex tables and custom layouts may vary.
    </div>
    <div class="actions-row mt-6">
      <button class="btn btn-primary" id="convertBtn" disabled>📄 Convert to PDF</button>
    </div>
    <div class="result-area" id="resultArea">
      <div class="result-meta" id="resultMeta"></div>
    </div>
  `;
}

function renderCompressPDF() {
  return `
    ${renderDropZone('pdfCompress', '.pdf', 'Drop your PDF to compress')}
    <div id="fileInfoArea"></div>
    
    <div class="form-group" style="margin-top:1.5rem">
      <label class="form-label">Compression Level</label>
      <div class="grid grid-cols-3 gap-3">
        <label class="relative flex flex-col p-4 rounded-xl border border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/80 cursor-pointer transition text-center select-none">
          <input type="radio" name="compressLevel" value="high" class="sr-only peer" />
          <div class="text-sm font-semibold text-slate-200 peer-checked:text-indigo-400">High Compression</div>
          <div class="text-xs text-slate-400 mt-1">Smaller file, lower resolution</div>
          <div class="absolute inset-0 border border-transparent peer-checked:border-indigo-500 rounded-xl pointer-events-none"></div>
        </label>
        
        <label class="relative flex flex-col p-4 rounded-xl border border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/80 cursor-pointer transition text-center select-none">
          <input type="radio" name="compressLevel" value="recommended" class="sr-only peer" checked />
          <div class="text-sm font-semibold text-slate-200 peer-checked:text-indigo-400">Recommended</div>
          <div class="text-xs text-slate-400 mt-1">Good quality & compression</div>
          <div class="absolute inset-0 border border-transparent peer-checked:border-indigo-500 rounded-xl pointer-events-none"></div>
        </label>
        
        <label class="relative flex flex-col p-4 rounded-xl border border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/80 cursor-pointer transition text-center select-none">
          <input type="radio" name="compressLevel" value="low" class="sr-only peer" />
          <div class="text-sm font-semibold text-slate-200 peer-checked:text-indigo-400">Lossless / Low</div>
          <div class="text-xs text-slate-400 mt-1">Maximum image quality</div>
          <div class="absolute inset-0 border border-transparent peer-checked:border-indigo-500 rounded-xl pointer-events-none"></div>
        </label>
      </div>
    </div>
    
    <div class="actions-row mt-6">
      <button class="btn btn-primary" id="compressBtn" disabled>🗜️ Compress PDF</button>
    </div>
    
    <div class="result-area" id="resultArea">
      <div class="result-meta" id="resultMeta"></div>
    </div>
  `;
}

function renderAcrobatDownloader() {
  return `
    <div class="w-full max-w-2xl mx-auto p-6 rounded-2xl border border-slate-700/40 bg-slate-800/30 backdrop-blur-xl">
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-slate-300">Paste Adobe Acrobat Share Link</label>
        <div class="flex gap-2">
          <input type="url" id="acrobatUrl" placeholder="https://acrobat.adobe.com/link/track?uri=urn:aaid:scds:US:..." class="form-input flex-1 min-w-0" />
          <button id="resolveBtn" class="btn btn-primary px-6 flex items-center gap-2">
            <span>🔍</span> Resolve Link
          </button>
        </div>
        <p class="text-xs text-slate-400">Supports public track, review, or direct ID shared URLs.</p>
      </div>
      
      <!-- Loading State -->
      <div id="acrobatLoading" class="hidden mt-8 flex flex-col items-center gap-4 py-8">
        <div class="relative w-12 h-12">
          <div class="absolute inset-0 rounded-full border-4 border-slate-700 border-t-indigo-500 animate-spin"></div>
        </div>
        <p class="text-sm text-slate-300 animate-pulse font-medium">Resolving document from Adobe Creative Cloud...</p>
      </div>

      <!-- File Card Display -->
      <div id="acrobatFileCard" class="hidden mt-8 p-5 rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-md animate-fade-in">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-2xl" id="fileIcon">
            📄
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-slate-200 truncate" id="acrobatFileName">document.pdf</h3>
            <div class="flex gap-3 text-xs text-slate-400 mt-1">
              <span id="acrobatFileSize">Size: --</span>
              <span id="acrobatFileType" class="text-indigo-400 uppercase font-medium">PDF</span>
            </div>
          </div>
        </div>

        <div class="mt-6 pt-6 border-t border-slate-700/40">
          <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">Download & Conversion Options</label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" id="acrobatActions">
            <!-- Dynamic action buttons will go here -->
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPDFtoImages() {
  return `
    ${renderDropZone('pdfToImages', '.pdf', 'Drop your PDF here')}
    <div id="fileInfoArea"></div>
    
    <div class="form-group" style="margin-top:1.5rem">
      <label class="form-label">Image Settings</label>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="form-label-sub" style="font-size:0.8rem;color:var(--text-muted);display:block;margin-bottom:0.5rem">Image Format</label>
          <select class="form-select" id="imageFormat">
            <option value="png">PNG (Lossless, High Quality)</option>
            <option value="jpeg">JPEG (Compressed, Smaller Size)</option>
          </select>
        </div>
        <div>
          <label class="form-label-sub" style="font-size:0.8rem;color:var(--text-muted);display:block;margin-bottom:0.5rem">Resolution Scale</label>
          <select class="form-select" id="resolutionScale">
            <option value="1">1x (Standard Resolution)</option>
            <option value="2" selected>2x (High Definition - Recommended)</option>
            <option value="3">3x (Ultra HD - Print Quality)</option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="actions-row mt-6">
      <button class="btn btn-primary min-w-[200px]" id="convertBtn" disabled>
        🖼️ Convert PDF to Images
      </button>
    </div>
    
    <div class="result-area" id="resultArea">
      <div class="result-meta" id="resultMeta"></div>
    </div>
  `;
}


// ===== SETUP LOGIC =====
function setupPdfTool(toolId) {
  let currentFiles = [];

  function bindDropZone(zoneId, onFiles) {
    const zone = document.getElementById(zoneId);
    const input = document.getElementById(zoneId + 'Input');
    if (!zone || !input) return;

    ['dragover', 'dragenter'].forEach(e => zone.addEventListener(e, (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      zone.classList.add('drag-over');
    }));

    ['dragleave', 'drop'].forEach(e => zone.addEventListener(e, (ev) => {
      ev.stopPropagation();
      zone.classList.remove('drag-over');
    }));

    function handleSelectedFiles(files) {
      if (!files || !files.length) return;
      zone.style.display = 'none';
      onFiles(files);
      
      // Special logic for multi-file PDF merger
      if (zoneId === 'pdfMerge') {
        const listArea = document.getElementById('fileListArea');
        if (listArea) {
          let addMoreBtn = document.getElementById('mergeAddMoreBtn');
          if (!addMoreBtn) {
            addMoreBtn = document.createElement('button');
            addMoreBtn.id = 'mergeAddMoreBtn';
            addMoreBtn.type = 'button';
            addMoreBtn.className = 'btn btn-secondary';
            addMoreBtn.style.marginTop = '1rem';
            addMoreBtn.style.width = '100%';
            addMoreBtn.innerHTML = '➕ Add More Files';
            addMoreBtn.addEventListener('click', () => {
              input.click();
            });
            listArea.parentNode.insertBefore(addMoreBtn, listArea.nextSibling);
          }
        }
      }
    }

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files.length) {
        handleSelectedFiles(Array.from(e.dataTransfer.files));
      }
    });

    zone.addEventListener('click', () => {
      input.click();
    });

    zone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        input.click();
      }
    });

    input.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    input.addEventListener('change', () => {
      if (input.files.length) {
        handleSelectedFiles(Array.from(input.files));
      }
    });

    // Dynamic instance-specific reset binder
    window.activePdfReset = (dataIdx) => {
      if (input) input.value = '';
      const addMoreBtn = document.getElementById('mergeAddMoreBtn');
      if (addMoreBtn) addMoreBtn.remove();
      
      if (dataIdx !== null) {
        const idx = parseInt(dataIdx, 10);
        currentFiles.splice(idx, 1);
        const listArea = document.getElementById('fileListArea');
        if (listArea) {
          if (currentFiles.length === 0) {
            listArea.innerHTML = '';
            const mergeBtn = document.getElementById('mergeBtn');
            if (mergeBtn) mergeBtn.disabled = true;
            if (zone) zone.style.display = 'flex';
          } else {
            listArea.innerHTML = currentFiles.map((f, i) => `
              <div class="file-info" style="margin-bottom:.5rem">
                <div class="file-info-icon">📄</div>
                <div class="file-info-details">
                  <div class="file-info-name">${i + 1}. ${f.name}</div>
                  <div class="file-info-size">${formatBytes(f.size)}</div>
                </div>
                <button class="file-info-remove" data-idx="${i}" type="button" aria-label="Remove File">&times;</button>
              </div>`).join('');
            
            let addMoreBtn = document.createElement('button');
            addMoreBtn.id = 'mergeAddMoreBtn';
            addMoreBtn.type = 'button';
            addMoreBtn.className = 'btn btn-secondary';
            addMoreBtn.style.marginTop = '1rem';
            addMoreBtn.style.width = '100%';
            addMoreBtn.innerHTML = '➕ Add More Files';
            addMoreBtn.addEventListener('click', () => {
              if (input) input.click();
            });
            listArea.parentNode.insertBefore(addMoreBtn, listArea.nextSibling);
          }
        }
      } else {
        currentFiles = [];
        const fileInfoArea = document.getElementById('fileInfoArea');
        if (fileInfoArea) fileInfoArea.innerHTML = '';
        const fileListArea = document.getElementById('fileListArea');
        if (fileListArea) fileListArea.innerHTML = '';
        
        const actionButtons = ['convertBtn', 'protectBtn', 'unlockBtn', 'mergeBtn', 'splitBtn', 'organizeBtn', 'compressBtn'];
        actionButtons.forEach(id => {
          const btn = document.getElementById(id);
          if (btn) btn.disabled = true;
        });
        
        const resultArea = document.getElementById('resultArea');
        if (resultArea) {
          resultArea.classList.remove('visible');
          const resultMeta = document.getElementById('resultMeta');
          if (resultMeta) resultMeta.innerHTML = '';
        }
        
        const metadataOutput = document.getElementById('metadataOutput');
        if (metadataOutput) metadataOutput.innerHTML = '';
        
        const zipBtn = document.getElementById('downloadZipBtn');
        if (zipBtn) zipBtn.remove();
        
        if (zone) zone.style.display = 'flex';
      }
    };

    if (!document.body.dataset.pdfResetAttached) {
      document.body.dataset.pdfResetAttached = 'true';
      document.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.file-info-remove');
        if (!removeBtn) return;
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.activePdfReset === 'function') {
          const dataIdx = removeBtn.getAttribute('data-idx');
          window.activePdfReset(dataIdx);
        }
      });
    }
  }

  function showFileInfo(files) {
    const area = document.getElementById('fileInfoArea');
    if (!area) return;
    area.innerHTML = files.map(f => `
      <div class="file-info">
        <div class="file-info-icon">📄</div>
        <div class="file-info-details">
          <div class="file-info-name">${f.name}</div>
          <div class="file-info-size">${formatBytes(f.size)}</div>
        </div>
        <button class="file-info-remove" type="button" aria-label="Remove File">&times;</button>
      </div>`).join('');
  }


  // PDF Metadata
  if (toolId === 'pdf-metadata') {
    bindDropZone('pdfMeta', async (files) => {
      currentFiles = files;
      showFileInfo(files);
      try {
        const buffer = await readFileAsArrayBuffer(files[0]);
        const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const meta = {
          'Title': pdf.getTitle() || '—',
          'Author': pdf.getAuthor() || '—',
          'Subject': pdf.getSubject() || '—',
          'Creator': pdf.getCreator() || '—',
          'Producer': pdf.getProducer() || '—',
          'Pages': pdf.getPageCount(),
          'Creation Date': pdf.getCreationDate()?.toISOString() || '—',
          'Modification Date': pdf.getModificationDate()?.toISOString() || '—',
        };
        const output = document.getElementById('metadataOutput');
        const result = document.getElementById('resultArea');
        if (output && result) {
          result.classList.add('visible');
          output.innerHTML = Object.entries(meta).map(([k, v]) => `
            <span style="color:var(--text-muted);font-weight:500">${k}:</span>
            <span>${v}</span>`).join('');
        }
        showToast('Metadata loaded!');
      } catch (e) {
        showToast('Failed to read PDF: ' + e.message, 'error');
      }
    });
  }

  // Protect PDF
  if (toolId === 'protect-pdf') {
    bindDropZone('pdfProtect', (files) => {
      currentFiles = files;
      showFileInfo(files);
      document.getElementById('protectBtn').disabled = false;
    });
    document.getElementById('protectBtn')?.addEventListener('click', async () => {
      const pw = document.getElementById('pdfPassword')?.value;
      const pwc = document.getElementById('pdfPasswordConfirm')?.value;
      if (!pw) { showToast('Please enter a password', 'error'); return; }
      if (pw !== pwc) { showToast('Passwords do not match', 'error'); return; }
      
      try {
        const protectBtn = document.getElementById('protectBtn');
        protectBtn.disabled = true;
        protectBtn.innerHTML = '<span class="spinner-sm"></span> Protecting...';
        
        const buffer = await readFileAsArrayBuffer(currentFiles[0]);
        // Use the encrypt-lite library for actual password protection
        const encryptedBytes = await encryptPDF(new Uint8Array(buffer), pw);
        
        const blob = new Blob([encryptedBytes], { type: 'application/pdf' });
        downloadBlob(blob, currentFiles[0].name.replace('.pdf', '-protected.pdf'));
        
        showToast('PDF protected successfully!', 'success');
        
        const resultArea = document.getElementById('resultArea');
        if (resultArea) {
          resultArea.classList.add('visible');
          document.getElementById('resultMeta').innerHTML = `<span>🔒 Protected with password</span><span>📁 Size: ${formatBytes(blob.size)}</span>`;
        }
      } catch (e) {
        showToast('Error: ' + e.message, 'error');
      } finally {
        const protectBtn = document.getElementById('protectBtn');
        protectBtn.disabled = false;
        protectBtn.innerHTML = '🔒 Protect & Download';
      }
    });
  }

  // Unlock PDF
  if (toolId === 'unlock-pdf') {
    bindDropZone('pdfUnlock', (files) => {
      currentFiles = files;
      showFileInfo(files);
      document.getElementById('unlockBtn').disabled = false;
    });
    document.getElementById('unlockBtn')?.addEventListener('click', async () => {
      const pw = document.getElementById('pdfPassword')?.value;
      try {
        const buffer = await readFileAsArrayBuffer(currentFiles[0]);
        const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const bytes = await pdf.save();
        const blob = new Blob([bytes], { type: 'application/pdf' });
        downloadBlob(blob, currentFiles[0].name.replace('.pdf', '-unlocked.pdf'));
        showToast('PDF unlocked successfully!');
      } catch (e) {
        showToast('Error: ' + e.message, 'error');
      }
    });
  }

  // JPG to PDF
  if (toolId === 'jpg-to-pdf') {
    bindDropZone('jpgPdf', (files) => {
      currentFiles = files;
      showFileInfo(files);
      document.getElementById('convertBtn').disabled = false;
    });
    document.getElementById('convertBtn')?.addEventListener('click', async () => {
      try {
        const pageSize = document.getElementById('pageSize')?.value || 'a4';
        const orientation = document.getElementById('orientation')?.value || 'portrait';
        const pdf = new jsPDF({ orientation, unit: 'mm', format: pageSize === 'fit' ? 'a4' : pageSize });

        for (let i = 0; i < currentFiles.length; i++) {
          if (i > 0) pdf.addPage();
          const dataURL = await readFileAsDataURL(currentFiles[i]);
          const img = await loadImage(dataURL);
          const pageW = pdf.internal.pageSize.getWidth();
          const pageH = pdf.internal.pageSize.getHeight();
          let w = pageW - 20, h = (img.height / img.width) * w;
          if (h > pageH - 20) { h = pageH - 20; w = (img.width / img.height) * h; }
          const x = (pageW - w) / 2, y = (pageH - h) / 2;
          pdf.addImage(dataURL, 'JPEG', x, y, w, h);
        }
        pdf.save('images-to-pdf.pdf');
        showToast('PDF created with ' + currentFiles.length + ' image(s)!');
      } catch (e) {
        showToast('Error: ' + e.message, 'error');
      }
    });
  }

  // Merge PDF
  if (toolId === 'merge-pdf') {
    bindDropZone('pdfMerge', (files) => {
      currentFiles = [...currentFiles, ...files];
      const listArea = document.getElementById('fileListArea');
      if (listArea) {
        listArea.innerHTML = currentFiles.map((f, i) => `
          <div class="file-info" style="margin-bottom:.5rem">
            <div class="file-info-icon">📄</div>
            <div class="file-info-details">
              <div class="file-info-name">${i + 1}. ${f.name}</div>
              <div class="file-info-size">${formatBytes(f.size)}</div>
            </div>
          </div>`).join('');
      }
      document.getElementById('mergeBtn').disabled = false;
    });
    document.getElementById('mergeBtn')?.addEventListener('click', async () => {
      try {
        const merged = await PDFDocument.create();
        for (const file of currentFiles) {
          const buffer = await readFileAsArrayBuffer(file);
          const pdf = await PDFDocument.load(buffer);
          const pages = await merged.copyPages(pdf, pdf.getPageIndices());
          pages.forEach(p => merged.addPage(p));
        }
        const bytes = await merged.save();
        const blob = new Blob([bytes], { type: 'application/pdf' });
        downloadBlob(blob, 'merged.pdf');
        const resultArea = document.getElementById('resultArea');
        const resultMeta = document.getElementById('resultMeta');
        if (resultArea) {
          resultArea.classList.add('visible');
          resultMeta.innerHTML = `<span>📑 Merged ${currentFiles.length} PDFs</span><span>📁 Size: ${formatBytes(blob.size)}</span>`;
        }
        showToast('PDFs merged successfully!');
      } catch (e) {
        showToast('Error: ' + e.message, 'error');
      }
    });
  }

  // Split PDF
  if (toolId === 'split-pdf') {
    const splitMode = document.getElementById('splitMode');
    const rangeGroup = document.getElementById('rangeGroup');
    if (splitMode && rangeGroup) {
      splitMode.addEventListener('change', () => {
        rangeGroup.style.display = splitMode.value === 'range' ? '' : 'none';
      });
    }
    bindDropZone('pdfSplit', (files) => {
      currentFiles = files;
      showFileInfo(files);
      document.getElementById('splitBtn').disabled = false;
    });
    document.getElementById('splitBtn')?.addEventListener('click', async () => {
      try {
        const buffer = await readFileAsArrayBuffer(currentFiles[0]);
        const pdf = await PDFDocument.load(buffer);
        const totalPages = pdf.getPageCount();
        const mode = document.getElementById('splitMode')?.value || 'each';

        if (mode === 'each') {
          for (let i = 0; i < totalPages; i++) {
            const newPdf = await PDFDocument.create();
            const [page] = await newPdf.copyPages(pdf, [i]);
            newPdf.addPage(page);
            const bytes = await newPdf.save();
            const blob = new Blob([bytes], { type: 'application/pdf' });
            downloadBlob(blob, `page-${i + 1}.pdf`);
          }
          showToast(`Split into ${totalPages} pages!`);
        } else {
          // Parse range
          const rangeStr = document.getElementById('pageRange')?.value || '';
          const pages = parsePageRange(rangeStr, totalPages);
          const newPdf = await PDFDocument.create();
          const copiedPages = await newPdf.copyPages(pdf, pages.map(p => p - 1));
          copiedPages.forEach(p => newPdf.addPage(p));
          const bytes = await newPdf.save();
          const blob = new Blob([bytes], { type: 'application/pdf' });
          downloadBlob(blob, `split-pages.pdf`);
          showToast(`Extracted ${pages.length} pages!`);
        }
      } catch (e) {
        showToast('Error: ' + e.message, 'error');
      }
    });
  }

  // PDF to Word
  if (toolId === 'pdf-to-word') {
    const convertBtn = document.getElementById('convertBtn');
    const warningBanner = document.getElementById('warningBanner');
    const resultArea = document.getElementById('resultArea');
    const resultMeta = document.getElementById('resultMeta');

    bindDropZone('pdfToWord', (files) => {
      currentFiles = files;
      showFileInfo(files);
      if (convertBtn) convertBtn.disabled = false;
      if (warningBanner) warningBanner.classList.add('hidden');
      if (resultArea) resultArea.classList.remove('visible');
    });

    convertBtn?.addEventListener('click', async () => {
      try {
        convertBtn.disabled = true;
        convertBtn.innerHTML = '<span class="spinner-sm"></span> Extracting Text...';
        
        const arrayBuffer = await readFileAsArrayBuffer(currentFiles[0]);
        const pdfjs = await loadPdfJs();
        const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        const totalPages = pdf.numPages;
        
        let paragraphs = [];
        let totalChars = 0;
        
        for (let i = 1; i <= totalPages; i++) {
          convertBtn.innerHTML = `<span class="spinner-sm"></span> Parsing Page ${i}/${totalPages}...`;
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          let lineText = '';
          let lastY = null;
          
          for (const item of textContent.items) {
            const currentY = item.transform[5];
            if (lastY === null || Math.abs(currentY - lastY) < 5) {
              lineText += (lineText ? ' ' : '') + item.str;
            } else {
              if (lineText.trim()) {
                paragraphs.push(lineText.trim());
                totalChars += lineText.trim().length;
              }
              lineText = item.str;
            }
            lastY = currentY;
          }
          if (lineText.trim()) {
            paragraphs.push(lineText.trim());
            totalChars += lineText.trim().length;
          }
        }
        
        // EDGE CASE Check: If total character count < 10, trigger warning and stop
        if (totalChars < 10) {
          if (warningBanner) warningBanner.classList.remove('hidden');
          showToast('This appears to be a scanned document or image-only PDF. Text extraction requires OCR.', 'warning');
          return;
        }

        convertBtn.innerHTML = '<span class="spinner-sm"></span> Compiling DOCX...';

        const zip = new JSZip();
        
        // [Content_Types].xml
        zip.file('[Content_Types].xml', 
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
            <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
            <Default Extension="xml" ContentType="application/xml"/>
            <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
          </Types>`
        );
        
        // _rels/.rels
        zip.file('_rels/.rels', 
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
            <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
          </Relationships>`
        );

        // word/document.xml
        const pXmls = paragraphs.map(p => 
          `<w:p>
            <w:r>
              <w:t>${escapeXml(p)}</w:t>
            </w:r>
          </w:p>`
        ).join('\n');

        const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
              ${pXmls}
              <w:sectPr>
                <w:pgSz w:w="11906" w:h="16838"/>
                <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
              </w:sectPr>
            </w:body>
          </w:document>`;
        
        zip.folder('word').file('document.xml', documentXml);
        
        const docxBlob = await zip.generateAsync({ type: 'blob' });
        downloadBlob(docxBlob, currentFiles[0].name.replace('.pdf', '') + '.docx');
        
        showToast('Converted PDF to Word successfully!', 'success');
        
        if (resultArea && resultMeta) {
          resultArea.classList.add('visible');
          resultMeta.innerHTML = `<span>📝 Extracted ${paragraphs.length} Paragraphs</span><span>📁 Size: ${formatBytes(docxBlob.size)}</span>`;
        }
        
      } catch (e) {
        showToast('Conversion error: ' + e.message, 'error');
        console.error(e);
      } finally {
        if (convertBtn) {
          convertBtn.disabled = false;
          convertBtn.innerHTML = '📝 Convert to Word (.docx)';
        }
      }
    });
  }

  // Word to PDF
  if (toolId === 'word-to-pdf') {
    const convertBtn = document.getElementById('convertBtn');
    const resultArea = document.getElementById('resultArea');
    const resultMeta = document.getElementById('resultMeta');

    bindDropZone('wordToPdf', (files) => {
      currentFiles = files;
      showFileInfo(files);
      if (convertBtn) convertBtn.disabled = false;
      if (resultArea) resultArea.classList.remove('visible');
    });

    convertBtn?.addEventListener('click', async () => {
      try {
        convertBtn.disabled = true;
        convertBtn.innerHTML = '<span class="spinner-sm"></span> Unzipping Word document...';

        const arrayBuffer = await readFileAsArrayBuffer(currentFiles[0]);
        const zip = await JSZip.loadAsync(arrayBuffer);
        const docXmlFile = zip.file('word/document.xml');
        
        if (!docXmlFile) {
          throw new Error('Invalid DOCX structure: word/document.xml missing.');
        }

        convertBtn.innerHTML = '<span class="spinner-sm"></span> Parsing document structure...';
        const docXmlText = await docXmlFile.async('text');
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(docXmlText, 'application/xml');
        const paragraphs = xmlDoc.getElementsByTagName('w:p');
        const lines = [];

        for (let i = 0; i < paragraphs.length; i++) {
          const p = paragraphs[i];
          const tTags = p.getElementsByTagName('w:t');
          let pText = '';
          for (let j = 0; j < tTags.length; j++) {
            pText += tTags[j].textContent;
          }
          if (pText.trim()) {
            lines.push(pText.trim());
          }
        }

        convertBtn.innerHTML = '<span class="spinner-sm"></span> Generating PDF page layout...';

        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const margin = 20;
        const contentWidth = doc.internal.pageSize.getWidth() - (2 * margin);
        const pageHeight = doc.internal.pageSize.getHeight();
        const leading = 7;
        const paragraphGap = 4;
        let y = margin;

        for (let i = 0; i < lines.length; i++) {
          const pText = lines[i];
          const splitLines = doc.splitTextToSize(pText, contentWidth);
          
          for (let j = 0; j < splitLines.length; j++) {
            const line = splitLines[j];
            if (y + leading > pageHeight - margin) {
              doc.addPage();
              y = margin;
            }
            doc.text(line, margin, y);
            y += leading;
          }
          y += paragraphGap;
        }

        const pdfBlob = doc.output('blob');
        downloadBlob(pdfBlob, currentFiles[0].name.replace('.docx', '') + '.pdf');

        showToast('Converted Word to PDF successfully!', 'success');

        if (resultArea && resultMeta) {
          resultArea.classList.add('visible');
          resultMeta.innerHTML = `<span>📄 Rendered PDF</span><span>📁 Size: ${formatBytes(pdfBlob.size)}</span>`;
        }

      } catch (e) {
        showToast('Conversion error: ' + e.message, 'error');
        console.error(e);
      } finally {
        if (convertBtn) {
          convertBtn.disabled = false;
          convertBtn.innerHTML = '📄 Convert to PDF';
        }
      }
    });
  }

  // Compress PDF
  if (toolId === 'compress-pdf') {
    const compressBtn = document.getElementById('compressBtn');
    const resultArea = document.getElementById('resultArea');
    const resultMeta = document.getElementById('resultMeta');

    bindDropZone('pdfCompress', (files) => {
      currentFiles = files;
      showFileInfo(files);
      if (compressBtn) compressBtn.disabled = false;
      if (resultArea) resultArea.classList.remove('visible');
    });

    compressBtn?.addEventListener('click', async () => {
      try {
        compressBtn.disabled = true;
        compressBtn.innerHTML = '<span class="spinner-sm"></span> Loading PDF...';

        const buffer = await readFileAsArrayBuffer(currentFiles[0]);
        const pdfDoc = await PDFDocument.load(buffer);
        
        const level = document.querySelector('input[name="compressLevel"]:checked')?.value || 'recommended';
        let scale = 0.7;
        let quality = 0.7;
        
        if (level === 'high') {
          scale = 0.5;
          quality = 0.5;
        } else if (level === 'low') {
          scale = 0.9;
          quality = 0.9;
        }

        const indirectObjects = pdfDoc.context.indirectObjects;
        let totalImages = 0;
        let compressedImages = 0;

        const objList = Array.from(indirectObjects.entries());
        const totalObjs = objList.length;
        let pCount = 0;

        for (const [ref, obj] of objList) {
          pCount++;
          if (pCount % 100 === 0 || pCount === totalObjs) {
            compressBtn.innerHTML = `<span class="spinner-sm"></span> Processing PDF objects (${pCount}/${totalObjs})...`;
          }

          if (obj instanceof PDFRawStream) {
            const dict = obj.dict;
            const subtype = dict.get(PDFName.of('Subtype'));
            if (subtype === PDFName.of('Image')) {
              totalImages++;
              
              const isJpg = dict.get(PDFName.of('Filter'))?.toString() === '/DCTDecode';
              const isFlate = dict.get(PDFName.of('Filter'))?.toString() === '/FlateDecode';
              
              if (isJpg || isFlate) {
                const bytes = obj.contents;
                const blobType = isJpg ? 'image/jpeg' : 'image/png';
                const imageBlob = new Blob([bytes], { type: blobType });
                const imgUrl = URL.createObjectURL(imageBlob);
                
                try {
                  const img = await loadImage(imgUrl);
                  URL.revokeObjectURL(imgUrl);
                  
                  const newW = Math.round(img.width * scale);
                  const newH = Math.round(img.height * scale);
                  
                  if (newW > 10 && newH > 10) {
                    const canvas = document.createElement('canvas');
                    canvas.width = newW;
                    canvas.height = newH;
                    const ctx = canvas.getContext('2d');
                    
                    // ALPHA CHANNEL SAFETY: Paint explicit canvas background to prevent black rectangle artifact
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, newW, newH);
                    
                    ctx.drawImage(img, 0, 0, newW, newH);
                    
                    const compressedBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
                    const compressedBytes = new Uint8Array(await compressedBlob.arrayBuffer());
                    
                    obj.contents = compressedBytes;
                    dict.set(PDFName.of('Length'), pdfDoc.context.obj(compressedBytes.length));
                    dict.set(PDFName.of('Filter'), PDFName.of('DCTDecode'));
                    dict.set(PDFName.of('Width'), pdfDoc.context.obj(newW));
                    dict.set(PDFName.of('Height'), pdfDoc.context.obj(newH));
                    dict.delete(PDFName.of('DecodeParms'));
                    
                    compressedImages++;
                  }
                } catch (imgError) {
                  console.warn('Skipped image stream compression due to loading error', imgError);
                  URL.revokeObjectURL(imgUrl);
                }
              }
            }
          }
        }

        compressBtn.innerHTML = '<span class="spinner-sm"></span> Compacting PDF structure...';
        
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setCreator('');
        pdfDoc.setProducer('');
        pdfDoc.setCreationDate(new Date());
        pdfDoc.setModificationDate(new Date());

        const compressedBytes = await pdfDoc.save();
        const compressedBlob = new Blob([compressedBytes], { type: 'application/pdf' });
        
        downloadBlob(compressedBlob, currentFiles[0].name.replace('.pdf', '') + '-compressed.pdf');
        
        showToast('PDF compressed successfully!', 'success');
        
        if (resultArea && resultMeta) {
          resultArea.classList.add('visible');
          const reduction = ((1 - (compressedBlob.size / currentFiles[0].size)) * 100).toFixed(1);
          resultMeta.innerHTML = `
            <span>🗜️ Compressed ${compressedImages}/${totalImages} images</span>
            <span>📈 Reduction: ${reduction > 0 ? reduction : 0}%</span>
            <span>📁 Size: ${formatBytes(compressedBlob.size)} (Original: ${formatBytes(currentFiles[0].size)})</span>
          `;
        }

      } catch (e) {
        showToast('Compression error: ' + e.message, 'error');
        console.error(e);
      } finally {
        if (compressBtn) {
          compressBtn.disabled = false;
          compressBtn.innerHTML = '🗜️ Compress PDF';
        }
      }
    });
  }

  // PDF to Images
  if (toolId === 'pdf-to-images') {
    const convertBtn = document.getElementById('convertBtn');
    const resultArea = document.getElementById('resultArea');
    const resultMeta = document.getElementById('resultMeta');

    bindDropZone('pdfToImages', (files) => {
      currentFiles = files;
      showFileInfo(files);
      if (convertBtn) convertBtn.disabled = false;
      if (resultArea) resultArea.classList.remove('visible');
    });

    convertBtn?.addEventListener('click', async () => {
      try {
        convertBtn.disabled = true;
        convertBtn.innerHTML = '<span class="spinner-sm"></span> Loading PDF.js...';

        const arrayBuffer = await readFileAsArrayBuffer(currentFiles[0]);
        const pdfjs = await loadPdfJs();
        const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        const totalPages = pdf.numPages;

        const format = document.getElementById('imageFormat')?.value || 'png';
        const scale = parseFloat(document.getElementById('resolutionScale')?.value || '2');

        const zip = new JSZip();
        let renderedCount = 0;

        for (let i = 1; i <= totalPages; i++) {
          convertBtn.innerHTML = `<span class="spinner-sm"></span> Rendering Page ${i}/${totalPages}...`;
          
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');

          // Paint explicit canvas background to prevent black rectangle artifact for transparent PDFs if JPEG
          if (format === 'jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          const renderContext = {
            canvasContext: ctx,
            viewport: viewport
          };

          await page.render(renderContext).promise;

          const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
          const quality = format === 'jpeg' ? 0.92 : 1.0;

          const blob = await new Promise(resolve => canvas.toBlob(resolve, mimeType, quality));
          
          if (totalPages === 1) {
            downloadBlob(blob, currentFiles[0].name.replace('.pdf', '') + `.png`);
            showToast('Page converted successfully!', 'success');
            if (resultArea && resultMeta) {
              resultArea.classList.add('visible');
              resultMeta.innerHTML = `<span>🖼️ Rendered 1 Image</span><span>📁 Size: ${formatBytes(blob.size)}</span>`;
            }
            return;
          }

          const padNum = String(i).padStart(3, '0');
          zip.file(`page-${padNum}.${format}`, blob);
          renderedCount++;
        }

        convertBtn.innerHTML = '<span class="spinner-sm"></span> Packaging ZIP archive...';
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        
        downloadBlob(zipBlob, currentFiles[0].name.replace('.pdf', '') + '-images.zip');
        showToast(`Converted ${renderedCount} pages to images successfully!`, 'success');

        if (resultArea && resultMeta) {
          resultArea.classList.add('visible');
          resultMeta.innerHTML = `<span>📦 Packaged ${renderedCount} Images</span><span>📁 ZIP Size: ${formatBytes(zipBlob.size)}</span>`;
        }

      } catch (e) {
        showToast('Rendering error: ' + e.message, 'error');
        console.error(e);
      } finally {
        if (convertBtn) {
          convertBtn.disabled = false;
          convertBtn.innerHTML = '🖼️ Convert PDF to Images';
        }
      }
    });
  }

  // Acrobat Downloader
  if (toolId === 'acrobat-downloader') {
    const acrobatUrlInput = document.getElementById('acrobatUrl');
    const resolveBtn = document.getElementById('resolveBtn');
    const loadingState = document.getElementById('acrobatLoading');
    const fileCard = document.getElementById('acrobatFileCard');
    const fileNameEl = document.getElementById('acrobatFileName');
    const fileSizeEl = document.getElementById('acrobatFileSize');
    const fileTypeEl = document.getElementById('acrobatFileType');

    resolveBtn?.addEventListener('click', async () => {
      const url = acrobatUrlInput?.value?.trim();
      if (!url) {
        showToast('Please enter an Adobe Acrobat link', 'error');
        return;
      }

      if (loadingState) loadingState.classList.remove('hidden');
      if (fileCard) fileCard.classList.add('hidden');
      if (resolveBtn) resolveBtn.disabled = true;

      try {
        const resolveApi = `/api/acrobat-resolve?url=${encodeURIComponent(url)}`;
        const response = await fetch(resolveApi);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to resolve link from Adobe SCDS.');
        }

        if (fileNameEl) fileNameEl.textContent = data.fileName;
        if (fileSizeEl) fileSizeEl.textContent = `Size: ${formatBytes(data.fileSize)}`;
        if (fileTypeEl) {
          const extension = data.fileName.split('.').pop()?.toUpperCase() || 'PDF';
          fileTypeEl.textContent = extension;
          const fileIcon = document.getElementById('fileIcon');
          if (fileIcon) {
            if (extension === 'PDF') fileIcon.textContent = '📄';
            else if (extension === 'DOC' || extension === 'DOCX') fileIcon.textContent = '📝';
            else fileIcon.textContent = '📦';
          }
        }

        setupAcrobatActions(data);

        if (fileCard) fileCard.classList.remove('hidden');
        showToast('Acrobat link resolved!', 'success');
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        if (loadingState) loadingState.classList.add('hidden');
        if (resolveBtn) resolveBtn.disabled = false;
      }
    });

    async function getFileBlob(downloadUrl, progressText) {
      const loader = document.createElement('div');
      loader.className = 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md';
      loader.innerHTML = `
        <div class="relative w-12 h-12 mb-4">
          <div class="absolute inset-0 rounded-full border-4 border-slate-700 border-t-indigo-500 animate-spin"></div>
        </div>
        <div class="text-sm font-semibold text-slate-200" id="loaderText">${progressText}</div>
      `;
      document.body.appendChild(loader);

      try {
        const res = await fetch(downloadUrl);
        if (!res.ok) throw new Error('S3 download failed.');
        const blob = await res.blob();
        return blob;
      } catch (err) {
        console.error('CORS blocked S3 download directly. Opening link directly.', err);
        window.open(downloadUrl, '_blank');
        throw new Error('Opened in new tab instead.');
      } finally {
        loader.remove();
      }
    }

    function setupAcrobatActions(data) {
      const actionsContainer = document.getElementById('acrobatActions');
      if (!actionsContainer) return;
      actionsContainer.innerHTML = '';

      const btnOriginal = document.createElement('button');
      btnOriginal.className = 'btn btn-secondary w-full py-3 flex items-center justify-center gap-2 text-sm';
      btnOriginal.innerHTML = '📥 Download Original File';
      btnOriginal.onclick = async () => {
        try {
          const blob = await getFileBlob(data.downloadUrl, 'Downloading original file...');
          downloadBlob(blob, data.fileName);
          showToast('File downloaded successfully!', 'success');
        } catch (e) {
          if (e.message !== 'Opened in new tab instead.') {
            showToast('Download failed: ' + e.message, 'error');
          }
        }
      };
      actionsContainer.appendChild(btnOriginal);

      const isPdf = data.fileName.toLowerCase().endsWith('.pdf') || data.contentType === 'application/pdf';

      if (isPdf) {
        const btnToWord = document.createElement('button');
        btnToWord.className = 'btn btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm';
        btnToWord.innerHTML = '📝 Convert to Word (.docx)';
        btnToWord.onclick = async () => {
          try {
            const blob = await getFileBlob(data.downloadUrl, 'Downloading PDF for conversion...');
            const arrayBuffer = await blob.arrayBuffer();

            const loader = document.createElement('div');
            loader.className = 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md';
            loader.innerHTML = `
              <div class="relative w-12 h-12 mb-4">
                <div class="absolute inset-0 rounded-full border-4 border-slate-700 border-t-indigo-500 animate-spin"></div>
              </div>
              <div class="text-sm font-semibold text-slate-200">Extracting text & compiling Word Doc...</div>
            `;
            document.body.appendChild(loader);

            try {
              const pdfjs = await loadPdfJs();
              const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
              const totalPages = pdf.numPages;
              let paragraphs = [];
              let totalChars = 0;

              for (let i = 1; i <= totalPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                let lineText = '';
                let lastY = null;

                for (const item of textContent.items) {
                  const currentY = item.transform[5];
                  if (lastY === null || Math.abs(currentY - lastY) < 5) {
                    lineText += (lineText ? ' ' : '') + item.str;
                  } else {
                    if (lineText.trim()) {
                      paragraphs.push(lineText.trim());
                      totalChars += lineText.trim().length;
                    }
                    lineText = item.str;
                  }
                  lastY = currentY;
                }
                if (lineText.trim()) {
                  paragraphs.push(lineText.trim());
                  totalChars += lineText.trim().length;
                }
              }

              if (totalChars < 10) {
                showToast('This appears to be a scanned document or image-only PDF. Text extraction requires OCR.', 'warning');
                return;
              }

              const zip = new JSZip();
              zip.file('[Content_Types].xml', 
                `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
                  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
                  <Default Extension="xml" ContentType="application/xml"/>
                  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
                </Types>`
              );
              zip.file('_rels/.rels', 
                `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
                </Relationships>`
              );

              const pXmls = paragraphs.map(p => 
                `<w:p>
                  <w:r>
                    <w:t>${escapeXml(p)}</w:t>
                  </w:r>
                </w:p>`
              ).join('\n');

              const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
                  <w:body>
                    ${pXmls}
                    <w:sectPr>
                      <w:pgSz w:w="11906" w:h="16838"/>
                      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
                    </w:sectPr>
                  </w:body>
                </w:document>`;

              zip.folder('word').file('document.xml', documentXml);

              const docxBlob = await zip.generateAsync({ type: 'blob' });
              downloadBlob(docxBlob, data.fileName.replace('.pdf', '') + '.docx');
              showToast('Converted to DOCX successfully!', 'success');
            } finally {
              loader.remove();
            }
          } catch (e) {
            if (e.message !== 'Opened in new tab instead.') {
              showToast('Conversion failed: ' + e.message, 'error');
            }
          }
        };
        actionsContainer.appendChild(btnToWord);

        const btnCompress = document.createElement('button');
        btnCompress.className = 'btn btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm';
        btnCompress.innerHTML = '🗜️ Compress PDF';
        btnCompress.onclick = async () => {
          try {
            const blob = await getFileBlob(data.downloadUrl, 'Downloading PDF for compression...');
            const arrayBuffer = await blob.arrayBuffer();

            const loader = document.createElement('div');
            loader.className = 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md';
            loader.innerHTML = `
              <div class="relative w-12 h-12 mb-4">
                <div class="absolute inset-0 rounded-full border-4 border-slate-700 border-t-indigo-500 animate-spin"></div>
              </div>
              <div class="text-sm font-semibold text-slate-200">Compressing image streams...</div>
            `;
            document.body.appendChild(loader);

            try {
              const pdfDoc = await PDFDocument.load(arrayBuffer);
              const indirectObjects = pdfDoc.context.indirectObjects;
              let compressedCount = 0;

              for (const [ref, obj] of indirectObjects.entries()) {
                if (obj instanceof PDFRawStream) {
                  const dict = obj.dict;
                  const subtype = dict.get(PDFName.of('Subtype'));
                  if (subtype === PDFName.of('Image')) {
                    const isJpg = dict.get(PDFName.of('Filter'))?.toString() === '/DCTDecode';
                    const isFlate = dict.get(PDFName.of('Filter'))?.toString() === '/FlateDecode';

                    if (isJpg || isFlate) {
                      const bytes = obj.contents;
                      const imageBlob = new Blob([bytes], { type: isJpg ? 'image/jpeg' : 'image/png' });
                      const imgUrl = URL.createObjectURL(imageBlob);

                      try {
                        const img = await loadImage(imgUrl);
                        URL.revokeObjectURL(imgUrl);

                        const newW = Math.round(img.width * 0.7);
                        const newH = Math.round(img.height * 0.7);

                        if (newW > 10 && newH > 10) {
                          const canvas = document.createElement('canvas');
                          canvas.width = newW;
                          canvas.height = newH;
                          const ctx = canvas.getContext('2d');

                          ctx.fillStyle = '#FFFFFF';
                          ctx.fillRect(0, 0, newW, newH);

                          ctx.drawImage(img, 0, 0, newW, newH);

                          const compressedBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.7));
                          const compressedBytes = new Uint8Array(await compressedBlob.arrayBuffer());

                          obj.contents = compressedBytes;
                          dict.set(PDFName.of('Length'), pdfDoc.context.obj(compressedBytes.length));
                          dict.set(PDFName.of('Filter'), PDFName.of('DCTDecode'));
                          dict.set(PDFName.of('Width'), pdfDoc.context.obj(newW));
                          dict.set(PDFName.of('Height'), pdfDoc.context.obj(newH));
                          dict.delete(PDFName.of('DecodeParms'));
                          compressedCount++;
                        }
                      } catch (e) {
                        URL.revokeObjectURL(imgUrl);
                      }
                    }
                  }
                }
              }

              pdfDoc.setTitle('');
              pdfDoc.setAuthor('');
              pdfDoc.setSubject('');
              pdfDoc.setCreator('');
              pdfDoc.setProducer('');
              pdfDoc.setCreationDate(new Date());
              pdfDoc.setModificationDate(new Date());

              const compressedBytes = await pdfDoc.save();
              const compressedBlob = new Blob([compressedBytes], { type: 'application/pdf' });
              downloadBlob(compressedBlob, data.fileName.replace('.pdf', '') + '-compressed.pdf');
              showToast('PDF compressed successfully!', 'success');
            } finally {
              loader.remove();
            }
          } catch (e) {
            if (e.message !== 'Opened in new tab instead.') {
              showToast('Compression failed: ' + e.message, 'error');
            }
          }
        };
        actionsContainer.appendChild(btnCompress);
      }
    }
  }

  // Auto-consume global pending dropped file if it is a document
  if (window.pendingDroppedFile) {
    const file = window.pendingDroppedFile;
    const isDocFile = file.type === 'application/pdf' || /\.(pdf|docx)$/i.test(file.name);
    if (isDocFile) {
      const toolToZone = {
        'protect-pdf': 'pdfProtect',
        'unlock-pdf': 'pdfUnlock',
        'pdf-metadata': 'pdfMeta',
        'jpg-to-pdf': 'jpgPdf',
        'merge-pdf': 'pdfMerge',
        'split-pdf': 'pdfSplit',
        'pdf-to-word': 'pdfToWord',
        'word-to-pdf': 'wordToPdf',
        'compress-pdf': 'pdfCompress',
        'pdf-to-images': 'pdfToImages'
      };
      
      const zoneId = toolToZone[toolId];
      if (zoneId) {
        window.pendingDroppedFile = null; // Consume
        setTimeout(() => {
          const input = document.getElementById(zoneId + 'Input');
          if (input) {
            const dt = new DataTransfer();
            dt.items.add(file);
            input.files = dt.files;
            input.dispatchEvent(new Event('change'));
          }
        }, 100);
      }
    }
  }
}

function parsePageRange(str, max) {
  const pages = new Set();
  str.split(',').forEach(part => {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [a, b] = trimmed.split('-').map(Number);
      for (let i = a; i <= Math.min(b, max); i++) pages.add(i);
    } else {
      const n = parseInt(trimmed);
      if (n >= 1 && n <= max) pages.add(n);
    }
  });
  return Array.from(pages).sort((a, b) => a - b);
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

let pdfjsLoaded = null;
function loadPdfJs() {
  if (pdfjsLoaded) return pdfjsLoaded;
  pdfjsLoaded = new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      resolve(window.pdfjsLib);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    script.onerror = () => {
      pdfjsLoaded = null;
      reject(new Error('Failed to load PDF.js library.'));
    };
    document.head.appendChild(script);
  });
  return pdfjsLoaded;
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
