// Erzeugt das unterschriebene Photographer-Release-PDF.
// node tools/photographer_pdf.js "<Name>" "<Nennung>" <ISO signed_at> <REF> <out.pdf>
const { chromium } = require('playwright');
const path = require('path');
const [name, credit, at, ref, out] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ locale: 'de-AT', timezoneId: 'Europe/Vienna' });
  await ctx.route(/supabase\.co/, r => r.abort());
  const p = await ctx.newPage();
  await p.addInitScript(([s]) => { try { localStorage.setItem('achager-photographer-release-04-09-2026', s); } catch (e) {} },
    [JSON.stringify({ name, credit, at, ref, sent: true })]);
  await p.goto('file://' + path.join(__dirname, '..', 'fotograf', 'index.html'), { waitUntil: 'load' });
  await p.addStyleTag({ content: `.bar,#done,.scrim{display:none!important}body{background:#fff!important;font-size:13px!important}.wrap{padding:0!important;max-width:none!important}.sheet{padding:0!important}h1{font-size:44px!important;margin:34px 0 12px!important}.sub{margin-bottom:28px!important}.c{margin-bottom:15px!important;break-inside:avoid}.c h2{font-size:17px!important}.sigs{break-inside:avoid;margin-top:26px!important}.end{break-before:avoid}` });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(500);
  await p.pdf({ path: out, format: 'A4', printBackground: true, margin: { top: '18mm', bottom: '18mm', left: '20mm', right: '20mm' },
    displayHeaderFooter: true, headerTemplate: '<div></div>',
    footerTemplate: `<div style="width:100%;font-size:7pt;color:#888;padding:0 20mm;display:flex;justify-content:space-between;font-family:Helvetica"><span>Photographer Release · digital unterzeichnet · Ref. ${ref}</span><span><span class="pageNumber"></span>/<span class="totalPages"></span></span></div>` });
  await b.close();
  console.log('ok ' + out);
})();
