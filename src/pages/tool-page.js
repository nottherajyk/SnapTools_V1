import { tools } from '../tools-data.js';
import { imageToolHandler } from '../tools/image-tools.js';
import { pdfToolHandler } from '../tools/pdf-tools.js';
import { socialToolHandler } from '../tools/social-tools.js';
import { textToolHandler } from '../tools/text-tools.js';

export function renderToolPage(toolId) {
  const tool = tools.find(t => t.id === toolId);
  if (!tool) return `<div class="tool-page"><h1>Tool not found</h1><p><a href="#/">Go back home</a></p></div>`;

  const catNames = { image: 'Image Tools', pdf: 'PDF Tools', social: 'Social Media', text: 'Text & Lists' };

  let toolContent = '';
  if (tool.category === 'image') toolContent = imageToolHandler(tool);
  else if (tool.category === 'pdf') toolContent = pdfToolHandler(tool);
  else if (tool.category === 'social') toolContent = socialToolHandler(tool);
  else if (tool.category === 'text') toolContent = textToolHandler(tool);

  return `
    <div class="tool-page">
      <div class="tool-page-header">
        <div class="breadcrumb">
          <a href="#/">Home</a> <span>›</span>
          <a href="#/${tool.category}" data-nav="/${tool.category}">${catNames[tool.category] || 'Tools'}</a> <span>›</span>
          <span>${tool.name}</span>
        </div>
        <h1>${tool.icon} ${tool.name}</h1>
        <p class="tool-desc">${tool.desc}</p>
      </div>
      ${toolContent}
    </div>
  `;
}
