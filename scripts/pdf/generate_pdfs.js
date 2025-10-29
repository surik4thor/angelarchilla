import fs from 'fs';
import path from 'path';
import markdownIt from 'markdown-it';
import puppeteer from 'puppeteer';

const md = new markdownIt({ html: true });

function mdToHtml(mdContent, title = '') {
  return `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; margin: 40px; color:#222 }
      h1,h2,h3 { color:#2b2b2b }
      pre { background:#f6f8fa; padding:12px; overflow:auto }
      code { background:#f6f8fa; padding:2px 4px }
      .one-pager { max-width: 800px; margin: auto }
    </style>
  </head>
  <body>
    <div class="content">
      ${md.render(mdContent)}
    </div>
  </body>
  </html>`;
}

async function savePdfFromHtml(html, outPath, options = {}) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({ path: outPath, format: 'A4', printBackground: true, ...options });
  await browser.close();
}

async function main() {
  const base = path.resolve(process.cwd(), 'Documentación Proyecto');
  const files = [
    { md: 'ANÁLISIS_COMPLETO_FULL_STACK.md', out: 'ANÁLISIS_COMPLETO_FULL_STACK.pdf', title: 'Análisis Completo - Reino Místico' },
    { md: 'PLAN_COMERCIAL_REINO_MÍSTICO.md', out: 'PLAN_COMERCIAL_REINO_MÍSTICO.pdf', title: 'Plan Comercial - Reino Místico' }
  ];

  for (const f of files) {
    const mdPath = path.join(base, f.md);
    if (!fs.existsSync(mdPath)) {
      console.error('Missing file:', mdPath);
      continue;
    }
    const mdContent = fs.readFileSync(mdPath, 'utf8');
    const html = mdToHtml(mdContent, f.title);
    const outPath = path.join(base, f.out);
    console.log('Generating PDF:', outPath);
    await savePdfFromHtml(html, outPath);
  }

  // One-pager: extract header and key sections from analysis to create a short summary
  const analysisPath = path.join(base, 'ANÁLISIS_COMPLETO_FULL_STACK.md');
  const analysis = fs.readFileSync(analysisPath, 'utf8');
  const lines = analysis.split(/\n/);
  let onePagerMd = '# Reino Místico - One Pager\n\n';
  // take first 80 lines as summary
  onePagerMd += lines.slice(0, 80).join('\n');
  onePagerMd += '\n\n---\n\nVer documento completo en ANÁLISIS_COMPLETO_FULL_STACK.md';
  const oneHtml = mdToHtml(onePagerMd, 'One Pager - Reino Místico');
  const oneOut = path.join(base, 'ONE_PAGER_REINO_MÍSTICO.pdf');
  console.log('Generating one-pager PDF:', oneOut);
  await savePdfFromHtml(oneHtml, oneOut, { format: 'A4' });

  // Deck: split one-pager into slide-sized chunks (simple approach)
  const linesPerSlide = 20;
  const linesArr = onePagerMd.split('\n');
  const slides = [];
  for (let i = 0; i < linesArr.length; i += linesPerSlide) {
    slides.push(linesArr.slice(i, i + linesPerSlide).join('\n'));
  }
  let deckHtml = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Deck - Reino Místico</title><style>body{font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;color:#222} .slide{page-break-after:always;padding:40px; display:flex;flex-direction:column;justify-content:center;height:297mm;} h1{font-size:28px} p{font-size:16px}</style></head><body>`;
  slides.forEach((s) => {
    deckHtml += `<section class="slide">${md.render(s)}</section>`;
  });
  deckHtml += `</body></html>`;
  const deckOut = path.join(base, 'DECK_REINO_MÍSTICO.pdf');
  console.log('Generating deck PDF:', deckOut);
  await savePdfFromHtml(deckHtml, deckOut, { format: 'A4' });

  console.log('All PDFs generated.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
