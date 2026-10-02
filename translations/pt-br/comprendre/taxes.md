---
description: "3% na compra, 15% na venda, dos quais 12% para os muros, previsão de 0,01% de taxas LP: entenda as bases de cálculo."
section: "01 / ENTENDER"
reading: "5 MIN DE LEITURA"
search:
  keywords: ["taxas", "custos", "fee", "percentual", "compra", "venda", "equipe", "muros"]
---

# Taxas e circulação de ETH

As **taxas do hook** e as **taxas LP do pool** correspondem a duas operações diferentes. Elas não incidem sobre a mesma base e não se somam como uma taxa única.

Esses percentuais são os da nova versão e se aplicam no pool Ethereum conectado. Verifique o [estado das versões](../securite/etat.md) e a cotação do pool utilizado.

## A taxa de compra

A taxa total é de **3% da entrada bruta de ETH**, integralmente destinada à parcela da equipe. No caso exact-input, ela está incluída no valor fornecido ao roteador.

| Para uma compra de 1 ETH | Valor | Destino |
| --- | --- | --- |
| Perna do swap | 0,97 ETH | Pool, depois taxas LP e conversão em CUBIT |
| Parcela da equipe | 0,03 ETH | Contabilidade da equipe |

Para uma compra exact-output, se a perna do pool exigir `x` ETH, o total antes do gas será aproximadamente `x / 0,97`, com arredondamentos inteiros. O roteador aplica o teto de entrada escolhido pelo usuário e reembolsa o excedente.

## A taxa de venda

A taxa total é de **15% da saída bruta de ETH**: **12% para os muros e 3% para a equipe**.

| Para uma saída bruta de 1 ETH | Valor | Destino |
| --- | --- | --- |
| ETH líquido do vendedor | 0,85 ETH | Carteira do destinatário |
| Financiamento dos muros | 0,12 ETH | Muro colocado no alvo desta venda, ou 1% abaixo do preço atual no preço de lançamento ou abaixo dele |
| Parcela da equipe | 0,03 ETH | Contabilidade da equipe |

O vendedor recebe, portanto, **0,85 ETH**, antes do custo de gas pago separadamente. Para buscar uma saída líquida de `x` ETH em exact-output, o pool precisa fornecer aproximadamente `x / 0,85` ETH brutos, com arredondamentos inteiros e conforme a cotação real.

As **vendas financiam diretamente os muros**. Os 12% e 3% são calculados sobre os ETH brutos da venda: não são 12% dos 15% de taxa. A parcela da equipe vai integralmente para a equipe.

## As taxas LP

O parâmetro `fee` do Uniswap v4 é expresso em milionésimos:

| Versão | Parâmetro | Percentual LP |
| --- | --- | --- |
| Nova versão | `100` | **0,01%** |

O `tickSpacing` e a largura de um muro são parâmetros de geometria, não outra expressão da taxa LP. O pool CUBIT usa espaçamento de 10 ticks nas fontes lidas.

As taxas LP se aplicam à perna do swap conforme a mecânica do pool. Uma cotação real considera arredondamentos, ticks atravessados, liquidez e eventuais taxas de protocolo v4. **Não aplique a taxa novamente a uma cotação que já seja líquida.**

## Para onde vão os 12%

A cada venda, o hook primeiro esvazia os muros que o preço atravessou totalmente e depois aloca todos os ETH pendentes, entre eles esses 12%, em um muro situado no alvo calculado sobre o preço após a venda. Se já existir um muro nesse tick, ele é aprofundado. No preço de lançamento ou abaixo dele, esse alvo fica quase sempre acima do mercado: o muro é então colocado 1% abaixo do preço atual. Somente uma poeira pequena demais para criar liquidez, um excedente quando o teto de liquidez de um tick é atingido, e o caso extremo de um preço no topo do intervalo de ticks permanecem em `pendingFloorEth`, até uma venda seguinte.

Não há mais sweep: a antiga transferência de parte dos ETH do ladder para os muros desapareceu junto com o ladder. [O alvo e os muros fixos](murs.md).

## As receitas previstas para a V2

| Módulo | Receita | O que não serve de financiamento |
| --- | --- | --- |
| Vault | Reserva de CUBIT: 20% da oferta no lançamento, depois os CUBIT dos muros totalmente atravessados | Principal depositado, criação de CUBIT, taxas LP; nenhuma recompensa em WETH |
| Forge | Taxa de lançamento de 0,005 ETH, paga em ETH ao vault de governança do launchpad e nunca devolvida a quem lança | Retirada dos fundos dos muros para um filho |

As taxas da Forge são cobradas desde sua abertura, em 23 de setembro de 2026. A reserva do Vault paga as recompensas desde a abertura do Vault, em 26 de setembro de 2026. Seus valores dependem da atividade real.

## Comprar e vender de volta não custa exatamente 18%

Isolando apenas as taxas proporcionais, a preço constante, sem impacto nem outros custos, o fator conservado é `0,97 × 0,85 = 0,8245`. A perda correspondente é, portanto, **17,55%**, e não a soma mecânica de 15 e 3 aplicada ao mesmo valor.

Uma operação real de ida e volta acrescenta taxas do pool, gas e variação de preço. O valor líquido retornado pela cotação continua sendo a referência para uma transação específica. [Comprar e vender](../utiliser/swaps.md).

<p class="source-note">Distribuição das taxas: decisões de design de 14 de setembro de 2026. Código: <code>CubitHook._creditBuyTax</code>, <code>_creditSellTax</code>, <code>_placeWall</code> e <code>periphery/CubitRouter.sol</code>.</p>
