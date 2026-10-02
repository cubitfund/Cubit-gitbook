---
description: "针对新版本的 Sepolia 手动测试计划：流动性带、交换、税费、买墙、vault、替换、预期拒绝及带编号的记录表。"
section: "05 / 核查"
reading: "带编号的测试计划"
search:
  keywords: [验收, 测试, 测试网, Sepolia, 手动, checklist, 计划, 严重程度, 记录, 拒绝]
---

# Sepolia 手动测试计划

本页是一份**可手动执行的检查清单**，由配备钱包的人员在 Sepolia 测试网上执行。每个用例都有 `T-01` 形式的固定编号，可在报告中引用。

> **开始之前。** 本计划针对新版本。仓库的公开清单描述的是 LP 费用为 `100` 的**在用** Sepolia 部署：本计划适用于该部署。对被测版本不适用的用例记为“超出版本范围”，绝不记为“失败”。

所引数值来自 `contracts/src/` 下的新版本代码以及 2026 年 9 月 14 日的设计决定。尚无法确认的行为标注为**“待测试时确认”**。

## 如何使用本计划

每一节以六列表格列出其用例。最后两列在验收过程中填写。

| 列 | 填写内容 |
| --- | --- |
| 用例 | 固定标识符，`T-01` 至 `T-110` |
| 前置条件 | 开始前必须满足的条件 |
| 步骤 | 按顺序执行的操作 |
| 预期结果 | 代码与决定所规定的结果 |
| 观察结果 | 实际发生的情况，附交易 hash 或读取区块 |
| 严重程度 | 符合预期则留空；否则填阻断、重大、次要或外观 |

| 严重程度 | 标准 |
| --- | --- |
| 阻断 | 资金损失或被锁、未收取税费、买墙丢失、从本金中支付奖励 |
| 重大 | 行为与来源相悖、缺少应有的拒绝、显示数字错误 |
| 次要 | 不影响链上的显示偏差、提示信息不准确 |
| 外观 | 排版、页面布局、标签文字 |

**按拒绝用例被拒绝的交易，即为成功。** hash 仅表示交易已提交：只有回执说明是否成功。

**部分用例不经过界面。** 在其当前源码中，dapp 读取在用版本的 ABI，既不提供固定输出订单，也不提供 `claimTeam()` 或买墙的详细读取。这些用例标注为“直接调用”：使用合约调用工具，针对被测部署清单中的地址执行。

## 1. 准备

请在第一次交换**之前**记录以下内容：它们是后续所有比较的参考。

- 网络：Sepolia，链 ID `11155111`。
- 从清单读取的被测部署地址：代币、hook、PoolManager、`poolId`、路由器、Lens、V2 注册表、Vault、启动合约；添加 launchpad 后，再加上治理 vault 与 Forge。**不要把任何私钥抄入笔记。**
- 固定参数：`fee`、`tickSpacing`、`LAUNCH_ETH`、`MIN_POOL_SUPPLY`、`launchTimestamp`、`moduleRevision`。
- 初始状态：Lens 的 `snapshot()`、hook 的 `band()`、代币的 `totalSupply()` 与 `totalBurned()`、`pendingFloorEth`、`pendingAbsorbedTokens`、`wallCount()`、`activeWallCount()`、`teamAccrued`、`teamPaidCumulative`、Vault 的 `rewardReserve()`，以及读取时的**区块号**。

除交换金额**之外**，还需另备测试 ETH：每笔交易都要支付 gas，而且多个用例要求发出会被拒绝的交易，这些交易同样消耗 gas。

| 用例 | 前置条件 | 步骤 | 预期结果 | 观察结果 | 严重程度 |
| --- | --- | --- | --- | --- | --- |
| T-01 | 已安装钱包 | 选择 Sepolia；打开连接被测版本的 dapp | 网络被识别；不会提示在其他链上签名 |  |  |
| T-02 | 新账户 | 通过 Sepolia 水龙头获取测试 ETH | 刷新后，钱包与 dapp 中均显示余额 |  |  |
| T-03 | 手边备有清单 | 将显示的每个地址与清单中的地址比对 | 身份一致；`poolId`、`fee` 与 `tickSpacing` 相符 |  |  |
| T-04 | 尚未发出任何交换 | 读取 `snapshot()` 并记录区块 | 参考值已记录，区块已标识 |  |  |
| T-05 | 直接调用 | 读取 hook 的 `poolKey()` | `currency0` 等于零地址，`fee = 100`，`tickSpacing = 10`，`hooks` 等于该 hook |  |  |
| T-06 | V2 注册表可读 | 读取 `moduleRevision()` 与各模块地址 | 记录修订号；若验收期间发生变化，每次签名前都须重新核查 |  |  |

## 2. 启动与流动性带

