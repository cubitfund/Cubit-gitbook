---
description: "The English guide to CUBIT: taxes, the liquidity band, walls funded by sales and V2 modules, with the actual status of each part."
section: "WELCOME / CUBIT"
reading: "THE PROTOCOL, EXPLAINED"
home: true
search:
  keywords: ["home", "documentation", "guide", "CUBIT", "start"]
---

<div class="home-hero">
  <p class="eyebrow">UNISWAP V4 · PROTOCOL LIQUIDITY</p>
  <h1>Understand<span class="line-break"></span>what keeps<span class="line-break"></span><span class="highlight">the walls standing.</span></h1>
  <span class="hero-spark" aria-hidden="true"></span>
  <p class="lead">A liquidity band placed at launch. Sales that fund ETH walls. This guide explains CUBIT’s rules, uses and limitations.</p>
  <div class="hero-actions">
    <a href="comprendre/essentiel.md" class="primary-button">Start here →</a>
    <a href="securite/etat.md" class="secondary-button">Check version status ↗</a>
  </div>
</div>

<div class="edition-alert">
  <span class="alert-icon" aria-hidden="true">!</span>
  <p><strong>This guide describes the new version of CUBIT.</strong><span class="line-break"></span>CUBIT is deployed on Ethereum and the app reads that deployment, with 0.01% LP fees. The market has been open since September 22, 2026: buys and sells happen in the app.</p>
</div>

<dl class="metric-strip">
  <div><dt>Total supply</dt><dd>21 M</dd><small>CUBIT · no subsequent minting</small></div>
  <div><dt>Buy tax</dt><dd>3%</dd><small>Team share</small></div>
  <div><dt>Sell tax</dt><dd>15%</dd><small>12% walls / 3% team</small></div>
  <div><dt>Target LP fees</dt><dd>0.01%</dd><small>New version · fee 100</small></div>
</dl>

<div class="home-heading"><h2>Choose your starting point.</h2><span>01 — THE PATHS</span></div>

<div class="guide-cards">
  <a href="comprendre/murs.md" class="guide-card"><span class="card-index">01 / UNDERSTAND</span><strong>How a wall<span class="line-break"></span>gets funded.</strong><p>The price target, the 12% from each sale and walls fixed at their tick.</p><span class="card-link">Explore the mechanism →</span></a>
  <a href="utiliser/swaps.md" class="guide-card"><span class="card-index">02 / USE</span><strong>Read before<span class="line-break"></span>you sign.</strong><p>Net quotes, approvals and on-chain data.</p><span class="card-link">Open the user guide →</span></a>
  <a href="developper/architecture.md" class="guide-card"><span class="card-index">03 / BUILD</span><strong>From contract<span class="line-break"></span>to interface.</strong><p>The hook, the band, the V2 registry and the vaults.</p><span class="card-link">Browse the codebase →</span></a>
</div>

<div class="home-heading"><h2>One market, two separate books.</h2><span>02 — HOW IT WORKS</span></div>

<div class="mechanism-strip">
  <div><div class="number">01 — SALES</div><strong>12% funds<span class="line-break"></span>a wall on every sale.</strong><p>The wall is placed at the target calculated after the sale; at or below the launch price, it is placed 1% below the current price.</p></div>
  <div><div class="number">02 — WALLS</div><strong>A fixed level.<span class="line-break"></span>Limited ETH.</strong><p>A wall’s price and its absorption capacity are two different pieces of information.</p></div>
  <div><div class="number">03 — THE BAND</div><strong>Liquidity<span class="line-break"></span>placed once.</strong><p>80% of the supply, from the launch price to the top of the curve, never withdrawn.</p></div>
</div>

## The essential point

Every sale allocates **12% of its gross ETH** to the walls. The hook first empties the walls that the price has fully crossed, then places the pending ETH in a wall at `target = 0.4 × current price + 0.6 × launch price`, calculated on the price after the sale. At or below the launch price, where this target would be above the market, the wall is placed 1% below the current price. With an illustrative base of 7 000 units, the target is **16.2k at 30k**, **44.2k at 100k**, then **28.2k if the market returns to 60k**. It does not depend on an all-time high.

A wall stays at its tick. Once fully crossed, it is emptied and its CUBIT joins the vault reward reserve: it is no longer burned. This rule creates neither additional funds nor unlimited buyback capacity. [See the examples and target simulator](comprendre/murs.md).

## Documentation with explicit statuses

The guide describes the protocol as it is coded and identifies the **Ethereum deployment in service**. In V2, Momentum and the Forge have been open since September 23, 2026, and the Vault since September 26, 2026. The next steps appear in the [roadmap](roadmap.md).

To verify a version, start with [version status](securite/etat.md), then [permissions](securite/permissions.md) and [limitations](securite/risques.md). Older test reports do not certify the new version.
