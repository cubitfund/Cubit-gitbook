---
description: "The redesign steps, upcoming CUBIT releases, their windows and validation conditions."
section: "05 / VERIFY"
reading: "5 MIN READ"
search:
  keywords: ["roadmap", "schedule", "opening", "V1", "V2", "redesign", "steps", "steps", "launchpad"]
---

# Roadmap and release criteria

The schedule describes publication intent. **Release cadence does not replace code validation.** A feature that moves funds must be prepared, tested and accepted before opening.

The `roadmapdev.md` reference and the dapp’s old roadmap contain outdated rules. This page revisits milestones while distinguishing decided work, written code and already attested versions.

## The current prerequisite

The protocol is being redesigned: **a single liquidity band** replaces the ladder, **walls are placed and emptied on every sale** and the vault pays a CUBIT reward from a reserve. The adopted launch FDV is **3.75 ETH**.

This new version is deployed on Ethereum mainnet, market open since September 22, 2026. The Sepolia deployment is used for testing.

## The redesign steps

| Step | Content | Status |
| --- | --- | --- |
| 1 | Wide band at launch; removal of the ladder, `rebalance`, `raiseFloor` and keepers | Coded and tested locally |
| Vaults | Vault at 3% per day in CUBIT and launchpad governance vault | Coded and tested locally |
| 2 | Walls created on every sale; CUBIT from crossed walls to the vault; children’s tokens to the governance vault | Coded and tested locally |
| 3 | Cleanup: removal of the WETH flow, the pause and the guardian, and unused errors | Coded and tested locally |
| 4 | Launch in one transaction: 80% in the band, 20% in the vault reserve, 0.1 ETH purchase | Coded and tested locally |
| 5 | Rewrite of tests and invariants | Not yet done |

## Milestones

| Milestone | Function | Status and condition |
| --- | --- | --- |
| D0 | V1 market | New version deployed on Ethereum, market opened on September 22, 2026 at block 26,035,793 |
| September 23, 2026 | Momentum | Open: read-only app page showing each token’s active, partially consumed and crossed walls |
| September 23, 2026 | Public Forge | Open: launchpad open to everyone, added that day with its governance vault, launch fee of 0.005 ETH |
| September 26, 2026 | mCUBIT Vault | Open: 24-hour lock, CUBIT reward of 3% per day from the reserve |
| To be defined | Launchpad token | Not yet designed; the governance vault’s holdings will serve as its NAV |

No feature opens by itself: the team opened Momentum and the Forge on September 23, 2026, then the Vault on September 26, 2026, through explicit transactions. Module administration by the team address is permanent.

## Conditions for the Vault

Reward accounting must hold across deposits, withdrawals, claims, the one-day cap, rounding and replacements, with zero CUBIT creation, no payment from principal and no access to wall funds. The reserve is funded at launch, then by crossed walls.

## Conditions for Momentum and Forge

Momentum remains read-only: each token’s active, partially consumed and crossed walls. The Forge must preserve child isolation and template control; sending the tokens from their walls to the governance vault has been in service on Ethereum since September 23, 2026. Nothing opens with the passage of time: the team added the launchpad, then opened it, through explicit transactions.

## Conditions for a production version

The release must publish its identities, compilation parameters, linked libraries, expected bytecodes and permissions. Tests must cover the final sources and be linked to that release.

Dapp adaptation, including splitting sales that cross many walls, real wallet workflows, aggregators, services and monitoring complement local tests. A deployment does not constitute automatic acceptance of these new changes.

## Historical announcements to reclassify

A “floor that only rises”, a breakeven crossing at a predetermined capitalization, a token made “deflationary” by burning through the walls or “total immutability” do not describe the new version and its permissions.

Communications must indicate the funded wall, its target, funds placed and protocol version. Historical results remain available as such in the [sources](sources.md).