池初始化时，hook 将**全部存入量**放入由 `BAND_SALT` 标识的单一仓位 `[minUsableTick, tickUpper]`。`tickUpper` 是开盘 tick 按间距向下舍入的值，因此该仓位只含 CUBIT。Hook 拒绝低于 `MIN_POOL_SUPPLY`（即 80 % 供应量）的存入，并销毁舍入零头。

完整启动还会在同一交易中将 20 % 供应量注入 Vault 储备，并执行 0.1 ETH 买入。

| 用例 | 前置条件 | 步骤 | 预期结果 | 观察结果 | 严重程度 |
| --- | --- | --- | --- | --- | --- |
| T-07 | 已完成启动，直接调用 | 读取 `band()` | `lower = −887 270`；`upper` 等于开盘 tick 向下舍入到 10 的倍数，FDV 为 3.75 ETH 时为 `155 390`；流动性不为零 |  |  |
| T-08 | 已知启动交易 | 读取其事件 | `BandBootstrapped(lower, upper, liquidity, tokens)` 仅发出一次，数值与 `band()` 一致；`tokens` 等于存入量减去舍入零头 |  |  |
| T-09 | 启动时无初始买入 | 在任何交换之前读取 `snapshot()` 中的 `bandEth` 与 `bandTokens` | `bandEth = 0`；`bandTokens` 等于存入量（允许舍入误差） |  |  |
| T-10 | 已完成启动，直接调用 | 读取 `token.balanceOf(hook)` | 为零（第三方直接转账除外）：初始化后 hook 不保留任何原始 CUBIT |  |  |
| T-11 | 直接调用 | 尝试向池添加流动性 | 以 `ExternalLiquidityForbidden` 拒绝：hook 是唯一的流动性提供者 |  |  |
| T-12 | 演练部署 | 以低于 `MIN_POOL_SUPPLY` 的存入量初始化池 | 以 `SupplyNotDeposited` 拒绝；不建立流动性带 |  |  |
| T-13 | 完整启动 | 启动交易后读取 Vault 的 `rewardReserve()` | 储备等于 20 % 供应量，即 420 万 CUBIT；无团队分配，无空投 |  |  |
| T-14 | 完整启动 | 读取启动交易中的部署者买入 | 买入 0.1 ETH；`BuyTaxed` 中 3 % 归团队；收到的 CUBIT 可自由转让 |  |  |
| T-15 | 买入已确认，直接调用 | 根据流动性带的虚拟储备重新计算预期输出 | 输出与扣除 3 % 税和 LP 费用后的 x·y=k 曲线一致；起初为 1680 万 CUBIT 对 3 ETH 虚拟储备——待测试时确认 |  |  |
| T-16 | 买入后再卖出所买的 CUBIT | 在买入前、两者之间及卖出后读取 `bandEth` | `bandEth` 买入时增加，随后回到接近初始值；它绝不会超过买入实际带入的 ETH |  |  |

## 3. 买卖流程

路由器提供 `swapExactIn(key, zeroForOne, amountIn, amountOutMin, recipient, deadline)` 与 `swapExactOut(key, zeroForOne, amountOut, amountInMax, recipient, deadline)`。`zeroForOne = true` 表示用 ETH 买入 CUBIT。

**在 dapp 当前源码中，界面只使用固定输入。** 用户始终输入所支付的金额；接收数量是只读字段。因此，固定输出流程必须通过直接调用路由器来测试。

买入以 `msg.value` 发送原生 ETH。卖出发送的 value 为零，并要求向路由器授予 CUBIT 的 **ERC-20 授权**：界面请求的授权**恰为所需金额**，从不无限授权，因此更大的卖出需要新的授权。

路由器拒绝部分成交：未被完全消耗的固定输入触发 `IncompleteInput`，未被完全满足的固定输出触发 `InsufficientOutput`。由于税费按请求金额计算，撤销交易可以保护用户。

从 dapp 源码读取的界面设置（验收时需核查）：滑点容忍度**默认 1.0 %**，输入限制为**两位小数**且在 `0` 至 `99.99` 区间内；最低接收量以整数计算并**向上舍入到 wei**；报价**新鲜期 30 秒**；链上截止时间 = 链上时间戳**加 120 秒再减去报价的已存在时长**。

