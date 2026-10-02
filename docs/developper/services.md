---
description: "Exploiter le relais d’événements : dry-run, curseurs, révisions des modules et vocabulaire des murs ; le keeper n’a plus d’usage."
section: "04 / CONSTRUIRE"
reading: "4 MIN DE LECTURE"
---

# Services et exploitation

Le dépôt contient deux processus Node : un **keeper**, qui appartient à l’ancien modèle, et un **relais d’événements** qui peut préparer des publications. Une configuration locale ne prouve pas qu’un service tourne en continu.

## Plus de keeper dans la nouvelle version

L’ancien keeper appelait `rebalance`, `raiseFloor` et le burn des tokens absorbés. Ces fonctions de maintenance ont disparu : la bande n’est jamais réorganisée, les murs sont posés et vidés pendant les ventes, et le routeur CUBIT envoie les CUBIT absorbés vers le vault.

Le service `services/keeper` reste dans le dépôt, mais il n’a plus de raison d’être et ne doit pas être exploité contre la nouvelle version. Aucune prime n’est versée : si des CUBIT absorbés restent en attente, par exemple après une vente passée par un autre routeur, n’importe quel compte peut appeler `deliverAbsorbed()`.

## Le relais d’événements

`services/floor-bot` lit les événements, prépare un texte et conserve un curseur ainsi que les clés de déduplication `transactionHash:logIndex`.

Le mode dry-run et le mode publication ont des états séparés. Les curseurs incluent le contexte de chaîne et de hook ; les blocs finalisés sont utilisés sur les réseaux prévus par le service. Une réorganisation ou un checkpoint incohérent doit être réconcilié avant reprise.

Le relais persiste un `pendingPost` avant publication. Si le service externe accepte le message mais que le processus s’arrête avant l’enregistrement du succès, il faut vérifier l’existence du message avant de relancer : une base locale et un réseau social ne peuvent pas committer ensemble.

Le GitBook n’exécute aucune publication. La mise en service réelle du relais relève d’une configuration et d’une autorisation opérationnelles distinctes.

## Évolution des modules

Le Lens courant est résolu depuis le registre. Conservez l’identité du cœur et le contexte de révision pendant toute l’opération.

Les services lisent les ABI et les événements de la version décrite. Un relais adapté à l’ancien modèle ne doit pas être présenté comme validé pour la nouvelle version sans sa recette.

## Adapter le vocabulaire aux murs

L’ancien relais annonçait des événements `FloorRaised`, qui n’existent plus. Dans la nouvelle version, un mur peut être créé ou épaissi à chaque vente (`WallFunded`), parfois à un prix inférieur au mur précédent, et un mur entièrement traversé est vidé (`WallAbsorbed`) avant que ses CUBIT partent vers la réserve du vault (`AbsorbedDelivered`).

Le relais doit donc citer le **mur concerné, son niveau et les fonds ajoutés ou absorbés**, sans déduire une hausse globale du nom d’un événement. Les anciens messages « le floor monte toujours » ne décrivent pas cette politique, et aucune annonce ne doit présenter les murs comme une garantie de prix.

## Contrôles d’exploitation utiles

Suivez les erreurs RPC, les écarts de configuration, les curseurs, l’âge du dernier bloc traité et les publications en attente. Conservez les journaux de reprise et les identités de version, sans données de signature privées.

Une supervision qui redémarre les processus ne remplace pas la résolution d’un checkpoint incohérent ou d’un changement de registre.

<p class="source-note">Sources : <code>services/floor-bot/README.md</code>, <code>services/keeper/README.md</code>, <code>services/shared</code>, <code>interfaces/ICubitHook.sol</code> et <code>contracts/docs/REDESIGN_HANDOFF.md</code>.</p>
