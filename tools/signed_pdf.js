// Erzeugt das unterschriebene Model-Release-PDF.
// node tools/signed_pdf.js "<Name>" "<Aufnahmedatum-Text>" <ISO signed_at> <REF> <out.pdf>
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), os = require('os');
const [name, shoot, at, ref, out] = process.argv.slice(2);
(async () => {
  const tpl = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8').split('{{SHOOT}}').join(shoot).split('{{SLUG}}').join('pdf');
  const html = '<!doctype html><html lang="de"><head><meta charset="utf-8"><style>body{margin:0}[hidden]{display:none!important}</style></head><body>' + tpl + '</body></html>';
  const b = await chromium.launch();
  const ctx = await b.newContext({ locale: 'de-AT', timezoneId: 'Europe/Vienna' });
  await ctx.route(/supabase\.co/, r => r.abort());
  const p = await ctx.newPage();
  await p.addInitScript(([s]) => { try { localStorage.setItem('achager-model-release-2026-11-pdf', s); } catch (e) {} },
    [JSON.stringify({ name, shoot, at, ref, sent: true })]);
  const tmp = path.join(os.tmpdir(), 'mr-' + Date.now() + '.html'); fs.writeFileSync(tmp, html);
  await p.goto('file://' + tmp, { waitUntil: 'load' });
  await p.addStyleTag({ content: `.bar,#done,.scrim{display:none!important}.wrap{padding:0!important;max-width:none!important}.sheet{border:0!important;padding:0!important}.clause,.sigs{break-inside:avoid}body,.sheet{background:#fff!important}` });
  await p.emulateMedia({ colorScheme: 'light' });
  await p.waitForTimeout(800);
  await p.pdf({ path: out, format: 'A4', printBackground: true, margin: { top: '20mm', bottom: '18mm', left: '20mm', right: '20mm' },
    displayHeaderFooter: true, headerTemplate: '<div></div>',
    footerTemplate: `<div style="width:100%;font-size:7pt;color:#777;padding:0 20mm;display:flex;justify-content:space-between;font-family:Helvetica"><span>Model Release · digital unterzeichnet · Ref. ${ref}</span><span><span class="pageNumber"></span>/<span class="totalPages"></span></span></div>` });
  await b.close();
  console.log('ok ' + out);
})();