| 用例 | 前置条件 | 步骤 | 预期结果 | 观察结果 | 严重程度 |
| --- | --- | --- | --- | --- | --- |
| T-17 | ETH 余额充足 | 买入小额，例如 0.001 ETH | 回执成功；CUBIT 到账；发出 `BuyTaxed` 事件 |  |  |
| T-18 | ETH 余额较大 | 买入大额 | 回执成功；价格影响体现在报价中，而非税率中 |  |  |
| T-19 | 钱包持有 CUBIT | 先授权再卖出 | 两笔独立交易；收到净 ETH；发出 `SellTaxed` |  |  |
| T-20 | 上一笔卖出已确认 | 卖出**大于**上一笔的金额 | 请求新的授权：之前的授权仅针对确切金额 |  |  |
| T-21 | 交换界面已打开 | 不做改动，查看提供的容忍度 | 默认值 **1.0 %** |  |  |
| T-22 | 交换界面已打开 | 依次输入 `0.005`、`100` 以及一个负值 | 输入被拒绝，并提示 0–99.99 区间与两位小数限制 |  |  |
| T-23 | 报价新鲜 | 将容忍度设为可接受的最低值，等待价格变动后签名 | 以 `TooLittleReceived(received, minimum)` 拒绝；没有代币损失；界面不提示移除保护 |  |  |
| T-24 | 报价已显示 | 超过 30 秒不操作，然后尝试签名 | 报价被视为过期，并在任何签名之前重新计算 |  |  |
| T-25 | 报价即将过期 | 在过期前一刻签名，并读取传出的截止时间 | 截止时间等于 120 秒**减去**报价已存在时长：已存在 30 秒的报价约剩 90 秒 |  |  |
| T-26 | 直接调用 | 以已过期的截止时间调用 `swapExactIn` | 以 `Expired` 拒绝；无资金变动 |  |  |
| T-27 | 直接调用 | 为买入调用 `swapExactOut`，输入上限留有充足余量 | 收到确切数量；多余 ETH 在同一交易中退还给调用者 |  |  |
| T-28 | 直接调用 | 以比所需金额低 1 wei 的输入上限调用 `swapExactOut` | 以 `TooMuchRequested(required, maximum)` 拒绝 |  |  |
| T-29 | CUBIT 余额超过流动性带与买墙可回购的数量，例如作为奖励收到的 CUBIT | 通过路由器以固定输入卖出该余额 | 以 `IncompleteInput` 拒绝；税费随交易一并撤销——待测试时确认 |  |  |
| T-30 | 直接调用 | 以固定输出请求超过流动性簿可提供的 ETH | 以 `InsufficientOutput` 拒绝；无部分结算 |  |  |
| T-31 | 直接调用 | 依次发送零金额、零接收方、不一致的 `msg.value`，以及另一个池 key | 分别以 `InvalidAmount`、`ZeroRecipient`、`WrongValue`、`WrongPool` 拒绝 |  |  |
| T-32 | 兼容的第三方路由器 | 通过第三方路由买入再卖出 | 适用 hook 税费 |  |  |
| T-33 | 调用合约或交易批次 | 在**同一交易**中先买入再卖出 | 两个部分分别征税 |  |  |

## 4. 税费与记账

| 操作 | 基数 | 分配 |
| --- | --- | --- |
| 买入 | ETH 毛额部分的 3 % | 100 % 归团队份额；分配给买墙的部分明确为零 |
| 卖出 | 输出 ETH 毛额的 15 % | 12 % 用于买墙，3 % 归团队 |

固定输入时，买入税**包含**在提供的金额中，并向上舍入到 wei。固定输出时，税费叠加在池部分之上，使税费占总额的比例仍为 3 %。

固定输出卖出时，税费为 `ceil(sortie × 1500 / 8500)`：池输出所请求的金额**再加上**税费。固定输入卖出时，税费为 `ceil(brut × 15 %)`。分配时，团队份额向下舍入，**所有以 wei 计的余数都归买墙**。

在 dapp 当前源码中，界面要求先在链上读取这些税率，才允许交换：在税率核实之前，按钮保持等待状态。

| 用例 | 前置条件 | 步骤 | 预期结果 | 观察结果 | 严重程度 |
| --- | --- | --- | --- | --- | --- |
| T-34 | 买入已确认 | 读取 `BuyTaxed(ethIn, toFloor, toTeam)` | `toFloor` 为零；`toTeam` 为毛输入的 3 %，向上舍入到 wei |  |  |
| T-35 | 买入已确认 | 比较 `teamAccrued` 的前后数值 | 增加额等于团队份额 |  |  |
| T-36 | 卖出已确认 | 读取 `SellTaxed(ethOut, toFloor, toTeam)` | `toFloor + toTeam` 等于毛额的 15 %；`toTeam` 为毛额的 3 %；总和精确到 wei |  |  |
| T-37 | `teamAccrued` 不为零，直接调用 | 从任意账户调用 `claimTeam()` | 资金转往固定的团队地址；发出 `TeamPaid(amount, cumulative)`；`teamAccrued` 归零 |  |  |
| T-38 | `teamAccrued` 为零，直接调用 | 调用 `claimTeam()` | 调用不回滚，也不转移任何资金 |  |  |
| T-39 | 同一金额先买入再卖出 | 比较初始 ETH 与最终 ETH（不计 gas） | 保留比例接近 `0.97 × 0.85 = 0.8245`；差异由 LP 费用、价格影响与舍入解释 |  |  |
| T-40 | 两笔规模差异很大的卖出 | 比较税费占毛额的比例 | 两种情况下税率均为 15 %；无分档或豁免 |  |  |

