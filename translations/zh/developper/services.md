---
description: "运维事件中继：dry-run、游标、模块修订与买墙措辞；keeper 已无用途。"
section: "04 / 构建"
reading: "阅读需 4 分钟"
---

# 服务与运维

仓库有两个 Node 进程：属于旧模型的 **keeper**，以及可准备发布内容的**事件中继**。本地配置不证明服务已持续运行。

## 新版本中不再有 keeper

旧 keeper 调用 `rebalance`、`raiseFloor` 以及对吸收代币的销毁。这些维护函数已不复存在：流动性带永不重组，买墙在卖出过程中配置和清空，CUBIT 路由器将被吸收的 CUBIT 发送至 vault。

`services/keeper` 服务仍保留在仓库中，但已无存在意义，不应针对新版本运行。不支付任何奖励金：若被吸收的 CUBIT 仍在等待发送，例如在通过其他路由器完成的卖出之后，任何账户都可以调用 `deliverAbsorbed()`。

## 事件中继

`services/floor-bot` 读取事件、准备文字，保留游标与去重键 `transactionHash:logIndex`。

Dry-run 与发布模式状态分开。游标含链与 hook 上下文；服务支持网络使用最终确认区块。重组或不一致检查点须先协调再恢复。

中继发布前持久化 `pendingPost`。若外部服务已接受消息，而进程在记录成功前停止，重试前应确认消息是否存在：本地数据库与社交网络不能共同提交。

GitBook 不执行发布。实际启用中继需独立的运维配置与授权。

## 模块变化

当前 Lens 从注册表解析。整个操作期间保留核心身份与修订上下文。

服务读取所述版本的 ABI 与事件。未经针对新版本的验收，不能宣称适配旧模型的中继已通过新版本验证。

## 为买墙调整措辞

旧中继播报 `FloorRaised` 事件，该事件已不再存在。在新版本中，每笔卖出都可能创建或加厚一个买墙（`WallFunded`），有时价格低于前一个买墙；被完全穿越的买墙会被清空（`WallAbsorbed`），随后其 CUBIT 转入 vault 储备（`AbsorbedDelivered`）。

因此中继须说明**相关买墙、其价位以及新增或被吸收的资金**，不能仅据事件名推断全局上涨。旧说法“floor 永远上升”不描述这一策略，任何公告都不得把买墙描述为价格保证。

## 有用的运维检查

追踪 RPC 错误、配置偏差、游标、最后处理区块的时间及待发布内容。保存恢复日志和版本身份，不包含私有签名数据。

能重启进程的监控不能代替解决不一致检查点或注册表变更问题。

<p class="source-note">来源： <code>services/floor-bot/README.md</code>, <code>services/keeper/README.md</code>, <code>services/shared</code>, <code>interfaces/ICubitHook.sol</code> 以及 <code>contracts/docs/REDESIGN_HANDOFF.md</code>.</p>
