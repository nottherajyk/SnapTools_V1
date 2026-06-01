import { showToast } from '../components/toast.js';
import { downloadBlob, copyToClipboard } from '../utils.js';

export function textToolHandler(tool) {
  setTimeout(() => setupTextTool(tool.id), 50);
  window.addEventListener('page-rendered', () => setupTextTool(tool.id), { once: true });

  switch (tool.id) {
    case 'character-counter': return renderCharCounter();
    case 'password-generator': return renderPasswordGen();
    case 'text-to-binary': return renderTextBinary('text-to-binary');
    case 'binary-to-text': return renderTextBinary('binary-to-text');
    case 'text-to-ascii': return renderTextBinary('text-to-ascii');
    case 'ascii-to-text': return renderTextBinary('ascii-to-text');
    case 'capitalize-words': return renderTextTransform('capitalize');
    case 'uppercase-text': return renderTextTransform('uppercase');
    case 'lowercase-text': return renderTextTransform('lowercase');
    case 'reverse-list': return renderListTool('reverse');
    case 'randomize-list': return renderListTool('randomize');
    case 'repeat-text': return renderRepeatText();
    case 'ip-to-binary': return renderIpToBinary();
    case 'numbers-to-words': return renderNumbersToWords();
    case 'text-to-image': return renderTextToImage();
    case 'bionic-reading': return renderBionicReading();
    case 'random-object': return renderRandomObject();
    case 'credit-card-gen': return renderCreditCardGen();
    default: return `<p>Tool coming soon!</p>`;
  }
}

// =========== RENDER FUNCTIONS ===========

function renderCharCounter() {
  return `
    <div class="form-group">
      <label class="form-label">Enter your text</label>
      <textarea class="form-textarea" id="inputText" placeholder="Type or paste your text here..." style="min-height:120px"></textarea>
    </div>
    <div class="stats-grid" id="statsGrid">
      <div class="stat-card"><div class="stat-value" id="charCount">0</div><div class="stat-label">Characters</div></div>
      <div class="stat-card"><div class="stat-value" id="charNoSpace">0</div><div class="stat-label">No Spaces</div></div>
      <div class="stat-card"><div class="stat-value" id="wordCount">0</div><div class="stat-label">Words</div></div>
      <div class="stat-card"><div class="stat-value" id="lineCount">0</div><div class="stat-label">Lines</div></div>
      <div class="stat-card"><div class="stat-value" id="sentenceCount">0</div><div class="stat-label">Sentences</div></div>
      <div class="stat-card"><div class="stat-value" id="paraCount">0</div><div class="stat-label">Paragraphs</div></div>
    </div>
  `;
}

function renderPasswordGen() {
  return `
    <div class="form-row">
      <div class="form-group" style="flex:1">
        <label class="form-label">Length</label>
        <input type="range" id="pwLength" min="4" max="64" value="16" class="form-range" />
        <span id="pwLengthVal" style="font-size:.85rem;color:var(--text-muted)">16</span>
      </div>
    </div>
    <div class="checkbox-group">
      <label class="checkbox-label"><input type="checkbox" id="pwUpper" checked /> Uppercase (A-Z)</label>
      <label class="checkbox-label"><input type="checkbox" id="pwLower" checked /> Lowercase (a-z)</label>
      <label class="checkbox-label"><input type="checkbox" id="pwDigits" checked /> Digits (0-9)</label>
      <label class="checkbox-label"><input type="checkbox" id="pwSymbols" checked /> Symbols (!@#$)</label>
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="generateBtn">🔐 Generate Password</button>
    </div>
    <div class="result-area" id="resultArea">
      <div class="password-display" id="passwordDisplay" style="font-family:monospace;font-size:1.4rem;letter-spacing:2px;word-break:break-all;padding:1.5rem;background:var(--surface-light);border-radius:12px;text-align:center"></div>
      <div class="password-strength" id="passwordStrength" style="margin-top:.75rem;text-align:center"></div>
      <div class="actions-row" style="margin-top:1rem">
        <button class="btn btn-secondary" id="copyPwBtn">📋 Copy</button>
        <button class="btn btn-secondary" id="regenBtn">🔄 Regenerate</button>
      </div>
    </div>
  `;
}

