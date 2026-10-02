---
description: "Local commands for compilation, the new version’s Foundry tests, the dapp, services and GitBook; no transaction broadcasting."
section: "04 / BUILD"
reading: "5 MIN READ"
---

# Running the project locally

Directories have their own dependencies. Use the repository lockfiles and keep contract, ABI, manifest and client versions aligned.

The following commands build or check components locally. They are not a production deployment procedure.

## Prerequisites

The project uses recent Node.js, pnpm for the dapp and services, Foundry for Solidity, and npm for this GitBook. Services require Node **22 or newer**; the GitBook was prepared with Node 24.

Contracts specify **Solidity 0.8.26**, the **Cancun** EVM, **via IR**, an optimizer with **10 runs**, and no CBOR metadata. These settings are part of the bytecode identity to verify.

After cloning, the repository’s Solidity dependencies must be present:

```bash
git submodule update --init --recursive
```

## Compiling and testing contracts

From `contracts/`, on the `redesign/tide-lp-autowalls-vault` branch:

```bash
FOUNDRY_TEST=test/redesign forge build --sizes
FOUNDRY_TEST=test/redesign forge test
```

The historical `test/` suite uses the old ladder API and does not compile with the new version: `FOUNDRY_TEST` limits compilation to the tests in `test/redesign`. Compiling via IR makes compilation slow.

The configuration’s fuzzing and invariant profiles cover the historical suite:

```bash
FOUNDRY_PROFILE=ci forge test
FOUNDRY_PROFILE=gate forge test
```

A test result must be attached to the exact revision, parameters and compiled sources; an old log is not a result for the new version.

The `script/Scenarios.s.sol` script replays scenarios on a local Anvil node: `SCENARIO=band` for the band, `SCENARIO=walls` for the walls and `SCENARIO=crossing` for the gas of crossed walls. Follow the repository instructions for local deployment, without copying any key into your notes.

## Starting the dapp

From `dapp/`:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
pnpm dev
```

Vite displays the development URL. Configuration distinguishes simulation mode from data for the configured deployment. Use the repository examples and instructions to configure a local RPC, without copying access credentials into sources or the public bundle.

Successful frontend compilation does not prove that its manifest matches the contract on the network. The dapp reads the ABI of the version in service.

## Maintaining ABIs

From `contracts/`, export follows compilation:

```bash
bash scripts/export-abi.sh
python3 scripts/check-abi.py
```

The dapp provides `pnpm gen-abi` and services provide `pnpm gen:abi`. Inspect the resulting changes for affected interfaces, events and types. The `band()` view, the `bandEth` and `bandTokens` fields, the wall views, `deliverAbsorbed()`, `pendingAbsorbedTokens()` and both vaults must be included in release synchronization.

The dapp’s `pnpm sync-deployment` command rereads a deployment manifest: run it only with metadata for the version actually verified.

## Checking services

From `services/`:

```bash
pnpm install --frozen-lockfile
pnpm gen:abi
pnpm typecheck
pnpm test
```

The keeper service belongs to the old model and has no use in the new version. Operating the event relay is covered on its [dedicated page](services.md).

## Starting this GitBook

From `gitbook/`:

```bash
npm ci
npm run dev
```

The site is served at `http://localhost:4000` with page rebuilding. To produce the static `_book/` directory and check links:

```bash
npm run build
npm run preview
```

The local preview uses `http://localhost:4001`. Fonts are bundled; search runs in the browser on the book’s index.

To check documentation browser workflows:

```bash
npm run test:install
npm run test:browser
```

The [`gitbook/` README](../sources.md#la-documentation) describes the HonKit choice, directory structure, checks and editorial maintenance.

<p class="source-note">Sources: <code>contracts/foundry.toml</code>, <code>contracts/docs/REDESIGN_HANDOFF.md</code>, <code>contracts/script/Scenarios.s.sol</code>, repository scripts, <code>dapp/package.json</code>, <code>services/package.json</code> and <code>gitbook/package.json</code>. Building this documentation requires no key or authenticated RPC URL.</p>
