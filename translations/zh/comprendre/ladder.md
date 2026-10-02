---
description: "单一宽幅流动性带，启动时以 80 % 的供应量建立且永不撤出：CUBIT 的交易流动性。"
section: "01 / 理解"
reading: "阅读需 4 分钟"
search:
  keywords: [流动性带, band, 流动性, TIDE, 曲线, x·y=k, 启动, FDV, ladder]
---

# 流动性带

CUBIT 的交易流动性集中在**单一宽幅流动性带**中，采用 TIDE 模型。Hook 在启动时建立它，且永不撤出。它取代了原先的阶梯流动性（ladder）。

## 流动性带包含什么

| 参数 | 采用值 |
| --- | --- |
| 存入 | 80 % 的供应量，即 1680 万 CUBIT |
| 启动时构成 | 100 % CUBIT，不含 ETH |
| 价格范围 | 高于启动价格的全部价格 |
| 启动 FDV | 3.75 ETH，即流动性带深度为 3 ETH |
| 撤出 | 无：该仓位永不撤出 |

流动性带的下界对应按 tick 舍入后的启动价格，因此该仓位起初不含任何 ETH。在此之上，它覆盖池的整条价格曲线。

## x·y=k 曲线

买入和卖出都沿流动性带的恒定乘积曲线进行。买入向其中存入 ETH 并取出 CUBIT：价格上涨。卖出则相反：价格下跌。

启动 FDV 为 3.75 ETH 时，这 1680 万 CUBIT **按启动价格计价值 3 ETH**。起初，流动性带的表现如同一个由 1680 万 CUBIT 对 3 ETH 构成的 x·y=k 池。这 3 ETH 是**虚拟的**：它们决定曲线的斜率，但流动性带实际只持有买方带入的 ETH。

## 流动性带不保证什么

卖方能从流动性带取出的 ETH，就是买方存入其中的 ETH。价格回到启动价格时，流动性带只剩 CUBIT：在该价格以下，它无法再回购 CUBIT。

因此，在启动价格以下，卖出只能由买墙中仍存在的 ETH 承接。3 ETH 的深度既不是协议存入的 ETH 储备，也不是价格底线。

## 随 ladder 一起消失的内容

流动性带取代了原先可移动的流动性簿。以下内容已删除：

- 阶梯流动性（ladder）、其连续价格带及代币储备；
- ETH 缓冲仓位（cushion）；
- `rebalance`、`raiseFloor`、转入买墙的 sweep 以及 keeper 奖励。

市场运转无需任何维护调用：不再有 keeper。

## Forge 子市场的流动性带

由 Forge 创建的子市场采用相同模型，区别在于：**它将 100 % 的供应量存入自己的流动性带**。它既没有 vault 储备，也没有团队分配。Hook 要求存入至少 80 % 的供应量，并将全部存入量放入流动性带。[Momentum 与 Forge](../v2/momentum-forge.md)。

## 核查流动性带

Hook 的 `band()` 视图返回该仓位的 tick 与流动性；启动时发出 `BandBootstrapped` 事件。Lens 提供 `bandEth` 与 `bandTokens`，即流动性带按当前价格持有的 ETH 与 CUBIT，不含 LP 费用。[合约与集成](../developper/integration.md)。

<p class="source-note">来源： <code>CubitHook._bootstrap</code>, <code>afterInitialize</code>, <code>band()</code>, <code>MIN_POOL_SUPPLY</code>, <code>CubitLens.bandEth</code> / <code>bandTokens</code> 以及 <code>periphery/CubitForge.sol</code>。2026 年 9 月 14 日设计决定。</p>
