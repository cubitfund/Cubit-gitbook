---
description: "Ce que devient un mur atteint par les ventes : entamé, il reste en place ; entièrement traversé, il est vidé et ses CUBIT rejoignent la réserve de récompenses du vault, sans burn."
section: "01 / COMPRENDRE"
reading: "4 MIN DE LECTURE"
search:
  keywords: [absorption, traversé, traverse, entamé, reserve, réserve, vault, recompenses, récompenses, burn, destruction, gouvernance, deliverAbsorbed]
---

# Murs traversés et réserve du vault

Lorsqu’une vente atteint un mur, les ETH de ce mur rachètent des CUBIT. Dans la nouvelle version, ces CUBIT **ne sont plus brûlés** : ceux d’un mur entièrement traversé rejoignent la **réserve de récompenses du vault**.

## Entamé ou entièrement traversé

| État du mur | Ce qui se passe |
| --- | --- |
| Non atteint | Le mur ne contient que des ETH, à son tick |
| Entamé | Une partie de ses ETH a racheté des CUBIT ; le mur reste en place |
| Prix remonté après un mur entamé | Le mur revend ses CUBIT et se recharge en ETH |
| Entièrement traversé | Le mur ne contient plus que des CUBIT ; la vente qui l’a traversé le vide, ses CUBIT attendent leur envoi et ses ETH restants retournent à `pendingFloorEth` |

Un mur n’est vidé qu’une fois **entièrement traversé**. Tant qu’il n’est qu’entamé, le hook n’y touche pas : il continue de fonctionner comme une position LP ordinaire à son tick. Une même vente vide tous les murs qu’elle a entièrement traversés, du plus proche au plus lointain.

## Le chemin des CUBIT

```text
Une vente traverse entièrement un mur
    → la vente vide le mur
    → ses CUBIT attendent dans pendingAbsorbedTokens
    → deliverAbsorbed() les envoie à la réserve de récompenses du vault
```

Le routeur CUBIT appelle `deliverAbsorbed()` à la fin de chaque vente, dans la même transaction. Si cet envoi échoue, la vente n’est pas bloquée : les CUBIT restent isolés dans le hook. Après une vente passée par un autre routeur, ou après un envoi raté, n’importe quel compte peut appeler `deliverAbsorbed()`, sans choisir ni destinataire ni montant. La réserve paie ensuite la récompense quotidienne des déposants du vault. [mCUBIT Vault](../v2/vault.md).

## L’offre ne diminue plus

L’offre reste fixée à **21 millions de CUBIT**, sans mint. Comme les CUBIT des murs ne sont plus détruits, elle ne diminue plus au fil des absorptions : CUBIT n’est plus présenté comme déflationniste. Seule la poussière d’arrondi du dépôt initial, négligeable, est brûlée au lancement.

Les CUBIT versés en récompenses depuis la réserve sont des tokens ordinaires : leurs bénéficiaires peuvent les conserver, les déposer ou les vendre.

## Les enfants Forge

Pour un marché enfant créé par la Forge, les tokens des murs vidés ne vont pas vers un vault de staking : `deliverAbsorbed()` les envoie au **vault de gouvernance du launchpad**, dont l’adresse est fixée dans la Forge qui a déployé le token enfant. Chaque dépôt y reste bloqué 30 jours à partir de sa propre réception, et seul le déployeur de ce vault peut les réclamer. [Momentum et Forge](../v2/momentum-forge.md).

## Ce que l’absorption ne garantit pas

Un mur qui absorbe une vente dépense ses ETH. Un mur entamé ne se recharge en ETH que si le prix remonte au-dessus de lui ; un mur vidé ne retrouve de la profondeur que si un nouveau financement tombe sur son tick.

Les preuves de l’ancien burn strict ne valident pas ce nouveau chemin. Il tourne sur Ethereum depuis le 22 septembre 2026. [Voir les limites connues](../securite/risques.md).

## Vérifier les mouvements

Pour suivre une absorption, rapprochez les événements du hook : `WallAbsorbed(id, cubit, ethRemaining)` pour chaque mur vidé, `TokensAbsorbed(amount, pendingAbsorbedTokens)` pour le total mis en attente, puis `AbsorbedDelivered(sink, amount)` à l’envoi. Côté destination, le vault émet `RewardReserveFunded` ; pour un enfant Forge, le vault de gouvernance émet `Deposited`.

<p class="source-note">Sources : décisions de design du 14 septembre 2026, <code>CubitHook._collectCrossedWalls</code>, <code>deliverAbsorbed</code>, <code>absorbedTokenSink</code>, <code>WallLib.collectCrossed</code>, <code>CubitRouter._finishSwap</code>, <code>CubitVault.fundRewardReserve</code> et <code>periphery/CubitGovernanceVault.sol</code>.</p>
