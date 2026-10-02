---
description: "池标识、可替换模块、流动性带、买墙与被吸收 CUBIT 的发送、vault、已删除函数、单位与集成事件。"
section: "04 / 构建"
reading: "阅读需 10 分钟"
search:
  keywords: [API, ABI, 集成, 接入, 合约, address, band, 流动性带, BAND_SALT, MIN_POOL_SUPPLY, bandEth, bandTokens, walls, WallLib, wallCount, deliverAbsorbed, pendingAbsorbedTokens]
---

# 合约与集成

集成须识别**链、池核心、ABI 与模块修订**。旧报告中的路由器地址可被替换；新的 ABI 可能与历史池不兼容。

> 下列 ABI 来自新版本的代码。连接客户端前，导出已验证发布版的 ABI 并核查 runtime。

## 池标识

`PoolKey` 包含 `currency0`、`currency1`、`fee`、`tickSpacing` 和 `hooks`。CUBIT 中原生 ETH 为 `currency0`，CUBIT 代币为 `currency1`。

| 字段 | 预期读取 |
| --- | --- |
| `currency0` | 零地址，表示原生 ETH |
| `currency1` | 已识别部署的代币 |
| `fee` | 在用版本为 `100`，即 0.01 % |
| `tickSpacing` | 所读源码为 `10` |
| `hooks` | 已识别部署的 hook |

PoolId 取决于完整 key。仅改前端 `fee` 不会把旧池变成新部署。

## 在同一区块解析模块

先读 `hook.v2()` 中锚定的注册表，再在同一区块解析可用模块地址和 `moduleRevision`，检查其与核心连接。

以下为**只读**片段，需已配置的 viem 客户端及已核实注册表地址：

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

该片段本身不检查全部连接，也不授权签名。仓库前端通过 `resolveRelease`、`readRelease` 和 `assertCurrentDeployment` 检查。

每次签名前，将模块和修订与用户已审阅的上下文比较。不要静默改变授权目标。

## 读取流动性带

| 元素 | 结果 / 用途 |
| --- | --- |
| `band()` | 唯一交易仓位的 `(int24 lower, int24 upper, uint128 liquidity)` |
| `MIN_POOL_SUPPLY()` | 初始化时接受的最低存入量：80 % 的供应量 |
| `BAND_SALT()` | 流动性带仓位的 salt，`keccak256("CUBIT.BAND")` |
| `BandBootstrapped(lower, upper, liquidity, tokens)` | 仅在池初始化时发出一次的事件 |
| Lens `bandEth()` / `bandTokens()` | 流动性带按当前价格持有的 ETH 与 CUBIT，不含 LP 费用 |

间距为 10 时，`lower` 等于 `minUsableTick`，即 −887 270。`upper` 是池开盘 tick 按间距向下舍入的值：启动 FDV 为 3.75 ETH 时，其值为 155 390。若向上舍入，仓位将处于活跃状态并需要 ETH。

Hook 将**全部存入量**放入流动性带。`afterInitialize` 以 `SupplyNotDeposited` 拒绝低于 `MIN_POOL_SUPPLY` 的存入：母项目启动时恰好存入该最低量，Forge 子项目存入其全部供应量。舍入零头会被销毁，因此初始化后 hook 既不保留原始代币，也不保留 CUBIT claim。

Lens 快照以 `bandEth` 和 `bandTokens` 取代原先阶梯流动性（ladder）与 keeper 的字段。这些数值针对仓位本金：流动性带中累积的 LP 费用既不收取也不计入。

## 读取多个买墙

| Hook 视图 | 结果 / 用途 |
| --- | --- |
| `wallCount()` | 历史标识符数量，不同于有效仓位数量 |
| `activeWallCount()` | 所读状态的有效买墙数 |
| `activeWallId(index)` | 当前有效列表某索引的永久 ID |
| `latestWallId()` | 最近注资买墙 ID；先检查是否存在买墙 |
| `walls(id)` | `(int24 lower, uint128 liquidity, uint256 idleEth, uint256 fundedEth)` |
| `wallIdleEth()` | 归属买墙的 ETH 余款总和 |

卖出会创建、加厚并清空买墙。被清空的买墙会移出有效列表，但保留其标识符与 tick。

吸收后有效列表索引可能改变。**用买墙 ID 作为身份**，不要用遍历索引。在同一区块读取数量与元素。

`fundedEth` 表示该 tick 实际配置资金的累计值，不应显示为剩余深度。`idleEth` 表示附着于买墙的余款，与其已部署流动性不同。买墙上界为 `lower + tickSpacing`。未能配置的买墙资金单独保留在 `pendingFloorEth` 中。

Lens 的历史字段 `floorPrice` 与 `netFloorPrice` 表示最近注资的买墙，不能概括所有价位。对于最接近市场的活跃买墙，请读取 `bestWallPrice` 与 `netBestWallPrice`。

## 被穿越的买墙与 CUBIT 的发送

