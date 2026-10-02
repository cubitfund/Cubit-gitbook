---
description: "Plano de teste manual na Sepolia para a nova versão: faixa, swaps, taxas, muros, vaults, substituições, recusas esperadas e ficha de registro numerada."
section: "05 / VERIFICAR"
reading: "PLANO DE TESTE NUMERADO"
search:
  keywords: ["teste de aceitação", "teste", "testnet", "Sepolia", "manual", "checklist", "plano", "gravidade", "registro", "recusa"]
---

# Plano de teste manual na Sepolia

Esta página é uma **lista de verificação executável manualmente**, na rede de teste Sepolia, por uma pessoa equipada com uma carteira. Cada caso tem um número estável no formato `T-01`, que pode ser citado em um relatório.

> **Antes de começar.** Este plano se refere à nova versão. O manifesto público do repositório descreve a implantação Sepolia **em serviço**, com taxas LP `100`: este plano se aplica a ela. Um caso que não se aplica à versão testada é registrado como “fora do escopo da versão”, nunca como “falha”.

Os valores citados vêm do código da nova versão, em `contracts/src/`, e das decisões de design de 14 de setembro de 2026. Um comportamento que não pôde ser estabelecido está marcado como **“a confirmar durante o teste”**.

## Como usar este plano

Cada seção apresenta seus casos em uma tabela de seis colunas. As duas últimas são preenchidas durante os testes de aceitação.

| Coluna | O que se escreve nela |
| --- | --- |
| Caso | O identificador estável, de `T-01` a `T-110` |
| Pré-condições | O que precisa ser verdadeiro antes de começar |
| Passos | As ações, em ordem |
| Resultado esperado | O que o código e as decisões preveem |
| Resultado observado | O que aconteceu, com o hash da transação ou o bloco de leitura |
| Gravidade | Vazia se conforme; caso contrário, Bloqueante, Maior, Menor ou Cosmético |

| Gravidade | Critério |
| --- | --- |
| Bloqueante | Perda ou bloqueio de fundos, taxa não cobrada, muro perdido, recompensa paga a partir do principal |
| Maior | Comportamento contrário às fontes, recusa ausente, número exibido errado |
| Menor | Diferença de exibição sem consequência na cadeia, mensagem imprecisa |
| Cosmético | Tipografia, diagramação, rótulo |

Uma transação **recusada conforme um caso de recusa é um sucesso**. Um hash significa apenas que a transação foi enviada: somente o recibo informa o sucesso.

**Alguns casos não passam pela interface.** Em suas fontes atuais, o dapp lê a ABI da versão em serviço e não expõe as ordens de saída exata, nem `claimTeam()`, nem as leituras detalhadas dos muros. Esses casos estão marcados como “chamada direta”: eles são executados com uma ferramenta de chamada de contrato, nos endereços do manifesto da implantação testada.

## 1. Preparação

Registre estes elementos **antes** do primeiro swap: eles servem de referência para todas as comparações posteriores.

- A rede: Sepolia, identificador de cadeia `11155111`.
- Os endereços da implantação testada, lidos em seu manifesto: token, hook, PoolManager, `poolId`, roteador, Lens, registro V2, Vault, lançador; depois, com o launchpad adicionado, vault de governança e Forge. **Não copie nenhuma chave privada para suas anotações.**
- Os parâmetros fixos: `fee`, `tickSpacing`, `LAUNCH_ETH`, `MIN_POOL_SUPPLY`, `launchTimestamp`, `moduleRevision`.
- O estado inicial: `snapshot()` do Lens, `band()` do hook, `totalSupply()` e `totalBurned()` do token, `pendingFloorEth`, `pendingAbsorbedTokens`, `wallCount()`, `activeWallCount()`, `teamAccrued`, `teamPaidCumulative`, `rewardReserve()` do Vault e o **número do bloco** de leitura.

Reserve ETH de teste **além** dos valores trocados: cada transação paga seu gas, e vários casos exigem transações recusadas, que também consomem gas.

| Caso | Pré-condições | Passos | Resultado esperado | Resultado observado | Gravidade |
| --- | --- | --- | --- | --- | --- |
| T-01 | Carteira instalada | Selecionar Sepolia; abrir o dapp conectado à versão testada | A rede é reconhecida; nenhum convite para assinar em outra cadeia |  |  |
| T-02 | Conta nova | Abastecer com ETH de teste por uma faucet Sepolia | Saldo visível na carteira e no dapp após atualização |  |  |
| T-03 | Manifesto em mãos | Comparar cada endereço exibido com o do manifesto | Identidades idênticas; `poolId`, `fee` e `tickSpacing` coincidem |  |  |
| T-04 | Nenhum swap emitido ainda | Ler `snapshot()` e anotar o bloco | Valores de referência registrados, bloco identificado |  |  |
| T-05 | Chamada direta | Ler `poolKey()` do hook | `currency0` igual ao endereço zero, `fee = 100`, `tickSpacing = 10`, `hooks` igual ao hook |  |  |
| T-06 | Registro V2 legível | Ler `moduleRevision()` e os endereços dos módulos | Revisão anotada; qualquer mudança durante os testes de aceitação exige nova verificação antes de cada assinatura |  |  |

## 2. Lançamento e faixa

