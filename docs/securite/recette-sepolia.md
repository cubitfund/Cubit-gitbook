---
description: "Plan de test manuel sur Sepolia pour la nouvelle version : bande, swaps, taxes, murs, vaults, remplacements, refus attendus et fiche de relevé numérotée."
section: "05 / VÉRIFIER"
reading: "PLAN DE TEST NUMÉROTÉ"
search:
  keywords: [recette, test, testnet, Sepolia, manuel, checklist, plan, gravite, gravité, releve, relevé, refus]
---

# Plan de test manuel sur Sepolia

Cette page est une **liste de contrôle exécutable à la main**, sur le réseau de test Sepolia, par une personne équipée d’un wallet. Chaque cas porte un numéro stable de la forme `T-01`, citable dans un rapport.

> **Avant de commencer.** Ce plan porte sur la nouvelle version. Le manifeste public du dépôt décrit le déploiement Sepolia **en service**, à frais LP `100` : ce plan s’y applique. Un cas sans objet sur la version testée se note « hors périmètre version », jamais « échec ».

Les valeurs citées proviennent du code de la nouvelle version, sous `contracts/src/`, et des décisions de design du 14 septembre 2026. Un comportement qui n’a pas pu être établi est marqué **« à confirmer lors du test »**.

## Comment utiliser ce plan

Chaque section présente ses cas dans un tableau à six colonnes. Les deux dernières se remplissent pendant la recette.

| Colonne | Ce qu’on y écrit |
| --- | --- |
| Cas | L’identifiant stable, `T-01` à `T-110` |
| Préconditions | Ce qui doit être vrai avant de commencer |
| Étapes | Les actions, dans l’ordre |
| Résultat attendu | Ce que le code et les décisions prévoient |
| Résultat observé | Ce qui s’est produit, avec le hash de transaction ou le bloc de lecture |
| Gravité | Vide si conforme ; sinon Bloquant, Majeur, Mineur ou Cosmétique |

| Gravité | Critère |
| --- | --- |
| Bloquant | Perte ou blocage de fonds, taxe non prélevée, mur perdu, récompense payée sur le principal |
| Majeur | Comportement contraire aux sources, refus manquant, chiffre affiché faux |
| Mineur | Écart d’affichage sans conséquence sur la chaîne, message imprécis |
| Cosmétique | Typographie, mise en page, libellé |

Une transaction **refusée conformément à un cas de refus est un succès**. Un hash signifie seulement que la transaction a été soumise : seul le reçu renseigne la réussite.

**Certains cas ne passent pas par l’interface.** Dans ses sources actuelles, le dapp lit l’ABI de la version en service et n’expose ni les ordres à sortie exacte, ni `claimTeam()`, ni les lectures détaillées des murs. Ces cas sont marqués « appel direct » : ils s’exécutent avec un outil d’appel de contrat, sur les adresses du manifeste du déploiement testé.

## 1. Préparation

Relevez ces éléments **avant** le premier swap : ils servent de référence à toutes les comparaisons ultérieures.

- Le réseau : Sepolia, identifiant de chaîne `11155111`.
- Les adresses du déploiement testé, lues dans son manifeste : token, hook, PoolManager, `poolId`, routeur, Lens, registre V2, Vault, lanceur ; puis, une fois le launchpad ajouté, vault de gouvernance et Forge. **Ne recopiez aucune clé privée dans vos notes.**
- Les paramètres figés : `fee`, `tickSpacing`, `LAUNCH_ETH`, `MIN_POOL_SUPPLY`, `launchTimestamp`, `moduleRevision`.
- L’état initial : `snapshot()` du Lens, `band()` du hook, `totalSupply()` et `totalBurned()` du token, `pendingFloorEth`, `pendingAbsorbedTokens`, `wallCount()`, `activeWallCount()`, `teamAccrued`, `teamPaidCumulative`, `rewardReserve()` du Vault, et le **numéro de bloc** de lecture.

Prévoyez des ETH de test **en plus** des montants échangés : chaque transaction paie son gas, et plusieurs cas exigent des transactions refusées, qui en consomment aussi.

| Cas | Préconditions | Étapes | Résultat attendu | Résultat observé | Gravité |
| --- | --- | --- | --- | --- | --- |
| T-01 | Wallet installé | Sélectionner Sepolia ; ouvrir le dapp raccordé à la version testée | Le réseau est reconnu ; aucune invitation à signer sur une autre chaîne |  |  |
| T-02 | Compte neuf | Approvisionner en ETH de test par un robinet Sepolia | Solde visible dans le wallet et dans le dapp après rafraîchissement |  |  |
| T-03 | Manifeste sous les yeux | Comparer chaque adresse affichée à celle du manifeste | Identités identiques ; `poolId`, `fee` et `tickSpacing` concordent |  |  |
| T-04 | Aucun swap encore émis | Lire `snapshot()` et noter le bloc | Valeurs de référence consignées, bloc identifié |  |  |
| T-05 | Appel direct | Lire `poolKey()` du hook | `currency0` égal à l’adresse zéro, `fee = 100`, `tickSpacing = 10`, `hooks` égal au hook |  |  |
| T-06 | Registre V2 lisible | Lire `moduleRevision()` et les adresses des modules | Révision notée ; toute évolution en cours de recette impose de re-vérifier avant chaque signature |  |  |

## 2. Lancement et bande

