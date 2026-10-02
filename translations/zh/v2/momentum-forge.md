---
description: "Momentum 提供只读的市场视图。Forge 是公开 launchpad；其启动费用与子市场买墙吸收的代币转入 launchpad 治理 vault。"
section: "03 / V2 模块"
reading: "阅读需 5 分钟"
search:
  keywords: [momentum, forge, 子市场, launchpad, 公开, 治理, NAV, 锁定, 30 天, 延长]
---

# Momentum 与 Forge

两者角色不同：**Momentum 展示市场状态**，**Forge 让任何人都能启动独立子市场**。

## Momentum：观察市场

Momentum 是应用中的一个页面：针对每个代币，它根据 hook 的事件和 Lens 的读取，展示活跃买墙、部分消耗的买墙以及被穿越买墙的历史。它自 2026 年 9 月 23 日起开放。

它是**只读**功能，无权提取买墙 ETH 或修改核心规则。显示变化不是交易指令。

实际使用的几何结构仍由 hook 决定，前端组件不能自行创造。

## Forge：公开 launchpad

Forge **向所有人开放**：任何账户支付准确的启动费用即可启动子市场。它未包含在 CUBIT 的启动中：团队于 2026 年 9 月 23 日连同其治理 vault 一起添加了它，并于同日开放。

每个子项目有自己的代币、hook、池标识和储备。Hook 创建模板由 Forge 构造函数固定的 hash 控制。部署 salt 与启动者绑定：同一区块中的两次启动不会互相失效，复制其他账户的 salt 也无法夺走其启动。

子项目**将 100 % 的供应量存入自己的流动性带**，既没有 vault 储备，也没有团队分配。名称、符号、团队地址、部署 salt 和提供的代码均受检查。与母项目的 hook 一样，子项目的 hook 也没有任何管理员。创建子项目不授予对 CUBIT 母池的权限。参数是强制设定的：每个子项目的启动估值、供应量和税率都相同。

## Launchpad 治理 vault

**launchpad 治理 vault** 接收 Forge 的启动费用（ETH），以及子项目买墙吸收的代币，这些代币不会进入母项目的质押 vault：

- 每笔存入**自入账之时起锁定 30 天**，另加可能的延长：存入、启动费用或子市场的送达为即时入账，直接转入 vault 的代币则要到调用 `lockUntracked` 时才入账；
- **部署者可随时用 `extendLock` 延长整个 vault 的锁定**，包括现有和未来的存入、代币与 ETH；没有任何函数可以缩短锁定；
- 例如，连续 7 天每天收到 10 个代币，将分 7 个批次释放，每天一批，最后一批在 1 个月零 7 天时释放；
- **只有该 vault 的部署者**可以领取已解锁的批次，且永久如此：没有任何函数可以转让这项权利；
- 其持有资产旨在作为 launchpad 代币的价值参考（NAV）。

Forge 在构造时通过 `governanceVault` 接收该 vault 的地址。子项目的 hook 通过部署其代币的 Forge 找到该地址，随后 `deliverAbsorbed()` 将被清空买墙中的代币转入该 vault，并以 `lockUntracked` 锁定。

## 启动费用

每次启动都在同一笔交易中通过 `depositEth()` 将其费用以 ETH 支付给 launchpad 治理 vault。该费用自此归治理所有：**启动者永远不会拿回**，只有该 vault 的**部署者**可以用 `claim` 领取。该费用不为 CUBIT 的买墙注资。与该 vault 收到的其他存入一样，之后它遵循上文所述的锁定规则。

`launchFee()` 金额在各 Forge 构造时固定，为 **0.005 ETH**，即 5 × 10^15 wei，且不可更改。因此更改费用需要一个新的 Forge；请务必重读实际所用合约的链上金额。

## Forge 被替换时

团队可随时、无需等待地替换 Forge。替换变更未来启动使用的参考工厂，并随之变更接收其费用的治理 vault；替换会停用 Forge，直到重新激活。已创建子项目保留自己的合约和资金。因此，launchpad v2 可以为自己的启动设定其他参数。

注册表兼容性检查不能替代模板与工厂审查。

## Launchpad v2

子项目的参数由已登记的 Forge 强制设定。替换用的 Forge，即 launchpad v2，可以设定其他参数；由团队在决定时开放。

已启动的子项目继续在各自的池中运行，其买墙吸收的代币仍转入启动它们的 Forge 的治理 vault。

<p class="source-note">来源：2026 年 9 月 14 日和 15 日设计决定、 <code>periphery/CubitForge.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>CubitHook.absorbedTokenSink</code>, <code>CubitV2.setForge</code> 以及 <code>dapp/src/pages/Momentum.tsx</code>.</p>