Na inicialização do pool, o hook coloca **todo o seu depósito** em uma única posição `[minUsableTick, tickUpper]`, identificada por `BAND_SALT`. `tickUpper` é o tick de abertura arredondado para baixo ao spacing, de modo que a posição contém apenas CUBIT. O hook recusa um depósito inferior a `MIN_POOL_SUPPLY`, ou seja, 80% da oferta, e queima a poeira de arredondamento.

O lançamento completo também transfere 20% da oferta para a reserva do Vault e efetua uma compra de 0,1 ETH na mesma transação.

| Caso | Pré-condições | Passos | Resultado esperado | Resultado observado | Gravidade |
| --- | --- | --- | --- | --- | --- |
| T-07 | Lançamento efetuado, chamada direta | Ler `band()` | `lower = −887 270`; `upper` igual ao tick de abertura arredondado para baixo ao múltiplo de 10, ou seja, `155 390` para uma FDV de 3,75 ETH; liquidez não nula |  |  |
| T-08 | Transação de lançamento conhecida | Ler seus eventos | `BandBootstrapped(lower, upper, liquidity, tokens)` emitido uma vez, com os valores de `band()`; `tokens` igual ao depósito menos uma poeira de arredondamento |  |  |
| T-09 | Lançamento sem compra inicial | Ler `bandEth` e `bandTokens` em `snapshot()` antes de qualquer swap | `bandEth = 0`; `bandTokens` igual ao depósito, salvo arredondamentos |  |  |
| T-10 | Lançamento efetuado, chamada direta | Ler `token.balanceOf(hook)` | Zero, exceto transferência direta de um terceiro: o hook não mantém nenhum CUBIT bruto após a inicialização |  |  |
| T-11 | Chamada direta | Tentar acrescentar liquidez ao pool | Recusa `ExternalLiquidityForbidden`: o hook é o único provedor de liquidez |  |  |
| T-12 | Implantação de ensaio | Inicializar o pool com um depósito inferior a `MIN_POOL_SUPPLY` | Recusa `SupplyNotDeposited`; nenhuma faixa colocada |  |  |
| T-13 | Lançamento completo | Ler `rewardReserve()` do Vault após a transação de lançamento | Reserva igual a 20% da oferta, ou seja, 4,2 milhões de CUBIT; nenhuma alocação para a equipe nem airdrop |  |  |
| T-14 | Lançamento completo | Ler a compra do deployer na transação de lançamento | Compra de 0,1 ETH; `BuyTaxed` com 3% para a equipe; CUBIT recebidos livremente transferíveis |  |  |
| T-15 | Compra confirmada, chamada direta | Recalcular a saída esperada a partir das reservas virtuais da faixa | Saída coerente com a curva x·y=k após a taxa de 3% e as taxas LP; no início, 16,8 milhões de CUBIT contra 3 ETH virtuais — a confirmar durante o teste |  |  |
| T-16 | Compra e depois revenda dos CUBIT comprados | Ler `bandEth` antes, entre as duas operações e depois | `bandEth` aumenta na compra e depois volta para perto de seu valor inicial; nunca ultrapassa os ETH realmente trazidos pelas compras |  |  |

## 3. Percurso de compra e venda

O roteador expõe `swapExactIn(key, zeroForOne, amountIn, amountOutMin, recipient, deadline)` e `swapExactOut(key, zeroForOne, amountOut, amountInMax, recipient, deadline)`. `zeroForOne = true` compra CUBIT com ETH.

**Nas fontes atuais do dapp, a interface usa apenas a entrada exata.** O usuário sempre digita o valor que paga; a quantidade recebida é um campo somente leitura. Os percursos de saída exata devem, portanto, ser testados por chamada direta ao roteador.

Uma compra envia ETH nativo em `msg.value`. Uma venda envia valor nulo e exige uma **aprovação ERC-20** do CUBIT ao roteador: a interface solicita a autorização **do valor exato**, nunca ilimitada; por isso, uma venda maior exige uma nova autorização.

O roteador recusa preenchimentos parciais: uma entrada exata não totalmente consumida aciona `IncompleteInput`, e uma saída exata não totalmente atendida aciona `InsufficientOutput`. Como a taxa é dimensionada sobre o valor solicitado, o cancelamento protege o usuário.

Configurações da interface lidas nas fontes do dapp, a verificar durante os testes de aceitação: tolerância de slippage **padrão de 1,0%**, entrada limitada a **duas casas decimais** e ao intervalo `0` a `99,99`; mínimo recebido calculado em inteiros e **arredondado para o wei superior**; cotação **atual por 30 segundos**; prazo on-chain = timestamp da cadeia **mais 120 segundos menos a idade da cotação**.

