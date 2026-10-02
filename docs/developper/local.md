---
description: "Commandes locales de compilation, tests Foundry de la nouvelle version, dapp, services et GitBook ; aucune diffusion de transaction."
section: "04 / CONSTRUIRE"
reading: "5 MIN DE LECTURE"
---

# Lancer le projet en local

Les répertoires ont leurs propres dépendances. Utilisez les lockfiles du dépôt et gardez les versions de contrats, ABI, manifests et clients alignées.

Les commandes suivantes construisent ou vérifient les composants localement. Elles ne constituent pas une procédure de mise en production.

## Prérequis

Le projet utilise Node.js récent, pnpm pour le dapp et les services, Foundry pour Solidity, et npm pour ce GitBook. Les services demandent Node **22 ou supérieur** ; le GitBook a été préparé avec Node 24.

Les contrats fixent **Solidity 0.8.26**, l’EVM **Cancun**, le passage **via IR**, l’optimiseur à **10 runs**, sans metadata CBOR. Ces paramètres font partie de l’identité des bytecodes à vérifier.

Après clonage, les dépendances Solidity du dépôt doivent être présentes :

```bash
git submodule update --init --recursive
```

## Compiler et tester les contrats

Depuis `contracts/`, sur la branche `redesign/tide-lp-autowalls-vault` :

```bash
FOUNDRY_TEST=test/redesign forge build --sizes
FOUNDRY_TEST=test/redesign forge test
```

La suite historique `test/` utilise l’ancienne API du ladder et ne compile pas avec la nouvelle version : `FOUNDRY_TEST` limite la compilation aux tests de `test/redesign`. Le passage via IR rend la compilation lente.

Les profils de fuzzing et d’invariants de la configuration portent sur la suite historique :

```bash
FOUNDRY_PROFILE=ci forge test
FOUNDRY_PROFILE=gate forge test
```

Un résultat de tests doit être attaché à la révision exacte, aux paramètres et aux sources compilées ; un ancien log n’est pas un résultat de la nouvelle version.

Le script `script/Scenarios.s.sol` rejoue des scénarios sur un nœud local Anvil : `SCENARIO=band` pour la bande, `SCENARIO=walls` pour les murs et `SCENARIO=crossing` pour le gas des murs traversés. Suivez les instructions du dépôt pour le déploiement local, sans recopier de clé dans vos notes.

## Démarrer le dapp

Depuis `dapp/` :

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
pnpm dev
```

Vite affiche l’URL de développement. La configuration distingue un mode simulation et les données du déploiement configuré. Utilisez les exemples et instructions du dépôt pour configurer localement un RPC, sans recopier d’identifiants d’accès dans les sources ou le bundle public.

Le fait que le frontend compile ne prouve pas que son manifeste correspond au contrat présent sur le réseau. Le dapp lit l’ABI de la version en service.

## Maintenir les ABI

Depuis `contracts/`, l’export suit la compilation :

```bash
bash scripts/export-abi.sh
python3 scripts/check-abi.py
```

Le dapp dispose de `pnpm gen-abi` et les services de `pnpm gen:abi`. Inspectez les modifications produites pour les interfaces, événements et types concernés. La vue `band()`, les champs `bandEth` et `bandTokens`, les vues des murs, `deliverAbsorbed()`, `pendingAbsorbedTokens()` et les deux vaults doivent être inclus dans la synchronisation de la release.

La commande `pnpm sync-deployment` du dapp relit un manifeste de déploiement : elle ne doit être exécutée qu’avec les métadonnées de la version réellement vérifiée.

## Vérifier les services

Depuis `services/` :

```bash
pnpm install --frozen-lockfile
pnpm gen:abi
pnpm typecheck
pnpm test
```

Le service keeper appartient à l’ancien modèle et n’a plus d’usage dans la nouvelle version. L’exploitation du relais d’événements a sa [page dédiée](services.md).

## Démarrer ce GitBook

Depuis `gitbook/` :

```bash
npm ci
npm run dev
```

Le site est servi sur `http://localhost:4000` avec reconstruction des pages. Pour produire le dossier statique `_book/` et vérifier les liens :

```bash
npm run build
npm run preview
```

La prévisualisation locale utilise `http://localhost:4001`. Les polices sont embarquées ; la recherche s’exécute dans le navigateur sur l’index du livre.

Pour vérifier les parcours navigateur de la documentation :

```bash
npm run test:install
npm run test:browser
```

Le [README de `gitbook/`](../sources.md#la-documentation) décrit le choix HonKit, l’arborescence, les contrôles et la maintenance éditoriale.

<p class="source-note">Sources : <code>contracts/foundry.toml</code>, <code>contracts/docs/REDESIGN_HANDOFF.md</code>, <code>contracts/script/Scenarios.s.sol</code>, scripts du dépôt, <code>dapp/package.json</code>, <code>services/package.json</code> et <code>gitbook/package.json</code>. Aucune clé ni URL RPC authentifiée n’est nécessaire au build de cette documentation.</p>
