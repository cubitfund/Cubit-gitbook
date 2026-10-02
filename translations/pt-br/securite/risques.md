---
description: "Limites concretos: profundidade finita da faixa e dos muros, gas dos muros atravessados, reserva de recompensas, integrações, substituição de módulos e evidências de versão."
section: "05 / VERIFICAR"
reading: "5 MIN DE LEITURA"
search:
  keywords: ["segurança", "riscos", "limites", "perdas", "auditoria", "reserva", "extração", "gas"]
---

# Riscos e limites

A faixa e os muros são posições LP. Sua presença define uma liquidez disponível, sem tornar o resultado de uma negociação independente do preço, das taxas ou do estado do pool.

> Os limites abaixo não são exaustivos. O código pode conter erros que os testes não revelaram.

## Preço e execução

A faixa detém apenas os ETH trazidos pelos compradores: sua profundidade de 3 ETH no lançamento é virtual. Quando o preço volta ao preço de lançamento, ela passa a conter apenas CUBIT. Os muros, por sua vez, contêm apenas os ETH que as vendas alocaram neles.

O mercado, o alvo do próximo muro, o preço de um muro e o valor líquido obtido em uma venda são dados distintos. Use uma cotação para o valor pretendido. Uma forte variação entre cotação e execução pode provocar recusa pelo mínimo recebido ou pelo teto de entrada; as taxas do hook, as taxas do pool e o gas continuam sendo custos reais.

## Muros e contabilidade

Cada muro atravessado custa cerca de 185 000 gas à venda que o esvazia. Como uma transação é limitada a 16 777 216 gas pela EIP-7825, uma venda atravessa no máximo cerca de 88 muros: além disso, ela falha sem perda e precisa ser dividida em várias vendas. Um envio malsucedido dos CUBIT absorvidos não bloqueia a venda: eles permanecem isolados no hook e qualquer pessoa pode tentar o envio novamente.

Nenhuma evidência publicada garante que um participante não consiga extrair os ETH acumulados nos muros a uma taxa favorável, por exemplo comprando cedo e depois vendendo em muros financiados por outras vendas.

A separação das contas deve permanecer válida após compras, vendas, absorções, recompensas e substituições. O tamanho dos contratos, a vinculação das bibliotecas e os parâmetros de compilação também fazem parte do escopo de verificação.

## Vault e reserva

A recompensa de 3% ao dia é paga por uma reserva finita: nesse ritmo, a reserva pode se esgotar e os pagamentos, parar. Uma recompensa não resgatada além de um dia é perdida.

Os CUBIT pagos como recompensas são negociáveis: sua eventual venda pesa sobre o mercado como qualquer outra venda. As taxas de lançamento da Forge e os tokens dos muros dos filhos são destinados ao vault de governança, cujos lotes desbloqueados só podem ser resgatados pelo deployer, para sempre e sem transferência possível.

## Integrações e módulos

Um roteador de terceiros não chama necessariamente `deliverAbsorbed()` após uma venda: os CUBIT absorvidos ficam então pendentes até uma chamada pública. A compatibilidade de um agregador deve ser testada com as taxas do hook e a versão do pool.

Os módulos substituíveis introduzem confiança nas decisões futuras da equipe: ela pode substituí-los imediatamente, sem prazo de espera, e protege a chave privada de seu endereço. As verificações de getters não são prova de segurança do código escolhido. Um novo endereço exige nova revisão da aprovação ou assinatura.

O hook não tem nenhum administrador: ninguém pode pausar os swaps nem o mecanismo dos muros, inclusive em caso de incidente. Em contrapartida, o endereço da equipe mantém poderes permanentes sobre os módulos do registro.

## Frontend e dados

Uma exibição pode usar simulação, manifesto antigo ou dados desatualizados; o dapp atual lê a versão em serviço. A interface deve identificar a rede e os blocos, sinalizar falhas e impedir uma assinatura baseada em um contexto que se tornou incoerente.

Os números em USD dependem da conversão escolhida: a FDV de lançamento é fixada em ETH e não acompanha o dólar.

## O que os testes permitem afirmar

Os testes e as campanhas de invariantes fornecem evidências para os casos, estados e a revisão efetivamente explorados. As campanhas históricas se referem ao modelo antigo e não validam a nova versão. Uma longa campanha bem-sucedida não é uma prova formal geral.

Esta edição não garante a ausência de perda. O [estado real das versões](etat.md) detalha o que foi testado, e o [roadmap](../roadmap.md), as etapas seguintes.

<p class="source-note">Fontes: <code>contracts/docs/REDESIGN_HANDOFF.md</code>, <code>CubitHook.sol</code>, <code>WallLib.collectCrossed</code>, <code>CubitRouter._finishSwap</code>, <code>periphery/CubitVault.sol</code>, <code>periphery/CubitGovernanceVault.sol</code> e, para o histórico, <code>audit/reports/2026-09-10-v1-v2/BILAN_FINAL_FR.md</code>.</p>
