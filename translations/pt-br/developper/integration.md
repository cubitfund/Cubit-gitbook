---
description: "Identidades do pool, módulos substituíveis, faixa de liquidez, muros e envio dos CUBIT absorvidos, vaults, funções removidas, unidades e eventos de integração."
section: "04 / CONSTRUIR"
reading: "10 MIN DE LEITURA"
search:
  keywords: ["API", "ABI", "integração", "integration", "contrato", "endereço", "address", "band", "BAND_SALT", "MIN_POOL_SUPPLY", "bandEth", "bandTokens", "walls", "WallLib", "wallCount", "deliverAbsorbed", "pendingAbsorbedTokens"]
---

# Contratos e integração

Uma integração deve identificar **a cadeia, o núcleo do pool, a ABI e a revisão dos módulos**. Um endereço de roteador copiado de um relatório antigo pode ser substituído; uma nova ABI pode ser incompatível com o pool histórico.

> A ABI abaixo é a do código da nova versão. Exporte a ABI do lançamento validado e verifique os runtimes antes de conectar um cliente.

## Identidade do pool

A `PoolKey` contém `currency0`, `currency1`, `fee`, `tickSpacing` e `hooks`. Para CUBIT, ETH nativo é `currency0` e o token CUBIT é `currency1`.

| Campo | Leitura esperada |
| --- | --- |
| `currency0` | Endereço zero, representando ETH nativo |
| `currency1` | Token da implantação identificada |
| `fee` | `100` na versão em serviço, ou seja, 0,01% |
| `tickSpacing` | `10` nas fontes lidas |
| `hooks` | Hook da implantação identificada |

O poolId depende de toda essa chave. Alterar apenas `fee` em um frontend não transforma um pool antigo em uma nova implantação.

## Resolver os módulos no mesmo bloco

Leia primeiro o registro ancorado em `hook.v2()`. Depois resolva os endereços dos módulos disponíveis e `moduleRevision` no mesmo bloco. Verifique sua conexão com o núcleo.

Este é um trecho de **somente leitura**, para uso com um cliente viem já configurado e um endereço de registro verificado:

```ts
import { parseAbi, type Address, type PublicClient } from "viem";

const registryAbi = parseAbi([
  "function router() view returns (address)",
  "function moduleRevision() view returns (uint256)",
]);

export async function readRelease(
  client: PublicClient,
  registry: Address,
) {
  const blockNumber = await client.getBlockNumber();
  const [router, revision] = await Promise.all([
    client.readContract({ address: registry, abi: registryAbi,
      functionName: "router", blockNumber }),
    client.readContract({ address: registry, abi: registryAbi,
      functionName: "moduleRevision", blockNumber }),
  ]);
  return { blockNumber, router, revision };
}
```

Esse trecho não verifica sozinho todas as conexões e não autoriza nenhuma assinatura. O frontend do repositório as verifica em `resolveRelease`, `readRelease` e `assertCurrentDeployment`.

Antes de cada assinatura, compare os módulos e a revisão com o contexto já revisado pelo usuário. Não redirecione silenciosamente uma aprovação.

## Ler a faixa

| Elemento | Resultado / uso |
| --- | --- |
| `band()` | `(int24 lower, int24 upper, uint128 liquidity)` da posição única de negociação |
| `MIN_POOL_SUPPLY()` | Depósito mínimo aceito na inicialização: 80% da oferta |
| `BAND_SALT()` | Salt da posição da faixa, `keccak256("CUBIT.BAND")` |
| `BandBootstrapped(lower, upper, liquidity, tokens)` | Evento emitido uma única vez, na inicialização do pool |
| Lens `bandEth()` / `bandTokens()` | ETH e CUBIT mantidos pela faixa ao preço atual, sem contar as taxas LP |

`lower` vale `minUsableTick` para um spacing de 10, ou seja, −887 270. `upper` é o tick de abertura do pool arredondado para baixo ao spacing: com uma FDV de lançamento de 3,75 ETH, ele vale 155 390. Um arredondamento para cima tornaria a posição ativa e exigiria ETH.

O hook coloca na faixa **todo o seu depósito**. `afterInitialize` recusa um depósito inferior a `MIN_POOL_SUPPLY` com `SupplyNotDeposited`: o lançamento do pai deposita exatamente esse mínimo, e um filho Forge deposita toda a sua oferta. A poeira de arredondamento é queimada, de modo que o hook não mantém nenhum token bruto nem claim de CUBIT após a inicialização.

