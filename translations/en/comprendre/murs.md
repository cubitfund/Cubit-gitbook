---
description: "The formula chooses the wall’s location; sales determine its size. Target calculated on every sale, examples and walls fixed at their tick."
section: "01 / UNDERSTAND"
reading: "7 MIN + AN INTERACTIVE EXAMPLE"
search:
  keywords: ["wall", "walls", "target", "price", "depth", "capacity", "capacity", "retracement", "formula", "sale", "16200", "44200", "28200"]
---

# The target and fixed walls

**The formula chooses the wall’s location; sales determine its size.** A wall is an LP position funded with ETH at a defined tick, below the current price.

## The formula on every sale

Let `M` be the market capitalization after the sale and `B` the launch base, expressed in the same unit:

<div class="formula">target = M − (M − B) × 0.6<span class="line-break"></span>= 0.4 × M + 0.6 × B</div>

The coefficient retraces **60% of the gap between the market and the base**. It therefore retains 40% of that gap above the base. With an illustrative base `B = 7 000`:

| Market after the sale | Calculation | Wall target |
| --- | --- | --- |
| 30 000 | 30 000 − 23 000 × 0.6 | **16 200** |
| 100 000 | 100 000 − 93 000 × 0.6 | **44 200** |
| Return to 60 000 | 60 000 − 53 000 × 0.6 | **28 200** |

The third calculation starts from **60 000**, even if the market previously reached 100 000. There is no ratchet based on the all-time high. The target is recalculated **on every sale**, on the price left by that sale: there is no longer a reserve accumulated and then placed by a maintenance call.

## Change the market level

The example below keeps two older walls at 16.2k and 44.2k, then calculates the target for the next wall. The values use the same capitalization unit, with an illustrative base of 7 000. This diagram simulates neither absorption, balances nor a transaction.

<section class="wall-lab" aria-label="Educational target calculator">
  <header><span>THE TARGET AFTER THE SALE</span><span>FIXED BASE: 7 000</span></header>
  <div class="wall-controls">
    <label for="market-cap">Market after the sale <output id="market-value" for="market-cap">60 000 units</output></label>
    <input id="market-cap" type="range" min="7000" max="120000" step="1000" value="60000">
    <div class="wall-presets"><button type="button" data-market-preset="30000">30k</button><button type="button" data-market-preset="100000">100k</button><button type="button" data-market-preset="60000">Return to 60k</button></div>
  </div>
  <div class="wall-levels" aria-label="Comparison of capitalization levels">
    <div class="level-row"><span>Older wall A</span><div class="level-track"><i style="width:13.5%"></i></div><b>16.2k</b></div>
    <div class="level-row"><span>Older wall B</span><div class="level-track"><i style="width:36.833%"></i></div><b>44.2k</b></div>
    <div class="level-row new-target"><span>New target</span><div class="level-track"><i id="lab-target-bar" style="width:23.5%"></i></div><b id="lab-target-label">28.2k</b></div>
    <div class="level-row market"><span>Current market</span><div class="level-track"><i id="lab-market-bar" style="width:50%"></i></div><b id="lab-market-label">60k</b></div>
  </div>
  <div class="wall-result" aria-live="polite"><span>Target for the next wall</span><strong id="target-value">28 200 units</strong></div>
  <p class="lab-explanation">Only new fundings follow the current target. Older walls stay at their tick; the amount of ETH still available at each level must be read separately.</p>
</section>

## One wall per tick, never moved

Once placed, a wall’s ETH remains attached to its tick. A rising or falling market does not move an older wall to the new target.

- A funding whose target lands on the tick of an existing wall **thickens that wall** instead of creating a second one.
- A sale can partially consume a wall: part of its ETH then buys back CUBIT.
- A wall that is only partially consumed **stays in place**. If the price rises again, it sells its CUBIT back and refills with ETH.
- A **fully crossed** wall is emptied by the sale that crossed it: its CUBIT goes to the vault reward reserve, with no burn, and its remaining ETH returns to the pending funds.

Wall identifiers are permanent. A tick index makes it possible to find the walls touched by a sale. [Crossed walls and the vault reserve](burn.md).

## When the target is not placeable

A wall is a 100% ETH position: it must sit below the current price. When the price is at or below the launch price, the formula gives a target equal to or above the market, which cannot be funded with pure ETH.

In that case, the hook places the wall **1% below the current price**, rounded to the tick, instead of leaving the funds waiting. Otherwise, accumulated funds could be placed all at once at a price inflated by a transaction that buys just before, then sells its CUBIT into that wall. The hook decides on the rounded tick, not on the exact target: near the launch price, the rounded 40/60 target can still sit just below the market and be used as is, so closer than 1%.

Only an amount too small to create a position, that is dust, a possible surplus when the targeted wall reaches a tick's liquidity ceiling, a limit of Uniswap v4, and the extreme case of a price at the very top of the tick range, where no wall fits below the price, wait in `pendingFloorEth`. A later sale places them. The sale itself is never rejected for this reason.

## ETH actually placed

The hook places all pending ETH, including the 12% from each sale, in the position corresponding to the target. Later sales can consume this ETH: each wall’s reserve is finite. A wall can be funded without waiting for coverage of the entire supply.

## From the launch price to ticks

The contract works with ETH prices per CUBIT: `target = 0.4 × current price + 0.6 × launch price`. The launch price derives from the **launch FDV fixed at deployment**, divided by the 21 million CUBIT. The new version adopts an FDV of **3.75 ETH**; this price then remains fixed and does not follow the dollar.

The examples in units on this page apply the same formula to a capitalization. Their 7 000 base is illustrative: it is not a conversion of the 3.75 ETH adopted.

Ticks then round the executable level. ETH is `currency0`, so **a higher CUBIT price corresponds to a lower pool tick**. The mathematical target, the tick actually placed and a sale’s net price can differ.

## What the interface must show

An interface must distinguish the current market, the band, the next target, each active wall and its depth, as well as pending ETH and CUBIT. A single “floor” line does not summarize the whole book.

The historical `floorPrice` reference describes the **last funded wall**, which may be lower than the previous one. It must not be interpreted as a guaranteed global minimum. [Reading dapp data](../utiliser/preuves.md).

<p class="source-note">Sources: design decisions of September 14, 2026, <code>BandLib.retracementWallTarget</code>, <code>underMarketWallTarget</code>, <code>WALL_RETRACEMENT_BPS</code>, <code>WallLib.fund</code> and <code>CubitHook._placeWall</code>.</p>
