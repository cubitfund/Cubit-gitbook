---
description: "A single wide band, placed at launch with 80% of the supply and never withdrawn: CUBIT’s trading liquidity."
section: "01 / UNDERSTAND"
reading: "4 MIN READ"
search:
  keywords: ["band", "band", "liquidity", "liquidity", "TIDE", "curve", "x·y=k", "launch", "FDV", "ladder"]
---

# The liquidity band

CUBIT’s trading liquidity fits in **a single wide band**, on the TIDE model. The hook places it at launch and never withdraws it. It replaces the old ladder.

## What the band contains

| Parameter | Adopted value |
| --- | --- |
| Deposit | 80% of the supply, i.e. 16.8 million CUBIT |
| Composition at launch | 100% CUBIT, no ETH |
| Price range | All prices above the launch price |
| Launch FDV | 3.75 ETH, i.e. 3 ETH of depth for the band |
| Withdrawal | None: the position is never withdrawn |

The band’s lower bound corresponds to the launch price, rounded to the tick, so that the position contains no ETH at the start. Above it, the band covers the pool’s entire price curve.

## An x·y=k curve

Purchases and sales follow the band’s constant-product curve. A purchase deposits ETH into it and removes CUBIT: the price rises. A sale does the opposite: the price falls.

With a launch FDV of 3.75 ETH, the 16.8 million CUBIT are worth **3 ETH at the launch price**. At the start, the band behaves like an x·y=k pool of 16.8 million CUBIT against 3 ETH. These 3 ETH are **virtual**: they set the slope of the curve, but the band actually holds only the ETH brought in by buyers.

## What the band does not guarantee

The ETH that sellers can withdraw from the band is the ETH that buyers deposited in it. When the price returns to the launch price, the band contains only CUBIT: it can no longer buy CUBIT back below that price.

Below the launch price, a sale can therefore be served only by ETH still present in walls. The 3 ETH depth is neither an ETH reserve deposited by the protocol nor a floor price.

## What disappeared with the ladder

The band replaces the old mobile book. The following are removed:

- the ladder, its successive bands and its token reserve;
- the ETH cushion;
- `rebalance`, `raiseFloor`, the sweep to the walls and keeper bounties.

No maintenance call is needed to operate the market: there is no longer a keeper.

## A Forge child’s band

A child market created by the Forge follows the same model, with one difference: **it deposits 100% of its supply in its band**. It has neither a vault reserve nor a team allocation. The hook requires a deposit of at least 80% of the supply and places the entire deposit in the band. [Momentum and Forge](../v2/momentum-forge.md).

## Verifying the band

The hook’s `band()` view returns the position’s ticks and liquidity; the `BandBootstrapped` event is emitted at launch. The Lens exposes `bandEth` and `bandTokens`, the ETH and CUBIT held by the band at the current price, excluding LP fees. [Contracts and integration](../developper/integration.md).

<p class="source-note">Sources: <code>CubitHook._bootstrap</code>, <code>afterInitialize</code>, <code>band()</code>, <code>MIN_POOL_SUPPLY</code>, <code>CubitLens.bandEth</code> / <code>bandTokens</code> and <code>periphery/CubitForge.sol</code>. Design decisions of September 14, 2026.</p>
