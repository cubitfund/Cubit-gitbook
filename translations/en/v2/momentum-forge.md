---
description: "Momentum offers a read-only view of the market. The Forge is a public launchpad; its launch fees and tokens absorbed by the children’s walls join the launchpad governance vault."
section: "03 / V2 MODULES"
reading: "5 MIN READ"
search:
  keywords: ["momentum", "forge", "child", "launchpad", "public", "governance", "NAV", "lock", "30 days", "extension"]
---

# Momentum and Forge

These two modules have distinct roles: **Momentum makes the market’s state visible**, while **the Forge lets anyone launch an isolated child market**.

## Momentum: observing the market

Momentum is an app page: for each token, it shows active walls, partially consumed walls and the history of crossed walls, from the hook’s events and the Lens readings. It has been open since September 23, 2026.

It is a **read-only** feature, with no power to withdraw ETH from walls or change core rules. A change in display is not a trading command.

The geometry actually used remains that of the hook. A frontend component cannot invent it.

## Forge: a public launchpad

The Forge is **open to everyone**: any account launches a child market by paying the exact launch fee. It was not part of the CUBIT launch: the team added it on September 23, 2026, with its governance vault, and opened it the same day.

Each child receives its own token, hook, pool identities and reserves. The hook creation template is controlled by a hash fixed in Forge’s constructor. Deployment salts are bound to the launcher: two launches in the same block do not invalidate each other, and copying another account’s salts does not take over its launch.

A child **deposits 100% of its supply in its band**. It has neither a vault reserve nor a team allocation. The name, symbol, team address, deployment salt and supplied code are checked. Like the parent’s hook, a child’s hook has no administrator. Creating a child grants no permission over the parent CUBIT pool. Parameters are imposed: the same launch valuation, the same supply and the same taxes for every child.

## The launchpad governance vault

The **launchpad governance vault** receives the Forge launch fees, in ETH, and tokens absorbed by the children’s walls, which do not go to the parent’s staking vault:

- each deposit is locked there for **30 days from when it is booked**, plus any extension: booking is immediate for a deposit, a launch fee or a child's delivery, and happens only on the call to `lockUntracked` for tokens sent straight to the vault;
- **the deployer can extend the lock** of the whole vault, present and future deposits, tokens and ETH, with `extendLock`, whenever it wants; no function shortens a lock;
- for example, 10 tokens received every day for 7 days come out in 7 batches, one per day, the last one after 1 month and 7 days;
- **only the deployer** of that vault can claim unlocked batches, permanently: no function can transfer this right;
- its holdings are intended to serve as a value reference, or NAV, for the launchpad token.

The Forge receives this vault’s address at construction, in `governanceVault`. A child’s hook finds it through the Forge that deployed its token, then `deliverAbsorbed()` transfers the tokens from emptied walls there and locks them with `lockUntracked`.

## The launch fee

Each launch pays its fee to the launchpad governance vault, in ETH, through `depositEth()` in the same transaction. The fee then belongs to governance: **the launcher never gets it back**, and **only the deployer** of the vault can claim it with `claim`. The fee does not fund CUBIT’s walls. Like every deposit this vault receives, it then follows the lock rule described above.

The `launchFee()` amount is fixed when each Forge is constructed: it is **0.005 ETH**, that is 5 × 10^15 wei, and it is immutable. Changing the fee therefore requires a new Forge; always read the actual on-chain amount of the contract in use.

## If Forge is replaced

The team can replace the Forge at any time, without delay. Replacement changes the reference factory for future launches, and with it the governance vault that receives their fees; it deactivates Forge until it is activated again. Children already created retain their own contracts and funds. A launchpad v2 can thus set other parameters for its own launches.

The registry’s compatibility checks do not replace a review of the template and factory.

## A launchpad v2

Children’s parameters are imposed by the registered Forge. A replacement Forge, a launchpad v2, can set others; the team opens it when it decides.

Children already launched keep working on their own pools, and the tokens absorbed by their walls still go to the governance vault of the Forge that launched them.

<p class="source-note">Sources: design decisions of September 14 and 15, 2026, <code>periphery/CubitForge.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>CubitHook.absorbedTokenSink</code>, <code>CubitV2.setForge</code> and <code>dapp/src/pages/Momentum.tsx</code>.</p>
