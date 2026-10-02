---
description: "Respostas às perguntas frequentes sobre a faixa, os muros financiados a cada venda, as taxas, o Vault, as permissões e as versões."
section: "05 / VERIFICAR"
reading: "RESPOSTAS RÁPIDAS"
---

# Perguntas frequentes

## O que é um muro, concretamente?

Uma posição de liquidez financiada em ETH no pool, em um tick determinado abaixo do preço atual. A fórmula escolhe sua localização e os 12% das vendas determinam seu tamanho.

## O que é a faixa?

A posição única de negociação: 80% da oferta, colocada no lançamento, que cobre todos os preços acima do preço de lançamento e nunca é retirada. Compras e vendas seguem sua curva x·y=k. [A faixa de liquidez](comprendre/ladder.md).

## O alvo segue a máxima histórica?

Não. Ele usa o preço deixado por cada venda: `0,4 × preço atual + 0,6 × preço de lançamento`. Para uma base ilustrativa de 7 000, um retorno de 100k a 60k gera **28,2k**. [Veja o cálculo](comprendre/murs.md).

## Os muros antigos descem com o novo alvo?

Não. Um muro permanece em seu tick. Um financiamento que cai no mesmo tick o aprofunda; uma venda pode, porém, consumir seus ETH.

## Os 12% são alocados a cada venda?

Sim: cada venda aloca os ETH pendentes, entre eles seus 12%, em um muro no alvo calculado sobre o preço após a venda. No preço de lançamento ou abaixo dele, esse alvo ficaria acima do mercado: o muro é então colocado 1% abaixo do preço atual. Somente uma poeira pequena demais para criar uma posição e o caso extremo de um preço no topo do intervalo de ticks aguardam uma venda seguinte.

## As taxas LP estão incluídas nos 15%?

Não. Os 15% são a taxa do hook na venda; a taxa de compra é de 3%. A taxa LP da nova versão é 0,01%, com base de cálculo própria do pool. O pool Ethereum conectado aplica essa mesma taxa. [Detalhes das taxas](comprendre/taxes.md).

## O que acontece com um muro atravessado?

Um muro apenas parcialmente consumido permanece no lugar e se recarrega em ETH se o preço voltar a subir. Um muro totalmente atravessado é esvaziado pela venda que o atravessou: seus CUBIT vão para a reserva de recompensas do vault. [Veja a explicação](comprendre/burn.md).

## Uma venda pode atravessar um número ilimitado de muros?

Não. Cada muro atravessado custa cerca de 185 000 gas, e uma transação é limitada a 16 777 216 gas: uma venda atravessa no máximo cerca de 88 muros. Além disso, ela falha sem perda e precisa ser dividida. [Riscos e limites](securite/risques.md).

## CUBIT é deflacionário?

Não mais na nova versão. A oferta permanece fixada em 21 milhões, sem emissão, mas os CUBIT recomprados pelos muros não são mais queimados: eles alimentam a reserva de recompensas do vault.

## Ainda são necessários keepers?

Não. `rebalance` e `raiseFloor` foram removidos, e os muros são colocados e esvaziados durante as vendas. Nenhum bônus é pago a quem faz a chamada.

## Alguém pode bloquear as vendas?

Não. O hook não tem nenhum administrador, e ninguém pode pausar os swaps nem o mecanismo dos muros.

## A equipe mantém poderes?

Sim, de forma permanente. O endereço da equipe recebe a parcela da equipe nas taxas e pode substituir a qualquer momento, sem prazo de espera, os módulos periféricos do registro e, em seguida, ativá-los. Essas substituições não afetam nem o núcleo nem os saldos já presentes nos vaults. [As permissões](securite/permissions.md).

## As funções V2 estão disponíveis?

Sim: Momentum e a Forge desde 23 de setembro de 2026, o Vault desde 26 de setembro de 2026. [As funcionalidades V2](v2/prochaines-fonctionnalites.md).

## O que acontece se eu não resgatar minha recompensa todos os dias?

O valor resgatável tem teto de um dia, ou seja, 3% do depósito. Após 24 horas sem resgate, o excedente é perdido. A recompensa também é limitada pelo saldo da reserva.

## Um novo depósito prolonga o bloqueio do Vault?

Sim. Um depósito adicional reinicia o bloqueio de 24 h de toda a posição dessa carteira nesse contrato. A recompensa acumulada pode ser resgatada independentemente do bloqueio de retirada.

## O que acontece com meus fundos se o Vault for substituído?

Eles permanecem no Vault antigo, com sua reserva de recompensas e sua data de desbloqueio. Selecione esse contrato antigo para ler sua posição e executar suas saídas. Os fundos não são transferidos automaticamente para o novo módulo.

## Para onde vão os tokens absorvidos pelos muros de um filho Forge?

Para o vault de governança do launchpad, que também recebe as taxas de lançamento da Forge, em ETH. Cada depósito fica bloqueado ali por 30 dias a partir de seu registro — imediato para um depósito ou uma taxa de lançamento, na chamada de `lockUntracked` para tokens enviados diretamente —, mais a eventual extensão, e, depois, somente o deployer desse vault pode resgatá-lo: esse direito é definitivo e não pode ser transferido. Esse deployer pode estender o bloqueio, nunca encurtá-lo. [Momentum e Forge](v2/momentum-forge.md).

## Quem pode lançar um token na Forge?

Qualquer conta, pagando a taxa de lançamento exata de 0,005 ETH, que vai para o vault de governança e nunca é devolvida. A Forge não fazia parte do lançamento do CUBIT: a equipe adicionou o launchpad e o abriu em 23 de setembro de 2026. [Momentum e Forge](v2/momentum-forge.md).
