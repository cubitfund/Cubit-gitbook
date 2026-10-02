---
description: "État au 26 septembre 2026 : nouvelle version déployée sur Ethereum, marché ouvert, Vault, Momentum et Forge ouverts."
section: "05 / VÉRIFIER"
reading: "4 MIN DE LECTURE"
search:
  keywords: [version, statut, Ethereum, mainnet, testnet, Sepolia, validation, audit, deploye, déployé, redesign]
---

# État réel des versions

**Ce guide décrit la nouvelle version de CUBIT.** Le dapp raccordé utilise le déploiement Ethereum de cette version, à 0,01 % de frais LP. Le marché est ouvert depuis le 22 septembre 2026, au bloc 26 035 793.

Cette édition du guide est datée du **26 septembre 2026**. Elle s’appuie sur les décisions de design, le code de la nouvelle version et les rapports du dépôt.

## Trois états distincts

| Périmètre | État décrit par cette édition |
| --- | --- |
| Décisions de design, figées le 14 septembre 2026 | Achat 3 % équipe ; vente 15 % (12 % murs, 3 % équipe) ; bande unique de 80 % de l’offre ; murs créés à chaque vente ; CUBIT des murs traversés vers la réserve du vault ; vault à 3 % par jour ; FDV de lancement de 3,75 ETH |
| Code de la nouvelle version | Composants listés dans le tableau suivant |
| Ethereum raccordé au dapp | Version actuelle : achat 3 %, vente 15 % dont 12 % pour les murs, fee LP 100 = 0,01 %, bande unique de 80 % et murs posés à chaque vente, avec registre V2 et modules remplaçables |

Changer les sources locales ne change pas les contrats déjà déployés. Une synchronisation de documentation ne déplace pas les fonds d’un ancien pool.

## Les composants en production

| Partie | Statut |
| --- | --- |
| Bande large au lancement, retrait du ladder et de la maintenance | En production sur Ethereum |
| Murs posés et vidés à chaque vente, envoi de leurs CUBIT au vault | En production sur Ethereum |
| Vault à 3 % par jour en CUBIT, payé par la réserve | En production sur Ethereum depuis le 26 septembre 2026 |
| Vault de gouvernance du launchpad : fees de lancement en ETH et tokens des enfants Forge | En production sur Ethereum depuis le 23 septembre 2026 |
| Momentum : murs actifs, entamés et traversés de chaque token | En production sur Ethereum depuis le 23 septembre 2026 |
| Forge publique : marchés enfants isolés, fee de lancement de 0,005 ETH | En production sur Ethereum depuis le 23 septembre 2026 |
| Récompense du Vault uniquement en CUBIT, hook sans administrateur | Dans le code déployé sur Ethereum |
| Lancement en une transaction : 80 % dans la bande, 20 % dans la réserve du vault et achat de 0,1 ETH | En production sur Ethereum |

Ces composants sont déployés sur Ethereum depuis le 22 septembre 2026, le launchpad et Momentum depuis le 23 septembre 2026 ; les dépôts du Vault sont ouverts depuis le 26 septembre 2026. Ils sont couverts par les tests Foundry, le fuzzing, les invariants, l’analyse statique et la vérification symbolique du dépôt. Les étapes suivantes figurent dans la [roadmap](../roadmap.md).

## Ce que les rapports historiques attestent

Le bilan Sepolia décrit le déploiement d’une version précédente, des vérifications de runtimes et de liaisons, des achats et ventes de recette, un placement du mur et des contrôles de refus d’actions inéligibles.

Ces preuves appartiennent à cette version. Elles ne testent ni la bande, ni les murs créés à chaque vente, ni le nouveau vault.

À la révision historique `991fca9`, la suite Solidity complète comptait **133 réussites et 15 échecs sur 148 tests**. Ces résultats et leurs limites figurent dans le bilan de l'état publié. Ce ne sont pas des compteurs de validation de la nouvelle version.

## Ce qui ne constitue pas une validation complète

Une compilation réussie vérifie la production de bytecode. Elle ne démontre pas à elle seule les invariants comptables, le comportement d’un ensemble de murs traversés, la cohérence frontend ou une transaction sur le réseau choisi.

De même, la comparaison de hashes de runtimes ne signifie pas qu’une publication des sources a été faite sur un explorateur. Les tests automatisés du frontend ne remplacent pas une recette avec un wallet navigateur ou mobile réel.

Une validation complète de la nouvelle version couvre aussi la séparation des comptes, l’absence de sur-extraction du vault, l’arrivée dans la réserve des CUBIT des murs vidés et l’impossibilité pour un acteur d’extraire les ETH des murs à un taux favorable.

## Quelle source suivre

Pour la nouvelle version, la référence est le document de reprise `contracts/docs/REDESIGN_HANDOFF.md` de la branche `redesign/tide-lp-autowalls-vault`. Il consigne les décisions figées et leur mise en œuvre dans le code.

Pour l’historique, le point de départ reste le bilan français de la révision `991fca9`. Les manifestes publics sous `contracts/deployments/` identifient les déploiements existants.

La [page Sources](../sources.md) précise l’ordre de lecture et les documents devenus historiques.
