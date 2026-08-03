import { showToast } from '../components/toast.js';
import { downloadBlob, renderDropZone, formatBytes, downloadURL } from '../utils.js';

export function socialToolHandler(tool) {
  setTimeout(() => setupSocialTool(tool.id), 50);
  window.addEventListener('page-rendered', () => setupSocialTool(tool.id), { once: true });

  switch (tool.id) {
    case 'thumbnail-grabber': return renderThumbnailGrabber();
    case 'tweet-generator': return renderTweetGenerator();
    case 'youtube-tags': return renderYouTubeTags();
    case 'instagram-post': return renderInstagramPost();
    case 'x-image-slicer': return renderXImageSlicer();
    case 'instagram-downloader': return renderInstagramDownloader();
    case 'youtube-downloader': return renderYouTubeDownloader();
    case 'pinterest-downloader': return renderPinterestDownloader();
    default: return `<p>Tool coming soon!</p>`;
  }
}

function renderThumbnailGrabber() {
  return `
    <div class="form-group">
      <label class="form-label">YouTube Video URL</label>
      <input type="text" class="form-input" id="ytUrl" placeholder="https://www.youtube.com/watch?v=..." />
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="grabBtn">🖼️ Grab Thumbnails</button>
    </div>
    <div class="result-area" id="resultArea">
      <div id="thumbnailGrid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1rem"></div>
    </div>
  `;
}

function renderTweetGenerator() {
  return `
    <div class="form-row">
      <div class="form-group" style="flex:2">
        <label class="form-label">Display Name</label>
        <input type="text" class="form-input" id="tweetName" value="John Doe" />
      </div>
      <div class="form-group" style="flex:1">
        <label class="form-label">Handle</label>
        <input type="text" class="form-input" id="tweetHandle" value="@johndoe" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Tweet Text</label>
      <textarea class="form-textarea" id="tweetText" placeholder="What's happening?" maxlength="280" style="min-height:80px"></textarea>
      <div id="charCount" style="text-align:right;font-size:.8rem;color:var(--text-muted)">0/280</div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Likes</label>
        <input type="text" class="form-input" id="tweetLikes" value="1.2K" />
      </div>
      <div class="form-group">
        <label class="form-label">Retweets</label>
        <input type="text" class="form-input" id="tweetRTs" value="342" />
      </div>
      <div class="form-group">
        <label class="form-label">Comments</label>
        <input type="text" class="form-input" id="tweetComments" value="89" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Theme</label>
      <select class="form-select" id="tweetTheme">
        <option value="dark">Dark</option>
        <option value="light">Light</option>
      </select>
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="generateBtn">🐦 Generate Tweet</button>
      <button class="btn btn-secondary" id="downloadTweetBtn" disabled>📥 Download PNG</button>
    </div>
    <div class="preview-area" id="previewArea" style="display:none">
      <h3>Preview</h3>
      <canvas id="tweetCanvas" style="max-width:100%;border-radius:12px"></canvas>
    </div>
  `;
}

function renderYouTubeTags() {
  return `
    <div class="form-group">
      <label class="form-label">YouTube Video URL</label>
      <input type="text" class="form-input" id="ytTagUrl" placeholder="https://www.youtube.com/watch?v=..." />
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="extractBtn">🏷️ Extract Tags</button>
    </div>
    <div class="result-area" id="resultArea">
      <p style="font-size:.85rem;color:var(--text-muted)">Note: Due to API restrictions, this tool extracts tags from the page meta data. Some videos may not expose tags.</p>
      <div id="tagsOutput"></div>
    </div>
  `;
}

function renderInstagramPost() {
  return `
    <div class="form-row">
      <div class="form-group" style="flex:2">
        <label class="form-label">Username</label>
        <input type="text" class="form-input" id="igUser" value="photographer" />
      </div>
      <div class="form-group" style="flex:1">
        <label class="form-label">Likes</label>
        <input type="text" class="form-input" id="igLikes" value="4,521" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Caption</label>
      <textarea class="form-textarea" id="igCaption" placeholder="Write your caption..." style="min-height:80px">Beautiful sunset 🌅 #photography #nature</textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Background Color</label>
      <input type="color" class="form-input" id="igBgColor" value="#f5f5f5" style="height:40px;padding:2px" />
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="generateBtn">📸 Generate Post</button>
      <button class="btn btn-secondary" id="downloadBtn" disabled>📥 Download</button>
    </div>
    <div class="preview-area" id="previewArea" style="display:none">
      <canvas id="igCanvas" style="max-width:100%;border-radius:8px"></canvas>
    </div>
  `;
}

function renderXImageSlicer() {
  return `
    ${renderDropZone('xSlicer', '.jpg,.jpeg,.png,.webp', 'Drop your image to slice for X')}
    <div id="fileInfoArea"></div>
    <div class="form-group" style="margin-top:1rem">
      <label class="form-label">Grid Layout</label>
      <select class="form-select" id="gridLayout">
        <option value="2x1">2 parts (2×1)</option>
        <option value="2x2">4 parts (2×2)</option>
        <option value="3x1">3 parts (3×1)</option>
        <option value="3x2">6 parts (3×2)</option>
      </select>
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="sliceBtn" disabled>✂️ Slice & Download All</button>
    </div>
    <div class="preview-area" id="previewArea" style="display:none">
      <h3>Preview</h3>
      <div id="sliceGrid" style="display:grid;gap:4px"></div>
    </div>
  `;
}