| Caso | Pré-condições | Passos | Resultado esperado | Resultado observado | Gravidade |
| --- | --- | --- | --- | --- | --- |
| T-17 | Saldo de ETH suficiente | Comprar um valor pequeno, por exemplo 0,001 ETH | Recibo de sucesso; CUBIT creditados; evento `BuyTaxed` emitido |  |  |
| T-18 | Saldo de ETH elevado | Comprar um valor alto | Recibo de sucesso; o impacto de preço aparece na cotação, não no percentual da taxa |  |  |
| T-19 | CUBIT na carteira | Aprovar e depois vender | Duas transações distintas; ETH líquido recebido; `SellTaxed` emitido |  |  |
| T-20 | Venda anterior confirmada | Vender um valor **superior** ao anterior | Uma nova autorização é solicitada: a aprovação cobria o valor exato |  |  |
| T-21 | Tela de swap aberta | Ler a tolerância proposta sem alterá-la | Valor padrão **1,0%** |  |  |
| T-22 | Tela de swap aberta | Digitar `0.005`, depois `100`, depois um valor negativo | Entradas recusadas com uma mensagem sobre o intervalo 0–99,99 e as duas casas decimais |  |  |
| T-23 | Cotação atual | Ajustar a tolerância para o menor valor aceito, esperar um movimento de preço e depois assinar | Recusa `TooLittleReceived(received, minimum)`; nenhum token perdido; a interface não sugere remover a proteção |  |  |
| T-24 | Cotação exibida | Deixar passar mais de 30 segundos sem ação e depois tentar assinar | A cotação é considerada desatualizada e recalculada antes de qualquer assinatura |  |  |
| T-25 | Cotação quase desatualizada | Assinar pouco antes da expiração e ler o prazo transmitido | O prazo vale 120 segundos **menos** a idade da cotação: uma cotação de 30 segundos deixa cerca de 90 segundos |  |  |
| T-26 | Chamada direta | Chamar `swapExactIn` com um prazo já vencido | Recusa `Expired`; nenhuma movimentação de fundos |  |  |
| T-27 | Chamada direta | Chamar `swapExactOut` para uma compra, com um teto de entrada folgado | Quantidade exata recebida; excedente de ETH reembolsado ao caller na mesma transação |  |  |
| T-28 | Chamada direta | Chamar `swapExactOut` com um teto de entrada um wei abaixo do valor exigido | Recusa `TooMuchRequested(required, maximum)` |  |  |
| T-29 | Saldo de CUBIT superior ao que a faixa e os muros podem recomprar, por exemplo CUBIT recebidos como recompensa | Vender esse saldo em entrada exata pelo roteador | Recusa `IncompleteInput`; a taxa é anulada junto com a transação — a confirmar durante o teste |  |  |
| T-30 | Chamada direta | Solicitar em saída exata mais ETH do que o livro pode atender | Recusa `InsufficientOutput`; nenhuma liquidação parcial |  |  |
| T-31 | Chamada direta | Enviar sucessivamente um valor nulo, um destinatário nulo, um valor `msg.value` incoerente e depois outra chave de pool | Recusas respectivas `InvalidAmount`, `ZeroRecipient`, `WrongValue`, `WrongPool` |  |  |
| T-32 | Roteador de terceiros compatível | Comprar e depois vender por uma rota de terceiros | As taxas do hook se aplicam |  |  |
| T-33 | Contrato de chamada ou lote de transações | Encadear uma compra e depois uma venda na **mesma transação** | As duas pernas são taxadas separadamente |  |  |

## 4. Taxas e contabilidade

| Operação | Base | Distribuição |
| --- | --- | --- |
| Compra | 3% da perna bruta em ETH | 100% parcela da equipe; a alocação aos muros é explicitamente nula |
| Venda | 15% dos ETH brutos de saída | 12% para os muros, 3% para a equipe |

Em entrada exata, a taxa de compra está **incluída** no valor fornecido e arredondada para o wei superior. Em saída exata, ela é somada por cima da perna do pool, de modo que a taxa em relação ao total continua sendo 3%.

Para uma venda de saída exata, a taxa vale `ceil(saída × 1500 / 8500)`: o pool produz a saída solicitada **mais** a taxa. Para uma venda de entrada exata, ela vale `ceil(bruto × 15%)`. Na distribuição, a parcela da equipe é arredondada para baixo e **todo o resíduo em wei vai para os muros**.

Nas fontes atuais do dapp, a interface exige ler esses percentuais na cadeia antes de autorizar um swap: enquanto eles não forem verificados, o botão permanece em espera.

| Caso | Pré-condições | Passos | Resultado esperado | Resultado observado | Gravidade |
| --- | --- | --- | --- | --- | --- |
| T-34 | Compra confirmada | Ler `BuyTaxed(ethIn, toFloor, toTeam)` | `toFloor` vale zero; `toTeam` vale 3% da entrada bruta, arredondado para o wei superior |  |  |
| T-35 | Compra confirmada | Comparar `teamAccrued` antes e depois | Aumento igual à parcela da equipe |  |  |
| T-36 | Venda confirmada | Ler `SellTaxed(ethOut, toFloor, toTeam)` | `toFloor + toTeam` é igual a 15% do bruto; `toTeam` vale 3% do bruto; a soma é exata até o wei |  |  |
| T-37 | `teamAccrued` não nulo, chamada direta | Chamar `claimTeam()` a partir de qualquer conta | Os fundos vão para o endereço fixo da equipe; `TeamPaid(amount, cumulative)` emitido; `teamAccrued` zerado |  |  |
| T-38 | `teamAccrued` nulo, chamada direta | Chamar `claimTeam()` | A chamada não retorna erro e não transfere nada |  |  |
| T-39 | Uma compra e depois uma venda do mesmo valor | Comparar o ETH inicial e o ETH final, sem o gas | O fator conservado se aproxima de `0,97 × 0,85 = 0,8245`; a diferença se explica pelas taxas LP, pelo impacto e pelos arredondamentos |  |  |
| T-40 | Duas vendas de tamanhos muito diferentes | Comparar as taxas em relação aos brutos | O percentual continua sendo 15% nos dois casos; nenhum escalonamento nem isenção |  |  |

