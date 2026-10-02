---
description: "Definitions of CUBIT guide terminology: band, wall, target, reward reserve, tick, hook and claim."
section: "05 / VERIFY"
reading: "PROTOCOL VOCABULARY"
search:
  keywords: ["glossary", "definition", "definition", "vocabulary", "terms"]
---

# Glossary

| Term | Definition in CUBIT |
| --- | --- |
| ABI | Description of functions, events and types used to communicate with a contract |
| Deployer buy | 0.1 ETH purchase included in the launch transaction, taxed 3% and not locked |
| Team address | Fixed address that receives the team share of taxes and can replace the registry modules at any time, without delay, and then activate them; its powers are permanent |
| Approval | ERC-20 authorization granted to a spender address for an amount |
| Band | Single trading position placed at launch with 80% of the supply, covering all prices above the launch price and never withdrawn |
| Burn | Destruction of tokens; the new version no longer burns CUBIT from the walls, only the rounding dust at launch |
| Target | Level calculated on every sale, on the price after the sale, to place a wall: 0.4 × current price + 0.6 × launch price; at or below the launch price, the wall is placed 1% below the current price |
| ERC-6909 claim | Accounting unit held in the PoolManager to settle or retain assets |
| Reward claim | Call that claims an accrued reward; a different use of the word “claim” from ERC-6909 |
| x·y=k curve | Constant-product curve followed by purchases and sales in the band |
| Held CUBIT | Circulating supply minus the CUBIT the band has not sold yet: what holders have, staked CUBIT included |
| Deadline | Latest timestamp accepted for an operation or signature |
| Exact-input | Swap with fixed input and output protected by a minimum |
| Exact-output | Swap with fixed output and input protected by a maximum |
| Launch FDV | Fully diluted valuation that sets the launch price; 3.75 ETH adopted for the new version |
| LP fee | Pool commission, separate from hook taxes |
| Floor | Historical name used in code; read the walls and the target separately |
| Hook | Contract connected to Uniswap v4 operations, applying CUBIT mechanics here; it has no administrator |
| Idle ETH | ETH accounted for outside any position; its compartment must be specified |
| Lens | Read contract deriving figures from the hook and pool |
| Liquidity / depth | Assets actually available in positions, depending on their state and price |
| Best wall | Active wall closest to the market, the first one a sale meets; the Lens gives its gross price and its price net of fees and tax |
| Wall | LP position funded with ETH by sales, at a fixed tick; a single wall per tick |
| Partially consumed wall | Wall part of whose ETH has bought back CUBIT; it stays in place |
| Crossed wall | Wall entirely converted into CUBIT by sales; the sale that crossed it empties it into the vault reserve |
| Circulating supply | Total supply minus wall CUBIT, CUBIT awaiting transfer and the reward reserve of all registered vaults; staked CUBIT remain in circulation |
| Pending absorbed tokens | CUBIT from crossed walls, isolated in the hook until sent by `deliverAbsorbed()` |
| Pending floor ETH | Wall funds awaiting placement: 12% of sales and ETH released by crossed walls, placed by the same sale; only dust too small to create a position and the extreme case of a price at the very top of the tick range remain there |
| Permissionless | Call open to everyone, subject to deterministic contract conditions |
| PoolId | Identifier derived from the entire PoolKey |
| Launch price | ETH price per CUBIT fixed at deployment: launch FDV divided by 21 million |
| V2 registry | Contract retaining current modules, their revision, open features and the history of vaults |
| Reward reserve | CUBIT held by the vault to pay depositors: 20% of the supply at launch, then the CUBIT from crossed walls |
| Slippage | Accepted execution difference from a quote, bounded by swap limits |
| Snapshot | Consistent set of data read at a given block |
| Tick | Discrete pool price unit; its orientation is reversed relative to ETH/CUBIT price |
| V1 / V2 | Market core / additional roadmap features |
| Governance vault | Launchpad vault that receives the Forge launch fees, in ETH, never refunded to the launcher, and tokens from Forge children’s walls; each deposit is locked for 30 days, plus any extension, then only its deployer can claim, permanently and with no way to transfer this right; that deployer can extend the lock, never shorten it |

For units and contract methods, see [integration](developper/integration.md).
