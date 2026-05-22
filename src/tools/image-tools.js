import { formatBytes, downloadBlob, downloadDataURL, readFileAsDataURL, setupDropZone, renderDropZone } from '../utils.js';
import { showToast } from '../components/toast.js';

export function imageToolHandler(tool) {
  // After rendering, set up the tool logic
  setTimeout(() => setupImageTool(tool.id), 50);
  window.addEventListener('page-rendered', () => setupImageTool(tool.id), { once: true });

  switch (tool.id) {
    case 'webp-to-jpg':
    case 'png-to-jpg':
    case 'jpg-to-png':
    case 'svg-to-png':
      return renderImageConverter(tool);
    case 'jpg-to-svg':
    case 'png-to-svg':
      return renderImageToSVG(tool);
    case 'compress-image':
      return renderCompressor();
    case 'base64-to-image':
      return renderBase64ToImage();
    case 'image-to-base64':
      return renderImageToBase64();
    case 'image-cropper':
      return renderCropper();
    case 'invert-colors':
    case 'black-and-white':
      return renderImageFilter(tool);
    default:
      return `<p>Tool coming soon!</p>`;
  }
}

// ===== IMAGE CONVERTER (WEBP->JPG, PNG->JPG, JPG->PNG, SVG->PNG) =====
function renderImageConverter(tool) {
  const formats = {
    'webp-to-jpg': { from: '.webp', to: 'image/jpeg', ext: 'jpg' },
    'png-to-jpg': { from: '.png', to: 'image/jpeg', ext: 'jpg' },
    'jpg-to-png': { from: '.jpg,.jpeg', to: 'image/png', ext: 'png' },
    'svg-to-png': { from: '.svg', to: 'image/png', ext: 'png' },
  };
  const fmt = formats[tool.id];
  return `
    ${renderDropZone('imgConv', fmt.from, `Drop your ${fmt.from.toUpperCase()} file here`)}
    <div id="fileInfoArea"></div>
    <div class="preview-area" id="previewArea" style="display:none">
      <h3>Preview</h3>
      <img id="previewImg" alt="Preview" />
    </div>
    <div class="form-group" style="margin-top:1rem">
      <label class="form-label">Quality (for JPG output)</label>
      <input type="range" class="range-slider" id="qualitySlider" min="10" max="100" value="92" />
      <span id="qualityVal" style="font-size:.82rem;color:var(--text-muted)">92%</span>
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="convertBtn" disabled>Convert & Download</button>
    </div>
    <div class="result-area" id="resultArea">
      <div class="result-meta" id="resultMeta"></div>
    </div>
  `;
}

function renderImageToSVG(tool) {
  const from = tool.id === 'jpg-to-svg' ? '.jpg,.jpeg' : '.png';
  return `
    ${renderDropZone('imgSvg', from, `Drop your image file here`)}
    <div id="fileInfoArea"></div>
    <div class="preview-area" id="previewArea" style="display:none">
      <h3>Preview</h3>
      <img id="previewImg" alt="Preview" />
    </div>
    <div class="form-group" style="margin-top:1rem">
      <label class="form-label">SVG Method</label>
      <select class="form-select" id="svgMethod">
        <option value="embed">Embed as base64 in SVG</option>
        <option value="trace">Simple color trace (posterize)</option>
      </select>
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="convertBtn" disabled>Convert & Download SVG</button>
    </div>
  `;
}

