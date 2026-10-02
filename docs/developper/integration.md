---
description: "Identités du pool, modules remplaçables, bande de liquidité, murs et envoi des CUBIT absorbés, vaults, fonctions supprimées, unités et événements d’intégration."
section: "04 / CONSTRUIRE"
reading: "10 MIN DE LECTURE"
search:
  keywords: [API, ABI, intégration, integration, contrat, address, band, BAND_SALT, MIN_POOL_SUPPLY, bandEth, bandTokens, walls, WallLib, wallCount, deliverAbsorbed, pendingAbsorbedTokens]
---

# Contrats et intégration

Une intégration doit identifier **la chaîne, le cœur du pool, l’ABI et la révision des modules**. Une adresse de routeur copiée dans un ancien rapport peut être remplacée ; une nouvelle ABI peut être incompatible avec le pool historique.

> L’ABI ci-dessous est celle du code de la nouvelle version. Exportez l’ABI de la release validée et vérifiez les runtimes avant de raccorder un client.

## Identité du pool

La `PoolKey` contient `currency0`, `currency1`, `fee`, `tickSpacing` et `hooks`. Pour CUBIT, ETH natif est `currency0` et le token CUBIT est `currency1`.

| Champ | Lecture attendue |
| --- | --- |
| `currency0` | Adresse zéro, représentant ETH natif |
| `currency1` | Token du déploiement identifié |
| `fee` | `100` dans la version en service, soit 0,01 % |
| `tickSpacing` | `10` dans les sources lues |
| `hooks` | Hook du déploiement identifié |

Le poolId dépend de toute cette clé. Remplacer seulement `fee` dans un frontend ne transforme pas un ancien pool en nouveau déploiement.

## Résoudre les modules à un même bloc

Lisez d’abord le registre ancré dans `hook.v2()`. Puis résolvez les adresses des modules disponibles et `moduleRevision` au même bloc. Vérifiez leur raccordement au cœur.

Voici un fragment de **lecture seule**, à utiliser avec un client viem déjà configuré et une adresse de registre vérifiée :

```ts
import { parseAbi, type Address, type PublicClient } from "viem";

const registryAbi = parseAbi([
  "function router() view returns (address)",
  "function moduleRevision() view returns (uint256)",
]);

export async function readRelease(
  client: PublicClient,
  registry: Address,
) {
  const blockNumber = await client.getBlockNumber();
  const [router, revision] = await Promise.all([
    client.readContract({ address: registry, abi: registryAbi,
      functionName: "router", blockNumber }),
    client.readContract({ address: registry, abi: registryAbi,
      functionName: "moduleRevision", blockNumber }),
  ]);
  return { blockNumber, router, revision };
}
```

Ce fragment ne vérifie pas à lui seul toutes les liaisons et n’autorise aucune signature. Le frontend du dépôt les contrôle dans `resolveRelease`, `readRelease` et `assertCurrentDeployment`.

Avant chaque signature, comparez les modules et la révision avec le contexte déjà revu par l’utilisateur. Ne redirigez pas silencieusement une approval.

## Lire la bande

| Élément | Résultat / usage |
| --- | --- |
| `band()` | `(int24 lower, int24 upper, uint128 liquidity)` de la position unique de trading |
| `MIN_POOL_SUPPLY()` | Dépôt minimal accepté à l’initialisation : 80 % de l’offre |
| `BAND_SALT()` | Salt de la position de bande, `keccak256("CUBIT.BAND")` |
| `BandBootstrapped(lower, upper, liquidity, tokens)` | Événement émis une seule fois, à l’initialisation du pool |
| Lens `bandEth()` / `bandTokens()` | ETH et CUBIT détenus par la bande au prix courant, hors frais LP |

`lower` vaut `minUsableTick` pour un spacing de 10, soit −887 270. `upper` est le tick d’ouverture du pool arrondi vers le bas au spacing : avec une FDV de lancement de 3,75 ETH, il vaut 155 390. Un arrondi vers le haut rendrait la position active et exigerait des ETH.

Le hook met en bande **tout son dépôt**. `afterInitialize` refuse un dépôt inférieur à `MIN_POOL_SUPPLY` avec `SupplyNotDeposited` : le lancement du parent dépose exactement ce minimum, un enfant Forge dépose toute son offre. La poussière d’arrondi est brûlée, si bien que le hook ne conserve ni token brut ni claim de CUBIT après l’initialisation.

