---
description: "Définitions des termes du guide CUBIT : bande, mur, cible, réserve de récompenses, tick, hook et claim."
section: "05 / VÉRIFIER"
reading: "LE VOCABULAIRE DU PROTOCOLE"
search:
  keywords: [glossaire, definition, définition, vocabulaire, termes]
---

# Glossaire

| Terme | Définition dans CUBIT |
| --- | --- |
| ABI | Description des fonctions, événements et types permettant de communiquer avec un contrat |
| Achat du déployeur | Achat de 0,1 ETH inclus dans la transaction de lancement, taxé 3 % et non verrouillé |
| Adresse équipe | Adresse figée qui reçoit la part équipe des taxes et peut remplacer à tout moment, sans délai, puis activer les modules du registre ; ses pouvoirs sont permanents |
| Approval | Autorisation ERC-20 accordée à une adresse de spender pour un montant |
| Bande | Position unique de trading posée au lancement avec 80 % de l’offre, couvrant tous les prix au-dessus du prix de lancement et jamais retirée |
| Burn | Destruction de tokens ; la nouvelle version ne brûle plus les CUBIT des murs, seulement la poussière d’arrondi du lancement |
| Cible | Niveau calculé à chaque vente, sur le prix après la vente, pour placer un mur : 0,4 × prix courant + 0,6 × prix de lancement ; au prix de lancement ou en dessous, le mur est posé 1 % sous le prix courant |
| Claim ERC-6909 | Unité de comptabilité détenue dans le PoolManager pour régler ou conserver des actifs |
| Claim de récompense | Appel qui réclame une récompense acquise ; usage distinct du mot claim ERC-6909 |
| Courbe x·y=k | Courbe à produit constant suivie par les achats et les ventes dans la bande |
| CUBIT détenus | Offre en circulation moins les CUBIT que la bande n’a pas encore vendus : ce que détiennent les holders, CUBIT stakés compris |
| Deadline | Timestamp maximal accepté pour une opération ou une signature |
| Exact-input | Swap dont l’entrée est fixée et la sortie protégée par un minimum |
| Exact-output | Swap dont la sortie est fixée et l’entrée protégée par un maximum |
| FDV de lancement | Capitalisation pleinement diluée qui fixe le prix de lancement ; 3,75 ETH retenus pour la nouvelle version |
| Fee LP | Commission du pool, distincte des taxes du hook |
| Floor | Nom historique utilisé dans le code ; lire les murs et la cible séparément |
| Hook | Contrat branché aux opérations Uniswap v4, qui applique ici la mécanique CUBIT ; il n’a aucun administrateur |
| Idle ETH | ETH comptabilisés hors de toute position ; leur compartiment doit être précisé |
| Lens | Contrat de lecture qui dérive des chiffres à partir du hook et du pool |
| Liquidité / profondeur | Actifs réellement disponibles dans des positions, selon leur état et le prix |
| Meilleur mur | Mur actif le plus proche du marché, le premier qu’une vente rencontre ; le Lens donne son prix brut et son prix net de frais et de taxe |
| Mur | Position LP financée en ETH par les ventes, à un tick fixe ; un seul mur par tick |
| Mur entamé | Mur dont une partie des ETH a racheté des CUBIT ; il reste en place |
| Mur traversé | Mur entièrement converti en CUBIT par les ventes ; la vente qui l’a traversé le vide au profit de la réserve du vault |
| Offre en circulation | Offre totale moins les CUBIT des murs, ceux qui attendent leur envoi et la réserve de récompenses de tous les vaults enregistrés ; les CUBIT stakés restent en circulation |
| Pending absorbed tokens | CUBIT des murs traversés, isolés dans le hook jusqu’à leur envoi par `deliverAbsorbed()` |
| Pending floor ETH | Fonds des murs en attente de placement : 12 % des ventes et ETH libérés par les murs traversés, placés par la même vente ; seuls y restent une poussière trop petite pour créer une position et le cas extrême d’un prix tout en haut de la plage de ticks |
| Permissionless | Appel ouvert à tous, soumis aux conditions déterministes du contrat |
| PoolId | Identifiant dérivé de l’ensemble de la PoolKey |
| Prix de lancement | Prix ETH par CUBIT figé au déploiement : FDV de lancement divisée par 21 millions |
| Registre V2 | Contrat qui conserve les modules courants, leur révision, les fonctionnalités ouvertes et l’historique des vaults |
| Réserve de récompenses | CUBIT détenus par le vault pour payer les déposants : 20 % de l’offre au lancement, puis les CUBIT des murs traversés |
| Slippage | Écart d’exécution accepté par rapport à une cotation, borné par les limites du swap |
| Snapshot | Ensemble cohérent de données lues à un bloc donné |
| Tick | Unité discrète de prix du pool ; son orientation est inversée par rapport au prix ETH/CUBIT |
| V1 / V2 | Cœur du marché / fonctionnalités additionnelles de la roadmap |
| Vault de gouvernance | Vault du launchpad qui reçoit les fees de lancement de la Forge, en ETH, jamais remboursés au lanceur, et les tokens des murs des enfants Forge ; chaque dépôt est bloqué 30 jours, plus l’allongement éventuel, puis seul son déployeur peut réclamer, pour toujours et sans transfert possible de ce droit ; ce déployeur peut allonger le blocage, jamais le raccourcir |

Pour les unités et les méthodes de contrats, voir [l’intégration](developper/integration.md).
