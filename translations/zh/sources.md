---
description: "阅读范围、文档优先级、视觉设计来源及 GitBook 维护方法。"
section: "05 / 核查"
reading: "指南参考资料"
search:
  keywords: [来源, 参考, 参考资料, 文档, HonKit, 规范, 版本, redesign]
---

# 来源与方法

本指南依据本地代码库及 **2026 年 9 月 14 日**冻结的设计决定编写。下列文件是仓库路径，不是网络端点。

新版本依据 `redesign/tide-lp-autowalls-vault` 分支描述。历史代码参考指向保留在 `work/v1-v2-fixed-walls` 分支的协议修订 `991fca9`。已发布的文档不构成所述合约的验证。

## 阅读顺序

新版本的参考依据是 **`contracts/docs/REDESIGN_HANDOFF.md`**。该文档记录设计决定及其在代码中的实现；它优先于先前的文档。

税费不变：**买入 3 % 全归团队**，**卖出 15 %：12 % 买墙、3 % 团队**。交易流动性为单一流动性带，买墙在每笔卖出时配置和清空，采用的启动 FDV 为 **3.75 ETH**。

文档 **`CUBIT-cahier-des-charges/docs/VERSION_ACTUELLE.md`** 曾将启动基准表述为 2100 万代币对应 **7 000 USD 的 FDV**。新版本直接以 ETH 固定 FDV；本指南不在这两种参考之间建立对应关系。

要确认实际运行情况，随后必须关联同一版本的代码、验证结果与部署。

代码注释不能替代已确认的决定。反过来，决定也不能证明实现或网络在执行它。

## 已阅读代码

| 来源 | 在指南中的用途 |
| --- | --- |
| `contracts/docs/REDESIGN_HANDOFF.md` | 已冻结的决定及其在代码中的实现 |
| `contracts/src/CubitToken.sol` | 固定供应量与销毁权 |
| `contracts/src/CubitHook.sol` | 税、流动性带、买墙、账户与 V2 连接 |
| `contracts/src/libraries/BandLib.sol` | 几何、价格、tick 与买墙目标 |
| `contracts/src/libraries/WallLib.sol` | 按 tick 管理买墙：买墙注资及被穿越买墙的清空 |
| `contracts/src/CubitLens.sol` 及接口 | 价格、流动性带、买墙、余额、流通供应量、持有 CUBIT 与最佳买墙 |
| `contracts/src/periphery/CubitRouter.sol` | 交换、限制、授权及被吸收 CUBIT 的发送 |
| `contracts/src/periphery/CubitV2.sol` | 模块身份与替换 |
| `contracts/src/periphery/CubitVault.sol` | 锁定、每日奖励与储备 |
| `contracts/src/periphery/CubitGovernanceVault.sol` | 锁定 30 天的存入与部署者领取 |
| `contracts/src/periphery/CubitForge.sol` | 公开 launchpad、子项目隔离及治理 vault 地址 |
| `contracts/src/periphery/CubitLaunch.sol` | 单笔交易完成启动：流动性带、vault 储备与部署者买入 |
| `dapp/src/chain` | 发现、报价、签名上下文与旧 Vault |
| `dapp/src/pages/Momentum.tsx` | 只读 Momentum 页面：活跃、部分消耗和被穿越的买墙 |
| `services/` 及其 README | 事件中继与旧 keeper |
| `contracts/foundry.toml` 与包清单 | 命令与构建参数 |

## 历史报告与文档

旧版本的参考总结为 `audit/reports/2026-09-10-v1-v2/BILAN_FINAL_FR.md`。它描述了阶梯流动性（ladder）、keeper 维护和买墙销毁，这些在新版本中均已被取代。

`roadmapdev.md` 和历史规范文档用于理解 V1/V2 意图和里程碑。原文已归档至 `CUBIT-cahier-des-charges/historique/2026-09-10-avant-murs-fixes/`。关于单一单调买墙、E/C 配置、阶梯流动性（ladder）、keeper 或完全取消管理权的段落，不构成新版本的规则。

`contracts/docs/STRICT_BURN.md` 解释吸收代币销毁机制的历史演变，该机制在新版本中已被放弃。`contracts/docs/MODULE_SETTERS.md` 说明外围替换。此处不将任何旧测试数当作新版本的验证结果。

dapp 的旧版路线图页面是有日期的编辑参考，不应单独用于集成新版本。

## 视觉设计

主题沿用 dapp 已有设计决策：

| 视觉来源 | 采用元素 |
| --- | --- |
| `dapp/src/index.css` | 奶油色 `#f5f1e8`、墨色 `#111312`、紫色 `#5b4bff`、青柠色 `#c7ff3d`、橙色 `#ff704d`、纸色 `#ede7d8` |
| `dapp/src/index.css` | 粗体扩展 Archivo 标题、Martian Mono 标签、细微纹理 |
| `dapp/src/components/primitives.tsx` | 清晰边框、偏移阴影、面板与状态 |
| `dapp/src/components/Header.tsx` | 文字标识、紫色方块、导航与状态区分 |
| `dapp/src/ui.tsx` | 点缀星形与等宽标签 |

构建时字体连同许可复制到本地。本指南使用 dapp 视觉语言，不沿用过时标语。

## 文档

选用 **HonKit 6.2.2**，它是 GitBook 引擎分支，用 Markdown 创建书籍和文档。目录、静态生成、搜索及翻页导航来自此框架，CUBIT 主题扩展其模板和样式。[HonKit 官方文档](https://honkit.netlify.app/)。

本地安装与 `serve` / `build` 命令依据[官方入门文档](https://honkit.netlify.app/setup.html)。[书籍配置](https://honkit.netlify.app/config.html)说明内容根目录与样式等。6.2.2 发布标识所用版本。

`gitbook/` 根目录 README 说明安装、命令、浏览器检查与工具局限。此站验证检查书籍，不验证协议合约。

## 维护本指南

新发布先更新版本状态与规范参考，再同步规则、API 和实际连接的流程。旧结果未针对最终源码时，保留历史标记。

在 `docs/` 添加页面，于 `SUMMARY.md` 引用，再重建书籍。文档来源明确选取，私有配置、密钥、认证 RPC 与交易转储不属于网站内容。
