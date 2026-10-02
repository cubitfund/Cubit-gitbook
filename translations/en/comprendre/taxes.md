---
description: "3% on buys, 15% on sells including 12% for walls, a target of 0.01% LP fees: understanding the calculation bases."
section: "01 / UNDERSTAND"
reading: "5 MIN READ"
search:
  keywords: ["taxes", "fees", "fee", "percentage", "buy", "sell", "team", "team", "walls"]
---

# Taxes and ETH flows

**Hook taxes** and **pool LP fees** correspond to two different operations. They do not use the same base and do not add up as a single tax.

These rates are those of the new version and apply in the connected Ethereum pool. Check [version status](../securite/etat.md) and the quote for the pool you use.

## The buy tax

The total tax is **3% of gross ETH input**, allocated entirely to the team share. For exact-input swaps, it is included in the amount supplied to the router.

| For a 1 ETH purchase | Amount | Destination |
| --- | --- | --- |
| Swap leg | 0.97 ETH | Pool, then LP fees and conversion to CUBIT |
| Team share | 0.03 ETH | Team accounting |

For an exact-output purchase, if the pool leg requires `x` ETH, the total before gas is approximately `x / 0.97`, with integer rounding. The router enforces the input cap chosen by the user and refunds the surplus.

## The sell tax

The total tax is **15% of gross ETH output**: **12% for walls and 3% for the team**.

| For 1 ETH gross output | Amount | Destination |
| --- | --- | --- |
| Seller’s net ETH | 0.85 ETH | Recipient’s wallet |
| Wall funding | 0.12 ETH | Wall placed at this sale’s target, or 1% below the current price at or below the launch price |
| Team share | 0.03 ETH | Team accounting |

The seller therefore receives **0.85 ETH**, before the gas cost paid separately. To target a net output of `x` ETH in exact-output mode, the pool must supply approximately `x / 0.85` gross ETH, with integer rounding and according to the actual quote.

**Sales directly fund the walls**. The 12% and 3% are calculated on the sale’s gross ETH: this is not 12% of the 15% tax. The team share goes entirely to the team.

## LP fees

The Uniswap v4 `fee` parameter is expressed in millionths:

| Version | Parameter | LP percentage |
| --- | --- | --- |
| New version | `100` | **0.01%** |

`tickSpacing` and a wall’s width are geometry parameters, not another expression of the LP fee rate. The CUBIT pool uses 10-tick spacing in the sources reviewed.

LP fees apply to the swap leg according to the pool’s mechanics. An actual quote accounts for rounding, crossed ticks, liquidity and any v4 protocol fees. **Do not apply the tax again to a quote that is already net.**

## Where the 12% goes

On every sale, the hook first empties the walls that the price has fully crossed, then places all pending ETH, including this 12%, in a wall located at the target calculated on the price after the sale. If a wall already exists at that tick, it is thickened. At or below the launch price, this target most often passes above the market: the wall is then placed 1% below the current price. Only dust too small to create liquidity, a surplus when a tick's liquidity ceiling is reached, and the extreme case of a price at the very top of the tick range remain in `pendingFloorEth`, until a later sale.

There is no longer a sweep: the old transfer of part of the ladder ETH to the walls disappeared with the ladder. [The target and fixed walls](murs.md).

## Revenue planned for V2

| Module | Revenue | What does not fund it |
| --- | --- | --- |
| Vault | CUBIT reserve: 20% of the supply at launch, then the CUBIT from fully crossed walls | Deposited principal, CUBIT creation, LP fees; no WETH rewards |
| Forge | Launch fee of 0.005 ETH, paid in ETH to the launchpad governance vault and never refunded to the launcher | Withdrawing wall funds for a child |

Forge fees have been collected since it opened, on September 23, 2026. The Vault reserve has been paying rewards since the Vault opened, on September 26, 2026. Their amounts depend on actual activity.

## A round trip does not cost exactly 18%

Isolating only proportional taxes, at a constant price with no impact or other fees, the retained factor is `0.97 × 0.85 = 0.8245`. The corresponding loss is therefore **17.55%**, rather than mechanically adding 15 and 3 to the same amount.

A real round trip adds pool fees, gas and price changes. The net amount returned by the quote remains the reference for a given transaction. [Buying and selling](../utiliser/swaps.md).

<p class="source-note">Tax allocation: design decisions of September 14, 2026. Code: <code>CubitHook._creditBuyTax</code>, <code>_creditSellTax</code>, <code>_placeWall</code> and <code>periphery/CubitRouter.sol</code>.</p>
