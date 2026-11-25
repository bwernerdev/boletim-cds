# ferramentas/

Scripts de manutenção. Não são usados no dia a dia do boletim.

| Arquivo | O que faz |
| --- | --- |
| `gerar_imagens_js.py` | Lê `imagens/*.webp\|png\|jpg` e gera `app/imagens.js` com tudo em base64 (`window.IMAGENS`). Rodar na raiz do projeto: `python ferramentas/gerar_imagens_js.py`. Só usa a biblioteca padrão do Python. |
| `teste.cjs` | Teste de ponta a ponta no Edge, por `file://`: data da extração depois do F5, virada do mês, limpeza da colagem do Excel e medida das folhas para a impressão numa janela estreita. Rodar na raiz: `node ferramentas/teste.cjs` (usa o Playwright do `giro-estoque`, ou o caminho em `PLAYWRIGHT`). Rodar antes de cada push que mexa em `app/` ou no `index.html`. |
