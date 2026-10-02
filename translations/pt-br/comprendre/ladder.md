---
description: "Uma única faixa ampla, colocada no lançamento com 80% da oferta e nunca retirada: a liquidez de negociação do CUBIT."
section: "01 / ENTENDER"
reading: "4 MIN DE LEITURA"
search:
  keywords: ["faixa", "band", "liquidez", "TIDE", "curva", "x·y=k", "lançamento", "FDV", "ladder"]
---

# A faixa de liquidez

A liquidez de negociação do CUBIT cabe em **uma única faixa ampla**, no modelo do TIDE. O hook a coloca no lançamento e nunca a retira. Ela substitui o antigo ladder.

## O que a faixa contém

| Parâmetro | Valor escolhido |
| --- | --- |
| Depósito | 80% da oferta, ou seja, 16,8 milhões de CUBIT |
| Composição no lançamento | 100% CUBIT, nenhum ETH |
| Intervalo de preço | Todos os preços acima do preço de lançamento |
| FDV de lançamento | 3,75 ETH, ou seja, 3 ETH de profundidade para a faixa |
| Retirada | Nenhuma: a posição nunca é retirada |

O limite inferior da faixa corresponde ao preço de lançamento, arredondado ao tick, de modo que a posição não contém nenhum ETH no início. Acima dele, ela cobre toda a curva de preço do pool.

## Uma curva x·y=k

As compras e as vendas seguem a curva de produto constante da faixa. Uma compra deposita ETH nela e retira CUBIT: o preço sobe. Uma venda faz o inverso: o preço cai.

Com uma FDV de lançamento de 3,75 ETH, os 16,8 milhões de CUBIT valem **3 ETH ao preço de lançamento**. No início, a faixa se comporta como um pool x·y=k de 16,8 milhões de CUBIT contra 3 ETH. Esses 3 ETH são **virtuais**: eles fixam a inclinação da curva, mas a faixa só detém de fato os ETH trazidos pelos compradores.

## O que a faixa não garante

Os ETH que os vendedores podem retirar da faixa são os que os compradores depositaram nela. Quando o preço volta ao preço de lançamento, a faixa passa a conter apenas CUBIT: ela não consegue mais recomprar CUBIT abaixo desse preço.

Abaixo do preço de lançamento, uma venda só pode, portanto, ser atendida por ETH ainda presentes em muros. A profundidade de 3 ETH não é uma reserva de ETH depositada pelo protocolo nem um preço mínimo.

## O que desapareceu com o ladder

A faixa substitui o antigo livro móvel. Foram eliminados:

- o ladder, suas faixas sucessivas e sua reserva de tokens;
- o cushion em ETH;
- `rebalance`, `raiseFloor`, o sweep para os muros e os bônus dos keepers.

Nenhuma chamada de manutenção é necessária para fazer o mercado funcionar: não há mais keeper.

## A faixa de um filho Forge

Um mercado filho criado pela Forge segue o mesmo modelo, com uma diferença: **ele deposita 100% de sua oferta em sua faixa**. Ele não tem reserva de vault nem alocação para a equipe. O hook exige um depósito de pelo menos 80% da oferta e coloca a totalidade do depósito na faixa. [Momentum e Forge](../v2/momentum-forge.md).

## Verificar a faixa

A visualização `band()` do hook retorna os ticks e a liquidez da posição; o evento `BandBootstrapped` é emitido no lançamento. O Lens expõe `bandEth` e `bandTokens`, os ETH e os CUBIT mantidos pela faixa ao preço atual, sem contar as taxas LP. [Contratos e integração](../developper/integration.md).

<p class="source-note">Fontes: <code>CubitHook._bootstrap</code>, <code>afterInitialize</code>, <code>band()</code>, <code>MIN_POOL_SUPPLY</code>, <code>CubitLens.bandEth</code> / <code>bandTokens</code> e <code>periphery/CubitForge.sol</code>. Decisões de design de 14 de setembro de 2026.</p>