À l’initialisation du pool, le hook place **tout son dépôt** dans une seule position `[minUsableTick, tickUpper]`, identifiée par `BAND_SALT`. `tickUpper` est le tick d’ouverture arrondi vers le bas au spacing, si bien que la position ne contient que des CUBIT. Le hook refuse un dépôt inférieur à `MIN_POOL_SUPPLY`, soit 80 % de l’offre, et brûle la poussière d’arrondi.

Le lancement complet verse aussi 20 % de l’offre à la réserve du Vault et effectue un achat de 0,1 ETH dans la même transaction.

| Cas | Préconditions | Étapes | Résultat attendu | Résultat observé | Gravité |
| --- | --- | --- | --- | --- | --- |
| T-07 | Lancement effectué, appel direct | Lire `band()` | `lower = −887 270` ; `upper` égal au tick d’ouverture arrondi vers le bas au multiple de 10, soit `155 390` pour une FDV de 3,75 ETH ; liquidité non nulle |  |  |
| T-08 | Transaction de lancement connue | Lire ses événements | `BandBootstrapped(lower, upper, liquidity, tokens)` émis une fois, avec les valeurs de `band()` ; `tokens` égal au dépôt moins une poussière d’arrondi |  |  |
| T-09 | Lancement sans achat initial | Lire `bandEth` et `bandTokens` dans `snapshot()` avant tout swap | `bandEth = 0` ; `bandTokens` égal au dépôt, aux arrondis près |  |  |
| T-10 | Lancement effectué, appel direct | Lire `token.balanceOf(hook)` | Zéro, hors transfert direct d’un tiers : le hook ne conserve aucun CUBIT brut après l’initialisation |  |  |
| T-11 | Appel direct | Tenter d’ajouter de la liquidité au pool | Refus `ExternalLiquidityForbidden` : le hook est le seul fournisseur de liquidité |  |  |
| T-12 | Déploiement de répétition | Initialiser le pool avec un dépôt inférieur à `MIN_POOL_SUPPLY` | Refus `SupplyNotDeposited` ; aucune bande posée |  |  |
| T-13 | Lancement complet | Lire `rewardReserve()` du Vault après la transaction de lancement | Réserve égale à 20 % de l’offre, soit 4,2 millions de CUBIT ; aucune allocation d’équipe ni airdrop |  |  |
| T-14 | Lancement complet | Lire l’achat du déployeur dans la transaction de lancement | Achat de 0,1 ETH ; `BuyTaxed` avec 3 % pour l’équipe ; CUBIT reçus librement transférables |  |  |
| T-15 | Achat confirmé, appel direct | Recalculer la sortie attendue à partir des réserves virtuelles de la bande | Sortie cohérente avec la courbe x·y=k après taxe de 3 % et frais LP ; au départ, 16,8 millions de CUBIT face à 3 ETH virtuels — à confirmer lors du test |  |  |
| T-16 | Achat puis revente des CUBIT achetés | Lire `bandEth` avant, entre et après | `bandEth` augmente à l’achat puis revient vers sa valeur de départ ; il ne dépasse jamais les ETH réellement apportés par les achats |  |  |

## 3. Parcours d’achat et de vente

Le routeur expose `swapExactIn(key, zeroForOne, amountIn, amountOutMin, recipient, deadline)` et `swapExactOut(key, zeroForOne, amountOut, amountInMax, recipient, deadline)`. `zeroForOne = true` achète des CUBIT avec des ETH.

**Dans les sources actuelles du dapp, l’interface n’utilise que l’entrée exacte.** L’utilisateur saisit toujours le montant qu’il paie ; la quantité reçue est un champ en lecture seule. Les parcours à sortie exacte doivent donc être testés par appel direct au routeur.

Un achat envoie des ETH natifs en `msg.value`. Une vente envoie une valeur nulle et exige une **approval ERC-20** du CUBIT au routeur : l’interface demande l’autorisation **du montant exact**, jamais illimitée, donc une vente plus grosse réclame une nouvelle autorisation.

Le routeur refuse les remplissages partiels : une entrée exacte non entièrement consommée déclenche `IncompleteInput`, une sortie exacte non entièrement servie déclenche `InsufficientOutput`. La taxe étant dimensionnée sur le montant demandé, l’annulation protège l’utilisateur.

Réglages de l’interface lus dans les sources du dapp, à vérifier pendant la recette : tolérance de slippage **par défaut 1,0 %**, saisie bornée à **deux décimales** et à l’intervalle `0` à `99,99` ; minimum reçu calculé en entiers et **arrondi au wei supérieur** ; cotation **fraîche 30 secondes** ; échéance on-chain = horodatage de la chaîne **plus 120 secondes moins l’âge de la cotation**.

