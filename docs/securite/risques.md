---
description: "Limites concrètes : profondeur finie de la bande et des murs, gas des murs traversés, réserve de récompenses, intégrations, remplacement de modules et preuves de version."
section: "05 / VÉRIFIER"
reading: "5 MIN DE LECTURE"
search:
  keywords: [securite, sécurité, risques, limites, pertes, audit, reserve, réserve, extraction, gas]
---

# Risques et limites

La bande et les murs sont des positions LP. Leur présence définit une liquidité disponible, sans rendre le résultat d’un trade indépendant du prix, des frais ou de l’état du pool.

> Les limites ci-dessous ne sont pas exhaustives. Le code peut contenir des erreurs que les tests n’ont pas révélées.

## Prix et exécution

La bande ne détient que les ETH apportés par les acheteurs : sa profondeur de 3 ETH au lancement est virtuelle. Quand le prix revient au prix de lancement, elle ne contient plus que des CUBIT. Les murs, eux, ne contiennent que les ETH que les ventes y ont placés.

Le marché, la cible du prochain mur, le prix d’un mur et le montant net obtenu par une vente sont des données distinctes. Utilisez une cotation pour le montant envisagé. Une forte variation entre cotation et exécution peut provoquer un refus par le minimum reçu ou le plafond d’entrée ; les taxes, les frais du pool et le gas restent des coûts réels.

## Murs et comptabilité

Chaque mur traversé coûte environ 185 000 gas à la vente qui le vide. Une transaction étant limitée à 16 777 216 gas par EIP-7825, une vente traverse au plus environ 88 murs : au-delà, elle échoue sans perte et doit être découpée en plusieurs ventes. Un envoi raté des CUBIT absorbés ne bloque pas la vente : ils restent isolés dans le hook et n’importe qui peut relancer l’envoi.

Aucune preuve publiée ne garantit qu’un acteur ne peut pas extraire les ETH accumulés dans les murs à un taux favorable, par exemple en achetant tôt puis en vendant dans des murs financés par d’autres ventes.

La séparation des comptes doit rester vraie après achats, ventes, absorptions, récompenses et remplacements. La taille des contrats, le linking des bibliothèques et les paramètres de compilation appartiennent aussi au périmètre de vérification.

## Vault et réserve

La récompense de 3 % par jour est payée par une réserve finie : à ce rythme, la réserve peut s’épuiser et les versements s’arrêter. Une récompense non réclamée au-delà d’une journée est perdue.

Les CUBIT versés en récompenses sont négociables : leur vente éventuelle pèse sur le marché comme toute autre vente. Les fees de lancement de la Forge et les tokens des murs des enfants sont destinés au vault de gouvernance, dont seul le déployeur peut réclamer les lots débloqués, pour toujours et sans transfert possible.

## Intégrations et modules

Un routeur tiers n’appelle pas nécessairement `deliverAbsorbed()` après une vente : les CUBIT absorbés restent alors en attente jusqu’à un appel public. La compatibilité d’un agrégateur doit être testée avec les taxes du hook et la version du pool.

Les modules remplaçables introduisent une confiance envers les décisions futures de l’équipe : elle peut les remplacer immédiatement, sans délai, et protège la clé privée de son adresse. Les vérifications de getters ne constituent pas une preuve de sûreté du code choisi. Une nouvelle adresse nécessite une nouvelle revue de l’approval ou de la signature.

Le hook n’a aucun administrateur : personne ne peut mettre en pause les swaps ni le mécanisme des murs, y compris en cas d’incident. L’adresse équipe garde en revanche des pouvoirs permanents sur les modules du registre.

## Frontend et données

Un affichage peut utiliser une simulation, un ancien manifeste ou des données périmées ; le dapp actuel lit la version en service. L’interface doit identifier le réseau et les blocs, signaler les pannes et empêcher une signature à partir d’un contexte devenu incohérent.

Les chiffres en USD dépendent de la conversion retenue : la FDV de lancement est fixée en ETH et ne suit pas le dollar.

## Ce que les tests permettent de dire

Les tests et campagnes d’invariants donnent des preuves pour les cas, les états et la révision effectivement explorés. Les campagnes historiques portent sur l’ancien modèle et ne valident pas la nouvelle version. Une longue campagne réussie n’est pas une preuve formelle générale.

Cette édition ne garantit pas l’absence de perte. L’[état réel des versions](etat.md) détaille ce qui a été testé, et la [roadmap](../roadmap.md) les étapes suivantes.

<p class="source-note">Sources : <code>contracts/docs/REDESIGN_HANDOFF.md</code>, <code>CubitHook.sol</code>, <code>WallLib.collectCrossed</code>, <code>CubitRouter._finishSwap</code>, <code>periphery/CubitVault.sol</code>, <code>periphery/CubitGovernanceVault.sol</code> et, pour l’historique, <code>audit/reports/2026-09-10-v1-v2/BILAN_FINAL_FR.md</code>.</p>
