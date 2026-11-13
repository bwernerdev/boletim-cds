# CLAUDE.md – boletim-cds

Editor HTML estático do Boletim Informativo mensal da Controladoria CDs MI. Substitui a montagem manual no Word, feita com prints das tabelas. O usuário cola as tabelas do Excel, e o editor gera um HTML único (ou PDF pela impressão).

## Mapa rápido

- `index.html`: estrutura do editor + `<style id="estilo-boletim">`, o CSS do boletim. A exportação copia o texto desse `<style>`, por isso ele **não** pode ir para um `.css` externo.
- `app/editor.css`: estilos só do editor (barra, quadros, ajuda). Não vai na exportação.
- `app/conteudo.js`: `PERSONAGENS` e `SECOES` (falas, textos, quadros de tabela). Textos com marcadores `{mes}`, `{ano}` etc.; `[trecho]` = pendente de revisão (amarelo).
- `app/app.js`: monta a página, marcadores, edição de texto, quadros, progresso e exportação (`htmlFinal`).
- `app/colar.js`: converte a colagem. HTML do Excel: aplica as regras do `<style>` (classes `.xlNN`) inline num iframe `sandbox="allow-same-origin"` sem scripts. Plano B: `semCss` com DOMParser. Também trata imagem e TSV.
- `app/armazenamento.js`: IndexedDB `boletim-cds` / loja `dados`. Chaves: `slot:<id>`, `texto:<id>`, `competencia`, `extracao`, `ajuda-fechada`. Abertura com timeout de 3 s; sem IndexedDB, usa a memória.
- `app/imagens.js`: **gerado**. `python ferramentas/gerar_imagens_js.py` a partir de `imagens/`.

## Convenções

- Sem build, sem dependências, sem CDN: precisa abrir com dois cliques (`file://`) na rede corporativa. Scripts clássicos (`<script src>`), não módulos ES (módulos não carregam em `file://`).
- Tudo em português do Brasil: código, textos e docs.
- Elementos com `.so-editor` somem na exportação e na impressão.
- O `id` de cada `tabela` em `SECOES` é a chave da colagem salva: não renomear à toa.
- Atualizar o `README.md` da pasta quando mudar arquivos dela.

## Testar

- Servidor local: configuração `boletim-cds` em `projetos/.claude/launch.json` (`python -m http.server 5517`).
- Também testar em `file://`, que é o uso real. O painel do navegador do app mostra `file://` só como snapshot estático. Use o Playwright do `giro-estoque/node_modules` com `channel: 'msedge'`.
- Excel real para gerar HTML de colagem: COM `Excel.Application` + `Range.Copy()` + `Clipboard.GetText(Html)`. O Excel já põe a formatação condicional inline no HTML.

## Repositório

Privado: `github.com/bwernerdev/boletim-cds`. O `gh` não está no PATH. Use o portátil do RPA: `RPA\ferramentas\gh\bin\gh.exe` com `$env:GH_CONFIG_DIR = "<projetos>\RPA\ferramentas\gh-config"`. O `git push` funciona direto, pelo Gerenciador de Credenciais.

## Origem

Modelo: `Boletim Informativo - CDs MI - 10-2025.docx` (15 seções, 9 personagens, cerca de 20 tabelas). Imagens extraídas do `.docx` e convertidas para `.webp`.