function renderInstagramDownloader() {
  return `
    <div class="form-group">
      <label class="form-label">Instagram Post URL</label>
      <input type="text" class="form-input" id="igUrl" placeholder="https://www.instagram.com/p/ABC123/" />
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="igFetchBtn">📥 Fetch Post</button>
    </div>
    <div class="result-area" id="resultArea">
      <div id="igLoading" style="display:none;text-align:center;padding:2rem">
        <div class="spinner-sm" style="width:28px;height:28px;border-width:3px;margin:0 auto 1rem"></div>
        <p style="color:var(--text-muted);font-size:.9rem">Fetching post data...</p>
      </div>
      <div id="igResult"></div>
    </div>
    <div style="margin-top:1rem;padding:1rem;background:var(--surface);border-radius:12px;border:1px solid var(--border)">
      <p style="font-size:.8rem;color:var(--text-muted)">💡 <strong>How to use:</strong> Paste the full Instagram post URL (e.g. https://www.instagram.com/p/ABC123/) and click Fetch Post. The image will appear below for you to download.</p>
    </div>
  `;
}

function renderYouTubeDownloader() {
  return `
    <div class="form-group">
      <label class="form-label">YouTube Video URL</label>
      <input type="text" class="form-input" id="ytVidUrl" placeholder="https://www.youtube.com/watch?v=..." />
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="ytFetchBtn">📥 Fetch Video</button>
    </div>
    <div class="result-area" id="resultArea">
      <div id="ytLoading" style="display:none;text-align:center;padding:2rem">
        <div class="spinner-sm" style="width:28px;height:28px;border-width:3px;margin:0 auto 1rem"></div>
        <p style="color:var(--text-muted);font-size:.9rem">Fetching video streams...</p>
      </div>
      <div id="ytResult"></div>
    </div>
    <div style="margin-top:1rem;padding:1rem;background:var(--surface);border-radius:12px;border:1px solid var(--border)">
      <p style="font-size:.8rem;color:var(--text-muted)">💡 <strong>Note:</strong> High-resolution videos (1080p+) are often split into separate streams by YouTube. Only fully mixed formats (usually up to 720p) and standard audio formats are shown here.</p>
    </div>
  `;
}

function renderPinterestDownloader() {
  return `
    <div class="form-group">
      <label class="form-label">Pinterest Pin URL</label>
      <input type="text" class="form-input" id="pinUrl" placeholder="https://www.pinterest.com/pin/123456789/" />
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="pinFetchBtn">📌 Fetch Image</button>
    </div>
    <div class="result-area" id="resultArea">
      <div id="pinLoading" style="display:none;text-align:center;padding:2rem">
        <div class="spinner-sm" style="width:28px;height:28px;border-width:3px;margin:0 auto 1rem"></div>
        <p style="color:var(--text-muted);font-size:.9rem">Fetching pin data...</p>
      </div>
      <div id="pinResult"></div>
    </div>
    <div style="margin-top:1rem;padding:1rem;background:var(--surface);border-radius:12px;border:1px solid var(--border)">
      <p style="font-size:.8rem;color:var(--text-muted)">📌 <strong>How to use:</strong> Paste any Pinterest pin URL (e.g. pinterest.com/pin/123456789/) and click Fetch Image. The image will be fetched in its original native resolution for you to download.</p>
      <p style="font-size:.8rem;color:var(--text-muted);margin-top:.5rem">💡 <strong>Tip:</strong> You can also paste shortened pin.it links — they will be resolved automatically.</p>
    </div>
  `;
}