function renderTextBinary(type) {
  const labels = {
    'text-to-binary': ['Text', 'Binary'],
    'binary-to-text': ['Binary', 'Text'],
    'text-to-ascii': ['Text', 'ASCII Codes'],
    'ascii-to-text': ['ASCII Codes', 'Text'],
  };
  const [fromLabel, toLabel] = labels[type] || ['Input', 'Output'];
  return `
    <div class="form-group">
      <label class="form-label">${fromLabel}</label>
      <textarea class="form-textarea" id="inputText" placeholder="Enter ${fromLabel.toLowerCase()} here..." style="min-height:100px"></textarea>
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="convertBtn">⚡ Convert</button>
    </div>
    <div class="form-group">
      <label class="form-label">${toLabel}</label>
      <textarea class="form-textarea" id="outputText" readonly style="min-height:100px;background:var(--surface-light)"></textarea>
    </div>
    <div class="actions-row">
      <button class="btn btn-secondary" id="copyBtn">📋 Copy Result</button>
    </div>
  `;
}

function renderTextTransform(type) {
  const labels = { capitalize: 'Capitalize Each Word', uppercase: 'UPPERCASE', lowercase: 'lowercase' };
  return `
    <div class="form-group">
      <label class="form-label">Input Text</label>
      <textarea class="form-textarea" id="inputText" placeholder="Type or paste your text..." style="min-height:100px"></textarea>
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="transformBtn">✨ Transform to ${labels[type]}</button>
    </div>
    <div class="form-group">
      <label class="form-label">Result</label>
      <textarea class="form-textarea" id="outputText" readonly style="min-height:100px;background:var(--surface-light)"></textarea>
    </div>
    <div class="actions-row">
      <button class="btn btn-secondary" id="copyBtn">📋 Copy Result</button>
    </div>
  `;
}

function renderListTool(type) {
  return `
    <div class="form-group">
      <label class="form-label">Enter list items (one per line)</label>
      <textarea class="form-textarea" id="inputText" placeholder="Item 1\nItem 2\nItem 3..." style="min-height:120px"></textarea>
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="processBtn">${type === 'reverse' ? '🔃 Reverse List' : '🎲 Randomize List'}</button>
    </div>
    <div class="form-group">
      <label class="form-label">Result</label>
      <textarea class="form-textarea" id="outputText" readonly style="min-height:120px;background:var(--surface-light)"></textarea>
    </div>
    <div class="actions-row">
      <button class="btn btn-secondary" id="copyBtn">📋 Copy Result</button>
    </div>
  `;
}

function renderRepeatText() {
  return `
    <div class="form-group">
      <label class="form-label">Text to Repeat</label>
      <textarea class="form-textarea" id="inputText" placeholder="Enter text..." style="min-height:80px"></textarea>
    </div>
    <div class="form-row">
      <div class="form-group" style="flex:1">
        <label class="form-label">Times</label>
        <input type="number" class="form-input" id="repeatCount" value="5" min="1" max="1000" />
      </div>
      <div class="form-group" style="flex:1">
        <label class="form-label">Separator</label>
        <select class="form-select" id="separator">
          <option value="newline">New Line</option>
          <option value="space">Space</option>
          <option value="comma">Comma</option>
          <option value="none">None</option>
        </select>
      </div>
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="repeatBtn">🔁 Repeat</button>
    </div>
    <div class="form-group">
      <label class="form-label">Result</label>
      <textarea class="form-textarea" id="outputText" readonly style="min-height:100px;background:var(--surface-light)"></textarea>
    </div>
    <div class="actions-row">
      <button class="btn btn-secondary" id="copyBtn">📋 Copy Result</button>
    </div>
  `;
}

function renderIpToBinary() {
  return `
    <div class="form-group">
      <label class="form-label">IP Address</label>
      <input type="text" class="form-input" id="ipInput" placeholder="192.168.1.1" />
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="convertBtn">🌐 Convert</button>
    </div>
    <div class="result-area" id="resultArea">
      <div id="ipResult" style="font-family:monospace;font-size:1.1rem;padding:1rem;background:var(--surface-light);border-radius:8px"></div>
    </div>
  `;
}

