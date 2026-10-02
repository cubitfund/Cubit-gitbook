---
description: "풀 식별자, 교체 가능 모듈, 유동성 밴드, 매수벽과 흡수된 CUBIT 전송, vault, 삭제된 함수, 단위, 통합 이벤트."
section: "04 / 개발하기"
reading: "읽는 시간 10분"
search:
  keywords: [API, ABI, 통합, 연동, 컨트랙트, address, band, 밴드, BAND_SALT, MIN_POOL_SUPPLY, bandEth, bandTokens, walls, WallLib, wallCount, deliverAbsorbed, pendingAbsorbedTokens]
---

# 컨트랙트와 통합

통합은 **체인, 풀 핵심, ABI, 모듈 개정**을 식별해야 합니다. 옛 보고서에서 복사한 라우터 주소는 교체될 수 있고, 새 ABI는 과거 풀과 호환되지 않을 수 있습니다.

> 아래 ABI는 새 버전 코드의 ABI입니다. 클라이언트를 연결하기 전에 검증된 릴리스의 ABI를 내보내고 runtime을 확인하세요.

## 풀 식별

`PoolKey`는 `currency0`, `currency1`, `fee`, `tickSpacing`, `hooks`를 포함합니다. CUBIT에서 네이티브 ETH는 `currency0`, CUBIT 토큰은 `currency1`입니다.

| 필드 | 예상 값 |
| --- | --- |
| `currency0` | 네이티브 ETH를 나타내는 영 주소 |
| `currency1` | 식별한 배포의 토큰 |
| `fee` | 운영 중인 버전에서 `100`, 즉 0.01 % |
| `tickSpacing` | 확인한 소스에서 `10` |
| `hooks` | 식별한 배포의 hook |

poolId는 전체 key에 달려 있습니다. 프런트엔드의 `fee`만 바꿔도 이전 풀이 새 배포가 되지 않습니다.

## 같은 블록에서 모듈 확인

먼저 `hook.v2()`에 고정된 레지스트리를 읽습니다. 그다음 같은 블록에서 사용 가능한 모듈 주소와 `moduleRevision`을 확인하고, 핵심과의 연결을 검사합니다.

아래 **읽기 전용** 예시는 이미 구성된 viem 클라이언트와 확인된 레지스트리 주소와 함께 사용합니다:

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

이 예시만으로 모든 연결을 검사하거나 서명을 허용하지 않습니다. 저장소 프런트엔드는 `resolveRelease`, `readRelease`, `assertCurrentDeployment`로 검사합니다.

매 서명 전 모듈·개정을 사용자가 이미 검토한 맥락과 비교하세요. 승인을 조용히 다른 곳으로 돌리지 마세요.

## 밴드 읽기

| 요소 | 결과 / 용도 |
| --- | --- |
| `band()` | 단일 거래 포지션의 `(int24 lower, int24 upper, uint128 liquidity)` |
| `MIN_POOL_SUPPLY()` | 초기화 때 허용하는 최소 예치: 공급량의 80 % |
| `BAND_SALT()` | 밴드 포지션의 salt, `keccak256("CUBIT.BAND")` |
| `BandBootstrapped(lower, upper, liquidity, tokens)` | 풀 초기화 때 한 번만 발생하는 이벤트 |
| Lens `bandEth()` / `bandTokens()` | 현재 가격에서 밴드가 보유한 ETH와 CUBIT, LP 수수료 제외 |

`lower`는 간격 10에서의 `minUsableTick`, 즉 −887 270입니다. `upper`는 풀 개시 tick을 간격 단위로 내림한 값이며, 출시 FDV 3.75 ETH에서는 155 390입니다. 올림하면 포지션이 활성 상태가 되어 ETH가 필요해집니다.

hook은 **예치 전액**을 밴드에 넣습니다. `afterInitialize`는 `MIN_POOL_SUPPLY`보다 적은 예치를 `SupplyNotDeposited`로 거절합니다. 부모 출시는 정확히 이 최솟값을 예치하고, Forge 자식은 공급량 전체를 예치합니다. 반올림 잔량은 소각되므로 초기화 후 hook은 CUBIT을 토큰 그대로도, claim 형태로도 보유하지 않습니다.

Lens snapshot은 이전 래더·keeper 필드를 `bandEth`와 `bandTokens`로 대체합니다. 이 값은 포지션 원금 기준이며, 밴드에 쌓인 LP 수수료는 수집하지도 계산에 넣지도 않습니다.

## 여러 매수벽 읽기