O snapshot do Lens substitui os antigos campos do ladder e dos keepers por `bandEth` e `bandTokens`. Esses valores se referem ao principal da posição: as taxas LP acumuladas na faixa não são coletadas nem contabilizadas.

## Ler múltiplos muros

| Visualização do hook | Resultado / uso |
| --- | --- |
| `wallCount()` | Número de identificadores históricos, distinto do número de posições ativas |
| `activeWallCount()` | Número de muros ativos no estado lido |
| `activeWallId(index)` | ID permanente em um índice da lista ativa atual |
| `latestWallId()` | ID do último muro financiado; primeiro verifique se existe um muro |
| `walls(id)` | `(int24 lower, uint128 liquidity, uint256 idleEth, uint256 fundedEth)` |
| `wallIdleEth()` | Total dos resíduos de ETH atribuídos aos muros |

As vendas criam, aprofundam e esvaziam os muros. Um muro esvaziado sai da lista ativa, mas mantém seu identificador e seu tick.

Os índices da lista ativa podem mudar após uma absorção. **Mantenha o ID do muro como identidade**, não seu índice de percurso. Leia a contagem e os elementos no mesmo bloco.

`fundedEth` representa o acumulado dos fundos efetivamente alocados nesse tick; não deve ser exibido como profundidade restante. `idleEth` representa um resíduo vinculado ao muro, distinto de sua liquidez alocada. O limite superior de um muro é `lower + tickSpacing`. Os fundos dos muros que não puderam ser alocados permanecem separados em `pendingFloorEth`.

Os campos históricos `floorPrice` e `netFloorPrice` do Lens descrevem o último muro financiado; eles não resumem todos os níveis. Para o muro ativo mais próximo do mercado, leia `bestWallPrice` e `netBestWallPrice`.

## Muros atravessados e envio dos CUBIT

A cada venda, em entrada exata ou em saída exata, `afterSwap` chama `_collectCrossedWalls()` e depois `_placeWall()`. Todos os muros que o preço atravessou totalmente são esvaziados, do mais próximo ao mais distante: seus CUBIT são somados a `pendingAbsorbedTokens` e seus ETH restantes, taxas realizadas e poeira, voltam para `pendingFloorEth`. Em seguida, `_placeWall()` aloca todos os ETH pendentes no alvo calculado sobre o preço após a venda. Se esse alvo não estiver estritamente acima do tick do pool, o que acontece no preço de lançamento ou abaixo dele, ele coloca o muro 1% abaixo do preço atual com `BandLib.underMarketWallTarget`. Somente um valor pequeno demais para criar uma posição e o caso extremo de um preço no topo do intervalo de ticks, onde nenhum muro cabe abaixo do preço, permanecem em `pendingFloorEth`.

| Elemento | Resultado / uso |
| --- | --- |
| `pendingAbsorbedTokens()` | CUBIT dos muros atravessados, isolados no hook em claims do PoolManager até seu envio |
| `deliverAbsorbed()` | Envio público e sem permissão desses CUBIT para `absorbedTokenSink()`; quem chama não escolhe destinatário nem valor |
| `absorbedTokenSink()` | Vault do registro para CUBIT; para um filho Forge, `governanceVault()` da Forge que implantou seu token |
| `WallFunded(id, lower, addedEth, liquidity)` | Muro criado ou aprofundado no tick alvo |
| `WallAbsorbed(id, cubit, ethRemaining)` | Muro totalmente atravessado e esvaziado |
| `TokensAbsorbed(amount, pendingAbsorbedTokens)` | CUBIT colocados em espera de envio por uma venda |
| `AbsorbedDelivered(sink, amount)` | CUBIT enviados ao seu destino |

Para CUBIT, `deliverAbsorbed()` chama `fundRewardReserve` do vault. Para um filho Forge, sem registro, ele transfere os tokens ao vault de governança e depois chama `lockUntracked`. O roteador CUBIT o chama após cada venda em um try/catch: um envio que falha nunca bloqueia a venda, e qualquer pessoa pode tentar o envio novamente. O Lens não totaliza mais os muros em `snapshot()`: `wallAmountsPage(start, count)` devolve o ETH e os CUBIT de um trecho de muros, e os CUBIT que aguardam envio são somados uma única vez ao total das páginas, pelo campo `pendingAbsorbedTokens`.

