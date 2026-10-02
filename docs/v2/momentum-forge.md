---
description: "Momentum offre une lecture seule du marché. La Forge est un launchpad public ; ses fees de lancement et les tokens absorbés par les murs des enfants rejoignent le vault de gouvernance du launchpad."
section: "03 / LES MODULES V2"
reading: "5 MIN DE LECTURE"
search:
  keywords: [momentum, forge, enfant, launchpad, public, gouvernance, NAV, lock, 30 jours, allongement]
---

# Momentum et Forge

Ces deux modules ont des rôles distincts : **Momentum rend visible l’état du marché**, tandis que **la Forge permet à n’importe qui de lancer un marché enfant isolé**.

## Momentum : observer le marché

Momentum est une page de l’app : pour chaque token, elle montre les murs actifs, les murs entamés et l’historique des murs traversés, à partir des événements du hook et des lectures du Lens. Elle est ouverte depuis le 23 septembre 2026.

Il s’agit d’une fonctionnalité **en lecture seule**, sans pouvoir de retirer des ETH des murs ni de modifier les règles du cœur. Un changement d’affichage n’est pas une commande de trading.

La géométrie réellement utilisée demeure celle du hook. Elle ne peut pas être inventée par un composant du frontend.

## Forge : un launchpad public

La Forge est **ouverte à tous** : n’importe quel compte lance un marché enfant en payant le fee de lancement exact. Elle ne faisait pas partie du lancement de CUBIT : l’équipe l’a ajoutée le 23 septembre 2026, avec son vault de gouvernance, et l’a ouverte le même jour.

Chaque enfant reçoit son token, son hook, ses identités de pool et ses propres réserves. Le template de création du hook est contrôlé par un hash fixé au constructeur de Forge. Les salts de déploiement sont liés au lanceur : deux lancements du même bloc ne s’invalident pas, et copier les salts d’un autre compte ne prend pas son lancement.

Un enfant **dépose 100 % de son offre dans sa bande**. Il n’a ni réserve de vault ni allocation d’équipe. Le nom, le symbole, l’adresse équipe, le salt de déploiement et le code fourni font l’objet de contrôles. Comme celui du parent, le hook d’un enfant n’a aucun administrateur. Une création enfant ne donne pas de permission sur le pool CUBIT parent. Les paramètres sont imposés : même valorisation de lancement, même offre et mêmes taxes pour chaque enfant.

## Le vault de gouvernance du launchpad

Le **vault de gouvernance du launchpad** reçoit les fees de lancement de la Forge, en ETH, et les tokens absorbés par les murs des enfants, qui ne vont pas au vault de staking du parent :

- chaque dépôt y est bloqué **30 jours à partir de sa comptabilisation**, plus l’allongement éventuel : elle est immédiate pour un dépôt, un fee de lancement ou une livraison d’un enfant, et n’a lieu qu’à l’appel de `lockUntracked` pour des tokens envoyés directement au vault ;
- **le déployeur peut allonger le blocage** de tout le vault, dépôts présents et futurs, tokens et ETH, avec `extendLock`, quand il veut ; aucune fonction ne raccourcit un blocage ;
- par exemple, 10 tokens reçus chaque jour pendant 7 jours sortent en 7 lots, un par jour, le dernier à 1 mois et 7 jours ;
- **seul le déployeur** de ce vault peut réclamer les lots débloqués, pour toujours : aucune fonction ne permet de transférer ce droit ;
- ses avoirs sont destinés à servir de référence de valeur, ou NAV, au token du launchpad.

La Forge reçoit l’adresse de ce vault à sa construction, dans `governanceVault`. Le hook d’un enfant la retrouve par la Forge qui a déployé son token, puis `deliverAbsorbed()` y transfère les tokens des murs vidés et les verrouille avec `lockUntracked`.

## Le fee de lancement

Chaque lancement verse son fee au vault de gouvernance du launchpad, en ETH, par `depositEth()` et dans la même transaction. Ce fee appartient dès lors à la gouvernance : **le lanceur ne le récupère jamais**, et **seul le déployeur** du vault peut le réclamer avec `claim`. Le fee n’alimente pas les murs de CUBIT. Comme tout dépôt reçu par ce vault, il suit ensuite la règle de blocage décrite plus haut.

Le montant `launchFee()` est fixé à la construction de chaque Forge : il vaut **0,005 ETH**, soit 5 × 10^15 wei, et il est immuable. Changer les frais demande donc une nouvelle Forge ; relisez toujours le montant on-chain du contrat réellement utilisé.

## Si Forge est remplacée

L’équipe peut remplacer la Forge à tout moment, sans délai. Le remplacement change la factory de référence pour les futurs lancements, et avec elle le vault de gouvernance qui reçoit leurs fees ; il désactive la Forge jusqu’à sa réactivation. Les enfants déjà créés conservent leurs propres contrats et leurs fonds. Un launchpad v2 peut ainsi fixer d’autres paramètres pour ses propres lancements.

Les contrôles de compatibilité du registre ne remplacent pas une revue du template et de la factory.

## Un launchpad v2

Les paramètres des enfants sont imposés par la Forge enregistrée. Une Forge de remplacement, un launchpad v2, peut en fixer d’autres ; l’équipe l’ouvre quand elle le décide.

Les enfants déjà lancés continuent de fonctionner sur leurs propres pools, et les tokens absorbés par leurs murs vont toujours au vault de gouvernance de la Forge qui les a lancés.

<p class="source-note">Sources : décisions de design des 14 et 15 septembre 2026, <code>periphery/CubitForge.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>CubitHook.absorbedTokenSink</code>, <code>CubitV2.setForge</code> et <code>dapp/src/pages/Momentum.tsx</code>.</p>
