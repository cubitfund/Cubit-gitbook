---
description: "Reading scope, document hierarchy, art direction sources and the GitBook maintenance method."
section: "05 / VERIFY"
reading: "GUIDE REFERENCES"
search:
  keywords: ["sources", "references", "references", "documentation", "HonKit", "specification", "version", "redesign"]
---

# Sources and method

This guide was written from the local codebase and the design decisions frozen on **September 14, 2026**. Files cited below are repository paths, not network endpoints.

The new version is described from the `redesign/tide-lp-autowalls-vault` branch. Historical code references designate protocol revision `991fca9`, preserved on branch `work/v1-v2-fixed-walls`. The published documentation does not constitute a validation of the contracts described.

## Reading order

The reference for the new version is **`contracts/docs/REDESIGN_HANDOFF.md`**. This document records the design decisions and their implementation in the code; it takes precedence over earlier documents.

Taxes are unchanged: **3% on buys for the team**, and **15% on sells: 12% for walls and 3% for the team**. Trading liquidity is a single band, walls are placed and emptied on every sale and the adopted launch FDV is **3.75 ETH**.

The document **`CUBIT-cahier-des-charges/docs/VERSION_ACTUELLE.md`** expressed the launch base as a **USD 7 000 FDV** on 21 million tokens. The new version sets the FDV directly in ETH; this guide establishes no correspondence between these two references.

To know what actually works, then connect the code, validation results and deployment of the same version.

A code comment does not replace a confirmed decision. Conversely, a decision does not prove that an implementation or network executes it.

## Code reviewed

| Source | Use in the guide |
| --- | --- |
| `contracts/docs/REDESIGN_HANDOFF.md` | Frozen decisions and implementation in the code |
| `contracts/src/CubitToken.sol` | Fixed supply and burn authority |
| `contracts/src/CubitHook.sol` | Taxes, band, walls, accounts and V2 connection |
| `contracts/src/libraries/BandLib.sol` | Geometry, prices, ticks and wall target |
| `contracts/src/libraries/WallLib.sol` | Per-tick walls: funding and emptying of crossed walls |
| `contracts/src/CubitLens.sol` and interfaces | Prices, band, walls, balances, circulating supply, held CUBIT and best wall |
| `contracts/src/periphery/CubitRouter.sol` | Swaps, limits, approvals and transfer of absorbed CUBIT |
| `contracts/src/periphery/CubitV2.sol` | Module identity and replacements |
| `contracts/src/periphery/CubitVault.sol` | Lock, daily reward and reserve |
| `contracts/src/periphery/CubitGovernanceVault.sol` | Deposits locked for 30 days and claims by the deployer |
| `contracts/src/periphery/CubitForge.sol` | Public launchpad, child isolation and governance vault address |
| `contracts/src/periphery/CubitLaunch.sol` | Launch in one transaction: band, vault reserve and deployer buy |
| `dapp/src/chain` | Discovery, quotes, signing context and old Vaults |
| `dapp/src/pages/Momentum.tsx` | Read-only Momentum page: active, partially consumed and crossed walls |
| `services/` and their READMEs | Event relay and old keeper |
| `contracts/foundry.toml` and package manifests | Build commands and parameters |

## Historical reports and documents

The old version’s reference report is `audit/reports/2026-09-10-v1-v2/BILAN_FINAL_FR.md`. It describes the ladder, maintenance by keepers and the burn of wall tokens, all replaced in the new version.

`roadmapdev.md` and historical specification documents helped explain intent and V1/V2 milestones. Original texts were archived under `CUBIT-cahier-des-charges/historique/2026-09-10-avant-murs-fixes/`. Passages about a single monotonic wall, E/C placement, the ladder, keepers or a complete disappearance of administrative rights do not establish the new version’s rule.

`contracts/docs/STRICT_BURN.md` explains the historical evolution of the burn of absorbed tokens, abandoned in the new version. `contracts/docs/MODULE_SETTERS.md` documents peripheral replacement. No old test count is presented here as a validation result for the new version.

The dapp’s former roadmap page is a dated editorial reference; its content must not be used alone to integrate the new version.

## Art direction

The theme adapts decisions already present in the dapp:

| Visual source | Elements reused |
| --- | --- |
| `dapp/src/index.css` | Cream `#f5f1e8`, ink `#111312`, purple `#5b4bff`, lime `#c7ff3d`, orange `#ff704d`, paper `#ede7d8` |
| `dapp/src/index.css` | Heavy, extended-width Archivo headings; Martian Mono labels; subtle texture |
| `dapp/src/components/primitives.tsx` | Defined borders, offset shadows, panels and statuses |
| `dapp/src/components/Header.tsx` | Typographic wordmark, purple square, navigation and state distinctions |
| `dapp/src/ui.tsx` | Occasional star motif and monospace labels |

Fonts are copied locally at build time with their licenses. The guide follows the dapp’s graphic language without reusing its outdated slogans.

## Documentation

The chosen engine is **HonKit 6.2.2**, a fork of the GitBook engine dedicated to creating books and documentation from Markdown. Contents, static generation, search and page navigation come from this framework. The CUBIT theme extends its templates and styles. [Official HonKit documentation](https://honkit.netlify.app/).

Local installation and `serve` / `build` commands follow the [official getting-started documentation](https://honkit.netlify.app/setup.html). [Book configuration](https://honkit.netlify.app/config.html) specifies the content root and styles, among other settings. Release 6.2.2 identifies the version used.

The README at the root of `gitbook/` describes installation, commands, browser checks and tooling limitations. This site’s validation checks the book; it does not validate protocol contracts.

## Maintaining this guide

For a new release, start by updating version status and the normative reference. Then synchronize rules, API and workflows actually connected. Preserve the historical label when an older result does not cover the final sources.

Add a page in `docs/`, reference it in `SUMMARY.md`, then rebuild the book. Sources for this documentation are explicitly selected; private configurations, keys, authenticated RPCs and transaction dumps are not part of the site.
