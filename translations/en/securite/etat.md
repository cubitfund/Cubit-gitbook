---
description: "Status on September 26, 2026: new version deployed on Ethereum, market open, Vault, Momentum and Forge open."
section: "05 / VERIFY"
reading: "4 MIN READ"
search:
  keywords: ["version", "status", "Ethereum", "mainnet", "testnet", "Sepolia", "validation", "audit", "deployed", "deployed", "redesign"]
---

# Actual version status

**This guide describes the new version of CUBIT.** The connected dapp uses this version’s Ethereum deployment, with 0.01% LP fees. The market has been open since September 22, 2026, at block 26,035,793.

This guide edition is dated **September 26, 2026**. It relies on the design decisions, the new version’s code and the repository reports.

## Three distinct states

| Scope | State described by this edition |
| --- | --- |
| Design decisions, frozen on September 14, 2026 | Buy 3% team; sell 15% (12% walls, 3% team); single band of 80% of the supply; walls created on every sale; CUBIT from crossed walls to the vault reserve; vault at 3% per day; launch FDV of 3.75 ETH |
| New version code | Components listed in the next table |
| Ethereum connected to the dapp | Current version: buy 3%, sell 15% of which 12% to the walls, LP fee 100 = 0.01%, a single band with 80% and walls placed on every sale, with V2 registry and replaceable modules |

Changing local sources does not change already deployed contracts. Synchronizing documentation does not move funds from an old pool.

## Components in production

| Part | Status |
| --- | --- |
| Wide band at launch, removal of the ladder and maintenance | Live on Ethereum |
| Walls placed and emptied on every sale, transfer of their CUBIT to the vault | Live on Ethereum |
| Vault at 3% per day in CUBIT, paid from the reserve | Live on Ethereum since September 26, 2026 |
| Launchpad governance vault: launch fees in ETH and Forge children’s tokens | Live on Ethereum since September 23, 2026 |
| Momentum: each token’s active, partially consumed and crossed walls | Live on Ethereum since September 23, 2026 |
| Public Forge: isolated child markets, launch fee of 0.005 ETH | Live on Ethereum since September 23, 2026 |
| Vault reward only in CUBIT, hook without an administrator | In the code deployed on Ethereum |
| Launch in one transaction: 80% in the band, 20% in the vault reserve and a 0.1 ETH purchase | Live on Ethereum |

These components have been deployed on Ethereum since September 22, 2026, and the launchpad and Momentum since September 23, 2026; Vault deposits have been open since September 26, 2026. They are covered by the repository’s Foundry tests, fuzzing, invariants, static analysis and symbolic verification. The next steps appear in the [roadmap](../roadmap.md).

## What historical reports attest

The Sepolia report describes deployment of a previous version, runtime and connection checks, acceptance-test purchases and sales, wall placement and checks that ineligible actions were rejected.

This evidence belongs to that version. It tests neither the band, nor walls created on every sale, nor the new vault.

At historical revision `991fca9`, the full Solidity suite had **133 passes and 15 failures out of 148 tests**. These results and their limitations appear in the published state report. They are not validation counters for the new version.

## What does not constitute full validation

Successful compilation verifies bytecode production. Alone, it does not demonstrate accounting invariants, the behavior of a set of crossed walls, frontend consistency or a transaction on the selected network.

Likewise, comparing runtime hashes does not mean sources were published on an explorer. Automated frontend tests do not replace acceptance testing with a real browser or mobile wallet.

Full validation of the new version also covers account separation, no over-extraction from the vault, the arrival in the reserve of CUBIT from emptied walls, and the impossibility for any actor to extract ETH from the walls at a favorable rate.

## Which source to follow

For the new version, the reference is the handoff document `contracts/docs/REDESIGN_HANDOFF.md` on the `redesign/tide-lp-autowalls-vault` branch. It records the frozen decisions and their implementation in the code.

For the history, the starting point remains the French report for revision `991fca9`. Public manifests under `contracts/deployments/` identify existing deployments.

The [Sources page](../sources.md) explains the reading order and documents that have become historical.
