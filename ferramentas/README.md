# ferramentas/

Scripts de manutenção. Não são usados no dia a dia do boletim.

| Arquivo | O que faz |
| --- | --- |
| `gerar_imagens_js.py` | Lê `imagens/*.webp\|png\|jpg` e gera `app/imagens.js` com tudo em base64 (`window.IMAGENS`). Rodar na raiz do projeto: `python ferramentas/gerar_imagens_js.py`. Só usa a biblioteca padrão do Python. |
