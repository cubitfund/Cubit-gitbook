---
description: "Answers to common questions about the band, walls funded on every sale, fees, the Vault, permissions and versions."
section: "05 / VERIFY"
reading: "QUICK ANSWERS"
---

# Frequently asked questions

## What exactly is a wall?

An ETH-funded liquidity position in the pool, at a defined tick below the current price. The formula chooses its location and the 12% from sales determines its size.

## What is the band?

The single trading position: 80% of the supply, placed at launch, covering all prices above the launch price and never withdrawn. Purchases and sales follow its x·y=k curve. [The liquidity band](comprendre/ladder.md).

## Does the target follow the all-time high?

No. It uses the price left by each sale: `0.4 × current price + 0.6 × launch price`. With an illustrative base of 7 000, a return from 100k to 60k gives **28.2k**. [See the calculation](comprendre/murs.md).

## Do older walls fall with the new target?

No. A wall stays at its tick. A funding that lands on the same tick thickens it; a sale can, however, consume its ETH.

## Is the 12% placed on every sale?

Yes: every sale places the pending ETH, including its 12%, in a wall at the target calculated on the price after the sale. At or below the launch price, this target would be above the market: the wall is then placed 1% below the current price. Only dust too small to create a position and the extreme case of a price at the very top of the tick range wait for a later sale.

## Are LP fees included in the 15%?

No. The 15% is the hook’s sell tax; the buy tax is 3%. The new version’s LP rate is 0.01%, with a pool-specific calculation base. The connected Ethereum pool applies that same rate. [Fee details](comprendre/taxes.md).

## What happens to a crossed wall?

A wall that is only partially consumed stays in place and refills with ETH if the price rises again. A fully crossed wall is emptied by the sale that crossed it: its CUBIT joins the vault reward reserve. [See the explanation](comprendre/burn.md).

## Can a sale cross an unlimited number of walls?

No. Each crossed wall costs about 185 000 gas, and a transaction is limited to 16 777 216 gas: a sale crosses at most about 88 walls. Beyond that, it fails without loss and must be split. [Risks and limitations](securite/risques.md).

## Is CUBIT deflationary?

Not in the new version. The supply remains fixed at 21 million with no minting, but CUBIT bought back by the walls is no longer burned: it funds the vault reward reserve.

## Are keepers still needed?

No. `rebalance` and `raiseFloor` are removed, and walls are placed and emptied during sales. No bounty is paid to a caller.

## Can anyone block sales?

No. The hook has no administrator, and nobody can pause the swaps or the wall mechanism.

## Does the team keep any powers?

Yes, permanently. The team address receives the team share of taxes and can replace the peripheral modules of the registry at any time, without delay, and then activate them. These replacements touch neither the core nor the balances already held in the vaults. [Permissions](securite/permissions.md).

## Are V2 functions available?

Yes: Momentum and the Forge since September 23, 2026, the Vault since September 26, 2026. [V2 features](v2/prochaines-fonctionnalites.md).

## What happens if I do not claim my reward every day?

The claimable amount caps at one day, i.e. 3% of the deposit. Beyond 24 hours without a claim, the excess is lost. The reward is also limited by the reserve balance.

## Does a new deposit extend the Vault lock?

Yes. An additional deposit restarts the 24-hour lock of that wallet’s entire position in that contract. The accrued reward can be claimed independently of the withdrawal lock.

## What happens to my funds if the Vault is replaced?

They remain in the old Vault, with its reward reserve and your unlock date. Select that old contract to read your position and perform its exits. Funds are not automatically transferred to the new module.

## Where do tokens absorbed by a Forge child’s walls go?

To the launchpad governance vault, which also receives the Forge launch fees, in ETH. Each deposit is locked there for 30 days from when it is booked — immediate for a deposit or a launch fee, on the call to `lockUntracked` for tokens sent straight to the vault — plus any extension, then only the deployer of that vault can claim it: this right is permanent and cannot be transferred. That deployer can extend the lock, never shorten it. [Momentum and Forge](v2/momentum-forge.md).

## Who can launch a token on the Forge?

Any account, by paying the exact launch fee of 0.005 ETH, which goes to the governance vault and is never refunded. The Forge was not part of the CUBIT launch: the team added the launchpad and opened it on September 23, 2026. [Momentum and Forge](v2/momentum-forge.md).
