---
description: "A fórmula escolhe a localização do muro; as vendas determinam seu tamanho. Alvo calculado a cada venda, exemplos e muros fixados em seu tick."
section: "01 / ENTENDER"
reading: "7 MIN + UM EXEMPLO INTERATIVO"
search:
  keywords: ["muro", "muros", "alvo", "preço", "profundidade", "capacidade", "capacity", "retração", "fórmula", "venda", "16200", "44200", "28200"]
---

# O alvo e os muros fixos

**A fórmula escolhe a localização do muro; as vendas determinam seu tamanho.** Um muro é uma posição LP financiada em ETH em um tick determinado, abaixo do preço atual.

## A fórmula a cada venda

Sejam `M` a capitalização do mercado após a venda e `B` a base de lançamento, expressas na mesma unidade:

<div class="formula">alvo = M − (M − B) × 0,6<span class="line-break"></span>= 0,4 × M + 0,6 × B</div>

O coeficiente retrai **60% da diferença entre o mercado e a base**. Portanto, conserva 40% dessa diferença acima da base. Com uma base ilustrativa `B = 7 000`:

| Mercado após a venda | Cálculo | Alvo do muro |
| --- | --- | --- |
| 30 000 | 30 000 − 23 000 × 0,6 | **16 200** |
| 100 000 | 100 000 − 93 000 × 0,6 | **44 200** |
| Retorno a 60 000 | 60 000 − 53 000 × 0,6 | **28 200** |

O terceiro cálculo parte de **60 000**, mesmo que o mercado tenha atingido 100 000 anteriormente. Não existe uma trava baseada na máxima histórica. O alvo é recalculado **a cada venda**, sobre o preço deixado por essa venda: não há mais uma reserva acumulada e depois alocada por uma chamada de manutenção.

## Varie o mercado

O exemplo abaixo mantém dois muros antigos em 16,2k e 44,2k e calcula o alvo do próximo muro. Os valores usam a mesma unidade de capitalização, com uma base ilustrativa de 7 000. Este esquema não simula absorção, saldos nem uma transação.

<section class="wall-lab" aria-label="Calculadora didática de alvo">
  <header><span>O ALVO APÓS A VENDA</span><span>BASE FIXA: 7 000</span></header>
  <div class="wall-controls">
    <label for="market-cap">Mercado após a venda <output id="market-value" for="market-cap">60 000 unidades</output></label>
    <input id="market-cap" type="range" min="7000" max="120000" step="1000" value="60000">
    <div class="wall-presets"><button type="button" data-market-preset="30000">30k</button><button type="button" data-market-preset="100000">100k</button><button type="button" data-market-preset="60000">Retorno a 60k</button></div>
  </div>
  <div class="wall-levels" aria-label="Comparação dos níveis de capitalização">
    <div class="level-row"><span>Muro antigo A</span><div class="level-track"><i style="width:13.5%"></i></div><b>16,2k</b></div>
    <div class="level-row"><span>Muro antigo B</span><div class="level-track"><i style="width:36.833%"></i></div><b>44,2k</b></div>
    <div class="level-row new-target"><span>Novo alvo</span><div class="level-track"><i id="lab-target-bar" style="width:23.5%"></i></div><b id="lab-target-label">28,2k</b></div>
    <div class="level-row market"><span>Mercado atual</span><div class="level-track"><i id="lab-market-bar" style="width:50%"></i></div><b id="lab-market-label">60k</b></div>
  </div>
  <div class="wall-result" aria-live="polite"><span>Alvo do próximo muro</span><strong id="target-value">28 200 unidades</strong></div>
  <p class="lab-explanation">Somente os novos financiamentos seguem o alvo atual. Os muros antigos permanecem em seu tick; a quantidade de ETH ainda disponível em cada nível deve ser lida separadamente.</p>
</section>

## Um muro por tick, nunca movido

Uma vez alocados, os ETH de um muro permanecem vinculados a seu tick. Um mercado em alta ou em baixa não move um muro antigo para o novo alvo.