// ===== SETUP LOGIC =====
function setupSocialTool(toolId) {
  // Thumbnail Grabber
  if (toolId === 'thumbnail-grabber') {
    const grid = document.getElementById('thumbnailGrid');
    if (grid && !grid.dataset.listenerAttached) {
      grid.dataset.listenerAttached = 'true';
      grid.addEventListener('click', async (e) => {
        const btn = e.target.closest('.download-thumb-btn');
        if (!btn) return;

        const imageUrl = btn.getAttribute('data-url');
        const filename = btn.getAttribute('data-filename');
        if (!imageUrl || !filename) return;

        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<span class="spinner-sm" style="width:12px;height:12px;border-width:2px;display:inline-block;margin-right:4px"></span>Fetching...';
        btn.disabled = true;

        try {
          let response;
          try {
            // Try direct fetch first
            response = await fetch(imageUrl);
            if (!response.ok) throw new Error('Direct fetch failed');
          } catch (err) {
            // Fallback to CORS proxy
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`;
            response = await fetch(proxyUrl);
            if (!response.ok) throw new Error('Proxy fetch failed');
          }

          const blob = await response.blob();
          downloadBlob(blob, filename);
          showToast('Download started!');
        } catch (err) {
          console.error('Failed to download thumbnail', err);
          showToast('Failed to download directly. Opening in new tab...', 'warning');
          window.open(imageUrl, '_blank');
        } finally {
          btn.innerHTML = originalHtml;
          btn.disabled = false;
        }
      });
    }

    document.getElementById('grabBtn')?.addEventListener('click', () => {
      const url = document.getElementById('ytUrl')?.value.trim();
      if (!url) { showToast('Please enter a YouTube URL', 'error'); return; }
      const videoId = extractYTId(url);
      if (!videoId) { showToast('Invalid YouTube URL', 'error'); return; }

      const sizes = [
        { name: 'Max Resolution', url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` },
        { name: 'Standard', url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg` },
        { name: 'High Quality', url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` },
        { name: 'Medium', url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` },
        { name: 'Default', url: `https://img.youtube.com/vi/${videoId}/default.jpg` },
      ];

      const resultArea = document.getElementById('resultArea');
      if (grid && resultArea) {
        resultArea.classList.add('visible');
        grid.innerHTML = sizes.map(s => `
          <div class="thumbnail-card" style="background:var(--surface);border-radius:12px;overflow:hidden;border:1px solid var(--border)">
            <img src="${s.url}" alt="${s.name}" style="width:100%;display:block" onerror="this.style.display='none'" />
            <div style="padding:.75rem">
              <div style="font-size:.85rem;font-weight:600;margin-bottom:.5rem">${s.name}</div>
              <button data-url="${s.url}" data-filename="${videoId}-${s.name.toLowerCase().replace(/\s+/g,'-')}.jpg" class="btn btn-secondary download-thumb-btn" style="font-size:.8rem;padding:.35rem .75rem">📥 Download</button>
            </div>
          </div>
        `).join('');
      }
      showToast('Thumbnails loaded!');
    });
  }

  // Tweet Generator
  if (toolId === 'tweet-generator') {
    const textarea = document.getElementById('tweetText');
    const counter = document.getElementById('charCount');
    if (textarea && counter) {
      textarea.addEventListener('input', () => { counter.textContent = textarea.value.length + '/280'; });
    }

    document.getElementById('generateBtn')?.addEventListener('click', () => {
      const canvas = document.getElementById('tweetCanvas');
      const preview = document.getElementById('previewArea');
      if (!canvas || !preview) return;
      preview.style.display = '';

      const name = document.getElementById('tweetName')?.value || 'User';
      const handle = document.getElementById('tweetHandle')?.value || '@user';
      const text = document.getElementById('tweetText')?.value || '';
      const likes = document.getElementById('tweetLikes')?.value || '0';
      const rts = document.getElementById('tweetRTs')?.value || '0';
      const comments = document.getElementById('tweetComments')?.value || '0';
      const theme = document.getElementById('tweetTheme')?.value || 'dark';

      const isDark = theme === 'dark';
      const bg = isDark ? '#15202b' : '#ffffff';
      const fg = isDark ? '#ffffff' : '#0f1419';
      const muted = isDark ? '#8899a6' : '#536471';

      canvas.width = 550;
      canvas.height = 280;
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 550, 280);

      // Avatar circle
      ctx.fillStyle = '#1da1f2';
      ctx.beginPath();
      ctx.arc(40, 45, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(name[0]?.toUpperCase() || 'U', 40, 51);

      // Name & handle
      ctx.textAlign = 'left';
      ctx.fillStyle = fg;
      ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(name, 72, 38);
      ctx.fillStyle = muted;
      ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(handle, 72, 56);

      // Tweet text wrap
      ctx.fillStyle = fg;
      ctx.font = '15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      wrapText(ctx, text, 20, 95, 510, 22);

      // Stats
      const statsY = 235;
      ctx.fillStyle = muted;
      ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(`💬 ${comments}`, 20, statsY);
      ctx.fillText(`🔁 ${rts}`, 150, statsY);
      ctx.fillText(`❤️ ${likes}`, 280, statsY);

      // Border
      ctx.strokeStyle = isDark ? '#38444d' : '#e1e8ed';
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, 549, 279);

      document.getElementById('downloadTweetBtn').disabled = false;
      showToast('Tweet generated!');
    });

    document.getElementById('downloadTweetBtn')?.addEventListener('click', () => {
      const canvas = document.getElementById('tweetCanvas');
      if (!canvas) return;
      canvas.toBlob((blob) => downloadBlob(blob, 'tweet.png'), 'image/png');
    });
  }

  // YouTube Tags
  if (toolId === 'youtube-tags') {
    document.getElementById('extractBtn')?.addEventListener('click', async () => {
      const url = document.getElementById('ytTagUrl')?.value.trim();
      if (!url) { showToast('Please enter a URL', 'error'); return; }
      const videoId = extractYTId(url);
      if (!videoId) { showToast('Invalid YouTube URL', 'error'); return; }

      const output = document.getElementById('tagsOutput');
      const result = document.getElementById('resultArea');
      if (output && result) {
        result.classList.add('visible');
        // Note: direct API requires key. Using noembed for basic info
        output.innerHTML = `
          <div style="padding:1rem;background:var(--surface);border-radius:8px;border:1px solid var(--border)">
            <p style="font-size:.85rem;color:var(--text-muted);margin-bottom:.75rem">
              ⓘ Due to YouTube's API restrictions, tag extraction requires a YouTube Data API key.
              However, here's the video info for <strong>${videoId}</strong>:
            </p>
            <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap">
              <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" style="border-radius:8px;max-width:180px" />
              <div>
                <p style="font-size:.9rem;font-weight:600">Video ID: ${videoId}</p>
                <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" style="color:var(--primary);font-size:.85rem">Open on YouTube →</a>
              </div>
            </div>
          </div>
        `;
      }
    });
  }

  // Instagram Post
  if (toolId === 'instagram-post') {
    document.getElementById('generateBtn')?.addEventListener('click', () => {
      const canvas = document.getElementById('igCanvas');
      const preview = document.getElementById('previewArea');
      if (!canvas || !preview) return;
      preview.style.display = '';

      const user = document.getElementById('igUser')?.value || 'user';
      const likes = document.getElementById('igLikes')?.value || '0';
      const caption = document.getElementById('igCaption')?.value || '';
      const bgColor = document.getElementById('igBgColor')?.value || '#f5f5f5';

      canvas.width = 400;
      canvas.height = 500;
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, 400, 500);

      // Header
      ctx.fillStyle = '#fafafa';
      ctx.fillRect(0, 0, 400, 50);
      ctx.fillStyle = '#262626';
      ctx.font = 'bold 14px -apple-system, sans-serif';
      ctx.fillText(user, 50, 30);

      // Avatar
      ctx.fillStyle = '#c13584';
      ctx.beginPath(); ctx.arc(24, 25, 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(user[0]?.toUpperCase() || 'U', 24, 30);
      ctx.textAlign = 'left';

      // Image area
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 50, 400, 300);

      // Gradient overlay text
      ctx.fillStyle = '#262626';
      ctx.font = '22px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📷', 200, 210);
      ctx.textAlign = 'left';

      // Action icons
      const iconsY = 365;
      ctx.font = '20px sans-serif';
      ctx.fillText('♡', 14, iconsY);
      ctx.fillText('💬', 44, iconsY);
      ctx.fillText('📤', 74, iconsY);

      // Likes
      ctx.fillStyle = '#262626';
      ctx.font = 'bold 13px -apple-system, sans-serif';
      ctx.fillText(`${likes} likes`, 14, iconsY + 22);

      // Caption
      ctx.font = '13px -apple-system, sans-serif';
      ctx.fillStyle = '#262626';
      wrapText(ctx, `${user}  ${caption}`, 14, iconsY + 42, 370, 18);

      document.getElementById('downloadBtn').disabled = false;
      showToast('Instagram post generated!');
    });

    document.getElementById('downloadBtn')?.addEventListener('click', () => {
      const canvas = document.getElementById('igCanvas');
      if (!canvas) return;
      canvas.toBlob(blob => downloadBlob(blob, 'instagram-post.png'), 'image/png');
    });
  }

  // X Image Slicer
  if (toolId === 'x-image-slicer') {
    let currentFile = null;
    let currentDataURL = null;

    const zone = document.getElementById('xSlicer');
    const input = document.getElementById('xSlicerInput');
    if (zone && input) {
      ['dragover', 'dragenter'].forEach(e => zone.addEventListener(e, (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        zone.classList.add('drag-over');
      }));

      ['dragleave', 'drop'].forEach(e => zone.addEventListener(e, (ev) => {
        ev.stopPropagation();
        zone.classList.remove('drag-over');
      }));

      const handleFile = (files) => {
        currentFile = files[0];
        zone.style.display = 'none';
        
        const reader = new FileReader();
        reader.onload = (e) => {
          currentDataURL = e.target.result;
          document.getElementById('sliceBtn').disabled = false;
          const infoArea = document.getElementById('fileInfoArea');
          if (infoArea) {
            infoArea.innerHTML = `
              <div class="file-info">
                <div class="file-info-icon">📄</div>
                <div class="file-info-details">
                  <div class="file-info-name">${currentFile.name}</div>
                  <div class="file-info-size">${formatBytes(currentFile.size)}</div>
                </div>
                <button class="file-info-remove" type="button" aria-label="Remove File">&times;</button>
              </div>`;
          }
        };
        reader.readAsDataURL(currentFile);
      };

      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files);
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
        if (input.files.length) handleFile(input.files);
      });

      // Expose instance-specific social reset function
      window.activeSocialReset = () => {
        currentFile = null;
        currentDataURL = null;
        if (input) input.value = '';

        const infoArea = document.getElementById('fileInfoArea');
        if (infoArea) infoArea.innerHTML = '';

        const preview = document.getElementById('previewArea');
        if (preview) preview.style.display = 'none';

        const sliceGrid = document.getElementById('sliceGrid');
        if (sliceGrid) sliceGrid.innerHTML = '';

        const sliceBtn = document.getElementById('sliceBtn');
        if (sliceBtn) sliceBtn.disabled = true;

        if (zone) {
          zone.style.display = 'flex';
        }
      };

      if (!document.body.dataset.socialResetAttached) {
        document.body.dataset.socialResetAttached = 'true';
        document.addEventListener('click', (e) => {
          const removeBtn = e.target.closest('.file-info-remove');
          if (!removeBtn) return;
          
          e.preventDefault();
          e.stopPropagation();

          if (typeof window.activeSocialReset === 'function') {
            window.activeSocialReset();
          }
        });
      }
    }

    document.getElementById('sliceBtn')?.addEventListener('click', async () => {
      if (!currentDataURL) return;
      const layout = document.getElementById('gridLayout')?.value || '2x2';
      const [cols, rows] = layout.split('x').map(Number);

      const img = await loadImage(currentDataURL);
      const sliceW = Math.floor(img.width / cols);
      const sliceH = Math.floor(img.height / rows);

      const grid = document.getElementById('sliceGrid');
      const preview = document.getElementById('previewArea');
      if (grid && preview) {
        preview.style.display = '';
        grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        grid.innerHTML = '';

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const canvas = document.createElement('canvas');
            canvas.width = sliceW; canvas.height = sliceH;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, c * sliceW, r * sliceH, sliceW, sliceH, 0, 0, sliceW, sliceH);
            canvas.style.width = '100%'; canvas.style.borderRadius = '8px';
            grid.appendChild(canvas);

            // Auto download
            canvas.toBlob((blob) => {
              downloadBlob(blob, `slice-${r + 1}-${c + 1}.png`);
            }, 'image/png');
          }
        }
      }
      showToast(`Sliced into ${cols * rows} parts!`);
    });
  }

  // Instagram Post Downloader
  if (toolId === 'instagram-downloader') {
    document.getElementById('igFetchBtn')?.addEventListener('click', async () => {
      const url = document.getElementById('igUrl')?.value.trim();
      if (!url) { showToast('Please enter an Instagram URL', 'error'); return; }

      const shortcode = extractIGShortcode(url);
      if (!shortcode) { showToast('Invalid Instagram URL. Use format: instagram.com/p/SHORTCODE/', 'error'); return; }

      const loading = document.getElementById('igLoading');
      const result = document.getElementById('igResult');
      const resultArea = document.getElementById('resultArea');
      const fetchBtn = document.getElementById('igFetchBtn');

      if (loading) loading.style.display = '';
      if (result) result.innerHTML = '';
      if (resultArea) resultArea.classList.add('visible');
      if (fetchBtn) { fetchBtn.disabled = true; fetchBtn.innerHTML = '<span class="spinner-sm"></span> Fetching...'; }

      try {
        const infoApiUrl = `/api/instagram?shortcode=${encodeURIComponent(shortcode)}&mode=info`;
        const resp = await fetch(infoApiUrl);
        
        if (!resp.ok) {
          throw new Error('Failed to fetch post. It may be private or unavailable.');
        }

        const data = await resp.json();
        const mediaItems = data.media || [];

        if (mediaItems.length === 0) {
          throw new Error('No photos or videos found in this post.');
        }

        if (loading) loading.style.display = 'none';
        if (result) {
          const count = mediaItems.length;
          result.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem;margin-bottom:1rem">
              <span style="font-size:.95rem;font-weight:700;color:var(--text-primary)">
                ✅ Found ${count} ${count === 1 ? 'media item' : 'photos / videos'} in this post
              </span>
              ${count > 1 ? `
                <button class="btn btn-primary" id="igDownloadAllBtn" style="font-size:0.85rem;padding:0.45rem 1rem">
                  📦 Download All Photos (${count})
                </button>
              ` : ''}
            </div>

            <div class="ig-preview-grid">
              ${mediaItems.map((item, idx) => `
                <div class="ig-media-card">
                  <div class="ig-card-header">
                    <span>${item.type === 'video' ? '🎥 Video' : '🖼️ Photo'} ${idx + 1} of ${count}</span>
                  </div>
                  <div class="ig-media-thumb">
                    ${item.type === 'video' ? `
                      <video src="${item.proxyUrl}" controls style="max-height:180px;width:100%;object-fit:contain;border-radius:8px;display:block"></video>
                    ` : `
                      <img src="${item.proxyUrl}" alt="Photo ${idx + 1}" style="max-height:180px;width:100%;object-fit:cover;border-radius:8px;display:block" onerror="this.onerror=null;this.src='${item.originalUrl}'" />
                    `}
                  </div>
                  <div class="ig-card-actions">
                    <button class="btn btn-primary ig-dl-item-btn" data-url="${item.proxyUrl}&download=1" data-filename="instagram-${shortcode}-${idx + 1}.${item.type === 'video' ? 'mp4' : 'jpg'}" style="flex:1;font-size:0.8rem;padding:0.4rem 0.6rem">
                      📥 Download
                    </button>
                    <a href="${item.proxyUrl}" target="_blank" class="btn btn-secondary" style="font-size:0.8rem;padding:0.4rem 0.6rem;text-decoration:none;display:inline-flex;align-items:center;justify-content:center">
                      🔗 Full
                    </a>
                  </div>
                </div>
              `).join('')}
            </div>
          `;

          // Event listeners for individual download buttons
          result.querySelectorAll('.ig-dl-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
              const downloadUrl = e.currentTarget.getAttribute('data-url');
              const filename = e.currentTarget.getAttribute('data-filename');
              downloadURL(downloadUrl, filename);
              showToast('Download started!');
            });
          });

          // Event listener for Download All Photos
          document.getElementById('igDownloadAllBtn')?.addEventListener('click', async () => {
            showToast(`Downloading all ${count} photos...`);
            for (let i = 0; i < mediaItems.length; i++) {
              const item = mediaItems[i];
              const downloadUrl = `${item.proxyUrl}&download=1`;
              const filename = `instagram-${shortcode}-${i + 1}.${item.type === 'video' ? 'mp4' : 'jpg'}`;
              downloadURL(downloadUrl, filename);
              await new Promise(r => setTimeout(r, 400));
            }
          });
        }
        showToast(`Fetched ${mediaItems.length} ${mediaItems.length === 1 ? 'item' : 'photos'} successfully!`);
      } catch (e) {
        // Fallback handling: try single image proxy if mode=info fails
        try {
          const singleApiUrl = `/api/instagram?shortcode=${encodeURIComponent(shortcode)}`;
          if (loading) loading.style.display = 'none';
          if (result) {
            result.innerHTML = `
              <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem;margin-bottom:1rem">
                <span style="font-size:.95rem;font-weight:700;color:var(--text-primary)">
                  ✅ Photo fetched successfully
                </span>
              </div>
              <div class="ig-preview-grid" style="max-width:320px;margin:0 auto">
                <div class="ig-media-card">
                  <div class="ig-card-header">
                    <span>🖼️ Photo 1 of 1</span>
                  </div>
                  <div class="ig-media-thumb">
                    <img src="${singleApiUrl}" alt="Photo 1" style="max-height:180px;width:100%;object-fit:cover;border-radius:8px;display:block" />
                  </div>
                  <div class="ig-card-actions">
                    <button class="btn btn-primary id-single-dl" style="flex:1;font-size:0.8rem;padding:0.4rem 0.6rem">
                      📥 Download
                    </button>
                    <a href="${singleApiUrl}" target="_blank" class="btn btn-secondary" style="font-size:0.8rem;padding:0.4rem 0.6rem;text-decoration:none;display:inline-flex;align-items:center;justify-content:center">
                      🔗 Full
                    </a>
                  </div>
                </div>
              </div>
            `;
            result.querySelector('.id-single-dl')?.addEventListener('click', () => {
              downloadURL(`${singleApiUrl}&download=1`, `instagram-${shortcode}.jpg`);
              showToast('Download started!');
            });
          }
          showToast('Image fetched successfully!');
        } catch (errFallback) {
          if (loading) loading.style.display = 'none';
          if (result) {
            result.innerHTML = `
              <div style="padding:1.5rem;text-align:center;color:var(--text-muted)">
                <p style="font-size:2rem;margin-bottom:.5rem">😔</p>
                <p style="font-size:.9rem;font-weight:500">${e.message}</p>
                <p style="font-size:.8rem;margin-top:.5rem">Make sure the post is public and the URL is correct.</p>
              </div>
            `;
          }
          showToast('Error: ' + e.message, 'error');
        }
      } finally {
        if (fetchBtn) { fetchBtn.disabled = false; fetchBtn.innerHTML = '📥 Fetch Post'; }
      }
    });
  }

  // YouTube Downloader
  if (toolId === 'youtube-downloader') {
    document.getElementById('ytFetchBtn')?.addEventListener('click', async () => {
      const url = document.getElementById('ytVidUrl')?.value.trim();
      if (!url) { showToast('Please enter a YouTube URL', 'error'); return; }

      const videoId = extractYTId(url);
      if (!videoId) { showToast('Invalid YouTube URL', 'error'); return; }

      const loading = document.getElementById('ytLoading');
      const result = document.getElementById('ytResult');
      const resultArea = document.getElementById('resultArea');
      const fetchBtn = document.getElementById('ytFetchBtn');

      if (loading) loading.style.display = '';
      if (result) result.innerHTML = '';
      if (resultArea) resultArea.classList.add('visible');
      if (fetchBtn) { fetchBtn.disabled = true; fetchBtn.innerHTML = '<span class="spinner-sm"></span> Fetching...'; }

      try {
        // Fetch Title & Thumbnail using Noembed (bypasses CORS & Bot checks!)
        const noembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(url)}`;
        const resp = await fetch(noembedUrl);
        const data = await resp.json();
        
        if (data.error) throw new Error("Video not found or is private.");

        if (loading) loading.style.display = 'none';
        
        const hdThumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        const title = data.title || 'YouTube Video';

        // Render robust qualities
        const videoQualities = ['1080', '720', '480', '360'];
        const vidHtml = videoQualities.map(q => `
          <button class="btn btn-primary yt-dl-btn" data-url="${url}" data-quality="${q}" data-audio="false"
             style="display:flex;flex-direction:column;align-items:center;padding:0.75rem;font-size:0.8rem;border:none;cursor:pointer">
            <span style="font-size:1rem;font-weight:600;margin-bottom:0.15rem">${q}p</span>
            <span style="opacity:0.8;font-size:0.75rem">MP4</span>
          </button>
        `).join('');

        const audHtml = `
          <button class="btn btn-secondary yt-dl-btn" data-url="${url}" data-quality="128" data-audio="true"
             style="display:flex;flex-direction:column;align-items:center;padding:0.75rem;font-size:0.8rem;background:var(--surface);border:1px solid var(--border);cursor:pointer">
            <span style="font-size:1rem;font-weight:600;margin-bottom:0.15rem">Standard</span>
            <span style="opacity:0.8;font-size:0.75rem">MP3</span>
          </button>
        `;

        if (result) {
          result.innerHTML = `
            <div style="max-width:600px;margin:0 auto">
              <div style="background:var(--surface);border-radius:12px;overflow:hidden;border:1px solid var(--border);display:flex;flex-direction:column;gap:1.5rem;padding-bottom:1.5rem">
                <div>
                  <img src="${hdThumbnail}" alt="Thumbnail" style="width:100%;display:block;max-height:300px;object-fit:cover;border-bottom:1px solid var(--border)" onerror="this.src='${data.thumbnail_url}'"/>
                  <div style="padding:1.5rem 1rem 0 1rem;text-align:center">
                    <h3 style="margin:0;font-size:1.1rem;color:var(--text)">${title}</h3>
                  </div>
                </div>
                
                <div style="padding:0 1rem;">
                  <h4 style="margin:0 0 0.75rem 0;font-size:0.9rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">Video Downloader (MP4)</h4>
                  <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:0.75rem">
                    ${vidHtml}
                  </div>
                </div>

                <div style="padding:0 1rem;">
                  <h4 style="margin:0 0 0.75rem 0;font-size:0.9rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">Audio Only</h4>
                  <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:0.75rem">
                    ${audHtml}
                  </div>
                </div>
              </div>
            </div>
          `;

          // Attach listeners for downloading via Cobalt Client API
          const btns = result.querySelectorAll('.yt-dl-btn');
          btns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
              const b = e.currentTarget;
              const originalHtml = b.innerHTML;
              b.innerHTML = '<span class="spinner-sm" style="width:14px;height:14px;border-width:2px;margin-bottom:0.15rem;display:inline-block"></span><span style="opacity:0.8;font-size:0.75rem">Generating...</span>';
              b.disabled = true;

              try {
                const targetUrl = b.getAttribute('data-url');
                const quality = b.getAttribute('data-quality');
                const isAudio = b.getAttribute('data-audio') === 'true';

                const payload = {
                  url: targetUrl,
                  vQuality: quality,
                  filenamePattern: "classic",
                  isAudioOnly: isAudio,
                  isAudioMuted: false,   
                  disableMetadata: true
                };

                // Array of robust public cobalt instances (CORS friendly)
                const cobaltAPIs = [
                  "https://cobalt.api.timelessnesses.me/api/json",
                  "https://api.cobalt.buss.lol/api/json",
                  "https://co.wuk.sh/api/json",
                  "https://cobalt-api.pewpew.icu/api/json"
                ];

                let finalUrl = null;
                for (const api of cobaltAPIs) {
                  try {
                    const req = await fetch(api, {
                      method: 'POST',
                      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload)
                    });
                    const resData = await req.json();
                    if (resData && (resData.status === 'redirect' || resData.status === 'stream' || resData.status === 'success') && resData.url) {
                      finalUrl = resData.url;
                      break;
                    }
                  } catch (err) {
                    console.log("Cobalt instance failed, trying next", api);
                    continue; 
                  }
                }

                if (finalUrl) {
                  const extension = isAudio ? 'mp3' : 'mp4';
                  const dlFilename = title ? `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${extension}` : `youtube-video.${extension}`;
                  downloadURL(finalUrl, dlFilename);
                  
                  // Reset button after small delay
                  setTimeout(() => {
                    b.innerHTML = originalHtml;
                    b.disabled = false;
                  }, 2000);
                  showToast('Download started automatically!');
                } else {
                  throw new Error("Unable to generate download link at this time.");
                }
              } catch (err) {
                b.innerHTML = originalHtml;
                b.disabled = false;
                showToast(err.message, 'error');
              }
            });
          });
        }
        showToast('Video options loaded!');
      } catch(e) {
        if (loading) loading.style.display = 'none';
        if (result) {
          result.innerHTML = `
            <div style="padding:1.5rem;text-align:center;color:var(--text-muted);background:var(--surface);border-radius:12px;border:1px solid rgba(239,68,68,0.3)">
              <p style="font-size:2rem;margin-bottom:.5rem">⚠️</p>
              <p style="font-size:.9rem;font-weight:500">${e.message}</p>
              <p style="font-size:.8rem;margin-top:.5rem">Make sure the video is public and valid.</p>
            </div>
          `;
        }
        showToast('Error: ' + e.message, 'error');
      } finally {
        if (fetchBtn) { fetchBtn.disabled = false; fetchBtn.innerHTML = '📥 Fetch Video'; }
      }
    });
  }

  // Pinterest Image Downloader
  if (toolId === 'pinterest-downloader') {
    document.getElementById('pinFetchBtn')?.addEventListener('click', async () => {
      const url = document.getElementById('pinUrl')?.value.trim();
      if (!url) { showToast('Please enter a Pinterest URL', 'error'); return; }

      // Basic validation
      if (!url.includes('pinterest.com') && !url.includes('pin.it')) {
        showToast('Invalid Pinterest URL. Use a pinterest.com/pin/... or pin.it/... link', 'error');
        return;
      }

      const loading = document.getElementById('pinLoading');
      const result = document.getElementById('pinResult');
      const resultArea = document.getElementById('resultArea');
      const fetchBtn = document.getElementById('pinFetchBtn');

      if (loading) loading.style.display = '';
      if (result) result.innerHTML = '';
      if (resultArea) resultArea.classList.add('visible');
      if (fetchBtn) { fetchBtn.disabled = true; fetchBtn.innerHTML = '<span class="spinner-sm"></span> Fetching...'; }

      try {
        // Call our API to get image info
        const apiUrl = `/api/pinterest?url=${encodeURIComponent(url)}&mode=info`;
        const resp = await fetch(apiUrl);

        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to fetch pin. It may be private or invalid.');
        }

        const data = await resp.json();
        if (!data.images || data.images.length === 0) {
          throw new Error('No images found for this pin.');
        }

        if (loading) loading.style.display = 'none';

        // Render the images grid
        const imgCount = data.images.length;
        const uniqueImages = data.images.slice(0, 6); // Cap at 6 max

        const imagesHtml = uniqueImages.map((img, i) => `
          <div style="background:var(--surface);border-radius:12px;overflow:hidden;border:1px solid var(--border);display:flex;flex-direction:column">
            <div style="position:relative;overflow:hidden;background:#0a0a0a;display:flex;align-items:center;justify-content:center;min-height:180px">
              <img src="${img.url}" alt="Pinterest Image ${i + 1}" style="width:100%;display:block;object-fit:contain;max-height:400px" onerror="this.parentElement.innerHTML='<p style=color:var(--text-muted);padding:2rem;text-align:center>Image unavailable</p>'" />
              <div style="position:absolute;top:8px;right:8px;background:rgba(0,0,0,0.7);color:#fff;padding:2px 8px;border-radius:6px;font-size:.7rem;backdrop-filter:blur(8px)">${img.label}</div>
            </div>
            <div style="padding:.75rem;display:flex;gap:.5rem">
              <button class="btn btn-primary pin-download-btn" data-url="${img.url}" data-index="${i}" style="flex:1;text-align:center;font-size:.85rem">📥 Download</button>
              <button class="btn btn-secondary pin-open-btn" data-url="${img.url}" style="font-size:.85rem;padding:.35rem .75rem">🔗</button>
            </div>
          </div>
        `).join('');

        if (result) {
          result.innerHTML = `
            <div style="margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem">
              <span style="font-size:.9rem;font-weight:600;color:var(--text)">✅ Found ${imgCount} image${imgCount > 1 ? 's' : ''} (native resolution)</span>
              ${imgCount > 1 ? `<button class="btn btn-primary" id="pinDownloadAll" style="font-size:.8rem;padding:.4rem 1rem">📥 Download All</button>` : ''}
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem">
              ${imagesHtml}
            </div>
          `;

          // Attach download listeners
          result.querySelectorAll('.pin-download-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
              const b = e.currentTarget;
              const imgUrl = b.getAttribute('data-url');
              const idx = b.getAttribute('data-index');
              const originalHtml = b.innerHTML;
              b.innerHTML = '<span class="spinner-sm" style="width:12px;height:12px;border-width:2px;display:inline-block;margin-right:4px"></span>Downloading...';
              b.disabled = true;

              try {
                const proxyUrl = `/api/pinterest?url=${encodeURIComponent(url)}&download=1`;
                // Try fetching the actual image directly first
                let response;
                try {
                  response = await fetch(imgUrl);
                  if (!response.ok) throw new Error('Direct failed');
                } catch {
                  // Fallback via our proxy
                  response = await fetch(proxyUrl);
                  if (!response.ok) throw new Error('Proxy failed');
                }

                const blob = await response.blob();
                const ext = blob.type.includes('png') ? 'png' : blob.type.includes('webp') ? 'webp' : 'jpg';
                downloadBlob(blob, `pinterest-image-${parseInt(idx) + 1}.${ext}`);
                showToast('Download started!');
              } catch (err) {
                showToast('Opening image in new tab...', 'warning');
                window.open(imgUrl, '_blank');
              } finally {
                b.innerHTML = originalHtml;
                b.disabled = false;
              }
            });
          });

          // Open in new tab buttons
          result.querySelectorAll('.pin-open-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              window.open(btn.getAttribute('data-url'), '_blank');
            });
          });

          // Download all button
          document.getElementById('pinDownloadAll')?.addEventListener('click', async () => {
            const allBtns = result.querySelectorAll('.pin-download-btn');
            for (const btn of allBtns) {
              btn.click();
              await new Promise(r => setTimeout(r, 500)); // Stagger downloads
            }
          });
        }

        showToast(`Found ${imgCount} image${imgCount > 1 ? 's' : ''} in native resolution!`);
      } catch (e) {
        if (loading) loading.style.display = 'none';
        if (result) {
          result.innerHTML = `
            <div style="padding:1.5rem;text-align:center;color:var(--text-muted)">
              <p style="font-size:2rem;margin-bottom:.5rem">😔</p>
              <p style="font-size:.9rem;font-weight:500">${e.message}</p>
              <p style="font-size:.8rem;margin-top:.5rem">Make sure the pin is public and the URL is correct.</p>
            </div>
          `;
        }
        showToast('Error: ' + e.message, 'error');
      } finally {
        if (fetchBtn) { fetchBtn.disabled = false; fetchBtn.innerHTML = '📌 Fetch Image'; }
      }
    });
  }
}