| Cas | Préconditions | Étapes | Résultat attendu | Résultat observé | Gravité |
| --- | --- | --- | --- | --- | --- |
| T-17 | Solde ETH suffisant | Acheter un petit montant, par exemple 0,001 ETH | Reçu réussi ; CUBIT crédités ; événement `BuyTaxed` émis |  |  |
| T-18 | Solde ETH important | Acheter un montant élevé | Reçu réussi ; l’impact de prix se voit dans la cotation, pas dans le taux de taxe |  |  |
| T-19 | CUBIT en portefeuille | Approuver puis vendre | Deux transactions distinctes ; ETH nets reçus ; `SellTaxed` émis |  |  |
| T-20 | Vente précédente confirmée | Vendre un montant **supérieur** au précédent | Une nouvelle autorisation est demandée : l’approval portait sur le montant exact |  |  |
| T-21 | Écran de swap ouvert | Lire la tolérance proposée sans y toucher | Valeur par défaut **1,0 %** |  |  |
| T-22 | Écran de swap ouvert | Saisir `0.005`, puis `100`, puis une valeur négative | Saisies refusées avec un message sur l’intervalle 0–99,99 et les deux décimales |  |  |
| T-23 | Cotation fraîche | Régler la tolérance à sa valeur la plus basse acceptée, attendre un mouvement de prix, puis signer | Refus `TooLittleReceived(received, minimum)` ; aucun token perdu ; l’interface n’invite pas à supprimer la protection |  |  |
| T-24 | Cotation affichée | Laisser passer plus de 30 secondes sans action, puis tenter de signer | La cotation est considérée périmée et recalculée avant toute signature |  |  |
| T-25 | Cotation presque périmée | Signer juste avant l’expiration et lire l’échéance transmise | L’échéance vaut 120 secondes **moins** l’âge de la cotation : une cotation de 30 secondes laisse environ 90 secondes |  |  |
| T-26 | Appel direct | Appeler `swapExactIn` avec une échéance déjà dépassée | Refus `Expired` ; aucun mouvement de fonds |  |  |
| T-27 | Appel direct | Appeler `swapExactOut` pour un achat, avec un plafond d’entrée confortable | Quantité exacte reçue ; surplus d’ETH remboursé au caller dans la même transaction |  |  |
| T-28 | Appel direct | Appeler `swapExactOut` avec un plafond d’entrée inférieur d’un wei au montant requis | Refus `TooMuchRequested(required, maximum)` |  |  |
| T-29 | Solde CUBIT supérieur à ce que la bande et les murs peuvent racheter, par exemple des CUBIT reçus en récompense | Vendre ce solde en entrée exacte par le routeur | Refus `IncompleteInput` ; la taxe est annulée avec la transaction — à confirmer lors du test |  |  |
| T-30 | Appel direct | Demander en sortie exacte plus d’ETH que le carnet ne peut servir | Refus `InsufficientOutput` ; aucun règlement partiel |  |  |
| T-31 | Appel direct | Envoyer successivement un montant nul, un destinataire nul, une valeur `msg.value` incohérente, puis une autre clé de pool | Refus respectifs `InvalidAmount`, `ZeroRecipient`, `WrongValue`, `WrongPool` |  |  |
| T-32 | Routeur tiers compatible | Acheter puis vendre par une route tierce | Les taxes du hook s’appliquent |  |  |
| T-33 | Contrat d’appel ou lot de transactions | Enchaîner un achat puis une vente dans la **même transaction** | Les deux jambes sont taxées séparément |  |  |

## 4. Taxes et comptabilité

| Opération | Base | Répartition |
| --- | --- | --- |
| Achat | 3 % de la jambe ETH brute | 100 % part équipe ; l’allocation aux murs est explicitement nulle |
| Vente | 15 % des ETH bruts de sortie | 12 % vers les murs, 3 % vers l’équipe |

En entrée exacte, la taxe d’achat est **incluse** dans le montant fourni et arrondie au wei supérieur. En sortie exacte, elle s’ajoute par-dessus la jambe du pool, de sorte que la taxe rapportée au total reste 3 %.

Pour une vente à sortie exacte, la taxe vaut `ceil(sortie × 1500 / 8500)` : le pool produit la sortie demandée **plus** la taxe. Pour une vente à entrée exacte, elle vaut `ceil(brut × 15 %)`. Dans la répartition, la part équipe est arrondie à l’inférieur et **tout le reliquat en wei revient aux murs**.

Dans les sources actuelles du dapp, l’interface exige de lire ces taux sur la chaîne avant d’autoriser un swap : tant qu’ils ne sont pas vérifiés, le bouton reste en attente.

| Cas | Préconditions | Étapes | Résultat attendu | Résultat observé | Gravité |
| --- | --- | --- | --- | --- | --- |
| T-34 | Achat confirmé | Lire `BuyTaxed(ethIn, toFloor, toTeam)` | `toFloor` vaut zéro ; `toTeam` vaut 3 % de l’entrée brute, arrondi au wei supérieur |  |  |
| T-35 | Achat confirmé | Comparer `teamAccrued` avant et après | Augmentation égale à la part équipe |  |  |
| T-36 | Vente confirmée | Lire `SellTaxed(ethOut, toFloor, toTeam)` | `toFloor + toTeam` égale 15 % du brut ; `toTeam` vaut 3 % du brut ; la somme est exacte au wei près |  |  |
| T-37 | `teamAccrued` non nul, appel direct | Appeler `claimTeam()` depuis n’importe quel compte | Les fonds partent vers l’adresse équipe figée ; `TeamPaid(amount, cumulative)` émis ; `teamAccrued` remis à zéro |  |  |
| T-38 | `teamAccrued` nul, appel direct | Appeler `claimTeam()` | L’appel ne revient pas en erreur et ne transfère rien |  |  |
| T-39 | Un achat puis une vente du même montant | Comparer l’ETH de départ et l’ETH final, hors gas | Le facteur conservé approche `0,97 × 0,85 = 0,8245` ; l’écart s’explique par les frais LP, l’impact et les arrondis |  |  |
| T-40 | Deux ventes de tailles très différentes | Comparer les taxes rapportées aux bruts | Le taux reste 15 % dans les deux cas ; aucun palier ni exonération |  |  |