每笔卖出时，无论是固定输入还是固定输出，`afterSwap` 都会先调用 `_collectCrossedWalls()`，再调用 `_placeWall()`。价格已完全穿越的所有买墙都会被清空，由近及远：其 CUBIT 计入 `pendingAbsorbedTokens`，其剩余 ETH（已实现的费用与零头）返回 `pendingFloorEth`。随后，`_placeWall()` 将全部待配置的 ETH 放到按卖出后价格计算的目标位置。若该目标并非严格高于池 tick（价格等于或低于启动价格时即如此），则通过 `BandLib.underMarketWallTarget` 将买墙配置在现价下方 1 %。只有太小而无法形成仓位的金额，以及价格位于 tick 范围最顶端、价格下方已容不下任何买墙的极端情况，才会留在 `pendingFloorEth`。

| 元素 | 结果 / 用途 |
| --- | --- |
| `pendingAbsorbedTokens()` | 被穿越买墙中的 CUBIT，以 PoolManager claims 形式隔离在 hook 中，直至发送 |
| `deliverAbsorbed()` | 公开且无需许可地将这些 CUBIT 发送至 `absorbedTokenSink()`；调用者既不能选择接收方，也不能选择金额 |
| `absorbedTokenSink()` | CUBIT 为注册表中的 Vault；Forge 子项目为部署其代币的 Forge 的 `governanceVault()` |
| `WallFunded(id, lower, addedEth, liquidity)` | 在目标 tick 创建或加厚买墙 |
| `WallAbsorbed(id, cubit, ethRemaining)` | 买墙被完全穿越并清空 |
| `TokensAbsorbed(amount, pendingAbsorbedTokens)` | 一笔卖出使 CUBIT 进入待发送状态 |
| `AbsorbedDelivered(sink, amount)` | CUBIT 已发送至其目的地 |

对于 CUBIT，`deliverAbsorbed()` 调用 vault 的 `fundRewardReserve`。对于没有注册表的 Forge 子项目，它将代币转入治理 vault，再调用 `lockUntracked`。CUBIT 路由器在每笔卖出后于 try/catch 中调用它：发送失败绝不会阻断卖出，且任何人都可以重新发起发送。Lens 不再在 `snapshot()` 中统计买墙总量：`wallAmountsPage(start, count)` 返回一段买墙的 ETH 与 CUBIT，等待发送的 CUBIT 通过 `pendingAbsorbedTokens` 字段只加入页面总和一次。

每穿越一个买墙约耗费 185 000 gas。按 EIP-7825 规定的每笔交易 16 777 216 gas 上限，一笔卖出最多穿越约 88 个买墙；超出时，卖出失败但不造成损失，须拆分进行。

## 已删除的函数

新版本移除了阶梯流动性（ladder）、维护、WETH 流程以及由 Forge 为买墙注资相关的 API，并重命名了被吸收代币相关的 API。仍调用这些元素的客户端针对的是旧版本。

| 合约 | 已删除元素 |
| --- | --- |
| Hook，函数 | `rebalance()`, `raiseFloor()`, `previewRaiseFloor()`, `canRebalance()`, `referenceTick()`, `lastRebalanceTick()`, `lastRebalanceBlock()`, `reserveTokens()`, `ladderIdleEth()`, `asks(i)`, `bid()`, `vaultAccrued()`, `claimVault()`, `fundFloor()` |
| Hook，重命名的函数 | `burnAbsorbed()` 更名为 `deliverAbsorbed()`；`pendingBurnTokens()` 更名为 `pendingAbsorbedTokens()` |
| Hook，常量 | `PHI_BPS`, `SWEEP_BPS`, `REBALANCE_THRESHOLD`, `REBALANCE_COOLDOWN`, `KEEPER_BOUNTY_BPS`, `KEEPER_BOUNTY_CAP`, `BOUNTY_RESERVE_TARGET`, `BOUNTY_RESERVE_BPS` |
| Hook，事件与错误 | `Rebalanced`, `SweepExecuted`, `BountyPaid`, `LadderBootstrapped`, `VaultFeesAccrued`, `FloorRaised`, `FloorFunded`, `ThresholdNotMet`, `CooldownActive`, `NothingToRaise`, `WallLimitReached`, `ProtocolFeeActive`, `WallRangeNotEmpty`, `NotInitialized` |
| Lens，函数 | `canRebalance()`, `canRaiseFloor()`, `previewRaiseFloor()`, `cushionEth()`, `ladderTokens()` |
| Lens，快照字段 | `cushionEth`, `ladderTokens`, `reserveTokens`, `ladderIdleEth`, `lastRebalanceTick`, `lastRebalanceBlock`, `canRebalance`, `movedTicks`, `blocksRemaining`, `canRaiseFloor`, `raiseReason`, `referenceTick` |
| Vault | `weth()`, `earned()`, `claim()`, `fundRewards()`, `rewardPerToken()`, `RewardsFunded`, `RewardPaid` |
| 注册表 | `weth()` |

在内部，`_fundWall` 与 `_planRaise` 已被 `_collectCrossedWalls` 与 `_placeWall` 取代。Vault 的奖励仅以 CUBIT 形式发放，通过 `claimCubit()` 领取，部署脚本也不再使用 `WETH` 变量。

## Vault 与治理 vault

