---
description: "La formule choisit l’emplacement du mur ; les ventes déterminent sa taille. Cible calculée à chaque vente, exemples et murs fixés à leur tick."
section: "01 / COMPRENDRE"
reading: "7 MIN + UN EXEMPLE INTERACTIF"
search:
  keywords: [mur, murs, cible, prix, profondeur, capacite, capacité, retracement, formule, vente, 16200, 44200, 28200]
---

# La cible et les murs fixes

**La formule choisit l’emplacement du mur ; les ventes déterminent sa taille.** Un mur est une position LP financée en ETH à un tick déterminé, sous le prix courant.

## La formule à chaque vente

Soient `M` la capitalisation du marché après la vente et `B` la base de lancement, exprimées dans la même unité :

<div class="formula">cible = M − (M − B) × 0,6<span class="line-break"></span>= 0,4 × M + 0,6 × B</div>

Le coefficient retrace **60 % de l’écart entre le marché et la base**. Il conserve donc 40 % de cet écart au-dessus de la base. Avec une base illustrative `B = 7 000` :

| Marché après la vente | Calcul | Cible du mur |
| --- | --- | --- |
| 30 000 | 30 000 − 23 000 × 0,6 | **16 200** |
| 100 000 | 100 000 − 93 000 × 0,6 | **44 200** |
| Retour à 60 000 | 60 000 − 53 000 × 0,6 | **28 200** |

Le troisième calcul repart de **60 000**, même si le marché a précédemment atteint 100 000. Il n’existe pas de cliquet fondé sur le plus haut historique. La cible est recalculée **à chaque vente**, sur le prix laissé par cette vente : il n’y a plus de réserve accumulée puis placée par un appel de maintenance.

## Faites varier le marché

L’exemple ci-dessous garde deux anciens murs à 16,2k et 44,2k, puis calcule la cible du prochain mur. Les valeurs utilisent une même unité de capitalisation, avec une base illustrative de 7 000. Ce schéma ne simule ni l’absorption, ni les soldes, ni une transaction.

<section class="wall-lab" aria-label="Calculateur pédagogique de cible">
  <header><span>LA CIBLE APRÈS LA VENTE</span><span>BASE FIXE : 7 000</span></header>
  <div class="wall-controls">
    <label for="market-cap">Marché après la vente <output id="market-value" for="market-cap">60 000 unités</output></label>
    <input id="market-cap" type="range" min="7000" max="120000" step="1000" value="60000">
    <div class="wall-presets"><button type="button" data-market-preset="30000">30k</button><button type="button" data-market-preset="100000">100k</button><button type="button" data-market-preset="60000">Retour à 60k</button></div>
  </div>
  <div class="wall-levels" aria-label="Comparaison des niveaux de capitalisation">
    <div class="level-row"><span>Ancien mur A</span><div class="level-track"><i style="width:13.5%"></i></div><b>16,2k</b></div>
    <div class="level-row"><span>Ancien mur B</span><div class="level-track"><i style="width:36.833%"></i></div><b>44,2k</b></div>
    <div class="level-row new-target"><span>Nouvelle cible</span><div class="level-track"><i id="lab-target-bar" style="width:23.5%"></i></div><b id="lab-target-label">28,2k</b></div>
    <div class="level-row market"><span>Marché actuel</span><div class="level-track"><i id="lab-market-bar" style="width:50%"></i></div><b id="lab-market-label">60k</b></div>
  </div>
  <div class="wall-result" aria-live="polite"><span>Cible du prochain mur</span><strong id="target-value">28 200 unités</strong></div>
  <p class="lab-explanation">Seuls les nouveaux financements suivent la cible courante. Les anciens murs restent à leur tick ; la quantité d’ETH encore disponible à chaque niveau doit être lue séparément.</p>
</section>

## Un mur par tick, jamais déplacé