## 5. Murs automatiques

À chaque vente, en entrée exacte comme en sortie exacte, le hook appelle `_collectCrossedWalls()` puis `_placeWall()`. Il vide d’abord tous les murs que le prix a entièrement traversés, du plus proche au plus lointain, puis place tous les ETH en attente à la cible `0,4 × prix courant + 0,6 × prix de lancement`, calculée sur le prix **après** la vente et arrondie au tick. Si cette cible n’est pas strictement au-dessus du tick du pool, ce qui arrive au prix de lancement ou en dessous, le mur est posé 1 % sous le prix courant.

Un mur vidé ajoute ses CUBIT à `pendingAbsorbedTokens` et rend ses ETH restants, frais et poussière, à `pendingFloorEth`. Un mur seulement entamé reste en place. Seuls un montant trop petit pour créer de la liquidité et le cas extrême d’un prix tout en haut de la plage de ticks, où aucun mur ne tient sous le prix, laissent des fonds attendre dans `pendingFloorEth` : la vente n’est jamais refusée pour cela. Le routeur CUBIT appelle ensuite `deliverAbsorbed()` dans un try/catch.

La référence `floorPrice()` du Lens décrit le **dernier mur financé**, pas un minimum global. Chaque mur traversé coûte environ 185 000 gas : une vente traverse au plus environ 88 murs dans la limite de 16 777 216 gas d’une transaction.

| Cas | Préconditions | Étapes | Résultat attendu | Résultat observé | Gravité |
| --- | --- | --- | --- | --- | --- |
| T-41 | Prix au-dessus du prix de lancement | Vendre, puis lire les murs | `WallFunded(id, lower, addedEth, liquidity)` émis ; un mur est créé ou épaissi au tick cible avec les ETH en attente, dont les 12 % de la vente, aux arrondis près ; `pendingFloorEth` ne garde que le reliquat non placé |  |  |
| T-42 | Situation précédente | Recalculer la cible à partir du prix **après** la vente et du prix de lancement | Le `lower` du mur correspond à la cible 40/60 calculée sur ce prix, arrondie au tick |  |  |
| T-43 | Deux ventes dont la cible tombe sur le même tick | Lire `wallCount()` et `walls(id)` | Un seul mur : les deux `WallFunded` portent le même `id`, la liquidité augmente, aucun identifiant n’est créé |  |  |
| T-44 | Plusieurs murs à des ticks différents | Vendre et acheter à plusieurs reprises, puis relire `walls(id)` | Le `lower` de chaque mur reste inchangé ; aucun mur n’est déplacé |  |  |
| T-45 | Mur actif sous le prix | Vendre un montant qui entame le mur sans le traverser | Le mur reste actif avec des ETH et des CUBIT ; aucun `WallAbsorbed` ; `pendingAbsorbedTokens` inchangé |  |  |
| T-46 | Mur entamé | Acheter jusqu’à repasser au-dessus du mur | Le mur a revendu ses CUBIT et retrouvé des ETH ; son identifiant et son tick sont inchangés |  |  |
| T-47 | Mur actif, vente par le routeur CUBIT | Vendre un montant qui traverse entièrement le mur | `WallAbsorbed(id, cubit, ethRemaining)` et `TokensAbsorbed(amount, pendingAbsorbedTokens)`, puis `AbsorbedDelivered(sink, amount)` et `RewardReserveFunded` dans la même transaction ; `rewardReserve()` augmente de ces CUBIT ; `pendingAbsorbedTokens` revient à zéro ; `totalSupply()` et `totalBurned()` sont inchangés |  |  |
| T-48 | Prix proche du prix de lancement, cible 40/60 pas sous le marché | Vendre un petit montant servable, puis lire les murs | La vente réussit ; `WallFunded` émis ; le mur est posé 1 % sous le prix après la vente, arrondi au tick ; `pendingFloorEth` ne garde que le reliquat non placé |  |  |
| T-49 | Situation de T-48 | Vendre de nouveau un petit montant servable, puis lire `pendingFloorEth` | `WallFunded` émis 1 % sous le nouveau prix ; `pendingFloorEth` ne garde qu’une poussière d’arrondi : aucun arriéré ne s’accumule d’une vente à l’autre |  |  |
| T-50 | Routeur tiers compatible | Vendre en traversant entièrement un mur par une route tierce, puis appeler `deliverAbsorbed()` depuis un compte quelconque | Taxes appliquées ; `TokensAbsorbed` émis et les CUBIT restent dans `pendingAbsorbedTokens` jusqu’à l’appel, qui émet `AbsorbedDelivered` |  |  |
| T-51 | Plusieurs murs financés | Lire `floorPrice()` et `netFloorPrice()` du Lens, puis `wallAmountsPage(0, 500)` et les pages suivantes jusqu’à `activeWallCount`, toutes au même bloc | Référence du dernier mur financé, présentée comme telle ; les CUBIT des murs valent la somme des pages plus `pendingAbsorbedTokens`, ajouté une seule fois |  |  |
| T-52 | Enfant Forge, mur entièrement traversé | Lire `absorbedTokenSink()` du hook enfant, puis les événements de la vente | Destination égale à `governanceVault()` de la Forge ; `AbsorbedDelivered` émis ; tranche `Deposited(token, from, amount, unlockAt)` bloquée 30 jours |  |  |
| T-106 | Nombreux murs à traverser en une vente | Estimer le gas de la vente, puis l’envoyer | Environ 185 000 gas par mur traversé ; au-delà d’environ 88 murs, la vente dépasse 16 777 216 gas et échoue sans perte : la découper |  |  |
| T-107 | Déploiement de répétition dont la destination des CUBIT refuse l’envoi | Vendre en traversant un mur par le routeur CUBIT, puis rappeler `deliverAbsorbed()` | La vente réussit ; les CUBIT restent dans `pendingAbsorbedTokens` ; l’appel est ouvert à tout compte et échoue tant que la destination refuse |  |  |

