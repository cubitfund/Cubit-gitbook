---
description: "The essentials: the CUBIT token, Uniswap v4 hook, liquidity band and walls funded with ETH on every sale."
section: "01 / UNDERSTAND"
reading: "5 MIN READ"
---

# CUBIT in 5 minutes

CUBIT is an ERC-20 token associated with an ETH/CUBIT market on Uniswap v4. The protocol provides its pool’s liquidity itself: its **hook** is the sole provider and applies taxes according to the contract’s rules.

The supply is fixed at **21 million CUBIT**, created once. There is no function to create more. In the new version, CUBIT bought back by the walls **is no longer burned**: it joins the vault reward reserve.

> This page describes the new version. See [version status](../securite/etat.md).

## The market’s two books

| Book | Role | What can change |
| --- | --- | --- |
| Band | A single wide position, placed at launch with 80% of the supply; it sells CUBIT to buyers and buys CUBIT back from sellers | Its split between CUBIT and ETH follows the price; the position is never withdrawn |
| Walls | ETH positions placed below the current price and funded by sales | Their content changes when the price crosses them; their tick never changes |

Team balances and the vault reward reserve are accounted for separately. A total balance therefore cannot describe the ETH actually available in the walls.

## What swaps fund

For a **1 ETH exact-input purchase**, excluding gas:

- **0.97 ETH** enters the swap leg toward the pool, before its own LP fees.
- **0.03 ETH** goes to the team compartment.

For a **sale producing 1 gross ETH**, **0.85 ETH** goes to the seller, **0.12 ETH** funds the walls and **0.03 ETH** goes to the team. Gas is paid separately.

The new version targets **0.01% LP fees**. This pool fee is separate from the 3% buy tax and 15% sell tax. [See taxes in detail](taxes.md).

## How walls appear

On **every sale**, the hook first empties the walls that the price has fully crossed, then places the pending ETH, including the sale’s 12%, in a wall at the target `0.4 × current price + 0.6 × launch price`, calculated on the price after the sale and rounded to the tick. Two fundings that land on the same tick add up in a single wall. No wall is moved afterward.

At or below the launch price, this target would be above the market: the wall is then placed 1% below the current price, instead of leaving the funds to wait for a later sale. No maintenance call is needed: creating and emptying walls are part of the sale.

**The formula chooses the wall’s location; sales determine its size.** A displayed level does not prove that all holders could sell at that level. [The target and fixed walls](murs.md).

## What happens at launch

The launch takes place in a single transaction:

- **80% of the supply**, i.e. 16.8 million CUBIT, is deposited in the band;
- **20%**, i.e. 4.2 million CUBIT, funds the vault reward reserve;
- the deployer makes a **0.1 ETH purchase**, taxed 3% like any purchase, whose CUBIT is not locked.

There is no airdrop and no team allocation. [The liquidity band](ladder.md).

## V1 and V2

**V1** is the market: token, hook, band, walls and swaps. **V2** adds Vault, Momentum and Forge, which the team opens when it decides: Momentum and the Forge have been open since September 23, 2026, the Vault since September 26, 2026.

The team address receives the team share of taxes and replaces and then activates the compatible peripheral modules of the registry; these powers are permanent. The hook has no administrator: nobody can pause the swaps or the wall mechanism, and the pool’s core retains its own fixed identities.

The next steps appear in the [roadmap](../roadmap.md).

<p class="source-note">Repository sources: <code>contracts/src/CubitToken.sol</code>, <code>CubitHook.sol</code>, <code>periphery/CubitV2.sol</code> and the design decisions of September 14, 2026 recorded in <code>contracts/docs/REDESIGN_HANDOFF.md</code>.</p>
