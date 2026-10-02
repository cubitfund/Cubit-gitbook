---
description: "Momentum oferece uma visão somente leitura do mercado. A Forge é um launchpad público; suas taxas de lançamento e os tokens absorvidos pelos muros dos filhos vão para o vault de governança do launchpad."
section: "03 / MÓDULOS V2"
reading: "5 MIN DE LEITURA"
search:
  keywords: ["momentum", "forge", "filho", "launchpad", "público", "governança", "NAV", "bloqueio", "30 dias", "extensão"]
---

# Momentum e Forge

Esses dois módulos têm funções distintas: **Momentum torna visível o estado do mercado**, enquanto **a Forge permite que qualquer pessoa lance um mercado filho isolado**.

## Momentum: observar o mercado

Momentum é uma página do app: para cada token, ela mostra os muros ativos, os muros parcialmente consumidos e o histórico dos muros atravessados, a partir dos eventos do hook e das leituras do Lens. Ela está aberta desde 23 de setembro de 2026.

É uma funcionalidade **somente leitura**, sem poder para retirar ETH dos muros nem modificar as regras do núcleo. Uma mudança de exibição não é um comando de negociação.

A geometria realmente usada continua sendo a do hook. Ela não pode ser inventada por um componente do frontend.

## Forge: um launchpad público

A Forge é **aberta a todos**: qualquer conta lança um mercado filho pagando a taxa de lançamento exata. Ela não fazia parte do lançamento do CUBIT: a equipe a adicionou em 23 de setembro de 2026, com seu vault de governança, e a abriu no mesmo dia.

Cada filho recebe seu token, seu hook, suas identidades de pool e suas próprias reservas. O modelo de criação do hook é controlado por um hash fixado no construtor de Forge. Os salts de implantação são vinculados a quem lança: dois lançamentos no mesmo bloco não se invalidam, e copiar os salts de outra conta não toma o lançamento dela.

Um filho **deposita 100% de sua oferta em sua faixa**. Ele não tem reserva de vault nem alocação para a equipe. O nome, o símbolo, o endereço da equipe, o salt de implantação e o código fornecido são verificados. Assim como o do pai, o hook de um filho não tem nenhum administrador. Criar um filho não concede permissão sobre o pool CUBIT pai. Os parâmetros são impostos: a mesma avaliação de lançamento, a mesma oferta e as mesmas taxas para cada filho.

## O vault de governança do launchpad

O **vault de governança do launchpad** recebe as taxas de lançamento da Forge, em ETH, e os tokens absorvidos pelos muros dos filhos, que não vão para o vault de staking do pai:

- cada depósito fica bloqueado ali por **30 dias a partir de seu registro**, mais a eventual extensão: é imediato para um depósito, uma taxa de lançamento ou uma entrega de um filho, e só ocorre na chamada de `lockUntracked` para tokens enviados diretamente ao vault;
- **o deployer pode estender o bloqueio** de todo o vault, depósitos presentes e futuros, tokens e ETH, com `extendLock`, quando quiser; nenhuma função encurta um bloqueio;
- por exemplo, 10 tokens recebidos a cada dia durante 7 dias saem em 7 lotes, um por dia, o último após 1 mês e 7 dias;
- **somente o deployer** desse vault pode resgatar os lotes desbloqueados, para sempre: nenhuma função permite transferir esse direito;
- seus ativos são destinados a servir de referência de valor, ou NAV, para o token do launchpad.

A Forge recebe o endereço desse vault em sua construção, em `governanceVault`. O hook de um filho o encontra pela Forge que implantou seu token e, depois, `deliverAbsorbed()` transfere para lá os tokens dos muros esvaziados e os bloqueia com `lockUntracked`.

## A taxa de lançamento

Cada lançamento paga sua taxa ao vault de governança do launchpad, em ETH, por `depositEth()` e na mesma transação. A taxa passa então a pertencer à governança: **quem lança nunca a recupera** e **somente o deployer** do vault pode resgatá-la com `claim`. A taxa não financia os muros do CUBIT. Como todo depósito recebido por esse vault, ela segue depois a regra de bloqueio descrita acima.

O valor de `launchFee()` é fixado na construção de cada Forge: ele é de **0,005 ETH**, ou seja, 5 × 10^15 wei, e é imutável. Mudar a taxa exige, portanto, uma nova Forge; releia sempre o valor on-chain do contrato realmente usado.

## Se Forge for substituída

A equipe pode substituir a Forge a qualquer momento, sem prazo de espera. A substituição muda a factory de referência para os futuros lançamentos e, com ela, o vault de governança que recebe suas taxas; ela desativa a Forge até sua reativação. Os filhos já criados mantêm seus próprios contratos e fundos. Um launchpad v2 pode assim definir outros parâmetros para seus próprios lançamentos.

As verificações de compatibilidade do registro não substituem uma revisão do modelo e da factory.

## Um launchpad v2

Os parâmetros dos filhos são impostos pela Forge registrada. Uma Forge substituta, um launchpad v2, pode definir outros; a equipe a abre quando decidir.

Os filhos já lançados continuam funcionando em seus próprios pools, e os tokens absorvidos por seus muros continuam indo para o vault de governança da Forge que os lançou.

<p class="source-note">Fontes: decisões de design de 14 e 15 de setembro de 2026, <code>periphery/CubitForge.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>CubitHook.absorbedTokenSink</code>, <code>CubitV2.setForge</code> e <code>dapp/src/pages/Momentum.tsx</code>.</p>