## 6. mCUBIT Vault

Le Vault verse une récompense **en CUBIT**, prélevée uniquement sur `rewardReserve`. Elle vaut `DAILY_REWARD_BPS = 300`, soit 3 % du dépôt par période de 24 heures (`REWARD_PERIOD`), calculée au prorata et **plafonnée à une période** : au-delà, l’excédent est perdu. Elle ne dépasse jamais le solde de la réserve et n’est jamais payée sur le principal.

Chaque dépôt relance un verrou de **24 heures** (`LOCK_DURATION`) sur toute la position du wallet ; le retrait avant échéance est refusé par `Locked`. Un dépôt, un retrait ou une réclamation verse d’abord la récompense acquise et redémarre la période. N’importe quel compte peut alimenter la réserve avec `fundRewardReserve(amount)`. L’échéance s’apprécie sur l’horodatage de la chaîne, pas sur l’horloge du navigateur.

La récompense est **uniquement en CUBIT**, réclamée avec `claimCubit()` : le Vault n’expose aucune fonction de récompense en WETH.

| Cas | Préconditions | Étapes | Résultat attendu | Résultat observé | Gravité |
| --- | --- | --- | --- | --- | --- |
| T-53 | Vault disponible, CUBIT en portefeuille | Approuver puis déposer | `Staked(user, amount, unlockAt)` émis ; `unlockAt` égal à l’horodatage du bloc plus 24 heures |  |  |
| T-54 | Position existante | Déposer à nouveau avant l’échéance | Le verrou est **relancé pour toute la position** ; la récompense acquise, si elle est non nulle, est versée avec `CubitRewardClaimed` et la période redémarre |  |  |
| T-55 | Verrou en cours | Demander un retrait | Refus `Locked` |  |  |
| T-56 | Verrou échu | Retirer une partie du dépôt | Retrait partiel accepté ; `Withdrawn` émis ; la récompense acquise est versée d’abord ; le solde restant demeure déposé |  |  |
| T-57 | Dépôt de 1 000 CUBIT, réserve suffisante | Lire `pendingCubit` après 12 heures, puis après 24 heures | Environ 15 CUBIT, puis 30 CUBIT |  |  |
| T-58 | Situation précédente | Attendre 48 heures sans réclamer, puis lire `pendingCubit` | Toujours 30 CUBIT : la seconde journée est perdue |  |  |
| T-59 | Récompense acquise | Appeler `claimCubit()` | CUBIT transférés ; `CubitRewardClaimed` émis ; `rewardReserve` diminue du montant versé ; `pendingCubit` revient à zéro |  |  |
| T-60 | Déploiement de répétition avec une petite réserve | Réclamer une récompense supérieure à la réserve | Seul le solde de la réserve est versé ; la réserve tombe à zéro ; le principal n’est pas touché |  |  |
| T-61 | Appel direct | Appeler `fundRewardReserve(0)`, puis `fundRewardReserve(x)` depuis un compte quelconque après approval | Refus `InvalidAmount`, puis `RewardReserveFunded(from, x)` ; `rewardReserve` augmente de `x` |  |  |
| T-62 | Appel direct | Comparer `token.balanceOf(vault)` à `totalStaked + rewardReserve` à plusieurs moments | Le solde du Vault n’est jamais inférieur à cette somme |  |  |
| T-63 | Montant nul, appel direct | Appeler `stake(0)` puis `withdraw(0)` | Refus `InvalidAmount` dans les deux cas |  |  |
| T-64 | Vault non raccordé au registre courant | Tenter un dépôt | Refus `Inactive` |  |  |
| T-65 | Position ouverte | Lire la durée de verrou affichée | Affichage en heures, dérivé de `LOCK_DURATION` : 24 heures |  |  |
| T-66 | Dapp ouvert | Chercher un parcours de récompense en WETH | Aucun : seule la récompense en CUBIT est proposée |  |  |

## 7. Vault de gouvernance du launchpad

Le vault de gouvernance reçoit les fees de lancement de la Forge, en ETH, et les tokens absorbés par les murs des enfants Forge. **Chaque dépôt est bloqué 30 jours** (`LOCK_DURATION`) à partir de sa propre réception. **Seul le déployeur** peut réclamer, pour toujours et sans transfert possible de ce droit, et seulement les lots dont la date est passée, du plus ancien au plus récent. L’ETH est comptabilisé sous la clé `ETH()`, l’adresse zéro. Relisez l’ABI du déploiement testé avant la recette. Le déployeur peut allonger le blocage de tous les dépôts, présents et futurs, avec `extendLock` ; `lockExtension()` ne fait que croître et s’ajoute à chaque date.

