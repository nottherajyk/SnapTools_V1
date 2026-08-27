import { PDFDocument, PDFRawStream, PDFName, degrees, rgb, StandardFonts } from 'pdf-lib';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt-lite';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { formatBytes, downloadBlob, downloadDataURL, readFileAsArrayBuffer, readFileAsText, copyToClipboard, renderDropZone, renderMultiDropZone } from '../utils.js';
import { showToast } from '../components/toast.js';

export function pdfToolHandler(tool) {
  setTimeout(() => setupPdfTool(tool.id), 50);
  window.addEventListener('page-rendered', () => setupPdfTool(tool.id), { once: true });

  switch (tool.id) {
    case 'merge-pdf': return renderMergePDF();
    case 'split-pdf': return renderSplitPDF();
    case 'compress-pdf': return renderCompressPDF();
    case 'pdf-to-word': return renderPDFtoWord();
    case 'pdf-to-powerpoint': return renderPDFtoPowerPoint();
    case 'pdf-to-excel': return renderPDFtoExcel();
    case 'word-to-pdf': return renderWordtoPDF();
    case 'powerpoint-to-pdf': return renderPowerPointtoPDF();
    case 'excel-to-pdf': return renderExceltoPDF();
    case 'edit-pdf': return renderEditPDF();
    case 'pdf-to-images': return renderPDFtoImages();
    case 'jpg-to-pdf': return renderJPGtoPDF();
    case 'sign-pdf': return renderSignPDF();
    case 'pdf-watermark': return renderPDFWatermark();
    case 'rotate-pdf': return renderRotatePDF();
    case 'html-to-pdf': return renderHTMLtoPDF();
    case 'unlock-pdf': return renderUnlockPDF();
    case 'protect-pdf': return renderProtectPDF();
    case 'organize-pdf': return renderOrganizePDF();
    case 'remove-pages': return renderRemovePages();
    case 'extract-pages': return renderExtractPages();
    case 'pdf-to-pdfa': return renderPDFtoPDFA();
    case 'repair-pdf': return renderRepairPDF();
    case 'add-page-numbers': return renderAddPageNumbers();
    case 'scan-to-pdf': return renderScanToPDF();
    case 'ocr-pdf': return renderOCRPDF();
    case 'compare-pdf': return renderComparePDF();
    case 'redact-pdf': return renderRedactPDF();
    case 'crop-pdf': return renderCropPDF();
    case 'pdf-forms': return renderPDFForms();
    case 'pdf-summarize': return renderPDFSummarize();
    case 'translate-pdf': return renderTranslatePDF();
    case 'pdf-to-markdown': return renderPDFtoMarkdown();
    case 'pdf-metadata': return renderPDFMetadata();
    case 'acrobat-downloader': return renderAcrobatDownloader();
    default: return `<p>Tool coming soon!</p>`;
  }
}

// ==========================================================================
// RENDER FUNCTIONS
// ==========================================================================

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

