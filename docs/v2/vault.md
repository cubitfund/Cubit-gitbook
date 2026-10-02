---
description: "Dépôt CUBIT non transférable, lock de 24 h et récompense de 3 % par jour en CUBIT, payée uniquement par une réserve et plafonnée à une journée."
section: "03 / LES MODULES V2"
reading: "5 MIN DE LECTURE"
search:
  keywords: [vault, staking, stake, verrouillage, lock, retrait, recompense, récompense, reserve, réserve, claim, mCUBIT]
---

# mCUBIT Vault

Le Vault permet de déposer des CUBIT dans une position **non transférable** et de recevoir une récompense **en CUBIT**. Son modèle ne crée pas de CUBIT et ne donne aucun droit sur les fonds des murs.

Le nom mCUBIT désigne cette expérience de dépôt ; le code ne crée pas de token de reçu ERC-20 librement transférable.

> **Ouvert sur Ethereum depuis le 26 septembre 2026.**

## D’où vient la récompense

La récompense est payée **uniquement depuis la réserve de récompenses** du Vault, jamais depuis le principal déposé. Cette réserve est alimentée par :

- les **20 % de l’offre**, soit 4,2 millions de CUBIT, versés au lancement ;
- les **CUBIT des murs entièrement traversés**, envoyés par `deliverAbsorbed()` après les ventes ;
- tout apport volontaire : n’importe quel compte peut ajouter des CUBIT à la réserve avec `fundRewardReserve(amount)`.

La réserve est finie : lorsqu’elle est vide, les récompenses s’arrêtent. **La récompense est uniquement en CUBIT**, réclamée avec `claimCubit()`, et aucun rendement n’est garanti.

## Le taux et son plafond

La récompense vaut **3 % du dépôt par jour**, calculée au prorata du temps écoulé depuis la dernière réclamation.

Le montant réclamable est **plafonné à une journée** : après 24 heures sans réclamation, il n’augmente plus. Pour recevoir la récompense complète, il faut réclamer chaque jour ; **l’excédent non réclamé est perdu**.

| Temps depuis la dernière réclamation | Montant réclamable pour 1 000 CUBIT déposés |
| --- | --- |
| 12 heures | 15 CUBIT |
| 24 heures | 30 CUBIT |
| 48 heures | 30 CUBIT : la seconde journée est perdue |

Ces montants supposent une réserve suffisante. Si la réserve contient moins que le montant dû, seul son solde est versé.

## Déposer des CUBIT

1. Vérifiez l’adresse du Vault proposé et son raccordement au protocole.
2. Autorisez le Vault à transférer le montant choisi.
3. Appelez `stake(amount)` et attendez la confirmation.
4. Lisez `balanceOf(account)`, `unlockAt(account)` et `pendingCubit(account)` sur le contrat de dépôt.

**Chaque dépôt supplémentaire relance le lock de 24 h pour toute la position de ce wallet dans ce Vault.** Il verse aussi la récompense acquise jusque-là et redémarre la journée de décompte.

Les CUBIT déposés demeurent des tokens existants. Un dépôt n’est ni un burn ni une diminution de l’offre.

## Réclamer et retirer

`claimCubit()` verse la récompense acquise et redémarre la journée de décompte. Le lock de retrait ne bloque pas cette réclamation.

`withdraw(amount)` rend les CUBIT déposés lorsque le timestamp de la chaîne atteint `unlockAt`. Le retrait peut être partiel ; il verse d’abord la récompense acquise.

Personne ne peut suspendre ces sorties. Elles restent soumises aux règles et au bon fonctionnement du contrat qui détient la position.

## Si le Vault est remplacé

L’équipe peut remplacer le Vault à tout moment, sans délai. Le remplacement concerne le contrat proposé pour les nouveaux dépôts et celui qui reçoit les CUBIT absorbés envoyés ensuite. **Les CUBIT déposés, la réserve de récompenses et les dates de déblocage déjà inscrits restent dans l’ancien Vault.** Le remplacement ne déplace pas les fonds de l’utilisateur.

Le registre conserve la liste des Vaults successifs. Vérifiez l’adresse sélectionnée avant de lire un solde, de réclamer ou de retirer. Une approval du Vault précédent n’autorise pas le nouveau.

Le registre exige un nouveau Vault raccordé au même hook et au même token, sans stake. Le remplacement désactive le Vault : le nouveau contrat n’accepte des dépôts qu’après sa réactivation.

## Les limites du module

La récompense dépend du solde de la réserve : un taux de 3 % par jour peut l’épuiser, et les versements s’arrêtent alors. Les contrôles de remplacement vérifient la compatibilité déclarée des adresses ; ils ne prouvent pas la sécurité de tout code de remplacement. La comptabilité de la réserve, le plafond d’une journée, l’arrivée des CUBIT des murs et les sorties des anciens Vaults doivent être validés pour chaque release.

<p class="source-note">Sources : <code>periphery/CubitVault.sol</code> (<code>pendingCubit</code>, <code>claimCubit</code>, <code>fundRewardReserve</code>, <code>DAILY_REWARD_BPS</code>, <code>REWARD_PERIOD</code>, <code>LOCK_DURATION</code>), <code>CubitHook.deliverAbsorbed</code>, <code>CubitV2.setVault</code> et les décisions de design du 14 septembre 2026.</p>