L’envoi automatique depuis les murs des enfants est vérifié par T-52, et le dépôt du fee de lancement par T-81. Les cas T-67 à T-73 déposent des tokens de test par appel direct ; T-108 réclame l’ETH d’un fee.

| Cas | Préconditions | Étapes | Résultat attendu | Résultat observé | Gravité |
| --- | --- | --- | --- | --- | --- |
| T-67 | Token de test, appel direct | Approuver puis appeler `deposit(token, amount)` | `Deposited(token, from, amount, unlockAt)` émis ; `unlockAt` égal à l’horodatage du bloc plus 30 jours ; `held(token)` augmente d’autant |  |  |
| T-68 | Dépôt de moins de 30 jours | Appeler `claim(token, n)` depuis le déployeur | Refus `NothingToClaim` |  |  |
| T-69 | Lot débloqué | Appeler `claim(token, n)` depuis un autre compte | Refus `NotDeployer` |  |  |
| T-70 | Un dépôt par jour pendant 7 jours | Réclamer chaque jour à partir du 30ᵉ jour suivant le premier dépôt | Un lot sort par jour, du plus ancien au plus récent ; le dernier sort 30 jours après le septième dépôt ; `Claimed(token, amount, tranches)` à chaque réclamation |  |  |
| T-71 | Plusieurs lots débloqués | Appeler `claim(token, 1)` | Un seul lot versé ; le suivant reste réclamable |  |  |
| T-72 | Tokens envoyés par simple transfert | Appeler `lockUntracked(token)`, puis le rappeler sans nouveau transfert | Nouveau lot bloqué 30 jours à partir du premier appel ; le second appel est refusé par `NothingToLock` |  |  |
| T-73 | Lots bloqués et débloqués | Lire `claimable(token)` et `locked(token)` | Le montant réclamable plus le montant bloqué égale `held(token)` |  |  |
| T-108 | Fee de lancement de T-81 déposé depuis plus de 30 jours | Appeler `claim(address(0), 1)` depuis un autre compte, puis depuis le déployeur | Refus `NotDeployer`, puis ETH versés au déployeur ; `Claimed(address(0), amount, 1)` émis ; `held(address(0))` diminue du montant versé |  |  |
| T-109 | Lots bloqués | Appeler `extendLock(extra)` depuis un autre compte, puis depuis le déployeur | Refus `NotDeployer`, puis `LockExtended(extra, lockExtension)` émis ; chaque date lue par `tranche(token, i)` recule de `extra` ; aucune fonction ne raccourcit le blocage |  |  |

## 8. Forge

La Forge est un launchpad public, présenté comme une release future. Elle ne fait pas partie du lancement de CUBIT : elle s’ajoute ensuite, avec son vault de gouvernance. Relevez ses adresses une fois le launchpad ajouté.

N’importe quel compte lance un enfant en payant le fee exact. Un enfant Forge dépose toute son offre dans sa bande, la Forge reçoit l’adresse du vault de gouvernance à sa construction, et chaque lancement verse son fee de 0,005 ETH à ce vault, qui le conserve : le lanceur ne le récupère jamais. Les salts de déploiement sont liés au lanceur.

| Cas | Préconditions | Étapes | Résultat attendu | Résultat observé | Gravité |
| --- | --- | --- | --- | --- | --- |
| T-81 | Forge disponible, compte quelconque | Lancer un enfant avec le fee exact de 0,005 ETH | `ChildLaunched(token, hook, launcher, team, fee)` émis ; `BandBootstrapped` de l’enfant indique un dépôt égal à toute son offre, aux arrondis près ; le vault de gouvernance émet `Deposited(address(0), forge, fee, unlockAt)`, avec `unlockAt` égal à l’horodatage du bloc plus 30 jours et l’allongement éventuel ; `pendingFloorEth` du hook parent inchangé |  |  |
| T-82 | Forge disponible | Tenter un lancement avec une valeur incorrecte, un nom vide, une équipe nulle ou un autre template | Refus : `wrong launch fee`, `invalid name`, `invalid team` ou `template mismatch` |  |  |
| T-110 | Salts d’un lancement vus par un autre compte | Lancer depuis un second compte avec les mêmes salts | Les adresses du premier lancement ne sont pas prises : les salts sont liés au lanceur, et le second lancement est refusé par `child deployment failed` si son adresse de hook ne porte pas les permissions |  |  |

## 9. Remplacements et pouvoirs

L’autorité du registre peut remplacer quatre adresses périphériques à tout moment, sans délai : Vault, routeur, Lens et Forge. Chaque remplacement émet `ModuleUpdated`, **incrémente `moduleRevision`** et referme la fonctionnalité concernée jusqu’à ce que l’équipe la rouvre : Vault, Momentum ou Forge ; remplacer le routeur ne referme aucune fonctionnalité. Un candidat déjà enregistré, raccordé à un autre hook ou à un autre token, ou portant déjà du stake, est refusé par `InvalidModule`.

Le hook n’a **aucun administrateur**, et personne ne peut mettre en pause les swaps ni le mécanisme des murs. L’adresse équipe garde des pouvoirs permanents : elle reçoit la part équipe des taxes et remplace puis active les modules du registre.