## 5. 自动买墙

每笔卖出时，无论是固定输入还是固定输出，hook 都会先调用 `_collectCrossedWalls()`，再调用 `_placeWall()`。它先由近及远清空价格已完全穿越的所有买墙，再将全部待配置的 ETH 放到目标 `0.4 × prix courant + 0.6 × prix de lancement`，该目标按卖出**后**的价格计算，并按 tick 舍入。若该目标并非严格高于池 tick（价格等于或低于启动价格时即如此），买墙配置在现价下方 1 %。

被清空的买墙将其 CUBIT 计入 `pendingAbsorbedTokens`，并将其剩余 ETH（费用与零头）退回 `pendingFloorEth`。仅被部分消耗的买墙保持原位。只有太小而无法形成流动性的金额，以及价格位于 tick 范围最顶端、价格下方已容不下任何买墙的极端情况，才会让资金在 `pendingFloorEth` 中等待：卖出绝不会因此被拒绝。随后，CUBIT 路由器在 try/catch 中调用 `deliverAbsorbed()`。

Lens 的 `floorPrice()` 参考值表示**最近一次获得注资的买墙**，而非全局最低价。每穿越一个买墙约耗费 185 000 gas：在单笔交易 16 777 216 gas 的上限内，一笔卖出最多穿越约 88 个买墙。

| 用例 | 前置条件 | 步骤 | 预期结果 | 观察结果 | 严重程度 |
| --- | --- | --- | --- | --- | --- |
| T-41 | 价格高于启动价格 | 卖出，然后读取买墙 | 发出 `WallFunded(id, lower, addedEth, liquidity)`；在目标 tick 上以待配置的 ETH（含该笔卖出的 12 %）创建或加厚一个买墙（允许舍入误差）；`pendingFloorEth` 只保留未配置的余额 |  |  |
| T-42 | 上一用例的情形 | 根据卖出**后**的价格与启动价格重新计算目标 | 买墙的 `lower` 与按该价格计算、按 tick 舍入的 40/60 目标一致 |  |  |
| T-43 | 两笔卖出的目标落在同一 tick | 读取 `wallCount()` 与 `walls(id)` | 只有一个买墙：两次 `WallFunded` 带有相同的 `id`，流动性增加，不创建新的标识符 |  |  |
| T-44 | 多个买墙位于不同 tick | 多次卖出和买入，然后重新读取 `walls(id)` | 每个买墙的 `lower` 保持不变；没有买墙被移动 |  |  |
| T-45 | 现价下方有有效买墙 | 卖出一笔会部分消耗但不穿越该买墙的金额 | 买墙保持有效，同时含 ETH 与 CUBIT；无 `WallAbsorbed`；`pendingAbsorbedTokens` 不变 |  |  |
| T-46 | 已被部分消耗的买墙 | 买入直至价格回到买墙上方 | 买墙已卖回其 CUBIT 并重新持有 ETH；其标识符与 tick 不变 |  |  |
| T-47 | 有效买墙，通过 CUBIT 路由器卖出 | 卖出一笔会完全穿越该买墙的金额 | 在同一交易中先发出 `WallAbsorbed(id, cubit, ethRemaining)` 与 `TokensAbsorbed(amount, pendingAbsorbedTokens)`，再发出 `AbsorbedDelivered(sink, amount)` 与 `RewardReserveFunded`；`rewardReserve()` 增加这些 CUBIT；`pendingAbsorbedTokens` 归零；`totalSupply()` 与 `totalBurned()` 不变 |  |  |
| T-48 | 价格接近启动价格，40/60 目标不在市场价格下方 | 卖出一笔可成交的小额，然后读取买墙 | 卖出成功；发出 `WallFunded`；买墙配置在卖出后价格下方 1 %，按 tick 舍入；`pendingFloorEth` 只保留未配置的余额 |  |  |
| T-49 | T-48 的情形 | 再次卖出一笔可成交的小额，然后读取 `pendingFloorEth` | 在新价格下方 1 % 发出 `WallFunded`；`pendingFloorEth` 只保留舍入零头：各笔卖出之间不会形成积压 |  |  |
| T-50 | 兼容的第三方路由器 | 通过第三方路由卖出并完全穿越一个买墙，然后从任意账户调用 `deliverAbsorbed()` | 适用税费；发出 `TokensAbsorbed`，CUBIT 保留在 `pendingAbsorbedTokens` 中直至该调用，调用时发出 `AbsorbedDelivered` |  |  |
| T-51 | 多个买墙已获注资 | 读取 Lens 的 `floorPrice()` 与 `netFloorPrice()`，再在同一区块读取 `wallAmountsPage(0, 500)` 及后续分页直到 `activeWallCount` | 参考值对应最近注资的买墙，并如实展示为此；买墙中的 CUBIT 等于各页之和加上只计一次的 `pendingAbsorbedTokens` |  |  |
| T-52 | Forge 子项目，买墙被完全穿越 | 读取子项目 hook 的 `absorbedTokenSink()`，再读取该笔卖出的事件 | 目的地等于 Forge 的 `governanceVault()`；发出 `AbsorbedDelivered`；`Deposited(token, from, amount, unlockAt)` 批次锁定 30 天 |  |  |
| T-106 | 一笔卖出需穿越大量买墙 | 估算该笔卖出的 gas，然后发送 | 每穿越一个买墙约 185 000 gas；超过约 88 个买墙时，卖出超出 16 777 216 gas 并失败，但不造成损失：须拆分卖出 |  |  |
| T-107 | CUBIT 目的地拒绝接收的演练部署 | 通过 CUBIT 路由器卖出并穿越一个买墙，然后再次调用 `deliverAbsorbed()` | 卖出成功；CUBIT 保留在 `pendingAbsorbedTokens` 中；该调用对任何账户开放，只要目的地仍拒绝就会失败 |  |  |

