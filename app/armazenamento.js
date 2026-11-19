// Guarda tabelas coladas, textos alterados e mês escolhido no IndexedDB do
// navegador. Se o IndexedDB falhar (janela anônima, bloqueio, espaço cheio),
// usa a memória: o editor continua funcionando, só não lembra nada ao
// recarregar. Nesse caso avisa quem registrou aoFalhar, para a tela mostrar
// que o trabalho não está sendo salvo.

window.Armazenamento = (() => {
  const NOME_BANCO = "boletim-cds";
  const LOJA = "dados";
  const ESPERA_ABRIR_MS = 3000;
  const memoria = new Map();
  let bancoPromessa = null;
  let falha = "";              // "" | "abrir" | "gravar"
  const ouvintes = [];

  function marcarFalha(motivo) {
    // "abrir" é a pior: nada desta sessão vai para o disco. Não rebaixa para "gravar".
    if (falha === "abrir") return;
    falha = motivo;
    ouvintes.forEach((fn) => fn(motivo));
  }

  function abrir() {
    if (bancoPromessa) return bancoPromessa;
    bancoPromessa = new Promise((resolve) => {
      let resolvido = false;
      const fim = (banco) => {
        if (resolvido) {
          // Abriu depois do tempo: a sessão já segue só na memória.
          if (banco) banco.close();
          return;
        }
        resolvido = true;
        if (!banco) marcarFalha("abrir");
        resolve(banco);
      };
      // Se o navegador não responder, segue sem salvar em vez de travar a tela.
      setTimeout(() => fim(null), ESPERA_ABRIR_MS);
      try {
        const pedido = indexedDB.open(NOME_BANCO, 1);
        pedido.onupgradeneeded = () => pedido.result.createObjectStore(LOJA);
        pedido.onsuccess = () => fim(pedido.result);
        pedido.onerror = () => fim(null);
        pedido.onblocked = () => fim(null);
      } catch {
        fim(null);
      }
    });
    return bancoPromessa;
  }

  async function ler(chave) {
    const banco = await abrir();
    let valor;
    if (banco) {
      valor = await new Promise((resolve) => {
        try {
          const pedido = banco.transaction(LOJA, "readonly").objectStore(LOJA).get(chave);
          pedido.onsuccess = () => resolve(pedido.result);
          pedido.onerror = () => resolve(undefined);
        } catch {
          resolve(undefined);
        }
      });
    }
    return valor !== undefined ? valor : memoria.get(chave);
  }

  // A gravação só conta quando a transação termina (oncomplete). O sucesso do
  // pedido vem antes disso, e o erro de espaço cheio aparece só no abort.
  async function escrever(acao) {
    const banco = await abrir();
    if (!banco) return false;
    const ok = await new Promise((resolve) => {
      try {
        const transacao = banco.transaction(LOJA, "readwrite");
        transacao.oncomplete = () => resolve(true);
        transacao.onabort = () => resolve(false);
        acao(transacao.objectStore(LOJA));
      } catch {
        resolve(false);
      }
    });
    if (!ok) marcarFalha("gravar");
    return ok;
  }

  return {
    ler,
    // Devolve true se ficou salvo no navegador; false se ficou só na memória.
    async gravar(chave, valor) {
      memoria.set(chave, valor);
      return escrever((l) => l.put(valor, chave));
    },
    async apagar(chave) {
      memoria.delete(chave);
      return escrever((l) => l.delete(chave));
    },
    // fn(motivo) é chamada quando algo deixa de ser salvo: "abrir" (o banco
    // não abriu) ou "gravar" (uma gravação falhou, por exemplo sem espaço).
    aoFalhar(fn) {
      ouvintes.push(fn);
      if (falha) fn(falha);
    },
    get falha() { return falha; },
  };
})();
