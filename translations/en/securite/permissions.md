---
description: "Fixed core identities, the absence of a hook administrator and the team address’s permanent powers over registry modules."
section: "05 / VERIFY"
reading: "5 MIN READ"
search:
  keywords: ["permissions", "team", "team", "setters", "replacement", "administrator", "authority", "admin", "governance"]
---

# Permissions and replacements

CUBIT distinguishes a core with fixed identities, without an administrator, and a team address administering peripheral modules. **The team address’s powers are permanent.**

## What remains fixed

The token, main hook, PoolManager, poolId and registry anchor are not replaced by peripheral setters.

The token authorizes its hook through a one-time connection. Core rates, the launch FDV and the band geometry have no setter, and the band is never withdrawn once placed. A new policy changing the core requires a new version, its validation and its deployment; it does not automatically update an old pool.

## No hook administrator

The hook has **no administrator**, and nobody can pause the swaps or the wall mechanism.

No address can therefore suspend a sale or the placement of a wall. The hook’s rules apply as they were deployed.

## The team’s role

The team address, `TEAM_ADDRESS`, is fixed in the hook and serves as `authority()` for the `CubitV2` registry. Its powers are permanent: it receives the team share of taxes, 3% on buys and 3% on sells, and it replaces and then activates the registry modules. It can replace the Vault, the router, the Lens or the Forge **at any time and immediately**, with no notice period. The four replaceable addresses are:

| Setter | Main connection checks | Consequence |
| --- | --- | --- |
| `setVault(next)` | Code present, same hook and same token, fresh Vault with no stake | New reference contract for future deposits and for absorbed CUBIT sent afterward |
| `setRouter(next)` | Code present, same hook/PoolManager/poolId | Current router replaced: the one the dapp uses |
| `setLens(next)` | Code present, same hook/PoolManager/poolId/token | Current read contract replaced |
| `setForge(next)` | Code present, same hook, governance vault with code | Reference launchpad, absent at launch, registered or replaced for future launches, along with the governance vault that receives their fees |

Every change emits `ModuleUpdated`, increments `moduleRevision` and closes the affected feature until the team reopens it: replacing the Vault, the Lens or the Forge closes the Vault, Momentum or the Forge respectively; replacing the router closes no feature. Check the new address and its code before an operation.

## The scope of a replacement

A replacement takes effect with its transaction. It makes it possible to choose:

- where the CUBIT absorbed by CUBIT’s walls goes in later transfers: the hook delivers it to the registered Vault;
- where future launch fees go: the registered Forge pays them to its own governance vault;
- which router the dapp uses.

It does not touch:

- the core: token, hook, band, walls and taxes;
- the balances already held in existing vaults, principal and reward reserve.

The team protects the private key of this address.

## Limitations of compatibility checks

Getters declaring the correct addresses demonstrate the expected connection, not the safety of all candidate code. They do not prove the absence of a proxy or malicious behavior in a future implementation.

The team therefore chooses peripheral code used for future operations. This ability requires checking each replacement, its bytecode and interactions.

## Funds already deposited

A Vault replacement transfers neither the deposited CUBIT nor the reward reserve of the old contract. Its positions, deadlines and exits remain in that old Vault. The registry keeps the Vault list and the frontend must continue exposing those positions.

An old router can still be used to swap and remains subject to hook taxes; an approval granted to the old router does not apply to the new one.

Replacing Forge affects future launches; children already created keep their contracts and the governance vault of the Forge that launched them.

These setters do not retroactively repair a defective contract or move funds it may hold. The ability to call an on-chain exit and its availability in the frontend must be checked separately.

## The launchpad governance vault

The governance vault has neither an administrator nor an early exit. It receives launch fees in ETH and the tokens absorbed by the children’s walls: each deposit remains locked there for 30 days from its receipt, then **only its deployer** can claim it. This right is permanent and no function can transfer it: it is an explicit trust placed in that account. That deployer can extend the lock of the whole vault, present and future deposits, whenever it wants; no function shortens it.

## Approvals and signatures

An approval is attached to a **specific spender**. It does not follow the registry’s current address. The frontend must revalidate an operation when the revision or modules change, particularly between approval and swap.

Every protocol action is a transaction: check its target address and the chain before signing it.

<p class="source-note">Sources: <code>CubitV2.sol</code>, <code>CubitHook.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>contracts/docs/MODULE_SETTERS.md</code> and frontend checks in <code>releases.ts</code> / <code>vault.ts</code>.</p>