Le snapshot du Lens remplace les anciens champs du ladder et des keepers par `bandEth` et `bandTokens`. Ces valeurs portent sur le principal de la position : les frais LP accumulés dans la bande ne sont ni collectés ni comptés.

## Lire plusieurs murs

| Vue du hook | Résultat / usage |
| --- | --- |
| `wallCount()` | Nombre d’identifiants historiques, distinct du nombre de positions actives |
| `activeWallCount()` | Nombre de murs actifs dans l’état lu |
| `activeWallId(index)` | ID permanent à un index de la liste active courante |
| `latestWallId()` | ID du dernier mur financé ; vérifier d’abord qu’un mur existe |
| `walls(id)` | `(int24 lower, uint128 liquidity, uint256 idleEth, uint256 fundedEth)` |
| `wallIdleEth()` | Total des reliquats ETH affectés aux murs |

Les ventes créent, épaississent et vident les murs. Un mur vidé sort de la liste active mais conserve son identifiant et son tick.

Les index de la liste active peuvent changer après une absorption. **Conservez l’ID du mur comme identité**, pas son index de parcours. Lisez le count et les éléments au même bloc.

`fundedEth` représente le cumul des fonds effectivement placés à ce tick ; il ne doit pas être affiché comme la profondeur restante. `idleEth` représente un reliquat attaché au mur, distinct de sa liquidité déployée. La borne supérieure d’un mur est `lower + tickSpacing`. Les fonds des murs qui n’ont pas pu être placés restent séparés dans `pendingFloorEth`.

Les champs historiques `floorPrice` et `netFloorPrice` du Lens décrivent le dernier mur financé ; ils ne résument pas tous les niveaux. Pour le mur actif le plus proche du marché, lisez `bestWallPrice` et `netBestWallPrice`.

## Murs traversés et envoi des CUBIT

À chaque vente, en entrée exacte comme en sortie exacte, `afterSwap` appelle `_collectCrossedWalls()` puis `_placeWall()`. Tous les murs que le prix a entièrement traversés sont vidés, du plus proche au plus lointain : leurs CUBIT s’ajoutent à `pendingAbsorbedTokens` et leurs ETH restants, frais réalisés et poussière, retournent à `pendingFloorEth`. `_placeWall()` place ensuite tous les ETH en attente à la cible calculée sur le prix après la vente. Si cette cible n’est pas strictement au-dessus du tick du pool, ce qui arrive au prix de lancement ou en dessous, il pose le mur 1 % sous le prix courant avec `BandLib.underMarketWallTarget`. Seuls un montant trop petit pour créer une position et le cas extrême d’un prix tout en haut de la plage de ticks, où aucun mur ne tient sous le prix, restent dans `pendingFloorEth`.

| Élément | Résultat / usage |
| --- | --- |
| `pendingAbsorbedTokens()` | CUBIT des murs traversés, isolés dans le hook en claims du PoolManager jusqu’à leur envoi |
| `deliverAbsorbed()` | Envoi public et sans permission de ces CUBIT à `absorbedTokenSink()` ; l’appelant ne choisit ni destinataire ni montant |
| `absorbedTokenSink()` | Vault du registre pour CUBIT ; pour un enfant Forge, `governanceVault()` de la Forge qui a déployé son token |
| `WallFunded(id, lower, addedEth, liquidity)` | Mur créé ou épaissi au tick cible |
| `WallAbsorbed(id, cubit, ethRemaining)` | Mur entièrement traversé et vidé |
| `TokensAbsorbed(amount, pendingAbsorbedTokens)` | CUBIT mis en attente d’envoi par une vente |
| `AbsorbedDelivered(sink, amount)` | CUBIT envoyés à leur destination |

Pour CUBIT, `deliverAbsorbed()` appelle `fundRewardReserve` du vault. Pour un enfant Forge, sans registre, il transfère les tokens au vault de gouvernance puis appelle `lockUntracked`. Le routeur CUBIT l’appelle après chaque vente dans un try/catch : un envoi qui échoue ne bloque jamais la vente, et n’importe qui peut relancer l’envoi. Le Lens ne totalise plus les murs dans `snapshot()` : `wallAmountsPage(start, count)` rend l’ETH et les CUBIT d’une tranche de murs, et les CUBIT qui attendent leur envoi s’ajoutent une seule fois à la somme des pages, par le champ `pendingAbsorbedTokens`.