| hook 뷰 | 결과 / 용도 |
| --- | --- |
| `wallCount()` | 과거 ID 수, 유효 포지션 수와 다름 |
| `activeWallCount()` | 읽은 상태의 유효 매수벽 수 |
| `activeWallId(index)` | 현재 유효 목록 index의 영구 ID |
| `latestWallId()` | 가장 최근에 자금을 조달한 매수벽 ID, 먼저 매수벽 존재 확인 |
| `walls(id)` | `(int24 lower, uint128 liquidity, uint256 idleEth, uint256 fundedEth)` |
| `wallIdleEth()` | 매수벽에 귀속된 잔여 ETH 합계 |

매도는 매수벽을 만들고, 두껍게 하고, 비웁니다. 비워진 매수벽은 유효 목록에서 빠지지만 식별자와 tick은 유지합니다.

흡수 후 유효 목록 index가 바뀔 수 있습니다. **순회 index 대신 매수벽 ID를 식별자로 보존하세요.** count와 항목은 같은 블록에서 읽습니다.

`fundedEth`는 그 tick에 실제로 배치한 자금의 누계이며 잔여 깊이로 표시하면 안 됩니다. `idleEth`는 배치된 유동성과 별개인 매수벽 귀속 잔여분입니다. 매수벽의 상단 경계는 `lower + tickSpacing`입니다. 배치하지 못한 매수벽 자금은 `pendingFloorEth`에 따로 남습니다.

Lens의 과거 필드 `floorPrice`, `netFloorPrice`는 가장 최근에 자금을 조달한 매수벽을 나타내며 모든 가격대를 요약하지 않습니다. 시장에 가장 가까운 활성 매수벽은 `bestWallPrice`와 `netBestWallPrice`로 읽습니다.

## 통과된 매수벽과 CUBIT 전송

매도마다, exact-input이든 exact-output이든 `afterSwap`은 `_collectCrossedWalls()`를 호출한 다음 `_placeWall()`을 호출합니다. 가격이 완전히 통과한 매수벽은 가장 가까운 것부터 가장 먼 것까지 모두 비워집니다. 그 CUBIT은 `pendingAbsorbedTokens`에 더해지고, 남은 ETH(실현된 수수료와 미세 잔량)는 `pendingFloorEth`로 돌아갑니다. 이어서 `_placeWall()`이 대기 중인 ETH 전부를 매도 후 가격으로 계산한 목표에 배치합니다. 출시 가격 이하처럼 목표가 풀 tick보다 엄밀히 위에 있지 않으면 `BandLib.underMarketWallTarget`으로 매수벽을 현재 가격보다 1 % 낮은 곳에 배치합니다. 포지션을 만들기에 너무 작은 금액과, 가격이 tick 범위의 맨 위에 있어 가격 아래에 매수벽을 둘 자리가 없는 극단적인 경우만 `pendingFloorEth`에 남습니다.

| 요소 | 결과 / 용도 |
| --- | --- |
| `pendingAbsorbedTokens()` | 통과된 매수벽의 CUBIT, 전송될 때까지 PoolManager claims 형태로 hook 안에 격리됨 |
| `deliverAbsorbed()` | 이 CUBIT을 `absorbedTokenSink()`로 보내는 공개·무권한 전송, 호출자는 수신자도 금액도 선택하지 않음 |
| `absorbedTokenSink()` | CUBIT은 레지스트리의 Vault, Forge 자식 시장은 자기 토큰을 배포한 Forge의 `governanceVault()` |
| `WallFunded(id, lower, addedEth, liquidity)` | 목표 tick에 매수벽이 생성되거나 두꺼워짐 |
| `WallAbsorbed(id, cubit, ethRemaining)` | 완전히 통과되어 비워진 매수벽 |
| `TokensAbsorbed(amount, pendingAbsorbedTokens)` | 매도로 전송 대기에 들어간 CUBIT |
| `AbsorbedDelivered(sink, amount)` | 목적지로 전송된 CUBIT |

CUBIT의 경우 `deliverAbsorbed()`는 vault의 `fundRewardReserve`를 호출합니다. 레지스트리가 없는 Forge 자식 시장에서는 토큰을 거버넌스 vault로 이체한 뒤 `lockUntracked`를 호출합니다. CUBIT 라우터는 매도가 끝날 때마다 try/catch 안에서 이 함수를 호출합니다. 전송이 실패해도 매도는 절대 막히지 않으며, 누구나 전송을 다시 실행할 수 있습니다. Lens는 더 이상 `snapshot()`에서 매수벽을 합산하지 않습니다. `wallAmountsPage(start, count)`가 매수벽 한 구간의 ETH와 CUBIT을 반환하며, 전송을 기다리는 CUBIT은 `pendingAbsorbedTokens` 필드를 통해 페이지 합계에 단 한 번만 더해집니다.