- Um financiamento cujo alvo cai no tick de um muro existente **aprofunda esse muro** em vez de criar um segundo.
- Uma venda pode consumir parcialmente um muro: parte de seus ETH recompra então CUBIT.
- Um muro apenas parcialmente consumido **permanece no lugar**. Se o preço voltar a subir, ele revende seus CUBIT e se recarrega em ETH.
- Um muro **totalmente atravessado** é esvaziado pela venda que o atravessou: seus CUBIT vão para a reserva de recompensas do vault, sem queima, e seus ETH restantes voltam para os fundos pendentes.

Os identificadores dos muros são permanentes. Um índice de ticks permite encontrar os muros atingidos por uma venda. [Muros atravessados e reserva do vault](burn.md).

## Quando o alvo não é alocável

Um muro é uma posição 100% ETH: ele precisa ficar abaixo do preço atual. Quando o preço está no preço de lançamento ou abaixo dele, a fórmula gera um alvo igual ou superior ao mercado, que não pode ser financiado apenas com ETH.

Nesse caso, o hook coloca o muro **1% abaixo do preço atual**, arredondado ao tick, em vez de deixar os fundos aguardando. Caso contrário, fundos acumulados poderiam ser alocados de uma só vez a um preço inflado por uma transação que compra logo antes e depois vende seus CUBIT nesse muro. O hook decide pelo tick arredondado, não pelo alvo exato: perto do preço de lançamento, o alvo 40/60 arredondado pode ficar logo abaixo do mercado e ser usado assim mesmo, portanto mais perto que 1%.

Somente um valor pequeno demais para criar uma posição, isto é, poeira, um eventual excedente quando o muro visado atinge o teto de liquidez de um tick, um limite do Uniswap v4, e o caso extremo de um preço no topo do intervalo de ticks, onde nenhum muro cabe abaixo do preço, aguardam em `pendingFloorEth`. Uma venda seguinte os aloca. A venda em si nunca é recusada por esse motivo.

## Os ETH realmente alocados

O hook aloca todos os ETH pendentes, entre eles os 12% de cada venda, na posição correspondente ao alvo. As vendas seguintes podem consumir esses ETH: a reserva de cada muro é finita. Um muro pode ser financiado sem esperar a cobertura de toda a oferta.

## Do preço de lançamento aos ticks

O contrato trabalha com preço em ETH por CUBIT: `alvo = 0,4 × preço atual + 0,6 × preço de lançamento`. O preço de lançamento decorre da **FDV de lançamento fixada na implantação**, dividida pelos 21 milhões de CUBIT. A nova versão adota **3,75 ETH** de FDV; esse preço fica então fixo e não acompanha o dólar.

Os exemplos em unidades desta página aplicam a mesma fórmula a uma capitalização. Sua base de 7 000 é ilustrativa: não é uma conversão dos 3,75 ETH adotados.

Os ticks arredondam, então, o nível executável. ETH é `currency0`, portanto **um preço CUBIT mais alto corresponde a um tick de pool mais baixo**. O alvo matemático, o tick efetivamente alocado e o preço líquido de uma venda podem ser diferentes.

## O que a interface deve mostrar

Uma interface deve distinguir o mercado atual, a faixa, o próximo alvo, cada muro ativo e sua profundidade, bem como os ETH e os CUBIT pendentes. Uma única linha “floor” não resume todo o livro.

A referência histórica `floorPrice` descreve o **último muro financiado**, que pode ser mais baixo que o anterior. Ela não deve ser interpretada como um mínimo global garantido. [Ler os dados do dapp](../utiliser/preuves.md).

<p class="source-note">Fontes: decisões de design de 14 de setembro de 2026, <code>BandLib.retracementWallTarget</code>, <code>underMarketWallTarget</code>, <code>WALL_RETRACEMENT_BPS</code>, <code>WallLib.fund</code> e <code>CubitHook._placeWall</code>.</p>