Chaque mur traversé coûte environ 185 000 gas. Avec la limite de 16 777 216 gas par transaction fixée par EIP-7825, une vente traverse au plus environ 88 murs ; au-delà, elle échoue sans perte et doit être découpée.

## Les fonctions supprimées

La nouvelle version retire l’API du ladder, de la maintenance, du flux WETH et du financement des murs par la Forge, et renomme celle des tokens absorbés. Un client qui appelle encore ces éléments vise l’ancienne version.

| Contrat | Éléments supprimés |
| --- | --- |
| Hook, fonctions | `rebalance()`, `raiseFloor()`, `previewRaiseFloor()`, `canRebalance()`, `referenceTick()`, `lastRebalanceTick()`, `lastRebalanceBlock()`, `reserveTokens()`, `ladderIdleEth()`, `asks(i)`, `bid()`, `vaultAccrued()`, `claimVault()`, `fundFloor()` |
| Hook, fonctions renommées | `burnAbsorbed()` devient `deliverAbsorbed()` ; `pendingBurnTokens()` devient `pendingAbsorbedTokens()` |
| Hook, constantes | `PHI_BPS`, `SWEEP_BPS`, `REBALANCE_THRESHOLD`, `REBALANCE_COOLDOWN`, `KEEPER_BOUNTY_BPS`, `KEEPER_BOUNTY_CAP`, `BOUNTY_RESERVE_TARGET`, `BOUNTY_RESERVE_BPS` |
| Hook, événements et erreurs | `Rebalanced`, `SweepExecuted`, `BountyPaid`, `LadderBootstrapped`, `VaultFeesAccrued`, `FloorRaised`, `FloorFunded`, `ThresholdNotMet`, `CooldownActive`, `NothingToRaise`, `WallLimitReached`, `ProtocolFeeActive`, `WallRangeNotEmpty`, `NotInitialized` |
| Lens, fonctions | `canRebalance()`, `canRaiseFloor()`, `previewRaiseFloor()`, `cushionEth()`, `ladderTokens()` |
| Lens, champs du snapshot | `cushionEth`, `ladderTokens`, `reserveTokens`, `ladderIdleEth`, `lastRebalanceTick`, `lastRebalanceBlock`, `canRebalance`, `movedTicks`, `blocksRemaining`, `canRaiseFloor`, `raiseReason`, `referenceTick` |
| Vault | `weth()`, `earned()`, `claim()`, `fundRewards()`, `rewardPerToken()`, `RewardsFunded`, `RewardPaid` |
| Registre | `weth()` |

En interne, `_fundWall` et `_planRaise` ont disparu au profit de `_collectCrossedWalls` et `_placeWall`. La récompense du Vault est uniquement en CUBIT, réclamée avec `claimCubit()`, et les scripts de déploiement n’utilisent plus de variable `WETH`.

## Le Vault et le vault de gouvernance

| Contrat | Fonctions utiles |
| --- | --- |
| `CubitVault` | `stake(amount)`, `withdraw(amount)`, `pendingCubit(user)`, `claimCubit()`, `fundRewardReserve(amount)`, `rewardReserve()`, `balanceOf(user)`, `unlockAt(user)` |
| `CubitGovernanceVault` | `deposit(token, amount)`, `depositEth()`, `lockUntracked(token)`, `claimable(token)`, `locked(token)`, `lockExtension()`, puis `claim(token, maxTranches)` et `extendLock(extra)`, réservés au déployeur, sans transfert possible de ce droit |
| `CubitForge` | `launch(name, symbol, team, tokenSalt, hookSalt, creationCode)`, ouvert à tous avec le fee exact, `launchFee()` immuable à 0,005 ETH, salts liés au lanceur ; `governanceVault()`, adresse fixée à la construction, reçoit le fee de lancement avec `depositEth()` |

Côté Vault, `DAILY_REWARD_BPS` vaut 300 et `REWARD_PERIOD` un jour : `pendingCubit` croît au prorata sur 24 heures puis plafonne, sans dépasser `rewardReserve`. Côté vault de gouvernance, `LOCK_DURATION` vaut 30 jours pour chaque dépôt, et l’ETH est comptabilisé sous la clé `ETH()`, l’adresse zéro. `extendLock(extra)` ajoute `extra` secondes au blocage de tous les dépôts, présents et futurs, et `lockExtension()` ne fait que croître.

