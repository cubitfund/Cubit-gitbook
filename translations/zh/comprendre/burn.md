---
description: "被卖出触及的买墙会怎样：部分消耗时保持原位；被完全穿越时，它会被清空，其 CUBIT 转入 vault 奖励储备，不销毁。"
section: "01 / 理解"
reading: "阅读需 4 分钟"
search:
  keywords: [吸收, 穿越, 部分消耗, 储备, vault, 奖励, burn, 销毁, 治理, deliverAbsorbed]
---

# 被穿越的买墙与 vault 储备

卖出触及买墙时，该买墙的 ETH 会回购 CUBIT。在新版本中，这些 CUBIT **不再被销毁**：被完全穿越的买墙中的 CUBIT 转入 **vault 奖励储备**。

## 部分消耗还是完全穿越

| 买墙状态 | 会发生什么 |
| --- | --- |
| 未被触及 | 买墙只含 ETH，位于其 tick |
| 部分消耗 | 其部分 ETH 已回购 CUBIT；买墙保持原位 |
| 部分消耗后价格回升 | 买墙卖回其 CUBIT 并重新充入 ETH |
| 被完全穿越 | 买墙只剩 CUBIT；穿越它的那笔卖出将其清空，其 CUBIT 等待发送，剩余 ETH 返回 `pendingFloorEth` |

买墙只有在**被完全穿越**后才会被清空。只要它仅被部分消耗，hook 就不会动它：它继续作为其 tick 上的普通 LP 仓位运作。同一笔卖出会清空它完全穿越的所有买墙，由近及远。

## CUBIT 的去向

```text
一笔卖出完全穿越一个买墙
    → 该笔卖出清空买墙
    → 其 CUBIT 在 pendingAbsorbedTokens 中等待
    → deliverAbsorbed() 将其发送到 vault 奖励储备
```

CUBIT 路由器在每笔卖出结束时于同一交易中调用 `deliverAbsorbed()`。若该发送失败，卖出不会被阻断：这些 CUBIT 仍隔离在 hook 中。在通过其他路由器完成的卖出之后，或在发送失败之后，任何账户都可以调用 `deliverAbsorbed()`，且无法选择接收方或金额。随后，该储备支付 vault 存款人的每日奖励。[mCUBIT Vault](../v2/vault.md)。

## 供应量不再减少

供应量仍固定为 **2100 万 CUBIT**，不增发。由于买墙中的 CUBIT 不再被销毁，供应量不会随吸收而减少：CUBIT 不再被描述为通缩代币。只有初始存入产生的、可忽略不计的舍入零头会在启动时销毁。

从储备中作为奖励发放的 CUBIT 是普通代币：获得者可以持有、存入或卖出。

## Forge 子项目

对于由 Forge 创建的子市场，被清空买墙中的代币不会进入质押 vault，而是由 `deliverAbsorbed()` 发送到 **launchpad 治理 vault**，其地址固定在部署该子代币的 Forge 中。每笔存入自其本身到账起锁定 30 天，且只有该 vault 的部署者可以领取。[Momentum 与 Forge](../v2/momentum-forge.md)。

## 吸收不保证什么

吸收卖出的买墙会花掉其 ETH。部分消耗的买墙只有在价格回升到其上方时才会重新充入 ETH；被清空的买墙只有在新注资落到其 tick 上时才会恢复深度。

原先 strict burn 的证据不能验证这一新路径。该路径自 2026 年 9 月 22 日起在 Ethereum 上运行。[查看已知局限](../securite/risques.md)。

## 核查资金流动

要追踪一次吸收，请对照 hook 的事件：每个被清空的买墙对应 `WallAbsorbed(id, cubit, ethRemaining)`，进入等待的总量对应 `TokensAbsorbed(amount, pendingAbsorbedTokens)`，发送时对应 `AbsorbedDelivered(sink, amount)`。在接收端，vault 发出 `RewardReserveFunded`；对于 Forge 子项目，治理 vault 发出 `Deposited`。

<p class="source-note">来源：2026 年 9 月 14 日设计决定、 <code>CubitHook._collectCrossedWalls</code>, <code>deliverAbsorbed</code>, <code>absorbedTokenSink</code>, <code>WallLib.collectCrossed</code>, <code>CubitRouter._finishSwap</code>, <code>CubitVault.fundRewardReserve</code> 以及 <code>periphery/CubitGovernanceVault.sol</code>。</p>
