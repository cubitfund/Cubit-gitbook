---
description: "What happens to a wall reached by sales: partially consumed, it stays in place; fully crossed, it is emptied and its CUBIT joins the vault reward reserve, with no burn."
section: "01 / UNDERSTAND"
reading: "4 MIN READ"
search:
  keywords: ["absorption", "crossed", "cross", "partially consumed", "reserve", "reserve", "vault", "rewards", "rewards", "burn", "destruction", "governance", "deliverAbsorbed"]
---

# Crossed walls and the vault reserve

When a sale reaches a wall, that wall’s ETH buys back CUBIT. In the new version, this CUBIT **is no longer burned**: the CUBIT from a fully crossed wall joins the **vault reward reserve**.

## Partially consumed or fully crossed

| Wall state | What happens |
| --- | --- |
| Not reached | The wall contains only ETH, at its tick |
| Partially consumed | Part of its ETH has bought back CUBIT; the wall stays in place |
| Price back up after a partially consumed wall | The wall sells its CUBIT back and refills with ETH |
| Fully crossed | The wall contains only CUBIT; the sale that crossed it empties it, its CUBIT awaits transfer and its remaining ETH returns to `pendingFloorEth` |

A wall is emptied only once **fully crossed**. As long as it is only partially consumed, the hook does not touch it: it keeps operating as an ordinary LP position at its tick. A single sale empties all the walls it has fully crossed, from nearest to farthest.

## The path of the CUBIT

```text
A sale fully crosses a wall
    → the sale empties the wall
    → its CUBIT waits in pendingAbsorbedTokens
    → deliverAbsorbed() sends it to the vault reward reserve
```

The CUBIT router calls `deliverAbsorbed()` at the end of every sale, in the same transaction. If this transfer fails, the sale is not blocked: the CUBIT stays isolated in the hook. After a sale made through another router, or after a failed transfer, any account can call `deliverAbsorbed()`, without choosing either the recipient or the amount. The reserve then pays the daily reward to vault depositors. [mCUBIT Vault](../v2/vault.md).

## Supply no longer decreases

The supply remains fixed at **21 million CUBIT**, with no minting. Since CUBIT from the walls is no longer destroyed, the supply no longer decreases as absorptions occur: CUBIT is no longer presented as deflationary. Only the negligible rounding dust from the initial deposit is burned at launch.

CUBIT paid out as rewards from the reserve are ordinary tokens: their recipients can keep, deposit or sell them.

## Forge children

For a child market created by the Forge, tokens from emptied walls do not go to a staking vault: `deliverAbsorbed()` sends them to the **launchpad governance vault**, whose address is fixed in the Forge that deployed the child token. Each deposit remains locked there for 30 days from its own receipt, and only the deployer of that vault can claim them. [Momentum and Forge](../v2/momentum-forge.md).

## What absorption does not guarantee

A wall that absorbs a sale spends its ETH. A partially consumed wall refills with ETH only if the price rises back above it; an emptied wall regains depth only if new funding lands on its tick.

The evidence for the old strict burn does not validate this new path. It has been running on Ethereum since September 22, 2026. [See known limitations](../securite/risques.md).

## Verifying the movements

To track an absorption, reconcile the hook’s events: `WallAbsorbed(id, cubit, ethRemaining)` for each emptied wall, `TokensAbsorbed(amount, pendingAbsorbedTokens)` for the total set aside pending transfer, then `AbsorbedDelivered(sink, amount)` on transfer. On the destination side, the vault emits `RewardReserveFunded`; for a Forge child, the governance vault emits `Deposited`.

<p class="source-note">Sources: design decisions of September 14, 2026, <code>CubitHook._collectCrossedWalls</code>, <code>deliverAbsorbed</code>, <code>absorbedTokenSink</code>, <code>WallLib.collectCrossed</code>, <code>CubitRouter._finishSwap</code>, <code>CubitVault.fundRewardReserve</code> and <code>periphery/CubitGovernanceVault.sol</code>.</p>