## 6. mCUBIT Vault

Vault 发放 **CUBIT 形式**的奖励，仅从 `rewardReserve` 中支出。奖励为 `DAILY_REWARD_BPS = 300`，即每个 24 小时周期（`REWARD_PERIOD`）存款的 3 %，按比例计算并**以一个周期为上限**：超出部分作废。奖励绝不超过储备余额，也绝不从本金中支付。

每次存款都会对该钱包的整个仓位重启 **24 小时**锁定（`LOCK_DURATION`）；到期前提款会以 `Locked` 被拒绝。存款、提款或领取都会先支付已获得的奖励，并重新开始周期。任何账户都可以通过 `fundRewardReserve(amount)` 为储备注资。到期以链上时间戳判断，而非浏览器时钟。

奖励**仅以 CUBIT 形式发放**，通过 `claimCubit()` 领取：Vault 不提供任何 WETH 奖励函数。

| 用例 | 前置条件 | 步骤 | 预期结果 | 观察结果 | 严重程度 |
| --- | --- | --- | --- | --- | --- |
| T-53 | Vault 可用，钱包持有 CUBIT | 先授权再存入 | 发出 `Staked(user, amount, unlockAt)`；`unlockAt` 等于区块时间戳加 24 小时 |  |  |
| T-54 | 已有仓位 | 在到期前再次存入 | **整个仓位的锁定被重启**；若已获得奖励不为零，则随 `CubitRewardClaimed` 支付，周期重新开始 |  |  |
| T-55 | 锁定期内 | 申请提款 | 以 `Locked` 拒绝 |  |  |
| T-56 | 锁定已到期 | 提取部分存款 | 部分提款被接受；发出 `Withdrawn`；先支付已获得的奖励；剩余余额仍保持存入 |  |  |
| T-57 | 存入 1 000 CUBIT，储备充足 | 12 小时后读取 `pendingCubit`，24 小时后再次读取 | 约 15 CUBIT，然后 30 CUBIT |  |  |
| T-58 | 上一用例的情形 | 等待 48 小时不领取，然后读取 `pendingCubit` | 仍为 30 CUBIT：第二天的奖励作废 |  |  |
| T-59 | 已获得奖励 | 调用 `claimCubit()` | CUBIT 已转出；发出 `CubitRewardClaimed`；`rewardReserve` 减少所付金额；`pendingCubit` 归零 |  |  |
| T-60 | 储备很小的演练部署 | 领取超过储备的奖励 | 只支付储备余额；储备降为零；本金不受影响 |  |  |
| T-61 | 直接调用 | 调用 `fundRewardReserve(0)`，再在授权后从任意账户调用 `fundRewardReserve(x)` | 先以 `InvalidAmount` 拒绝，然后发出 `RewardReserveFunded(from, x)`；`rewardReserve` 增加 `x` |  |  |
| T-62 | 直接调用 | 在多个时点比较 `token.balanceOf(vault)` 与 `totalStaked + rewardReserve` | Vault 余额从不低于该总和 |  |  |
| T-63 | 零金额，直接调用 | 调用 `stake(0)`，再调用 `withdraw(0)` | 两种情况均以 `InvalidAmount` 拒绝 |  |  |
| T-64 | Vault 未连接到当前注册表 | 尝试存款 | 以 `Inactive` 拒绝 |  |  |
| T-65 | 仓位已开立 | 查看显示的锁定时长 | 以小时显示，由 `LOCK_DURATION` 推导：24 小时 |  |  |
| T-66 | 已打开 dapp | 查找 WETH 奖励流程 | 无：只提供 CUBIT 奖励 |  |  |

## 7. Launchpad 治理 vault