통과한 매수벽 하나마다 약 185 000 gas가 듭니다. EIP-7825가 정한 트랜잭션당 16 777 216 gas 한도에서 매도 하나는 최대 약 88개의 매수벽을 통과할 수 있습니다. 그보다 많으면 매도는 손실 없이 실패하므로 나누어 실행해야 합니다.

## 삭제된 함수

새 버전은 래더, 유지보수, WETH 흐름, Forge의 매수벽 자금 조달 API를 제거하고, 흡수 토큰 API의 이름을 바꿉니다. 여전히 이 요소들을 호출하는 클라이언트는 이전 버전을 대상으로 합니다.

| 컨트랙트 | 삭제된 요소 |
| --- | --- |
| Hook, 함수 | `rebalance()`, `raiseFloor()`, `previewRaiseFloor()`, `canRebalance()`, `referenceTick()`, `lastRebalanceTick()`, `lastRebalanceBlock()`, `reserveTokens()`, `ladderIdleEth()`, `asks(i)`, `bid()`, `vaultAccrued()`, `claimVault()`, `fundFloor()` |
| Hook, 이름이 바뀐 함수 | `burnAbsorbed()`는 `deliverAbsorbed()`로, `pendingBurnTokens()`는 `pendingAbsorbedTokens()`로 바뀜 |
| Hook, 상수 | `PHI_BPS`, `SWEEP_BPS`, `REBALANCE_THRESHOLD`, `REBALANCE_COOLDOWN`, `KEEPER_BOUNTY_BPS`, `KEEPER_BOUNTY_CAP`, `BOUNTY_RESERVE_TARGET`, `BOUNTY_RESERVE_BPS` |
| Hook, 이벤트와 오류 | `Rebalanced`, `SweepExecuted`, `BountyPaid`, `LadderBootstrapped`, `VaultFeesAccrued`, `FloorRaised`, `FloorFunded`, `ThresholdNotMet`, `CooldownActive`, `NothingToRaise`, `WallLimitReached`, `ProtocolFeeActive`, `WallRangeNotEmpty`, `NotInitialized` |
| Lens, 함수 | `canRebalance()`, `canRaiseFloor()`, `previewRaiseFloor()`, `cushionEth()`, `ladderTokens()` |
| Lens, snapshot 필드 | `cushionEth`, `ladderTokens`, `reserveTokens`, `ladderIdleEth`, `lastRebalanceTick`, `lastRebalanceBlock`, `canRebalance`, `movedTicks`, `blocksRemaining`, `canRaiseFloor`, `raiseReason`, `referenceTick` |
| Vault | `weth()`, `earned()`, `claim()`, `fundRewards()`, `rewardPerToken()`, `RewardsFunded`, `RewardPaid` |
| 레지스트리 | `weth()` |

내부적으로는 `_fundWall`과 `_planRaise`가 사라지고 `_collectCrossedWalls`와 `_placeWall`로 대체되었습니다. Vault 보상은 CUBIT으로만 지급되며 `claimCubit()`로 청구합니다. 배포 스크립트는 더 이상 `WETH` 변수를 사용하지 않습니다.

## Vault와 거버넌스 vault

| 컨트랙트 | 주요 함수 |
| --- | --- |
| `CubitVault` | `stake(amount)`, `withdraw(amount)`, `pendingCubit(user)`, `claimCubit()`, `fundRewardReserve(amount)`, `rewardReserve()`, `balanceOf(user)`, `unlockAt(user)` |
| `CubitGovernanceVault` | `deposit(token, amount)`, `depositEth()`, `lockUntracked(token)`, `claimable(token)`, `locked(token)`, `lockExtension()`, 그리고 배포자 전용이며 이 권리를 양도할 수 없는 `claim(token, maxTranches)`와 `extendLock(extra)` |
| `CubitForge` | 정확한 수수료로 누구나 호출할 수 있는 `launch(name, symbol, team, tokenSalt, hookSalt, creationCode)`, `launchFee()`는 0.005 ETH로 불변, salt는 출시 계정에 묶임, `governanceVault()`는 생성 시 고정된 주소로 `depositEth()`를 통해 출시 수수료를 받음 |

Vault 쪽에서 `DAILY_REWARD_BPS`는 300, `REWARD_PERIOD`는 하루입니다. `pendingCubit`은 24시간 동안 비례해 늘어난 뒤 상한에 도달하며 `rewardReserve`를 넘지 않습니다. 거버넌스 vault 쪽에서 `LOCK_DURATION`은 예치마다 30일이며, ETH는 키 `ETH()`, 즉 영 주소로 기록됩니다. `extendLock(extra)`는 현재와 향후 모든 예치분의 잠금에 `extra`초를 더하며, `lockExtension()`은 늘어나기만 합니다.