function renderNumbersToWords() {
  return `
    <div class="form-group">
      <label class="form-label">Enter a Number</label>
      <input type="text" class="form-input" id="numberInput" placeholder="12345" />
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="convertBtn">#️⃣ Convert</button>
    </div>
    <div class="result-area" id="resultArea">
      <div id="wordsResult" style="font-size:1.2rem;padding:1rem;background:var(--surface-light);border-radius:8px;text-transform:capitalize"></div>
    </div>
  `;
}

function renderTextToImage() {
  return `
    <div class="form-group">
      <label class="form-label">Text</label>
      <textarea class="form-textarea" id="inputText" placeholder="Enter your text..." style="min-height:80px">Hello World!</textarea>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Font Size</label>
        <input type="number" class="form-input" id="fontSize" value="32" min="8" max="200" />
      </div>
      <div class="form-group">
        <label class="form-label">Text Color</label>
        <input type="color" class="form-input" id="textColor" value="#ffffff" style="height:40px;padding:2px" />
      </div>
      <div class="form-group">
        <label class="form-label">Background</label>
        <input type="color" class="form-input" id="bgColor" value="#1a1a2e" style="height:40px;padding:2px" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Font Family</label>
      <select class="form-select" id="fontFamily">
        <option value="Inter, sans-serif">Inter</option>
        <option value="monospace">Monospace</option>
        <option value="Georgia, serif">Georgia</option>
        <option value="cursive">Cursive</option>
      </select>
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="generateBtn">🖼️ Generate Image</button>
      <button class="btn btn-secondary" id="downloadBtn" disabled>📥 Download PNG</button>
    </div>
    <div class="preview-area" id="previewArea" style="display:none">
      <canvas id="textCanvas" style="max-width:100%;border-radius:8px"></canvas>
    </div>
  `;
}

function renderBionicReading() {
  return `
    <div class="form-group">
      <label class="form-label">Enter your text</label>
      <textarea class="form-textarea" id="inputText" placeholder="Paste your text here to convert to bionic reading format..." style="min-height:120px"></textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Bold Ratio</label>
      <select class="form-select" id="bionicRatio">
        <option value="0.4">40% — Standard</option>
        <option value="0.5" selected>50% — Enhanced</option>
        <option value="0.6">60% — Strong</option>
      </select>
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="convertBtn">📖 Convert</button>
    </div>
    <div class="result-area" id="resultArea">
      <div id="bionicOutput" style="font-size:1.05rem;line-height:1.8;padding:1.5rem;background:var(--surface-light);border-radius:12px"></div>
    </div>
  `;
}

function renderRandomObject() {
  return `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Count</label>
        <input type="number" class="form-input" id="objCount" value="5" min="1" max="50" />
      </div>
      <div class="form-group">
        <label class="form-label">Category</label>
        <select class="form-select" id="objCategory">
          <option value="all">All Categories</option>
          <option value="household">Household</option>
          <option value="nature">Nature</option>
          <option value="food">Food</option>
          <option value="tech">Technology</option>
        </select>
      </div>
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="generateBtn">🎰 Generate</button>
    </div>
    <div class="result-area" id="resultArea">
      <div id="objectsList" style="display:flex;flex-wrap:wrap;gap:.5rem"></div>
    </div>
  `;
}

function renderCreditCardGen() {
  return `
    <div class="form-group">
      <label class="form-label">Card Network</label>
      <select class="form-select" id="cardNetwork">
        <option value="visa">Visa</option>
        <option value="mastercard">Mastercard</option>
        <option value="amex">American Express</option>
        <option value="discover">Discover</option>
      </select>
    </div>
    <div class="actions-row">
      <button class="btn btn-primary" id="generateBtn">💳 Generate</button>
    </div>
    <div class="result-area" id="resultArea">
      <div class="credit-card" id="cardDisplay">
        <div class="card-chip">💳</div>
        <div class="card-number" id="cardNumber">•••• •••• •••• ••••</div>
        <div class="card-footer">
          <div><div class="card-footer-label">VALID THRU</div><div id="cardExpiry">MM/YY</div></div>
          <div><div class="card-footer-label">CVV</div><div id="cardCvv">•••</div></div>
        </div>
      </div>
      <div class="actions-row" style="margin-top:1rem">
        <button class="btn btn-secondary" id="copyCardBtn">📋 Copy Number</button>
      </div>
      <p style="font-size:.75rem;color:var(--text-muted);margin-top:1rem;text-align:center">⚠️ For testing purposes only. These are not real credit card numbers.</p>
    </div>
  `;
}


