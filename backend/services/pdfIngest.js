const pdfParse = (() => { try { return require('pdf-parse'); } catch { return null; } })();
const logger = require('./logger');

async function extractPdfText(buffer) {
  if (!pdfParse) throw new Error('pdf-parse no instalado');
  const data = await pdfParse(buffer);
  // data.text no conserva páginas; data.metadata etc. Algunos builds traen data.pageInfos
  // fallback: split por saltos de página comunes '\f'
  const raw = data.text || '';
  const pages = raw.split('\f');
  return pages.map((t) => t.trim());
}

function chunkPages(pages, opts = { maxChars: 1800 }) {
  const chunks = [];
  let acc = '';
  const from = 1;
  let pfrom = 1;
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if ((acc + '\n' + page).length > opts.maxChars && acc) {
      chunks.push({ text: acc.trim(), page_from: pfrom, page_to: i });
      acc = page;
      pfrom = i + 1;
    } else {
      acc = acc ? acc + '\n' + page : page;
    }
  }
  if (acc) chunks.push({ text: acc.trim(), page_from: pfrom, page_to: pages.length });
  return chunks;
}

module.exports = { extractPdfText, chunkPages };