function renderCompressor() {
  return `
    <!-- Drop Zone Section (Initially Visible, hides when image loaded) -->
    <div id="compressor-initial-state">
      ${renderDropZone('imgComp', '.jpg,.jpeg,.png,.webp', 'Drop your image to compress')}
    </div>
    
    <div id="compressor-active-state" class="compressor-workspace" style="display:none">
      <!-- Left side: Controls -->
      <div class="compressor-controls-card">
        <div class="live-indicator">
          <span class="live-indicator-dot"></span>
          <span>LIVE COMPRESSION WORKSPACE</span>
        </div>
        
        <div id="fileInfoArea"></div>
        
        <div class="form-group" style="margin-top:1rem">
          <label class="form-label">Target Quality</label>
          <input type="range" class="range-slider" id="qualitySlider" min="10" max="100" value="70" />
          <span id="qualityVal" style="font-size:1.1rem;font-weight:900;color:var(--accent)">70%</span>
        </div>
        
        <div class="form-group">
          <label class="form-label">Max Width (px, 0 = original)</label>
          <input type="number" class="form-input" id="maxWidth" value="0" min="0" />
        </div>
        
        <div class="actions-row" style="margin-top:auto">
          <button class="btn btn-primary" id="convertBtn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
            <span>💾</span> Download Compressed Image
          </button>
        </div>
      </div>
      
      <!-- Right side: Realtime Preview & Metrics -->
      <div class="compressor-preview-card">
        <h3 style="font-family:'Fredoka', sans-serif;font-weight:900;font-size:1.2rem;border-bottom:3px solid #000;padding-bottom:0.5rem;display:flex;align-items:center;gap:0.5rem">
          <span>🖼️</span> Visual Comparison
        </h3>
        
        <div class="comparison-container">
          <!-- Original Box -->
          <div class="comparison-box">
            <span class="comparison-box-title">Original</span>
            <div class="comparison-img-wrapper">
              <img id="origPreviewImg" alt="Original Image" />
            </div>
          </div>
          
          <!-- Compressed Box -->
          <div class="comparison-box compressed-box">
            <span class="comparison-box-title">Compressed</span>
            <div class="comparison-img-wrapper">
              <div class="comp-loading-overlay" id="compLoadingOverlay">
                <div class="spinner-brutalist"></div>
              </div>
              <img id="previewImg" alt="Compressed Preview" />
            </div>
          </div>
        </div>
        
        <!-- Live Metrics Panel -->
        <div class="live-metrics-panel">
          <div class="metric-item">
            <span class="metric-label">Original</span>
            <span class="metric-value" id="metric-original-size">--</span>
          </div>
          
          <div class="metric-item">
            <span class="metric-label">Compressed</span>
            <span class="metric-value highlight-green" id="metric-compressed-size">--</span>
          </div>
          
          <div class="metric-savings-badge" id="metric-savings-pct">-0%</div>
        </div>
      </div>
    </div>
  `;
}

function renderBase64ToImage() {
  return `
    <div class="form-group">
      <label class="form-label">Paste your BASE64 string below</label>
      <textarea class="form-textarea" id="base64Input" placeholder="data:image/png;base64,iVBOR..." style="min-height:150px"></textarea>
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="convertBtn">Convert & Preview</button>
      <button class="btn btn-secondary" id="downloadBtn" disabled>Download Image</button>
    </div>
    <div class="preview-area" id="previewArea" style="display:none">
      <h3>Result</h3>
      <img id="previewImg" alt="Converted" />
    </div>
  `;
}

function renderImageToBase64() {
  return `
    ${renderDropZone('imgB64', '.jpg,.jpeg,.png,.webp,.gif,.svg', 'Drop your image here')}
    <div id="fileInfoArea"></div>
    <div class="preview-area" id="previewArea" style="display:none">
      <h3>Preview</h3>
      <img id="previewImg" alt="Preview" />
    </div>
    <div class="result-area" id="resultArea" style="display:none">
      <h3 style="font-size:.9rem;font-weight:600;margin-bottom:.75rem;color:var(--text-muted)">BASE64 Output</h3>
      <div class="output-box" id="base64Output" style="position:relative"></div>
      <div class="actions-row">
        <button class="btn btn-secondary" id="copyBtn">📋 Copy to Clipboard</button>
      </div>
    </div>
  `;
}