Cada muro atravessado custa cerca de 185 000 gas. Com o limite de 16 777 216 gas por transação fixado pela EIP-7825, uma venda atravessa no máximo cerca de 88 muros; além disso, ela falha sem perda e precisa ser dividida.

## As funções removidas

A nova versão remove a API do ladder, da manutenção, do fluxo WETH e do financiamento dos muros pela Forge, e renomeia a dos tokens absorvidos. Um cliente que ainda chama esses elementos está visando a versão antiga.

| Contrato | Elementos removidos |
| --- | --- |
| Hook, funções | `rebalance()`, `raiseFloor()`, `previewRaiseFloor()`, `canRebalance()`, `referenceTick()`, `lastRebalanceTick()`, `lastRebalanceBlock()`, `reserveTokens()`, `ladderIdleEth()`, `asks(i)`, `bid()`, `vaultAccrued()`, `claimVault()`, `fundFloor()` |
| Hook, funções renomeadas | `burnAbsorbed()` passa a ser `deliverAbsorbed()`; `pendingBurnTokens()` passa a ser `pendingAbsorbedTokens()` |
| Hook, constantes | `PHI_BPS`, `SWEEP_BPS`, `REBALANCE_THRESHOLD`, `REBALANCE_COOLDOWN`, `KEEPER_BOUNTY_BPS`, `KEEPER_BOUNTY_CAP`, `BOUNTY_RESERVE_TARGET`, `BOUNTY_RESERVE_BPS` |
| Hook, eventos e erros | `Rebalanced`, `SweepExecuted`, `BountyPaid`, `LadderBootstrapped`, `VaultFeesAccrued`, `FloorRaised`, `FloorFunded`, `ThresholdNotMet`, `CooldownActive`, `NothingToRaise`, `WallLimitReached`, `ProtocolFeeActive`, `WallRangeNotEmpty`, `NotInitialized` |
| Lens, funções | `canRebalance()`, `canRaiseFloor()`, `previewRaiseFloor()`, `cushionEth()`, `ladderTokens()` |
| Lens, campos do snapshot | `cushionEth`, `ladderTokens`, `reserveTokens`, `ladderIdleEth`, `lastRebalanceTick`, `lastRebalanceBlock`, `canRebalance`, `movedTicks`, `blocksRemaining`, `canRaiseFloor`, `raiseReason`, `referenceTick` |
| Vault | `weth()`, `earned()`, `claim()`, `fundRewards()`, `rewardPerToken()`, `RewardsFunded`, `RewardPaid` |
| Registro | `weth()` |

Internamente, `_fundWall` e `_planRaise` desapareceram em favor de `_collectCrossedWalls` e `_placeWall`. A recompensa do Vault é exclusivamente em CUBIT, resgatada com `claimCubit()`, e os scripts de implantação não usam mais uma variável `WETH`.

## O Vault e o vault de governança

| Contrato | Funções úteis |
| --- | --- |
| `CubitVault` | `stake(amount)`, `withdraw(amount)`, `pendingCubit(user)`, `claimCubit()`, `fundRewardReserve(amount)`, `rewardReserve()`, `balanceOf(user)`, `unlockAt(user)` |
| `CubitGovernanceVault` | `deposit(token, amount)`, `depositEth()`, `lockUntracked(token)`, `claimable(token)`, `locked(token)`, `lockExtension()` e depois `claim(token, maxTranches)` e `extendLock(extra)`, reservadas ao deployer, sem possibilidade de transferir esse direito |
| `CubitForge` | `launch(name, symbol, team, tokenSalt, hookSalt, creationCode)`, aberto a todos com a taxa exata, `launchFee()` imutável em 0,005 ETH, salts vinculados a quem lança; `governanceVault()`, endereço fixado na construção, recebe a taxa de lançamento com `depositEth()` |

Do lado do Vault, `DAILY_REWARD_BPS` vale 300 e `REWARD_PERIOD`, um dia: `pendingCubit` cresce proporcionalmente ao longo de 24 horas e depois atinge o teto, sem ultrapassar `rewardReserve`. Do lado do vault de governança, `LOCK_DURATION` vale 30 dias para cada depósito, e o ETH é contabilizado sob a chave `ETH()`, o endereço zero. `extendLock(extra)` acrescenta `extra` segundos ao bloqueio de todos os depósitos, presentes e futuros, e `lockExtension()` só aumenta.

