---
description: "Distinguir mercado, faixa, alvo, muros, fundos pendentes e dados on-chain no painel CUBIT."
section: "02 / USAR"
reading: "4 MIN DE LEITURA"
search:
  keywords: ["proof", "evidências", "painel", "dados", "floor", "simulação", "profundidade", "faixa"]
---

# Ler os dados do dapp

A página Proof serve para conciliar os números exibidos com os estados e eventos do protocolo. Comece pela **rede, implantação, versão e bloco de leitura** antes de interpretar um valor.

> O dapp público lê a implantação Ethereum em serviço e sua ABI. Os dados abaixo descrevem o que uma interface deve distinguir.

## Os números a distinguir

| Dado | O que descreve |
| --- | --- |
| Preço de mercado | Preço atual do pool, distinto do resultado líquido para uma quantidade específica |
| ETH da faixa | ETH realmente mantidos pela faixa ao preço atual, trazidos pelos compradores |
| CUBIT da faixa | CUBIT que a faixa ainda oferece para compra |
| Alvo do próximo muro | Nível calculado com o preço atual, distinto de uma posição financiada |
| Muros ativos | Posições já financiadas, cada uma com seu ID, seu tick e sua liquidez restante |
| ETH pendente | Fundos dos muros que ficaram sem alocação: poeira pequena demais para criar uma posição, ou preço no topo do intervalo de ticks |
| CUBIT aguardando envio | CUBIT dos muros atravessados, isolados no hook até seu envio ao vault |
| Reserva de recompensas | CUBIT mantidos pelo vault para pagar os depositantes, distintos dos depósitos |
| Oferta em circulação | Oferta total menos os CUBIT dos muros, os que aguardam envio e a reserva de recompensas dos vaults; os CUBIT depositados no vault continuam em circulação |

O nível de um muro e seus ETH restantes devem ser lidos juntos. Os ETH da faixa e os dos muros pertencem a dois livros distintos.

## O que muda com a nova versão

A visualização antiga apresentava um ladder, um cushion, uma fila de queima e uma tela de manutenção. A nova versão os substitui por uma faixa única, muros colocados e esvaziados a cada venda e uma reserva de recompensas no vault. Não há mais página Keepers.

O nome histórico `floorPrice` descreve o último muro financiado: ele não deve ser lido como um mínimo global do mercado. Um novo muro pode ser colocado abaixo do anterior quando o preço caiu.

Os novos campos estão detalhados na [integração](../developper/integration.md). O dapp conectado à Ethereum lê os campos da versão atual.

## Preço bruto, preço líquido e cotação

Uma referência bruta representa um nível de preço da posição. Uma referência líquida pode incorporar um limite de intervalo, as taxas LP, a taxa de venda e uma hipótese sobre as taxas de protocolo v4.

A venda real depende da quantidade, das posições atravessadas, dos arredondamentos e do gas. Uma referência “net floor” não é o cálculo de desempenho de sua carteira e não substitui uma cotação.

## Os modos de dados

| Exibição | Interpretação |
| --- | --- |
| On-chain, bloco identificado | Dados lidos na implantação indicada |
| Carregando | Primeira leitura ainda incompleta |
| Dados desatualizados ou RPC indisponível | Último estado conhecido; não é autorização para assinar |
| Simulação ou demonstração | Ilustração local do mecanismo |

Para os futuros lançamentos, verifique a disponibilidade anunciada e os endereços dos módulos oferecidos ao usuário.

## Repetir a verificação

Verifique as identidades do token, hook e pool, depois os módulos atuais do registro e sua `moduleRevision`. Concilie os eventos com o hash da transação e seu bloco canônico.

A página Proof permite acompanhar as taxas e os muros. Uma captura de tela ou um relatório antigo não substitui essa identificação de versão. [Estado real das versões](../securite/etat.md).

<p class="source-note">Fontes: <code>CubitLens.sol</code>, <code>interfaces/ICubitLens.sol</code> e, para o frontend, <code>dapp/src/chain/snapshot.ts</code>, <code>releases.ts</code> e <code>events.ts</code>.</p>
