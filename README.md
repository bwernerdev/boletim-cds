# Boletim CDs

Editor para montar o **Boletim Informativo – CDs MI** da Controladoria. Antes, o boletim era montado à mão no Word, com prints de cada tabela. Agora o Jorge abre esta página, cola as tabelas do Excel e gera o boletim do mês em HTML ou PDF.

Roda no navegador, sem servidor e sem internet. Os dados ficam só no computador de quem usa.

**Link:** https://bwernerdev.github.io/boletim-cds/

O link só entrega a página. As tabelas coladas não saem do navegador de quem usa e não vão para o GitHub.

## Como usar (todo mês)

1. Abra o link acima, ou o `index.html` com dois cliques (Edge ou Chrome). Cada endereço guarda os próprios dados: o que foi colado pelo link não aparece no arquivo local, e vice-versa.
2. Na barra do topo, confira o **Mês do boletim**. Ele começa no mês anterior ao atual. Preencha também a **Extração Quirius**.
3. Para cada quadro tracejado:
   - no Excel, selecione a tabela e copie (`Ctrl+C`);
   - na página, clique no quadro e cole (`Ctrl+V`).
   Cores, bordas e formatação condicional vêm junto. Para o Qlik ou outro sistema, tire um print (`Win+Shift+S`) e cole do mesmo jeito, ou arraste o arquivo de imagem para o quadro. O print é convertido para WebP e limitado a 1800 px de largura, para o boletim não ficar pesado: com 20 prints, cai de 12,6 MB para 4,8 MB.
4. Se a tabela ficar larga demais, use **−**, **+** ou **Ajustar** no quadro. Ao colar, ela já encolhe para caber.
5. Revise os trechos em **amarelo**. Eles dependem dos números do mês, como os CDs fora da meta. Clique no texto para editar e apague os colchetes `[ ]` quando estiver certo.
6. Clique em **Gerar boletim HTML**. Sai um arquivo único, `Boletim Informativo - CDs MI - MM-AAAA.html`, com imagens embutidas, pronto para enviar. **Imprimir / PDF** gera o PDF pelo navegador; escolha "Salvar como PDF".

O botão de progresso no topo mostra quantas tabelas do mês já foram coladas. Clique nele para ir à próxima vazia. Um quadro com tabela de outro mês fica **amarelo** e não entra no boletim até receber a tabela nova.

## Visual

O layout segue o boletim do Word:
- **Folhas:** 10 folhas, cada uma com moldura dourada, cabeçalho "Boletim Informativo {mês}/{ano}" com os logos Seara, Prevenção de Perdas e Controladoria, e a frase no rodapé.
- **Títulos:** faixa dourada nas seções principais.
- **Personagens:** grandes, com as tabelas e os textos seguintes ao lado deles enquanto houver altura.
- **Balões:** brancos, com borda escura, rabicho para o personagem e texto dourado com negrito.
- **Ilustrações:** clarinhas no canto das seções, como marca d'água.

**Movimento:** os personagens "respiram" e acenam ao passar o mouse. Balões, tabelas e personagens entram ao rolar a página (no Edge e no Chrome), e a faixa do título tem um brilho que passa. Tudo some na impressão e para quem desliga as animações no sistema.

Na impressão ou no PDF, cada folha vira uma página A4.

## Textos

Clique em qualquer fala ou parágrafo para editar. `**assim**` sai em negrito. Durante a edição aparecem os marcadores, que trocam sozinhos com o mês:

| Marcador | Exemplo (mês 10/2026) |
| --- | --- |
| `{mes}` / `{Mes}` / `{MES}` | outubro / Outubro / OUTUBRO |
| `{mm}` | 10 |
| `{aa}` / `{ano}` | 26 / 2026 |
| `{aa_ant}` / `{ano_ant}` / `{ano_prox}` | 25 / 2025 / 2027 |
| `{mes_ant}` / `{Mes_ant}` / `{aa_mes_ant}` | setembro / Setembro / 26 |
| `{data_extracao}` | 03/11/26 |

Texto alterado fica salvo e ganha o botão **Voltar ao texto padrão**. Os textos padrão estão em `app/conteudo.js`.

## O que fica salvo

Tabelas coladas, textos alterados e o mês escolhido ficam no IndexedDB do navegador. Valem para aquele navegador, naquele computador. Em janela anônima nada é salvo. **Limpar tabelas** apaga só as tabelas; os textos alterados continuam.

## Pastas

| Caminho | O que é |
| --- | --- |
| `index.html` | Página do editor e CSS do boletim (o mesmo CSS vai no HTML exportado). |
| `app/` | Scripts do editor, conteúdo das seções e imagens embutidas. Ver `app/README.md`. |
| `imagens/` | Personagens, logos e ilustrações em `.webp` (fonte do `app/imagens.js`). Ver `imagens/README.md`. |
| `ferramentas/` | Script que gera `app/imagens.js`. Ver `ferramentas/README.md`. |
| `.github/` | Publicação automática no GitHub Pages a cada push em `main`. Ver `.github/README.md`. |

## Trocar ou incluir personagem e imagem

1. Coloque o `.webp` (ou `.png`/`.jpg`) em `imagens/`. O nome do arquivo vira a chave, por exemplo `imagens/joao.webp` vira `joao`.
2. Rode `python ferramentas/gerar_imagens_js.py`.
3. Em `app/conteudo.js`, inclua o personagem em `PERSONAGENS` e use a chave nas falas (`personagem: "joao"`).

## Incluir ou mudar seção e tabela

Edite `window.SECOES` em `app/conteudo.js`. O campo `pagina` diz em qual folha a seção entra. Cada bloco precisa de um `id` único, porque é a chave da colagem ou do texto salvo. Trocar o `id` faz o quadro aparecer vazio.

Ao mudar qualquer arquivo de `app/`, aumente o `?v=` dos links no `index.html`. Assim o navegador de quem usa pega a versão nova, em vez da guardada em cache.