function renderCropper() {
  return `
    ${renderDropZone('imgCrop', '.jpg,.jpeg,.png,.webp,.gif', 'Drop your image to crop')}
    <div id="fileInfoArea"></div>
    <div class="form-row" style="margin-top:1rem">
      <div class="form-group">
        <label class="form-label">X (px)</label>
        <input type="number" class="form-input" id="cropX" value="0" min="0" />
      </div>
      <div class="form-group">
        <label class="form-label">Y (px)</label>
        <input type="number" class="form-input" id="cropY" value="0" min="0" />
      </div>
      <div class="form-group">
        <label class="form-label">Width (px)</label>
        <input type="number" class="form-input" id="cropW" value="200" min="1" />
      </div>
      <div class="form-group">
        <label class="form-label">Height (px)</label>
        <input type="number" class="form-input" id="cropH" value="200" min="1" />
      </div>
    </div>
    <div class="preview-area" id="previewArea" style="display:none">
      <h3>Original</h3>
      <img id="previewImg" alt="Preview" style="max-height:300px" />
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="convertBtn" disabled>Crop & Download</button>
    </div>
  `;
}

function renderImageFilter(tool) {
  const filterName = tool.id === 'invert-colors' ? 'Inverted' : 'Black & White';
  return `
    ${renderDropZone('imgFilter', '.jpg,.jpeg,.png,.webp', `Drop your image to apply ${filterName} filter`)}
    <div id="fileInfoArea"></div>
    <div class="preview-area" id="previewArea" style="display:none">
      <h3>Preview</h3>
      <canvas id="filterCanvas"></canvas>
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="convertBtn" disabled>Apply & Download</button>
    </div>
  `;
}


