# CLAUDE.md – boletim-cds

Editor HTML estático do Boletim Informativo mensal da Controladoria CDs MI. Substitui a montagem manual no Word, feita com prints das tabelas. O usuário cola as tabelas do Excel, e o editor gera um HTML único (ou PDF pela impressão).

## Mapa rápido

- `index.html`: estrutura do editor + `<style id="estilo-boletim">`, o CSS do boletim. A exportação copia o texto desse `<style>`, por isso ele **não** pode ir para um `.css` externo.
- `app/editor.css`: estilos só do editor (barra, quadros, ajuda). Não vai na exportação.
- `app/conteudo.js`: `PERSONAGENS` e `SECOES` (falas, textos, quadros de tabela). Textos com marcadores `{mes}`, `{ano}` etc.; `[trecho]` = pendente de revisão (amarelo).
- `app/app.js`: monta a página, marcadores, edição de texto, quadros, progresso e exportação (`htmlFinal`).
- `app/colar.js`: converte a colagem. HTML do Excel: aplica as regras do `<style>` (classes `.xlNN`) inline num iframe `sandbox="allow-same-origin"` sem scripts. Plano B: `semCss` com DOMParser. Também trata imagem e TSV.
- `app/armazenamento.js`: IndexedDB `boletim-cds` / loja `dados`. Chaves: `slot:<id>`, `texto:<id>`, `cores`, `competencia`, `extracao`, `ajuda-fechada`. Abertura com timeout de 3 s; sem IndexedDB, usa a memória.
- `app/imagens.js`: **gerado**. `python ferramentas/gerar_imagens_js.py` a partir de `imagens/`.

## Layout (imita o .docx)

- `.pagina` = folha: cabeçalho com título dourado e 3 logos, `.moldura` com borda dourada e `.pagina-rodape` com a frase. As seções são agrupadas por `pagina` em `SECOES`.
- `.fala` usa `display: contents`, e `.personagem` faz float para o lado. `.fala.dir::before` limpa só a direita e `.fala.esq::before` só a esquerda: falas de lados opostos conversam sem buraco. Blocos depois de uma fala recebem `depois-esq`/`depois-dir` (em `montarBlocos`) e limpam o boneco do outro lado. Balão, texto e tabela são BFC (`flow-root`/flex) e encolhem ao lado do boneco. Duas tabelas `meia` seguidas viram `.par` (flex).
- Rabicho do balão: `::before` (triângulo escuro) + `::after` (triângulo branco que também apaga a borda), em `top: 50%`, com `.balao { min-height: 64px }` para cair no trecho reto da borda. Não voltar ao quadrado girado: ele pegava a curva do canto e abria.
- Cores: `CORES_TEXTO` (bolinhas da barrinha de edição, marcação `{cor:nome|#hex}...{/cor}`) e `CORES_GERAIS` (variáveis `--ouro-texto`, `--ouro-forte`, `--ouro`, `--tinta`, painel **Cores**). `htmlFinal` acrescenta `:root{...}` com as cores trocadas. Antes de exportar ou imprimir, `encerrarEdicoes()` chama `terminarEdicao` direto, porque o `blur()` nem sempre dispara e o texto sairia com a marcação crua.
- Tamanhos com `clamp()` e `cqi` (`.pagina` é `container-type: inline-size`): escalam com a largura da folha, não da tela. Cada regra tem antes a linha em px (plano B).
- Celular: `@media screen and (max-width: 760px)`. O `screen` é obrigatório: o A4 tem ~733 px e, sem ele, o PDF pegava o layout de celular (bonecos fora do lugar).
- Impressão: `.pagina` com 900 px (a mesma largura do miolo na tela) e `zoom: .81`. `zoomsImpressao()` (app.js) mede cada folha com `body.previa.imprimindo` e dá zoom menor à que passa de 1050 px. Vale no botão, no `Ctrl+P` (`beforeprint`/`afterprint`) e no HTML gerado (`htmlFinal` grava `@media print{#folha-N{zoom:…}}`). O `page.pdf()` do Playwright dispara `afterprint`.
- Animações só em CSS, para funcionar no HTML exportado (que não tem script): `respirar`, `acenar`, `brilho`, e entrada com `animation-timeline: view()` dentro de `@supports`. Respeitam `prefers-reduced-motion` e são desligadas na impressão.
- `editor.css` declara as próprias variáveis (`--borda`, `--azul`...), porque o `:root` do boletim não as tem. As `--e-*` são da moldura do editor (barra, índice, ajuda) e mudam no modo escuro; a folha continua branca. Tema em `localStorage` `boletim-cds:tema` (`claro`/`escuro`; vazio segue o sistema), aplicado em `html[data-tema]`.
- Barra: `#barra-mais` é `display: contents` no computador e vira o menu **⋯** abaixo de 1100 px. Índice `#indice` fixo à esquerda a partir de 1280 px, gaveta abaixo disso. `--barra-h` (altura da barra) é medida por `ResizeObserver`.
- Pré-visualização: `body.previa` esconde `.so-editor`, os quadros vazios ou de outro mês e o amarelo das pendências.
- Assets com `?v=N` no `index.html`: aumentar ao mudar `app/`, por causa do cache do Pages.
- Prints colados viram WebP 0,92 com no máximo 1800 px (`Colar.comprimir`).

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

PÚBLICO `github.com/bwernerdev/boletim-cds` (tornado público em 13/11/2026, por decisão do usuário, para o Jorge testar pelo link). Site: https://bwernerdev.github.io/boletim-cds/. O GitHub Pages é publicado por `.github/workflows/pages.yml` a cada push em `main`. Tudo o que entra no repositório fica visível na internet: nada de números, planilhas ou boletins exportados (`.gitignore`). As tabelas coladas ficam só no navegador de quem usa. O `gh` não está no PATH. Use o portátil do RPA: `RPA\ferramentas\gh\bin\gh.exe` com `$env:GH_CONFIG_DIR = "<projetos>\RPA\ferramentas\gh-config"`. O `git push` funciona direto, pelo Gerenciador de Credenciais.

## Origem

Modelo: `Boletim Informativo - CDs MI - 10-2025.docx` (10 páginas, 9 personagens, 20 tabelas). Imagens extraídas do `.docx` e convertidas para `.webp`: personagens recortados e com até 640 px de altura. No Word, Arailton é o de terno (image15) e Ezequias o de barba grisalha (image17). Para ver as páginas do Word como imagem: COM `Word.Application`, `Panes(1).Pages(i).EnhMetaFileBits` em `.emf`, aberto com PIL.