Le Lens expose aussi `rewardReserve()`, la somme des réserves de récompenses de tous les vaults enregistrés, actuels et retirés. Depuis le remplacement de la Lens du 19 septembre 2026, les totaux des murs et l’offre ne sont plus calculés sur la chaîne : les getters `wallEth()`, `wallTokens()`, `circulatingSupply()` et `heldSupply()` et les champs du même nom ont disparu du snapshot, qui donne à la place `totalSupply`, `activeWallCount` et `pendingAbsorbedTokens`. L’appelant dérive lui-même les chiffres, toutes les pages lues au même bloc : `wallTokens` est la somme des CUBIT des pages plus `pendingAbsorbedTokens`, puis `circulatingSupply = totalSupply − wallTokens − rewardReserve` et `heldSupply = circulatingSupply − bandTokens`, chaque soustraction s’arrêtant à zéro. Les CUBIT stakés restent dans l’offre en circulation. `bestWallPrice()` et `netBestWallPrice()` donnent le prix brut et le prix net du mur actif le plus proche du marché, lu avec `nearestWallTick()` du hook, ou zéro si aucun mur ne tient. Le snapshot se termine par `blockNumber`, `bestWallPrice` et `netBestWallPrice`.

## Unités et orientation

Les quantités de CUBIT et d’ETH utilisent 18 décimales. Les prix dérivés du Lens sont exprimés en **ETH par CUBIT à l’échelle 1e18**. Le tick v4 suit l’orientation CUBIT par ETH ; il diminue quand le prix ETH par CUBIT augmente.

Utilisez des entiers `bigint` pour les montants et les calculs avant formatage. Une conversion en `Number` trop tôt peut perdre de la précision. La FDV de lancement est figée au déploiement dans `LAUNCH_ETH()` : 3,75 ETH retenus pour la nouvelle version, sur 21 millions de CUBIT. Ne mélangez pas USD, wei et token units.

## Les méthodes du routeur

```text
swapExactIn(
    PoolKey key, bool zeroForOne,
    uint256 amountIn, uint256 amountOutMin,
    address recipient, uint256 deadline
)

swapExactOut(
    PoolKey key, bool zeroForOne,
    uint256 amountOut, uint256 amountInMax,
    address recipient, uint256 deadline
)
```

`zeroForOne = true` achète des CUBIT avec des ETH. Pour exact-input, fournissez `amountIn` en value ; pour un achat exact-output, fournissez `amountInMax`, avec remboursement du surplus. Une vente passe `zeroForOne = false`, value zéro, et une approval CUBIT au routeur.

Les montants retournés suivent les limites nettes/brutes du routeur : sortie nette pour exact-input, entrée brute pour exact-output. Le contrat contrôle les remplissages incomplets. La cotation doit être simulée avec la bonne clé de pool et sa version. Après une vente, le routeur appelle aussi `deliverAbsorbed()` s’il reste des CUBIT absorbés en attente.

## Événements et erreurs

Les événements du hook comprennent `BuyTaxed`, `SellTaxed`, `BandBootstrapped`, `TeamPaid` et, pour les murs, `WallFunded`, `WallAbsorbed`, `TokensAbsorbed` et `AbsorbedDelivered`. `ModuleUpdated` permet de suivre les remplacements de modules.

Côté vaults, suivez `Staked`, `Withdrawn`, `RewardReserveFunded` et `CubitRewardClaimed`, puis `Deposited`, `Claimed` et `LockExtended` pour le vault de gouvernance.

Les logs de `WallLib` sont émis dans le contexte du hook : indexez-les sur l’adresse du hook avec les signatures ABI correspondantes. L’ancien événement `FloorRaised` n’existe plus.

Dans le routeur, traitez notamment `Expired`, `WrongPool`, `TooLittleReceived`, `TooMuchRequested`, `InsufficientOutput` et `IncompleteInput`. Côté hook, `ExternalLiquidityForbidden` refuse toute liquidité tierce et `SupplyNotDeposited` un dépôt de lancement insuffisant. Relisez les codes et l’ABI de la release validée.

<p class="source-note">Sources : <code>interfaces/ICubitHook.sol</code>, <code>interfaces/ICubitLens.sol</code>, <code>CubitHook.sol</code>, <code>WallLib.sol</code>, <code>CubitRouter.sol</code>, <code>periphery/CubitVault.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>periphery/CubitForge.sol</code> et l’historique Git de la nouvelle version, dont le commit <code>4aa063ac</code>.</p>
