// Guarda tabelas coladas, textos alterados e mês escolhido no IndexedDB do
// navegador. Se o IndexedDB falhar (janela anônima, bloqueio), usa a memória:
// o editor continua funcionando, só não lembra nada ao recarregar.

window.Armazenamento = (() => {
  const NOME_BANCO = "boletim-cds";
  const LOJA = "dados";
  const memoria = new Map();
  let bancoPromessa = null;

  function abrir() {
    if (bancoPromessa) return bancoPromessa;
    bancoPromessa = new Promise((resolve) => {
      // Se o navegador não responder, segue sem salvar em vez de travar a tela.
      setTimeout(() => resolve(null), 3000);
      try {
        const pedido = indexedDB.open(NOME_BANCO, 1);
        pedido.onupgradeneeded = () => pedido.result.createObjectStore(LOJA);
        pedido.onsuccess = () => resolve(pedido.result);
        pedido.onerror = () => resolve(null);
        pedido.onblocked = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
    return bancoPromessa;
  }

  async function operar(modo, acao) {
    const banco = await abrir();
    if (!banco) return undefined;
    return new Promise((resolve) => {
      try {
        const loja = banco.transaction(LOJA, modo).objectStore(LOJA);
        const pedido = acao(loja);
        pedido.onsuccess = () => resolve(pedido.result);
        pedido.onerror = () => resolve(undefined);
      } catch {
        resolve(undefined);
      }
    });
  }

  return {
    async ler(chave) {
      const valor = await operar("readonly", (l) => l.get(chave));
      return valor !== undefined ? valor : memoria.get(chave);
    },
    async gravar(chave, valor) {
      memoria.set(chave, valor);
      await operar("readwrite", (l) => l.put(valor, chave));
    },
    async apagar(chave) {
      memoria.delete(chave);
      await operar("readwrite", (l) => l.delete(chave));
    },
  };
})();
