---
description: "CUBIT 的 V2 功能：自 2026 年 9 月 23 日起开放的 Momentum 与 Forge，以及自 2026 年 9 月 26 日起开放的 Vault。"
section: "03 / V2 模块"
reading: "阅读需 3 分钟"
---

# V2 功能

V2 为 CUBIT 市场扩展三种用途：存入 CUBIT 以获得 CUBIT 形式的每日奖励、观察市场，以及在公开 launchpad 上启动新代币。

Momentum 与 Forge 自 2026 年 9 月 23 日起开放，Vault 自 2026 年 9 月 26 日起开放。

## 功能开放

| 功能 | 开放 | 预期用途 |
| --- | --- | --- |
| mCUBIT Vault | 2026 年 9 月 26 日 | 存入 CUBIT，24 小时锁定，由储备支付 CUBIT 奖励 |
| Momentum | 2026 年 9 月 23 日 | 只读应用页面：活跃买墙、部分消耗的买墙及被穿越买墙的历史 |
| Forge | 2026 年 9 月 23 日，添加 launchpad 时 | 公开 launchpad：任何账户支付 0.005 ETH 的启动费用即可启动独立子市场 |

替换模块会关闭其功能，直到团队重新开放。

## 奖励存款

[Vault](vault.md) 提供不可转让的存款仓位、24 小时锁定，以及每天相当于存款 3 % 的 CUBIT 奖励，需每天领取。奖励仅由储备支付：启动时注入的 20 % 供应量，之后是被完全穿越的买墙中的 CUBIT。没有 WETH 奖励。

## 观察与创建

[Momentum 与 Forge](momentum-forge.md) 分别负责观察市场和启动子市场。Momentum 保持只读。Forge 是在 CUBIT 启动后添加的公开 launchpad；其 ETH 启动费用与子市场买墙吸收的代币转入 launchpad 治理 vault。

## 模块相关权限

团队地址可随时、无需等待地替换注册表中的外围模块，并随后将其激活。这些权力是永久的。

替换不会带走旧 Vault 仓位资金，也不会移动已创建子项目的储备。每个面向用户的模块都须识别和核查。[权限与替换](../securite/permissions.md)。

[路线图](../roadmap.md)详列这些发布的条件。