| Cas | Préconditions | Étapes | Résultat attendu | Résultat observé | Gravité |
| --- | --- | --- | --- | --- | --- |
| T-83 | Dépôts et réserve dans le Vault courant | Remplacer le Vault | CUBIT déposés, réserve de récompenses et échéances **restent dans l’ancien Vault** ; aucun fonds déplacé |  |  |
| T-84 | Vault remplacé | Sur l’ancien Vault, réclamer puis retirer, puis tenter un dépôt | Réclamation et retrait restent disponibles ; le nouveau dépôt est refusé par `Inactive` |  |  |
| T-85 | Candidat déjà enregistré, ou portant du stake | Tenter la rotation | Refus `InvalidModule` |  |  |
| T-86 | Remplacement effectué | Lire `moduleRevision()` et l’événement ; après un remplacement du Vault, tenter un dépôt dans le nouveau Vault | Révision incrémentée ; `ModuleUpdated(module, previous, current, revision)` concorde ; le dépôt est refusé par `Inactive` jusqu’à la réactivation du Vault |  |  |
| T-87 | Approval accordée à l’ancien routeur | Remplacer le routeur, puis tenter une vente | L’ancienne approval ne vaut pas pour le nouveau spender ; une nouvelle autorisation est demandée |  |  |
| T-88 | Routeur remplacé | Échanger via l’ancien routeur | L’échange reste possible et les taxes du hook s’appliquent ; la dapp utilise le nouveau routeur |  |  |
| T-89 | Appel direct | Inspecter l’ABI du hook déployé | Aucune fonction ne permet de suspendre les swaps ou le mécanisme des murs ; le hook n’a aucun administrateur |  |  |
| T-90 | Appel direct | Lire `snapshot()` du Lens, puis les pages de murs au même bloc | Le snapshot ne contient que des champs de marché, de bande, de murs, de comptes, l’offre totale, la réserve de récompenses, le nombre de murs actifs, le bloc de lecture et le meilleur mur : aucun total de murs, et son coût ne dépend pas du nombre de murs ; l’offre en circulation égale `totalSupply` moins les CUBIT des murs et `rewardReserve`, et les CUBIT détenus valent cette offre moins `bandTokens` |  |  |
| T-91 | À tout moment après le lancement | Acheter et vendre | Les swaps fonctionnent normalement : aucun compte ne peut les bloquer |  |  |

## 10. Cas de refus attendus

Ce tableau sert de référence pendant toute la recette. Les murs automatiques n’ajoutent pas de refus à la vente : un mur impossible à poser laisse les fonds en attente, et un envoi raté laisse les CUBIT en attente.

> **Point de vigilance.** Dans les sources actuelles du dapp, les erreurs de contrat ne sont pas traduites : un refus on-chain peut s’afficher sous la forme d’un message brut, tronqué à l’affichage. **Pour chaque refus déclenché, relevez le texte exact affiché** et jugez s’il est compréhensible.

| Erreur | Ce qui la déclenche | Ce que l’application devrait montrer |
| --- | --- | --- |
| `ExternalLiquidityForbidden` | Ajout de liquidité par un tiers | Opération impossible : le protocole est le seul fournisseur de liquidité |
| `SupplyNotDeposited` | Initialisation avec un dépôt inférieur à 80 % de l’offre | Lancement impossible, dépôt insuffisant |
| `Expired` | Échéance de transaction dépassée | Cotation expirée, en recalculer une |
| `TooLittleReceived(received, minimum)` | Sortie inférieure au minimum accepté | Protection de slippage déclenchée |
| `TooMuchRequested(required, maximum)` | Entrée supérieure au plafond accepté | Protection de plafond d’entrée déclenchée |
| `IncompleteInput` | Entrée exacte non entièrement consommée | Montant trop grand pour la liquidité disponible |
| `InsufficientOutput` | Sortie exacte non entièrement servie | Le carnet ne peut pas servir cette sortie |
| `InvalidAmount`, `ZeroRecipient`, `WrongValue`, `WrongPool` | Paramètres d’ordre invalides, ou montant nul envoyé au Vault | Erreur de saisie, sans code brut |
| `Inactive`, `Locked` | Vault non raccordé au registre courant, ou retrait avant échéance | Module indisponible, ou date de déblocage |
| `NotDeployer`, `NothingToClaim`, `NothingToLock`, `NothingToExtend` | Réclamation ou allongement au vault de gouvernance par un tiers, réclamation avant échéance, verrouillage sans nouveau solde, allongement nul | Action réservée, rien à réclamer, rien à verrouiller ou rien à allonger |
| `NotAuthority`, `InvalidModule` | Remplacement demandé par un tiers, ou candidat incompatible | Remplacement refusé, avec la raison |

Les refus purement applicatifs se relèvent aussi : cotation périmée, contexte de swap modifié, wallet sur une autre chaîne, compte changé, révision de modules changée, taux de taxe non encore vérifiés.

## 11. Application

Ces cas se déroulent avec le dapp. Les comportements d’interface cités proviennent de ses sources et se vérifient pendant la recette.

