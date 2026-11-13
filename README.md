# Boletim CDs

Editor para montar o **Boletim Informativo – CDs MI** da Controladoria. Antes, o boletim era montado à mão no Word, com prints de cada tabela. Agora o Jorge abre esta página, cola as tabelas do Excel e gera o boletim do mês em HTML ou PDF.

Roda no navegador, sem servidor e sem internet. Os dados ficam só no computador de quem usa.

## Como usar (todo mês)

1. Abra o `index.html` com dois cliques (Edge ou Chrome).
2. Na barra do topo, confira o **Mês do boletim**. Ele começa no mês anterior ao atual. Preencha também a **Extração Quirius**.
3. Para cada quadro tracejado:
   - no Excel, selecione a tabela e copie (`Ctrl+C`);
   - na página, clique no quadro e cole (`Ctrl+V`).
   Cores, bordas e formatação condicional vêm junto. Para o Qlik ou outro sistema, tire um print (`Win+Shift+S`) e cole do mesmo jeito, ou arraste o arquivo de imagem para o quadro.
4. Se a tabela ficar larga demais, use **−**, **+** ou **Ajustar** no quadro. Ao colar, ela já encolhe para caber.
5. Revise os trechos em **amarelo**. Eles dependem dos números do mês, como os CDs fora da meta. Clique no texto para editar e apague os colchetes `[ ]` quando estiver certo.
6. Clique em **Gerar boletim HTML**. Sai um arquivo único, `Boletim Informativo - CDs MI - MM-AAAA.html`, com imagens embutidas, pronto para enviar. **Imprimir / PDF** gera o PDF pelo navegador; escolha "Salvar como PDF".

O botão de progresso no topo mostra quantas tabelas do mês já foram coladas. Clique nele para ir à próxima vazia. Um quadro com tabela de outro mês fica **amarelo** e não entra no boletim até receber a tabela nova.

## Textos

Clique em qualquer fala ou parágrafo para editar. Durante a edição aparecem os marcadores, que trocam sozinhos com o mês:

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

## Trocar ou incluir personagem e imagem

1. Coloque o `.webp` (ou `.png`/`.jpg`) em `imagens/`. O nome do arquivo vira a chave, por exemplo `imagens/joao.webp` vira `joao`.
2. Rode `python ferramentas/gerar_imagens_js.py`.
3. Em `app/conteudo.js`, inclua o personagem em `PERSONAGENS` e use a chave nas falas (`personagem: "joao"`).

## Incluir ou mudar seção e tabela

Edite `window.SECOES` em `app/conteudo.js`. Cada `tabela` precisa de um `id` único, porque é a chave da colagem salva. Trocar o `id` faz o quadro aparecer vazio.
