---
description: "核心固定标识、hook 没有管理员，以及团队地址对注册表模块的永久权力。"
section: "05 / 核查"
reading: "阅读需 5 分钟"
search:
  keywords: [权限, 团队, 管理团队, setters, 替换, 管理员, authority, admin, 治理]
---

# 权限与替换

CUBIT 区分标识固定、没有管理员的核心，以及管理外围模块的团队地址。**团队地址的权力是永久的。**

## 哪些保持固定

外围 setter 不替换代币、主 hook、PoolManager、poolId 和注册表锚点。

代币通过一次性连接授权 hook。核心税率、启动 FDV 和流动性带几何结构均没有 setter，流动性带一经建立就永不撤出。改变核心的新策略需要新版本、验证和部署，不会自动更新旧池。

## Hook 没有管理员

Hook **没有任何管理员**，任何人都无法暂停交换或买墙机制。

因此，任何地址都无法中止一笔卖出或买墙的配置。Hook 的规则按部署时的原样执行。

## 团队角色

团队地址 `TEAM_ADDRESS` 固定在 hook 中，并作为 `CubitV2` 注册表的 `authority()`。其权力是永久的：它获得税费中的团队份额（买入 3 %、卖出 3 %），并替换注册表中的模块、随后将其激活。它可以**随时并立即**替换 Vault、路由器、Lens 或 Forge，无需任何预告期。四个可替换地址如下：

| Setter | 主要连接检查 | 后果 |
| --- | --- | --- |
| `setVault(next)` | 有代码，相同 hook 与相同代币，无质押的新 Vault | 未来存款以及此后发送的被吸收 CUBIT 的新参考合约 |
| `setRouter(next)` | 有代码，相同 hook/PoolManager/poolId | 替换当前路由器：即 dapp 使用的路由器 |
| `setLens(next)` | 有代码，相同 hook/PoolManager/poolId/token | 替换当前读取合约 |
| `setForge(next)` | 有代码，相同 hook，治理 vault 有代码 | 登记或替换未来启动使用的参考 launchpad（启动时不存在），连同接收其费用的治理 vault |

每次变更发出 `ModuleUpdated`、递增 `moduleRevision`，并关闭相应功能，直到团队重新开放：替换 Vault、Lens 或 Forge，分别关闭 Vault、Momentum 或 Forge；替换路由器不会关闭任何功能。操作前检查新地址与代码。

## 替换的影响范围

替换在其交易中立即生效。它可以决定：

- CUBIT 买墙吸收的 CUBIT 在之后的发送中去往何处：hook 将其交付给已登记的 Vault；
- 未来的启动费用去往何处：已登记的 Forge 将其支付给自己的治理 vault；
- dapp 使用哪个路由器。

它不触及：

- 核心：代币、hook、流动性带、买墙与税费；
- 现有 vault 中已有的余额，包括本金与奖励储备。

团队保护该地址的私钥。

## 兼容性检查的局限

Getter 声明正确地址只能证明预期连接，不证明候选全部代码安全，也不证明未来实现没有代理或恶意行为。

因此团队决定未来操作所用外围代码。该能力要求对每次替换、字节码及交互重新核查。

## 已存入的资金

替换 Vault 不会转移旧合约中存入的 CUBIT 或奖励储备。仓位、期限及退出仍在旧 Vault。注册表保留 Vault 列表，前端必须继续展示这些仓位。

旧路由器仍可用于交换，并仍受 hook 税约束；授予旧路由器的授权不适用于新路由器。

替换 Forge 只影响未来启动，已创建子项目保留合约，以及启动它们的 Forge 的治理 vault。

这些 setter 不会追溯修复缺陷合约，也不移动其持有资金。链上可否调用退出与前端可用性需分别核查。

## Launchpad 治理 vault

治理 vault 既无管理员，也无提前退出。它接收 ETH 启动费用与子项目买墙吸收的代币：每笔存入自到账起锁定 30 天，之后**只有其部署者**可以领取。这项权利永久有效，没有任何函数可以转让：这意味着对该账户的明确信任。该部署者可随时延长整个 vault 的锁定，包括现有和未来的存入；没有任何函数可以缩短它。

## 授权与签名

授权绑定**特定 spender**，不会跟随注册表当前地址。修订或模块变更时，前端必须重验操作，尤其授权与交换之间。

协议的每项操作都是一笔交易：签名前请检查其目标地址和链。

<p class="source-note">来源： <code>CubitV2.sol</code>, <code>CubitHook.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>contracts/docs/MODULE_SETTERS.md</code> 及前端检查 <code>releases.ts</code> / <code>vault.ts</code>.</p>