// =========== SETUP LOGIC ===========
function setupTextTool(toolId) {

  // Character Counter
  if (toolId === 'character-counter') {
    const input = document.getElementById('inputText');
    if (!input) return;
    const update = () => {
      const text = input.value;
      setText('charCount', text.length);
      setText('charNoSpace', text.replace(/\s/g, '').length);
      setText('wordCount', text.trim() ? text.trim().split(/\s+/).length : 0);
      setText('lineCount', text ? text.split('\n').length : 0);
      setText('sentenceCount', text.trim() ? (text.match(/[.!?]+/g) || []).length || (text.trim().length > 0 ? 1 : 0) : 0);
      setText('paraCount', text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length || (text.trim() ? 1 : 0) : 0);
    };
    input.addEventListener('input', update);
  }

  // Password Generator
  if (toolId === 'password-generator') {
    const slider = document.getElementById('pwLength');
    const valLabel = document.getElementById('pwLengthVal');
    if (slider && valLabel) {
      slider.addEventListener('input', () => { valLabel.textContent = slider.value; });
    }

    const generate = () => {
      let chars = '';
      if (document.getElementById('pwUpper')?.checked) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (document.getElementById('pwLower')?.checked) chars += 'abcdefghijklmnopqrstuvwxyz';
      if (document.getElementById('pwDigits')?.checked) chars += '0123456789';
      if (document.getElementById('pwSymbols')?.checked) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
      if (!chars) { showToast('Select at least one option', 'error'); return; }
      const len = parseInt(slider?.value || '16');
      let password = '';
      const arr = new Uint32Array(len);
      crypto.getRandomValues(arr);
      for (let i = 0; i < len; i++) password += chars[arr[i] % chars.length];

      const display = document.getElementById('passwordDisplay');
      const resultArea = document.getElementById('resultArea');
      const strengthEl = document.getElementById('passwordStrength');
      if (display && resultArea) {
        resultArea.classList.add('visible');
        display.textContent = password;
        // Strength indicator
        const strength = len < 8 ? 'Weak' : len < 12 ? 'Fair' : len < 20 ? 'Strong' : 'Very Strong';
        const colors = { 'Weak': '#ef4444', 'Fair': '#f59e0b', 'Strong': '#10b981', 'Very Strong': '#06d6a0' };
        if (strengthEl) strengthEl.innerHTML = `<span style="color:${colors[strength]};font-weight:600">${strength}</span>`;
      }
      showToast('Password generated!');
    };

    document.getElementById('generateBtn')?.addEventListener('click', generate);
    document.getElementById('regenBtn')?.addEventListener('click', generate);
    document.getElementById('copyPwBtn')?.addEventListener('click', () => {
      const pw = document.getElementById('passwordDisplay')?.textContent;
      if (pw) { copyToClipboard(pw); showToast('Copied!'); }
    });
  }

  // Text ↔ Binary / ASCII converters
  if (['text-to-binary', 'binary-to-text', 'text-to-ascii', 'ascii-to-text'].includes(toolId)) {
    document.getElementById('convertBtn')?.addEventListener('click', () => {
      const input = document.getElementById('inputText')?.value || '';
      let output = '';
      if (toolId === 'text-to-binary') {
        output = [...input].map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
      } else if (toolId === 'binary-to-text') {
        output = input.split(/\s+/).map(b => String.fromCharCode(parseInt(b, 2))).join('');
      } else if (toolId === 'text-to-ascii') {
        output = [...input].map(c => c.charCodeAt(0)).join(' ');
      } else if (toolId === 'ascii-to-text') {
        output = input.split(/\s+/).map(c => String.fromCharCode(parseInt(c))).join('');
      }
      setVal('outputText', output);
      showToast('Converted!');
    });
    document.getElementById('copyBtn')?.addEventListener('click', () => {
      const text = document.getElementById('outputText')?.value;
      if (text) { copyToClipboard(text); showToast('Copied!'); }
    });
  }

  // Text transforms
  if (['capitalize-words', 'uppercase-text', 'lowercase-text'].includes(toolId)) {
    document.getElementById('transformBtn')?.addEventListener('click', () => {
      const input = document.getElementById('inputText')?.value || '';
      let output = '';
      if (toolId === 'capitalize-words') {
        output = input.replace(/\b\w/g, c => c.toUpperCase());
      } else if (toolId === 'uppercase-text') {
        output = input.toUpperCase();
      } else {
        output = input.toLowerCase();
      }
      setVal('outputText', output);
      showToast('Transformed!');
    });
    document.getElementById('copyBtn')?.addEventListener('click', () => {
      const text = document.getElementById('outputText')?.value;
      if (text) { copyToClipboard(text); showToast('Copied!'); }
    });
  }

  // List tools
  if (['reverse-list', 'randomize-list'].includes(toolId)) {
    document.getElementById('processBtn')?.addEventListener('click', () => {
      const input = document.getElementById('inputText')?.value || '';
      const items = input.split('\n').filter(l => l.trim());
      if (toolId === 'reverse-list') items.reverse();
      else shuffleArray(items);
      setVal('outputText', items.join('\n'));
      showToast('Done!');
    });
    document.getElementById('copyBtn')?.addEventListener('click', () => {
      const text = document.getElementById('outputText')?.value;
      if (text) { copyToClipboard(text); showToast('Copied!'); }
    });
  }

  // Repeat Text
  if (toolId === 'repeat-text') {
    document.getElementById('repeatBtn')?.addEventListener('click', () => {
      const text = document.getElementById('inputText')?.value || '';
      const count = parseInt(document.getElementById('repeatCount')?.value || '5');
      const sepVal = document.getElementById('separator')?.value || 'newline';
      const seps = { newline: '\n', space: ' ', comma: ', ', none: '' };
      setVal('outputText', Array(count).fill(text).join(seps[sepVal]));
      showToast('Repeated ' + count + ' times!');
    });
    document.getElementById('copyBtn')?.addEventListener('click', () => {
      const text = document.getElementById('outputText')?.value;
      if (text) { copyToClipboard(text); showToast('Copied!'); }
    });
  }

  // IP to Binary
  if (toolId === 'ip-to-binary') {
    document.getElementById('convertBtn')?.addEventListener('click', () => {
      const ip = document.getElementById('ipInput')?.value.trim();
      if (!ip) { showToast('Enter an IP address', 'error'); return; }
      const parts = ip.split('.');
      if (parts.length !== 4 || parts.some(p => isNaN(p) || +p < 0 || +p > 255)) {
        showToast('Invalid IP address', 'error'); return;
      }
      const binary = parts.map(p => parseInt(p).toString(2).padStart(8, '0'));
      const result = document.getElementById('ipResult');
      const area = document.getElementById('resultArea');
      if (result && area) {
        area.classList.add('visible');
        result.innerHTML = `
          <div style="margin-bottom:.5rem;color:var(--text-muted);font-size:.85rem">Binary Representation:</div>
          <div style="font-size:1.2rem;font-weight:600;letter-spacing:1px">${binary.join('.')}</div>
          <div style="margin-top:.75rem;font-size:.85rem;color:var(--text-muted)">
            ${parts.map((p, i) => `<span>${p} → ${binary[i]}</span>`).join(' &nbsp;|&nbsp; ')}
          </div>`;
      }
      showToast('Converted!');
    });
  }

  // Numbers to Words
  if (toolId === 'numbers-to-words') {
    document.getElementById('convertBtn')?.addEventListener('click', () => {
      const num = document.getElementById('numberInput')?.value.trim();
      if (!num || isNaN(num)) { showToast('Enter a valid number', 'error'); return; }
      const words = numberToWords(parseInt(num));
      const result = document.getElementById('wordsResult');
      const area = document.getElementById('resultArea');
      if (result && area) {
        area.classList.add('visible');
        result.textContent = words;
      }
      showToast('Converted!');
    });
  }

  // Text to Image
  if (toolId === 'text-to-image') {
    document.getElementById('generateBtn')?.addEventListener('click', () => {
      const text = document.getElementById('inputText')?.value || 'Hello World!';
      const fontSize = parseInt(document.getElementById('fontSize')?.value || '32');
      const textColor = document.getElementById('textColor')?.value || '#ffffff';
      const bgColor = document.getElementById('bgColor')?.value || '#1a1a2e';
      const fontFamily = document.getElementById('fontFamily')?.value || 'Inter, sans-serif';

      const canvas = document.getElementById('textCanvas');
      const preview = document.getElementById('previewArea');
      if (!canvas || !preview) return;
      preview.style.display = '';

      const ctx = canvas.getContext('2d');
      ctx.font = `${fontSize}px ${fontFamily}`;
      const lines = text.split('\n');
      const lineHeight = fontSize * 1.4;
      const maxWidth = Math.max(...lines.map(l => ctx.measureText(l).width), 200);

      canvas.width = maxWidth + 80;
      canvas.height = lines.length * lineHeight + 80;

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = textColor;
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.textBaseline = 'top';

      lines.forEach((line, i) => {
        const x = (canvas.width - ctx.measureText(line).width) / 2;
        ctx.fillText(line, x, 40 + i * lineHeight);
      });

      document.getElementById('downloadBtn').disabled = false;
      showToast('Image generated!');
    });
    document.getElementById('downloadBtn')?.addEventListener('click', () => {
      const canvas = document.getElementById('textCanvas');
      if (!canvas) return;
      canvas.toBlob(blob => downloadBlob(blob, 'text-image.png'), 'image/png');
    });
  }

  // Bionic Reading
  if (toolId === 'bionic-reading') {
    document.getElementById('convertBtn')?.addEventListener('click', () => {
      const text = document.getElementById('inputText')?.value || '';
      const ratio = parseFloat(document.getElementById('bionicRatio')?.value || '0.5');
      const output = document.getElementById('bionicOutput');
      const area = document.getElementById('resultArea');
      if (!output || !area) return;
      area.classList.add('visible');
      const html = text.split(/\s+/).map(word => {
        if (!word) return '';
        const boldLen = Math.ceil(word.length * ratio);
        return `<strong>${word.slice(0, boldLen)}</strong>${word.slice(boldLen)}`;
      }).join(' ');
      output.innerHTML = html;
      showToast('Converted to bionic reading!');
    });
  }

  // Random Object Generator
  if (toolId === 'random-object') {
    const objects = {
      household: ['Chair', 'Table', 'Lamp', 'Clock', 'Mirror', 'Pillow', 'Blanket', 'Cup', 'Plate', 'Fork', 'Knife', 'Spoon', 'Towel', 'Soap', 'Brush', 'Candle', 'Vase', 'Rug', 'Curtain', 'Shelf'],
      nature: ['Rock', 'Leaf', 'Flower', 'Tree', 'Cloud', 'River', 'Mountain', 'Shell', 'Feather', 'Seed', 'Moss', 'Coral', 'Crystal', 'Fossil', 'Pebble', 'Acorn', 'Pine Cone', 'Driftwood', 'Sand', 'Raindrop'],
      food: ['Apple', 'Pizza', 'Sushi', 'Burger', 'Taco', 'Pasta', 'Bread', 'Cheese', 'Chocolate', 'Cake', 'Cookie', 'Rice', 'Soup', 'Salad', 'Sandwich', 'Donut', 'Mango', 'Avocado', 'Pretzel', 'Waffle'],
      tech: ['Phone', 'Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Speaker', 'Headphones', 'Camera', 'USB Drive', 'Charger', 'Router', 'Drone', 'Smartwatch', 'Tablet', 'Microphone', 'Printer', 'SSD', 'GPU', 'RAM Stick', 'Ethernet Cable'],
    };

    document.getElementById('generateBtn')?.addEventListener('click', () => {
      const count = parseInt(document.getElementById('objCount')?.value || '5');
      const cat = document.getElementById('objCategory')?.value || 'all';
      let pool = cat === 'all' ? Object.values(objects).flat() : (objects[cat] || []);
      shuffleArray(pool);
      const selected = pool.slice(0, Math.min(count, pool.length));

      const list = document.getElementById('objectsList');
      const area = document.getElementById('resultArea');
      if (list && area) {
        area.classList.add('visible');
        list.innerHTML = selected.map(o => `<span class="tag-pill">${o}</span>`).join('');
      }
      showToast(`Generated ${selected.length} objects!`);
    });
  }

  // Credit Card Generator
  if (toolId === 'credit-card-gen') {
    document.getElementById('generateBtn')?.addEventListener('click', () => {
      const network = document.getElementById('cardNetwork')?.value || 'visa';
      const { number, expiry, cvv } = generateCreditCard(network);
      const formatted = number.match(/.{1,4}/g)?.join(' ') || number;

      setText('cardNumber', formatted);
      setText('cardExpiry', expiry);
      setText('cardCvv', cvv);

      const card = document.getElementById('cardDisplay');
      const area = document.getElementById('resultArea');
      if (card) {
        const gradients = {
          visa: 'linear-gradient(135deg, #1a1f71, #0d47a1)',
          mastercard: 'linear-gradient(135deg, #eb001b, #f79e1b)',
          amex: 'linear-gradient(135deg, #006fcf, #00a1e4)',
          discover: 'linear-gradient(135deg, #ff6000, #f8981d)',
        };
        card.style.background = gradients[network] || gradients.visa;
      }
      if (area) area.classList.add('visible');
      showToast('Card generated (for testing only)!');
    });

    document.getElementById('copyCardBtn')?.addEventListener('click', () => {
      const num = document.getElementById('cardNumber')?.textContent.replace(/\s/g, '');
      if (num) { copyToClipboard(num); showToast('Card number copied!'); }
    });
  }
}


