---
description: "CUBIT 代码库地图：合约、流动性带与买墙、vault、dapp 及服务。"
section: "04 / 构建"
reading: "阅读需 6 分钟"
---

# 架构与代码库

仓库包含 Solidity 合约、React/Vite dapp 和两个 Node 服务。此 GitBook 独立位于 `gitbook/`，构建不读取私有配置或协议网络数据。

> 此处描述的版本位于 `redesign/tide-lp-autowalls-vault` 分支。

## 目录

| 目录 | 职责 |
| --- | --- |
| `contracts/src` | 代币、hook、库、接口及外围合约 |
| `contracts/test` | 基于旧 API 的历史 Foundry 测试；新版本的测试位于 `test/redesign` |
| `contracts/audit` | 补充验证测试框架与测试活动 |
| `contracts/script` | Foundry 部署脚本，以及可在本地节点重放的场景 |
| `contracts/scripts` | ABI 导出、检查和部署流程 |
| `contracts/deployments` | 公开版本清单与历史 |
| `dapp/src/chain` | 配置、ABI、读取、报价和交易 |
| `dapp/src/pages` | Swap、Proof、Staking、路线图及 V2 模块 |
| `services/shared` | 共享配置、客户端、ABI 及执行追踪 |
| `services/keeper` | 旧维护服务，在新版本中已无用途 |
| `services/floor-bot` | 读取事件并准备发布内容 |
| `audit/reports` | 带日期且关联修订的报告与证据 |
| `gitbook/docs` | 本文档的法语源码 |

## 核心合约

| 组件 | 职责 |
| --- | --- |
| `CubitToken` | 一次性初始发行 2100 万的 ERC-20，仅 hook 可销毁 |
| `CubitHook` | 税、流动性带、买墙的配置与清空、团队账户、V2 连接 |
| `BandLib` | 价格、换算与 tick 舍入、买墙目标 |
| `WallLib` | 按 tick 管理买墙：永久标识符、有效买墙索引、买墙注资及被穿越买墙的清空 |
| `PoolManager` v4 | 池状态、流动性仓位、交换与结算 |

Hook 是 CUBIT 池唯一的流动性提供者：任何其他添加流动性的操作都会被拒绝。资金通过仓位及 PoolManager 的 ERC-6909 claims 追踪，因此 hook 地址的原生 ETH 余额不足以衡量储备。

流动性带是由 `BAND_SALT` 标识的单一仓位。每个买墙以自己的 salt 占据一个 `tickSpacing` 单元。`WallLib` 操作 hook 存储：claims 与仓位仍归属于 hook。

## 外围合约

| 组件 | 职责 |
| --- | --- |
| `CubitRouter` | exact-input/output 交换、滑点限制、期限、结算，以及每笔卖出后发送被吸收的 CUBIT |
| `CubitLens` | 衍生视图：市场、流动性带、买墙、账户、流通供应量、持有 CUBIT 与最佳买墙 |
| `CubitV2` | 稳定模块注册表、修订及 vault 历史 |
| `CubitVault` | CUBIT 存款、24 小时锁定，以及由储备支付的 CUBIT 奖励 |
| `CubitGovernanceVault` | Launchpad 治理 vault：ETH 启动费用与子项目买墙的代币，每笔存入锁定 30 天，另加可能的延长；领取与延长永久仅限部署者 |
| `CubitForge` | 启动后添加的独立子市场公开 launchpad；0.005 ETH 的启动费用支付给治理 vault，其地址在构造时固定 |
| `CubitLaunch` | 单笔交易完成启动：80 % 的供应量存入流动性带，20 % 注入 vault 储备，并完成部署者买入 |

团队地址可随时、无需等待地在注册表中替换 Router、Lens、Vault 和 Forge，并随后将其激活；这些权力是永久的，每次替换都会停用相应功能，直到重新激活。代币、hook、池标识和注册表锚点不采用此替换机制，且 hook 没有任何管理员：任何人都无法暂停交换或买墙机制。

## 读取路径

```text
前端或服务
    → 公开清单：网络、核心、注册表
    → 指定区块的注册表：模块 + 修订
    → 检查模块连接
    → 同一区块的 Lens 与 hook 视图
    → 显示或模拟操作
```

前端中，`releases.ts` 解析模块，`vault.ts` 保留旧 Vault 读取。RPC 无响应不能允许签名。Dapp 数据层读取在用版本的 ABI。

## 交换路径

前端取得报价后进行模拟。路由器打开 PoolManager 结算上下文；hook 对 ETH 部分征税，交换沿流动性带曲线及所穿越的买墙进行。随后路由器结算 delta。

每笔卖出时，hook 在 `afterSwap` 中清空被完全穿越的买墙，再将待配置的 ETH 放入位于目标价位的买墙，该目标按卖出后的价格计算；若该目标不在市场价格下方，即价格等于或低于启动价格时，则配置在现价下方 1 %。卖出结束时，CUBIT 路由器调用 `deliverAbsorbed()`，将被吸收的 CUBIT 发送至 vault 储备；该发送失败不会阻断卖出。

边界很重要：路由器 callback 仅在预期操作期间允许 PoolManager 访问，付款人来自路由器已认证调用者。

## 新版本改变了什么

流动性带取代阶梯流动性（ladder），`rebalance`、`raiseFloor`、sweep 及奖励金均已删除。买墙在卖出过程中配置和清空，被穿越买墙的 CUBIT 转入 vault 储备，而不是被销毁。

历史测试套件 `contracts/test` 使用旧 API，无法与新版本一起编译；新版本的测试位于 `test/redesign`。后续步骤见[路线图](../roadmap.md)，已测试的组件见[版本状态](../securite/etat.md)。

<p class="source-note">来源：仓库所列文件，尤其 <code>CubitHook</code>, <code>BandLib</code>, <code>WallLib.Book</code>, <code>periphery/CubitRouter.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>releases.ts</code>, <code>contracts/docs/REDESIGN_HANDOFF.md</code> 及服务 README。</p>