| 合约 | 常用函数 |
| --- | --- |
| `CubitVault` | `stake(amount)`, `withdraw(amount)`, `pendingCubit(user)`, `claimCubit()`, `fundRewardReserve(amount)`, `rewardReserve()`, `balanceOf(user)`, `unlockAt(user)` |
| `CubitGovernanceVault` | `deposit(token, amount)`、`depositEth()`、`lockUntracked(token)`、`claimable(token)`、`locked(token)`、`lockExtension()`，以及仅限部署者调用、且该权利无法转让的 `claim(token, maxTranches)` 与 `extendLock(extra)` |
| `CubitForge` | `launch(name, symbol, team, tokenSalt, hookSalt, creationCode)` 向所有人开放，须支付准确费用，`launchFee()` 不可变，为 0.005 ETH，salt 与启动者绑定；`governanceVault()` 地址在构造时固定，通过 `depositEth()` 接收启动费用 |

Vault 方面，`DAILY_REWARD_BPS` 为 300，`REWARD_PERIOD` 为一天：`pendingCubit` 在 24 小时内按比例增长，之后封顶，且不超过 `rewardReserve`。治理 vault 方面，每笔存入的 `LOCK_DURATION` 为 30 天，ETH 记在键 `ETH()`（零地址）下。`extendLock(extra)` 为所有现有和未来存入的锁定增加 `extra` 秒，`lockExtension()` 只增不减。

Lens 还提供 `rewardReserve()`，即所有已登记 vault（包括当前与已退役的）奖励储备之和。自 2026 年 9 月 19 日更换 Lens 起，买墙总量与供应量不再在链上计算：`wallEth()`、`wallTokens()`、`circulatingSupply()`、`heldSupply()` 这些 getter 以及同名的快照字段均已移除，快照改为给出 `totalSupply`、`activeWallCount` 与 `pendingAbsorbedTokens`。由调用方在同一区块读取全部分页后自行推导：`wallTokens` 为各页 CUBIT 之和加 `pendingAbsorbedTokens`，随后 `circulatingSupply = totalSupply − wallTokens − rewardReserve`、`heldSupply = circulatingSupply − bandTokens`，每次相减都以零为下限。已质押的 CUBIT 仍计入流通供应量。`bestWallPrice()` 与 `netBestWallPrice()` 给出通过 hook 的 `nearestWallTick()` 读取的、最接近市场的活跃买墙的总价与净价；若没有买墙则为零。快照以 `blockNumber`、`bestWallPrice` 与 `netBestWallPrice` 结尾。

## 单位与方向

CUBIT 与 ETH 数量使用 18 位小数。Lens 衍生价格以 **1e18 缩放的 ETH/CUBIT** 表示。V4 tick 方向为 CUBIT/ETH，因此每 CUBIT 的 ETH 价格上涨时 tick 下降。

格式化前用 `bigint` 整数存金额和计算。过早转成 `Number` 可能损失精度。启动 FDV 在部署时固定于 `LAUNCH_ETH()`：新版本采用 3.75 ETH，对应 2100 万 CUBIT。不要混用 USD、wei 与代币单位。

## 路由器方法

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

`zeroForOne = true` 用 ETH 买 CUBIT。固定输入以 value 提供 `amountIn`；固定输出买入提供 `amountInMax`，退还余款。卖出设 `zeroForOne = false`、value 为零，并向路由器授权 CUBIT。

返回金额依路由器净/毛界限：固定输入返回净输出，固定输出返回毛输入。合约检查未完全成交。报价须使用正确池 key 和版本模拟。卖出后，若仍有等待发送的被吸收 CUBIT，路由器还会调用 `deliverAbsorbed()`。

## 事件与错误

Hook 事件包括 `BuyTaxed`、`SellTaxed`、`BandBootstrapped`、`TeamPaid`，以及买墙相关的 `WallFunded`、`WallAbsorbed`、`TokensAbsorbed` 和 `AbsorbedDelivered`。`ModuleUpdated` 用于追踪模块替换。

Vault 方面，追踪 `Staked`、`Withdrawn`、`RewardReserveFunded` 与 `CubitRewardClaimed`；治理 vault 则追踪 `Deposited`、`Claimed` 与 `LockExtended`。

`WallLib` 的日志在 hook 上下文中发出：须按 hook 地址及对应 ABI 签名建立索引。旧事件 `FloorRaised` 已不再存在。

路由器尤其应处理 `Expired`、`WrongPool`、`TooLittleReceived`、`TooMuchRequested`、`InsufficientOutput` 和 `IncompleteInput`。Hook 方面，`ExternalLiquidityForbidden` 拒绝任何第三方流动性，`SupplyNotDeposited` 拒绝不足的启动存入。请重读已验证发布版的错误码和 ABI。

<p class="source-note">来源： <code>interfaces/ICubitHook.sol</code>, <code>interfaces/ICubitLens.sol</code>, <code>CubitHook.sol</code>, <code>WallLib.sol</code>, <code>CubitRouter.sol</code>, <code>periphery/CubitVault.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>periphery/CubitForge.sol</code>，以及新版本的 Git 历史，包括提交 <code>4aa063ac</code>。</p>
