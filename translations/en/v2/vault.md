---
description: "Nontransferable CUBIT deposit, 24-hour lock and a 3% daily reward in CUBIT, paid only from a reserve and capped at one day."
section: "03 / V2 MODULES"
reading: "5 MIN READ"
search:
  keywords: ["vault", "staking", "stake", "locking", "lock", "withdrawal", "reward", "reward", "reserve", "reserve", "claim", "mCUBIT"]
---

# mCUBIT Vault

The Vault offers CUBIT deposits in a **nontransferable** position and a reward **in CUBIT**. Its model does not create CUBIT and grants no rights over wall funds.

The name mCUBIT refers to this deposit experience; the code does not create a freely transferable ERC-20 receipt token.

> **Open on Ethereum since September 26, 2026.**

## Where the reward comes from

The reward is paid **only from the Vault’s reward reserve**, never from deposited principal. This reserve is funded by:

- the **20% of the supply**, i.e. 4.2 million CUBIT, allocated at launch;
- the **CUBIT from fully crossed walls**, sent by `deliverAbsorbed()` after sales;
- any voluntary contribution: any account can add CUBIT to the reserve with `fundRewardReserve(amount)`.

The reserve is finite: when it is empty, rewards stop. **The reward is only in CUBIT**, claimed with `claimCubit()`, and no yield is guaranteed.

## The rate and its cap

The reward is **3% of the deposit per day**, calculated pro rata to the time elapsed since the last claim.

The claimable amount is **capped at one day**: after 24 hours without a claim, it stops increasing. To receive the full reward, you must claim every day; **the unclaimed excess is lost**.

| Time since the last claim | Claimable amount for 1 000 CUBIT deposited |
| --- | --- |
| 12 hours | 15 CUBIT |
| 24 hours | 30 CUBIT |
| 48 hours | 30 CUBIT: the second day is lost |

These amounts assume a sufficient reserve. If the reserve holds less than the amount due, only its balance is paid.

## Depositing CUBIT

1. Check the offered Vault’s address and connection to the protocol.
2. Authorize the Vault to transfer the chosen amount.
3. Call `stake(amount)` and wait for confirmation.
4. Read `balanceOf(account)`, `unlockAt(account)` and `pendingCubit(account)` on the deposit contract.

**Every additional deposit restarts the 24-hour lock for that wallet’s entire position in that Vault.** It also pays the reward accrued so far and restarts the counting day.

Deposited CUBIT remains existing tokens. A deposit is neither a burn nor a reduction in supply.

## Claiming and withdrawing

`claimCubit()` pays the accrued reward and restarts the counting day. The withdrawal lock does not block this claim.

`withdraw(amount)` returns deposited CUBIT when the chain timestamp reaches `unlockAt`. Withdrawals can be partial; a withdrawal first pays the accrued reward.

Nobody can suspend these exits. They remain subject to the rules and correct operation of the contract holding the position.

## If the Vault is replaced

The team can replace the Vault at any time, without delay. Replacement concerns the contract offered for new deposits and the one that receives absorbed CUBIT sent afterward. **Deposited CUBIT, the reward reserve and unlock dates already recorded remain in the old Vault.** Replacement does not move user funds.

The registry keeps the list of successive Vaults. Check the selected address before reading a balance, claiming or withdrawing. Approval for the previous Vault does not authorize the new one.

The registry requires a new Vault connected to the same hook and the same token, with no stake. Replacement deactivates the Vault: the new contract accepts deposits only after it is activated again.

## Module limitations

The reward depends on the reserve balance: a rate of 3% per day can exhaust it, and payments then stop. Replacement checks verify the addresses’ declared compatibility; they do not prove the safety of all replacement code. Reserve accounting, the one-day cap, the arrival of CUBIT from walls and exits from old Vaults must be validated for each release.

<p class="source-note">Sources: <code>periphery/CubitVault.sol</code> (<code>pendingCubit</code>, <code>claimCubit</code>, <code>fundRewardReserve</code>, <code>DAILY_REWARD_BPS</code>, <code>REWARD_PERIOD</code>, <code>LOCK_DURATION</code>), <code>CubitHook.deliverAbsorbed</code>, <code>CubitV2.setVault</code> and the design decisions of September 14, 2026.</p>