Lens는 등록된 모든 vault(현재 vault와 교체된 vault 모두)의 보상 준비금 합계인 `rewardReserve()`도 제공합니다. 2026년 9월 19일 Lens 교체 이후 매수벽 합계와 공급량은 더 이상 온체인에서 계산되지 않습니다. `wallEth()`, `wallTokens()`, `circulatingSupply()`, `heldSupply()` 게터와 같은 이름의 snapshot 필드는 사라졌고, snapshot은 대신 `totalSupply`, `activeWallCount`, `pendingAbsorbedTokens`를 제공합니다. 호출자가 모든 페이지를 같은 블록에서 읽어 직접 값을 유도합니다. `wallTokens`는 페이지들의 CUBIT 합계에 `pendingAbsorbedTokens`를 더한 값이고, 이어서 `circulatingSupply = totalSupply − wallTokens − rewardReserve`, `heldSupply = circulatingSupply − bandTokens`이며 각 뺄셈은 0에서 멈춥니다. 스테이킹된 CUBIT은 유통 공급량에 남습니다. `bestWallPrice()`와 `netBestWallPrice()`는 hook의 `nearestWallTick()`으로 읽은, 시장에 가장 가까운 활성 매수벽의 총가격과 순가격을 주며, 매수벽이 없으면 0입니다. snapshot은 `blockNumber`, `bestWallPrice`, `netBestWallPrice`로 끝납니다.

## 단위와 방향

CUBIT·ETH 수량은 18자리 소수입니다. Lens 파생 가격은 **1e18 배율의 CUBIT당 ETH**입니다. v4 tick은 ETH당 CUBIT 방향이라 CUBIT당 ETH 가격 상승 시 내려갑니다.

포맷 전 금액·계산은 정수 `bigint`를 쓰세요. 이른 `Number` 변환은 정밀도를 잃을 수 있습니다. 출시 FDV는 배포 때 `LAUNCH_ETH()`에 고정되며, 새 버전은 2,100만 CUBIT 기준 3.75 ETH를 채택했습니다. USD·wei·토큰 단위를 섞지 마세요.

## 라우터 메서드

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

`zeroForOne = true`는 ETH로 CUBIT을 매수합니다. exact-input은 value에 `amountIn`, exact-output 매수는 `amountInMax`를 넣고 초과분을 환불받습니다. 매도는 `zeroForOne = false`, value 0, 라우터 CUBIT 승인을 사용합니다.

반환값은 라우터 순액·총액 기준을 따릅니다. exact-input은 순출력, exact-output은 총입력입니다. 컨트랙트가 불완전 체결을 검사합니다. 올바른 풀 key와 그 버전으로 견적을 시뮬레이션해야 합니다. 매도 후 전송을 기다리는 흡수된 CUBIT이 남아 있으면 라우터는 `deliverAbsorbed()`도 호출합니다.

## 이벤트와 오류

hook 이벤트에는 `BuyTaxed`, `SellTaxed`, `BandBootstrapped`, `TeamPaid`, 그리고 매수벽 관련 `WallFunded`, `WallAbsorbed`, `TokensAbsorbed`, `AbsorbedDelivered`가 있습니다. `ModuleUpdated`로 모듈 교체를 추적합니다.

vault 쪽에서는 `Staked`, `Withdrawn`, `RewardReserveFunded`, `CubitRewardClaimed`를, 거버넌스 vault에서는 `Deposited`, `Claimed`, `LockExtended`를 추적하세요.

`WallLib` 로그는 hook 맥락에서 발생하므로 hook 주소와 해당 ABI 서명으로 색인하세요. 이전 이벤트 `FloorRaised`는 더 이상 존재하지 않습니다.

라우터에서는 특히 `Expired`, `WrongPool`, `TooLittleReceived`, `TooMuchRequested`, `InsufficientOutput`, `IncompleteInput`을 처리하세요. hook 쪽에서는 `ExternalLiquidityForbidden`이 모든 제3자 유동성을, `SupplyNotDeposited`가 부족한 출시 예치를 거절합니다. 검증된 릴리스의 코드와 ABI를 다시 읽으세요.

<p class="source-note">출처: <code>interfaces/ICubitHook.sol</code>, <code>interfaces/ICubitLens.sol</code>, <code>CubitHook.sol</code>, <code>WallLib.sol</code>, <code>CubitRouter.sol</code>, <code>periphery/CubitVault.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>periphery/CubitForge.sol</code> 및 commit <code>4aa063ac</code>를 포함한 새 버전의 Git 이력.</p>
