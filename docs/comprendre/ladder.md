---
description: "Une seule bande large, posée au lancement avec 80 % de l’offre et jamais retirée : la liquidité de trading de CUBIT."
section: "01 / COMPRENDRE"
reading: "4 MIN DE LECTURE"
search:
  keywords: [bande, band, liquidite, liquidité, TIDE, courbe, x·y=k, lancement, FDV, ladder]
---

# La bande de liquidité

La liquidité de trading de CUBIT tient dans **une seule bande large**, sur le modèle de TIDE. Le hook la pose au lancement et ne la retire jamais. Elle remplace l’ancien ladder.

## Ce que contient la bande

| Paramètre | Valeur retenue |
| --- | --- |
| Dépôt | 80 % de l’offre, soit 16,8 millions de CUBIT |
| Composition au lancement | 100 % CUBIT, aucun ETH |
| Plage de prix | Tous les prix au-dessus du prix de lancement |
| FDV de lancement | 3,75 ETH, soit 3 ETH de profondeur pour la bande |
| Retrait | Aucun : la position n’est jamais retirée |

La borne basse de la bande correspond au prix de lancement, arrondi au tick, de sorte que la position ne contient aucun ETH au départ. Au-dessus, elle couvre toute la courbe de prix du pool.

## Une courbe x·y=k

Les achats et les ventes suivent la courbe à produit constant de la bande. Un achat y dépose des ETH et en retire des CUBIT : le prix monte. Une vente fait l’inverse : le prix baisse.

Avec une FDV de lancement de 3,75 ETH, les 16,8 millions de CUBIT valent **3 ETH au prix de lancement**. Au départ, la bande se comporte comme un pool x·y=k de 16,8 millions de CUBIT face à 3 ETH. Ces 3 ETH sont **virtuels** : ils fixent la pente de la courbe, mais la bande ne détient réellement que les ETH apportés par les acheteurs.

## Ce que la bande ne garantit pas

Les ETH que les vendeurs peuvent retirer de la bande sont ceux que les acheteurs y ont déposés. Quand le prix revient au prix de lancement, la bande ne contient plus que des CUBIT : elle ne peut plus en racheter sous ce prix.

Sous le prix de lancement, une vente ne peut donc être servie que par des ETH encore présents dans des murs. La profondeur de 3 ETH n’est ni une réserve d’ETH déposée par le protocole, ni un prix plancher.

## Ce qui a disparu avec le ladder

La bande remplace l’ancien carnet mobile. Sont supprimés :

- le ladder, ses bandes successives et sa réserve de tokens ;
- le cushion en ETH ;
- `rebalance`, `raiseFloor`, le sweep vers les murs et les primes des keepers.

Aucun appel de maintenance n’est nécessaire pour faire fonctionner le marché : il n’y a plus de keeper.

## La bande d’un enfant Forge

Un marché enfant créé par la Forge suit le même modèle, avec une différence : **il dépose 100 % de son offre dans sa bande**. Il n’a ni réserve de vault ni allocation d’équipe. Le hook exige un dépôt d’au moins 80 % de l’offre et place la totalité du dépôt dans la bande. [Momentum et Forge](../v2/momentum-forge.md).

## Vérifier la bande

La vue `band()` du hook renvoie les ticks et la liquidité de la position ; l’événement `BandBootstrapped` est émis au lancement. Le Lens expose `bandEth` et `bandTokens`, les ETH et les CUBIT détenus par la bande au prix courant, hors frais LP. [Contrats et intégration](../developper/integration.md).

<p class="source-note">Sources : <code>CubitHook._bootstrap</code>, <code>afterInitialize</code>, <code>band()</code>, <code>MIN_POOL_SUPPLY</code>, <code>CubitLens.bandEth</code> / <code>bandTokens</code> et <code>periphery/CubitForge.sol</code>. Décisions de design du 14 septembre 2026.</p>