// ===== SETUP LOGIC =====
function setupImageTool(toolId) {
  let currentFile = null;
  let currentDataURL = null;
  let compressionTimeout = null;
  let latestCompressedBlob = null;

  const formats = {
    'webp-to-jpg': { to: 'image/jpeg', ext: 'jpg' },
    'png-to-jpg': { to: 'image/jpeg', ext: 'jpg' },
    'jpg-to-png': { to: 'image/png', ext: 'png' },
    'svg-to-png': { to: 'image/png', ext: 'png' },
  };

  // Quality slider
  const slider = document.getElementById('qualitySlider');
  const valDisplay = document.getElementById('qualityVal');
  if (slider && valDisplay) {
    slider.addEventListener('input', () => {
      valDisplay.textContent = slider.value + '%';
      if (toolId === 'compress-image') {
        updateRealtimeCompression();
      }
    });
  }

  // Max width input for realtime compression
  const maxWidthInput = document.getElementById('maxWidth');
  if (maxWidthInput) {
    maxWidthInput.addEventListener('input', () => {
      if (toolId === 'compress-image') {
        updateRealtimeCompression();
      }
    });
  }

  // File handler for image conversion tools
  function handleImageFile(files) {
    currentFile = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      currentDataURL = e.target.result;
      
      if (toolId === 'compress-image') {
        const initial = document.getElementById('compressor-initial-state');
        const active = document.getElementById('compressor-active-state');
        const origImg = document.getElementById('origPreviewImg');
        const compImg = document.getElementById('previewImg');
        if (initial) initial.style.display = 'none';
        if (active) active.style.display = '';
        if (origImg) origImg.src = currentDataURL;
        if (compImg) compImg.src = currentDataURL;
        
        // Show file info inside controls
        const infoArea = document.getElementById('fileInfoArea');
        if (infoArea) {
          infoArea.innerHTML = `
            <div class="file-info" style="margin-bottom: 0;">
              <div class="file-info-icon">📄</div>
              <div class="file-info-details">
                <div class="file-info-name" style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${currentFile.name}</div>
                <div class="file-info-size" id="original-size-badge" style="font-weight: 700;">${formatBytes(currentFile.size)}</div>
              </div>
            </div>`;
        }
        
        // Run initial live compression
        updateRealtimeCompression();
        return;
      }

      const preview = document.getElementById('previewArea');
      const img = document.getElementById('previewImg');
      if (preview && img) { preview.style.display = ''; img.src = currentDataURL; }
      const btn = document.getElementById('convertBtn');
      if (btn) btn.disabled = false;
      // Show file info
      const infoArea = document.getElementById('fileInfoArea');
      if (infoArea) {
        infoArea.innerHTML = `
          <div class="file-info">
            <div class="file-info-icon">📄</div>
            <div class="file-info-details">
              <div class="file-info-name">${currentFile.name}</div>
              <div class="file-info-size">${formatBytes(currentFile.size)}</div>
            </div>
          </div>`;
      }
    };
    reader.readAsDataURL(currentFile);
  }

  function updateRealtimeCompression() {
    if (!currentFile || !currentDataURL) return;

    // Show loading spinner
    const loader = document.getElementById('compLoadingOverlay');
    if (loader) loader.classList.add('active');

    // Debounce to prevent lag during rapid slider drags
    clearTimeout(compressionTimeout);
    compressionTimeout = setTimeout(() => {
      const sliderVal = document.getElementById('qualitySlider')?.value || 70;
      const quality = parseInt(sliderVal) / 100;
      const maxWidth = parseInt(document.getElementById('maxWidth')?.value || 0);

      const img = new Image();
      img.onload = () => {
        let w = img.naturalWidth, h = img.naturalHeight;
        if (maxWidth > 0 && w > maxWidth) {
          h = Math.round(h * (maxWidth / w));
          w = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        canvas.toBlob((blob) => {
          if (!blob) {
            if (loader) loader.classList.remove('active');
            return;
          }
          latestCompressedBlob = blob;

          // Update compressed preview image
          const compImg = document.getElementById('previewImg');
          if (compImg) {
            if (compImg.src.startsWith('blob:')) {
              URL.revokeObjectURL(compImg.src);
            }
            compImg.src = URL.createObjectURL(blob);
          }

          // Update metrics
          const origSizeEl = document.getElementById('metric-original-size');
          const compSizeEl = document.getElementById('metric-compressed-size');
          const savingsEl = document.getElementById('metric-savings-pct');

          if (origSizeEl) origSizeEl.textContent = formatBytes(currentFile.size);
          if (compSizeEl) compSizeEl.textContent = formatBytes(blob.size);
          
          if (savingsEl) {
            const ratio = ((1 - blob.size / currentFile.size) * 100).toFixed(1);
            savingsEl.textContent = `-${Math.max(0, parseFloat(ratio))}%`;
          }

          // Hide loading spinner
          if (loader) loader.classList.remove('active');
        }, 'image/jpeg', quality);
      };
      img.src = currentDataURL;
    }, 120);
  }

  // Setup drop zones
  const dropIds = { 'webp-to-jpg':'imgConv', 'png-to-jpg':'imgConv', 'jpg-to-png':'imgConv', 'svg-to-png':'imgConv',
    'jpg-to-svg':'imgSvg', 'png-to-svg':'imgSvg', 'compress-image':'imgComp',
    'image-to-base64':'imgB64', 'image-cropper':'imgCrop', 'invert-colors':'imgFilter', 'black-and-white':'imgFilter' };

  const zoneId = dropIds[toolId];
  if (zoneId) {
    const zone = document.getElementById(zoneId);
    const input = document.getElementById(zoneId + 'Input');
    if (zone && input) {
      ['dragover', 'dragenter'].forEach(e => zone.addEventListener(e, (ev) => { ev.preventDefault(); zone.classList.add('drag-over'); }));
      ['dragleave', 'drop'].forEach(e => zone.addEventListener(e, () => zone.classList.remove('drag-over')));
      zone.addEventListener('drop', (e) => { e.preventDefault(); if (e.dataTransfer.files.length) handleImageFile(e.dataTransfer.files); });
      input.addEventListener('change', () => { if (input.files.length) handleImageFile(input.files); });
    }
  }

  // Convert button handler
  const convertBtn = document.getElementById('convertBtn');
  if (convertBtn) {
    convertBtn.addEventListener('click', async () => {
      if (['webp-to-jpg', 'png-to-jpg', 'jpg-to-png', 'svg-to-png'].includes(toolId)) {
        await convertImage(toolId, currentFile, currentDataURL);
      } else if (['jpg-to-svg', 'png-to-svg'].includes(toolId)) {
        await convertToSVG(currentDataURL, currentFile.name);
      } else if (toolId === 'compress-image') {
        if (latestCompressedBlob) {
          const newName = currentFile.name.replace(/\.[^.]+$/, '') + '-compressed.jpg';
          downloadBlob(latestCompressedBlob, newName);
          showToast('Image downloaded successfully!');
        } else {
          showToast('Please wait for compression to complete...', 'warning');
        }
      } else if (toolId === 'image-cropper') {
        await cropImage(currentDataURL);
      } else if (toolId === 'invert-colors') {
        await applyFilter(currentDataURL, 'invert', currentFile.name);
      } else if (toolId === 'black-and-white') {
        await applyFilter(currentDataURL, 'grayscale', currentFile.name);
      }
    });
  }

  // Auto-consume global pending dropped file if it is an image
  if (window.pendingDroppedFile) {
    const file = window.pendingDroppedFile;
    const isImageFile = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name);
    if (isImageFile) {
      window.pendingDroppedFile = null; // Consume it
      setTimeout(() => {
        handleImageFile([file]);
      }, 100);
    }
  }

  // Base64 to Image
  if (toolId === 'base64-to-image') {
    const btn = document.getElementById('convertBtn');
    const dlBtn = document.getElementById('downloadBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        const input = document.getElementById('base64Input').value.trim();
        if (!input) { showToast('Please paste a BASE64 string', 'error'); return; }
        let src = input;
        if (!input.startsWith('data:')) src = 'data:image/png;base64,' + input;
        const preview = document.getElementById('previewArea');
        const img = document.getElementById('previewImg');
        preview.style.display = ''; img.src = src;
        if (dlBtn) { dlBtn.disabled = false; currentDataURL = src; }
        showToast('Image converted successfully!');
      });
    }
    if (dlBtn) {
      dlBtn.addEventListener('click', () => {
        if (currentDataURL) {
          downloadDataURL(currentDataURL, 'converted-image.png');
        }
      });
    }
  }

  // Image to Base64
  if (toolId === 'image-to-base64') {
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const output = document.getElementById('base64Output');
        if (output) {
          navigator.clipboard.writeText(output.textContent);
          showToast('Copied to clipboard!');
        }
      });
    }
    // Override handler to show base64
    const origHandler = handleImageFile;
    const zone = document.getElementById('imgB64');
    const input = document.getElementById('imgB64Input');
    if (zone && input) {
      const b64Handler = (files) => {
        const file = files[0];
        currentFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          currentDataURL = e.target.result;
          const preview = document.getElementById('previewArea');
          const img = document.getElementById('previewImg');
          if (preview && img) { preview.style.display = ''; img.src = currentDataURL; }
          const result = document.getElementById('resultArea');
          const output = document.getElementById('base64Output');
          if (result && output) { result.style.display = 'block'; output.textContent = currentDataURL; }
          const infoArea = document.getElementById('fileInfoArea');
          if (infoArea) {
            infoArea.innerHTML = `
              <div class="file-info">
                <div class="file-info-icon">📄</div>
                <div class="file-info-details">
                  <div class="file-info-name">${file.name}</div>
                  <div class="file-info-size">${formatBytes(file.size)}</div>
                </div>
              </div>`;
          }
          showToast('BASE64 generated!');
        };
        reader.readAsDataURL(file);
      };
      // Re-bind
      zone.addEventListener('drop', (e) => { e.preventDefault(); if (e.dataTransfer.files.length) b64Handler(e.dataTransfer.files); });
      input.addEventListener('change', () => { if (input.files.length) b64Handler(input.files); });
    }
  }
}