function extractYTId(url) {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, y);
      line = word + ' ';
      y += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, y);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function extractIGShortcode(url) {
  // Matches: instagram.com/p/SHORTCODE/ or /reel/SHORTCODE/
  const match = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

async function fetchInstagramImages(shortcode) {
  const igEmbedUrl = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;
  const igPageUrl = `https://www.instagram.com/p/${shortcode}/`;

  // Try multiple CORS proxies in order
  const proxyStrategies = [
    { name: 'corsproxy', buildUrl: (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`, parse: 'text' },
    { name: 'allorigins', buildUrl: (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`, parse: 'text' },
    { name: 'codetabs', buildUrl: (u) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`, parse: 'text' },
  ];

  // Try embed URL with each proxy, then page URL
  const urlsToTry = [igEmbedUrl, igPageUrl];

  for (const targetUrl of urlsToTry) {
    for (const proxy of proxyStrategies) {
      try {
        const fetchUrl = proxy.buildUrl(targetUrl);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(fetchUrl, { 
          signal: controller.signal,
          headers: { 'Accept': 'text/html,application/json' }
        });
        clearTimeout(timeout);
        
        if (!response.ok) continue;
        
        const html = await response.text();
        if (!html || html.length < 100) continue;

        const imageUrls = extractImagesFromEmbed(html);
        if (imageUrls.length > 0) return imageUrls;
      } catch {
        // Try next proxy
        continue;
      }
    }
  }

  return [];
}

function extractImagesFromEmbed(html) {
  const urls = new Set();

  // Decode unicode escapes first
  const decoded = html.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

  // Match image URLs from various patterns in Instagram embed/page HTML
  const patterns = [
    /class="EmbeddedMediaImage"[^>]*src="([^"]+)"/gi,
    /property="og:image"\s*content="([^"]+)"/gi,
    /<img[^>]*src="(https:\/\/(?:scontent[^"]*|instagram[^"]*)\.(jpg|png|webp)[^"]*)"/gi,
    /"display_url"\s*:\s*"([^"]+)"/gi,
    /"display_src"\s*:\s*"([^"]+)"/gi,
    /"image_versions2"[^}]*"url"\s*:\s*"([^"]+)"/gi,
    /src="(https:\/\/scontent[^"]+)"/gi,
    /"thumbnail_src"\s*:\s*"([^"]+)"/gi,
  ];

  for (const source of [html, decoded]) {
    for (const pattern of patterns) {
      pattern.lastIndex = 0; // Reset regex state
      let m;
      while ((m = pattern.exec(source)) !== null) {
        let imgUrl = m[1]
          .replace(/\\u0026/g, '&')
          .replace(/&amp;/g, '&')
          .replace(/\\\//g, '/');
        if (imgUrl.includes('scontent') || imgUrl.includes('cdninstagram') || imgUrl.includes('fbcdn')) {
          urls.add(imgUrl);
        }
      }
    }
  }

  return Array.from(urls);
}
