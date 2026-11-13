// Editor do boletim: monta as seções, troca os marcadores de mês, recebe as
// colagens, salva tudo no navegador e gera o boletim final.

(() => {
  const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho",
    "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const ZOOM_MIN = 0.3;
  const ZOOM_MAX = 1.5;

  const $ = (sel, raiz = document) => raiz.querySelector(sel);
  const $$ = (sel, raiz = document) => Array.from(raiz.querySelectorAll(sel));
  const img = (nome) => (window.IMAGENS || {})[nome] || "";

  const estado = {
    competencia: "",   // "2026-10"
    extracao: "",      // "2026-11-03"
    textos: {},        // id -> modelo alterado pelo usuário
    cores: {},         // variável CSS -> cor escolhida (só as diferentes do padrão)
    slots: {},         // id -> { html, tipo, zoom, competencia, quando }
  };

  // ---------- Datas e marcadores ----------

  function competenciaPadrao() {
    const hoje = new Date();
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }
  function hojeIso() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  const maiuscula = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  function marcadores() {
    const [ano, mm] = estado.competencia.split("-").map(Number);
    const mesAnt = mm === 1 ? 12 : mm - 1;
    const anoMesAnt = mm === 1 ? ano - 1 : ano;
    const mes = MESES[mm - 1];
    let dataExtracao = "";
    if (estado.extracao) {
      const [a, m, d] = estado.extracao.split("-");
      dataExtracao = `${d}/${m}/${a.slice(2)}`;
    }
    return {
      mes, Mes: maiuscula(mes), MES: mes.toUpperCase(), mm: String(mm).padStart(2, "0"),
      aa: String(ano).slice(2), ano: String(ano),
      aa_ant: String(ano - 1).slice(2), ano_ant: String(ano - 1), ano_prox: String(ano + 1),
      mes_ant: MESES[mesAnt - 1], Mes_ant: maiuscula(MESES[mesAnt - 1]),
      aa_mes_ant: String(anoMesAnt).slice(2),
      data_extracao: dataExtracao || "[data da extração]",
    };
  }

  // Cores prontas para trechos de texto: {cor:vermelho}trecho{/cor}.
  // Também aceita código, como {cor:#ff0000}trecho{/cor}.
  const CORES_TEXTO = {
    vermelho: "#c00000",
    verde: "#00873e",
    azul: "#1f4e9a",
    laranja: "#e46c0a",
    preto: "#222222",
    dourado: "#b07d00",
  };
  // Cores gerais do boletim (variáveis do CSS) que o usuário pode trocar.
  const CORES_GERAIS = {
    "--ouro-texto": { rotulo: "Texto dos balões", padrao: "#b07d00" },
    "--ouro-forte": { rotulo: "Negrito", padrao: "#7a5600" },
    "--ouro": { rotulo: "Título da folha e moldura", padrao: "#bf8f00" },
    "--tinta": { rotulo: "Borda dos balões", padrao: "#333333" },
  };

  // Modelo -> HTML: escapa, troca {marcadores}, **negrito**, {cor:x}cor{/cor},
  // pinta [pendências], quebra linhas.
  function renderizar(modelo, m = marcadores()) {
    return Colar.escapar(modelo)
      .replace(/\{(\w+)\}/g, (todo, chave) => (chave in m ? Colar.escapar(m[chave]) : todo))
      .replace(/\{cor:(#[0-9a-fA-F]{6}|[a-z]+)\}([\s\S]*?)\{\/cor\}/g, (todo, cor, trecho) => {
        const valor = cor.startsWith("#") ? cor : CORES_TEXTO[cor];
        return valor ? `<span style="color:${valor}">${trecho}</span>` : trecho;
      })
      .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
      .replace(/\[([^\]\n]+)\]/g, '<span class="pendente">$1</span>')
      .replace(/\n/g, "<br>");
  }
  const textoSimples = (modelo, m) => modelo.replace(/\{(\w+)\}/g, (t, c) => (c in m ? m[c] : t));

  // ---------- Montagem da página ----------

  function montar() {
    const raiz = $("#boletim");
    const m = marcadores();
    // Agrupa as seções em folhas pelo número da página.
    const paginas = [];
    for (const secao of SECOES) {
      const ultima = paginas[paginas.length - 1];
      if (ultima && ultima.numero === secao.pagina) ultima.secoes.push(secao);
      else paginas.push({ numero: secao.pagina, secoes: [secao] });
    }
    let contadorFala = 0;
    const atraso = () => `animation-delay:-${((contadorFala++ * 1.7) % 5).toFixed(1)}s`;
    raiz.innerHTML = paginas.map((pg) => `
      <article class="pagina">
        <header class="pagina-topo">
          <div class="titulos">
            <h1 data-marcador="${Colar.escapar(BOLETIM.titulo)}"></h1>
            <p>${Colar.escapar(BOLETIM.subtitulo)}</p>
            <p>${Colar.escapar(BOLETIM.area)}</p>
          </div>
          <img src="${img("seara")}" alt="Seara">
          <img src="${img("prevencao")}" alt="Prevenção de Perdas">
          <img src="${img("controladoria")}" alt="Controladoria Administrativa CDs">
        </header>
        <div class="moldura">
          ${pg.secoes.map((s) => montarSecao(s, atraso)).join("")}
        </div>
        <p class="pagina-rodape">${Colar.escapar(BOLETIM.rodape)}</p>
      </article>`).join("");
    atualizarMarcadores(m);
    atualizarProgresso();
  }

  function montarSecao(secao, atraso) {
    return `
      <section class="secao" id="secao-${secao.id}">
        ${secao.deco ? `<img class="secao-deco" src="${img(secao.deco)}" alt="">` : ""}
        ${secao.titulo ? `<h2 class="faixa-titulo" data-marcador="${Colar.escapar(secao.titulo)}"></h2>` : ""}
        ${montarBlocos(secao.blocos, atraso)}
      </section>`;
  }

  // Duas tabelas "meia" seguidas viram um par lado a lado. Blocos depois de
  // uma fala ganham "depois-esq"/"depois-dir" para ficar ao lado de quem fala.
  function montarBlocos(blocos, atraso) {
    let html = "";
    let ladoFala = "";
    for (let i = 0; i < blocos.length; i++) {
      const b = blocos[i];
      const prox = blocos[i + 1];
      const depois = ladoFala ? `depois-${ladoFala}` : "";
      if (b.tipo === "fala") {
        ladoFala = b.lado === "dir" ? "dir" : "esq";
        html += montarBloco(b, atraso);
      } else if (b.largura === "meia" && prox && prox.largura === "meia") {
        html += `<div class="par ${depois}">${montarBloco(b, atraso)}${montarBloco(prox, atraso)}</div>`;
        i++;
      } else {
        html += montarBloco(b, atraso, depois);
      }
    }
    return html;
  }

  function montarBloco(b, atraso, classe = "") {
    if (b.tipo === "fala") {
      const p = PERSONAGENS[b.personagem];
      return `
        <div class="fala ${b.lado === "dir" ? "dir" : "esq"}">
          <div class="personagem">
            <img src="${img(b.personagem)}" alt="${Colar.escapar(p.nome)}" style="${atraso()}">
          </div>
          <div class="balao">${editavel(b)}</div>
        </div>`;
    }
    if (b.tipo === "texto") return `<div class="texto-livre ${classe}">${editavel(b)}</div>`;
    if (b.tipo === "link") {
      return `<div><a class="link-intranet" href="${Colar.escapar(b.href)}" target="_blank" rel="noopener">${Colar.escapar(b.texto)}</a></div>`;
    }
    if (b.tipo === "tabela") {
      return `
        <figure class="slot ${classe}" data-slot="${b.id}" tabindex="0"
                aria-label="Quadro para colar: ${Colar.escapar(b.rotulo)}">
          <div class="slot-barra so-editor">
            <span class="slot-rotulo" data-marcador="${Colar.escapar(b.rotulo)}"></span>
            <span class="slot-status"></span>
            <button type="button" class="secundario" data-acao="colar">Colar</button>
            <button type="button" class="secundario" data-acao="menor" title="Diminuir">−</button>
            <button type="button" class="secundario" data-acao="maior" title="Aumentar">+</button>
            <button type="button" class="secundario" data-acao="ajustar" title="Caber na largura">Ajustar</button>
            <button type="button" class="secundario" data-acao="remover">Remover</button>
          </div>
          ${b.legenda ? `<div class="slot-legenda" data-marcador="${Colar.escapar(b.legenda)}"></div>` : ""}
          <div class="slot-conteudo"></div>
        </figure>`;
    }
    return "";
  }

  function editavel(b) {
    return `
      <div class="editavel" data-texto="${b.id}" tabindex="0" title="Clique para editar"></div>
      <button type="button" class="restaurar so-editor" data-restaurar="${b.id}">Voltar ao texto padrão</button>`;
  }

  const blocoPorId = new Map();
  SECOES.forEach((s) => s.blocos.forEach((b) => b.id && blocoPorId.set(b.id, b)));
  const modeloDe = (id) => (id in estado.textos ? estado.textos[id] : blocoPorId.get(id).texto);

  function atualizarMarcadores(m = marcadores()) {
    $$("[data-marcador]").forEach((el) => { el.textContent = textoSimples(el.dataset.marcador, m); });
    $$(".editavel").forEach((el) => {
      if (el.classList.contains("editando")) return;
      el.innerHTML = renderizar(modeloDe(el.dataset.texto), m);
      el.parentElement.classList.toggle("texto-alterado", el.dataset.texto in estado.textos);
    });
    $$(".slot").forEach(desenharSlot);
    document.title = `Boletim CDs – ${m.Mes}/${m.aa} (editor)`;
  }

  // ---------- Quadros de tabela ----------

  function desenharSlot(fig) {
    const id = fig.dataset.slot;
    const dado = estado.slots[id];
    const conteudo = $(".slot-conteudo", fig);
    const status = $(".slot-status", fig);
    fig.classList.toggle("preenchido", !!dado);
    const antigo = !!dado && dado.competencia !== estado.competencia;
    fig.classList.toggle("antigo", antigo);
    $$('[data-acao="menor"], [data-acao="maior"], [data-acao="ajustar"], [data-acao="remover"]', fig)
      .forEach((bt) => { bt.hidden = !dado; });

    if (!dado) {
      conteudo.innerHTML = `<div class="slot-vazio so-editor">Clique aqui e cole (Ctrl+V) a tabela copiada do Excel<br>ou um print. Também dá para arrastar uma imagem.</div>`;
      status.textContent = "vazio";
      return;
    }
    if (conteudo.dataset.versao !== String(dado.quando)) {
      conteudo.innerHTML = `<div class="colado ${dado.tipo === "imagem" ? "imagem" : ""}">${dado.html}</div>`;
      conteudo.dataset.versao = String(dado.quando);
    }
    $(".colado", conteudo).style.zoom = dado.zoom || 1;
    const quando = new Date(dado.quando).toLocaleString("pt-BR",
      { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    status.textContent = antigo
      ? `é de ${rotuloCompetencia(dado.competencia)}: cole a deste mês`
      : `${Math.round((dado.zoom || 1) * 100)}%`;
    status.title = `Colado em ${quando}`;
  }

  function rotuloCompetencia(c) {
    if (!c) return "?";
    const [a, m] = c.split("-");
    return `${MESES[Number(m) - 1]}/${a.slice(2)}`;
  }

  // Reduz a tabela para caber no quadro (nunca aumenta além de 100%).
  function zoomQueCabe(fig) {
    const colado = $(".colado", fig);
    const conteudo = $(".slot-conteudo", fig);
    if (!colado) return 1;
    colado.style.zoom = 1;
    const largura = colado.getBoundingClientRect().width;
    const disponivel = conteudo.clientWidth;
    if (!largura || !disponivel) return 1;
    return Math.max(ZOOM_MIN, Math.min(1, Math.floor((disponivel / largura) * 100) / 100));
  }

  async function receber(fig, promessa) {
    let resultado;
    try {
      resultado = await promessa;
    } catch (erro) {
      avisar("Não consegui ler a área de transferência. Clique no quadro e use Ctrl+V.", true);
      return;
    }
    if (!resultado || !resultado.html) {
      avisar("Nada para colar. Copie a tabela no Excel (Ctrl+C) e tente de novo.", true);
      return;
    }
    const id = fig.dataset.slot;
    estado.slots[id] = { ...resultado, zoom: 1, competencia: estado.competencia, quando: Date.now() };
    desenharSlot(fig);
    estado.slots[id].zoom = zoomQueCabe(fig);
    desenharSlot(fig);
    await Armazenamento.gravar("slot:" + id, estado.slots[id]);
    atualizarProgresso();
    avisar(resultado.tipo === "imagem" ? "Imagem colada." : "Tabela colada.");
  }

  async function mudarZoom(fig, novo) {
    const dado = estado.slots[fig.dataset.slot];
    if (!dado) return;
    dado.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.round(novo * 100) / 100));
    desenharSlot(fig);
    await Armazenamento.gravar("slot:" + fig.dataset.slot, dado);
  }

  async function removerSlot(fig) {
    delete estado.slots[fig.dataset.slot];
    delete $(".slot-conteudo", fig).dataset.versao;
    desenharSlot(fig);
    await Armazenamento.apagar("slot:" + fig.dataset.slot);
    atualizarProgresso();
  }

  function slotsPendentes() {
    return $$(".slot").filter((fig) => {
      const d = estado.slots[fig.dataset.slot];
      return !d || d.competencia !== estado.competencia;
    });
  }

  function atualizarProgresso() {
    const total = $$(".slot").length;
    const feitos = total - slotsPendentes().length;
    $("#progresso-texto").textContent = `${feitos} de ${total} tabelas do mês`;
    $("#progresso-barra").style.width = total ? `${(feitos / total) * 100}%` : "0";
  }

  // ---------- Textos ----------

  function comecarEdicao(el) {
    if (el.classList.contains("editando")) return;
    el.classList.add("editando");
    el.textContent = modeloDe(el.dataset.texto);
    el.setAttribute("contenteditable", "plaintext-only");
    if (el.contentEditable !== "plaintext-only") el.setAttribute("contenteditable", "true");
    el.focus();
    mostrarBarraTexto(el);
  }

  // ---------- Barra de formatação (aparece ao editar um texto) ----------

  function criarBarraTexto() {
    const barra = document.createElement("div");
    barra.id = "barra-texto";
    barra.className = "barra-texto so-editor";
    barra.hidden = true;
    barra.innerHTML =
      `<button type="button" data-fmt="negrito" title="Negrito no trecho selecionado"><b>N</b></button>` +
      Object.entries(CORES_TEXTO).map(([nome, cor]) =>
        `<button type="button" class="amostra" data-cor="${nome}" title="Pintar de ${nome}" style="background:${cor}"></button>`).join("") +
      `<span class="barra-texto-dica">Selecione um trecho e clique</span>`;
    // mousedown sem foco: o texto continua em edição e a seleção não se perde.
    barra.addEventListener("mousedown", (e) => e.preventDefault());
    barra.addEventListener("click", (e) => {
      const bt = e.target.closest("button");
      const el = $(".editavel.editando");
      if (!bt || !el) return;
      const sel = window.getSelection();
      const trecho = sel && el.contains(sel.anchorNode) ? sel.toString() : "";
      const base = trecho || "texto";
      const novo = bt.dataset.fmt === "negrito" ? `**${base}**` : `{cor:${bt.dataset.cor}}${base}{/cor}`;
      if (!sel || !el.contains(sel.anchorNode)) {
        const r = document.createRange();
        r.selectNodeContents(el);
        r.collapse(false);
        sel.removeAllRanges();
        sel.addRange(r);
      }
      document.execCommand("insertText", false, novo);
    });
    document.body.appendChild(barra);
    return barra;
  }

  function mostrarBarraTexto(el) {
    const barra = $("#barra-texto") || criarBarraTexto();
    const r = el.getBoundingClientRect();
    barra.hidden = false;
    barra.style.left = `${Math.max(8, r.left + window.scrollX)}px`;
    barra.style.top = `${Math.max(8, r.top + window.scrollY - barra.offsetHeight - 8)}px`;
  }

  function esconderBarraTexto() {
    const barra = $("#barra-texto");
    if (barra) barra.hidden = true;
  }

  // ---------- Cores gerais ----------

  function aplicarCoresGerais() {
    for (const [nome, def] of Object.entries(CORES_GERAIS)) {
      const valor = estado.cores[nome];
      if (valor) document.documentElement.style.setProperty(nome, valor);
      else document.documentElement.style.removeProperty(nome);
      const campo = $(`#painel-cores input[data-var="${nome}"]`);
      if (campo) campo.value = valor || def.padrao;
    }
  }

  function montarPainelCores() {
    const painel = $("#painel-cores");
    painel.innerHTML =
      Object.entries(CORES_GERAIS).map(([nome, def]) =>
        `<label><input type="color" data-var="${nome}" value="${def.padrao}"> ${def.rotulo}</label>`).join("") +
      `<button type="button" class="secundario" id="botao-cores-padrao">Voltar às cores do Word</button>`;
    painel.addEventListener("input", async (e) => {
      const campo = e.target.closest("input[data-var]");
      if (!campo) return;
      const nome = campo.dataset.var;
      if (campo.value.toLowerCase() === CORES_GERAIS[nome].padrao) delete estado.cores[nome];
      else estado.cores[nome] = campo.value;
      aplicarCoresGerais();
      await Armazenamento.gravar("cores", estado.cores);
    });
    $("#botao-cores-padrao").addEventListener("click", async () => {
      estado.cores = {};
      aplicarCoresGerais();
      await Armazenamento.apagar("cores");
    });
    aplicarCoresGerais();
  }

  async function terminarEdicao(el) {
    if (!el.classList.contains("editando")) return;
    const id = el.dataset.texto;
    const novo = el.innerText.replace(/\u00a0/g, " ").replace(/\n{3,}/g, "\n\n").trim();
    el.classList.remove("editando");
    esconderBarraTexto();
    el.removeAttribute("contenteditable");
    if (novo === blocoPorId.get(id).texto || !novo) {
      delete estado.textos[id];
      await Armazenamento.apagar("texto:" + id);
    } else {
      estado.textos[id] = novo;
      await Armazenamento.gravar("texto:" + id, novo);
    }
    atualizarMarcadores();
  }

  // ---------- Exportação ----------

  function pendencias() {
    const faltam = slotsPendentes().map((fig) => "• " + $(".slot-rotulo", fig).textContent);
    const amarelos = $$(".editavel .pendente").length;
    return { faltam, amarelos };
  }

  function confirmarPendencias(acao) {
    const { faltam, amarelos } = pendencias();
    if (!faltam.length && !amarelos) return true;
    let msg = "";
    if (faltam.length) msg += `Faltam ${faltam.length} tabela(s) deste mês:\n${faltam.slice(0, 12).join("\n")}${faltam.length > 12 ? "\n..." : ""}\n\n`;
    if (amarelos) msg += `${amarelos} trecho(s) em amarelo ainda não revisado(s). Para tirar o amarelo, edite o texto e apague os colchetes [ ].\n\n`;
    msg += `${acao} assim mesmo? Quadros vazios ficam de fora.`;
    return confirm(msg);
  }

  function htmlFinal() {
    const m = marcadores();
    const copia = $("#boletim").cloneNode(true);
    copia.querySelectorAll(".so-editor").forEach((el) => el.remove());
    copia.querySelectorAll(".slot").forEach((fig) => {
      const d = estado.slots[fig.dataset.slot];
      if (!d || d.competencia !== estado.competencia) fig.remove();
    });
    copia.querySelectorAll(".pendente").forEach((el) => el.replaceWith(...el.childNodes));
    copia.querySelectorAll("[tabindex],[title],[contenteditable],[data-texto],[data-slot],[data-marcador],[data-versao],[aria-label]")
      .forEach((el) => ["tabindex", "title", "contenteditable", "data-texto", "data-slot", "data-marcador", "data-versao", "aria-label"]
        .forEach((a) => el.removeAttribute(a)));
    copia.querySelectorAll(".editavel").forEach((el) => el.classList.remove("editavel"));
    copia.querySelectorAll(".texto-alterado").forEach((el) => el.classList.remove("texto-alterado"));
    const coresTrocadas = Object.entries(estado.cores).map(([nome, valor]) => `${nome}:${valor}`).join(";");
    const css = $("#estilo-boletim").textContent + (coresTrocadas ? `\n:root{${coresTrocadas}}` : "");
    const titulo = `Boletim Informativo – CDs MI – ${m.Mes}/${m.ano}`;
    return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${Colar.escapar(titulo)}</title>
<style>${css}</style>
</head>
<body>
<main class="boletim">${copia.innerHTML}</main>
</body>
</html>`;
  }

  // Encerra a edição em andamento direto (o blur nem sempre dispara), para o
  // texto não sair com a marcação crua (**, {cor:...}).
  async function encerrarEdicoes() {
    for (const el of $$(".editavel.editando")) await terminarEdicao(el);
  }

  async function exportar() {
    await encerrarEdicoes();
    if (!confirmarPendencias("Gerar o boletim")) return;
    const m = marcadores();
    const blob = new Blob([htmlFinal()], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Boletim Informativo - CDs MI - ${m.mm}-${m.ano}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    avisar(`Boletim gerado: ${a.download}`);
  }

  async function imprimir() {
    await encerrarEdicoes();
    if (!confirmarPendencias("Imprimir")) return;
    // Quadros vazios não saem na impressão.
    const vazios = slotsPendentes();
    vazios.forEach((fig) => { fig.style.display = "none"; });
    window.print();
    vazios.forEach((fig) => { fig.style.display = ""; });
  }

  // ---------- Aviso ----------

  let temporizador;
  function avisar(msg, erro = false) {
    const el = $("#aviso");
    el.textContent = msg;
    el.classList.toggle("erro", erro);
    el.classList.add("mostrar");
    clearTimeout(temporizador);
    temporizador = setTimeout(() => el.classList.remove("mostrar"), erro ? 5000 : 2500);
  }

  // ---------- Eventos ----------

  function ligarEventos() {
    const boletim = $("#boletim");

    boletim.addEventListener("click", (e) => {
      const restaurar = e.target.closest("[data-restaurar]");
      if (restaurar) {
        const id = restaurar.dataset.restaurar;
        delete estado.textos[id];
        Armazenamento.apagar("texto:" + id);
        atualizarMarcadores();
        return;
      }
      const texto = e.target.closest(".editavel");
      if (texto) { comecarEdicao(texto); return; }

      const fig = e.target.closest(".slot");
      if (!fig) return;
      const acao = e.target.closest("[data-acao]")?.dataset.acao;
      const dado = estado.slots[fig.dataset.slot];
      if (acao === "colar") receber(fig, Colar.daAreaDeTransferencia());
      else if (acao === "menor" && dado) mudarZoom(fig, (dado.zoom || 1) - 0.05);
      else if (acao === "maior" && dado) mudarZoom(fig, (dado.zoom || 1) + 0.05);
      else if (acao === "ajustar" && dado) mudarZoom(fig, zoomQueCabe(fig));
      else if (acao === "remover") removerSlot(fig);
      else fig.focus();
    });

    boletim.addEventListener("keydown", (e) => {
      const texto = e.target.closest(".editavel");
      if (!texto) return;
      if (!texto.classList.contains("editando") && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        comecarEdicao(texto);
      } else if (texto.classList.contains("editando") && e.key === "Escape") {
        texto.blur();
      }
    });
    boletim.addEventListener("focusout", (e) => {
      const texto = e.target.closest?.(".editavel");
      if (texto) terminarEdicao(texto);
    });

    document.addEventListener("paste", (e) => {
      if (e.target.closest?.(".editavel.editando, input, textarea")) return;
      const fig = document.activeElement?.closest?.(".slot") || e.target.closest?.(".slot");
      if (!fig) {
        avisar("Clique primeiro no quadro onde a tabela deve entrar.", true);
        return;
      }
      e.preventDefault();
      receber(fig, Colar.deEvento(e));
    });

    boletim.addEventListener("dragover", (e) => {
      const fig = e.target.closest(".slot");
      if (!fig) return;
      e.preventDefault();
      fig.classList.add("arrastando");
    });
    boletim.addEventListener("dragleave", (e) => {
      e.target.closest(".slot")?.classList.remove("arrastando");
    });
    boletim.addEventListener("drop", (e) => {
      const fig = e.target.closest(".slot");
      if (!fig) return;
      e.preventDefault();
      fig.classList.remove("arrastando");
      receber(fig, Colar.deArquivo(e.dataTransfer.files[0]));
    });

    $("#campo-mes").addEventListener("change", async (e) => {
      if (!e.target.value) { e.target.value = estado.competencia; return; }
      estado.competencia = e.target.value;
      await Armazenamento.gravar("competencia", estado.competencia);
      atualizarMarcadores();
      atualizarProgresso();
    });
    $("#campo-extracao").addEventListener("change", async (e) => {
      estado.extracao = e.target.value;
      await Armazenamento.gravar("extracao", estado.extracao);
      atualizarMarcadores();
    });

    $("#botao-proxima").addEventListener("click", () => {
      const prox = slotsPendentes()[0];
      if (!prox) { avisar("Todas as tabelas do mês estão coladas."); return; }
      prox.scrollIntoView({ behavior: "smooth", block: "center" });
      prox.focus({ preventScroll: true });
    });
    $("#botao-limpar").addEventListener("click", async () => {
      if (!confirm("Apagar TODAS as tabelas coladas? Os textos editados continuam.")) return;
      for (const id of Object.keys(estado.slots)) await Armazenamento.apagar("slot:" + id);
      estado.slots = {};
      $$(".slot-conteudo").forEach((c) => delete c.dataset.versao);
      atualizarMarcadores();
      atualizarProgresso();
    });
    montarPainelCores();
    $("#botao-cores").addEventListener("click", () => {
      const painel = $("#painel-cores");
      painel.hidden = !painel.hidden;
      $("#botao-cores").setAttribute("aria-expanded", String(!painel.hidden));
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#painel-cores, #botao-cores")) $("#painel-cores").hidden = true;
    });
    $("#botao-exportar").addEventListener("click", exportar);
    $("#botao-pdf").addEventListener("click", imprimir);
    $("#botao-fechar-ajuda").addEventListener("click", () => {
      $("#ajuda").hidden = true;
      Armazenamento.gravar("ajuda-fechada", true);
    });
  }

  // ---------- Início ----------

  async function iniciar() {
    estado.competencia = (await Armazenamento.ler("competencia")) || competenciaPadrao();
    estado.extracao = (await Armazenamento.ler("extracao")) || hojeIso();
    for (const id of blocoPorId.keys()) {
      const b = blocoPorId.get(id);
      if (b.tipo === "tabela") {
        const s = await Armazenamento.ler("slot:" + id);
        if (s) estado.slots[id] = s;
      } else if (b.texto) {
        const t = await Armazenamento.ler("texto:" + id);
        if (t) estado.textos[id] = t;
      }
    }
    estado.cores = (await Armazenamento.ler("cores")) || {};
    if (await Armazenamento.ler("ajuda-fechada")) $("#ajuda").hidden = true;
    $("#campo-mes").value = estado.competencia;
    $("#campo-extracao").value = estado.extracao;
    montar();
    ligarEventos();
  }

  iniciar();
})();
