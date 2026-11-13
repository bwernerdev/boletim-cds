# app/

Scripts e estilos do editor. Carregados pelo `index.html` como scripts clássicos, nesta ordem.

| Arquivo | O que faz |
| --- | --- |
| `imagens.js` | **Gerado** por `ferramentas/gerar_imagens_js.py`. `window.IMAGENS` com cada imagem de `imagens/` em base64. Não editar à mão. |
| `conteudo.js` | `window.PERSONAGENS` (nome e cargo) e `window.SECOES` (seções, falas, textos, quadros de tabela e link). Os textos padrão e os marcadores (`{mes}`, `{ano}`...) estão aqui. |
| `armazenamento.js` | `window.Armazenamento`: ler, gravar e apagar no IndexedDB, com a memória como plano B. |
| `colar.js` | `window.Colar`: transforma a colagem (HTML do Excel, imagem ou texto) em HTML limpo, com o CSS do Excel aplicado inline. |
| `app.js` | Monta o boletim, troca os marcadores, edita textos, recebe colagens, mostra o progresso e exporta HTML e impressão. |
| `editor.css` | Visual só do editor: barra do topo, ajuda, quadros de colar, avisos. O CSS do boletim fica no `index.html`. |
