---
description: "Le parcours d’achat et de vente CUBIT : version du pool, cotation nette, slippage, approvals et reçu de transaction."
section: "02 / UTILISER"
reading: "5 MIN DE LECTURE"
---

# Acheter et vendre

Le dapp propose un échange ETH/CUBIT via le routeur du déploiement sélectionné. Les taxes sont appliquées dans le hook ; le montant estimé à recevoir doit déjà être net des taxes incluses dans la cotation.

> Le dapp raccordé à Ethereum utilise la version actuelle, à **0,01 % de frais LP**, et lit l’ABI de cette version. Tant que le marché n’est pas ouvert, aucun échange n’est possible. Une démonstration ou un mode simulation n’est pas un état on-chain.

## Avant de préparer un swap

Vérifiez le réseau du wallet, le déploiement affiché et le bloc des données. Prévoyez des ETH pour le gas en plus du montant à échanger. Le dapp doit signaler un RPC indisponible ou des données périmées et empêcher une signature fondée sur un état non vérifié.

Un changement de compte, de réseau, de montant ou d’adresse de routeur exige une nouvelle cotation. Les adresses périphériques peuvent changer via le registre V2.

## Acheter des CUBIT

1. Choisissez un montant d’ETH. En exact-input, la taxe d’achat de 3 % est comprise dans ce montant.
2. Lisez le nombre net de CUBIT estimé, les frais et le minimum reçu fixé par la tolérance de slippage.
3. Vérifiez la simulation et les détails présentés par le wallet, puis signez.
4. Attendez un reçu réussi et le rafraîchissement des balances on-chain.

L’achat utilise des ETH natifs via `msg.value`. Le routeur CUBIT n’utilise pas Permit2 pour ce parcours. Dans la nouvelle version, un achat retire des CUBIT de la bande en suivant sa courbe x·y=k.

## Vendre des CUBIT

La vente peut nécessiter une **approval ERC-20** permettant au routeur de transférer la quantité de CUBIT choisie. Le frontend prépare une autorisation du montant demandé.

Après confirmation de l’approval, le dapp revérifie le compte, le réseau, la révision du registre et la fraîcheur de la cotation avant le swap. L’approval et la vente sont deux transactions distinctes lorsque l’autorisation était insuffisante.

La vente retourne des ETH nets de la taxe de 15 % : 12 % des ETH bruts financent les murs et 3 % reviennent à l’équipe. Dans la nouvelle version, la vente vide les murs qu’elle traverse entièrement et place les ETH en attente dans un mur ; le routeur CUBIT envoie ensuite les CUBIT absorbés vers la réserve du vault.

## Le minimum reçu et la date limite

Le **slippage** borne l’écart accepté par rapport à la cotation. Une taxe déjà incluse dans la cotation n’est pas une raison d’ajouter arbitrairement 15 points de slippage.

Dans les sources du frontend lues, une cotation est fraîche pendant **30 secondes**. La date limite de transaction est calculée à partir du timestamp de la chaîne. Ces contrôles peuvent empêcher la signature après une longue attente d’approval ; il faut alors revoir une cotation fraîche.

Une transaction refusée par les limites protège le montant minimum ou maximum convenu. Son échec ne signifie pas qu’il faut supprimer cette limite.

## Si la transaction ne passe pas

| Situation | Action utile |
| --- | --- |
| Mauvais réseau ou compte modifié | Revenir au contexte voulu et demander une nouvelle cotation |
| Cotation expirée | Recalculer le montant net et le minimum reçu |
| Routeur ou révision modifiés | Revoir l’adresse courante et la nouvelle action ; l’ancienne approval reste attachée à l’ancien spender |
| Liquidité insuffisante | Vérifier une cotation pour un montant plus faible et les positions présentes |
| Vente qui traverse de très nombreux murs | Découper la vente : au-delà d’environ 88 murs traversés, elle dépasse la limite de gas d’une transaction |
| RPC indisponible | Attendre une lecture on-chain valide avant de signer |
| Transaction déjà envoyée | Vérifier le hash et le reçu avant d’en préparer une autre |

Le routeur rejette une entrée non entièrement consommée et une sortie exacte non entièrement servie. Les fonds dépensés pour une transaction qui revient en arrière sont annulés par l’EVM, hors gas.

## Contrôler le résultat

Un hash signifie que la transaction a été soumise ; seul le reçu renseigne sa réussite. Vérifiez le réseau de l’explorateur, le statut, le destinataire et les événements `BuyTaxed` ou `SellTaxed`.

Les prix de référence des murs ne remplacent pas la cotation d’un ordre donné. [Lire les données du dapp](preuves.md).

<p class="source-note">Sources : <code>dapp/src/chain/swap.ts</code>, <code>executeSwap.ts</code>, <code>deployment.ts</code> et <code>contracts/src/periphery/CubitRouter.sol</code>. La recette wallet navigateur/mobile reste distincte des tests automatisés.</p>
