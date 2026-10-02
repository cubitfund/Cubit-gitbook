---
description: "本地编译、新版本的 Foundry 测试、dapp、服务与 GitBook 命令，不广播交易。"
section: "04 / 构建"
reading: "阅读需 5 分钟"
---

# 在本地运行项目

各目录有独立依赖。使用仓库锁文件，保持合约、ABI、清单和客户端版本一致。

以下命令在本地构建或验证组件，不构成生产发布流程。

## 前置要求

项目使用近期 Node.js，dapp 和服务使用 pnpm，Solidity 使用 Foundry，本 GitBook 使用 npm。服务要求 **Node 22 或以上**；GitBook 使用 Node 24 准备。

合约固定 **Solidity 0.8.26**、**Cancun EVM**、**via IR**、优化器 **10 runs**，无 CBOR 元数据。这些参数属于待核查字节码身份的一部分。

克隆后，须具备仓库 Solidity 依赖：

```bash
git submodule update --init --recursive
```

## 编译与测试合约

在 `contracts/` 中，于 `redesign/tide-lp-autowalls-vault` 分支上：

```bash
FOUNDRY_TEST=test/redesign forge build --sizes
FOUNDRY_TEST=test/redesign forge test
```

历史测试套件 `test/` 使用阶梯流动性（ladder）的旧 API，无法与新版本一起编译：`FOUNDRY_TEST` 将编译限制在 `test/redesign` 中的测试。via IR 编译使编译速度较慢。

配置中的模糊测试与不变量配置档针对历史测试套件：

```bash
FOUNDRY_PROFILE=ci forge test
FOUNDRY_PROFILE=gate forge test
```

测试结果应附精确修订、参数与编译源码；旧日志不是新版本的结果。

脚本 `script/Scenarios.s.sol` 在本地 Anvil 节点上重放场景：`SCENARIO=band` 用于流动性带，`SCENARIO=walls` 用于买墙，`SCENARIO=crossing` 用于被穿越买墙的 gas。本地部署请遵循仓库说明，不要把密钥抄入笔记。

## 启动 dapp

在 `dapp/` 中：

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
pnpm dev
```

Vite 显示开发 URL。配置区分模拟模式与配置部署的数据。依仓库示例和说明本地设置 RPC，不要把访问凭证写入源码或公开包。

前端编译成功不证明其清单与网络上的合约一致。Dapp 读取在用版本的 ABI。

## 维护 ABI

在 `contracts/` 中，编译后导出：

```bash
bash scripts/export-abi.sh
python3 scripts/check-abi.py
```

Dapp 提供 `pnpm gen-abi`，服务提供 `pnpm gen:abi`。检查生成的接口、事件及类型更改。`band()` 视图、`bandEth` 与 `bandTokens` 字段、买墙视图、`deliverAbsorbed()`、`pendingAbsorbedTokens()` 以及两个 vault 都必须纳入发布同步。

Dapp 的 `pnpm sync-deployment` 重读部署清单，只应针对真正验证版本的元数据执行。

## 检查服务

在 `services/` 中：

```bash
pnpm install --frozen-lockfile
pnpm gen:abi
pnpm typecheck
pnpm test
```

Keeper 服务属于旧模型，在新版本中已无用途。事件中继的运维见[专页](services.md)。

## 启动本 GitBook

在 `gitbook/` 中：

```bash
npm ci
npm run dev
```

网站在 `http://localhost:4000` 提供并重建页面。生成静态 `_book/` 并检查链接：

```bash
npm run build
npm run preview
```

本地预览使用 `http://localhost:4001`。字体内嵌，搜索在浏览器使用书籍索引执行。

验证文档浏览器流程：

```bash
npm run test:install
npm run test:browser
```

[`gitbook/` README](../sources.md#la-documentation)介绍 HonKit 选择、目录结构、检查与编辑维护。

<p class="source-note">来源： <code>contracts/foundry.toml</code>、 <code>contracts/docs/REDESIGN_HANDOFF.md</code>、 <code>contracts/script/Scenarios.s.sol</code>、仓库脚本、 <code>dapp/package.json</code>, <code>services/package.json</code> 以及 <code>gitbook/package.json</code>。构建本文档不需要密钥或带认证的 RPC URL。</p>
