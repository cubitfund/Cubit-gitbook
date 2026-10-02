---
description: "Distinguer marché, bande, cible, murs, fonds en attente et données on-chain dans le dashboard CUBIT."
section: "02 / UTILISER"
reading: "4 MIN DE LECTURE"
search:
  keywords: [proof, preuves, dashboard, donnees, données, floor, simulation, profondeur, bande]
---

# Lire les données du dapp

La page Proof sert à rapprocher les chiffres affichés des états et des événements du protocole. Commencez par le **réseau, le déploiement, la version et le bloc de lecture** avant d’interpréter un montant.

> Le dapp public lit le déploiement Ethereum en service et son ABI. Les données ci-dessous décrivent ce qu’une interface doit distinguer.

## Les chiffres à distinguer

| Donnée | Ce qu’elle décrit |
| --- | --- |
| Prix du marché | Prix courant du pool, distinct du résultat net pour une quantité précise |
| ETH de la bande | ETH réellement détenus par la bande au prix courant, apportés par les acheteurs |
| CUBIT de la bande | CUBIT que la bande propose encore à l’achat |
| Cible du prochain mur | Niveau calculé avec le prix courant, distinct d’une position financée |
| Murs actifs | Positions déjà financées, chacune avec son ID, son tick et sa liquidité restante |
| ETH en attente | Fonds des murs restés non placés : poussière trop petite pour créer une position, ou prix tout en haut de la plage de ticks |
| CUBIT en attente d’envoi | CUBIT des murs traversés, isolés dans le hook jusqu’à leur envoi au vault |
| Réserve de récompenses | CUBIT détenus par le vault pour payer les déposants, distincts des dépôts |
| Offre en circulation | Offre totale moins les CUBIT des murs, ceux qui attendent leur envoi et la réserve de récompenses des vaults ; les CUBIT déposés dans le vault restent en circulation |

Le niveau d’un mur et ses ETH restants doivent être lus ensemble. Les ETH de la bande et ceux des murs appartiennent à deux livres distincts.

## Ce qui change avec la nouvelle version

L’ancienne vue présentait un ladder, un cushion, une file de burn et un écran de maintenance. La nouvelle version les remplace par une bande unique, des murs posés et vidés à chaque vente et une réserve de récompenses dans le vault. Il n’y a plus de page Keepers.

Le nom historique `floorPrice` décrit le dernier mur financé : il ne doit pas être lu comme un minimum global du marché. Un nouveau mur peut être placé plus bas que le précédent lorsque le prix a baissé.

Les nouveaux champs sont détaillés dans [l’intégration](../developper/integration.md). Le dapp raccordé à Ethereum lit les champs de la version actuelle.

## Prix brut, prix net et cotation

Une référence brute représente un niveau de prix de la position. Une référence nette peut intégrer une borne de plage, les frais LP, la taxe de vente et une hypothèse sur les frais de protocole v4.

La vente réelle dépend de la quantité, des positions traversées, des arrondis et du gas. Une référence « net floor » n’est pas le calcul de performance de votre wallet et ne remplace pas une cotation.

## Les modes de données

| Affichage | Interprétation |
| --- | --- |
| On-chain, bloc identifié | Données lues sur le déploiement indiqué |
| Chargement | Première lecture encore incomplète |
| Données périmées ou RPC en panne | Dernier état connu ; pas une autorisation de signer |
| Simulation ou démonstration | Illustration locale du mécanisme |

Pour les futures releases, vérifiez la disponibilité annoncée et les adresses des modules proposés à l’utilisateur.

## Refaire la vérification

Vérifiez les identités du token, du hook et du pool, puis les modules courants du registre et sa `moduleRevision`. Rapprochez les événements du hash de transaction et de leur bloc canonique.

La page Proof permet de suivre les taxes et les murs. Une capture d’écran ou un ancien rapport ne remplace pas cette identification de version. [État réel des versions](../securite/etat.md).

<p class="source-note">Sources : <code>CubitLens.sol</code>, <code>interfaces/ICubitLens.sol</code> et, pour le frontend, <code>dapp/src/chain/snapshot.ts</code>, <code>releases.ts</code> et <code>events.ts</code>.</p>
