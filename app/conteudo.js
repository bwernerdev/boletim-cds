// Estrutura do boletim: seções, falas dos personagens, textos e lugares das tabelas.
//
// Marcadores trocados sozinhos pelo mês escolhido na barra do topo:
//   {mes} outubro · {Mes} Outubro · {MES} OUTUBRO · {mm} 10
//   {aa} 26 · {ano} 2026 · {aa_ant} 25 · {ano_ant} 2025 · {ano_prox} 2027
//   {mes_ant} setembro · {Mes_ant} Setembro · {aa_mes_ant} ano (2 dígitos) do mês anterior
//   {data_extracao} data da extração do Quirius (dd/mm/aa)
// Trechos entre [colchetes] dependem dos números do mês: aparecem em amarelo
// no editor e a exportação avisa se algum ficou sem revisar.
//
// Tipos de bloco:
//   fala    personagem + balão (lado "dir" põe o personagem à direita)
//   texto   parágrafo solto
//   tabela  lugar para colar a tabela do Excel ou um print
//           (largura "meia" coloca duas lado a lado; "legenda" sai no boletim)
//   link    endereço clicável

window.PERSONAGENS = {
  morlus: { nome: "Morlus", cargo: "Controladoria CDs" },
  borba: { nome: "Borba", cargo: "Gerente regional" },
  lechinski: { nome: "Lechinski", cargo: "HUB Itajaí" },
  ezequias: { nome: "Ezequias", cargo: "CD Cabo Sto Agostinho - PE" },
  arailton: { nome: "Arailton", cargo: "CD Aquiraz - CE" },
  leonardo: { nome: "Leonardo", cargo: "CD Cambé - PR" },
  cleia: { nome: "Cleia", cargo: "CD Salvador - BA" },
  paulo: { nome: "Paulo", cargo: "CD Nova Santa Rita - RS" },
  valeria: { nome: "Valéria", cargo: "CD Duque de Caxias - RJ" },
};

