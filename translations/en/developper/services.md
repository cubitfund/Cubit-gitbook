---
description: "Operating the event relay: dry-run, cursors, module revisions and wall terminology; the keeper no longer has any use."
section: "04 / BUILD"
reading: "4 MIN READ"
---

# Services and operations

The repository contains two Node processes: a **keeper**, which belongs to the old model, and an **event relay** that can prepare posts. Local configuration does not prove that a service runs continuously.

## No more keeper in the new version

The old keeper called `rebalance`, `raiseFloor` and the burn of absorbed tokens. These maintenance functions have disappeared: the band is never reorganized, walls are placed and emptied during sales, and the CUBIT router sends the absorbed CUBIT to the vault.

The `services/keeper` service remains in the repository, but it no longer has a purpose and must not be operated against the new version. No bounty is paid: if absorbed CUBIT remains pending, for example after a sale made through another router, any account can call `deliverAbsorbed()`.

## The event relay

`services/floor-bot` reads events, prepares text and keeps a cursor along with `transactionHash:logIndex` deduplication keys.

Dry-run and publication modes have separate states. Cursors include chain and hook context; finalized blocks are used on networks supported by the service. A reorganization or inconsistent checkpoint must be reconciled before resuming.

The relay persists a `pendingPost` before publication. If the external service accepts the message but the process stops before success is recorded, check whether the message exists before retrying: a local database and a social network cannot commit together.

The GitBook publishes no posts. Actually enabling the relay requires separate operational configuration and authorization.

## Module changes

The current Lens is resolved from the registry. Preserve the core identity and revision context throughout the operation.

The services read the ABIs and events of the described version. A relay adapted to the old model must not be presented as validated for the new version without its acceptance testing.

## Adapting terminology to walls

The old relay announced `FloorRaised` events, which no longer exist. In the new version, a wall can be created or thickened on every sale (`WallFunded`), sometimes at a price below the previous wall, and a fully crossed wall is emptied (`WallAbsorbed`) before its CUBIT goes to the vault reserve (`AbsorbedDelivered`).

The relay must therefore name the **relevant wall, its level and the funds added or absorbed**, without inferring a global increase from an event name. Older “the floor always rises” messages do not describe this policy, and no announcement may present the walls as a price guarantee.

## Useful operational checks

Track RPC errors, configuration mismatches, cursors, the age of the last processed block and pending posts. Keep recovery logs and version identities, without private signing data.

Supervision that restarts processes does not replace resolving an inconsistent checkpoint or a registry change.

<p class="source-note">Sources: <code>services/floor-bot/README.md</code>, <code>services/keeper/README.md</code>, <code>services/shared</code>, <code>interfaces/ICubitHook.sol</code> and <code>contracts/docs/REDESIGN_HANDOFF.md</code>.</p>