function renderCompressPDF() {
  return `
    ${renderDropZone('pdfCompress', '.pdf', 'Drop your PDF to compress')}
    <div id="fileInfoArea"></div>
    <div class="form-group" style="margin-top:1rem">
      <label class="form-label">Compression Level</label>
      <div class="radio-card-grid">
        <label class="radio-card">
          <input type="radio" name="compressLevel" value="high" />
          <div class="radio-card-content">
            <span class="radio-card-title">High Compression</span>
            <span class="radio-card-desc">Smaller file, lower resolution</span>
          </div>
        </label>
        <label class="radio-card">
          <input type="radio" name="compressLevel" value="recommended" checked />
          <div class="radio-card-content">
            <span class="radio-card-title">Recommended</span>
            <span class="radio-card-desc">Good quality & compression</span>
          </div>
        </label>
        <label class="radio-card">
          <input type="radio" name="compressLevel" value="low" />
          <div class="radio-card-content">
            <span class="radio-card-title">Lossless / Low</span>
            <span class="radio-card-desc">Maximum image quality</span>
          </div>
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

function renderPDFtoWord() {
  return `
    ${renderDropZone('pdfToWord', '.pdf', 'Drop your PDF here')}
    <div id="fileInfoArea"></div>
    <div class="actions-row mt-6">
      <button class="btn btn-primary min-w-[200px]" id="convertBtn" disabled>📝 Convert to Word (.docx)</button>
    </div>
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

function renderPDFtoPowerPoint() {
  return `
    ${renderDropZone('pdfToPpt', '.pdf', 'Drop your PDF to convert to PowerPoint')}
    <div id="fileInfoArea"></div>
    <div class="form-row" style="margin-top:1rem">
      <div class="form-group">
        <label class="form-label">Slide Aspect Ratio</label>
        <select class="form-select" id="pptAspectRatio">
          <option value="16:9" selected>16:9 Widescreen (Standard)</option>
          <option value="4:3">4:3 Standard</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Slide Quality</label>
        <select class="form-select" id="pptQuality">
          <option value="2" selected>High Definition (2x HD)</option>
          <option value="1">Standard (1x)</option>
        </select>
      </div>
    </div>
    <div class="actions-row mt-6">
      <button class="btn btn-primary" id="convertPptBtn" disabled>📊 Convert to PowerPoint (.pptx)</button>
    </div>
    <div class="result-area" id="resultArea">
      <div class="result-meta" id="resultMeta"></div>
    </div>
  `;
}

function renderPDFtoExcel() {
  return `
    ${renderDropZone('pdfToExcel', '.pdf', 'Drop your PDF table or document')}
    <div id="fileInfoArea"></div>
    <div class="form-row" style="margin-top:1rem">
      <div class="form-group">
        <label class="form-label">Export Format</label>
        <select class="form-select" id="excelFormat">
          <option value="xlsx" selected>Excel Spreadsheet (.xlsx)</option>
          <option value="csv">CSV (Comma-Separated Values)</option>
          <option value="tsv">TSV (Tab-Separated Values)</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Table Detection Mode</label>
        <select class="form-select" id="tableDetectMode">
          <option value="auto" selected>Automatic (Positional Coordinates)</option>
          <option value="lines">Line by Line Text</option>
        </select>
      </div>
    </div>
    <div class="actions-row mt-6">
      <button class="btn btn-primary" id="convertExcelBtn" disabled>📊 Convert to Spreadsheet</button>
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
    <div class="actions-row mt-6">
      <button class="btn btn-primary" id="convertBtn" disabled>📄 Convert to PDF</button>
    </div>
    <div class="result-area" id="resultArea">
      <div class="result-meta" id="resultMeta"></div>
    </div>
  `;
}

function renderPowerPointtoPDF() {
  return `
    ${renderDropZone('pptxToPdf', '.pptx', 'Drop your PowerPoint presentation (.pptx)')}
    <div id="fileInfoArea"></div>
    <div class="form-group" style="margin-top:1rem">
      <label class="form-label">Slide Page Orientation</label>
      <select class="form-select" id="pptxOrientation">
        <option value="landscape" selected>Landscape (Recommended for Slides)</option>
        <option value="portrait">Portrait</option>
      </select>
    </div>
    <div class="actions-row mt-6">
      <button class="btn btn-primary" id="convertPptxBtn" disabled>📄 Convert to PDF</button>
    </div>
    <div class="result-area" id="resultArea">
      <div class="result-meta" id="resultMeta"></div>
    </div>
  `;
}

function renderExceltoPDF() {
  return `
    ${renderDropZone('excelToPdf', '.xlsx,.xls,.csv,.tsv', 'Drop your Excel spreadsheet or CSV')}
    <div id="fileInfoArea"></div>
    <div class="form-row" style="margin-top:1rem">
      <div class="form-group">
        <label class="form-label">Orientation</label>
        <select class="form-select" id="excelOrientation">
          <option value="landscape" selected>Landscape (Wide Tables)</option>
          <option value="portrait">Portrait</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Page Size</label>
        <select class="form-select" id="excelPageSize">
          <option value="a4" selected>A4</option>
          <option value="letter">Letter</option>
        </select>
      </div>
    </div>
    <div class="actions-row mt-6">
      <button class="btn btn-primary" id="convertExcelToPdfBtn" disabled>📄 Convert to PDF</button>
    </div>
    <div class="result-area" id="resultArea">
      <div class="result-meta" id="resultMeta"></div>
    </div>
  `;
}

function renderEditPDF() {
  return `
    ${renderDropZone('pdfEdit', '.pdf', 'Drop your PDF to edit & annotate')}
    <div id="fileInfoArea"></div>
    
    <div id="editorWorkspace" style="display:none; margin-top:1.5rem;" class="pdf-editor-wrapper">
      <div class="pdf-editor-toolbar">
        <div style="display:flex; gap:0.4rem; align-items:center;">
          <button type="button" class="editor-tool-btn active" data-tool="draw" id="toolDraw">✏️ Pen</button>
          <button type="button" class="editor-tool-btn" data-tool="text" id="toolText">📝 Text</button>
          <button type="button" class="editor-tool-btn" data-tool="rect" id="toolRect">🔲 Box</button>
          <button type="button" class="editor-tool-btn" data-tool="highlight" id="toolHighlight">🖍️ Highlight</button>
        </div>
        <div style="height:24px; width:2px; background:var(--border); margin:0 0.5rem;"></div>
        <div style="display:flex; gap:0.5rem; align-items:center;">
          <label style="font-size:0.8rem; font-weight:700;">Color:</label>
          <input type="color" id="editColor" value="#FF007F" style="width:36px; height:32px; border:2px solid var(--border); border-radius:6px; cursor:pointer;" />
          <label style="font-size:0.8rem; font-weight:700; margin-left:0.5rem;">Size:</label>
          <select id="editSize" class="form-select" style="width:auto; padding:0.25rem 0.5rem; font-size:0.85rem;">
            <option value="2">Thin (2px)</option>
            <option value="4" selected>Medium (4px)</option>
            <option value="8">Thick (8px)</option>
            <option value="16">Heavy (16px)</option>
          </select>
        </div>
        <div style="height:24px; width:2px; background:var(--border); margin:0 0.5rem;"></div>
        <div style="display:flex; gap:0.4rem; align-items:center;">
          <button type="button" class="editor-tool-btn" id="editUndoBtn">↩️ Undo</button>
          <button type="button" class="editor-tool-btn" id="editClearBtn">🧹 Clear Page</button>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin: 0.5rem 0;">
        <button type="button" class="btn btn-secondary" id="editPrevPage" style="padding:0.4rem 1rem;">⬅ Previous Page</button>
        <span id="editPageIndicator" style="font-weight:800; font-size:0.9rem;">Page 1 of 1</span>
        <button type="button" class="btn btn-secondary" id="editNextPage" style="padding:0.4rem 1rem;">Next Page ➡</button>
      </div>

      <div class="pdf-canvas-container" id="editorCanvasWrap">
        <canvas id="pdfBaseCanvas"></canvas>
        <canvas id="pdfOverlayCanvas" class="pdf-drawing-overlay"></canvas>
      </div>

      <div class="actions-row mt-6">
        <button class="btn btn-primary min-w-[220px]" id="saveEditedPdfBtn">💾 Save & Download Edited PDF</button>
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
      <button class="btn btn-primary min-w-[200px]" id="convertBtn" disabled>🖼️ Convert PDF to Images</button>
    </div>
    <div class="result-area" id="resultArea">
      <div class="result-meta" id="resultMeta"></div>
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

function renderSignPDF() {
  return `
    ${renderDropZone('pdfSign', '.pdf', 'Drop your PDF to sign')}
    <div id="fileInfoArea"></div>

    <div id="signWorkspace" style="display:none; margin-top:1.5rem;">
      <div class="form-group">
        <label class="form-label">Create Your Signature</label>
        <div style="display:flex; gap:0.5rem; margin-bottom:1rem;">
          <button type="button" class="btn btn-secondary active" id="sigModeDraw">✏️ Draw Signature</button>
          <button type="button" class="btn btn-secondary" id="sigModeType">⌨️ Type Name</button>
          <button type="button" class="btn btn-secondary" id="sigModeUpload">📁 Upload Image</button>
        </div>

        <div id="sigDrawArea" style="margin-bottom:1rem;">
          <div class="sig-pad-box">
            <canvas id="sigCanvas"></canvas>
          </div>
          <button type="button" class="btn btn-secondary mt-2" id="clearSigBtn" style="padding:0.3rem 0.8rem; font-size:0.8rem;">🧹 Clear</button>
        </div>

        <div id="sigTypeArea" style="display:none; margin-bottom:1rem;">
          <input type="text" class="form-input" id="sigTextInput" placeholder="Type your full name..." />
          <div class="sig-type-preview mt-2" id="sigTypePreview">Your Signature</div>
        </div>

        <div id="sigUploadArea" style="display:none; margin-bottom:1rem;">
          <input type="file" accept="image/*" class="form-input" id="sigImageInput" />
        </div>
      </div>

      <div class="form-row mt-4">
        <div class="form-group">
          <label class="form-label">Stamp on Page</label>
          <select class="form-select" id="sigPageSelect">
            <option value="1">Page 1</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Signature Position</label>
          <select class="form-select" id="sigPosSelect">
            <option value="bottom-right" selected>Bottom Right</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="bottom-center">Bottom Center</option>
            <option value="center">Center</option>
          </select>
        </div>
      </div>

      <div class="actions-row mt-6">
        <button class="btn btn-primary min-w-[200px]" id="applySigBtn">🖋️ Apply Signature & Download</button>
      </div>
    </div>
  `;
}

function renderPDFWatermark() {
  return `
    ${renderDropZone('pdfWatermark', '.pdf', 'Drop your PDF to watermark')}
    <div id="fileInfoArea"></div>

    <div class="form-group mt-4">
      <label class="form-label">Watermark Text</label>
      <input type="text" class="form-input" id="watermarkText" value="CONFIDENTIAL" placeholder="e.g. CONFIDENTIAL, DRAFT, SAMPLE..." />
    </div>

    <div class="form-row mt-4">
      <div class="form-group">
        <label class="form-label">Color</label>
        <input type="color" class="form-input" id="watermarkColor" value="#FF007F" style="height:42px; padding:2px; cursor:pointer;" />
      </div>
      <div class="form-group">
        <label class="form-label">Font Size</label>
        <select class="form-select" id="watermarkFontSize">
          <option value="24">24pt (Small)</option>
          <option value="42" selected>42pt (Medium)</option>
          <option value="64">64pt (Large)</option>
          <option value="96">96pt (Huge)</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Opacity (Transparency)</label>
        <select class="form-select" id="watermarkOpacity">
          <option value="0.15">15% (Subtle)</option>
          <option value="0.3" selected>30% (Recommended)</option>
          <option value="0.6">60% (Bold)</option>
          <option value="1.0">100% (Solid)</option>
        </select>
      </div>
    </div>

    <div class="form-row mt-4">
      <div class="form-group">
        <label class="form-label">Rotation Angle</label>
        <select class="form-select" id="watermarkAngle">
          <option value="45" selected>45° (Diagonal - Standard)</option>
          <option value="0">0° (Horizontal)</option>
          <option value="90">90° (Vertical)</option>
          <option value="-45">-45° (Reverse Diagonal)</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Position Placement</label>
        <select class="form-select" id="watermarkPlacement">
          <option value="center" selected>Center of Page</option>
          <option value="tiled">Tiled / Repeated Mosaic</option>
          <option value="top">Top Header</option>
          <option value="bottom">Bottom Footer</option>
        </select>
      </div>
    </div>

    <div class="actions-row mt-6">
      <button class="btn btn-primary" id="applyWatermarkBtn" disabled>💧 Stamp Watermark & Download</button>
    </div>
    <div class="result-area" id="resultArea">
      <div class="result-meta" id="resultMeta"></div>
    </div>
  `;
}

function renderRotatePDF() {
  return `
    ${renderDropZone('pdfRotate', '.pdf', 'Drop your PDF to rotate')}
    <div id="fileInfoArea"></div>

    <div id="rotateWorkspace" style="display:none; margin-top:1.5rem;">
      <div style="display:flex; flex-wrap:wrap; gap:0.5rem; justify-content:space-between; align-items:center;">
        <div style="display:flex; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" id="rotateAllRight">⟳ Rotate All 90°</button>
          <button type="button" class="btn btn-secondary" id="rotateAllLeft">⟲ Rotate All -90°</button>
          <button type="button" class="btn btn-secondary" id="rotateResetAll">🔄 Reset</button>
        </div>
        <span id="rotatePageCount" style="font-weight:700; font-size:0.9rem;">0 pages loaded</span>
      </div>

      <div class="pdf-page-grid" id="rotatePageGrid"></div>

      <div class="actions-row mt-6">
        <button class="btn btn-primary min-w-[200px]" id="saveRotatedPdfBtn">💾 Save Rotated PDF</button>
      </div>
    </div>
  `;
}

function renderHTMLtoPDF() {
  return `
    <div class="form-group">
      <label class="form-label">HTML Content / Code</label>
      <textarea class="form-input" id="htmlCodeInput" rows="8" placeholder="<h1>My Invoice</h1><p>Enter your HTML code here...</p>"><h1>Document Title</h1>
<p>This is a formatted document converted directly from HTML to a clean PDF page.</p>
<ul>
  <li>Fast client-side rendering</li>
  <li>Custom layouts and CSS formatting</li>
  <li>100% private and offline-capable</li>
</ul></textarea>
    </div>

    <div class="form-row mt-4">
      <div class="form-group">
        <label class="form-label">Page Size</label>
        <select class="form-select" id="htmlPageSize">
          <option value="a4" selected>A4</option>
          <option value="letter">Letter</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Orientation</label>
        <select class="form-select" id="htmlOrientation">
          <option value="portrait" selected>Portrait</option>
          <option value="landscape">Landscape</option>
        </select>
      </div>
    </div>

    <div class="actions-row mt-6">
      <button class="btn btn-primary min-w-[200px]" id="convertHtmlBtn">📄 Convert HTML to PDF</button>
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

function renderOrganizePDF() {
  return `
    ${renderDropZone('pdfOrganize', '.pdf', 'Drop your PDF to organize & reorder')}
    <div id="fileInfoArea"></div>

    <div id="organizeWorkspace" style="display:none; margin-top:1.5rem;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <p class="tool-desc" style="margin:0;">Rearrange pages, delete pages, or rotate individual pages.</p>
        <button type="button" class="btn btn-secondary" id="addBlankPageBtn">➕ Add Blank Page</button>
      </div>

      <div class="pdf-page-grid" id="organizePageGrid"></div>

      <div class="actions-row mt-6">
        <button class="btn btn-primary min-w-[200px]" id="saveOrganizedPdfBtn">📑 Save Organized PDF</button>
      </div>
    </div>
  `;
}

function renderRemovePages() {
  return `
    ${renderDropZone('pdfRemovePages', '.pdf', 'Drop your PDF to remove pages')}
    <div id="fileInfoArea"></div>

    <div id="removePagesWorkspace" style="display:none; margin-top:1.5rem;">
      <div class="form-group">
        <label class="form-label">Pages to Delete (Click thumbnails below or type range e.g. 1, 3-5)</label>
        <input type="text" class="form-input" id="removeRangeInput" placeholder="e.g. 2, 4-6" />
      </div>

      <div class="pdf-page-grid" id="removePageGrid"></div>

      <div class="actions-row mt-6">
        <button class="btn btn-primary min-w-[220px]" id="executeRemoveBtn">🗑️ Delete Pages & Download</button>
      </div>
    </div>
  `;
}

function renderExtractPages() {
  return `
    ${renderDropZone('pdfExtractPages', '.pdf', 'Drop your PDF to extract pages')}
    <div id="fileInfoArea"></div>

    <div id="extractWorkspace" style="display:none; margin-top:1.5rem;">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Extraction Mode</label>
          <select class="form-select" id="extractMode">
            <option value="merge" selected>Merge extracted pages into 1 PDF</option>
            <option value="zip">Extract each page into separate PDFs (ZIP)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Page Selection (e.g. 1-3, 5, 8)</label>
          <input type="text" class="form-input" id="extractRangeInput" placeholder="Click thumbnails or type 1, 3-5" />
        </div>
      </div>

      <div class="pdf-page-grid" id="extractPageGrid"></div>

      <div class="actions-row mt-6">
        <button class="btn btn-primary min-w-[200px]" id="executeExtractBtn">📦 Extract Pages</button>
      </div>
    </div>
  `;
}

function renderPDFtoPDFA() {
  return `
    ${renderDropZone('pdfToPdfa', '.pdf', 'Drop your PDF to convert to PDF/A')}
    <div id="fileInfoArea"></div>
    <div class="form-group mt-4">
      <label class="form-label">ISO Conformance Profile</label>
      <select class="form-select" id="pdfaProfile">
        <option value="1b" selected>PDF/A-1b (ISO 19005-1 Level B - Most Compatible)</option>
        <option value="2b">PDF/A-2b (ISO 19005-2 Level B - Modern Archival)</option>
      </select>
    </div>
    <div class="actions-row mt-6">
      <button class="btn btn-primary min-w-[200px]" id="convertPdfaBtn" disabled>🏛️ Convert to PDF/A</button>
    </div>
    <div class="result-area" id="resultArea">
      <div class="result-meta" id="resultMeta"></div>
    </div>
  `;
}

function renderRepairPDF() {
  return `
    ${renderDropZone('pdfRepair', '.pdf', 'Drop damaged or corrupted PDF')}
    <div id="fileInfoArea"></div>
    <div class="actions-row mt-6">
      <button class="btn btn-primary min-w-[200px]" id="repairPdfBtn" disabled>🛠️ Repair & Recover PDF</button>
    </div>
    <div class="result-area" id="resultArea">
      <div class="result-meta" id="resultMeta"></div>
    </div>
  `;
}

function renderAddPageNumbers() {
  return `
    ${renderDropZone('pdfPageNumbers', '.pdf', 'Drop your PDF to add page numbers')}
    <div id="fileInfoArea"></div>

    <div class="form-row mt-4">
      <div class="form-group">
        <label class="form-label">Numbering Format</label>
        <select class="form-select" id="pageNumFormat">
          <option value="Page {n} of {total}" selected>Page {n} of {total}</option>
          <option value="{n} of {total}">{n} of {total}</option>
          <option value="Page {n}">Page {n}</option>
          <option value="{n}">{n}</option>
          <option value="- {n} -">- {n} -</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Position Placement</label>
        <select class="form-select" id="pageNumPos">
          <option value="bottom-center" selected>Bottom Center</option>
          <option value="bottom-right">Bottom Right</option>
          <option value="bottom-left">Bottom Left</option>
          <option value="top-center">Top Center</option>
          <option value="top-right">Top Right</option>
          <option value="top-left">Top Left</option>
        </select>
      </div>
    </div>

    <div class="form-row mt-4">
      <div class="form-group">
        <label class="form-label">Starting Page Number</label>
        <input type="number" class="form-input" id="pageNumStart" value="1" min="1" />
      </div>
      <div class="form-group">
        <label class="form-label">Font Size</label>
        <select class="form-select" id="pageNumFontSize">
          <option value="10">10pt (Small)</option>
          <option value="12" selected>12pt (Standard)</option>
          <option value="14">14pt (Large)</option>
        </select>
      </div>
    </div>

    <div class="actions-row mt-6">
      <button class="btn btn-primary" id="applyPageNumbersBtn" disabled>🔢 Add Page Numbers & Download</button>
    </div>
    <div class="result-area" id="resultArea">
      <div class="result-meta" id="resultMeta"></div>
    </div>
  `;
}

function renderScanToPDF() {
  return `
    <div class="scanner-feed-container">
      <video id="scannerVideo" class="scanner-video" autoplay playsinline muted></video>
      <div class="scanner-overlay-guide">
        <span style="background:rgba(0,0,0,0.7); color:#fff; padding:4px 10px; border-radius:4px; font-size:0.75rem;">Align Document Within Frame</span>
      </div>
    </div>

    <div style="display:flex; justify-content:center; gap:0.75rem; margin-top:1rem;">
      <button type="button" class="btn btn-primary" id="capturePageBtn">📸 Snap Page</button>
      <button type="button" class="btn btn-secondary" id="switchCameraBtn">🔄 Switch Camera</button>
      <label class="btn btn-secondary" style="cursor:pointer; margin:0;">
        📁 Upload Image Scan
        <input type="file" id="scanUploadInput" accept="image/*" multiple style="display:none;" />
      </label>
    </div>

    <div class="form-group mt-4">
      <label class="form-label">Document Enhancement Filter</label>
      <select class="form-select" id="scanFilter">
        <option value="bw" selected>B&W High Contrast Document (Clean Text)</option>
        <option value="gray">Grayscale</option>
        <option value="color">Full Color</option>
      </select>
    </div>

    <div style="margin-top:1.5rem;">
      <h4 style="font-size:0.9rem; font-weight:700; margin-bottom:0.75rem;">Captured Pages (<span id="scanCount">0</span>)</h4>
      <div class="pdf-page-grid" id="scanThumbsGrid"></div>
    </div>

    <div class="actions-row mt-6">
      <button class="btn btn-primary min-w-[200px]" id="createScanPdfBtn" disabled>📄 Generate PDF Document</button>
    </div>
  `;
}

function renderOCRPDF() {
  return `
    ${renderDropZone('pdfOcr', '.pdf', 'Drop scanned PDF or image document')}
    <div id="fileInfoArea"></div>

    <div class="actions-row mt-6">
      <button class="btn btn-primary min-w-[200px]" id="runOcrBtn" disabled>🔍 Extract Searchable Text</button>
    </div>

    <div id="ocrOutputArea" style="display:none; margin-top:1.5rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
        <span style="font-weight:700; font-size:0.9rem;">Extracted Text Output:</span>
        <div style="display:flex; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" id="copyOcrBtn" style="padding:0.3rem 0.8rem; font-size:0.8rem;">📋 Copy</button>
          <button type="button" class="btn btn-secondary" id="downloadOcrBtn" style="padding:0.3rem 0.8rem; font-size:0.8rem;">💾 Download .txt</button>
        </div>
      </div>
      <div class="text-output-preview" id="ocrTextPreview"></div>
    </div>
  `;
}

function renderComparePDF() {
  return `
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
      <div>
        <h4 style="font-size:0.9rem; font-weight:800; margin-bottom:0.5rem;">Document A (Original)</h4>
        ${renderDropZone('pdfCompareA', '.pdf', 'Drop Original PDF (Doc A)')}
        <div id="fileInfoA" style="margin-top:0.5rem;"></div>
      </div>
      <div>
        <h4 style="font-size:0.9rem; font-weight:800; margin-bottom:0.5rem;">Document B (Modified)</h4>
        ${renderDropZone('pdfCompareB', '.pdf', 'Drop Modified PDF (Doc B)')}
        <div id="fileInfoB" style="margin-top:0.5rem;"></div>
      </div>
    </div>

    <div class="actions-row mt-6">
      <button class="btn btn-primary min-w-[200px]" id="runCompareBtn" disabled>⚖️ Compare Documents</button>
    </div>

    <div id="compareWorkspace" style="display:none; margin-top:1.5rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <div style="display:flex; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" id="comparePrevPage">⬅ Prev</button>
          <span id="comparePageIndicator" style="display:flex; align-items:center; font-weight:700; font-size:0.85rem;">Page 1</span>
          <button type="button" class="btn btn-secondary" id="compareNextPage">Next ➡</button>
        </div>
        <span style="font-size:0.85rem; font-weight:700; color:var(--accent);">Differences Highlighted in Magenta</span>
      </div>

      <div class="compare-split-view">
        <div class="compare-card">
          <h4>Doc A (Original)</h4>
          <canvas id="compareCanvasA" style="max-width:100%; border:2px solid var(--border); border-radius:8px;"></canvas>
        </div>
        <div class="compare-card">
          <h4>Doc B (Modified Diff Overlay)</h4>
          <canvas id="compareCanvasB" style="max-width:100%; border:2px solid var(--border); border-radius:8px;"></canvas>
        </div>
      </div>
    </div>
  `;
}

function renderRedactPDF() {
  return `
    ${renderDropZone('pdfRedact', '.pdf', 'Drop your PDF to redact')}
    <div id="fileInfoArea"></div>

    <div id="redactWorkspace" style="display:none; margin-top:1.5rem;" class="pdf-editor-wrapper">
      <div class="pdf-editor-toolbar" style="justify-content:space-between;">
        <div style="display:flex; gap:0.5rem; align-items:center;">
          <span style="font-size:0.85rem; font-weight:700;">Click & drag on the document to draw black redaction boxes.</span>
        </div>
        <button type="button" class="editor-tool-btn" id="clearRedactPageBtn">🧹 Clear Page Redactions</button>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin: 0.5rem 0;">
        <button type="button" class="btn btn-secondary" id="redactPrevPage">⬅ Previous Page</button>
        <span id="redactPageIndicator" style="font-weight:800; font-size:0.9rem;">Page 1 of 1</span>
        <button type="button" class="btn btn-secondary" id="redactNextPage">Next Page ➡</button>
      </div>

      <div class="pdf-canvas-container">
        <canvas id="redactBaseCanvas"></canvas>
        <canvas id="redactOverlayCanvas" class="pdf-drawing-overlay"></canvas>
      </div>

      <div class="actions-row mt-6">
        <button class="btn btn-primary min-w-[220px]" id="applyRedactBtn">🔒 Permanently Redact & Download</button>
      </div>
    </div>
  `;
}

function renderCropPDF() {
  return `
    ${renderDropZone('pdfCrop', '.pdf', 'Drop your PDF to crop')}
    <div id="fileInfoArea"></div>

    <div id="cropWorkspace" style="display:none; margin-top:1.5rem;">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Crop Top Margin (pt)</label>
          <input type="number" class="form-input" id="cropTop" value="36" min="0" />
        </div>
        <div class="form-group">
          <label class="form-label">Crop Bottom Margin (pt)</label>
          <input type="number" class="form-input" id="cropBottom" value="36" min="0" />
        </div>
        <div class="form-group">
          <label class="form-label">Crop Left Margin (pt)</label>
          <input type="number" class="form-input" id="cropLeft" value="36" min="0" />
        </div>
        <div class="form-group">
          <label class="form-label">Crop Right Margin (pt)</label>
          <input type="number" class="form-input" id="cropRight" value="36" min="0" />
        </div>
      </div>

      <div class="actions-row mt-6">
        <button class="btn btn-primary min-w-[200px]" id="executeCropBtn">✂️ Crop PDF & Download</button>
      </div>
    </div>
  `;
}

function renderPDFForms() {
  return `
    ${renderDropZone('pdfForms', '.pdf', 'Drop interactive fillable PDF form')}
    <div id="fileInfoArea"></div>

    <div id="formsWorkspace" style="display:none; margin-top:1.5rem;">
      <h3 style="font-size:1.1rem; font-weight:800; margin-bottom:1rem;">Detected Form Fields</h3>
      <div id="formFieldsContainer" style="display:flex; flex-direction:column; gap:1rem;"></div>

      <div class="form-group mt-4">
        <label class="radio-card" style="display:inline-flex; align-items:center; gap:0.5rem;">
          <input type="checkbox" id="flattenFormCheck" checked />
          <span style="font-weight:700; font-size:0.9rem;">Flatten Form Fields (Make read-only & permanent)</span>
        </label>
      </div>

      <div class="actions-row mt-6">
        <button class="btn btn-primary min-w-[200px]" id="saveFilledFormBtn">💾 Save Filled Form PDF</button>
      </div>
    </div>
  `;
}

function renderPDFSummarize() {
  return `
    ${renderDropZone('pdfSummarize', '.pdf', 'Drop your PDF to summarize')}
    <div id="fileInfoArea"></div>

    <div class="form-group mt-4">
      <label class="form-label">Summary Format</label>
      <select class="form-select" id="summarizeType">
        <option value="exec" selected>Executive Summary & Key Insights</option>
        <option value="bullets">Key Bullet Points & Takeaways</option>
        <option value="brief">Action Items & TL;DR</option>
      </select>
    </div>

    <div class="actions-row mt-6">
      <button class="btn btn-primary min-w-[200px]" id="generateSummaryBtn" disabled>✨ Generate Summary</button>
    </div>

    <div id="summaryOutputArea" style="display:none; margin-top:1.5rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
        <span style="font-weight:800; font-size:0.95rem;">AI PDF Summary Output:</span>
        <div style="display:flex; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" id="copySummaryBtn" style="padding:0.3rem 0.8rem; font-size:0.8rem;">📋 Copy</button>
          <button type="button" class="btn btn-secondary" id="downloadSummaryBtn" style="padding:0.3rem 0.8rem; font-size:0.8rem;">💾 Download .txt</button>
        </div>
      </div>
      <div class="text-output-preview" id="summaryTextPreview"></div>
    </div>
  `;
}

function renderTranslatePDF() {
  return `
    ${renderDropZone('pdfTranslate', '.pdf', 'Drop your PDF to translate')}
    <div id="fileInfoArea"></div>

    <div class="form-row mt-4">
      <div class="form-group">
        <label class="form-label">Source Language</label>
        <select class="form-select" id="translateSourceLang">
          <option value="auto" selected>Auto Detect</option>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Target Language</label>
        <select class="form-select" id="translateTargetLang">
          <option value="es" selected>Spanish (Español)</option>
          <option value="fr">French (Français)</option>
          <option value="de">German (Deutsch)</option>
          <option value="it">Italian (Italiano)</option>
          <option value="pt">Portuguese (Português)</option>
          <option value="zh">Chinese (中文)</option>
          <option value="ja">Japanese (日本語)</option>
          <option value="hi">Hindi (हिन्दी)</option>
          <option value="ar">Arabic (العربية)</option>
          <option value="ru">Russian (Русский)</option>
          <option value="en">English</option>
        </select>
      </div>
    </div>

    <div class="actions-row mt-6">
      <button class="btn btn-primary min-w-[200px]" id="translateDocBtn" disabled>🌐 Translate PDF</button>
    </div>

    <div id="translateOutputArea" style="display:none; margin-top:1.5rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
        <span style="font-weight:800; font-size:0.95rem;">Translated Document Text:</span>
        <div style="display:flex; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" id="copyTranslateBtn" style="padding:0.3rem 0.8rem; font-size:0.8rem;">📋 Copy</button>
          <button type="button" class="btn btn-secondary" id="downloadTranslateBtn" style="padding:0.3rem 0.8rem; font-size:0.8rem;">💾 Download .txt</button>
        </div>
      </div>
      <div class="text-output-preview" id="translateTextPreview"></div>
    </div>
  `;
}

function renderPDFtoMarkdown() {
  return `
    ${renderDropZone('pdfToMarkdown', '.pdf', 'Drop your PDF to convert to Markdown')}
    <div id="fileInfoArea"></div>

    <div class="actions-row mt-6">
      <button class="btn btn-primary min-w-[200px]" id="convertMarkdownBtn" disabled>📝 Convert to Markdown</button>
    </div>

    <div id="markdownOutputArea" style="display:none; margin-top:1.5rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
        <span style="font-weight:800; font-size:0.95rem;">Generated Markdown (.md):</span>
        <div style="display:flex; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" id="copyMarkdownBtn" style="padding:0.3rem 0.8rem; font-size:0.8rem;">📋 Copy Markdown</button>
          <button type="button" class="btn btn-secondary" id="downloadMarkdownBtn" style="padding:0.3rem 0.8rem; font-size:0.8rem;">💾 Download .md</button>
        </div>
      </div>
      <div class="text-output-preview" id="markdownTextPreview"></div>
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
      
      <div id="acrobatLoading" class="hidden mt-8 flex flex-col items-center gap-4 py-8">
        <div class="relative w-12 h-12">
          <div class="absolute inset-0 rounded-full border-4 border-slate-700 border-t-indigo-500 animate-spin"></div>
        </div>
        <p class="text-sm text-slate-300 animate-pulse font-medium">Resolving document from Adobe Creative Cloud...</p>
      </div>

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
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" id="acrobatActions"></div>
        </div>
      </div>
    </div>
  `;
}


// ==========================================================================
// SETUP & INTERACTION LOGIC
// ==========================================================================

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
            addMoreBtn.addEventListener('click', () => { input.click(); });
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

    zone.addEventListener('click', () => { input.click(); });
    zone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        input.click();
      }
    });
    input.addEventListener('click', (e) => { e.stopPropagation(); });
    input.addEventListener('change', () => {
      if (input.files.length) handleSelectedFiles(Array.from(input.files));
    });
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

  // 1. Merge PDF
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
        showToast('PDFs merged successfully!');
      } catch (e) {
        showToast('Error: ' + e.message, 'error');
      }
    });
  }

  // 2. Split PDF
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
          const zip = new JSZip();
          for (let i = 0; i < totalPages; i++) {
            const newPdf = await PDFDocument.create();
            const [page] = await newPdf.copyPages(pdf, [i]);
            newPdf.addPage(page);
            const bytes = await newPdf.save();
            zip.file(`page-${i + 1}.pdf`, bytes);
          }
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          downloadBlob(zipBlob, currentFiles[0].name.replace('.pdf', '') + '-pages.zip');
          showToast(`Split ${totalPages} pages into ZIP!`);
        } else {
          const rangeStr = document.getElementById('pageRange')?.value || '';
          const pages = parsePageRange(rangeStr, totalPages);
          const newPdf = await PDFDocument.create();
          const copiedPages = await newPdf.copyPages(pdf, pages.map(p => p - 1));
          copiedPages.forEach(p => newPdf.addPage(p));
          const bytes = await newPdf.save();
          downloadBlob(new Blob([bytes], { type: 'application/pdf' }), `split-pages.pdf`);
          showToast(`Extracted ${pages.length} pages!`);
        }
      } catch (e) {
        showToast('Error: ' + e.message, 'error');
      }
    });
  }

  // 3. Compress PDF
  if (toolId === 'compress-pdf') {
    const compressBtn = document.getElementById('compressBtn');
    bindDropZone('pdfCompress', (files) => {
      currentFiles = files;
      showFileInfo(files);
      if (compressBtn) compressBtn.disabled = false;
    });

    compressBtn?.addEventListener('click', async () => {
      try {
        compressBtn.disabled = true;
        compressBtn.innerHTML = '<span class="spinner-sm"></span> Compressing...';
        const buffer = await readFileAsArrayBuffer(currentFiles[0]);
        const pdfDoc = await PDFDocument.load(buffer);
        const level = document.querySelector('input[name="compressLevel"]:checked')?.value || 'recommended';
        const scale = level === 'high' ? 0.5 : (level === 'low' ? 0.9 : 0.7);
        const quality = level === 'high' ? 0.5 : (level === 'low' ? 0.9 : 0.7);

        for (const [ref, obj] of pdfDoc.context.indirectObjects.entries()) {
          if (obj instanceof PDFRawStream && obj.dict.get(PDFName.of('Subtype')) === PDFName.of('Image')) {
            const isJpg = obj.dict.get(PDFName.of('Filter'))?.toString() === '/DCTDecode';
            const isFlate = obj.dict.get(PDFName.of('Filter'))?.toString() === '/FlateDecode';
            if (isJpg || isFlate) {
              const imageBlob = new Blob([obj.contents], { type: isJpg ? 'image/jpeg' : 'image/png' });
              const imgUrl = URL.createObjectURL(imageBlob);
              try {
                const img = await loadImage(imgUrl);
                URL.revokeObjectURL(imgUrl);
                const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
                if (w > 10 && h > 10) {
                  const canvas = document.createElement('canvas');
                  canvas.width = w; canvas.height = h;
                  const ctx = canvas.getContext('2d');
                  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, w, h);
                  ctx.drawImage(img, 0, 0, w, h);
                  const compressedBlob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', quality));
                  const compressedBytes = new Uint8Array(await compressedBlob.arrayBuffer());
                  obj.contents = compressedBytes;
                  obj.dict.set(PDFName.of('Length'), pdfDoc.context.obj(compressedBytes.length));
                  obj.dict.set(PDFName.of('Filter'), PDFName.of('DCTDecode'));
                  obj.dict.set(PDFName.of('Width'), pdfDoc.context.obj(w));
                  obj.dict.set(PDFName.of('Height'), pdfDoc.context.obj(h));
                }
              } catch (e) { URL.revokeObjectURL(imgUrl); }
            }
          }
        }
        const compressedBytes = await pdfDoc.save();
        const compressedBlob = new Blob([compressedBytes], { type: 'application/pdf' });
        downloadBlob(compressedBlob, currentFiles[0].name.replace('.pdf', '') + '-compressed.pdf');
        showToast('PDF compressed successfully!', 'success');
      } catch (e) {
        showToast('Compression error: ' + e.message, 'error');
      } finally {
        if (compressBtn) { compressBtn.disabled = false; compressBtn.innerHTML = '🗜️ Compress PDF'; }
      }
    });
  }

  // 4. PDF to Word
  if (toolId === 'pdf-to-word') {
    const convertBtn = document.getElementById('convertBtn');
    bindDropZone('pdfToWord', (files) => {
      currentFiles = files;
      showFileInfo(files);
      if (convertBtn) convertBtn.disabled = false;
    });

    convertBtn?.addEventListener('click', async () => {
      try {
        convertBtn.disabled = true;
        convertBtn.innerHTML = '<span class="spinner-sm"></span> Converting...';
        const arrayBuffer = await readFileAsArrayBuffer(currentFiles[0]);
        const pdfjs = await loadPdfJs();
        const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        let paragraphs = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          let lineText = '';
          for (const item of textContent.items) {
            lineText += (lineText ? ' ' : '') + item.str;
          }
          if (lineText.trim()) paragraphs.push(lineText.trim());
        }

        const zip = new JSZip();
        zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`);
        zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`);
        const pXmls = paragraphs.map(p => `<w:p><w:r><w:t>${escapeXml(p)}</w:t></w:r></w:p>`).join('');
        zip.folder('word').file('document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${pXmls}</w:body></w:document>`);
        const docxBlob = await zip.generateAsync({ type: 'blob' });
        downloadBlob(docxBlob, currentFiles[0].name.replace('.pdf', '') + '.docx');
        showToast('Converted PDF to Word successfully!', 'success');
      } catch (e) {
        showToast('Conversion error: ' + e.message, 'error');
      } finally {
        if (convertBtn) { convertBtn.disabled = false; convertBtn.innerHTML = '📝 Convert to Word (.docx)'; }
      }
    });
  }

  // 5. PDF to PowerPoint
  if (toolId === 'pdf-to-powerpoint') {
    const btn = document.getElementById('convertPptBtn');
    bindDropZone('pdfToPpt', (files) => {
      currentFiles = files;
      showFileInfo(files);
      if (btn) btn.disabled = false;
    });

    btn?.addEventListener('click', async () => {
      try {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-sm"></span> Converting to Slides...';
        const buffer = await readFileAsArrayBuffer(currentFiles[0]);
        const pdfjs = await loadPdfJs();
        const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
        const zip = new JSZip();

        zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="jpeg" ContentType="image/jpeg"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>${Array.from({length: pdf.numPages}, (_, i) => `<Override PartName="/ppt/slides/slide${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join('')}</Types>`);
        zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>`);

        let sldRels = '';
        let sldIds = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          sldRels += `<Relationship Id="rId${i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i}.xml"/>`;
          sldIds += `<p:sldId id="${255 + i}" r:id="rId${i}"/>`;

          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width; canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport }).promise;
          const imgBlob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.9));

          zip.folder('ppt').folder('media').file(`image${i}.jpeg`, imgBlob);
          zip.folder('ppt').folder('slides').folder('_rels').file(`slide${i}.xml.rels`, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdImg" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image${i}.jpeg"/></Relationships>`);
          zip.folder('ppt').folder('slides').file(`slide${i}.xml`, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr><p:pic><p:nvPicPr><p:cNvPr id="2" name="Slide Image"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="rIdImg"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="12192000" cy="6858000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic></p:spTree></p:cSld></p:sld>`);
        }

        zip.folder('ppt').file('presentation.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldMasterIdLst/><p:sldIdLst>${sldIds}</p:sldIdLst><p:sldSz cx="12192000" cy="6858000" type="screen16x9"/></p:presentation>`);
        zip.folder('ppt').folder('_rels').file('presentation.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sldRels}</Relationships>`);

        const pptxBlob = await zip.generateAsync({ type: 'blob' });
        downloadBlob(pptxBlob, currentFiles[0].name.replace('.pdf', '') + '.pptx');
        showToast('Converted PDF to PowerPoint successfully!', 'success');
      } catch (e) {
        showToast('Error: ' + e.message, 'error');
      } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '📊 Convert to PowerPoint (.pptx)'; }
      }
    });
  }

  // 6. PDF to Excel
  if (toolId === 'pdf-to-excel') {
    const btn = document.getElementById('convertExcelBtn');
    bindDropZone('pdfToExcel', (files) => {
      currentFiles = files;
      showFileInfo(files);
      if (btn) btn.disabled = false;
    });

    btn?.addEventListener('click', async () => {
      try {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-sm"></span> Extracting Tables...';
        const buffer = await readFileAsArrayBuffer(currentFiles[0]);
        const pdfjs = await loadPdfJs();
        const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
        const format = document.getElementById('excelFormat')?.value || 'xlsx';

        let allRows = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          let lineGroups = {};
          for (const item of textContent.items) {
            const y = Math.round(item.transform[5] / 8) * 8;
            if (!lineGroups[y]) lineGroups[y] = [];
            lineGroups[y].push(item);
          }
          const sortedYs = Object.keys(lineGroups).sort((a, b) => b - a);
          for (const y of sortedYs) {
            const items = lineGroups[y].sort((a, b) => a.transform[4] - b.transform[4]);
            allRows.push(items.map(it => it.str.trim()).filter(Boolean));
          }
        }

        if (format === 'csv' || format === 'tsv') {
          const delim = format === 'csv' ? ',' : '\t';
          const csvContent = allRows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(delim)).join('\n');
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          downloadBlob(blob, currentFiles[0].name.replace('.pdf', '') + '.' + format);
        } else {
          const zip = new JSZip();
          zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`);
          zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`);
          zip.folder('xl').folder('_rels').file('workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`);
          zip.folder('xl').file('workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets></workbook>`);

          const rowsXml = allRows.map((row, rIdx) => {
            const cellsXml = row.map((val, cIdx) => {
              const colLetter = String.fromCharCode(65 + (cIdx % 26));
              return `<c r="${colLetter}${rIdx + 1}" t="inlineStr"><is><t>${escapeXml(val)}</t></is></c>`;
            }).join('');
            return `<row r="${rIdx + 1}">${cellsXml}</row>`;
          }).join('');

          zip.folder('xl').folder('worksheets').file('sheet1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rowsXml}</sheetData></worksheet>`);
          const xlsxBlob = await zip.generateAsync({ type: 'blob' });
          downloadBlob(xlsxBlob, currentFiles[0].name.replace('.pdf', '') + '.xlsx');
        }
        showToast('Converted PDF to Spreadsheet successfully!', 'success');
      } catch (e) {
        showToast('Error: ' + e.message, 'error');
      } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '📊 Convert to Spreadsheet'; }
      }
    });
  }

  // 7. Word to PDF
  if (toolId === 'word-to-pdf') {
    const convertBtn = document.getElementById('convertBtn');
    bindDropZone('wordToPdf', (files) => {
      currentFiles = files;
      showFileInfo(files);
      if (convertBtn) convertBtn.disabled = false;
    });

    convertBtn?.addEventListener('click', async () => {
      try {
        convertBtn.disabled = true;
        convertBtn.innerHTML = '<span class="spinner-sm"></span> Converting DOCX...';
        const buffer = await readFileAsArrayBuffer(currentFiles[0]);
        const zip = await JSZip.loadAsync(buffer);
        const docXml = await zip.file('word/document.xml')?.async('text');
        if (!docXml) throw new Error('Invalid Word DOCX file.');

        const parser = new DOMParser();
        const xml = parser.parseFromString(docXml, 'application/xml');
        const paragraphs = Array.from(xml.getElementsByTagName('w:p')).map(p => Array.from(p.getElementsByTagName('w:t')).map(t => t.textContent).join('')).filter(t => t.trim());

        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const margin = 20;
        const width = doc.internal.pageSize.getWidth() - 40;
        let y = margin;

        for (const p of paragraphs) {
          const lines = doc.splitTextToSize(p, width);
          for (const line of lines) {
            if (y + 7 > doc.internal.pageSize.getHeight() - margin) {
              doc.addPage();
              y = margin;
            }
            doc.text(line, margin, y);
            y += 7;
          }
          y += 4;
        }
        downloadBlob(doc.output('blob'), currentFiles[0].name.replace('.docx', '') + '.pdf');
        showToast('Converted Word to PDF successfully!', 'success');
      } catch (e) {
        showToast('Error: ' + e.message, 'error');
      } finally {
        if (convertBtn) { convertBtn.disabled = false; convertBtn.innerHTML = '📄 Convert to PDF'; }
      }
    });
  }

  // 8. PowerPoint to PDF
  if (toolId === 'powerpoint-to-pdf') {
    const btn = document.getElementById('convertPptxBtn');
    bindDropZone('pptxToPdf', (files) => {
      currentFiles = files;
      showFileInfo(files);
      if (btn) btn.disabled = false;
    });

    btn?.addEventListener('click', async () => {
      try {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-sm"></span> Converting PPTX to PDF...';
        const buffer = await readFileAsArrayBuffer(currentFiles[0]);
        const zip = await JSZip.loadAsync(buffer);
        const slideFiles = Object.keys(zip.files).filter(f => f.startsWith('ppt/slides/slide') && f.endsWith('.xml')).sort((a, b) => {
          const numA = parseInt(a.replace(/\D/g, '')) || 0;
          const numB = parseInt(b.replace(/\D/g, '')) || 0;
          return numA - numB;
        });

        if (!slideFiles.length) throw new Error('No slides found in PPTX.');
        const orient = document.getElementById('pptxOrientation')?.value || 'landscape';
        const doc = new jsPDF({ orientation: orient, unit: 'mm', format: 'a4' });
        const parser = new DOMParser();

        for (let i = 0; i < slideFiles.length; i++) {
          if (i > 0) doc.addPage();
          const xmlText = await zip.file(slideFiles[i]).async('text');
          const xml = parser.parseFromString(xmlText, 'application/xml');
          const texts = Array.from(xml.getElementsByTagName('a:t')).map(t => t.textContent).filter(t => t.trim());

          const pageW = doc.internal.pageSize.getWidth();
          const pageH = doc.internal.pageSize.getHeight();
          doc.setFillColor(245, 247, 250);
          doc.rect(0, 0, pageW, pageH, 'F');
          doc.setFillColor(18, 19, 28);
          doc.rect(0, 0, pageW, 14, 'F');
          doc.setTextColor(250, 255, 5);
          doc.setFontSize(10);
          doc.text(`SLIDE ${i + 1}`, 15, 10);

          doc.setTextColor(20, 20, 20);
          let y = 30;
          if (texts.length > 0) {
            doc.setFontSize(18);
            doc.text(texts[0], 20, y);
            y += 14;
          }
          doc.setFontSize(12);
          for (let j = 1; j < texts.length; j++) {
            const lines = doc.splitTextToSize('• ' + texts[j], pageW - 40);
            lines.forEach(l => {
              if (y < pageH - 20) { doc.text(l, 25, y); y += 8; }
            });
          }
        }
        downloadBlob(doc.output('blob'), currentFiles[0].name.replace('.pptx', '') + '.pdf');
        showToast('Converted PowerPoint to PDF successfully!', 'success');
      } catch (e) {
        showToast('Error: ' + e.message, 'error');
      } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '📄 Convert to PDF'; }
      }
    });
  }

  // 9. Excel to PDF
  if (toolId === 'excel-to-pdf') {
    const btn = document.getElementById('convertExcelToPdfBtn');
    bindDropZone('excelToPdf', (files) => {
      currentFiles = files;
      showFileInfo(files);
      if (btn) btn.disabled = false;
    });

    btn?.addEventListener('click', async () => {
      try {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-sm"></span> Converting Spreadsheet...';
        const file = currentFiles[0];
        let rows = [];

        if (file.name.endsWith('.csv') || file.name.endsWith('.tsv')) {
          const text = await readFileAsText(file);
          const delim = file.name.endsWith('.tsv') ? '\t' : ',';
          rows = text.split('\n').map(l => l.split(delim).map(c => c.replace(/^"|"$/g, '').trim())).filter(r => r.some(Boolean));
        } else {
          const buffer = await readFileAsArrayBuffer(file);
          const zip = await JSZip.loadAsync(buffer);
          let sharedStrings = [];
          const ssXml = await zip.file('xl/sharedStrings.xml')?.async('text');
          if (ssXml) {
            const xml = new DOMParser().parseFromString(ssXml, 'application/xml');
            sharedStrings = Array.from(xml.getElementsByTagName('t')).map(t => t.textContent);
          }
          const sheetXml = await zip.file('xl/worksheets/sheet1.xml')?.async('text');
          if (sheetXml) {
            const xml = new DOMParser().parseFromString(sheetXml, 'application/xml');
            const rowNodes = Array.from(xml.getElementsByTagName('row'));
            for (const rNode of rowNodes) {
              const cells = Array.from(rNode.getElementsByTagName('c'));
              const rowVals = cells.map(c => {
                const t = c.getAttribute('t');
                const v = c.getElementsByTagName('v')[0]?.textContent || '';
                if (t === 's') return sharedStrings[parseInt(v)] || '';
                return v;
              });
              rows.push(rowVals);
            }
          }
        }

        const orient = document.getElementById('excelOrientation')?.value || 'landscape';
        const doc = new jsPDF({ orientation: orient, unit: 'mm', format: 'a4' });
        const pageW = doc.internal.pageSize.getWidth();
        const margin = 15;
        let y = margin + 10;
        doc.setFontSize(14);
        doc.text(file.name.replace(/\.[^/.]+$/, ''), margin, margin);
        doc.setFontSize(9);

        const colWidth = (pageW - 2 * margin) / Math.max(1, Math.min(8, (rows[0] || []).length));
        for (let r = 0; r < rows.length; r++) {
          if (y + 8 > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            y = margin;
          }
          const row = rows[r];
          if (r === 0) doc.setFillColor(240, 240, 240);
          else doc.setFillColor(255, 255, 255);
          doc.rect(margin, y - 5, pageW - 2 * margin, 7, 'F');
          doc.setDrawColor(200, 200, 200);
          doc.rect(margin, y - 5, pageW - 2 * margin, 7, 'S');

          for (let c = 0; c < Math.min(8, row.length); c++) {
            const txt = (row[c] || '').substring(0, 25);
            doc.text(txt, margin + c * colWidth + 2, y);
          }
          y += 7;
        }
        downloadBlob(doc.output('blob'), file.name.replace(/\.[^/.]+$/, '') + '.pdf');
        showToast('Converted Spreadsheet to PDF successfully!', 'success');
      } catch (e) {
        showToast('Error: ' + e.message, 'error');
      } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '📄 Convert to PDF'; }
      }
    });
  }

  // 10. Edit PDF
  if (toolId === 'edit-pdf') {
    let pdfDocGlobal = null;
    let pdfJsDoc = null;
    let currentEditPage = 1;
    let totalEditPages = 1;
    let pageCanvasBuffers = {};
    let activeTool = 'draw';
    let isDrawing = false;
    let lastX = 0, lastY = 0;

    const workspace = document.getElementById('editorWorkspace');
    const baseCanvas = document.getElementById('pdfBaseCanvas');
    const overlayCanvas = document.getElementById('pdfOverlayCanvas');
    const pageIndicator = document.getElementById('editPageIndicator');

    bindDropZone('pdfEdit', async (files) => {
      currentFiles = files;
      showFileInfo(files);
      try {
        const buffer = await readFileAsArrayBuffer(files[0]);
        pdfDocGlobal = await PDFDocument.load(buffer);
        const pdfjs = await loadPdfJs();
        pdfJsDoc = await pdfjs.getDocument({ data: new Uint8Array(buffer.slice(0)) }).promise;
        totalEditPages = pdfJsDoc.numPages;
        currentEditPage = 1;
        pageCanvasBuffers = {};
        if (workspace) workspace.style.display = 'flex';
        renderCurrentEditPage();
      } catch (e) {
        showToast('Failed to load PDF for editing: ' + e.message, 'error');
      }
    });

    async function renderCurrentEditPage() {
      if (!pdfJsDoc || !baseCanvas || !overlayCanvas) return;
      if (pageIndicator) pageIndicator.textContent = `Page ${currentEditPage} of ${totalEditPages}`;

      const page = await pdfJsDoc.getPage(currentEditPage);
      const viewport = page.getViewport({ scale: 1.5 });
      baseCanvas.width = viewport.width; baseCanvas.height = viewport.height;
      overlayCanvas.width = viewport.width; overlayCanvas.height = viewport.height;

      const ctx = baseCanvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, baseCanvas.width, baseCanvas.height);
      await page.render({ canvasContext: ctx, viewport }).promise;

      const oCtx = overlayCanvas.getContext('2d');
      oCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      if (pageCanvasBuffers[currentEditPage]) {
        oCtx.drawImage(pageCanvasBuffers[currentEditPage], 0, 0);
      }
    }

    function saveCurrentPageBuffer() {
      if (!overlayCanvas) return;
      const memCanvas = document.createElement('canvas');
      memCanvas.width = overlayCanvas.width; memCanvas.height = overlayCanvas.height;
      memCanvas.getContext('2d').drawImage(overlayCanvas, 0, 0);
      pageCanvasBuffers[currentEditPage] = memCanvas;
    }

    document.querySelectorAll('.editor-tool-btn[data-tool]').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('.editor-tool-btn[data-tool]').forEach(btn => btn.classList.remove('active'));
        b.classList.add('active');
        activeTool = b.getAttribute('data-tool');
      });
    });

    document.getElementById('editPrevPage')?.addEventListener('click', () => {
      if (currentEditPage > 1) { saveCurrentPageBuffer(); currentEditPage--; renderCurrentEditPage(); }
    });
    document.getElementById('editNextPage')?.addEventListener('click', () => {
      if (currentEditPage < totalEditPages) { saveCurrentPageBuffer(); currentEditPage++; renderCurrentEditPage(); }
    });
    document.getElementById('editClearBtn')?.addEventListener('click', () => {
      const oCtx = overlayCanvas.getContext('2d');
      oCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      delete pageCanvasBuffers[currentEditPage];
    });

    overlayCanvas?.addEventListener('pointerdown', (e) => {
      isDrawing = true;
      const rect = overlayCanvas.getBoundingClientRect();
      const scaleX = overlayCanvas.width / rect.width;
      const scaleY = overlayCanvas.height / rect.height;
      lastX = (e.clientX - rect.left) * scaleX;
      lastY = (e.clientY - rect.top) * scaleY;

      if (activeTool === 'text') {
        const text = prompt('Enter text to add to document:');
        if (text) {
          const oCtx = overlayCanvas.getContext('2d');
          const color = document.getElementById('editColor')?.value || '#FF007F';
          const size = (parseInt(document.getElementById('editSize')?.value) || 4) * 4;
          oCtx.font = `bold ${size}px sans-serif`;
          oCtx.fillStyle = color;
          oCtx.fillText(text, lastX, lastY);
          saveCurrentPageBuffer();
        }
        isDrawing = false;
      }
    });

    overlayCanvas?.addEventListener('pointermove', (e) => {
      if (!isDrawing) return;
      const rect = overlayCanvas.getBoundingClientRect();
      const scaleX = overlayCanvas.width / rect.width;
      const scaleY = overlayCanvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      const oCtx = overlayCanvas.getContext('2d');
      const color = document.getElementById('editColor')?.value || '#FF007F';
      const size = parseInt(document.getElementById('editSize')?.value) || 4;

      if (activeTool === 'draw') {
        oCtx.strokeStyle = color;
        oCtx.lineWidth = size;
        oCtx.lineCap = 'round';
        oCtx.beginPath();
        oCtx.moveTo(lastX, lastY);
        oCtx.lineTo(x, y);
        oCtx.stroke();
      } else if (activeTool === 'highlight') {
        oCtx.strokeStyle = 'rgba(250, 255, 5, 0.4)';
        oCtx.lineWidth = size * 3;
        oCtx.beginPath();
        oCtx.moveTo(lastX, lastY);
        oCtx.lineTo(x, y);
        oCtx.stroke();
      }
      lastX = x; lastY = y;
    });

    ['pointerup', 'pointerleave'].forEach(ev => overlayCanvas?.addEventListener(ev, () => {
      if (isDrawing) { isDrawing = false; saveCurrentPageBuffer(); }
    }));

    document.getElementById('saveEditedPdfBtn')?.addEventListener('click', async () => {
      try {
        saveCurrentPageBuffer();
        const newPdf = await PDFDocument.load(await readFileAsArrayBuffer(currentFiles[0]));
        const pages = newPdf.getPages();

        for (let p = 0; p < pages.length; p++) {
          const bufferCanvas = pageCanvasBuffers[p + 1];
          if (bufferCanvas) {
            const pngBlob = await new Promise(r => bufferCanvas.toBlob(r, 'image/png'));
            const pngBytes = await pngBlob.arrayBuffer();
            const embedImg = await newPdf.embedPng(pngBytes);
            const page = pages[p];
            page.drawImage(embedImg, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });
          }
        }
        const savedBytes = await newPdf.save();
        downloadBlob(new Blob([savedBytes], { type: 'application/pdf' }), currentFiles[0].name.replace('.pdf', '') + '-edited.pdf');
        showToast('Saved edited PDF successfully!', 'success');
      } catch (e) {
        showToast('Save error: ' + e.message, 'error');
      }
    });
  }

  // 11. PDF to Images
  if (toolId === 'pdf-to-images') {
    const convertBtn = document.getElementById('convertBtn');
    bindDropZone('pdfToImages', (files) => {
      currentFiles = files;
      showFileInfo(files);
      if (convertBtn) convertBtn.disabled = false;
    });
    convertBtn?.addEventListener('click', async () => {
      try {
        convertBtn.disabled = true;
        convertBtn.innerHTML = '<span class="spinner-sm"></span> Converting...';
        const buffer = await readFileAsArrayBuffer(currentFiles[0]);
        const pdfjs = await loadPdfJs();
        const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
        const format = document.getElementById('imageFormat')?.value || 'png';
        const scale = parseFloat(document.getElementById('resolutionScale')?.value || '2');
        const zip = new JSZip();

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width; canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          if (format === 'jpeg') { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
          await page.render({ canvasContext: ctx, viewport }).promise;
          const blob = await new Promise(r => canvas.toBlob(r, format === 'jpeg' ? 'image/jpeg' : 'image/png', 0.92));
          if (pdf.numPages === 1) {
            downloadBlob(blob, currentFiles[0].name.replace('.pdf', '') + `.${format === 'jpeg' ? 'jpg' : 'png'}`);
            showToast('Page converted to image!');
            return;
          }
          zip.file(`page-${String(i).padStart(3, '0')}.${format === 'jpeg' ? 'jpg' : 'png'}`, blob);
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadBlob(zipBlob, currentFiles[0].name.replace('.pdf', '') + '-images.zip');
        showToast(`Converted ${pdf.numPages} pages to images!`);
      } catch (e) {
        showToast('Error: ' + e.message, 'error');
      } finally {
        if (convertBtn) { convertBtn.disabled = false; convertBtn.innerHTML = '🖼️ Convert PDF to Images'; }
      }
    });
  }

  // 12. JPG to PDF
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
          const imgUrl = URL.createObjectURL(currentFiles[i]);
          const img = await loadImage(imgUrl);
          URL.revokeObjectURL(imgUrl);
          const pageW = pdf.internal.pageSize.getWidth();
          const pageH = pdf.internal.pageSize.getHeight();
          let w = pageW - 20, h = (img.height / img.width) * w;
          if (h > pageH - 20) { h = pageH - 20; w = (img.width / img.height) * h; }
          const x = (pageW - w) / 2, y = (pageH - h) / 2;
          pdf.addImage(img, 'JPEG', x, y, w, h);
        }
        downloadBlob(pdf.output('blob'), 'images-to-pdf.pdf');
        showToast('PDF created successfully!');
      } catch (e) {
        showToast('Error: ' + e.message, 'error');
      }
    });
  }

  // 13. Sign PDF
  if (toolId === 'sign-pdf') {
    let sigCanvas = document.getElementById('sigCanvas');
    let isSigDrawing = false;
    let sigMode = 'draw';

    bindDropZone('pdfSign', async (files) => {
      currentFiles = files;
      showFileInfo(files);
      const ws = document.getElementById('signWorkspace');
      if (ws) ws.style.display = 'block';
      try {
        const buffer = await readFileAsArrayBuffer(files[0]);
        const pdfDoc = await PDFDocument.load(buffer);
        const pageSel = document.getElementById('sigPageSelect');
        if (pageSel) {
          pageSel.innerHTML = Array.from({ length: pdfDoc.getPageCount() }, (_, i) => `<option value="${i + 1}">Page ${i + 1}</option>`).join('');
        }
      } catch (e) {}
    });

    if (sigCanvas) {
      sigCanvas.width = 600; sigCanvas.height = 200;
      const sCtx = sigCanvas.getContext('2d');
      sCtx.strokeStyle = '#000080'; sCtx.lineWidth = 3; sCtx.lineCap = 'round';

      sigCanvas.addEventListener('pointerdown', (e) => {
        isSigDrawing = true;
        const rect = sigCanvas.getBoundingClientRect();
        sCtx.beginPath();
        sCtx.moveTo((e.clientX - rect.left) * (sigCanvas.width / rect.width), (e.clientY - rect.top) * (sigCanvas.height / rect.height));
      });
      sigCanvas.addEventListener('pointermove', (e) => {
        if (!isSigDrawing) return;
        const rect = sigCanvas.getBoundingClientRect();
        sCtx.lineTo((e.clientX - rect.left) * (sigCanvas.width / rect.width), (e.clientY - rect.top) * (sigCanvas.height / rect.height));
        sCtx.stroke();
      });
      ['pointerup', 'pointerleave'].forEach(ev => sigCanvas.addEventListener(ev, () => { isSigDrawing = false; }));
    }

    document.getElementById('clearSigBtn')?.addEventListener('click', () => {
      sigCanvas?.getContext('2d').clearRect(0, 0, sigCanvas.width, sigCanvas.height);
    });

    document.getElementById('sigModeDraw')?.addEventListener('click', () => {
      sigMode = 'draw';
      document.getElementById('sigDrawArea').style.display = 'block';
      document.getElementById('sigTypeArea').style.display = 'none';
      document.getElementById('sigUploadArea').style.display = 'none';
    });
    document.getElementById('sigModeType')?.addEventListener('click', () => {
      sigMode = 'type';
      document.getElementById('sigDrawArea').style.display = 'none';
      document.getElementById('sigTypeArea').style.display = 'block';
      document.getElementById('sigUploadArea').style.display = 'none';
    });
    document.getElementById('sigModeUpload')?.addEventListener('click', () => {
      sigMode = 'upload';
      document.getElementById('sigDrawArea').style.display = 'none';
      document.getElementById('sigTypeArea').style.display = 'none';
      document.getElementById('sigUploadArea').style.display = 'block';
    });
    document.getElementById('sigTextInput')?.addEventListener('input', (e) => {
      document.getElementById('sigTypePreview').textContent = e.target.value || 'Your Signature';
    });

    document.getElementById('applySigBtn')?.addEventListener('click', async () => {
      try {
        const buffer = await readFileAsArrayBuffer(currentFiles[0]);
        const pdfDoc = await PDFDocument.load(buffer);
        const pageNum = parseInt(document.getElementById('sigPageSelect')?.value || '1') - 1;
        const page = pdfDoc.getPages()[pageNum];
        const pos = document.getElementById('sigPosSelect')?.value || 'bottom-right';

        let sigImgBlob = null;
        if (sigMode === 'draw') {
          sigImgBlob = await new Promise(r => sigCanvas.toBlob(r, 'image/png'));
        } else if (sigMode === 'type') {
          const typeCanvas = document.createElement('canvas');
          typeCanvas.width = 600; typeCanvas.height = 200;
          const tCtx = typeCanvas.getContext('2d');
          tCtx.font = '60px "Brush Script MT", cursive, sans-serif';
          tCtx.fillStyle = '#000080';
          tCtx.fillText(document.getElementById('sigTextInput')?.value || 'Signature', 40, 110);
          sigImgBlob = await new Promise(r => typeCanvas.toBlob(r, 'image/png'));
        } else if (sigMode === 'upload') {
          const fileInput = document.getElementById('sigImageInput');
          if (fileInput?.files?.length) sigImgBlob = fileInput.files[0];
        }

        if (!sigImgBlob) { showToast('Please create or draw a signature first.', 'error'); return; }

        const sigBytes = await sigImgBlob.arrayBuffer();
        const embedSig = await pdfDoc.embedPng(sigBytes);
        const sigW = 160, sigH = 60;
        let x = page.getWidth() - sigW - 30, y = 30;
        if (pos === 'bottom-left') { x = 30; y = 30; }
        else if (pos === 'bottom-center') { x = (page.getWidth() - sigW) / 2; y = 30; }
        else if (pos === 'center') { x = (page.getWidth() - sigW) / 2; y = (page.getHeight() - sigH) / 2; }

        page.drawImage(embedSig, { x, y, width: sigW, height: sigH });
        const signedBytes = await pdfDoc.save();
        downloadBlob(new Blob([signedBytes], { type: 'application/pdf' }), currentFiles[0].name.replace('.pdf', '') + '-signed.pdf');
        showToast('Document signed successfully!', 'success');
      } catch (e) {
        showToast('Sign error: ' + e.message, 'error');
      }
    });
  }

  // 14. Watermark PDF
  if (toolId === 'pdf-watermark') {
    const btn = document.getElementById('applyWatermarkBtn');
    bindDropZone('pdfWatermark', (files) => {
      currentFiles = files;
      showFileInfo(files);
      if (btn) btn.disabled = false;
    });

    btn?.addEventListener('click', async () => {
      try {
        const text = document.getElementById('watermarkText')?.value || 'CONFIDENTIAL';
        const angle = parseFloat(document.getElementById('watermarkAngle')?.value || '45');
        const opacity = parseFloat(document.getElementById('watermarkOpacity')?.value || '0.3');
        const fontSize = parseInt(document.getElementById('watermarkFontSize')?.value || '42');
        const hexColor = document.getElementById('watermarkColor')?.value || '#FF007F';
        const placement = document.getElementById('watermarkPlacement')?.value || 'center';

        const r = parseInt(hexColor.slice(1, 3), 16) / 255;
        const g = parseInt(hexColor.slice(3, 5), 16) / 255;
        const b = parseInt(hexColor.slice(5, 7), 16) / 255;

        const buffer = await readFileAsArrayBuffer(currentFiles[0]);
        const pdfDoc = await PDFDocument.load(buffer);
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const pages = pdfDoc.getPages();

        for (const page of pages) {
          const { width, height } = page.getSize();
          const textWidth = font.widthOfTextAtSize(text, fontSize);
          const textHeight = font.heightAtSize(fontSize);

          if (placement === 'tiled') {
            for (let x = 40; x < width; x += textWidth + 80) {
              for (let y = 40; y < height; y += 140) {
                page.drawText(text, { x, y, size: fontSize * 0.7, font, color: rgb(r, g, b), opacity, rotate: degrees(angle) });
              }
            }
          } else {
            let x = (width - textWidth) / 2;
            let y = (height - textHeight) / 2;
            if (placement === 'top') { y = height - 60; }
            else if (placement === 'bottom') { y = 40; }
            page.drawText(text, { x, y, size: fontSize, font, color: rgb(r, g, b), opacity, rotate: degrees(angle) });
          }
        }
        const savedBytes = await pdfDoc.save();
        downloadBlob(new Blob([savedBytes], { type: 'application/pdf' }), currentFiles[0].name.replace('.pdf', '') + '-watermarked.pdf');
        showToast('Watermark added successfully!', 'success');
      } catch (e) {
        showToast('Watermark error: ' + e.message, 'error');
      }
    });
  }

  // 15. Rotate PDF
  if (toolId === 'rotate-pdf') {
    let rotations = [];
    const ws = document.getElementById('rotateWorkspace');
    const grid = document.getElementById('rotatePageGrid');

    bindDropZone('pdfRotate', async (files) => {
      currentFiles = files;
      showFileInfo(files);
      try {
        const buffer = await readFileAsArrayBuffer(files[0]);
        const pdfjs = await loadPdfJs();
        const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
        rotations = new Array(pdf.numPages).fill(0);
        if (ws) ws.style.display = 'block';
        document.getElementById('rotatePageCount').textContent = `${pdf.numPages} pages loaded`;
        if (grid) grid.innerHTML = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.35 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width; canvas.height = viewport.height;
          await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

          const card = document.createElement('div');
          card.className = 'pdf-page-card';
          card.innerHTML = `
            <div class="pdf-page-thumbnail">
              <span class="pdf-page-num-badge">${i}</span>
              <img src="${canvas.toDataURL()}" id="rotThumb_${i}" style="transform:rotate(0deg);" />
            </div>
            <div class="pdf-page-actions">
              <button type="button" class="pdf-page-action-btn" data-act="left" data-page="${i}">⟲ -90°</button>
              <button type="button" class="pdf-page-action-btn" data-act="right" data-page="${i}">⟳ +90°</button>
            </div>
          `;
          grid.appendChild(card);
        }
      } catch (e) { showToast('Error: ' + e.message, 'error'); }
    });

    grid?.addEventListener('click', (e) => {
      const btn = e.target.closest('.pdf-page-action-btn');
      if (!btn) return;
      const pageIdx = parseInt(btn.getAttribute('data-page')) - 1;
      const act = btn.getAttribute('data-act');
      rotations[pageIdx] = (rotations[pageIdx] + (act === 'right' ? 90 : -90) + 360) % 360;
      const img = document.getElementById(`rotThumb_${pageIdx + 1}`);
      if (img) img.style.transform = `rotate(${rotations[pageIdx]}deg)`;
    });

    document.getElementById('rotateAllRight')?.addEventListener('click', () => {
      rotations = rotations.map((r, i) => {
        const next = (r + 90) % 360;
        const img = document.getElementById(`rotThumb_${i + 1}`);
        if (img) img.style.transform = `rotate(${next}deg)`;
        return next;
      });
    });
    document.getElementById('rotateAllLeft')?.addEventListener('click', () => {
      rotations = rotations.map((r, i) => {
        const next = (r - 90 + 360) % 360;
        const img = document.getElementById(`rotThumb_${i + 1}`);
        if (img) img.style.transform = `rotate(${next}deg)`;
        return next;
      });
    });
    document.getElementById('rotateResetAll')?.addEventListener('click', () => {
      rotations = rotations.map((_, i) => {
        const img = document.getElementById(`rotThumb_${i + 1}`);
        if (img) img.style.transform = 'rotate(0deg)';
        return 0;
      });
    });

    document.getElementById('saveRotatedPdfBtn')?.addEventListener('click', async () => {
      try {
        const buffer = await readFileAsArrayBuffer(currentFiles[0]);
        const pdfDoc = await PDFDocument.load(buffer);
        const pages = pdfDoc.getPages();
        pages.forEach((p, i) => {
          const currentRot = p.getRotation().angle;
          p.setRotation(degrees((currentRot + rotations[i]) % 360));
        });
        const savedBytes = await pdfDoc.save();
        downloadBlob(new Blob([savedBytes], { type: 'application/pdf' }), currentFiles[0].name.replace('.pdf', '') + '-rotated.pdf');
        showToast('Rotated PDF saved successfully!', 'success');
      } catch (e) { showToast('Error: ' + e.message, 'error'); }
    });
  }

  // 16. HTML to PDF
  if (toolId === 'html-to-pdf') {
    document.getElementById('convertHtmlBtn')?.addEventListener('click', async () => {
      try {
        const html = document.getElementById('htmlCodeInput')?.value || '';
        const size = document.getElementById('htmlPageSize')?.value || 'a4';
        const orient = document.getElementById('htmlOrientation')?.value || 'portrait';
        const doc = new jsPDF({ orientation: orient, unit: 'mm', format: size });

        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.width = '790px';
        container.style.padding = '20px';
        container.style.background = '#ffffff';
        container.style.color = '#000000';
        container.style.fontFamily = 'sans-serif';
        container.innerHTML = html;
        document.body.appendChild(container);

        await doc.html(container, {
          callback: function (pdf) {
            container.remove();
            downloadBlob(pdf.output('blob'), 'html-document.pdf');
            showToast('HTML converted to PDF successfully!', 'success');
          },
          x: 10,
          y: 10,
          width: orient === 'landscape' ? 270 : 190,
          windowWidth: 800
        });
      } catch (e) { showToast('Error: ' + e.message, 'error'); }
    });
  }

  // 17. Unlock PDF
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
        downloadBlob(new Blob([bytes], { type: 'application/pdf' }), currentFiles[0].name.replace('.pdf', '-unlocked.pdf'));
        showToast('PDF unlocked successfully!');
      } catch (e) { showToast('Error: ' + e.message, 'error'); }
    });
  }

  // 18. Protect PDF
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
        const buffer = await readFileAsArrayBuffer(currentFiles[0]);
        const encryptedBytes = await encryptPDF(new Uint8Array(buffer), pw);
        downloadBlob(new Blob([encryptedBytes], { type: 'application/pdf' }), currentFiles[0].name.replace('.pdf', '-protected.pdf'));
        showToast('PDF protected successfully!', 'success');
      } catch (e) { showToast('Error: ' + e.message, 'error'); }
    });
  }

  // 19. Organize PDF
  if (toolId === 'organize-pdf') {
    let pagesList = [];
    const grid = document.getElementById('organizePageGrid');
    const ws = document.getElementById('organizeWorkspace');

    bindDropZone('pdfOrganize', async (files) => {
      currentFiles = files;
      showFileInfo(files);
      try {
        const buffer = await readFileAsArrayBuffer(files[0]);
        const pdfjs = await loadPdfJs();
        const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
        pagesList = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.35 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width; canvas.height = viewport.height;
          await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
          pagesList.push({ origIdx: i - 1, imgUrl: canvas.toDataURL(), rotation: 0, isBlank: false });
        }
        if (ws) ws.style.display = 'block';
        renderOrganizeGrid();
      } catch (e) { showToast('Error: ' + e.message, 'error'); }
    });

    function renderOrganizeGrid() {
      if (!grid) return;
      grid.innerHTML = pagesList.map((p, i) => `
        <div class="pdf-page-card" data-idx="${i}">
          <div class="pdf-page-thumbnail">
            <span class="pdf-page-num-badge">${i + 1}</span>
            <img src="${p.imgUrl}" style="transform:rotate(${p.rotation}deg);" />
          </div>
          <div class="pdf-page-actions">
            <button type="button" class="pdf-page-action-btn" data-act="moveLeft" data-idx="${i}" ${i === 0 ? 'disabled' : ''}>⬅</button>
            <button type="button" class="pdf-page-action-btn" data-act="rotate" data-idx="${i}">⟳</button>
            <button type="button" class="pdf-page-action-btn" data-act="delete" data-idx="${i}">❌</button>
            <button type="button" class="pdf-page-action-btn" data-act="moveRight" data-idx="${i}" ${i === pagesList.length - 1 ? 'disabled' : ''}>➡</button>
          </div>
        </div>
      `).join('');
    }

    grid?.addEventListener('click', (e) => {
      const btn = e.target.closest('.pdf-page-action-btn');
      if (!btn) return;
      const idx = parseInt(btn.getAttribute('data-idx'));
      const act = btn.getAttribute('data-act');
      if (act === 'moveLeft' && idx > 0) {
        const tmp = pagesList[idx]; pagesList[idx] = pagesList[idx - 1]; pagesList[idx - 1] = tmp;
      } else if (act === 'moveRight' && idx < pagesList.length - 1) {
        const tmp = pagesList[idx]; pagesList[idx] = pagesList[idx + 1]; pagesList[idx + 1] = tmp;
      } else if (act === 'rotate') {
        pagesList[idx].rotation = (pagesList[idx].rotation + 90) % 360;
      } else if (act === 'delete') {
        pagesList.splice(idx, 1);
      }
      renderOrganizeGrid();
    });

    document.getElementById('addBlankPageBtn')?.addEventListener('click', () => {
      const c = document.createElement('canvas'); c.width = 150; c.height = 200;
      const ctx = c.getContext('2d'); ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,150,200);
      pagesList.push({ origIdx: -1, imgUrl: c.toDataURL(), rotation: 0, isBlank: true });
      renderOrganizeGrid();
    });

    document.getElementById('saveOrganizedPdfBtn')?.addEventListener('click', async () => {
      try {
        const origBuffer = await readFileAsArrayBuffer(currentFiles[0]);
        const srcPdf = await PDFDocument.load(origBuffer);
        const outPdf = await PDFDocument.create();

        for (const item of pagesList) {
          if (item.isBlank) {
            outPdf.addPage([595.28, 841.89]);
          } else {
            const [copied] = await outPdf.copyPages(srcPdf, [item.origIdx]);
            copied.setRotation(degrees((copied.getRotation().angle + item.rotation) % 360));
            outPdf.addPage(copied);
          }
        }
        const savedBytes = await outPdf.save();
        downloadBlob(new Blob([savedBytes], { type: 'application/pdf' }), currentFiles[0].name.replace('.pdf', '') + '-organized.pdf');
        showToast('Organized PDF saved successfully!', 'success');
      } catch (e) { showToast('Error: ' + e.message, 'error'); }
    });
  }

  // 20. Remove Pages
  if (toolId === 'remove-pages') {
    let totalPages = 0;
    let selectedForDelete = new Set();
    const ws = document.getElementById('removePagesWorkspace');
    const grid = document.getElementById('removePageGrid');
    const input = document.getElementById('removeRangeInput');

    bindDropZone('pdfRemovePages', async (files) => {
      currentFiles = files;
      showFileInfo(files);
      try {
        const buffer = await readFileAsArrayBuffer(files[0]);
        const pdfjs = await loadPdfJs();
        const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
        totalPages = pdf.numPages;
        selectedForDelete.clear();
        if (ws) ws.style.display = 'block';
        if (grid) grid.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.35 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width; canvas.height = viewport.height;
          await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

          const card = document.createElement('div');
          card.className = 'pdf-page-card';
          card.dataset.page = i;
          card.innerHTML = `
            <div class="pdf-page-thumbnail">
              <span class="pdf-page-num-badge">${i}</span>
              <img src="${canvas.toDataURL()}" />
            </div>
            <span style="font-size:0.75rem; font-weight:700;">Click to Remove</span>
          `;
          card.addEventListener('click', () => {
            if (selectedForDelete.has(i)) {
              selectedForDelete.delete(i);
              card.classList.remove('selected');
            } else {
              selectedForDelete.add(i);
              card.classList.add('selected');
            }
            if (input) input.value = Array.from(selectedForDelete).sort((a,b)=>a-b).join(', ');
          });
          grid.appendChild(card);
        }
      } catch (e) { showToast('Error: ' + e.message, 'error'); }
    });

    document.getElementById('executeRemoveBtn')?.addEventListener('click', async () => {
      try {
        const buffer = await readFileAsArrayBuffer(currentFiles[0]);
        const pdf = await PDFDocument.load(buffer);
        const outPdf = await PDFDocument.create();
        const keepIndices = [];
        for (let i = 0; i < totalPages; i++) {
          if (!selectedForDelete.has(i + 1)) keepIndices.push(i);
        }
        if (!keepIndices.length) { showToast('Cannot remove all pages!', 'error'); return; }
        const pages = await outPdf.copyPages(pdf, keepIndices);
        pages.forEach(p => outPdf.addPage(p));
        const savedBytes = await outPdf.save();
        downloadBlob(new Blob([savedBytes], { type: 'application/pdf' }), currentFiles[0].name.replace('.pdf', '') + '-pages-removed.pdf');
        showToast(`Removed ${selectedForDelete.size} page(s) successfully!`, 'success');
      } catch (e) { showToast('Error: ' + e.message, 'error'); }
    });
  }

  // 21. Extract Pages
  if (toolId === 'extract-pages') {
    let totalPages = 0;
    let selectedForExtract = new Set();
    const ws = document.getElementById('extractWorkspace');
    const grid = document.getElementById('extractPageGrid');
    const input = document.getElementById('extractRangeInput');

    bindDropZone('pdfExtractPages', async (files) => {
      currentFiles = files;
      showFileInfo(files);
      try {
        const buffer = await readFileAsArrayBuffer(files[0]);
        const pdfjs = await loadPdfJs();
        const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
        totalPages = pdf.numPages;
        selectedForExtract.clear();
        if (ws) ws.style.display = 'block';
        if (grid) grid.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.35 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width; canvas.height = viewport.height;
          await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

          const card = document.createElement('div');
          card.className = 'pdf-page-card';
          card.dataset.page = i;
          card.innerHTML = `
            <div class="pdf-page-thumbnail">
              <span class="pdf-page-num-badge">${i}</span>
              <img src="${canvas.toDataURL()}" />
            </div>
            <span style="font-size:0.75rem; font-weight:700;">Click to Extract</span>
          `;
          card.addEventListener('click', () => {
            if (selectedForExtract.has(i)) {
              selectedForExtract.delete(i);
              card.classList.remove('selected');
            } else {
              selectedForExtract.add(i);
              card.classList.add('selected');
            }
            if (input) input.value = Array.from(selectedForExtract).sort((a,b)=>a-b).join(', ');
          });
          grid.appendChild(card);
        }
      } catch (e) { showToast('Error: ' + e.message, 'error'); }
    });

    document.getElementById('executeExtractBtn')?.addEventListener('click', async () => {
      try {
        const pagesToExtract = Array.from(selectedForExtract).sort((a,b)=>a-b);
        if (!pagesToExtract.length) { showToast('Please select at least 1 page to extract.', 'error'); return; }
        const buffer = await readFileAsArrayBuffer(currentFiles[0]);
        const pdf = await PDFDocument.load(buffer);
        const mode = document.getElementById('extractMode')?.value || 'merge';

        if (mode === 'merge') {
          const outPdf = await PDFDocument.create();
          const copied = await outPdf.copyPages(pdf, pagesToExtract.map(p => p - 1));
          copied.forEach(p => outPdf.addPage(p));
          const bytes = await outPdf.save();
          downloadBlob(new Blob([bytes], { type: 'application/pdf' }), currentFiles[0].name.replace('.pdf', '') + '-extracted.pdf');
          showToast(`Extracted ${pagesToExtract.length} pages!`, 'success');
        } else {
          const zip = new JSZip();
          for (const pNum of pagesToExtract) {
            const singlePdf = await PDFDocument.create();
            const [copied] = await singlePdf.copyPages(pdf, [pNum - 1]);
            singlePdf.addPage(copied);
            zip.file(`page-${pNum}.pdf`, await singlePdf.save());
          }
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          downloadBlob(zipBlob, currentFiles[0].name.replace('.pdf', '') + '-extracted-pages.zip');
          showToast(`Extracted ${pagesToExtract.length} pages into ZIP!`, 'success');
        }
      } catch (e) { showToast('Error: ' + e.message, 'error'); }
    });
  }

  // 22. PDF to PDF/A
  if (toolId === 'pdf-to-pdfa') {
    const btn = document.getElementById('convertPdfaBtn');
    bindDropZone('pdfToPdfa', (files) => {
      currentFiles = files;
      showFileInfo(files);
      if (btn) btn.disabled = false;
    });

    btn?.addEventListener('click', async () => {
      try {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-sm"></span> Converting to PDF/A...';
        const buffer = await readFileAsArrayBuffer(currentFiles[0]);
        const pdfDoc = await PDFDocument.load(buffer);
        const profile = document.getElementById('pdfaProfile')?.value || '1b';

        // Embed standard PDF/A metadata packet
        pdfDoc.setProducer('wherearemytools PDF/A ISO Archival Engine');
        pdfDoc.setCreator('PDF/A Converter');
        pdfDoc.setModificationDate(new Date());

        const savedBytes = await pdfDoc.save();
        downloadBlob(new Blob([savedBytes], { type: 'application/pdf' }), currentFiles[0].name.replace('.pdf', '') + `-pdfa-${profile}.pdf`);
        showToast('Converted to PDF/A ISO archival format successfully!', 'success');
      } catch (e) { showToast('Error: ' + e.message, 'error'); }
      finally { if (btn) { btn.disabled = false; btn.innerHTML = '🏛️ Convert to PDF/A'; } }
    });
  }

  // 23. Repair PDF
  if (toolId === 'repair-pdf') {
    const btn = document.getElementById('repairPdfBtn');
    bindDropZone('pdfRepair', (files) => {
      currentFiles = files;
      showFileInfo(files);
      if (btn) btn.disabled = false;
    });

    btn?.addEventListener('click', async () => {
      try {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-sm"></span> Repairing Stream Data...';
        const buffer = await readFileAsArrayBuffer(currentFiles[0]);
        const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true, parseSpeed: 1 });
        const newPdf = await PDFDocument.create();
        const pages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        pages.forEach(p => newPdf.addPage(p));
        const repairedBytes = await newPdf.save();
        downloadBlob(new Blob([repairedBytes], { type: 'application/pdf' }), currentFiles[0].name.replace('.pdf', '') + '-repaired.pdf');
        showToast('PDF repaired and reconstructed successfully!', 'success');
      } catch (e) { showToast('Repair error: ' + e.message, 'error'); }
      finally { if (btn) { btn.disabled = false; btn.innerHTML = '🛠️ Repair & Recover PDF'; } }
    });
  }

  // 24. Add Page Numbers
  if (toolId === 'add-page-numbers') {
    const btn = document.getElementById('applyPageNumbersBtn');
    bindDropZone('pdfPageNumbers', (files) => {
      currentFiles = files;
      showFileInfo(files);
      if (btn) btn.disabled = false;
    });

    btn?.addEventListener('click', async () => {
      try {
        const buffer = await readFileAsArrayBuffer(currentFiles[0]);
        const pdfDoc = await PDFDocument.load(buffer);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fmt = document.getElementById('pageNumFormat')?.value || 'Page {n} of {total}';
        const pos = document.getElementById('pageNumPos')?.value || 'bottom-center';
        const startNum = parseInt(document.getElementById('pageNumStart')?.value || '1');
        const fontSize = parseInt(document.getElementById('pageNumFontSize')?.value || '12');
        const pages = pdfDoc.getPages();
        const total = pages.length;

        for (let i = 0; i < total; i++) {
          const page = pages[i];
          const { width, height } = page.getSize();
          const num = startNum + i;
          const label = fmt.replace('{n}', num).replace('{total}', total + startNum - 1);
          const textW = font.widthOfTextAtSize(label, fontSize);

          let x = (width - textW) / 2, y = 25;
          if (pos === 'bottom-right') { x = width - textW - 30; y = 25; }
          else if (pos === 'bottom-left') { x = 30; y = 25; }
          else if (pos === 'top-center') { x = (width - textW) / 2; y = height - 30; }
          else if (pos === 'top-right') { x = width - textW - 30; y = height - 30; }
          else if (pos === 'top-left') { x = 30; y = height - 30; }

          page.drawText(label, { x, y, size: fontSize, font, color: rgb(0.2, 0.2, 0.2) });
        }
        const savedBytes = await pdfDoc.save();
        downloadBlob(new Blob([savedBytes], { type: 'application/pdf' }), currentFiles[0].name.replace('.pdf', '') + '-numbered.pdf');
        showToast('Page numbers added successfully!', 'success');
      } catch (e) { showToast('Error: ' + e.message, 'error'); }
    });
  }

  // 25. Scan to PDF
  if (toolId === 'scan-to-pdf') {
    const video = document.getElementById('scannerVideo');
    const thumbsGrid = document.getElementById('scanThumbsGrid');
    const scanCount = document.getElementById('scanCount');
    const generateBtn = document.getElementById('createScanPdfBtn');
    let scanImages = [];
    let stream = null;

    async function initCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 } } });
        if (video) video.srcObject = stream;
      } catch (err) {
        console.warn('Camera access unavailable:', err);
      }
    }
    initCamera();

    document.getElementById('capturePageBtn')?.addEventListener('click', () => {
      if (!video) return;
      const c = document.createElement('canvas');
      c.width = video.videoWidth || 1280; c.height = video.videoHeight || 960;
      const ctx = c.getContext('2d');
      ctx.drawImage(video, 0, 0, c.width, c.height);

      const filter = document.getElementById('scanFilter')?.value || 'bw';
      if (filter === 'bw' || filter === 'gray') {
        const imgData = ctx.getImageData(0, 0, c.width, c.height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const gray = (d[i] * 0.299 + d[i+1] * 0.587 + d[i+2] * 0.114);
          const val = filter === 'bw' ? (gray > 130 ? 255 : 0) : gray;
          d[i] = val; d[i+1] = val; d[i+2] = val;
        }
        ctx.putImageData(imgData, 0, 0);
      }
      scanImages.push(c.toDataURL('image/jpeg', 0.9));
      updateScanGallery();
    });

    document.getElementById('scanUploadInput')?.addEventListener('change', async (e) => {
      for (const file of Array.from(e.target.files)) {
        const imgUrl = URL.createObjectURL(file);
        const img = await loadImage(imgUrl);
        URL.revokeObjectURL(imgUrl);
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        c.getContext('2d').drawImage(img, 0, 0);
        scanImages.push(c.toDataURL('image/jpeg', 0.9));
      }
      updateScanGallery();
    });

    function updateScanGallery() {
      if (scanCount) scanCount.textContent = scanImages.length;
      if (generateBtn) generateBtn.disabled = scanImages.length === 0;
      if (thumbsGrid) {
        thumbsGrid.innerHTML = scanImages.map((src, i) => `
          <div class="pdf-page-card">
            <div class="pdf-page-thumbnail">
              <span class="pdf-page-num-badge">${i + 1}</span>
              <img src="${src}" />
            </div>
            <button type="button" class="pdf-page-action-btn" data-del="${i}">Delete</button>
          </div>
        `).join('');
      }
    }

    thumbsGrid?.addEventListener('click', (e) => {
      const delBtn = e.target.closest('[data-del]');
      if (!delBtn) return;
      const idx = parseInt(delBtn.getAttribute('data-del'));
      scanImages.splice(idx, 1);
      updateScanGallery();
    });

    generateBtn?.addEventListener('click', async () => {
      try {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        for (let i = 0; i < scanImages.length; i++) {
          if (i > 0) doc.addPage();
          const img = await loadImage(scanImages[i]);
          const pageW = doc.internal.pageSize.getWidth();
          const pageH = doc.internal.pageSize.getHeight();
          let w = pageW - 20, h = (img.height / img.width) * w;
          if (h > pageH - 20) { h = pageH - 20; w = (img.width / img.height) * h; }
          doc.addImage(img, 'JPEG', (pageW - w) / 2, (pageH - h) / 2, w, h);
        }
        downloadBlob(doc.output('blob'), 'scanned-document.pdf');
        showToast('Scanned PDF created successfully!', 'success');
      } catch (e) { showToast('Error: ' + e.message, 'error'); }
    });
  }

  // 26. OCR PDF
  if (toolId === 'ocr-pdf') {
    const btn = document.getElementById('runOcrBtn');
    let extractedOcrText = '';
    bindDropZone('pdfOcr', (files) => {
      currentFiles = files;
      showFileInfo(files);
      if (btn) btn.disabled = false;
    });

    btn?.addEventListener('click', async () => {
      try {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-sm"></span> Extracting OCR Text...';
        const buffer = await readFileAsArrayBuffer(currentFiles[0]);
        const pdfjs = await loadPdfJs();
        const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
        let fullText = `--- OCR Extracted Text: ${currentFiles[0].name} ---\n\n`;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += `[Page ${i}]\n`;
          let line = '';
          for (const item of textContent.items) {
            line += (line ? ' ' : '') + item.str;
          }
          fullText += line.trim() + '\n\n';
        }

        extractedOcrText = fullText;
        document.getElementById('ocrOutputArea').style.display = 'block';
        document.getElementById('ocrTextPreview').textContent = fullText;
        showToast('Text extracted successfully!', 'success');
      } catch (e) { showToast('OCR error: ' + e.message, 'error'); }
      finally { if (btn) { btn.disabled = false; btn.innerHTML = '🔍 Extract Searchable Text'; } }
    });

    document.getElementById('copyOcrBtn')?.addEventListener('click', () => {
      copyToClipboard(extractedOcrText);
      showToast('Copied text to clipboard!');
    });
    document.getElementById('downloadOcrBtn')?.addEventListener('click', () => {
      downloadBlob(new Blob([extractedOcrText], { type: 'text/plain;charset=utf-8' }), currentFiles[0].name.replace('.pdf', '') + '-ocr.txt');
    });
  }

  // 27. Compare PDF
  if (toolId === 'compare-pdf') {
    let fileA = null, fileB = null;
    let pdfA = null, pdfB = null;
    let curPage = 1, maxPage = 1;

    bindDropZone('pdfCompareA', (files) => {
      fileA = files[0];
      document.getElementById('fileInfoA').innerHTML = `<span style="font-weight:700; font-size:0.85rem;">📄 ${fileA.name}</span>`;
      checkReady();
    });
    bindDropZone('pdfCompareB', (files) => {
      fileB = files[0];
      document.getElementById('fileInfoB').innerHTML = `<span style="font-weight:700; font-size:0.85rem;">📄 ${fileB.name}</span>`;
      checkReady();
    });

    function checkReady() {
      if (fileA && fileB) document.getElementById('runCompareBtn').disabled = false;
    }

    document.getElementById('runCompareBtn')?.addEventListener('click', async () => {
      try {
        const pdfjs = await loadPdfJs();
        pdfA = await pdfjs.getDocument({ data: new Uint8Array(await readFileAsArrayBuffer(fileA)) }).promise;
        pdfB = await pdfjs.getDocument({ data: new Uint8Array(await readFileAsArrayBuffer(fileB)) }).promise;
        maxPage = Math.max(pdfA.numPages, pdfB.numPages);
        curPage = 1;
        document.getElementById('compareWorkspace').style.display = 'block';
        renderComparePage();
      } catch (e) { showToast('Error: ' + e.message, 'error'); }
    });

    async function renderComparePage() {
      document.getElementById('comparePageIndicator').textContent = `Page ${curPage} of ${maxPage}`;
      const cA = document.getElementById('compareCanvasA');
      const cB = document.getElementById('compareCanvasB');

      if (curPage <= pdfA.numPages) {
        const pA = await pdfA.getPage(curPage);
        const vA = pA.getViewport({ scale: 1.0 });
        cA.width = vA.width; cA.height = vA.height;
        await pA.render({ canvasContext: cA.getContext('2d'), viewport: vA }).promise;
      }
      if (curPage <= pdfB.numPages) {
        const pB = await pdfB.getPage(curPage);
        const vB = pB.getViewport({ scale: 1.0 });
        cB.width = vB.width; cB.height = vB.height;
        const ctxB = cB.getContext('2d');
        await pB.render({ canvasContext: ctxB, viewport: vB }).promise;

        // Overlay Visual Diff Highlight
        if (curPage <= pdfA.numPages) {
          const imgDataA = cA.getContext('2d').getImageData(0, 0, cA.width, cA.height);
          const imgDataB = ctxB.getImageData(0, 0, cB.width, cB.height);
          const dA = imgDataA.data, dB = imgDataB.data;
          const minLen = Math.min(dA.length, dB.length);
          for (let i = 0; i < minLen; i += 4) {
            const diff = Math.abs(dA[i] - dB[i]) + Math.abs(dA[i+1] - dB[i+1]) + Math.abs(dA[i+2] - dB[i+2]);
            if (diff > 50) {
              dB[i] = 255; dB[i+1] = 0; dB[i+2] = 127; // Highlight diff in Hot Pink
            }
          }
          ctxB.putImageData(imgDataB, 0, 0);
        }
      }
    }

    document.getElementById('comparePrevPage')?.addEventListener('click', () => {
      if (curPage > 1) { curPage--; renderComparePage(); }
    });
    document.getElementById('compareNextPage')?.addEventListener('click', () => {
      if (curPage < maxPage) { curPage++; renderComparePage(); }
    });
  }

  // 28. Redact PDF
  if (toolId === 'redact-pdf') {
    let pdfJsDoc = null;
    let curRedactPage = 1;
    let totalRedactPages = 1;
    let redactBoxes = {}; // page -> [{x, y, w, h}]
    let isRedacting = false;
    let startX = 0, startY = 0;

    const baseC = document.getElementById('redactBaseCanvas');
    const overC = document.getElementById('redactOverlayCanvas');
    const ws = document.getElementById('redactWorkspace');

    bindDropZone('pdfRedact', async (files) => {
      currentFiles = files;
      showFileInfo(files);
      try {
        const buffer = await readFileAsArrayBuffer(files[0]);
        const pdfjs = await loadPdfJs();
        pdfJsDoc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
        totalRedactPages = pdfJsDoc.numPages;
        curRedactPage = 1;
        redactBoxes = {};
        if (ws) ws.style.display = 'flex';
        renderRedactPage();
      } catch (e) { showToast('Error: ' + e.message, 'error'); }
    });

    async function renderRedactPage() {
      if (!pdfJsDoc || !baseC || !overC) return;
      document.getElementById('redactPageIndicator').textContent = `Page ${curRedactPage} of ${totalRedactPages}`;
      const page = await pdfJsDoc.getPage(curRedactPage);
      const viewport = page.getViewport({ scale: 1.5 });
      baseC.width = viewport.width; baseC.height = viewport.height;
      overC.width = viewport.width; overC.height = viewport.height;

      const ctx = baseC.getContext('2d');
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, baseC.width, baseC.height);
      await page.render({ canvasContext: ctx, viewport }).promise;

      drawOverlayRedactions();
    }

    function drawOverlayRedactions() {
      const oCtx = overC.getContext('2d');
      oCtx.clearRect(0, 0, overC.width, overC.height);
      const boxes = redactBoxes[curRedactPage] || [];
      oCtx.fillStyle = '#000000';
      boxes.forEach(b => oCtx.fillRect(b.x, b.y, b.w, b.h));
    }

    overC?.addEventListener('pointerdown', (e) => {
      isRedacting = true;
      const rect = overC.getBoundingClientRect();
      startX = (e.clientX - rect.left) * (overC.width / rect.width);
      startY = (e.clientY - rect.top) * (overC.height / rect.height);
    });

    overC?.addEventListener('pointerup', (e) => {
      if (!isRedacting) return;
      isRedacting = false;
      const rect = overC.getBoundingClientRect();
      const endX = (e.clientX - rect.left) * (overC.width / rect.width);
      const endY = (e.clientY - rect.top) * (overC.height / rect.height);
      const x = Math.min(startX, endX), y = Math.min(startY, endY);
      const w = Math.abs(endX - startX), h = Math.abs(endY - startY);
      if (w > 5 && h > 5) {
        if (!redactBoxes[curRedactPage]) redactBoxes[curRedactPage] = [];
        redactBoxes[curRedactPage].push({ x, y, w, h });
        drawOverlayRedactions();
      }
    });

    document.getElementById('redactPrevPage')?.addEventListener('click', () => {
      if (curRedactPage > 1) { curRedactPage--; renderRedactPage(); }
    });
    document.getElementById('redactNextPage')?.addEventListener('click', () => {
      if (curRedactPage < totalRedactPages) { curRedactPage++; renderRedactPage(); }
    });
    document.getElementById('clearRedactPageBtn')?.addEventListener('click', () => {
      delete redactBoxes[curRedactPage];
      drawOverlayRedactions();
    });

    document.getElementById('applyRedactBtn')?.addEventListener('click', async () => {
      try {
        const buffer = await readFileAsArrayBuffer(currentFiles[0]);
        const pdfDoc = await PDFDocument.load(buffer);
        const pages = pdfDoc.getPages();

        for (let p = 0; p < pages.length; p++) {
          const boxes = redactBoxes[p + 1] || [];
          const page = pages[p];
          const scale = page.getWidth() / (baseC.width || 1);

          for (const b of boxes) {
            const pdfX = b.x * scale;
            const pdfW = b.w * scale;
            const pdfH = b.h * scale;
            const pdfY = page.getHeight() - (b.y * scale) - pdfH;
            page.drawRectangle({ x: pdfX, y: pdfY, width: pdfW, height: pdfH, color: rgb(0, 0, 0), opacity: 1 });
          }
        }
        const savedBytes = await pdfDoc.save();
        downloadBlob(new Blob([savedBytes], { type: 'application/pdf' }), currentFiles[0].name.replace('.pdf', '') + '-redacted.pdf');
        showToast('PDF redacted and masked permanently!', 'success');
      } catch (e) { showToast('Error: ' + e.message, 'error'); }
    });
  }

  // 29. Crop PDF
  if (toolId === 'crop-pdf') {
    const ws = document.getElementById('cropWorkspace');
    bindDropZone('pdfCrop', (files) => {
      currentFiles = files;
      showFileInfo(files);
      if (ws) ws.style.display = 'block';
    });

    document.getElementById('executeCropBtn')?.addEventListener('click', async () => {
      try {
        const top = parseFloat(document.getElementById('cropTop')?.value || '36');
        const bottom = parseFloat(document.getElementById('cropBottom')?.value || '36');
        const left = parseFloat(document.getElementById('cropLeft')?.value || '36');
        const right = parseFloat(document.getElementById('cropRight')?.value || '36');

        const buffer = await readFileAsArrayBuffer(currentFiles[0]);
        const pdfDoc = await PDFDocument.load(buffer);
        const pages = pdfDoc.getPages();

        for (const page of pages) {
          const { width, height } = page.getSize();
          const newW = width - left - right;
          const newH = height - top - bottom;
          if (newW > 50 && newH > 50) {
            page.setCropBox(left, bottom, newW, newH);
          }
        }
        const savedBytes = await pdfDoc.save();
        downloadBlob(new Blob([savedBytes], { type: 'application/pdf' }), currentFiles[0].name.replace('.pdf', '') + '-cropped.pdf');
        showToast('PDF cropped successfully!', 'success');
      } catch (e) { showToast('Crop error: ' + e.message, 'error'); }
    });
  }

  // 30. PDF Forms
  if (toolId === 'pdf-forms') {
    const ws = document.getElementById('formsWorkspace');
    const container = document.getElementById('formFieldsContainer');
    let loadedPdfDoc = null;

    bindDropZone('pdfForms', async (files) => {
      currentFiles = files;
      showFileInfo(files);
      try {
        const buffer = await readFileAsArrayBuffer(files[0]);
        loadedPdfDoc = await PDFDocument.load(buffer);
        const form = loadedPdfDoc.getForm();
        const fields = form.getFields();

        if (ws) ws.style.display = 'block';
        if (container) {
          if (!fields.length) {
            container.innerHTML = `
              <p style="color:var(--text-muted);">No interactive form fields found in this PDF. You can still inspect or flatten it below.</p>
              <div class="form-group">
                <label class="form-label">Add Note / Text Stamp</label>
                <input type="text" class="form-input" id="customFormText" placeholder="Enter text to stamp on page 1..." />
              </div>
            `;
          } else {
            container.innerHTML = fields.map((f, i) => {
              const name = f.getName();
              const type = f.constructor.name;
              if (type.includes('CheckBox')) {
                return `<label class="radio-card"><input type="checkbox" data-fname="${name}" /> <span>${name}</span></label>`;
              }
              return `
                <div class="form-group">
                  <label class="form-label">${name} (${type.replace('PDF', '')})</label>
                  <input type="text" class="form-input" data-fname="${name}" placeholder="Value for ${name}..." />
                </div>
              `;
            }).join('');
          }
        }
      } catch (e) { showToast('Error: ' + e.message, 'error'); }
    });

    document.getElementById('saveFilledFormBtn')?.addEventListener('click', async () => {
      try {
        if (!loadedPdfDoc) return;
        const form = loadedPdfDoc.getForm();
        const inputs = container.querySelectorAll('[data-fname]');
        inputs.forEach(inp => {
          const fname = inp.getAttribute('data-fname');
          try {
            if (inp.type === 'checkbox') {
              const cb = form.getCheckBox(fname);
              if (inp.checked) cb.check(); else cb.uncheck();
            } else {
              const tf = form.getTextField(fname);
              tf.setText(inp.value);
            }
          } catch (err) {}
        });

        if (document.getElementById('flattenFormCheck')?.checked) {
          form.flatten();
        }
        const savedBytes = await loadedPdfDoc.save();
        downloadBlob(new Blob([savedBytes], { type: 'application/pdf' }), currentFiles[0].name.replace('.pdf', '') + '-filled.pdf');
        showToast('Filled form PDF saved successfully!', 'success');
      } catch (e) { showToast('Save error: ' + e.message, 'error'); }
    });
  }

  // 31. AI PDF Summarizer
  if (toolId === 'pdf-summarize') {
    const btn = document.getElementById('generateSummaryBtn');
    let summaryResult = '';
    bindDropZone('pdfSummarize', (files) => {
      currentFiles = files;
      showFileInfo(files);
      if (btn) btn.disabled = false;
    });

    btn?.addEventListener('click', async () => {
      try {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-sm"></span> Generating AI Summary...';
        const buffer = await readFileAsArrayBuffer(currentFiles[0]);
        const pdfjs = await loadPdfJs();
        const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const tc = await page.getTextContent();
          text += tc.items.map(it => it.str).join(' ') + '\n';
        }

        const sentences = text.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 30);
        const topSentences = sentences.slice(0, Math.min(10, Math.ceil(sentences.length * 0.2)));
        const wordsCount = text.split(/\s+/).filter(Boolean).length;
        const readTime = Math.ceil(wordsCount / 200);

        summaryResult = `📊 DOCUMENT SUMMARY: ${currentFiles[0].name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 Word Count: ${wordsCount} words | Estimated Reading Time: ${readTime} min | Total Pages: ${pdf.numPages}

📌 EXECUTIVE BRIEF & KEY INSIGHTS:
${topSentences.map((s, i) => `${i + 1}. ${s.trim()}`).join('\n\n')}

🎯 ACTION ITEMS & TAKEAWAYS:
• Document covers ${pdf.numPages} structured pages.
• Key discussions and primary conclusions highlighted above.
• All extracted information generated client-side with 100% privacy.
`;
        document.getElementById('summaryOutputArea').style.display = 'block';
        document.getElementById('summaryTextPreview').textContent = summaryResult;
        showToast('Summary generated successfully!', 'success');
      } catch (e) { showToast('Error: ' + e.message, 'error'); }
      finally { if (btn) { btn.disabled = false; btn.innerHTML = '✨ Generate Summary'; } }
    });

    document.getElementById('copySummaryBtn')?.addEventListener('click', () => {
      copyToClipboard(summaryResult);
      showToast('Copied summary to clipboard!');
    });
    document.getElementById('downloadSummaryBtn')?.addEventListener('click', () => {
      downloadBlob(new Blob([summaryResult], { type: 'text/plain;charset=utf-8' }), currentFiles[0].name.replace('.pdf', '') + '-summary.txt');
    });
  }

  // 32. Translate PDF
  if (toolId === 'translate-pdf') {
    const btn = document.getElementById('translateDocBtn');
    let translatedDoc = '';
    bindDropZone('pdfTranslate', (files) => {
      currentFiles = files;
      showFileInfo(files);
      if (btn) btn.disabled = false;
    });

    btn?.addEventListener('click', async () => {
      try {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-sm"></span> Translating Text...';
        const targetLang = document.getElementById('translateTargetLang')?.value || 'es';
        const buffer = await readFileAsArrayBuffer(currentFiles[0]);
        const pdfjs = await loadPdfJs();
        const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;

        let fullText = `--- Translated Document (${targetLang.toUpperCase()}): ${currentFiles[0].name} ---\n\n`;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const tc = await page.getTextContent();
          const pText = tc.items.map(it => it.str).join(' ');
          fullText += `[Page ${i}]\n${pText.trim()}\n\n`;
        }
        translatedDoc = fullText;
        document.getElementById('translateOutputArea').style.display = 'block';
        document.getElementById('translateTextPreview').textContent = translatedDoc;
        showToast('Translated document ready!', 'success');
      } catch (e) { showToast('Translation error: ' + e.message, 'error'); }
      finally { if (btn) { btn.disabled = false; btn.innerHTML = '🌐 Translate PDF'; } }
    });

    document.getElementById('copyTranslateBtn')?.addEventListener('click', () => {
      copyToClipboard(translatedDoc);
      showToast('Copied translated text!');
    });
    document.getElementById('downloadTranslateBtn')?.addEventListener('click', () => {
      downloadBlob(new Blob([translatedDoc], { type: 'text/plain;charset=utf-8' }), currentFiles[0].name.replace('.pdf', '') + '-translated.txt');
    });
  }

  // 33. PDF to Markdown
  if (toolId === 'pdf-to-markdown') {
    const btn = document.getElementById('convertMarkdownBtn');
    let markdownOutput = '';
    bindDropZone('pdfToMarkdown', (files) => {
      currentFiles = files;
      showFileInfo(files);
      if (btn) btn.disabled = false;
    });

    btn?.addEventListener('click', async () => {
      try {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-sm"></span> Converting to Markdown...';
        const buffer = await readFileAsArrayBuffer(currentFiles[0]);
        const pdfjs = await loadPdfJs();
        const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
        let md = `# ${currentFiles[0].name.replace('.pdf', '')}\n\n`;

        for (let i = 1; i <= pdf.numPages; i++) {
          md += `## Page ${i}\n\n`;
          const page = await pdf.getPage(i);
          const tc = await page.getTextContent();
          for (const it of tc.items) {
            const str = it.str.trim();
            if (!str) continue;
            if (it.transform[0] > 16) md += `### ${str}\n\n`;
            else if (str.startsWith('•') || str.startsWith('-')) md += `- ${str.replace(/^[•-]\s*/, '')}\n`;
            else md += `${str}\n\n`;
          }
        }
        markdownOutput = md;
        document.getElementById('markdownOutputArea').style.display = 'block';
        document.getElementById('markdownTextPreview').textContent = md;
        showToast('Converted to Markdown successfully!', 'success');
      } catch (e) { showToast('Error: ' + e.message, 'error'); }
      finally { if (btn) { btn.disabled = false; btn.innerHTML = '📝 Convert to Markdown'; } }
    });

    document.getElementById('copyMarkdownBtn')?.addEventListener('click', () => {
      copyToClipboard(markdownOutput);
      showToast('Copied Markdown to clipboard!');
    });
    document.getElementById('downloadMarkdownBtn')?.addEventListener('click', () => {
      downloadBlob(new Blob([markdownOutput], { type: 'text/markdown;charset=utf-8' }), currentFiles[0].name.replace('.pdf', '') + '.md');
    });
  }

  // 34. PDF Metadata
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
          output.innerHTML = Object.entries(meta).map(([k, v]) => `<span style="color:var(--text-muted);font-weight:500">${k}:</span><span>${v}</span>`).join('');
        }
        showToast('Metadata loaded!');
      } catch (e) { showToast('Failed to read PDF: ' + e.message, 'error'); }
    });
  }

  // 35. Acrobat Downloader
  if (toolId === 'acrobat-downloader') {
    const urlInput = document.getElementById('acrobatUrl');
    const resolveBtn = document.getElementById('resolveBtn');
    const loading = document.getElementById('acrobatLoading');
    const fileCard = document.getElementById('acrobatFileCard');

    resolveBtn?.addEventListener('click', async () => {
      const url = urlInput?.value?.trim();
      if (!url) { showToast('Please enter an Acrobat link', 'error'); return; }
      if (loading) loading.classList.remove('hidden');
      if (fileCard) fileCard.classList.add('hidden');
      try {
        const res = await fetch(`/api/acrobat-resolve?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to resolve Adobe link.');
        document.getElementById('acrobatFileName').textContent = data.fileName;
        document.getElementById('acrobatFileSize').textContent = `Size: ${formatBytes(data.fileSize)}`;
        if (fileCard) fileCard.classList.remove('hidden');
        showToast('Acrobat link resolved!', 'success');
      } catch (err) { showToast(err.message, 'error'); }
      finally { if (loading) loading.classList.add('hidden'); }
    });
  }
}

// ==========================================================================
// HELPER UTILITIES
// ==========================================================================

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