Une fois placés, les ETH d’un mur restent attachés à son tick. Un marché en hausse ou en baisse ne déplace pas un ancien mur vers la nouvelle cible.

- Un financement dont la cible tombe sur le tick d’un mur existant **épaissit ce mur** au lieu d’en créer un second.
- Une vente peut entamer un mur : une partie de ses ETH rachète alors des CUBIT.
- Un mur seulement entamé **reste en place**. Si le prix remonte, il revend ses CUBIT et se recharge en ETH.
- Un mur **entièrement traversé** est vidé par la vente qui l’a traversé : ses CUBIT partent vers la réserve de récompenses du vault, sans burn, et ses ETH restants retournent aux fonds en attente.

Les identifiants des murs sont permanents. Un index des ticks permet de retrouver les murs touchés par une vente. [Murs traversés et réserve du vault](burn.md).

## Quand la cible n’est pas plaçable

Un mur est une position 100 % ETH : il doit se trouver sous le prix courant. Quand le prix est au prix de lancement ou en dessous, la formule donne une cible égale ou supérieure au marché, qui ne peut pas être financée en ETH pur.

Dans ce cas, le hook pose le mur **1 % sous le prix courant**, arrondi au tick, au lieu de laisser les fonds attendre. Sinon, des fonds accumulés pourraient être placés d’un coup à un prix gonflé par une transaction qui achète juste avant, puis revend ses CUBIT dans ce mur. Le hook décide sur le tick arrondi, pas sur la cible exacte : près du prix de lancement, la cible 40/60 arrondie peut rester juste sous le marché et servir telle quelle, donc plus près que 1 %.

Seuls attendent dans `pendingFloorEth` un montant trop petit pour créer une position, c’est-à-dire une poussière, un éventuel surplus quand le mur visé atteint le plafond de liquidité d’un tick, une limite d’Uniswap v4, et le cas extrême d’un prix tout en haut de la plage de ticks, où aucun mur ne tient sous le prix. Une vente suivante les place. La vente elle-même n’est jamais refusée pour cette raison.

## Les ETH réellement placés

Le hook place tous les ETH en attente, dont les 12 % de chaque vente, dans la position correspondant à la cible. Les ventes suivantes peuvent consommer ces ETH : la réserve de chaque mur est finie. Un mur peut être financé sans attendre une couverture de toute l’offre.

## Du prix de lancement aux ticks

Le contrat travaille en prix ETH par CUBIT : `cible = 0,4 × prix courant + 0,6 × prix de lancement`. Le prix de lancement découle de la **FDV de lancement fixée au déploiement**, divisée par les 21 millions de CUBIT. La nouvelle version retient **3,75 ETH** de FDV ; ce prix reste ensuite figé et ne suit pas le dollar.

Les exemples en unités de cette page appliquent la même formule à une capitalisation. Leur base de 7 000 est illustrative : ce n’est pas une conversion des 3,75 ETH retenus.

Les ticks arrondissent ensuite le niveau exécutable. ETH est `currency0`, donc **un prix CUBIT plus haut correspond à un tick de pool plus bas**. La cible mathématique, le tick effectivement placé et le prix net d’une vente peuvent être différents.

## Ce que l’interface doit montrer

Une interface doit distinguer le marché courant, la bande, la prochaine cible, chaque mur actif et sa profondeur, ainsi que les ETH et les CUBIT en attente. Une seule ligne « floor » ne résume pas l’ensemble du carnet.

La référence historique `floorPrice` décrit le **dernier mur financé**, qui peut être plus bas que le précédent. Elle ne doit pas être interprétée comme un minimum global garanti. [Lire les données du dapp](../utiliser/preuves.md).

<p class="source-note">Sources : décisions de design du 14 septembre 2026, <code>BandLib.retracementWallTarget</code>, <code>underMarketWallTarget</code>, <code>WALL_RETRACEMENT_BPS</code>, <code>WallLib.fund</code> et <code>CubitHook._placeWall</code>.</p>
