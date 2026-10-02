---
description: "CUBIT 中文指南：税费、流动性带、由卖出注资的买墙与 V2 模块，以及各部分的实际状态。"
section: "欢迎 / CUBIT"
reading: "读懂协议"
home: true
search:
  keywords: [首页, 文档, 指南, CUBIT, 入门]
---

<div class="home-hero">
  <p class="eyebrow">UNISWAP V4 · 协议流动性</p>
  <h1>了解<span class="line-break"></span>是什么<span class="line-break"></span><span class="highlight">支撑着买墙。</span></h1>
  <span class="hero-spark" aria-hidden="true"></span>
  <p class="lead">流动性带在启动时建立，卖出为 ETH 买墙提供资金。本指南介绍 CUBIT 的规则、用法与局限。</p>
  <div class="hero-actions">
    <a href="comprendre/essentiel.md" class="primary-button">从这里开始 →</a>
    <a href="securite/etat.md" class="secondary-button">查看版本状态 ↗</a>
  </div>
</div>

<div class="edition-alert">
  <span class="alert-icon" aria-hidden="true">!</span>
  <p><strong>本指南介绍 CUBIT 的新版本。</strong><span class="line-break"></span>CUBIT 已部署在 Ethereum，应用读取该部署，LP 费用为 0.01 %。市场已于 2026 年 9 月 22 日开放：买入与卖出均在应用中进行。</p>
</div>

<dl class="metric-strip">
  <div><dt>总供应量</dt><dd>2100 万</dd><small>CUBIT · 此后不再铸币</small></div>
  <div><dt>买入税</dt><dd>3 %</dd><small>团队份额</small></div>
  <div><dt>卖出税</dt><dd>15 %</dd><small>12 % 买墙 / 3 % 团队</small></div>
  <div><dt>目标 LP 费率</dt><dd>0.01 %</dd><small>新版本 · fee 100</small></div>
</dl>

<div class="home-heading"><h2>选择你的起点。</h2><span>01 — 阅读路线</span></div>

<div class="guide-cards">
  <a href="comprendre/murs.md" class="guide-card"><span class="card-index">01 / 理解</span><strong>买墙如何<span class="line-break"></span>获得资金。</strong><p>价格目标、每笔卖出的 12 %，以及固定在各自 tick 的买墙。</p><span class="card-link">了解机制 →</span></a>
  <a href="utiliser/swaps.md" class="guide-card"><span class="card-index">02 / 使用</span><strong>签名前<span class="line-break"></span>先阅读。</strong><p>净报价、授权与链上数据。</p><span class="card-link">打开用户指南 →</span></a>
  <a href="developper/architecture.md" class="guide-card"><span class="card-index">03 / 构建</span><strong>从合约<span class="line-break"></span>到界面。</strong><p>Hook、流动性带、V2 注册表与 vault。</p><span class="card-link">浏览代码库 →</span></a>
</div>

<div class="home-heading"><h2>一个市场，两本独立的流动性簿。</h2><span>02 — 运作方式</span></div>

<div class="mechanism-strip">
  <div><div class="number">01 — 卖出</div><strong>每笔卖出的 12 %<span class="line-break"></span>为一个买墙注资。</strong><p>买墙配置在卖出后计算的目标价位；价格等于或低于启动价格时，买墙配置在现价下方 1 %。</p></div>
  <div><div class="number">02 — 买墙</div><strong>固定价位。<span class="line-break"></span>有限的 ETH。</strong><p>买墙价格与吸收卖出的能力是两回事。</p></div>
  <div><div class="number">03 — 流动性带</div><strong>一次性建立的<span class="line-break"></span>流动性。</strong><p>80 % 的供应量，覆盖从启动价格到曲线顶端的全部价格，永不撤出。</p></div>
</div>

## 核心要点

每笔卖出将**其 ETH 毛额的 12 %** 分配给买墙。Hook 先清空价格已完全穿越的买墙，再将待配置的 ETH 放入位于 `cible = 0.4 × prix courant + 0.6 × prix de lancement` 的买墙，该目标按卖出后的价格计算。价格等于或低于启动价格时，该目标会高于市场价格，买墙改为配置在现价下方 1 %。以 7 000 单位作为示例基准，目标为**市场 30k 时 16.2k**、**100k 时 44.2k**，以及**市场回到 60k 时 28.2k**。目标不取决于历史最高值。

买墙始终停留在自己的 tick。被完全穿越后，买墙会被清空，其 CUBIT 转入 vault 奖励储备，不再被销毁。这一规则不会创造额外资金或无限回购能力。[查看示例和目标模拟器](comprendre/murs.md)。

## 明确区分状态的文档

本指南按代码现状描述协议，并指明**在用的 Ethereum 部署**。在 V2 中，Momentum 与 Forge 自 2026 年 9 月 23 日起开放，Vault 自 2026 年 9 月 26 日起开放。后续步骤见[路线图](roadmap.md)。

核查版本时，先看[版本状态](securite/etat.md)，再看[权限](securite/permissions.md)与[局限](securite/risques.md)。旧测试报告不能证明新版本。
