---
description: "Réponses aux questions fréquentes sur la bande, les murs financés à chaque vente, les frais, le Vault, les permissions et les versions."
section: "05 / VÉRIFIER"
reading: "LES RÉPONSES RAPIDES"
---

# Questions fréquentes

## Un mur, concrètement, c’est quoi ?

Une position de liquidité financée en ETH dans le pool, à un tick déterminé sous le prix courant. La formule choisit son emplacement et les 12 % des ventes déterminent sa taille.

## Qu’est-ce que la bande ?

La position unique de trading : 80 % de l’offre, posée au lancement, qui couvre tous les prix au-dessus du prix de lancement et n’est jamais retirée. Achats et ventes suivent sa courbe x·y=k. [La bande de liquidité](comprendre/ladder.md).

## La cible suit-elle le plus haut historique ?

Non. Elle utilise le prix laissé par chaque vente : `0,4 × prix courant + 0,6 × prix de lancement`. Pour une base illustrative de 7 000, un retour de 100k à 60k donne **28,2k**. [Voir le calcul](comprendre/murs.md).

## Les anciens murs descendent-ils avec la nouvelle cible ?

Non. Un mur reste à son tick. Un financement qui tombe sur le même tick l’épaissit ; une vente peut toutefois consommer ses ETH.

## Les 12 % sont-ils placés à chaque vente ?

Oui : chaque vente place les ETH en attente, dont ses 12 %, dans un mur à la cible calculée sur le prix après la vente. Au prix de lancement ou en dessous, cette cible serait au-dessus du marché : le mur est alors posé 1 % sous le prix courant. Seuls une poussière trop petite pour créer une position et le cas extrême d’un prix tout en haut de la plage de ticks attendent une vente suivante.

## Les frais LP sont-ils compris dans les 15 % ?

Non. Les 15 % sont la taxe du hook à la vente ; la taxe d’achat est de 3 %. Le taux LP de la nouvelle version est 0,01 %, avec une base de calcul propre au pool. Le pool Ethereum raccordé applique ce même taux. [Détail des frais](comprendre/taxes.md).

## Que devient un mur traversé ?

Un mur seulement entamé reste en place et se recharge en ETH si le prix remonte. Un mur entièrement traversé est vidé par la vente qui l’a traversé : ses CUBIT rejoignent la réserve de récompenses du vault. [Voir l’explication](comprendre/burn.md).

## Une vente peut-elle traverser un nombre illimité de murs ?

Non. Chaque mur traversé coûte environ 185 000 gas, et une transaction est limitée à 16 777 216 gas : une vente traverse au plus environ 88 murs. Au-delà, elle échoue sans perte et doit être découpée. [Risques et limites](securite/risques.md).

## CUBIT est-il déflationniste ?

Plus dans la nouvelle version. L’offre reste fixée à 21 millions sans mint, mais les CUBIT rachetés par les murs ne sont plus brûlés : ils alimentent la réserve de récompenses du vault.

## Faut-il encore des keepers ?

Non. `rebalance` et `raiseFloor` sont supprimés, et les murs sont posés et vidés pendant les ventes. Aucune prime n’est versée à un appelant.

## Quelqu’un peut-il bloquer les ventes ?

Non. Le hook n’a aucun administrateur, et personne ne peut mettre en pause les swaps ni le mécanisme des murs.

## L’équipe garde-t-elle des pouvoirs ?

Oui, de façon permanente. L’adresse équipe reçoit la part équipe des taxes et peut remplacer à tout moment, sans délai, les modules périphériques du registre, puis les activer. Ces remplacements ne touchent ni le cœur ni les soldes déjà présents dans les vaults. [Les permissions](securite/permissions.md).

## Les fonctions V2 sont-elles disponibles ?

Oui : Momentum et la Forge depuis le 23 septembre 2026, le Vault depuis le 26 septembre 2026. [Les fonctionnalités V2](v2/prochaines-fonctionnalites.md).

## Que se passe-t-il si je ne réclame pas ma récompense chaque jour ?

Le montant réclamable plafonne à une journée, soit 3 % du dépôt. Au-delà de 24 heures sans réclamation, l’excédent est perdu. La récompense est aussi limitée par le solde de la réserve.

## Un nouveau dépôt prolonge-t-il le lock du Vault ?

Oui. Un dépôt supplémentaire relance le lock de 24 h de toute la position de ce wallet dans ce contrat. La récompense acquise peut être réclamée indépendamment du lock de retrait.

## Que deviennent mes fonds si le Vault est remplacé ?

Ils restent dans l’ancien Vault, avec sa réserve de récompenses et votre date de déblocage. Sélectionnez cet ancien contrat pour lire votre position et effectuer ses sorties. Les fonds ne sont pas transférés automatiquement au nouveau module.

## Où vont les tokens absorbés par les murs d’un enfant Forge ?

Au vault de gouvernance du launchpad, qui reçoit aussi les fees de lancement de la Forge, en ETH. Chaque dépôt y est bloqué 30 jours à partir de sa comptabilisation — immédiate pour un dépôt ou un fee de lancement, à l’appel de `lockUntracked` pour des tokens envoyés directement —, plus l’allongement éventuel, puis seul le déployeur de ce vault peut le réclamer : ce droit est définitif et ne peut pas être transféré. Ce déployeur peut allonger le blocage, jamais le raccourcir. [Momentum et Forge](v2/momentum-forge.md).

## Qui peut lancer un token sur la Forge ?

N’importe quel compte, en payant le fee de lancement exact de 0,005 ETH, versé au vault de gouvernance et jamais remboursé. La Forge ne faisait pas partie du lancement de CUBIT : l’équipe a ajouté le launchpad et l’a ouvert le 23 septembre 2026. [Momentum et Forge](v2/momentum-forge.md).
