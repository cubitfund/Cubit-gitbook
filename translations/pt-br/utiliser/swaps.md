---
description: "O percurso de compra e venda CUBIT: versão do pool, cotação líquida, slippage, aprovações e recibo de transação."
section: "02 / USAR"
reading: "5 MIN DE LEITURA"
---

# Comprar e vender

O dapp oferece trocas ETH/CUBIT pelo roteador da implantação selecionada. As taxas são aplicadas no hook; o valor estimado a receber já deve ser líquido das taxas incluídas na cotação.

> O dapp conectado à Ethereum usa a versão atual, com **0,01% de taxas LP**, e lê a ABI dessa versão. Enquanto o mercado não estiver aberto, nenhuma troca é possível. Uma demonstração ou um modo de simulação não é um estado on-chain.

## Antes de preparar um swap

Verifique a rede da carteira, a implantação exibida e o bloco dos dados. Reserve ETH para o gas além do valor a trocar. O dapp deve sinalizar RPC indisponível ou dados desatualizados e impedir uma assinatura baseada em estado não verificado.

Uma mudança de conta, rede, valor ou endereço de roteador exige nova cotação. Os endereços periféricos podem mudar pelo registro V2.

## Comprar CUBIT

1. Escolha um valor em ETH. Em exact-input, a taxa de compra de 3% está incluída nesse valor.
2. Leia a quantidade líquida estimada de CUBIT, as taxas e o mínimo recebido definido pela tolerância de slippage.
3. Verifique a simulação e os detalhes apresentados pela carteira e, depois, assine.
4. Aguarde um recibo de sucesso e a atualização dos saldos on-chain.

A compra usa ETH nativo por `msg.value`. O roteador CUBIT não usa Permit2 nesse percurso. Na nova versão, uma compra retira CUBIT da faixa seguindo sua curva x·y=k.

## Vender CUBIT

A venda pode exigir uma **aprovação ERC-20** que permita ao roteador transferir a quantidade de CUBIT escolhida. O frontend prepara uma autorização do valor solicitado.

Após a confirmação da aprovação, o dapp verifica novamente a conta, a rede, a revisão do registro e a atualidade da cotação antes do swap. A aprovação e a venda são duas transações distintas quando a autorização era insuficiente.

A venda retorna ETH líquido da taxa de 15%: 12% dos ETH brutos financiam os muros e 3% vão para a equipe. Na nova versão, a venda esvazia os muros que atravessa totalmente e aloca os ETH pendentes em um muro; o roteador CUBIT envia, em seguida, os CUBIT absorvidos para a reserva do vault.

## O mínimo recebido e o prazo

O **slippage** limita a diferença aceita em relação à cotação. Uma taxa já incluída na cotação não é motivo para acrescentar arbitrariamente 15 pontos de slippage.

Nas fontes do frontend lidas, uma cotação permanece atual por **30 segundos**. O prazo da transação é calculado a partir do timestamp da cadeia. Esses controles podem impedir a assinatura após uma longa espera pela aprovação; nesse caso, é necessário revisar uma cotação atualizada.

Uma transação recusada pelos limites protege o valor mínimo ou máximo acordado. Sua falha não significa que esse limite deva ser removido.

## Se a transação não passar

| Situação | Ação útil |
| --- | --- |
| Rede errada ou conta alterada | Voltar ao contexto desejado e solicitar nova cotação |
| Cotação expirada | Recalcular o valor líquido e o mínimo recebido |
| Roteador ou revisão alterados | Revisar o endereço atual e a nova ação; a aprovação antiga continua vinculada ao spender antigo |
| Liquidez insuficiente | Verificar uma cotação para valor menor e as posições presentes |
| Venda que atravessa um número muito grande de muros | Dividir a venda: além de cerca de 88 muros atravessados, ela ultrapassa o limite de gas de uma transação |
| RPC indisponível | Aguardar uma leitura on-chain válida antes de assinar |
| Transação já enviada | Verificar o hash e o recibo antes de preparar outra |

O roteador rejeita uma entrada não totalmente consumida e uma saída exata não totalmente atendida. Os fundos gastos em uma transação revertida são desfeitos pela EVM, exceto o gas.

## Conferir o resultado

Um hash significa que a transação foi enviada; apenas o recibo informa seu sucesso. Verifique a rede do explorador, o estado, o destinatário e os eventos `BuyTaxed` ou `SellTaxed`.

Os preços de referência dos muros não substituem a cotação de uma ordem específica. [Ler os dados do dapp](preuves.md).

<p class="source-note">Fontes: <code>dapp/src/chain/swap.ts</code>, <code>executeSwap.ts</code>, <code>deployment.ts</code> e <code>contracts/src/periphery/CubitRouter.sol</code>. Os testes de aceitação com carteiras de navegador e celular continuam distintos dos testes automatizados.</p>
