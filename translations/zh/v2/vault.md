---
description: "不可转让的 CUBIT 存款、24 小时锁定，以及每天 3 % 的 CUBIT 奖励：仅由储备支付，并以一天为上限。"
section: "03 / V2 模块"
reading: "阅读需 5 分钟"
search:
  keywords: [vault, 质押, stake, 锁定, lock, 提取, 奖励, 储备, claim, 领取, mCUBIT]
---

# mCUBIT Vault

Vault 支持把 CUBIT 存入**不可转让**仓位，并获得 **CUBIT 形式**的奖励。该模型不创建 CUBIT，也不赋予对买墙资金的任何权利。

mCUBIT 指这种存款体验；代码不创建可自由转让的 ERC-20 凭证代币。

> **自 2026 年 9 月 26 日起在 Ethereum 上开放。**

## 奖励来自何处

奖励**仅从 Vault 的奖励储备中**支付，绝不从存入的本金中支付。该储备的资金来源为：

- 启动时注入的 **20 % 供应量**，即 420 万 CUBIT；
- 卖出后由 `deliverAbsorbed()` 发送的**被完全穿越买墙中的 CUBIT**；
- 任何自愿注资：任何账户都可以通过 `fundRewardReserve(amount)` 向储备添加 CUBIT。

储备是有限的：储备耗尽时，奖励即停止。**奖励仅以 CUBIT 形式发放**，通过 `claimCubit()` 领取，且不保证任何收益。

## 奖励率及其上限

奖励为**每天存款的 3 %**，按自上次领取以来经过的时间按比例计算。

可领取金额**以一天为上限**：超过 24 小时未领取后，金额不再增加。要获得完整奖励，需每天领取；**未领取的超出部分将作废**。

| 距上次领取的时间 | 存入 1 000 CUBIT 时的可领取金额 |
| --- | --- |
| 12 小时 | 15 CUBIT |
| 24 小时 | 30 CUBIT |
| 48 小时 | 30 CUBIT：第二天的奖励作废 |

以上金额假设储备充足。若储备少于应付金额，则只支付储备余额。

## 存入 CUBIT

1. 检查所提供 Vault 的地址及其与协议的连接。
2. 授权 Vault 转移所选金额。
3. 调用 `stake(amount)` 并等待确认。
4. 在存款合约读取 `balanceOf(account)`、`unlockAt(account)` 与 `pendingCubit(account)`。

**每次追加存款都会重启该钱包在该 Vault 中整个仓位的 24 小时锁定。** 它还会支付截至当时已获得的奖励，并重新开始一天的计算周期。

存入的 CUBIT 仍是现有代币。存款既不是销毁，也不减少供应量。

## 领取与提取

`claimCubit()` 支付已获得的奖励，并重新开始一天的计算周期。提款锁定不阻止此领取。

链上 timestamp 达到 `unlockAt` 后，`withdraw(amount)` 返还存入的 CUBIT。提取可以是部分的；提取时会先支付已获得的奖励。

任何人都无法中止这些退出，但它们仍受持有仓位合约的规则与正常运作约束。

## Vault 被替换时

团队可随时、无需等待地替换 Vault。替换影响新存款所使用的合约，以及此后接收被吸收 CUBIT 的合约。**已记录的存入 CUBIT、奖励储备与解锁日期仍留在旧 Vault。** 替换不移动用户资金。

注册表保留历任 Vault 的列表。查询余额、领取或提取前，须检查所选地址。对旧 Vault 的授权不授权新 Vault。

注册表要求新 Vault 连接相同的 hook 和代币，且没有任何质押。替换会停用 Vault：新合约在重新激活之前不接受存款。

## 模块局限

奖励取决于储备余额：每天 3 % 的比率可能耗尽储备，届时发放即停止。替换检查验证声明地址的兼容性，不证明全部替换代码安全。储备记账、一天上限、买墙 CUBIT 的到账及旧 Vault 的退出，须在每次发布时验证。

<p class="source-note">来源： <code>periphery/CubitVault.sol</code>（<code>pendingCubit</code>, <code>claimCubit</code>, <code>fundRewardReserve</code>, <code>DAILY_REWARD_BPS</code>, <code>REWARD_PERIOD</code>, <code>LOCK_DURATION</code>）、 <code>CubitHook.deliverAbsorbed</code>、 <code>CubitV2.setVault</code> 以及 2026 年 9 月 14 日设计决定。</p>