O Lens também expõe `rewardReserve()`, a soma das reservas de recompensas de todos os vaults registrados, atuais e retirados. Desde a substituição do Lens em 19 de setembro de 2026, os totais dos muros e a oferta não são mais calculados na cadeia: os getters `wallEth()`, `wallTokens()`, `circulatingSupply()` e `heldSupply()` e os campos de mesmo nome sumiram do snapshot, que entrega em seu lugar `totalSupply`, `activeWallCount` e `pendingAbsorbedTokens`. Quem chama deriva os números por conta própria, com todas as páginas lidas no mesmo bloco: `wallTokens` é a soma dos CUBIT das páginas mais `pendingAbsorbedTokens`, depois `circulatingSupply = totalSupply − wallTokens − rewardReserve` e `heldSupply = circulatingSupply − bandTokens`, parando cada subtração em zero. Os CUBIT em stake continuam na oferta em circulação. `bestWallPrice()` e `netBestWallPrice()` dão o preço bruto e o preço líquido do muro ativo mais próximo do mercado, lido com `nearestWallTick()` do hook, ou zero quando nenhum muro resta. O snapshot termina com `blockNumber`, `bestWallPrice` e `netBestWallPrice`.

## Unidades e orientação

As quantidades de CUBIT e ETH usam 18 casas decimais. Os preços derivados do Lens são expressos em **ETH por CUBIT na escala 1e18**. O tick v4 segue a orientação CUBIT por ETH; ele diminui quando o preço em ETH por CUBIT aumenta.

Use inteiros `bigint` para valores e cálculos antes da formatação. Uma conversão prematura para `Number` pode perder precisão. A FDV de lançamento é fixada na implantação em `LAUNCH_ETH()`: 3,75 ETH adotados para a nova versão, sobre 21 milhões de CUBIT. Não misture USD, wei e unidades de token.

## Os métodos do roteador

```text
swapExactIn(
    PoolKey key, bool zeroForOne,
    uint256 amountIn, uint256 amountOutMin,
    address recipient, uint256 deadline
)

swapExactOut(
    PoolKey key, bool zeroForOne,
    uint256 amountOut, uint256 amountInMax,
    address recipient, uint256 deadline
)
```

`zeroForOne = true` compra CUBIT com ETH. Para exact-input, forneça `amountIn` como value; para compra exact-output, forneça `amountInMax`, com reembolso do excedente. Uma venda usa `zeroForOne = false`, value zero e uma aprovação CUBIT ao roteador.

Os valores retornados seguem os limites líquidos/brutos do roteador: saída líquida para exact-input, entrada bruta para exact-output. O contrato verifica preenchimentos incompletos. A cotação deve ser simulada com a chave correta do pool e sua versão. Após uma venda, o roteador também chama `deliverAbsorbed()` se ainda houver CUBIT absorvidos pendentes.

## Eventos e erros

Os eventos do hook incluem `BuyTaxed`, `SellTaxed`, `BandBootstrapped`, `TeamPaid` e, para os muros, `WallFunded`, `WallAbsorbed`, `TokensAbsorbed` e `AbsorbedDelivered`. `ModuleUpdated` permite acompanhar substituições de módulos.

Do lado dos vaults, acompanhe `Staked`, `Withdrawn`, `RewardReserveFunded` e `CubitRewardClaimed` e, depois, `Deposited`, `Claimed` e `LockExtended` para o vault de governança.

Os logs de `WallLib` são emitidos no contexto do hook: indexe-os no endereço do hook com as assinaturas ABI correspondentes. O antigo evento `FloorRaised` não existe mais.

No roteador, trate especialmente `Expired`, `WrongPool`, `TooLittleReceived`, `TooMuchRequested`, `InsufficientOutput` e `IncompleteInput`. Do lado do hook, `ExternalLiquidityForbidden` recusa qualquer liquidez de terceiros e `SupplyNotDeposited`, um depósito de lançamento insuficiente. Releia os códigos e a ABI do lançamento validado.

<p class="source-note">Fontes: <code>interfaces/ICubitHook.sol</code>, <code>interfaces/ICubitLens.sol</code>, <code>CubitHook.sol</code>, <code>WallLib.sol</code>, <code>CubitRouter.sol</code>, <code>periphery/CubitVault.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>periphery/CubitForge.sol</code> e o histórico Git da nova versão, incluindo o commit <code>4aa063ac</code>.</p>
