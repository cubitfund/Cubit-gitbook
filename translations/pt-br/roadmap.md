---
description: "As etapas da reformulação, os próximos lançamentos CUBIT, suas janelas e as condições de validação."
section: "05 / VERIFICAR"
reading: "5 MIN DE LEITURA"
search:
  keywords: ["roadmap", "calendário", "abertura", "V1", "V2", "reformulação", "etapas", "launchpad"]
---

# Roadmap e condições de lançamento

O calendário descreve uma intenção de publicação. **A cadência de lançamentos não substitui a validação do código.** Uma funcionalidade que movimenta fundos precisa ser preparada, testada e aceita antes da abertura.

As referências `roadmapdev.md` e o antigo roadmap do dapp contêm regras ultrapassadas. Esta página retoma os marcos distinguindo o trabalho decidido, o código escrito e as versões já atestadas.

## O pré-requisito atual

O protocolo está em reformulação: **uma faixa de liquidez única** substitui o ladder, **os muros são colocados e esvaziados a cada venda** e o vault paga uma recompensa em CUBIT a partir de uma reserva. A FDV de lançamento adotada é de **3,75 ETH**.

Essa nova versão está implantada na rede principal Ethereum, mercado aberto desde 22 de setembro de 2026. A implantação Sepolia serve para os testes.

## As etapas da reformulação

| Etapa | Conteúdo | Estado |
| --- | --- | --- |
| 1 | Faixa ampla no lançamento; remoção do ladder, de `rebalance`, de `raiseFloor` e dos keepers | Codificada e testada localmente |
| Vaults | Vault a 3% ao dia em CUBIT e vault de governança do launchpad | Codificados e testados localmente |
| 2 | Muros criados a cada venda; CUBIT dos muros atravessados para o vault; tokens dos filhos para o vault de governança | Codificada e testada localmente |
| 3 | Limpeza: remoção do fluxo WETH, da pausa e do guardian, e dos erros não utilizados | Codificada e testada localmente |
| 4 | Lançamento em uma transação: 80% na faixa, 20% na reserva do vault, compra de 0,1 ETH | Codificada e testada localmente |
| 5 | Reescrita dos testes e dos invariantes | Ainda não feita |

## Os marcos

| Marco | Função | Estado e condição |
| --- | --- | --- |
| D0 | Mercado V1 | Nova versão implantada na Ethereum, mercado aberto em 22 de setembro de 2026 no bloco 26.035.793 |
| 23 de setembro de 2026 | Momentum | Aberto: página do app somente leitura com os muros ativos, parcialmente consumidos e atravessados de cada token |
| 23 de setembro de 2026 | Forge pública | Aberta: launchpad aberto a todos, adicionado nesse dia com seu vault de governança, taxa de lançamento de 0,005 ETH |
| 26 de setembro de 2026 | mCUBIT Vault | Aberto: bloqueio de 24 h, recompensa de 3% ao dia em CUBIT a partir da reserva |
| A definir | Token do launchpad | Ainda não concebido; os ativos do vault de governança servirão de NAV para ele |

Nenhuma funcionalidade se abre sozinha: a equipe abriu Momentum e a Forge em 23 de setembro de 2026 e, depois, o Vault em 26 de setembro de 2026, por meio de transações explícitas. A administração dos módulos pelo endereço da equipe é permanente.

## Condições para o Vault

A contabilidade das recompensas deve resistir a depósitos, retiradas, resgates, ao teto de um dia, a arredondamentos e a substituições, sem nenhuma criação de CUBIT, nenhum pagamento a partir do principal e nenhum acesso aos fundos dos muros. A reserva é alimentada no lançamento e, depois, pelos muros atravessados.

## Condições para Momentum e Forge

Momentum continua sendo somente leitura: os muros ativos, parcialmente consumidos e atravessados de cada token. A Forge deve preservar o isolamento dos filhos e o controle do modelo; o envio dos tokens de seus muros ao vault de governança está em serviço na Ethereum desde 23 de setembro de 2026. Nada se abre com a passagem do tempo: a equipe adicionou o launchpad e depois o abriu, por meio de transações explícitas.

## Condições para uma versão de produção

O lançamento deve publicar suas identidades, parâmetros de compilação, bibliotecas vinculadas, bytecodes esperados e permissões. Os testes devem cobrir as fontes finais e estar vinculados a esse lançamento.

A adaptação do dapp, incluindo a divisão das vendas que atravessam muitos muros, os percursos de carteiras reais, os agregadores, os serviços e o monitoramento complementam os testes locais. Uma implantação não representa aceitação automática dessas novas alterações.

## Os anúncios históricos a reclassificar

Um “floor que só sobe”, um cruzamento do ponto de equilíbrio em uma capitalização predefinida, um token “deflacionário” pela queima dos muros ou uma “imutabilidade total” não descrevem a nova versão e suas permissões.

As comunicações devem indicar o muro financiado, seu alvo, os fundos alocados e a versão do protocolo. Os resultados históricos continuam consultáveis como tal nas [fontes](sources.md).