window.SECOES = [
  {
    id: "abertura",
    titulo: "Números finais estoques – {mes}/{aa}",
    deco: "goal",
    blocos: [
      {
        tipo: "fala", id: "abertura-morlus", personagem: "morlus",
        texto: "Olá!!! Eu sou o Morlus, esse é o nosso BOLETIM INFORMATIVO da controladoria nos CDs. Vamos acompanhar alguns números que registramos no mês de {mes}?",
      },
    ],
  },
  {
    id: "congelamento-mensal",
    titulo: "Congelamento de estoques mês a mês",
    deco: "escada",
    blocos: [
      {
        tipo: "fala", id: "cong-mensal-morlus", personagem: "morlus",
        texto: "Aqui apresentamos o congelamento de estoques em cada CD com controladoria mês a mês em {ano}. Falamos de contábil vs físico dos estoques... A meta é no máximo 0,35%.",
      },
      { tipo: "tabela", id: "cong-mensal", rotulo: "Congelamento mês a mês por CD (ranking JAN a DEZ)" },
    ],
  },
  {
    id: "media-regional",
    titulo: "Média da regional em {ano}",
    blocos: [
      {
        tipo: "fala", id: "media-borba", personagem: "borba", lado: "dir",
        texto: "Eu sou o Borba, gerente regional dos CDs com Controladoria. Vamos ver como anda a média da regional em {ano}?",
      },
      { tipo: "tabela", id: "media-atual", largura: "meia", rotulo: "Ranking do mês atual", legenda: "{Mes}/{aa}" },
      { tipo: "tabela", id: "media-anterior", largura: "meia", rotulo: "Ranking do mês anterior", legenda: "{Mes_ant}/{aa_mes_ant}" },
      {
        tipo: "texto", id: "media-comentario",
        texto: "Entre {mes_ant} e {mes} [não melhoramos e nem pioramos]...\nAos líderes que recebem esses números: se atentem aos fora de meta.",
      },
    ],
  },
  {
    id: "congelamento-diario",
    titulo: "Congelamento dia a dia – {mes}/{aa}",
    blocos: [
      { tipo: "tabela", id: "cong-diario", rotulo: "Congelamento contábil vs físico – dia a dia" },
      {
        tipo: "fala", id: "cong-diario-morlus", personagem: "morlus",
        texto: "Olhem esse quadro acima de mim: ele mostra o percentual de congelamento do contábil e físico dos estoques registrado em cada dia do mês de {mes} nos CDs, assim se formando a média de congelamento que encontramos na primeira tabela deste boletim... Detalhe: os que estão em vermelho são os dias em que perdemos a meta de 0,35%...\nFechamos o mês de {mes} com [CDA e Itajaí] fora da meta.",
      },
    ],
  },
  {
    id: "hub",
    titulo: "Números do HUB",
    blocos: [
      {
        tipo: "fala", id: "hub-morlus", personagem: "morlus",
        texto: "Chegou a hora de ver como fechamos {mes} de {ano} no HUB! Bora, Lechinski... ver os números de ajustes e conciliação de estoques?",
      },
      {
        tipo: "fala", id: "hub-lechinski", personagem: "lechinski", lado: "dir",
        texto: "Positivo! Vamos acompanhar... Vejam as tabelas abaixo!",
      },
      { tipo: "tabela", id: "hub-congelamento", rotulo: "HUB – % de congelamento mês a mês" },
      {
        tipo: "texto", id: "hub-texto-1",
        texto: "Nesta primeira tabela temos nosso % de congelamento de estoques contábil e físico mês a mês e já com o acumulado de {ano}. Sempre comparando com os números do ano anterior.",
      },
      { tipo: "tabela", id: "hub-ajustes", rotulo: "HUB – % e R$ de ajustes de estoques" },
      {
        tipo: "texto", id: "hub-texto-2",
        texto: "Nessa segunda tabela temos o % de ajustes de estoques no HUB e o valor em R$ que corresponde a esse percentual... também com o comparativo do ano anterior.",
      },
    ],
  },
  {
    id: "bsc",
    titulo: "Balanced Scorecard – {Mes}/{ano}",
    blocos: [
      {
        tipo: "fala", id: "bsc-ezequias", personagem: "ezequias",
        texto: "Olá, eu sou o Ezequias, gestor do CD em Cabo Santo Agostinho - PE.",
      },
      {
        tipo: "fala", id: "bsc-arailton", personagem: "arailton", lado: "dir",
        texto: "Olá, eu sou o Arailton, gestor do CD de Aquiraz - CE.\nApresento a vocês nosso resultado do BALANCED SCORECARD de {Mes}/{ano}. [Podemos ver que o CD de Aquiraz permanece no 1º lugar, também estamos na ponta no resultado do ano.]",
      },
      { tipo: "tabela", id: "bsc", rotulo: "Balanced Scorecard dos CDs" },
    ],
  },
  {
    id: "ajustes",
    titulo: "Ajustes de estoques (OP 51 e 151)",
    blocos: [
      {
        tipo: "fala", id: "ajustes-arailton", personagem: "arailton",
        texto: "Vou apresentar o % e os valores em R$ dos ajustes em estoques nos CDs...\nAqui, pessoal, consta todo o ajuste executado nas OP 51 e 151, seja em inventários oficiais ou no dia a dia. Valorizado em cima do preço de custo. Valores de {mes}/{aa}.\nAcima, CDs em que temos controladoria; abaixo, CDs que não possuem controladoria.",
      },
      { tipo: "tabela", id: "ajustes-mes", rotulo: "Ajustes do mês por CD", legenda: "{Mes}/{aa}" },
      {
        tipo: "texto", id: "ajustes-texto",
        texto: "Esta traz o resultado geral de {ano} até o último mês fechado.\nDe acordo com a nova POLÍTICA DE INVENTÁRIOS, o CD que apresentar acima de 0,50% deverá executar 2 inventários em {ano_prox}.",
      },
      { tipo: "tabela", id: "ajustes-ano", rotulo: "Ajustes acumulados no ano por CD", legenda: "Acumulado {ano}" },
    ],
  },
  {
    id: "devolucao",
    titulo: "Devoluções",
    blocos: [
      {
        tipo: "fala", id: "devolucao-leonardo", personagem: "leonardo",
        texto: "Olá, sou o Leonardo, gestor do CD em Cambé.\nVamos acompanhar abaixo o percentual de devolução dos CDs com controladoria. A partir de julho/26 a meta passou a ser 0,82%, apenas em motivos de responsabilidade logística.\nSó lembrando que os números que apresentamos abaixo vêm diretamente dos controles logísticos responsáveis por divulgar essa visão.",
      },
      { tipo: "tabela", id: "devolucao", rotulo: "% de devolução por CD" },
    ],
  },
  {
    id: "compras",
    titulo: "Regularização de compras",
    blocos: [
      {
        tipo: "fala", id: "compras-cleia", personagem: "cleia", lado: "dir",
        texto: "Olá, eu sou a Cleia, gestora do CD em Salvador - BA.\nEsta tabela abaixo de mim traz os % de REGULARIZAÇÃO DE COMPRAS apresentados em {mes} de {ano}: casos em que efetuamos uma compra ou serviço sem OF. Desta forma, perdemos o poder de negociação dos nossos compradores.",
      },
      { tipo: "tabela", id: "compras", rotulo: "% de regularização de compras por CD" },
      {
        tipo: "texto", id: "compras-texto",
        texto: "Muito importante para a companhia, pois se não seguirmos as políticas de compras estamos limitando o poder de negociação da área de compras.\nLembrando que esses números não incluem notas de CNPJs da Seara, JBS e Rovigo.",
      },
    ],
  },
  {
    id: "xml",
    titulo: "Documentos integrados via XML",
    blocos: [
      {
        tipo: "fala", id: "xml-paulo", personagem: "paulo",
        texto: "Olá, eu sou o Paulo, gestor do CD em Nova Santa Rita - RS.\nPessoal, esse é o % de documentos integrados via XML, ou seja, documentos que são integrados automaticamente, sem interferência do usuário... Esses são os números até {mes}/{aa}. Lembrando que esses números não contemplam notas de CNPJs internos.",
      },
      { tipo: "tabela", id: "xml-resumo", largura: "meia", rotulo: "Resumo do ano (XML)" },
      { tipo: "tabela", id: "xml-cds", rotulo: "% integrado via XML por CD e mês" },
    ],
  },
  {
    id: "op294",
    titulo: "OP-294 – ajuste devolução por peso",
    deco: "alerta",
    blocos: [
      {
        tipo: "fala", id: "op294-borba", personagem: "borba",
        texto: "Pessoal, assunto sério... logo abaixo temos os valores em R$ dos ajustes na operação 294.\nEsses são os valores trabalhados até agora em {ano}. Primeiramente, CDs que possuem controladoria e, em seguida, os CDs que ficam sob gestão apenas da logística.",
      },
      {
        tipo: "texto", id: "op294-texto",
        texto: "Mas o que é OP-294?\nSendo claro e objetivo: são notas que nossos clientes emitem contra nossas filiais alegando que não receberam exatamente os pesos que estão nas notas de venda. Desta forma, damos entrada nessas notas e ajustamos nossos estoques com essa operação 294 – ajuste devolução por peso.",
      },
      { tipo: "tabela", id: "op294", rotulo: "OP-294 em R$ por CD e mês" },
    ],
  },
  {
    id: "quirius",
    titulo: "Visão Quirius",
    blocos: [
      {
        tipo: "fala", id: "quirius-valeria", personagem: "valeria", lado: "dir",
        texto: "Oi, pessoal, eu sou a Valéria, gestora do CD em Duque de Caxias - RJ.\nVamos ver como fecharam os controles do nosso QUIRIUS em {mes} de {ano}?",
      },
      {
        tipo: "texto", id: "quirius-texto",
        texto: "Muito importante essa gestão, pois o QUIRIUS é a ferramenta que traz todas as NFs emitidas contra nossos CNPJs. Precisa estar em dia esse controle.\nNosso painel do QUIRIUS se encontra também no QLIK SENSE... Números extraídos em {data_extracao}.",
      },
      { tipo: "tabela", id: "quirius-total", largura: "meia", rotulo: "Total de documentos (print do Qlik)" },
      { tipo: "tabela", id: "quirius-status", rotulo: "Status dos documentos por CD" },
      { tipo: "tabela", id: "quirius-range", rotulo: "Quantidade e valor (R$) por RANGE" },
      {
        tipo: "texto", id: "quirius-texto-2",
        texto: "Acima temos a quantidade de documentos e, em seguida, o valor (R$) por RANGE.",
      },
    ],
  },
  {
    id: "inventarios",
    titulo: "Inventários {ano}",
    deco: "inventario",
    blocos: [
      {
        tipo: "fala", id: "inventarios-borba", personagem: "borba",
        texto: "Pessoal, inventários em {ano}...",
      },
      { tipo: "tabela", id: "inventarios", rotulo: "Calendário de inventários oficiais (R$)" },
      {
        tipo: "texto", id: "inventarios-texto",
        texto: "Acima apresentamos os valores em R$ dentro do calendário de inventários oficiais de {ano} nos CDs que possuem administrativo.\nValores em VERMELHO significam resultados de perdas, enquanto valores em AZUL significam resultados de ganho.\nEsses são os valores registrados diretamente nas telas de consulta de inventários no LEMG (LEMG4111).",
      },
    ],
  },
  {
    id: "evolucao",
    titulo: "Evolução dos números {ano_ant} vs {ano}",
    deco: "trofeus",
    blocos: [
      {
        tipo: "fala", id: "evolucao-borba", personagem: "borba",
        texto: "Pessoal, vamos ver agora se houve ou não evolução dos números quando comparamos {ano_ant} e {ano}, com 4 visões de evolutivos dentro da regional...\nOs indicadores com os evolutivos são: Balanced Scorecard; % de congelamento de estoques; % de ajustes de estoques; valores executados na OP-294 – ajuste devolução por peso.\nO farol verde significa que a filial melhorou; já o farol vermelho aponta que a performance piorou, comparando {ano_ant} vs {ano}.",
      },
      {
        tipo: "texto", id: "evolucao-bsc-texto",
        texto: "Vejam o Balanced Scorecard da regional. Números dos últimos 3 meses de {ano_ant} e {ano}. [Notamos aí que, a essa altura do ano, nenhum CD apresentou melhora de performance entre {aa_ant} e {aa}.]",
      },
      { tipo: "tabela", id: "evol-bsc", rotulo: "BSC – últimos 3 meses {ano_ant} vs {ano}" },
      {
        tipo: "fala", id: "evolucao-borba-2", personagem: "borba", lado: "dir",
        texto: "Abaixo de mim:\n• Congelamento de estoques (em %);\n• Ajustes de estoques (em R$);\n• OP-294 (em R$), respectivamente.",
      },
      { tipo: "tabela", id: "evol-indicadores", rotulo: "Evolutivos: congelamento, ajustes e OP-294" },
      {
        tipo: "texto", id: "evolucao-fecho",
        texto: "[Pessoal... muitas perdas de performance quando olhamos o primeiro bloco, referente à conciliação de estoques...]",
      },
    ],
  },
  {
    id: "encerramento",
    titulo: "E chegamos ao fim...",
    blocos: [
      {
        tipo: "fala", id: "fim-morlus", personagem: "morlus",
        texto: "Obrigado pela atenção e nos vemos no próximo mês.\nNão deixe de visitar a nossa página na intranet da regional de CONTROLADORIA CDs. Lá você conhece nossa estrutura, procedimentos e controles. Use o link abaixo:",
      },
      {
        tipo: "link",
        href: "https://intranetjbs.com.br/area/Foods/Executiva-Adm.-e-Financeira/gerencia-controladoria-cds/Paginas/default.aspx",
        texto: "Página da Controladoria CDs na intranet",
      },
    ],
  },
];
