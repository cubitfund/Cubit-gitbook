---
description: "Os conceitos essenciais: token CUBIT, hook Uniswap v4, faixa de liquidez e muros financiados em ETH a cada venda."
section: "01 / ENTENDER"
reading: "5 MIN DE LEITURA"
---

# CUBIT em 5 minutos

CUBIT é um token ERC-20 associado a um mercado ETH/CUBIT no Uniswap v4. O próprio protocolo fornece a liquidez de seu pool: seu **hook** é o único provedor dessa liquidez e aplica as taxas conforme as regras do contrato.

A oferta é fixada em **21 milhões de CUBIT**, criados uma única vez. Não existe função que permita criar outros. Na nova versão, os CUBIT recomprados pelos muros **não são mais queimados**: eles vão para a reserva de recompensas do vault.

> Esta página descreve a nova versão. Consulte o [estado das versões](../securite/etat.md).

## Os dois livros do mercado

| Livro | Função | O que pode mudar |
| --- | --- | --- |
| Faixa | Uma única posição ampla, colocada no lançamento com 80% da oferta; ela vende CUBIT aos compradores e recompra CUBIT dos vendedores | Sua distribuição entre CUBIT e ETH acompanha o preço; a posição nunca é retirada |
| Muros | Posições em ETH colocadas abaixo do preço atual e financiadas pelas vendas | Seu conteúdo muda quando o preço os atravessa; seu tick nunca muda |

Os saldos da equipe e a reserva de recompensas do vault são contabilizados separadamente. Um saldo total, portanto, não basta para descrever os ETH realmente disponíveis nos muros.

## O que os swaps financiam

Para uma **compra exact-input de 1 ETH**, sem gas:

- **0,97 ETH** entra na perna do swap destinada ao pool, antes das próprias taxas LP.
- **0,03 ETH** vai para o compartimento da equipe.

Para uma **venda que produz 1 ETH bruto**, **0,85 ETH** vai para o vendedor, **0,12 ETH** financia os muros e **0,03 ETH** vai para a equipe. O gas é pago separadamente.

A nova versão prevê **0,01% de taxas LP**. Essa comissão do pool é distinta das taxas de 3% na compra e 15% na venda. [Veja as taxas em detalhe](taxes.md).

## Como os muros surgem

A **cada venda**, o hook primeiro esvazia os muros que o preço atravessou totalmente e depois aloca os ETH pendentes, entre eles os 12% da venda, em um muro no alvo `0,4 × preço atual + 0,6 × preço de lançamento`, calculado sobre o preço após a venda e arredondado ao tick. Dois financiamentos que caem no mesmo tick se somam em um único muro. Nenhum muro é movido depois.

No preço de lançamento ou abaixo dele, esse alvo ficaria acima do mercado: o muro é então colocado 1% abaixo do preço atual, em vez de deixar os fundos aguardando uma venda seguinte. Nenhuma chamada de manutenção é necessária: a criação e o esvaziamento dos muros fazem parte da própria venda.

**A fórmula escolhe a localização do muro; as vendas determinam seu tamanho.** Um nível exibido não prova que todos os detentores poderiam vender nesse nível. [O alvo e os muros fixos](murs.md).

## O que acontece no lançamento

O lançamento é feito em uma única transação:

- **80% da oferta**, ou seja, 16,8 milhões de CUBIT, são depositados na faixa;
- **20%**, ou seja, 4,2 milhões de CUBIT, alimentam a reserva de recompensas do vault;
- o deployer faz uma **compra de 0,1 ETH**, taxada em 3% como qualquer compra, cujos CUBIT não ficam bloqueados.

Não há airdrop nem alocação para a equipe. [A faixa de liquidez](ladder.md).

## V1 e V2

A **V1** é o mercado: token, hook, faixa, muros e swaps. A **V2** adiciona Vault, Momentum e Forge, que a equipe abre quando decidir: Momentum e a Forge estão abertos desde 23 de setembro de 2026, o Vault desde 26 de setembro de 2026.

O endereço da equipe recebe a parcela da equipe nas taxas e substitui e, em seguida, ativa os módulos periféricos compatíveis do registro; esses poderes são permanentes. O hook não tem nenhum administrador: ninguém pode pausar os swaps nem o mecanismo dos muros, e o núcleo do pool mantém suas próprias identidades fixas.

As próximas etapas estão no [roadmap](../roadmap.md).

<p class="source-note">Fontes do repositório: <code>contracts/src/CubitToken.sol</code>, <code>CubitHook.sol</code>, <code>periphery/CubitV2.sol</code> e as decisões de design de 14 de setembro de 2026 registradas em <code>contracts/docs/REDESIGN_HANDOFF.md</code>.</p>
