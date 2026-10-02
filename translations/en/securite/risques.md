---
description: "Concrete limitations: finite depth of the band and walls, gas for crossed walls, reward reserve, integrations, module replacement and version evidence."
section: "05 / VERIFY"
reading: "5 MIN READ"
search:
  keywords: ["security", "security", "risks", "limitations", "losses", "audit", "reserve", "reserve", "extraction", "gas"]
---

# Risks and limitations

The band and the walls are LP positions. Their presence defines available liquidity without making a trade’s outcome independent of the price, fees or pool state.

> The limitations below are not exhaustive. The code may contain errors that the tests have not revealed.

## Price and execution

The band holds only the ETH brought in by buyers: its 3 ETH depth at launch is virtual. When the price returns to the launch price, it contains only CUBIT. The walls, for their part, contain only the ETH that sales have placed in them.

The market, the next wall’s target, a wall’s price and the net amount obtained from a sale are separate data. Use a quote for the intended amount. A large change between quote and execution may cause rejection by the minimum received or input cap; taxes, pool fees and gas remain real costs.

## Walls and accounting

Each crossed wall costs the sale that empties it about 185 000 gas. Since a transaction is limited to 16 777 216 gas by EIP-7825, a sale crosses at most about 88 walls: beyond that, it fails without loss and must be split into several sales. A failed transfer of absorbed CUBIT does not block the sale: the CUBIT stays isolated in the hook and anyone can retry the transfer.

No published proof guarantees that an actor cannot extract the ETH accumulated in the walls at a favorable rate, for example by buying early and then selling into walls funded by other sales.

Account separation must remain valid after purchases, sales, absorptions, rewards and replacements. Contract sizes, library linking and compilation settings are also within the verification scope.

## Vault and reserve

The 3% daily reward is paid from a finite reserve: at this pace, the reserve can run out and payments stop. A reward left unclaimed beyond one day is lost.

CUBIT paid as rewards is tradable: any sale of it weighs on the market like any other sale. Forge launch fees and tokens from the children’s walls are intended for the governance vault, whose unlocked batches only the deployer can claim, permanently and with no possible transfer.

## Integrations and modules

A third-party router does not necessarily call `deliverAbsorbed()` after a sale: the absorbed CUBIT then remains pending until a public call. Aggregator compatibility must be tested with hook taxes and the pool version.

Replaceable modules introduce trust in the team’s future decisions: the team can replace them immediately, without delay, and protects the private key of its address. Getter checks do not prove the safety of the chosen code. A new address requires a new review of the approval or signature.

The hook has no administrator: nobody can pause the swaps or the wall mechanism, including in the event of an incident. The team address, on the other hand, keeps permanent powers over the registry modules.

## Frontend and data

A display can use a simulation, an old manifest or stale data; the current dapp reads the version in service. The interface must identify the network and blocks, flag outages and prevent signing from a context that has become inconsistent.

USD figures depend on the chosen conversion: the launch FDV is fixed in ETH and does not follow the dollar.

## What tests establish

Tests and invariant campaigns provide evidence for the cases, states and revision actually explored. Historical campaigns cover the old model and do not validate the new version. A long successful campaign is not a general formal proof.

This edition does not guarantee the absence of loss. [Actual version status](etat.md) details what has been tested, and the [roadmap](../roadmap.md), the next steps.

<p class="source-note">Sources: <code>contracts/docs/REDESIGN_HANDOFF.md</code>, <code>CubitHook.sol</code>, <code>WallLib.collectCrossed</code>, <code>CubitRouter._finishSwap</code>, <code>periphery/CubitVault.sol</code>, <code>periphery/CubitGovernanceVault.sol</code> and, for the history, <code>audit/reports/2026-09-10-v1-v2/BILAN_FINAL_FR.md</code>.</p>