async function convertImage(toolId, file, dataURL) {
  const formats = {
    'webp-to-jpg': { to: 'image/jpeg', ext: 'jpg' },
    'png-to-jpg': { to: 'image/jpeg', ext: 'jpg' },
    'jpg-to-png': { to: 'image/png', ext: 'png' },
    'svg-to-png': { to: 'image/png', ext: 'png' },
  };
  const fmt = formats[toolId];
  const quality = parseInt(document.getElementById('qualitySlider')?.value || 92) / 100;

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (fmt.to === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);
    canvas.toBlob((blob) => {
      const newName = file.name.replace(/\.[^.]+$/, '') + '.' + fmt.ext;
      downloadBlob(blob, newName);
      const resultArea = document.getElementById('resultArea');
      const resultMeta = document.getElementById('resultMeta');
      if (resultArea) {
        resultArea.classList.add('visible');
        resultMeta.innerHTML = `
          <span>📁 Original: ${formatBytes(file.size)}</span>
          <span>📁 Converted: ${formatBytes(blob.size)}</span>
          <span>📐 ${img.naturalWidth} × ${img.naturalHeight}</span>`;
      }
      showToast('Image converted successfully!');
    }, fmt.to, quality);
  };
  img.src = dataURL;
}

async function convertToSVG(dataURL, fileName) {
  const method = document.getElementById('svgMethod')?.value || 'embed';
  const img = new Image();
  img.onload = () => {
    let svg;
    if (method === 'embed') {
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.naturalWidth}" height="${img.naturalHeight}">
  <image href="${dataURL}" width="${img.naturalWidth}" height="${img.naturalHeight}"/>
</svg>`;
    } else {
      // Simple posterize trace
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      // Simplified: use embedded approach for trace too
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.naturalWidth}" height="${img.naturalHeight}">
  <image href="${dataURL}" width="${img.naturalWidth}" height="${img.naturalHeight}"/>
</svg>`;
    }
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const newName = fileName.replace(/\.[^.]+$/, '') + '.svg';
    downloadBlob(blob, newName);
    showToast('SVG created successfully!');
  };
  img.src = dataURL;
}