## 5. Muros automáticos

A cada venda, em entrada exata ou em saída exata, o hook chama `_collectCrossedWalls()` e depois `_placeWall()`. Ele primeiro esvazia todos os muros que o preço atravessou totalmente, do mais próximo ao mais distante, e depois aloca todos os ETH pendentes no alvo `0,4 × preço atual + 0,6 × preço de lançamento`, calculado sobre o preço **após** a venda e arredondado ao tick. Se esse alvo não estiver estritamente acima do tick do pool, o que acontece no preço de lançamento ou abaixo dele, o muro é colocado 1% abaixo do preço atual.

Um muro esvaziado soma seus CUBIT a `pendingAbsorbedTokens` e devolve seus ETH restantes, taxas e poeira, a `pendingFloorEth`. Um muro apenas parcialmente consumido permanece no lugar. Somente um valor pequeno demais para criar liquidez e o caso extremo de um preço no topo do intervalo de ticks, onde nenhum muro cabe abaixo do preço, deixam fundos aguardando em `pendingFloorEth`: a venda nunca é recusada por isso. Em seguida, o roteador CUBIT chama `deliverAbsorbed()` em um try/catch.

A referência `floorPrice()` do Lens descreve o **último muro financiado**, não um mínimo global. Cada muro atravessado custa cerca de 185 000 gas: uma venda atravessa no máximo cerca de 88 muros dentro do limite de 16 777 216 gas de uma transação.

| Caso | Pré-condições | Passos | Resultado esperado | Resultado observado | Gravidade |
| --- | --- | --- | --- | --- | --- |
| T-41 | Preço acima do preço de lançamento | Vender e depois ler os muros | `WallFunded(id, lower, addedEth, liquidity)` emitido; um muro é criado ou aprofundado no tick alvo com os ETH pendentes, entre eles os 12% da venda, salvo arredondamentos; `pendingFloorEth` retém apenas o resíduo não alocado |  |  |
| T-42 | Situação anterior | Recalcular o alvo a partir do preço **após** a venda e do preço de lançamento | O `lower` do muro corresponde ao alvo 40/60 calculado sobre esse preço, arredondado ao tick |  |  |
| T-43 | Duas vendas cujo alvo cai no mesmo tick | Ler `wallCount()` e `walls(id)` | Um único muro: os dois `WallFunded` têm o mesmo `id`, a liquidez aumenta, nenhum identificador é criado |  |  |
| T-44 | Vários muros em ticks diferentes | Vender e comprar várias vezes e depois reler `walls(id)` | O `lower` de cada muro permanece inalterado; nenhum muro é movido |  |  |
| T-45 | Muro ativo abaixo do preço | Vender um valor que consome parcialmente o muro sem atravessá-lo | O muro permanece ativo com ETH e CUBIT; nenhum `WallAbsorbed`; `pendingAbsorbedTokens` inalterado |  |  |
| T-46 | Muro parcialmente consumido | Comprar até voltar acima do muro | O muro revendeu seus CUBIT e recuperou ETH; seu identificador e seu tick estão inalterados |  |  |
| T-47 | Muro ativo, venda pelo roteador CUBIT | Vender um valor que atravessa totalmente o muro | `WallAbsorbed(id, cubit, ethRemaining)` e `TokensAbsorbed(amount, pendingAbsorbedTokens)` e, depois, `AbsorbedDelivered(sink, amount)` e `RewardReserveFunded` na mesma transação; `rewardReserve()` aumenta com esses CUBIT; `pendingAbsorbedTokens` volta a zero; `totalSupply()` e `totalBurned()` estão inalterados |  |  |
| T-48 | Preço próximo do preço de lançamento, alvo 40/60 não abaixo do mercado | Vender um valor pequeno que possa ser atendido e depois ler os muros | A venda é bem-sucedida; `WallFunded` emitido; o muro é colocado 1% abaixo do preço após a venda, arredondado ao tick; `pendingFloorEth` retém apenas o resíduo não alocado |  |  |
| T-49 | Situação de T-48 | Vender de novo um valor pequeno que possa ser atendido e depois ler `pendingFloorEth` | `WallFunded` emitido 1% abaixo do novo preço; `pendingFloorEth` retém apenas uma poeira de arredondamento: nenhum acúmulo se forma de uma venda para outra |  |  |
| T-50 | Roteador de terceiros compatível | Vender atravessando totalmente um muro por uma rota de terceiros e depois chamar `deliverAbsorbed()` a partir de uma conta qualquer | Taxas aplicadas; `TokensAbsorbed` emitido e os CUBIT permanecem em `pendingAbsorbedTokens` até a chamada, que emite `AbsorbedDelivered` |  |  |
| T-51 | Vários muros financiados | Ler `floorPrice()` e `netFloorPrice()` do Lens e depois `wallAmountsPage(0, 500)` e as páginas seguintes até `activeWallCount`, todas no mesmo bloco | Referência do último muro financiado, apresentada como tal; os CUBIT dos muros são a soma das páginas mais `pendingAbsorbedTokens`, somado uma única vez |  |  |
| T-52 | Filho Forge, muro totalmente atravessado | Ler `absorbedTokenSink()` do hook filho e depois os eventos da venda | Destino igual a `governanceVault()` da Forge; `AbsorbedDelivered` emitido; lote `Deposited(token, from, amount, unlockAt)` bloqueado por 30 dias |  |  |
| T-106 | Muitos muros a atravessar em uma venda | Estimar o gas da venda e depois enviá-la | Cerca de 185 000 gas por muro atravessado; além de cerca de 88 muros, a venda ultrapassa 16 777 216 gas e falha sem perda: dividi-la |  |  |
| T-107 | Implantação de ensaio cujo destino dos CUBIT recusa o envio | Vender atravessando um muro pelo roteador CUBIT e depois chamar `deliverAbsorbed()` novamente | A venda é bem-sucedida; os CUBIT permanecem em `pendingAbsorbedTokens`; a chamada é aberta a qualquer conta e falha enquanto o destino recusar |  |  |