治理 vault 接收 Forge 的启动费用（ETH）及 Forge 子项目买墙吸收的代币。**每笔存入自其本身到账起锁定 30 天**（`LOCK_DURATION`）。**只有部署者**可以领取，永久如此且无法转让这项权利，且只能按从旧到新的顺序领取已到期的批次。ETH 记在键 `ETH()`（零地址）下。验收前请重新阅读被测部署的 ABI。部署者可以用 `extendLock` 延长所有现有和未来存入的锁定；`lockExtension()` 只增不减，并加到每个日期上。

从子项目买墙自动发送由 T-52 核查，启动费用的存入由 T-81 核查。T-67 至 T-73 通过直接调用存入测试代币；T-108 领取一笔费用的 ETH。

| 用例 | 前置条件 | 步骤 | 预期结果 | 观察结果 | 严重程度 |
| --- | --- | --- | --- | --- | --- |
| T-67 | 测试代币，直接调用 | 先授权，再调用 `deposit(token, amount)` | 发出 `Deposited(token, from, amount, unlockAt)`；`unlockAt` 等于区块时间戳加 30 天；`held(token)` 相应增加 |  |  |
| T-68 | 存入未满 30 天 | 由部署者调用 `claim(token, n)` | 以 `NothingToClaim` 拒绝 |  |  |
| T-69 | 批次已解锁 | 由其他账户调用 `claim(token, n)` | 以 `NotDeployer` 拒绝 |  |  |
| T-70 | 连续 7 天每天存入一笔 | 自首笔存入后第 30 天起每天领取 | 每天释放一个批次，按从旧到新的顺序；最后一批在第七笔存入 30 天后释放；每次领取均发出 `Claimed(token, amount, tranches)` |  |  |
| T-71 | 多个批次已解锁 | 调用 `claim(token, 1)` | 只支付一个批次；下一个批次仍可领取 |  |  |
| T-72 | 通过普通转账发送的代币 | 调用 `lockUntracked(token)`，然后在没有新转账的情况下再次调用 | 新批次自第一次调用起锁定 30 天；第二次调用以 `NothingToLock` 拒绝 |  |  |
| T-73 | 有已锁定和已解锁的批次 | 读取 `claimable(token)` 与 `locked(token)` | 可领取金额加已锁定金额等于 `held(token)` |  |  |
| T-108 | T-81 的启动费用已存入超过 30 天 | 先从另一个账户、再从部署者调用 `claim(address(0), 1)` | 先被 `NotDeployer` 拒绝，随后 ETH 支付给部署者；发出 `Claimed(address(0), amount, 1)`；`held(address(0))` 减少支付的金额 |  |  |
| T-109 | 锁定中的批次 | 先从另一个账户、再从部署者调用 `extendLock(extra)` | 先被 `NotDeployer` 拒绝，随后发出 `LockExtended(extra, lockExtension)`；用 `tranche(token, i)` 读取的每个日期推迟 `extra`；没有任何函数可以缩短锁定 |  |  |

## 8. Forge

Forge 是作为未来发布介绍的公开 launchpad。它不属于 CUBIT 的启动：之后会连同其治理 vault 一起添加。添加 launchpad 后，请记录其地址。

任何账户支付准确的费用即可启动子项目。Forge 子项目将其全部供应量存入自己的流动性带，Forge 在构造时接收治理 vault 的地址，且每次启动都将 0.005 ETH 的费用支付给该 vault，由该 vault 保管：启动者永远不会拿回。部署 salt 与启动者绑定。

| 用例 | 前置条件 | 步骤 | 预期结果 | 观察结果 | 严重程度 |
| --- | --- | --- | --- | --- | --- |
| T-81 | Forge 可用，任意账户 | 以 0.005 ETH 的确切费用启动一个子项目 | 发出 `ChildLaunched(token, hook, launcher, team, fee)`；子项目的 `BandBootstrapped` 显示存入量等于其全部供应量（允许舍入误差）；治理 vault 发出 `Deposited(address(0), forge, fee, unlockAt)`，其中 `unlockAt` 等于区块时间戳加 30 天及可能的延长；母 hook 的 `pendingFloorEth` 不变 |  |  |
| T-82 | Forge 可用 | 以错误的 value、空名称、零团队地址或其他模板尝试启动 | 被拒绝：`wrong launch fee`、`invalid name`、`invalid team` 或 `template mismatch` |  |  |
| T-110 | 被另一账户看到的启动 salt | 用相同 salt 从第二个账户启动 | 第一次启动的地址不会被占用：salt 与启动者绑定，若其 hook 地址不具备所需权限，第二次启动会以 `child deployment failed` 被拒绝 |  |  |

## 9. 替换与权限

注册表 authority 可以随时、无需等待地替换四个外围地址：Vault、路由器、Lens 与 Forge。每次替换都会发出 `ModuleUpdated`、**递增 `moduleRevision`**，并关闭相应功能，直到团队重新开放：Vault、Momentum 或 Forge；替换路由器不会关闭任何功能。已登记的候选、连接到其他 hook 或其他代币的候选，或已持有质押的候选，都会以 `InvalidModule` 被拒绝。

