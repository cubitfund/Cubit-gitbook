---
description: "Distinguishing the market, band, target, walls, pending funds and on-chain data in the CUBIT dashboard."
section: "02 / USE"
reading: "4 MIN READ"
search:
  keywords: ["proof", "evidence", "dashboard", "data", "data", "floor", "simulation", "depth", "band"]
---

# Reading dapp data

The Proof page helps reconcile displayed figures with protocol states and events. Start with the **network, deployment, version and read block** before interpreting an amount.

> The public dapp reads the Ethereum deployment in service and its ABI. The data below describe what an interface must distinguish.

## Figures to distinguish

| Data | What it describes |
| --- | --- |
| Market price | Current pool price, separate from the net result for a specific amount |
| Band ETH | ETH actually held by the band at the current price, brought in by buyers |
| Band CUBIT | CUBIT that the band still offers for purchase |
| Next wall target | Level calculated with the current price, separate from a funded position |
| Active walls | Already funded positions, each with its ID, tick and remaining liquidity |
| Pending ETH | Wall funds left unplaced: dust too small to create a position, or a price at the very top of the tick range |
| CUBIT pending transfer | CUBIT from crossed walls, isolated in the hook until it is sent to the vault |
| Reward reserve | CUBIT held by the vault to pay depositors, separate from deposits |
| Circulating supply | Total supply minus wall CUBIT, CUBIT awaiting transfer and the vaults’ reward reserve; CUBIT deposited in the vault remain in circulation |

A wall’s level and its remaining ETH must be read together. Band ETH and wall ETH belong to two separate books.

## What changes with the new version

The old view showed a ladder, a cushion, a burn queue and a maintenance screen. The new version replaces them with a single band, walls placed and emptied on every sale and a reward reserve in the vault. There is no longer a Keepers page.

The historical name `floorPrice` describes the last funded wall: it must not be read as a global market minimum. A new wall can be placed lower than the previous one when the price has fallen.

The new fields are detailed in [integration](../developper/integration.md). The dapp connected to Ethereum reads the current version’s fields.

## Gross price, net price and quote

A gross reference represents a position’s price level. A net reference can include a range boundary, LP fees, sell tax and an assumption about v4 protocol fees.

An actual sale depends on the amount, positions crossed, rounding and gas. A “net floor” reference is not a calculation of your wallet’s performance and does not replace a quote.

## Data modes

| Display | Interpretation |
| --- | --- |
| On-chain, identified block | Data read from the indicated deployment |
| Loading | Initial read still incomplete |
| Stale data or RPC failure | Last known state; not authorization to sign |
| Simulation or demonstration | Local illustration of the mechanism |

For future releases, check announced availability and the addresses of modules offered to the user.

## Repeating the verification

Check the identities of the token, hook and pool, then the registry’s current modules and its `moduleRevision`. Reconcile events with the transaction hash and their canonical block.

The Proof page tracks taxes and walls. A screenshot or old report cannot replace this version identification. [Actual version status](../securite/etat.md).

<p class="source-note">Sources: <code>CubitLens.sol</code>, <code>interfaces/ICubitLens.sol</code> and, for the frontend, <code>dapp/src/chain/snapshot.ts</code>, <code>releases.ts</code> and <code>events.ts</code>.</p>
