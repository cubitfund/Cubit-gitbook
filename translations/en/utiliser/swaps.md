---
description: "The CUBIT buying and selling workflow: pool version, net quote, slippage, approvals and transaction receipt."
section: "02 / USE"
reading: "5 MIN READ"
---

# Buying and selling

The dapp offers ETH/CUBIT swaps through the selected deployment’s router. Taxes are applied in the hook; the estimated amount to receive must already be net of taxes included in the quote.

> The dapp connected to Ethereum uses the current version, with **0.01% LP fees**, and reads that version’s ABI. Until the market is open, no swap is possible. A demonstration or simulation mode is not an on-chain state.

## Before preparing a swap

Check the wallet’s network, the displayed deployment and the data block. Allow ETH for gas in addition to the amount to swap. The dapp must flag unavailable RPC or stale data and prevent signing based on an unverified state.

A change of account, network, amount or router address requires a new quote. Peripheral addresses can change through the V2 registry.

## Buying CUBIT

1. Choose an ETH amount. In exact-input mode, the 3% buy tax is included in that amount.
2. Read the estimated net CUBIT amount, fees and minimum received set by the slippage tolerance.
3. Check the simulation and the details displayed by the wallet, then sign.
4. Wait for a successful receipt and refreshed on-chain balances.

Purchases use native ETH through `msg.value`. The CUBIT router does not use Permit2 for this workflow. In the new version, a purchase removes CUBIT from the band along its x·y=k curve.

## Selling CUBIT

Selling may require an **ERC-20 approval** allowing the router to transfer the chosen CUBIT amount. The frontend prepares authorization for the requested amount.

After approval confirmation, the dapp rechecks the account, network, registry revision and quote freshness before the swap. Approval and sale are two separate transactions when the existing authorization was insufficient.

Selling returns ETH net of the 15% tax: 12% of gross ETH funds walls and 3% goes to the team. In the new version, the sale empties the walls it fully crosses and places the pending ETH in a wall; the CUBIT router then sends the absorbed CUBIT to the vault reserve.

## Minimum received and deadline

**Slippage** limits the accepted difference from the quote. A tax already included in the quote is not a reason to arbitrarily add 15 percentage points of slippage.

In the frontend sources reviewed, a quote remains fresh for **30 seconds**. The transaction deadline is calculated from the chain timestamp. These checks can prevent signing after a long approval wait; a fresh quote must then be reviewed.

A transaction rejected by these limits protects the agreed minimum or maximum amount. Its failure does not mean the limit should be removed.

## If the transaction fails

| Situation | Useful action |
| --- | --- |
| Wrong network or changed account | Return to the intended context and request a new quote |
| Expired quote | Recalculate the net amount and minimum received |
| Changed router or revision | Review the current address and new action; the old approval remains attached to the old spender |
| Insufficient liquidity | Check a quote for a smaller amount and the available positions |
| Sale that crosses a very large number of walls | Split the sale: beyond about 88 crossed walls, it exceeds a transaction’s gas limit |
| Unavailable RPC | Wait for a valid on-chain read before signing |
| Transaction already sent | Check the hash and receipt before preparing another |

The router rejects input that is not fully consumed and exact output that is not fully supplied. Funds spent in a reverted transaction are rolled back by the EVM, excluding gas.

## Checking the result

A hash means the transaction was submitted; only the receipt indicates success. Check the explorer’s network, status, recipient and `BuyTaxed` or `SellTaxed` events.

Wall reference prices do not replace a quote for a given order. [Reading dapp data](preuves.md).

<p class="source-note">Sources: <code>dapp/src/chain/swap.ts</code>, <code>executeSwap.ts</code>, <code>deployment.ts</code> and <code>contracts/src/periphery/CubitRouter.sol</code>. Browser/mobile wallet acceptance testing remains separate from automated tests.</p>
