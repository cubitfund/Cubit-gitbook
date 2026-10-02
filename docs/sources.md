---
description: "Périmètre des lectures, hiérarchie des documents, sources de la direction artistique et méthode de maintenance du GitBook."
section: "05 / VÉRIFIER"
reading: "RÉFÉRENCES DU GUIDE"
search:
  keywords: [sources, references, références, documentation, HonKit, cahier, version, redesign]
---

# Sources et méthode

Ce guide a été rédigé à partir de la codebase locale et des décisions de design figées le **14 septembre 2026**. Les fichiers cités ci-dessous sont des chemins du dépôt, pas des endpoints réseau.

La nouvelle version est décrite d’après la branche `redesign/tide-lp-autowalls-vault`. Les références historiques de code désignent la révision `991fca9` du protocole, conservée sur la branche `work/v1-v2-fixed-walls`. La documentation publiée ne constitue pas une validation des contrats décrits.

## Ordre de lecture

La référence de la nouvelle version est **`contracts/docs/REDESIGN_HANDOFF.md`**. Ce document consigne les décisions de design et leur mise en œuvre dans le code ; il prime sur les documents antérieurs.

Les taxes sont inchangées : **3 % à l’achat pour l’équipe**, et **15 % à la vente : 12 % pour les murs et 3 % pour l’équipe**. La liquidité de trading est une bande unique, les murs sont posés et vidés à chaque vente et la FDV de lancement retenue est de **3,75 ETH**.

Le document **`CUBIT-cahier-des-charges/docs/VERSION_ACTUELLE.md`** exprimait la base de lancement en **7 000 USD de FDV** sur 21 millions de tokens. La nouvelle version fixe la FDV directement en ETH ; ce guide n’établit pas de correspondance entre ces deux références.

Pour savoir ce qui fonctionne réellement, il faut ensuite relier le code, les résultats de validation et le déploiement d’une même version.

Un commentaire de code ne remplace pas une décision confirmée. Inversement, une décision ne prouve pas qu’une implémentation ou qu’un réseau l’exécute.

## Le code lu

| Source | Utilisation dans le guide |
| --- | --- |
| `contracts/docs/REDESIGN_HANDOFF.md` | Décisions figées et mise en œuvre dans le code |
| `contracts/src/CubitToken.sol` | Offre fixe et droit de burn |
| `contracts/src/CubitHook.sol` | Taxes, bande, murs, comptes et raccordement V2 |
| `contracts/src/libraries/BandLib.sol` | Géométrie, prix, ticks et cible des murs |
| `contracts/src/libraries/WallLib.sol` | Murs par tick : financement et vidage des murs traversés |
| `contracts/src/CubitLens.sol` et interfaces | Prix, bande, murs, soldes, offre en circulation, CUBIT détenus et meilleur mur |
| `contracts/src/periphery/CubitRouter.sol` | Swaps, limites, approvals et envoi des CUBIT absorbés |
| `contracts/src/periphery/CubitV2.sol` | Identité des modules et remplacements |
| `contracts/src/periphery/CubitVault.sol` | Lock, récompense quotidienne et réserve |
| `contracts/src/periphery/CubitGovernanceVault.sol` | Dépôts bloqués 30 jours et réclamation par le déployeur |
| `contracts/src/periphery/CubitForge.sol` | Launchpad public, isolation des enfants et adresse du vault de gouvernance |
| `contracts/src/periphery/CubitLaunch.sol` | Lancement en une transaction : bande, réserve du vault et achat du déployeur |
| `dapp/src/chain` | Découverte, cotations, contexte de signature et anciens Vaults |
| `dapp/src/pages/Momentum.tsx` | Page Momentum en lecture seule : murs actifs, entamés et traversés |
| `services/` et leurs README | Relais d’événements et ancien keeper |
| `contracts/foundry.toml` et package manifests | Commandes et paramètres de build |

## Rapports et documents historiques

Le bilan de référence de l’ancienne version est `audit/reports/2026-09-10-v1-v2/BILAN_FINAL_FR.md`. Il décrit le ladder, la maintenance par keepers et le burn des murs, remplacés dans la nouvelle version.

`roadmapdev.md` et les documents historiques du cahier ont servi à comprendre l’intention et les jalons V1/V2. Les textes d’origine ont été archivés sous `CUBIT-cahier-des-charges/historique/2026-09-10-avant-murs-fixes/`. Les passages sur un mur unique monotone, le placement E/C, le ladder, les keepers ou une disparition totale des droits administratifs ne constituent pas la règle de la nouvelle version.

`contracts/docs/STRICT_BURN.md` explique l’évolution historique du burn des tokens absorbés, abandonné dans la nouvelle version. `contracts/docs/MODULE_SETTERS.md` documente le remplacement des périphériques. Aucun ancien nombre de tests n’est présenté ici comme un résultat de validation de la nouvelle version.

L’ancienne page roadmap du dapp est un repère éditorial daté ; son contenu ne doit pas être utilisé seul pour intégrer la nouvelle version.

## La direction artistique

Le thème transpose les décisions déjà présentes dans le dapp :

| Source visuelle | Éléments repris |
| --- | --- |
| `dapp/src/index.css` | Crème `#f5f1e8`, encre `#111312`, violet `#5b4bff`, lime `#c7ff3d`, orange `#ff704d`, papier `#ede7d8` |
| `dapp/src/index.css` | Titres Archivo à graisse forte et largeur étendue ; libellés Martian Mono ; texture discrète |
| `dapp/src/components/primitives.tsx` | Bordures franches, ombres décalées, panneaux et statuts |
| `dapp/src/components/Header.tsx` | Wordmark typographique, carré violet, navigation et distinction des états |
| `dapp/src/ui.tsx` | Motif étoilé ponctuel et libellés monospace |

Les polices sont copiées localement au build avec leurs licences. Le guide reprend le langage graphique du dapp, sans reprendre ses slogans devenus obsolètes.

## La documentation

Le moteur choisi est **HonKit 6.2.2**, fork du moteur GitBook dédié à la création de livres et documentations à partir de Markdown. Le sommaire, la génération statique, la recherche et la navigation de pages proviennent de ce framework. Le thème CUBIT étend ses templates et styles. [Documentation officielle HonKit](https://honkit.netlify.app/).

L’installation locale et les commandes `serve` / `build` suivent la [documentation officielle de démarrage](https://honkit.netlify.app/setup.html). La [configuration du livre](https://honkit.netlify.app/config.html) précise notamment la racine des contenus et les styles. La release 6.2.2 identifie la version utilisée.

Le README à la racine de `gitbook/` décrit l’installation, les commandes, les contrôles navigateur et les limites de l’outillage. Les validations de ce site contrôlent le livre ; elles ne valident pas les contrats du protocole.

## Maintenir ce guide

Pour une nouvelle release, commencez par mettre à jour l’état des versions et la référence normative. Synchronisez ensuite les règles, l’API et les parcours réellement raccordés. Conservez la mention historique lorsqu’un ancien résultat ne porte pas sur les sources finales.

Ajoutez une page dans `docs/`, référencez-la dans `SUMMARY.md`, puis reconstruisez le livre. Les sources de cette documentation sont sélectionnées explicitement ; les configurations privées, clés, RPC authentifiés et dumps de transactions ne font pas partie du site.
