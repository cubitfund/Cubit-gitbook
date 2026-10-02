---
description: "公式决定买墙位置，卖出决定其规模。每笔卖出时计算的目标、示例，以及固定在各自 tick 的买墙。"
section: "01 / 理解"
reading: "7 分钟 + 交互示例"
search:
  keywords: [买墙, 墙, 目标, 价格, 深度, 容量, capacity, 回撤, 公式, 卖出, 16200, 44200, 28200]
---

# 目标与固定买墙

**公式决定买墙的位置，卖出决定买墙的规模。** 买墙是在现价下方的指定 tick 上以 ETH 注资的 LP 仓位。

## 每笔卖出时的公式

设 `M` 为卖出后的市场市值，`B` 为启动基准，二者单位相同：

<div class="formula">目标 = M − (M − B) × 0.6<span class="line-break"></span>= 0.4 × M + 0.6 × B</div>

此系数回撤**市场与基准差额的 60 %**，即在基准之上保留该差额的 40 %。以示例基准 `B = 7 000` 计算：

| 卖出后的市场 | 计算 | 买墙目标 |
| --- | --- | --- |
| 30 000 | 30 000 − 23 000 × 0.6 | **16 200** |
| 100 000 | 100 000 − 93 000 × 0.6 | **44 200** |
| 回到 60 000 | 60 000 − 53 000 × 0.6 | **28 200** |

第三次计算从 **60 000** 重新开始，即使市场此前已达到 100 000。不存在基于历史最高值的棘轮机制。目标在**每笔卖出时**按该笔卖出后的价格重新计算：不再有先累积、再由维护调用配置的储备。

## 调整市场数值

下例保留 16.2k 和 44.2k 两个旧买墙，再计算下一个买墙的目标。数值使用相同的市值单位，示例基准为 7 000。此示意图不模拟吸收、余额或交易。

<section class="wall-lab" aria-label="教学目标计算器">
  <header><span>卖出后的目标</span><span>固定基准：7 000</span></header>
  <div class="wall-controls">
    <label for="market-cap">卖出后的市场 <output id="market-value" for="market-cap">60 000 单位</output></label>
    <input id="market-cap" type="range" min="7000" max="120000" step="1000" value="60000">
    <div class="wall-presets"><button type="button" data-market-preset="30000">30k</button><button type="button" data-market-preset="100000">100k</button><button type="button" data-market-preset="60000">回到 60k</button></div>
  </div>
  <div class="wall-levels" aria-label="市值水平比较">
    <div class="level-row"><span>旧买墙 A</span><div class="level-track"><i style="width:13.5%"></i></div><b>16.2k</b></div>
    <div class="level-row"><span>旧买墙 B</span><div class="level-track"><i style="width:36.833%"></i></div><b>44.2k</b></div>
    <div class="level-row new-target"><span>新目标</span><div class="level-track"><i id="lab-target-bar" style="width:23.5%"></i></div><b id="lab-target-label">28.2k</b></div>
    <div class="level-row market"><span>当前市场</span><div class="level-track"><i id="lab-market-bar" style="width:50%"></i></div><b id="lab-market-label">60k</b></div>
  </div>
  <div class="wall-result" aria-live="polite"><span>下一个买墙的目标</span><strong id="target-value">28 200 单位</strong></div>
  <p class="lab-explanation">只有新注资跟随当前目标。旧买墙停留在各自的 tick；每个价位仍可用的 ETH 数量需单独查看。</p>
</section>

## 每个 tick 一个买墙，永不移动

买墙的 ETH 一经配置，就始终归属于其 tick。市场上涨或下跌都不会把旧买墙移至新目标。

- 若某笔注资的目标落在已有买墙的 tick 上，则**加厚该买墙**，而不是新建第二个买墙。
- 卖出可能部分消耗买墙：此时其部分 ETH 会回购 CUBIT。
- 仅被部分消耗的买墙**保持原位**。若价格回升，它会卖回其 CUBIT 并重新充入 ETH。
- **被完全穿越**的买墙由穿越它的那笔卖出清空：其 CUBIT 转入 vault 奖励储备，不销毁；其剩余 ETH 返回待配置资金。

买墙标识符永久保留。通过 tick 索引可以找到卖出触及的买墙。[被穿越的买墙与 vault 储备](burn.md)。

## 目标无法配置时

买墙是 100 % ETH 的仓位：它必须位于现价下方。价格等于或低于启动价格时，公式给出的目标等于或高于市场价格，无法用纯 ETH 注资。

此时，hook 将买墙配置在**现价下方 1 %**，按 tick 舍入，而不是让资金等待。否则，累积的资金可能被一次性配置在被抬高的价格上：某笔交易先在前面买入抬价，再把自己的 CUBIT 卖入这个买墙。hook 依据舍入后的 tick 判断，而非精确目标：在启动价格附近，舍入后的 40/60 目标仍可能位于市场下方一点并被直接采用，此时距离小于 1 %。

只有太小而无法形成仓位的金额（即零头）、目标买墙触及单个 tick 的流动性上限（Uniswap v4 的限制）时可能产生的余量，以及价格位于 tick 范围最顶端、价格下方已容不下任何买墙的极端情况，才会在 `pendingFloorEth` 中等待，由后续卖出配置。卖出本身绝不会因此被拒绝。

## 实际配置的 ETH

Hook 将全部待配置的 ETH（含每笔卖出的 12 %）放入与目标对应的仓位。后续卖出可消耗这些 ETH：每个买墙的储备有限。买墙无需等到足以覆盖全部供应量才获得资金。

## 从启动价格到 tick

合约以每 CUBIT 的 ETH 价格计算：`cible = 0.4 × prix courant + 0.6 × prix de lancement`。启动价格由**部署时固定的启动 FDV** 除以 2100 万 CUBIT 得出。新版本采用 **3.75 ETH** 的 FDV；此后该价格保持固定，不随美元变动。

本页以单位表示的示例将同一公式应用于市值。其 7 000 基准仅作示例，并非对所采用的 3.75 ETH 的换算。

Tick 进一步对可执行价位舍入。ETH 为 `currency0`，因此 **CUBIT 价格越高，池 tick 越低**。数学目标、实际配置的 tick 与卖出净价可能不同。

## 界面应显示什么

界面应区分当前市场、流动性带、下一目标、各有效买墙及其深度，以及待配置的 ETH 与待发送的 CUBIT。单独一行“floor”无法概括整个流动性簿。

历史参考字段 `floorPrice` 表示**最近一次获得注资的买墙**，它可能低于前一个。不可将它解释为全局保证最低价。[读取 dapp 数据](../utiliser/preuves.md)。

<p class="source-note">来源：2026 年 9 月 14 日设计决定、 <code>BandLib.retracementWallTarget</code>, <code>underMarketWallTarget</code>, <code>WALL_RETRACEMENT_BPS</code>, <code>WallLib.fund</code> 以及 <code>CubitHook._placeWall</code>。</p>
