---
description: "3 % à l’achat, 15 % à la vente dont 12 % pour les murs, 0,01 % de frais LP visés : comprendre les bases de calcul."
section: "01 / COMPRENDRE"
reading: "5 MIN DE LECTURE"
search:
  keywords: [taxes, frais, fee, pourcentage, achat, vente, equipe, équipe, murs]
---

# Taxes et circulation des ETH

Les **taxes du hook** et les **frais LP du pool** correspondent à deux opérations différentes. Ils ne portent pas sur la même base et ne s’additionnent pas comme une taxe unique.

Ces taux sont ceux de la nouvelle version, appliqués par le pool Ethereum raccordé à l’app. Vérifiez [l’état des versions](../securite/etat.md) et la cotation du pool utilisé.

## La taxe à l’achat

La taxe totale est de **3 % de l’entrée ETH brute**, intégralement destinée à la part équipe. Dans le cas exact-input, elle est incluse dans le montant fourni au routeur.

| Pour un achat de 1 ETH | Montant | Destination |
| --- | --- | --- |
| Jambe du swap | 0,97 ETH | Pool, puis frais LP et conversion en CUBIT |
| Part équipe | 0,03 ETH | Comptabilité équipe |

Pour un achat exact-output, si la jambe pool requiert `x` ETH, le total avant gas est approximativement `x / 0,97`, avec arrondis entiers. Le routeur applique le plafond d’entrée choisi par l’utilisateur et rembourse le surplus.

## La taxe à la vente

La taxe totale est de **15 % des ETH de sortie bruts** : **12 % pour les murs et 3 % pour l’équipe**.

| Pour une sortie brute de 1 ETH | Montant | Destination |
| --- | --- | --- |
| ETH nets du vendeur | 0,85 ETH | Wallet du destinataire |
| Financement des murs | 0,12 ETH | Mur placé à la cible de cette vente, ou 1 % sous le prix courant au prix de lancement ou en dessous |
| Part équipe | 0,03 ETH | Comptabilité équipe |

Le vendeur reçoit donc **0,85 ETH**, avant le coût du gas payé séparément. Pour viser une sortie nette de `x` ETH en exact-output, le pool doit fournir approximativement `x / 0,85` ETH bruts, avec arrondis entiers et selon la cotation réelle.

Les **ventes financent directement les murs**. Les 12 % et 3 % sont calculés sur les ETH bruts de la vente : il ne s’agit pas de 12 % des 15 % de taxe. La part équipe revient entièrement à l’équipe.

## Les frais LP

Le paramètre `fee` d’Uniswap v4 est exprimé en millionièmes :

| Version | Paramètre | Pourcentage LP |
| --- | --- | --- |
| Nouvelle version | `100` | **0,01 %** |

Le `tickSpacing` et la largeur d’un mur sont des paramètres de géométrie, pas une autre expression du taux de frais LP. Le pool CUBIT utilise un spacing de 10 ticks dans les sources lues.

Les frais LP s’appliquent à la jambe de swap selon la mécanique du pool. Une cotation réelle tient compte des arrondis, des ticks traversés, de la liquidité et des éventuels frais de protocole v4. **N’appliquez pas une seconde fois la taxe à une cotation déjà nette.**

## Où vont les 12 %

À chaque vente, le hook vide d’abord les murs que le prix a entièrement traversés, puis place tous les ETH en attente, dont ces 12 %, dans un mur situé à la cible calculée sur le prix après la vente. Si un mur existe déjà à ce tick, il est épaissi. Au prix de lancement ou en dessous, cette cible passe le plus souvent au-dessus du marché : le mur est alors posé 1 % sous le prix courant. Seuls une poussière trop petite pour créer de la liquidité, un surplus quand le plafond de liquidité d’un tick est atteint, et le cas extrême d’un prix tout en haut de la plage de ticks restent dans `pendingFloorEth`, jusqu’à une vente suivante.

Il n’y a plus de sweep : l’ancien transfert d’une part des ETH du ladder vers les murs a disparu avec le ladder. [La cible et les murs fixes](murs.md).

## Les recettes prévues pour la V2

| Module | Recette | Ce qui ne sert pas de financement |
| --- | --- | --- |
| Vault | Réserve de CUBIT : 20 % de l’offre au lancement, puis les CUBIT des murs entièrement traversés | Principal déposé, création de CUBIT, frais LP ; aucune récompense en WETH |
| Forge | Fee de lancement de 0,005 ETH, versé en ETH au vault de gouvernance du launchpad et jamais remboursé au lanceur | Retrait des fonds des murs pour un enfant |

Les fees de la Forge sont perçus depuis son ouverture, le 23 septembre 2026. La réserve du Vault paie les récompenses depuis l’ouverture du Vault, le 26 septembre 2026. Leur montant dépend de l’activité réelle.

## Un aller-retour ne coûte pas exactement 18 %

En isolant seulement les taxes proportionnelles, à prix constant et sans impact ni autres frais, le facteur conservé est `0,97 × 0,85 = 0,8245`. La perte correspondante est donc **17,55 %**, pas une somme mécanique de 15 et 3 appliquée au même montant.

Un vrai aller-retour ajoute les frais du pool, le gas et l’évolution du prix. Le montant net retourné par la cotation reste la référence pour une transaction donnée. [Acheter et vendre](../utiliser/swaps.md).

<p class="source-note">Répartition des taxes : décisions de design du 14 septembre 2026. Code : <code>CubitHook._creditBuyTax</code>, <code>_creditSellTax</code>, <code>_placeWall</code> et <code>periphery/CubitRouter.sol</code>.</p>