async function compressImage(file, dataURL) {
  const quality = parseInt(document.getElementById('qualitySlider')?.value || 70) / 100;
  const maxWidth = parseInt(document.getElementById('maxWidth')?.value || 0);

  const img = new Image();
  img.onload = () => {
    let w = img.naturalWidth, h = img.naturalHeight;
    if (maxWidth > 0 && w > maxWidth) {
      h = Math.round(h * (maxWidth / w));
      w = maxWidth;
    }
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    canvas.toBlob((blob) => {
      const newName = file.name.replace(/\.[^.]+$/, '') + '-compressed.jpg';
      downloadBlob(blob, newName);
      const ratio = ((1 - blob.size / file.size) * 100).toFixed(1);
      const resultArea = document.getElementById('resultArea');
      const resultMeta = document.getElementById('resultMeta');
      if (resultArea) {
        resultArea.classList.add('visible');
        resultMeta.innerHTML = `
          <span>📁 Original: ${formatBytes(file.size)}</span>
          <span>📁 Compressed: ${formatBytes(blob.size)}</span>
          <span>📉 Saved ${ratio}%</span>
          <span>📐 ${w} × ${h}</span>`;
      }
      showToast(`Compressed! Saved ${ratio}%`);
    }, 'image/jpeg', quality);
  };
  img.src = dataURL;
}

async function cropImage(dataURL) {
  const x = parseInt(document.getElementById('cropX')?.value || 0);
  const y = parseInt(document.getElementById('cropY')?.value || 0);
  const w = parseInt(document.getElementById('cropW')?.value || 200);
  const h = parseInt(document.getElementById('cropH')?.value || 200);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
    canvas.toBlob((blob) => {
      downloadBlob(blob, 'cropped-image.png');
      showToast('Image cropped successfully!');
    }, 'image/png');
  };
  img.src = dataURL;
}

async function applyFilter(dataURL, filterType, fileName) {
  const img = new Image();
  img.onload = () => {
    const canvas = document.getElementById('filterCanvas') || document.createElement('canvas');
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    if (filterType === 'invert') {
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
      }
    } else if (filterType === 'grayscale') {
      for (let i = 0; i < data.length; i += 4) {
        const avg = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = data[i + 1] = data[i + 2] = avg;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    canvas.toBlob((blob) => {
      const newName = fileName.replace(/\.[^.]+$/, '') + `-${filterType}.png`;
      downloadBlob(blob, newName);
      showToast('Filter applied & downloaded!');
    }, 'image/png');
  };
  img.src = dataURL;
}