| Cas | Préconditions | Étapes | Résultat attendu | Résultat observé | Gravité |
| --- | --- | --- | --- | --- | --- |
| T-92 | Dapp ouvert | Parcourir les dix langues du sélecteur | Chaque langue affiche un contenu traduit, sans texte manquant ni débordement ; les noms de produits restent en anglais par choix |  |  |
| T-93 | Langue choisie | Recharger, puis réduire la fenêtre sous 640 px | Le choix est conservé d’une session à l’autre ; sous 640 px, le sélecteur n’affiche plus que le drapeau |  |  |
| T-94 | Langue autre que l’anglais | Comparer le titre d’accueil à la version anglaise | Le titre est volontairement réduit hors anglais ; il ne doit ni déborder ni être coupé |  |  |
| T-95 | Écran d’environ 400 px | Parcourir chaque écran | Aucun débordement horizontal ; les zones larges défilent dans leur propre conteneur ; les boutons restent atteignables |  |  |
| T-96 | Fenêtre entre 768 et 1279 px | Ouvrir la navigation | Le menu compact est utilisé jusqu’à 1279 px ; il se referme après la navigation |  |  |
| T-97 | Transaction confirmée | Comparer chaque montant affiché aux valeurs on-chain au même bloc | Les montants concordent ; les arrondis d’affichage ne modifient pas le montant signé |  |  |
| T-98 | Opération en préparation | Changer de réseau dans le wallet au milieu du parcours | La cotation est invalidée et la signature refusée hors du réseau attendu ; le bouton propose d’abord le changement de réseau, puis exige une seconde action pour échanger |  |  |
| T-99 | Opération en préparation | Changer de compte dans le wallet au milieu du parcours | Soldes, autorisation et cotation sont recalculés pour le nouveau compte ; une signature préparée pour l’ancien compte est refusée |  |  |
| T-100 | Autorisation accordée, swap non signé | Laisser la révision des modules changer entre les deux | L’application revalide le contexte et n’enchaîne pas silencieusement sur un nouveau spender |  |  |
| T-101 | RPC indisponible ou lecture ancienne | Couper l’accès au RPC puis observer | L’état est signalé comme non vérifié et les actions sont désactivées |  |  |
| T-102 | Transaction envoyée | Suivre le hash puis le reçu | L’interface distingue « soumise » et « réussie » ; les événements sont vérifiables sur un explorateur Sepolia |  |  |
| T-103 | Un refus on-chain provoqué | Relever le texte affiché, en entier | Le message doit rester compréhensible pour un utilisateur ; consigner tout code technique brut ou message tronqué |  |  |
| T-104 | Langues chinoise, coréenne et japonaise | Afficher ces langues sans accès à un service de polices externe | Les caractères s’affichent correctement : les polices sont servies par le site |  |  |
| T-105 | Écran Proof ouvert | Lire la bande, les murs et les fonds en attente | `bandEth`, `bandTokens`, les murs, les ETH en attente et les CUBIT en attente d’envoi sont affichés séparément ; aucun écran ne présente de ladder, de keepers ou de burn des murs |  |  |

## 12. Fiche de relevé

Chaque tableau des sections précédentes **est** la fiche de relevé de sa section : remplissez les colonnes « Résultat observé » et « Gravité » au fil des cas. Pour le résultat observé, notez au minimum le hash de transaction ou le bloc de lecture, puis ce qui a été constaté.

Récapitulatif à joindre au rapport :

| Section | Cas | Conformes | Écarts | Gravité maximale |
| --- | --- | --- | --- | --- |
| 1. Préparation | T-01 à T-06 |  |  |  |
| 2. Lancement et bande | T-07 à T-16 |  |  |  |
| 3. Achat et vente | T-17 à T-33 |  |  |  |
| 4. Taxes et comptabilité | T-34 à T-40 |  |  |  |
| 5. Murs automatiques | T-41 à T-52, T-106 et T-107 |  |  |  |
| 6. mCUBIT Vault | T-53 à T-66 |  |  |  |
| 7. Vault de gouvernance | T-67 à T-73, T-108 et T-109 |  |  |  |
| 8. Forge | T-81, T-82 et T-110 |  |  |  |
| 9. Remplacements et pouvoirs | T-83 à T-91 |  |  |  |
| 10. Cas de refus | Référence transverse |  |  |  |
| 11. Application | T-92 à T-105 |  |  |  |

Un écart se rapporte **au numéro du cas**, jamais à une capture d’écran seule. Joignez le réseau, l’adresse du déploiement, le bloc, le hash et la version de l’application.

## Limites de ce plan

Ce plan décrit ce que le code de la nouvelle version et les décisions du 14 septembre 2026 prévoient. Il **ne constitue pas une validation** : une recette réussie sur Sepolia ne remplace pas les campagnes de tests.

Les points « à confirmer lors du test » doivent être observés, puis reversés dans cette page.

<p class="source-note">Sources : <code>contracts/src/CubitHook.sol</code>, <code>CubitLens.sol</code>, <code>interfaces/ICubitHook.sol</code>, <code>interfaces/ICubitLens.sol</code>, <code>libraries/BandLib.sol</code>, <code>libraries/WallLib.sol</code>, <code>periphery/CubitRouter.sol</code>, <code>CubitV2.sol</code>, <code>CubitVault.sol</code>, <code>CubitGovernanceVault.sol</code>, <code>CubitForge.sol</code>, <code>CubitLaunch.sol</code>, les parcours actuels de <code>dapp/src</code> et les décisions de design du 14 septembre 2026 consignées dans <code>contracts/docs/REDESIGN_HANDOFF.md</code>.</p>
