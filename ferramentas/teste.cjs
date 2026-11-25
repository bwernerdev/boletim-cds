// Teste de ponta a ponta do editor, no Edge, abrindo o index.html por file://
// (o uso real). Cobre as partes que já quebraram ou que protegem o boletim:
//   1. a data da extração sobrevive ao F5;
//   2. num mês novo, o mês do boletim avança e a extração volta para hoje;
//   3. a colagem do Excel perde scripts, eventos, ids, classes e mso-*,
//      mas mantém as cores que vinham das classes;
//   4. a medida das folhas para a impressão não muda numa janela estreita.
//
// Uso (na raiz do projeto): node ferramentas/teste.cjs
// O Playwright não fica neste projeto (sem dependências): usa o do giro-estoque,
// ou o caminho em PLAYWRIGHT.

const path = require("path");
const fs = require("fs");
const os = require("os");
const assert = require("assert");
const { chromium } = require(process.env.PLAYWRIGHT
  || path.resolve(__dirname, "../../giro-estoque/node_modules/playwright"));

const URL_EDITOR = "file:///" + path.resolve(__dirname, "../index.html").replace(/\\/g, "/");

// Navegadores abertos: o finally fecha antes de apagar o perfil, senão a pasta
// fica presa e o erro do teste some atrás de um EPERM.
const abertos = new Set();
async function fecharTodos() {
  for (const ctx of abertos) await ctx.close().catch(() => {});
  abertos.clear();
}

// Abre o editor com o relógio na data dada e o perfil (IndexedDB) da pasta dada.
async function abrir(perfil, data, largura = 1400) {
  const ctx = await chromium.launchPersistentContext(perfil, {
    channel: "msedge", viewport: { width: largura, height: 900 },
  });
  abertos.add(ctx);
  if (data) await ctx.clock.install({ time: new Date(data) });
  const page = ctx.pages()[0] || await ctx.newPage();
  const erros = [];
  page.on("pageerror", (e) => erros.push(e.message));
  await page.goto(URL_EDITOR);
  await page.waitForSelector(".pagina");
  return { ctx, page, erros };
}

async function mudarCampo(page, sel, valor) {
  await page.fill(sel, valor);
  await page.dispatchEvent(sel, "change");
  await page.waitForTimeout(200);
}

async function testeDatas() {
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), "boletim-teste-"));
  try {
    // Primeira abertura em 10/11: mês padrão é outubro.
    let { ctx, page, erros } = await abrir(perfil, "2026-11-10T09:00:00");
    assert.strictEqual(await page.inputValue("#campo-mes"), "2026-10");
    await mudarCampo(page, "#campo-extracao", "2026-11-03");
    await ctx.close();

    // F5 no mesmo mês: a data escolhida continua (bug antigo: voltava para hoje).
    ({ ctx, page, erros } = await abrir(perfil, "2026-11-12T09:00:00"));
    assert.strictEqual(await page.inputValue("#campo-extracao"), "2026-11-03", "data da extração voltou para hoje");
    assert.strictEqual(await page.inputValue("#campo-mes"), "2026-10");
    await ctx.close();

    // Mês novo: avança para novembro, a extração volta para hoje e há aviso.
    ({ ctx, page, erros } = await abrir(perfil, "2026-12-04T09:00:00"));
    assert.strictEqual(await page.inputValue("#campo-mes"), "2026-11", "mês não avançou");
    assert.strictEqual(await page.inputValue("#campo-extracao"), "2026-12-04");
    assert.match(await page.textContent("#aviso"), /Mês novo/);
    assert.deepStrictEqual(erros, []);
    await ctx.close();
  } finally {
    await fecharTodos();
    fs.rmSync(perfil, { recursive: true, force: true });
  }
}

async function testeColagemEImpressao() {
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), "boletim-teste-"));
  try {
    const { ctx, page, erros } = await abrir(perfil, null);

    const html = `<html><head><style>.xl65{color:#ff0000;mso-number-format:General}</style></head><body>
      <table id="barra"><tr><td class="xl65" onclick="alert(1)" style="mso-ignore:padding;font-weight:700">10</td>
      <td><a href="javascript:alert(2)">link</a><img src="http://fora/x.png"><script>window.x=1</script></td></tr></table></body></html>`;
    const r = await page.evaluate((h) => Colar.deEvento({
      clipboardData: { items: [], getData: (t) => (t === "text/html" ? h : "") },
    }), html);
    assert.strictEqual(r.tipo, "tabela");
    for (const proibido of [/<script/i, /onclick/i, /\bid=/i, /class=/i, /mso-/i, /javascript:/i, /<a\b/i, /http:\/\/fora/]) {
      assert.doesNotMatch(r.html, proibido, `colagem ficou com ${proibido}`);
    }
    assert.match(r.html, /color:\s*(rgb\(255, 0, 0\)|#ff0000)/i, "perdeu a cor da classe do Excel");
    assert.match(r.html, /font-weight:\s*700/);

    // A medida das folhas para a impressão é a mesma numa janela larga e numa estreita.
    const medir = async (largura) => {
      await page.setViewportSize({ width: largura, height: 900 });
      await page.waitForTimeout(200);
      return page.evaluate(() => {
        document.body.classList.add("previa", "imprimindo");
        const alturas = [...document.querySelectorAll(".pagina")].map((p) => p.offsetHeight);
        document.body.classList.remove("previa", "imprimindo");
        return alturas;
      });
    };
    assert.deepStrictEqual(await medir(700), await medir(1400), "janela estreita muda a medida da impressão");
    assert.deepStrictEqual(erros, []);
    await ctx.close();
  } finally {
    await fecharTodos();
    fs.rmSync(perfil, { recursive: true, force: true });
  }
}

(async () => {
  await testeDatas();
  console.log("ok  datas (F5 e mês novo)");
  await testeColagemEImpressao();
  console.log("ok  colagem limpa e medida da impressão");
})().catch((e) => {
  console.error("FALHOU:", e.message);
  process.exit(1);
});
