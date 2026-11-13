// Converte o que veio da área de transferência em HTML pronto para o boletim.
//
// Excel: o HTML copiado traz um <style> com classes (.xl65, .xl66...) que
// carregam cores, bordas e fontes. Essas classes repetem entre colagens e
// vazariam para a página toda, então cada regra é aplicada direto no
// atributo style das células e o <style> é descartado.
// Print (Win+Shift+S, Qlik): vira <img> com a imagem embutida.
// Texto solto (TSV): vira uma tabela simples.

window.Colar = (() => {
  const TAGS_FORA = "script, style, meta, link, title, xml, o\\:p, iframe, object, embed";

  function escapar(texto) {
    return String(texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Abre o HTML num iframe invisível para o navegador interpretar o CSS do Excel.
  function comCssAplicado(html) {
    const quadro = document.createElement("iframe");
    quadro.style.cssText = "position:absolute;width:0;height:0;border:0;visibility:hidden";
    // Sem allow-scripts: nada que vier colado consegue executar código.
    quadro.setAttribute("sandbox", "allow-same-origin");
    document.body.appendChild(quadro);
    try {
      const doc = quadro.contentDocument;
      if (!doc) throw new Error("iframe sem documento");
      doc.open();
      doc.write(html);
      doc.close();

      const estilosPorElemento = new Map();
      for (const folha of Array.from(doc.styleSheets)) {
        let regras;
        try { regras = folha.cssRules; } catch { continue; }
        for (const regra of Array.from(regras)) {
          if (!(regra instanceof quadro.contentWindow.CSSStyleRule)) continue;
          let alvos;
          try { alvos = doc.body.querySelectorAll(regra.selectorText); } catch { continue; }
          for (const el of alvos) {
            if (!estilosPorElemento.has(el)) estilosPorElemento.set(el, []);
            estilosPorElemento.get(el).push(regra.style.cssText);
          }
        }
      }
      // Regras na ordem do <style>; o style próprio do elemento vence no fim.
      for (const [el, lista] of estilosPorElemento) {
        const proprio = el.getAttribute("style") || "";
        el.setAttribute("style", lista.join(";") + ";" + proprio);
      }

      doc.body.querySelectorAll(TAGS_FORA).forEach((el) => el.remove());
      for (const el of doc.body.querySelectorAll("*")) {
        el.removeAttribute("class");
        el.removeAttribute("id");
        for (const attr of Array.from(el.attributes)) {
          if (/^on/i.test(attr.name)) el.removeAttribute(attr.name);
          if (/^x:|^v:|^o:/i.test(attr.name)) el.removeAttribute(attr.name);
        }
        // Remove propriedades mso-* que sobraram e limpa o atributo.
        const st = el.getAttribute("style");
        if (st) {
          const limpo = st.split(";").filter((p) => p.trim() && !/^\s*mso-/i.test(p)).join(";");
          if (limpo) el.setAttribute("style", limpo);
          else el.removeAttribute("style");
        }
      }
      // Links e imagens externas não funcionam fora da rede da empresa.
      doc.body.querySelectorAll("a").forEach((a) => a.replaceWith(...a.childNodes));
      doc.body.querySelectorAll("img").forEach((img) => {
        if (!/^data:/i.test(img.getAttribute("src") || "")) img.remove();
      });

      return doc.body.innerHTML.replace(/<!--(StartFragment|EndFragment)-->/g, "").trim();
    } catch {
      return semCss(html);
    } finally {
      quadro.remove();
    }
  }

  // Plano B se o navegador não deixar usar o iframe: perde as cores que vêm
  // das classes do Excel, mas mantém a tabela e os estilos próprios das células.
  function semCss(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    doc.body.querySelectorAll(TAGS_FORA).forEach((el) => el.remove());
    for (const el of doc.body.querySelectorAll("*")) {
      for (const attr of Array.from(el.attributes)) {
        if (attr.name === "class" || /^on/i.test(attr.name) || /^(x|v|o):/i.test(attr.name)) el.removeAttribute(attr.name);
      }
    }
    doc.body.querySelectorAll("a").forEach((a) => a.replaceWith(...a.childNodes));
    doc.body.querySelectorAll("img").forEach((img) => {
      if (!/^data:/i.test(img.getAttribute("src") || "")) img.remove();
    });
    return doc.body.innerHTML.replace(/<!--(StartFragment|EndFragment)-->/g, "").trim();
  }

  function tabelaDeTexto(texto) {
    const linhas = texto.replace(/\r/g, "").replace(/\n+$/, "").split("\n");
    const corpo = linhas
      .map((linha) =>
        "<tr>" +
        linha.split("\t").map((c) => `<td style="border:1px solid #c9ced8;padding:2px 8px">${escapar(c)}</td>`).join("") +
        "</tr>"
      )
      .join("");
    return `<table style="font:13px Calibri,Arial,sans-serif">${corpo}</table>`;
  }

  function lerArquivoComoUrl(arquivo) {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.onload = () => resolve(leitor.result);
      leitor.onerror = () => reject(leitor.error);
      leitor.readAsDataURL(arquivo);
    });
  }

  // Prints em PNG pesam muito (20 prints deram 12 MB). Converte para WebP de
  // alta qualidade e limita a largura; fica com o original se não diminuir.
  const LARGURA_MAX = 1800;
  async function comprimir(url) {
    try {
      const imagem = await new Promise((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = reject;
        el.src = url;
      });
      const fator = Math.min(1, LARGURA_MAX / imagem.naturalWidth);
      const tela = document.createElement("canvas");
      tela.width = Math.round(imagem.naturalWidth * fator);
      tela.height = Math.round(imagem.naturalHeight * fator);
      const ctx = tela.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, tela.width, tela.height);
      ctx.drawImage(imagem, 0, 0, tela.width, tela.height);
      const webp = tela.toDataURL("image/webp", 0.92);
      return webp.startsWith("data:image/webp") && webp.length < url.length ? webp : url;
    } catch {
      return url;
    }
  }

  async function deImagem(arquivo) {
    const url = await comprimir(await lerArquivoComoUrl(arquivo));
    return { tipo: "imagem", html: `<img src="${url}" alt="">` };
  }

  // Ordem de preferência: tabela HTML > imagem > texto.
  async function deDados({ html, imagem, texto }) {
    if (html && /<table/i.test(html)) return { tipo: "tabela", html: comCssAplicado(html) };
    if (imagem) return deImagem(imagem);
    if (html && html.trim()) {
      const limpo = comCssAplicado(html);
      if (limpo) return { tipo: "tabela", html: limpo };
    }
    if (texto && texto.trim()) return { tipo: "tabela", html: tabelaDeTexto(texto) };
    return null;
  }

  return {
    // Evento paste (Ctrl+V).
    deEvento(evento) {
      const dt = evento.clipboardData;
      if (!dt) return Promise.resolve(null);
      const imagemItem = Array.from(dt.items || []).find((i) => i.kind === "file" && i.type.startsWith("image/"));
      return deDados({
        html: dt.getData("text/html"),
        imagem: imagemItem ? imagemItem.getAsFile() : null,
        texto: dt.getData("text/plain"),
      });
    },
    // Botão "Colar" (API assíncrona; o navegador pode pedir permissão).
    async daAreaDeTransferencia() {
      const itens = await navigator.clipboard.read();
      let html = "", imagem = null, texto = "";
      for (const item of itens) {
        if (item.types.includes("text/html")) html = await (await item.getType("text/html")).text();
        const tipoImg = item.types.find((t) => t.startsWith("image/"));
        if (tipoImg && !imagem) imagem = await item.getType(tipoImg);
        if (item.types.includes("text/plain")) texto = await (await item.getType("text/plain")).text();
      }
      return deDados({ html, imagem, texto });
    },
    // Arquivo de imagem arrastado para o quadro.
    deArquivo(arquivo) {
      if (!arquivo || !arquivo.type.startsWith("image/")) return Promise.resolve(null);
      return deImagem(arquivo);
    },
    escapar,
  };
})();