## 6. mCUBIT Vault

O Vault paga uma recompensa **em CUBIT**, retirada exclusivamente de `rewardReserve`. Ela vale `DAILY_REWARD_BPS = 300`, ou seja, 3% do depósito por período de 24 horas (`REWARD_PERIOD`), calculada proporcionalmente e **limitada a um período**: além dele, o excedente é perdido. Ela nunca ultrapassa o saldo da reserva e nunca é paga a partir do principal.

Cada depósito reinicia um bloqueio de **24 horas** (`LOCK_DURATION`) sobre toda a posição da carteira; a retirada antes do vencimento é recusada por `Locked`. Um depósito, uma retirada ou um resgate paga primeiro a recompensa acumulada e reinicia o período. Qualquer conta pode alimentar a reserva com `fundRewardReserve(amount)`. O vencimento é avaliado pelo timestamp da cadeia, não pelo relógio do navegador.

A recompensa é **exclusivamente em CUBIT**, resgatada com `claimCubit()`: o Vault não expõe nenhuma função de recompensa em WETH.

| Caso | Pré-condições | Passos | Resultado esperado | Resultado observado | Gravidade |
| --- | --- | --- | --- | --- | --- |
| T-53 | Vault disponível, CUBIT na carteira | Aprovar e depois depositar | `Staked(user, amount, unlockAt)` emitido; `unlockAt` igual ao timestamp do bloco mais 24 horas |  |  |
| T-54 | Posição existente | Depositar novamente antes do vencimento | O bloqueio é **reiniciado para toda a posição**; a recompensa acumulada, se não for nula, é paga com `CubitRewardClaimed` e o período recomeça |  |  |
| T-55 | Bloqueio em curso | Solicitar uma retirada | Recusa `Locked` |  |  |
| T-56 | Bloqueio vencido | Retirar parte do depósito | Retirada parcial aceita; `Withdrawn` emitido; a recompensa acumulada é paga primeiro; o saldo restante continua depositado |  |  |
| T-57 | Depósito de 1 000 CUBIT, reserva suficiente | Ler `pendingCubit` após 12 horas e depois após 24 horas | Cerca de 15 CUBIT e depois 30 CUBIT |  |  |
| T-58 | Situação anterior | Esperar 48 horas sem resgatar e depois ler `pendingCubit` | Ainda 30 CUBIT: o segundo dia é perdido |  |  |
| T-59 | Recompensa acumulada | Chamar `claimCubit()` | CUBIT transferidos; `CubitRewardClaimed` emitido; `rewardReserve` diminui no valor pago; `pendingCubit` volta a zero |  |  |
| T-60 | Implantação de ensaio com uma reserva pequena | Resgatar uma recompensa superior à reserva | Apenas o saldo da reserva é pago; a reserva cai a zero; o principal não é tocado |  |  |
| T-61 | Chamada direta | Chamar `fundRewardReserve(0)` e depois `fundRewardReserve(x)` a partir de uma conta qualquer após a aprovação | Recusa `InvalidAmount` e depois `RewardReserveFunded(from, x)`; `rewardReserve` aumenta em `x` |  |  |
| T-62 | Chamada direta | Comparar `token.balanceOf(vault)` com `totalStaked + rewardReserve` em vários momentos | O saldo do Vault nunca é inferior a essa soma |  |  |
| T-63 | Valor nulo, chamada direta | Chamar `stake(0)` e depois `withdraw(0)` | Recusa `InvalidAmount` nos dois casos |  |  |
| T-64 | Vault não conectado ao registro atual | Tentar um depósito | Recusa `Inactive` |  |  |
| T-65 | Posição aberta | Ler a duração do bloqueio exibida | Exibição em horas, derivada de `LOCK_DURATION`: 24 horas |  |  |
| T-66 | Dapp aberto | Procurar um percurso de recompensa em WETH | Nenhum: somente a recompensa em CUBIT é oferecida |  |  |

## 7. Vault de governança do launchpad

O vault de governança recebe as taxas de lançamento da Forge, em ETH, e os tokens absorvidos pelos muros dos filhos Forge. **Cada depósito fica bloqueado por 30 dias** (`LOCK_DURATION`) a partir de seu próprio recebimento. **Somente o deployer** pode resgatar, para sempre e sem possibilidade de transferir esse direito, e apenas os lotes cuja data já passou, do mais antigo ao mais recente. O ETH é contabilizado sob a chave `ETH()`, o endereço zero. Releia a ABI da implantação testada antes dos testes de aceitação. O deployer pode estender o bloqueio de todos os depósitos, presentes e futuros, com `extendLock`; `lockExtension()` só aumenta e é somado a cada data.

