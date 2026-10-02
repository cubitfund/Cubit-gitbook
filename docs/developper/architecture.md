---
description: "Carte de la codebase CUBIT : contrats, bande et murs, vaults, dapp et services."
section: "04 / CONSTRUIRE"
reading: "6 MIN DE LECTURE"
---

# Architecture et codebase

Le dépôt réunit les contrats Solidity, un dapp React/Vite et deux services Node. Ce GitBook est autonome dans `gitbook/` : son build ne lit ni configuration privée ni données réseau du protocole.

> La version décrite ici se trouve sur la branche `redesign/tide-lp-autowalls-vault`.

## Les répertoires

| Répertoire | Responsabilité |
| --- | --- |
| `contracts/src` | Token, hook, bibliothèques, interfaces et contrats périphériques |
| `contracts/test` | Tests Foundry historiques sur l’ancienne API ; tests de la nouvelle version dans `test/redesign` |
| `contracts/audit` | Harnais et campagnes de vérification complémentaires |
| `contracts/script` | Scripts Foundry de déploiement et scénarios rejouables sur un nœud local |
| `contracts/scripts` | Export ABI, contrôles et procédures de déploiement |
| `contracts/deployments` | Manifestes publics de versions et historique |
| `dapp/src/chain` | Configuration, ABI, lectures, cotations et transactions |
| `dapp/src/pages` | Swap, Proof, Staking, roadmap et modules V2 |
| `services/shared` | Configuration partagée, clients, ABI et suivi d’exécution |
| `services/keeper` | Service de l’ancienne maintenance, sans objet dans la nouvelle version |
| `services/floor-bot` | Lecture des événements et préparation de publications |
| `audit/reports` | Rapports datés et preuves attachées aux révisions |
| `gitbook/docs` | Sources françaises de cette documentation |

## Les contrats du cœur

| Composant | Responsabilité |
| --- | --- |
| `CubitToken` | ERC-20 à émission initiale unique de 21 M ; burn réservé au hook |
| `CubitHook` | Taxes, bande de liquidité, placement et vidage des murs, comptes équipe, raccordement V2 |
| `BandLib` | Prix, conversions et arrondis aux ticks, cible des murs |
| `WallLib` | Murs par tick : identifiant permanent, index des murs actifs, financement et vidage des murs traversés |
| `PoolManager` v4 | État du pool, positions de liquidité, swaps et règlement |

Le hook est l’unique fournisseur de liquidité du pool CUBIT : tout autre ajout de liquidité est refusé. Les fonds sont suivis dans les positions et via des claims ERC-6909 du PoolManager ; le solde ETH natif de l’adresse du hook n’est donc pas une mesure suffisante des réserves.

La bande est une position unique identifiée par `BAND_SALT`. Chaque mur occupe une cellule de `tickSpacing` sous son propre salt. `WallLib` travaille sur le stockage du hook : les claims et les positions restent attribués au hook.

## Les contrats périphériques

| Composant | Responsabilité |
| --- | --- |
| `CubitRouter` | Swaps exact-input/output, limite de slippage, deadline, règlement et envoi des CUBIT absorbés après chaque vente |
| `CubitLens` | Vues dérivées : marché, bande, murs, comptes, offre en circulation, CUBIT détenus et meilleur mur |
| `CubitV2` | Registre stable des modules, révision et historique des vaults |
| `CubitVault` | Dépôts CUBIT, lock de 24 h et récompense en CUBIT payée par une réserve |
| `CubitGovernanceVault` | Vault de gouvernance du launchpad : fees de lancement en ETH et tokens des murs des enfants, bloqués 30 jours par dépôt, plus l’allongement éventuel ; réclamation et allongement réservés pour toujours au déployeur |
| `CubitForge` | Launchpad public de marchés enfants isolés, ajouté après le lancement ; fee de lancement de 0,005 ETH versé au vault de gouvernance, dont l’adresse est fixée à la construction |
| `CubitLaunch` | Lancement en une seule transaction : 80 % de l’offre dans la bande, 20 % dans la réserve du vault et achat du déployeur |

L’adresse équipe peut remplacer Router, Lens, Vault et Forge dans le registre à tout moment, sans délai, puis les activer ; ces pouvoirs sont permanents, et chaque remplacement désactive la fonctionnalité concernée jusqu’à sa réactivation. Le token, le hook, les identités du pool et l’ancre du registre ne suivent pas ce mécanisme de remplacement, et le hook n’a aucun administrateur : personne ne peut mettre en pause les swaps ni le mécanisme des murs.

## Le parcours d’une lecture

```text
Frontend ou service
    → manifeste public : réseau, cœur, registre
    → registre à un bloc donné : modules + révision
    → contrôle des liaisons des modules
    → Lens et vues du hook à ce même bloc
    → affichage ou simulation d’une action
```

Dans le frontend, `releases.ts` résout les modules et `vault.ts` conserve la lecture des anciens Vaults. Une absence de réponse RPC ne doit pas autoriser une signature. La couche de données du dapp lit l’ABI de la version en service.

## Le parcours d’un swap

Le frontend obtient une cotation puis une simulation. Le routeur ouvre le contexte de règlement du PoolManager ; le hook applique les taxes sur la jambe ETH, et le swap suit la courbe de la bande et des murs traversés. Le routeur règle ensuite les deltas.

À chaque vente, dans `afterSwap`, le hook vide les murs entièrement traversés puis place les ETH en attente dans un mur à la cible calculée sur le prix après la vente, ou 1 % sous le prix courant quand cette cible n’est pas sous le marché, au prix de lancement ou en dessous. À la fin de la vente, le routeur CUBIT appelle `deliverAbsorbed()` pour envoyer les CUBIT absorbés vers la réserve du vault ; un échec de cet envoi ne bloque pas la vente.

Les frontières sont importantes : le callback du routeur n’est accessible qu’au PoolManager pendant l’opération attendue, et le payer vient du caller authentifié du routeur.

## Ce que la nouvelle version a changé

La bande remplace le ladder, et `rebalance`, `raiseFloor`, le sweep et les primes sont supprimés. Les murs sont posés et vidés pendant les ventes, et les CUBIT des murs traversés rejoignent la réserve du vault au lieu d’être brûlés.

La suite historique `contracts/test` utilise l’ancienne API et ne compile pas avec la nouvelle version ; les tests de la nouvelle version se trouvent dans `test/redesign`. Les prochaines étapes figurent dans la [roadmap](../roadmap.md), et les composants testés dans [l’état des versions](../securite/etat.md).

<p class="source-note">Sources : fichiers nommés du dépôt, en particulier <code>CubitHook</code>, <code>BandLib</code>, <code>WallLib.Book</code>, <code>periphery/CubitRouter.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>releases.ts</code>, <code>contracts/docs/REDESIGN_HANDOFF.md</code> et les README des services.</p>
