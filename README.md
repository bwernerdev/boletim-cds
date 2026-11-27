# Boletim CDs
Editor do **Boletim Informativo – CDs MI** da Controladoria: cola as tabelas do Excel e gera o boletim do mês em HTML ou PDF. Roda no navegador, sem servidor; os dados ficam só no computador de quem usa (nada vai ao GitHub).

**Link:** https://bwernerdev.github.io/boletim-cds/ (só entrega a página). Também abre `index.html` com dois cliques; cada endereço guarda os próprios dados.

## Uso mensal
1. Confira o **Mês do boletim** (começa no mês anterior e avança sozinho no mês novo, com aviso e data da extração = hoje; mês escolhido à mão vale até o fim dele) e a **Extração Quirius**.
2. Para cada quadro tracejado: copie a tabela no Excel (`Ctrl+C`) e cole no quadro (`Ctrl+V`); cores e formatação vêm junto. Qlik/outro sistema: print (`Win+Shift+S`) e cole, ou arraste a imagem. O print vira WebP de até 1800 px (20 prints: 12,6 → 4,8 MB).
3. Tabela larga: **−**, **+** ou **Ajustar** no quadro (ao colar já encolhe).
4. Revise os trechos **amarelos** (dependem dos números do mês, ex.: CDs fora da meta): edite e apague os `[ ]`.
5. **Gerar boletim HTML** cria `Boletim Informativo - CDs MI - MM-AAAA.html`, arquivo único com imagens embutidas. **Imprimir / PDF** usa o navegador ("Salvar como PDF").

- Botão de progresso no topo: tabelas coladas no mês; clique vai à próxima vazia. A linha embaixo vai de amarelo a verde.
- Quadro **amarelo** = tabela de outro mês; não entra no boletim até receber a nova.
- **Índice das folhas** (fixo à esquerda em tela larga; ☰ nas menores): 10 folhas, tabelas com ✓ colada, ○ vazia, ! outro mês.
- **Pré-visualizar** mostra o boletim final; **Voltar à edição** ou `Esc` volta.
- Telas estreitas: mês, extração e botões secundários no menu **⋯**. A lua alterna o modo escuro do editor (o boletim fica claro).

## Visual
- 10 folhas com moldura dourada, cabeçalho "Boletim Informativo {mês}/{ano}" (logos Seara, Prevenção de Perdas, Controladoria) e frase no rodapé; faixa dourada nos títulos; ilustrações clarinhas como marca d'água.
- Personagens grandes com tabelas e textos ao lado; duas falas de lados opostos (Morlus e Lechinski): a segunda começa logo abaixo do primeiro balão. Balões brancos, borda escura, texto dourado em negrito.
- Movimento (personagens, entrada ao rolar, brilho no título) some na impressão e com animações desligadas no sistema.
- Impressão/PDF: uma folha = uma página A4 (mesmo layout do computador); folha mais alta que o A4 é reduzida, no `Ctrl+P` e no HTML gerado.
- Celular: boneco menor sobre o balão; tabela larga rola de lado, com sombra na borda.

## Textos
Clique em fala ou parágrafo para editar; `**assim**` = negrito. Marcadores trocam com o mês:

| Marcador | Exemplo (10/2026) |
| --- | --- |
| `{mes}` / `{Mes}` / `{MES}` | outubro / Outubro / OUTUBRO |
| `{mm}` | 10 |
| `{aa}` / `{ano}` | 26 / 2026 |
| `{aa_ant}` / `{ano_ant}` / `{ano_prox}` | 25 / 2025 / 2027 |
| `{mes_ant}` / `{Mes_ant}` / `{aa_mes_ant}` | setembro / Setembro / 26 |
| `{data_extracao}` | 03/11/26 |

Texto alterado ganha **Voltar ao texto padrão**. Padrões em `app/conteudo.js`.

## Cores das fontes
- **Trecho:** selecione no texto em edição; **N** = negrito, bolinhas pintam (vermelho, verde, azul, laranja, preto, dourado). Fica `{cor:vermelho}trecho{/cor}` ou `{cor:#ff0000}trecho{/cor}`.
- **Boletim todo:** botão **Cores** (texto dos balões, negrito, título, moldura, borda dos balões). **Voltar às cores do Word** desfaz.
- Ambas ficam salvas e saem no HTML e no PDF.

## O que fica salvo
- Tabelas, textos, cores e mês: IndexedDB do navegador (por navegador e computador; janela anônima não salva).
- Se não salvar (banco não abre em 3 s ou sem espaço): **faixa vermelha** no topo; o que está na tela some ao fechar, então gere o boletim antes. Com a faixa, fechar a aba pede confirmação.
- **Limpar tabelas** apaga só as tabelas; textos alterados ficam.

## Pastas
| Caminho | O que é |
| --- | --- |
| `index.html` | Editor e CSS do boletim (o mesmo CSS vai no HTML exportado) |
| `app/` | Scripts, conteúdo das seções e imagens embutidas (`app/README.md`) |
| `imagens/` | Personagens, logos e ilustrações `.webp`, fonte do `app/imagens.js` (`imagens/README.md`) |
| `ferramentas/` | Gera `app/imagens.js` (`ferramentas/README.md`) |
| `.github/` | Publica no GitHub Pages a cada push em `main` (`.github/README.md`) |

## Trocar ou incluir personagem/imagem
1. Ponha o `.webp` (ou `.png`/`.jpg`) em `imagens/`; o nome vira a chave (`joao.webp` → `joao`).
2. `python ferramentas/gerar_imagens_js.py`
3. Em `app/conteudo.js`, inclua em `PERSONAGENS` e use a chave nas falas (`personagem: "joao"`).

## Incluir ou mudar seção/tabela
- Edite `window.SECOES` em `app/conteudo.js`; `pagina` = folha da seção.
- Cada bloco tem `id` único (chave da colagem/texto salvo). Trocar o `id` esvazia o quadro.
- Mudou qualquer arquivo de `app/`: aumente o `?v=` dos links no `index.html` (senão o cache serve a versão velha).