Hook **没有任何管理员**，任何人都无法暂停交换或买墙机制。团队地址保留永久权力：它获得税费中的团队份额，并替换注册表中的模块、随后将其激活。

| 用例 | 前置条件 | 步骤 | 预期结果 | 观察结果 | 严重程度 |
| --- | --- | --- | --- | --- | --- |
| T-83 | 当前 Vault 中有存款与储备 | 替换 Vault | 存入的 CUBIT、奖励储备与期限**仍留在旧 Vault**；没有资金被移动 |  |  |
| T-84 | Vault 已被替换 | 在旧 Vault 上先领取再提款，然后尝试存款 | 领取和提款仍可用；新存款以 `Inactive` 被拒绝 |  |  |
| T-85 | 候选已登记，或持有质押 | 尝试轮换 | 以 `InvalidModule` 拒绝 |  |  |
| T-86 | 已完成替换 | 读取 `moduleRevision()` 与事件；替换 Vault 后，尝试向新 Vault 存款 | 修订号已递增；`ModuleUpdated(module, previous, current, revision)` 数据一致；在 Vault 重新激活之前，存款被 `Inactive` 拒绝 |  |  |
| T-87 | 已向旧路由器授权 | 替换路由器，然后尝试卖出 | 旧授权对新 spender 无效；会请求新的授权 |  |  |
| T-88 | 路由器已替换 | 通过旧路由器交换 | 交换仍可进行，适用 hook 税费；dapp 使用新路由器 |  |  |
| T-89 | 直接调用 | 检查已部署 hook 的 ABI | 没有任何函数可以中止交换或买墙机制；hook 没有任何管理员 |  |  |
| T-90 | 直接调用 | 读取 Lens 的 `snapshot()`，再在同一区块读取买墙分页 | 快照只包含市场、流动性带、买墙和账户字段、总供应量、奖励储备、活跃买墙数量、读取区块与最佳买墙，不含买墙总量，其开销也不随买墙数量增长；流通供应量等于 `totalSupply` 减去买墙中的 CUBIT 和 `rewardReserve`，持有 CUBIT 等于该供应量减去 `bandTokens` |  |  |
| T-91 | 启动后的任意时刻 | 买入与卖出 | 交换正常进行：任何账户都无法阻止交换 |  |  |

## 10. 预期拒绝用例

本表在整个验收过程中作为参考。自动买墙不会给卖出增加拒绝情形：买墙无法配置时资金进入等待，发送失败时 CUBIT 保持等待。

> **注意事项。** 在 dapp 当前源码中，合约错误不会被翻译：链上拒绝可能以原始消息形式显示，并在显示时被截断。**对于每个触发的拒绝，请记录显示的确切文字**，并判断其是否易于理解。

| 错误 | 触发原因 | 应用应显示的内容 |
| --- | --- | --- |
| `ExternalLiquidityForbidden` | 第三方添加流动性 | 无法操作：协议是唯一的流动性提供者 |
| `SupplyNotDeposited` | 以低于 80 % 供应量的存入初始化 | 无法启动，存入不足 |
| `Expired` | 交易截止时间已过 | 报价已过期，请重新计算 |
| `TooLittleReceived(received, minimum)` | 输出低于可接受的最低值 | 触发滑点保护 |
| `TooMuchRequested(required, maximum)` | 输入高于可接受的上限 | 触发输入上限保护 |
| `IncompleteInput` | 固定输入未被完全消耗 | 金额超过可用流动性 |
| `InsufficientOutput` | 固定输出未被完全满足 | 流动性簿无法提供该输出 |
| `InvalidAmount`, `ZeroRecipient`, `WrongValue`, `WrongPool` | 订单参数无效，或向 Vault 发送零金额 | 输入错误，不显示原始代码 |
| `Inactive`, `Locked` | Vault 未连接到当前注册表，或到期前提款 | 模块不可用，或显示解锁日期 |
| `NotDeployer`, `NothingToClaim`, `NothingToLock`, `NothingToExtend` | 第三方向治理 vault 领取或延长、到期前领取、没有新余额时锁定、延长为零 | 仅限特定角色的操作、无可领取内容、无可锁定内容或无可延长内容 |
| `NotAuthority`, `InvalidModule` | 第三方请求替换，或候选不兼容 | 替换被拒绝，并说明原因 |

纯应用层的拒绝也需记录：报价过期、交换上下文已改变、钱包处于其他链、账户已更换、模块修订已改变、税率尚未核实。

## 11. 应用

这些用例通过 dapp 执行。所引界面行为来自其源码，在验收时核查。

