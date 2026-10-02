---
description: "Estado em 26 de setembro de 2026: nova versão implantada na Ethereum, mercado aberto, Vault, Momentum e Forge abertos."
section: "05 / VERIFICAR"
reading: "4 MIN DE LEITURA"
search:
  keywords: ["versão", "estado", "Ethereum", "mainnet", "testnet", "Sepolia", "validação", "auditoria", "implantado", "redesign"]
---

# Estado real das versões

**Este guia descreve a nova versão do CUBIT.** O dapp conectado usa a implantação Ethereum desta versão, com 0,01% de taxas LP. O mercado está aberto desde 22 de setembro de 2026, no bloco 26.035.793.

Esta edição do guia é de **26 de setembro de 2026**. Ela se baseia nas decisões de design, no código da nova versão e nos relatórios do repositório.

## Três estados distintos

| Escopo | Estado descrito nesta edição |
| --- | --- |
| Decisões de design, fixadas em 14 de setembro de 2026 | Compra 3% equipe; venda 15% (12% muros, 3% equipe); faixa única de 80% da oferta; muros criados a cada venda; CUBIT dos muros atravessados para a reserva do vault; vault a 3% ao dia; FDV de lançamento de 3,75 ETH |
| Código da nova versão | Componentes listados na tabela seguinte |
| Ethereum conectado ao dapp | Versão atual: compra 3%, venda 15% dos quais 12% para os muros, fee LP 100 = 0,01%, faixa única de 80% e muros colocados a cada venda, com registro V2 e módulos substituíveis |

Mudar as fontes locais não altera contratos já implantados. Uma sincronização da documentação não move os fundos de um pool antigo.

## Os componentes em produção

| Parte | Estado |
| --- | --- |
| Faixa ampla no lançamento, remoção do ladder e da manutenção | Em produção na Ethereum |
| Muros colocados e esvaziados a cada venda, envio de seus CUBIT ao vault | Em produção na Ethereum |
| Vault a 3% ao dia em CUBIT, pago pela reserva | Em produção na Ethereum desde 26 de setembro de 2026 |
| Vault de governança do launchpad: taxas de lançamento em ETH e tokens dos filhos Forge | Em produção na Ethereum desde 23 de setembro de 2026 |
| Momentum: muros ativos, parcialmente consumidos e atravessados de cada token | Em produção na Ethereum desde 23 de setembro de 2026 |
| Forge pública: mercados filhos isolados, taxa de lançamento de 0,005 ETH | Em produção na Ethereum desde 23 de setembro de 2026 |
| Recompensa do Vault exclusivamente em CUBIT, hook sem administrador | No código implantado na Ethereum |
| Lançamento em uma transação: 80% na faixa, 20% na reserva do vault e compra de 0,1 ETH | Em produção na Ethereum |

Esses componentes estão implantados na Ethereum desde 22 de setembro de 2026, o launchpad e Momentum desde 23 de setembro de 2026; os depósitos do Vault estão abertos desde 26 de setembro de 2026. Eles são cobertos pelos testes Foundry, pelo fuzzing, pelos invariantes, pela análise estática e pela verificação simbólica do repositório. As etapas seguintes estão no [roadmap](../roadmap.md).

## O que os relatórios históricos atestam

O relatório Sepolia descreve a implantação de uma versão anterior, verificações de runtimes e conexões, compras e vendas de aceitação, uma alocação de muro e verificações de recusa de ações inelegíveis.

Essas evidências pertencem àquela versão. Elas não testam a faixa, nem os muros criados a cada venda, nem o novo vault.

Na revisão histórica `991fca9`, a suíte Solidity completa tinha **133 aprovações e 15 falhas em 148 testes**. Esses resultados e seus limites estão no relatório do estado publicado. Eles não são contadores de validação da nova versão.

## O que não constitui validação completa

Uma compilação bem-sucedida verifica a produção de bytecode. Ela não demonstra, por si só, os invariantes contábeis, o comportamento de um conjunto de muros atravessados, a coerência do frontend ou uma transação na rede escolhida.

Da mesma forma, comparar hashes de runtimes não significa que as fontes foram publicadas em um explorador. Testes automatizados do frontend não substituem testes de aceitação com uma carteira real de navegador ou celular.

Uma validação completa da nova versão também abrange a separação das contas, a ausência de extração excessiva do vault, a chegada à reserva dos CUBIT dos muros esvaziados e a impossibilidade de um participante extrair os ETH dos muros a uma taxa favorável.

## Qual fonte seguir

Para a nova versão, a referência é o documento de transição `contracts/docs/REDESIGN_HANDOFF.md` da branch `redesign/tide-lp-autowalls-vault`. Ele registra as decisões fixadas e sua implementação no código.

Para o histórico, o ponto de partida continua sendo o relatório francês da revisão `991fca9`. Os manifestos públicos em `contracts/deployments/` identificam as implantações existentes.

A [página Fontes](../sources.md) esclarece a ordem de leitura e os documentos que se tornaram históricos.