O envio automático a partir dos muros dos filhos é verificado por T-52, e o depósito da taxa de lançamento por T-81. Os casos T-67 a T-73 depositam tokens de teste por chamada direta; T-108 resgata o ETH de uma taxa.

| Caso | Pré-condições | Passos | Resultado esperado | Resultado observado | Gravidade |
| --- | --- | --- | --- | --- | --- |
| T-67 | Token de teste, chamada direta | Aprovar e depois chamar `deposit(token, amount)` | `Deposited(token, from, amount, unlockAt)` emitido; `unlockAt` igual ao timestamp do bloco mais 30 dias; `held(token)` aumenta no mesmo valor |  |  |
| T-68 | Depósito com menos de 30 dias | Chamar `claim(token, n)` a partir do deployer | Recusa `NothingToClaim` |  |  |
| T-69 | Lote desbloqueado | Chamar `claim(token, n)` a partir de outra conta | Recusa `NotDeployer` |  |  |
| T-70 | Um depósito por dia durante 7 dias | Resgatar todos os dias a partir do 30º dia após o primeiro depósito | Um lote sai por dia, do mais antigo ao mais recente; o último sai 30 dias após o sétimo depósito; `Claimed(token, amount, tranches)` a cada resgate |  |  |
| T-71 | Vários lotes desbloqueados | Chamar `claim(token, 1)` | Um único lote pago; o seguinte continua resgatável |  |  |
| T-72 | Tokens enviados por simples transferência | Chamar `lockUntracked(token)` e depois chamá-lo novamente sem nova transferência | Novo lote bloqueado por 30 dias a partir da primeira chamada; a segunda chamada é recusada por `NothingToLock` |  |  |
| T-73 | Lotes bloqueados e desbloqueados | Ler `claimable(token)` e `locked(token)` | O valor resgatável mais o valor bloqueado é igual a `held(token)` |  |  |
| T-108 | Taxa de lançamento de T-81 depositada há mais de 30 dias | Chamar `claim(address(0), 1)` a partir de outra conta e depois a partir do deployer | Recusa `NotDeployer` e depois ETH pagos ao deployer; `Claimed(address(0), amount, 1)` emitido; `held(address(0))` diminui do valor pago |  |  |
| T-109 | Lotes bloqueados | Chamar `extendLock(extra)` a partir de outra conta e depois a partir do deployer | Recusa `NotDeployer` e depois `LockExtended(extra, lockExtension)` emitido; cada data lida com `tranche(token, i)` avança `extra`; nenhuma função encurta o bloqueio |  |  |

## 8. Forge

A Forge é um launchpad público, apresentado como lançamento futuro. Ela não faz parte do lançamento do CUBIT: é adicionada depois, com seu vault de governança. Anote seus endereços depois que o launchpad for adicionado.

Qualquer conta lança um filho pagando a taxa exata. Um filho Forge deposita toda a sua oferta em sua faixa, a Forge recebe o endereço do vault de governança em sua construção, e cada lançamento paga sua taxa de 0,005 ETH a esse vault, que a mantém: quem lança nunca a recupera. Os salts de implantação são vinculados a quem lança.

| Caso | Pré-condições | Passos | Resultado esperado | Resultado observado | Gravidade |
| --- | --- | --- | --- | --- | --- |
| T-81 | Forge disponível, qualquer conta | Lançar um filho com a taxa exata de 0,005 ETH | `ChildLaunched(token, hook, launcher, team, fee)` emitido; `BandBootstrapped` do filho indica um depósito igual a toda a sua oferta, salvo arredondamentos; o vault de governança emite `Deposited(address(0), forge, fee, unlockAt)`, com `unlockAt` igual ao timestamp do bloco mais 30 dias e a eventual extensão; `pendingFloorEth` do hook pai inalterado |  |  |
| T-82 | Forge disponível | Tentar um lançamento com valor incorreto, nome vazio, equipe nula ou outro modelo | Recusa: `wrong launch fee`, `invalid name`, `invalid team` ou `template mismatch` |  |  |
| T-110 | Salts de um lançamento vistos por outra conta | Lançar a partir de uma segunda conta com os mesmos salts | Os endereços do primeiro lançamento não são tomados: os salts são vinculados a quem lança, e o segundo lançamento é recusado por `child deployment failed` se seu endereço de hook não tiver as permissões |  |  |

## 9. Substituições e poderes

A autoridade do registro pode substituir quatro endereços periféricos a qualquer momento, sem prazo de espera: Vault, roteador, Lens e Forge. Cada substituição emite `ModuleUpdated`, **incrementa `moduleRevision`** e fecha a funcionalidade correspondente até que a equipe a reabra: Vault, Momentum ou Forge; substituir o roteador não fecha nenhuma funcionalidade. Um candidato já registrado, conectado a outro hook ou a outro token, ou que já tenha stake, é recusado por `InvalidModule`.

O hook não tem **nenhum administrador**, e ninguém pode pausar os swaps nem o mecanismo dos muros. O endereço da equipe mantém poderes permanentes: ele recebe a parcela da equipe nas taxas e substitui e, em seguida, ativa os módulos do registro.