| 用例 | 前置条件 | 步骤 | 预期结果 | 观察结果 | 严重程度 |
| --- | --- | --- | --- | --- | --- |
| T-92 | Dapp 已打开 | 逐一浏览选择器中的十种语言 | 每种语言都显示已翻译的内容，无缺失文字或溢出；产品名称按设计保留英文 |  |  |
| T-93 | 已选择语言 | 重新加载，然后将窗口缩小到 640 px 以下 | 所选语言在会话之间保留；低于 640 px 时，选择器只显示国旗 |  |  |
| T-94 | 非英语语言 | 将首页标题与英文版比较 | 非英语版本的标题有意缩短；不得溢出或被截断 |  |  |
| T-95 | 约 400 px 的屏幕 | 浏览每个页面 | 无水平溢出；宽区域在自身容器内滚动；按钮仍可触及 |  |  |
| T-96 | 窗口宽度在 768 至 1279 px 之间 | 打开导航 | 宽度不超过 1279 px 时使用紧凑菜单；导航后菜单自动关闭 |  |  |
| T-97 | 交易已确认 | 在同一区块将显示的每个金额与链上数值比较 | 金额一致；显示舍入不改变所签名的金额 |  |  |
| T-98 | 操作准备中 | 在流程中途切换钱包网络 | 报价失效，在预期网络之外拒绝签名；按钮先提示切换网络，然后需要再次操作才能交换 |  |  |
| T-99 | 操作准备中 | 在流程中途切换钱包账户 | 为新账户重新计算余额、授权与报价；为旧账户准备的签名被拒绝 |  |  |
| T-100 | 已授予授权，交换尚未签名 | 让模块修订在两者之间发生变化 | 应用重新验证上下文，不会静默转向新的 spender 继续操作 |  |  |
| T-101 | RPC 不可用或读取数据陈旧 | 切断 RPC 访问后观察 | 状态被标示为未核实，操作被禁用 |  |  |
| T-102 | 交易已发送 | 跟踪 hash，再跟踪回执 | 界面区分“已提交”与“成功”；事件可在 Sepolia 区块浏览器上核查 |  |  |
| T-103 | 已触发一次链上拒绝 | 完整记录显示的文字 | 消息须让用户能够理解；记录任何原始技术代码或被截断的消息 |  |  |
| T-104 | 中文、韩文和日文 | 在无法访问外部字体服务的情况下显示这些语言 | 字符正常显示：字体由网站自身提供 |  |  |
| T-105 | Proof 页面已打开 | 查看流动性带、买墙和待配置资金 | `bandEth`、`bandTokens`、买墙、待配置 ETH 和待发送的 CUBIT 分开显示；任何页面都不展示 ladder、keeper 或买墙销毁 |  |  |

## 12. 记录表

前面各节的每张表格**就是**该节的记录表：请随用例逐一填写“观察结果”与“严重程度”两列。观察结果至少应记录交易 hash 或读取区块，再写明所观察到的情况。

附于报告的汇总：

| 节 | 用例 | 符合 | 偏差 | 最高严重程度 |
| --- | --- | --- | --- | --- |
| 1. 准备 | T-01 至 T-06 |  |  |  |
| 2. 启动与流动性带 | T-07 至 T-16 |  |  |  |
| 3. 买入与卖出 | T-17 至 T-33 |  |  |  |
| 4. 税费与记账 | T-34 至 T-40 |  |  |  |
| 5. 自动买墙 | T-41 至 T-52、T-106 与 T-107 |  |  |  |
| 6. mCUBIT Vault | T-53 至 T-66 |  |  |  |
| 7. 治理 vault | T-67 至 T-73、T-108 及 T-109 |  |  |  |
| 8. Forge | T-81、T-82 及 T-110 |  |  |  |
| 9. 替换与权限 | T-83 至 T-91 |  |  |  |
| 10. 拒绝用例 | 通用参考 |  |  |  |
| 11. 应用 | T-92 至 T-105 |  |  |  |

偏差应对应**用例编号**，绝不能只附一张截图。请附上网络、部署地址、区块、hash 以及应用版本。

## 本计划的局限

本计划描述新版本代码与 2026 年 9 月 14 日决定所规定的内容。它**不构成验证**：Sepolia 上的验收成功不能替代测试活动。

“待测试时确认”的要点须经观察后补充到本页。

<p class="source-note">来源： <code>contracts/src/CubitHook.sol</code>, <code>CubitLens.sol</code>, <code>interfaces/ICubitHook.sol</code>, <code>interfaces/ICubitLens.sol</code>, <code>libraries/BandLib.sol</code>, <code>libraries/WallLib.sol</code>, <code>periphery/CubitRouter.sol</code>, <code>CubitV2.sol</code>, <code>CubitVault.sol</code>, <code>CubitGovernanceVault.sol</code>, <code>CubitForge.sol</code>, <code>CubitLaunch.sol</code>、 <code>dapp/src</code> 的当前流程，以及记录于 <code>contracts/docs/REDESIGN_HANDOFF.md</code> 的 2026 年 9 月 14 日设计决定。</p>
