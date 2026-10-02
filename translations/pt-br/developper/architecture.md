---
description: "Mapa da base de código CUBIT: contratos, faixa e muros, vaults, dapp e serviços."
section: "04 / CONSTRUIR"
reading: "6 MIN DE LEITURA"
---

# Arquitetura e base de código

O repositório reúne os contratos Solidity, um dapp React/Vite e dois serviços Node. Este GitBook é autônomo em `gitbook/`: seu build não lê configurações privadas nem dados de rede do protocolo.

> A versão descrita aqui está na branch `redesign/tide-lp-autowalls-vault`.

## Os diretórios

| Diretório | Responsabilidade |
| --- | --- |
| `contracts/src` | Token, hook, bibliotecas, interfaces e contratos periféricos |
| `contracts/test` | Testes Foundry históricos sobre a API antiga; testes da nova versão em `test/redesign` |
| `contracts/audit` | Estruturas e campanhas complementares de verificação |
| `contracts/script` | Scripts Foundry de implantação e cenários reproduzíveis em um nó local |
| `contracts/scripts` | Exportação de ABI, verificações e procedimentos de implantação |
| `contracts/deployments` | Manifestos públicos de versões e histórico |
| `dapp/src/chain` | Configuração, ABI, leituras, cotações e transações |
| `dapp/src/pages` | Swap, Proof, Staking, roadmap e módulos V2 |
| `services/shared` | Configuração compartilhada, clientes, ABI e acompanhamento da execução |
| `services/keeper` | Serviço da antiga manutenção, sem função na nova versão |
| `services/floor-bot` | Leitura de eventos e preparação de publicações |
| `audit/reports` | Relatórios datados e evidências vinculadas às revisões |
| `gitbook/docs` | Fontes francesas desta documentação |

## Os contratos do núcleo

| Componente | Responsabilidade |
| --- | --- |
| `CubitToken` | ERC-20 com emissão inicial única de 21 M; queima reservada ao hook |
| `CubitHook` | Taxas, faixa de liquidez, colocação e esvaziamento dos muros, contas da equipe, conexão V2 |
| `BandLib` | Preços, conversões e arredondamentos de ticks, alvo dos muros |
| `WallLib` | Muros por tick: identificador permanente, índice dos muros ativos, financiamento e esvaziamento dos muros atravessados |
| `PoolManager` v4 | Estado do pool, posições de liquidez, swaps e liquidação |

O hook é o único provedor de liquidez do pool CUBIT: qualquer outro acréscimo de liquidez é recusado. Os fundos são acompanhados nas posições e por claims ERC-6909 do PoolManager; o saldo nativo de ETH do endereço do hook não é, portanto, uma medida suficiente das reservas.

A faixa é uma posição única identificada por `BAND_SALT`. Cada muro ocupa uma célula de `tickSpacing` sob seu próprio salt. `WallLib` trabalha no armazenamento do hook: os claims e as posições continuam atribuídos ao hook.

## Os contratos periféricos

| Componente | Responsabilidade |
| --- | --- |
| `CubitRouter` | Swaps exact-input/output, limite de slippage, prazo, liquidação e envio dos CUBIT absorvidos após cada venda |
| `CubitLens` | Visualizações derivadas: mercado, faixa, muros, contas, oferta em circulação, CUBIT em mãos dos holders e melhor muro |
| `CubitV2` | Registro estável dos módulos, revisão e histórico dos vaults |
| `CubitVault` | Depósitos CUBIT, bloqueio de 24 h e recompensa em CUBIT paga por uma reserva |
| `CubitGovernanceVault` | Vault de governança do launchpad: taxas de lançamento em ETH e tokens dos muros dos filhos, bloqueados por 30 dias por depósito, mais a eventual extensão; resgate e extensão reservados para sempre ao deployer |
| `CubitForge` | Launchpad público de mercados filhos isolados, adicionado depois do lançamento; taxa de lançamento de 0,005 ETH paga ao vault de governança, cujo endereço é fixado na construção |
| `CubitLaunch` | Lançamento em uma única transação: 80% da oferta na faixa, 20% na reserva do vault e compra do deployer |

O endereço da equipe pode substituir Router, Lens, Vault e Forge no registro a qualquer momento, sem prazo de espera, e depois ativá-los; esses poderes são permanentes, e cada substituição desativa a funcionalidade correspondente até sua reativação. O token, o hook, as identidades do pool e a âncora do registro não seguem esse mecanismo de substituição, e o hook não tem nenhum administrador: ninguém pode pausar os swaps nem o mecanismo dos muros.

## O percurso de uma leitura

```text
Frontend ou serviço
    → manifesto público: rede, núcleo, registro
    → registro em um bloco específico: módulos + revisão
    → verificação das conexões dos módulos
    → Lens e visualizações do hook no mesmo bloco
    → exibição ou simulação de uma ação
```

No frontend, `releases.ts` resolve os módulos e `vault.ts` preserva a leitura dos Vaults antigos. A ausência de resposta RPC não deve autorizar uma assinatura. A camada de dados do dapp lê a ABI da versão em serviço.

## O percurso de um swap

O frontend obtém uma cotação e depois uma simulação. O roteador abre o contexto de liquidação do PoolManager; o hook aplica as taxas na perna ETH, e o swap segue a curva da faixa e dos muros atravessados. Em seguida, o roteador liquida os deltas.

A cada venda, em `afterSwap`, o hook esvazia os muros totalmente atravessados e depois aloca os ETH pendentes em um muro no alvo calculado sobre o preço após a venda, ou 1% abaixo do preço atual quando esse alvo não está abaixo do mercado, no preço de lançamento ou abaixo dele. Ao final da venda, o roteador CUBIT chama `deliverAbsorbed()` para enviar os CUBIT absorvidos para a reserva do vault; uma falha nesse envio não bloqueia a venda.

As fronteiras são importantes: o callback do roteador só é acessível ao PoolManager durante a operação esperada, e o payer vem do chamador autenticado do roteador.

## O que a nova versão mudou

A faixa substitui o ladder, e `rebalance`, `raiseFloor`, o sweep e os bônus foram removidos. Os muros são colocados e esvaziados durante as vendas, e os CUBIT dos muros atravessados vão para a reserva do vault em vez de serem queimados.

A suíte histórica `contracts/test` usa a API antiga e não compila com a nova versão; os testes da nova versão estão em `test/redesign`. As próximas etapas estão no [roadmap](../roadmap.md), e os componentes testados, no [estado das versões](../securite/etat.md).

<p class="source-note">Fontes: arquivos citados do repositório, especialmente <code>CubitHook</code>, <code>BandLib</code>, <code>WallLib.Book</code>, <code>periphery/CubitRouter.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>releases.ts</code>, <code>contracts/docs/REDESIGN_HANDOFF.md</code> e os README dos serviços.</p>