| Caso | Pré-condições | Passos | Resultado esperado | Resultado observado | Gravidade |
| --- | --- | --- | --- | --- | --- |
| T-83 | Depósitos e reserva no Vault atual | Substituir o Vault | CUBIT depositados, reserva de recompensas e vencimentos **permanecem no Vault antigo**; nenhum fundo movido |  |  |
| T-84 | Vault substituído | No Vault antigo, resgatar, depois retirar e depois tentar um depósito | Resgate e retirada continuam disponíveis; o novo depósito é recusado por `Inactive` |  |  |
| T-85 | Candidato já registrado, ou com stake | Tentar a rotação | Recusa `InvalidModule` |  |  |
| T-86 | Substituição efetuada | Ler `moduleRevision()` e o evento; após uma substituição do Vault, tentar um depósito no novo Vault | Revisão incrementada; `ModuleUpdated(module, previous, current, revision)` coincide; o depósito é recusado por `Inactive` até a reativação do Vault |  |  |
| T-87 | Aprovação concedida ao roteador antigo | Substituir o roteador e depois tentar uma venda | A aprovação antiga não vale para o novo spender; uma nova autorização é solicitada |  |  |
| T-88 | Roteador substituído | Fazer swap pelo roteador antigo | O swap continua possível e as taxas do hook se aplicam; a dapp usa o novo roteador |  |  |
| T-89 | Chamada direta | Inspecionar a ABI do hook implantado | Nenhuma função permite suspender os swaps ou o mecanismo dos muros; o hook não tem nenhum administrador |  |  |
| T-90 | Chamada direta | Ler `snapshot()` do Lens e depois as páginas de muros no mesmo bloco | O snapshot contém apenas campos de mercado, faixa, muros, contas, a oferta total, a reserva de recompensas, o número de muros ativos, o bloco de leitura e o melhor muro: nenhum total de muros, e seu custo não depende do número de muros; a oferta em circulação é igual a `totalSupply` menos os CUBIT dos muros e `rewardReserve`, e os CUBIT em mãos dos holders são essa oferta menos `bandTokens` |  |  |
| T-91 | A qualquer momento após o lançamento | Comprar e vender | Os swaps funcionam normalmente: nenhuma conta pode bloqueá-los |  |  |

## 10. Casos de recusa esperados

Esta tabela serve de referência durante todos os testes de aceitação. Os muros automáticos não acrescentam recusas à venda: um muro que não pode ser colocado deixa os fundos pendentes, e um envio malsucedido deixa os CUBIT pendentes.

> **Ponto de atenção.** Nas fontes atuais do dapp, os erros de contrato não são traduzidos: uma recusa on-chain pode aparecer como uma mensagem bruta, truncada na exibição. **Para cada recusa acionada, registre o texto exato exibido** e avalie se ele é compreensível.

| Erro | O que o aciona | O que o aplicativo deveria mostrar |
| --- | --- | --- |
| `ExternalLiquidityForbidden` | Acréscimo de liquidez por um terceiro | Operação impossível: o protocolo é o único provedor de liquidez |
| `SupplyNotDeposited` | Inicialização com um depósito inferior a 80% da oferta | Lançamento impossível, depósito insuficiente |
| `Expired` | Prazo da transação vencido | Cotação expirada, calcule uma nova |
| `TooLittleReceived(received, minimum)` | Saída inferior ao mínimo aceito | Proteção de slippage acionada |
| `TooMuchRequested(required, maximum)` | Entrada superior ao teto aceito | Proteção de teto de entrada acionada |
| `IncompleteInput` | Entrada exata não totalmente consumida | Valor grande demais para a liquidez disponível |
| `InsufficientOutput` | Saída exata não totalmente atendida | O livro não consegue atender essa saída |
| `InvalidAmount`, `ZeroRecipient`, `WrongValue`, `WrongPool` | Parâmetros de ordem inválidos, ou valor nulo enviado ao Vault | Erro de preenchimento, sem código bruto |
| `Inactive`, `Locked` | Vault não conectado ao registro atual, ou retirada antes do vencimento | Módulo indisponível, ou data de desbloqueio |
| `NotDeployer`, `NothingToClaim`, `NothingToLock`, `NothingToExtend` | Resgate ou extensão no vault de governança por um terceiro, resgate antes do vencimento, bloqueio sem novo saldo, extensão nula | Ação reservada, nada a resgatar, nada a bloquear ou nada a estender |
| `NotAuthority`, `InvalidModule` | Substituição solicitada por um terceiro, ou candidato incompatível | Substituição recusada, com o motivo |

As recusas puramente do aplicativo também são registradas: cotação desatualizada, contexto de swap alterado, carteira em outra cadeia, conta trocada, revisão de módulos alterada, percentuais das taxas ainda não verificados.

## 11. Aplicativo

Estes casos são executados com o dapp. Os comportamentos de interface citados vêm de suas fontes e são verificados durante os testes de aceitação.