// =========== HELPERS ===========
function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
function setVal(id, val) { const el = document.getElementById(id); if (el) el.value = val; }
function shuffleArray(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } }

function numberToWords(num) {
  if (num === 0) return 'zero';
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const scales = ['', 'thousand', 'million', 'billion'];
  
  if (num < 0) return 'negative ' + numberToWords(-num);
  
  let result = '';
  let scaleIndex = 0;
  while (num > 0) {
    const chunk = num % 1000;
    if (chunk) {
      let chunkStr = '';
      const h = Math.floor(chunk / 100);
      const rem = chunk % 100;
      if (h) chunkStr += ones[h] + ' hundred ';
      if (rem < 20) chunkStr += ones[rem];
      else chunkStr += tens[Math.floor(rem / 10)] + (rem % 10 ? '-' + ones[rem % 10] : '');
      result = chunkStr.trim() + (scales[scaleIndex] ? ' ' + scales[scaleIndex] : '') + ' ' + result;
    }
    num = Math.floor(num / 1000);
    scaleIndex++;
  }
  return result.trim();
}

function generateCreditCard(network) {
  const prefixes = { visa: '4', mastercard: '5' + (Math.floor(Math.random() * 5) + 1), amex: '3' + (Math.random() > 0.5 ? '4' : '7'), discover: '6011' };
  let prefix = prefixes[network] || '4';
  const length = network === 'amex' ? 15 : 16;
  let number = prefix;
  while (number.length < length - 1) number += Math.floor(Math.random() * 10);
  // Luhn checksum
  let sum = 0;
  for (let i = number.length - 1; i >= 0; i--) {
    let d = parseInt(number[i]);
    if ((number.length - i) % 2 === 0) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  number += (10 - (sum % 10)) % 10;

  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const year = String(new Date().getFullYear() + Math.floor(Math.random() * 5) + 1).slice(-2);
  const cvv = String(Math.floor(Math.random() * (network === 'amex' ? 9000 : 900)) + (network === 'amex' ? 1000 : 100));

  return { number, expiry: `${month}/${year}`, cvv };
}
