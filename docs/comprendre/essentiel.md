---
description: "Les notions essentielles : token CUBIT, hook Uniswap v4, bande de liquidité et murs financés en ETH à chaque vente."
section: "01 / COMPRENDRE"
reading: "5 MIN DE LECTURE"
---

# CUBIT en 5 minutes

CUBIT est un token ERC-20 associé à un marché ETH/CUBIT sur Uniswap v4. Le protocole apporte lui-même la liquidité de son pool : son **hook** en est l’unique fournisseur et applique les taxes suivant les règles du contrat.

L’offre est fixée à **21 millions de CUBIT**, créés une seule fois. Il n’existe pas de fonction permettant d’en créer d’autres. Dans la nouvelle version, les CUBIT rachetés par les murs **ne sont plus brûlés** : ils rejoignent la réserve de récompenses du vault.

> Cette page décrit la nouvelle version. Consultez [l’état des versions](../securite/etat.md).

## Les deux livres du marché

| Livre | Rôle | Ce qui peut changer |
| --- | --- | --- |
| Bande | Une seule position large, posée au lancement avec 80 % de l’offre ; elle vend des CUBIT aux acheteurs et en rachète aux vendeurs | Sa répartition entre CUBIT et ETH suit le prix ; la position n’est jamais retirée |
| Murs | Des positions en ETH placées sous le prix courant et financées par les ventes | Leur contenu change quand le prix les traverse ; leur tick ne change jamais |

Les soldes de l’équipe et la réserve de récompenses du vault sont comptabilisés séparément. Un solde total ne suffit donc pas à décrire les ETH réellement disponibles dans les murs.

## Ce que financent les swaps

Pour **1 ETH d’achat exact-input**, hors gas :

- **0,97 ETH** entre dans la jambe du swap vers le pool, avant ses propres frais LP.
- **0,03 ETH** revient au compartiment équipe.

Pour une **vente produisant 1 ETH brut**, **0,85 ETH** revient au vendeur, **0,12 ETH** finance les murs et **0,03 ETH** revient à l’équipe. Le gas est payé séparément.

La nouvelle version vise **0,01 % de frais LP**. Cette commission du pool est distincte des taxes de 3 % à l’achat et 15 % à la vente. [Voir les taxes en détail](taxes.md).

## Comment les murs apparaissent

À **chaque vente**, le hook vide d’abord les murs que le prix a entièrement traversés, puis place les ETH en attente, dont les 12 % de la vente, dans un mur à la cible `0,4 × prix courant + 0,6 × prix de lancement`, calculée sur le prix après la vente et arrondie au tick. Deux financements qui tombent sur le même tick s’additionnent dans un seul mur. Aucun mur n’est déplacé ensuite.

Au prix de lancement ou en dessous, cette cible serait au-dessus du marché : le mur est alors posé 1 % sous le prix courant, au lieu de laisser les fonds attendre une vente suivante. Aucun appel de maintenance n’est nécessaire : la création et le vidage des murs font partie de la vente.

**La formule choisit l’emplacement du mur ; les ventes déterminent sa taille.** Un niveau affiché ne prouve pas que tous les détenteurs pourraient vendre à ce niveau. [La cible et les murs fixes](murs.md).

## Ce qui se passe au lancement

Le lancement se fait en une seule transaction :

- **80 % de l’offre**, soit 16,8 millions de CUBIT, sont déposés dans la bande ;
- **20 %**, soit 4,2 millions de CUBIT, alimentent la réserve de récompenses du vault ;
- le déployeur effectue un **achat de 0,1 ETH**, taxé 3 % comme tout achat, dont les CUBIT ne sont pas verrouillés.

Il n’y a ni airdrop ni allocation d’équipe. [La bande de liquidité](ladder.md).

## V1 et V2

La **V1** est le marché : token, hook, bande, murs et swaps. La **V2** ajoute Vault, Momentum et Forge, que l’équipe ouvre quand elle le décide : Momentum et la Forge sont ouverts depuis le 23 septembre 2026, le Vault depuis le 26 septembre 2026.

L’adresse équipe reçoit la part équipe des taxes et remplace puis active les modules périphériques compatibles du registre ; ces pouvoirs sont permanents. Le hook n’a aucun administrateur : personne ne peut mettre en pause les swaps ni le mécanisme des murs, et le cœur du pool conserve ses propres identités fixes.

Les prochaines étapes figurent dans la [roadmap](../roadmap.md).

<p class="source-note">Sources du dépôt : <code>contracts/src/CubitToken.sol</code>, <code>CubitHook.sol</code>, <code>periphery/CubitV2.sol</code> et les décisions de design du 14 septembre 2026 consignées dans <code>contracts/docs/REDESIGN_HANDOFF.md</code>.</p>