| Caso | Pré-condições | Passos | Resultado esperado | Resultado observado | Gravidade |
| --- | --- | --- | --- | --- | --- |
| T-92 | Dapp aberto | Percorrer os dez idiomas do seletor | Cada idioma exibe um conteúdo traduzido, sem texto faltando nem transbordamento; os nomes de produtos permanecem em inglês por escolha |  |  |
| T-93 | Idioma escolhido | Recarregar e depois reduzir a janela para menos de 640 px | A escolha é mantida de uma sessão para outra; abaixo de 640 px, o seletor exibe apenas a bandeira |  |  |
| T-94 | Idioma diferente do inglês | Comparar o título da página inicial com a versão em inglês | O título é propositalmente reduzido fora do inglês; ele não deve transbordar nem ser cortado |  |  |
| T-95 | Tela de cerca de 400 px | Percorrer cada tela | Nenhum transbordamento horizontal; as áreas largas rolam em seu próprio contêiner; os botões continuam acessíveis |  |  |
| T-96 | Janela entre 768 e 1279 px | Abrir a navegação | O menu compacto é usado até 1279 px; ele se fecha após a navegação |  |  |
| T-97 | Transação confirmada | Comparar cada valor exibido com os valores on-chain no mesmo bloco | Os valores coincidem; os arredondamentos de exibição não alteram o valor assinado |  |  |
| T-98 | Operação em preparação | Trocar de rede na carteira no meio do percurso | A cotação é invalidada e a assinatura recusada fora da rede esperada; o botão propõe primeiro a troca de rede e depois exige uma segunda ação para negociar |  |  |
| T-99 | Operação em preparação | Trocar de conta na carteira no meio do percurso | Saldos, autorização e cotação são recalculados para a nova conta; uma assinatura preparada para a conta anterior é recusada |  |  |
| T-100 | Autorização concedida, swap não assinado | Deixar a revisão dos módulos mudar entre as duas ações | O aplicativo revalida o contexto e não passa silenciosamente para um novo spender |  |  |
| T-101 | RPC indisponível ou leitura antiga | Cortar o acesso ao RPC e depois observar | O estado é sinalizado como não verificado e as ações são desativadas |  |  |
| T-102 | Transação enviada | Acompanhar o hash e depois o recibo | A interface distingue “enviada” e “bem-sucedida”; os eventos podem ser verificados em um explorador Sepolia |  |  |
| T-103 | Uma recusa on-chain provocada | Registrar o texto exibido, na íntegra | A mensagem deve continuar compreensível para um usuário; registrar qualquer código técnico bruto ou mensagem truncada |  |  |
| T-104 | Idiomas chinês, coreano e japonês | Exibir esses idiomas sem acesso a um serviço de fontes externo | Os caracteres são exibidos corretamente: as fontes são servidas pelo site |  |  |
| T-105 | Tela Proof aberta | Ler a faixa, os muros e os fundos pendentes | `bandEth`, `bandTokens`, os muros, os ETH pendentes e os CUBIT aguardando envio são exibidos separadamente; nenhuma tela apresenta ladder, keepers ou queima dos muros |  |  |

## 12. Ficha de registro

Cada tabela das seções anteriores **é** a ficha de registro de sua seção: preencha as colunas “Resultado observado” e “Gravidade” à medida que avança pelos casos. No resultado observado, anote no mínimo o hash da transação ou o bloco de leitura e, depois, o que foi constatado.

Resumo a anexar ao relatório:

| Seção | Casos | Conformes | Desvios | Gravidade máxima |
| --- | --- | --- | --- | --- |
| 1. Preparação | T-01 a T-06 |  |  |  |
| 2. Lançamento e faixa | T-07 a T-16 |  |  |  |
| 3. Compra e venda | T-17 a T-33 |  |  |  |
| 4. Taxas e contabilidade | T-34 a T-40 |  |  |  |
| 5. Muros automáticos | T-41 a T-52, T-106 e T-107 |  |  |  |
| 6. mCUBIT Vault | T-53 a T-66 |  |  |  |
| 7. Vault de governança | T-67 a T-73, T-108 e T-109 |  |  |  |
| 8. Forge | T-81, T-82 e T-110 |  |  |  |
| 9. Substituições e poderes | T-83 a T-91 |  |  |  |
| 10. Casos de recusa | Referência transversal |  |  |  |
| 11. Aplicativo | T-92 a T-105 |  |  |  |

Um desvio se refere **ao número do caso**, nunca a uma captura de tela isolada. Anexe a rede, o endereço da implantação, o bloco, o hash e a versão do aplicativo.

## Limites deste plano

Este plano descreve o que o código da nova versão e as decisões de 14 de setembro de 2026 preveem. Ele **não constitui uma validação**: testes de aceitação bem-sucedidos na Sepolia não substituem as campanhas de testes.

Os pontos “a confirmar durante o teste” devem ser observados e, depois, incorporados a esta página.

<p class="source-note">Fontes: <code>contracts/src/CubitHook.sol</code>, <code>CubitLens.sol</code>, <code>interfaces/ICubitHook.sol</code>, <code>interfaces/ICubitLens.sol</code>, <code>libraries/BandLib.sol</code>, <code>libraries/WallLib.sol</code>, <code>periphery/CubitRouter.sol</code>, <code>CubitV2.sol</code>, <code>CubitVault.sol</code>, <code>CubitGovernanceVault.sol</code>, <code>CubitForge.sol</code>, <code>CubitLaunch.sol</code>, os percursos atuais de <code>dapp/src</code> e as decisões de design de 14 de setembro de 2026 registradas em <code>contracts/docs/REDESIGN_HANDOFF.md</code>.</p>
