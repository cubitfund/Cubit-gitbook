---
description: "Les identités fixes du cœur, l’absence d’administrateur du hook et les pouvoirs permanents de l’adresse équipe sur les modules du registre."
section: "05 / VÉRIFIER"
reading: "5 MIN DE LECTURE"
search:
  keywords: [permissions, equipe, équipe, setters, remplacement, administrateur, authority, admin, gouvernance]
---

# Permissions et remplacements

CUBIT distingue un cœur aux identités fixes, sans administrateur, et une adresse équipe qui administre les modules périphériques. **Les pouvoirs de l’adresse équipe sont permanents.**

## Ce qui reste fixé

Le token, le hook principal, le PoolManager, le poolId et l’ancre du registre ne sont pas remplacés par les setters périphériques.

Le token autorise son hook via un raccordement unique. Les taux du cœur, la FDV de lancement et la géométrie de la bande n’ont pas de setter, et la bande n’est jamais retirée une fois posée. Une nouvelle politique modifiant le cœur demande une nouvelle version, sa validation et son déploiement ; elle ne met pas automatiquement à jour un ancien pool.

## Aucun administrateur du hook

Le hook n’a **aucun administrateur**, et personne ne peut mettre en pause les swaps ni le mécanisme des murs.

Aucune adresse ne peut donc suspendre une vente ou le placement d’un mur. Les règles du hook s’appliquent telles qu’elles ont été déployées.

## Le rôle de l’équipe

L’adresse équipe, `TEAM_ADDRESS`, est figée dans le hook et sert d’`authority()` au registre `CubitV2`. Ses pouvoirs sont permanents : elle reçoit la part équipe des taxes, 3 % à l’achat et 3 % à la vente, et elle remplace puis active les modules du registre. Elle peut remplacer le Vault, le routeur, le Lens ou la Forge **à tout moment et immédiatement**, sans délai d’annonce. Les quatre adresses remplaçables sont :

| Setter | Contrôles de raccordement principaux | Conséquence |
| --- | --- | --- |
| `setVault(next)` | Code présent, même hook et même token, Vault neuf sans stake | Nouveau contrat de référence pour les futurs dépôts et pour les CUBIT absorbés envoyés ensuite |
| `setRouter(next)` | Code présent, même hook/PoolManager/poolId | Routeur courant remplacé : celui que la dapp utilise |
| `setLens(next)` | Code présent, même hook/PoolManager/poolId/token | Contrat de lecture courant remplacé |
| `setForge(next)` | Code présent, même hook, vault de gouvernance avec du code | Launchpad de référence, absent au lancement, enregistré ou remplacé pour les futurs lancements, avec le vault de gouvernance qui reçoit leurs fees |

Chaque changement émet `ModuleUpdated`, incrémente `moduleRevision` et referme la fonctionnalité concernée jusqu’à ce que l’équipe la rouvre : remplacer le Vault, le Lens ou la Forge referme respectivement le Vault, Momentum ou la Forge ; remplacer le routeur ne referme aucune fonctionnalité. Vérifiez la nouvelle adresse et son code avant une opération.

## La portée d’un remplacement

Un remplacement prend effet dès sa transaction. Il permet de choisir :

- où vont les CUBIT absorbés par les murs de CUBIT lors des envois suivants : le hook les livre au Vault enregistré ;
- où vont les futurs fees de lancement : la Forge enregistrée les verse à son propre vault de gouvernance ;
- quel routeur la dapp utilise.

Il ne touche pas :

- le cœur : token, hook, bande, murs et taxes ;
- les soldes déjà présents dans les vaults existants, principal et réserve de récompenses.

L’équipe protège la clé privée de cette adresse.

## Les limites des contrôles de compatibilité

Des getters déclarant les bonnes adresses démontrent un raccordement attendu, pas la sûreté de tout le code candidat. Ils ne prouvent pas l’absence de proxy ou de comportement malveillant dans une future implémentation.

L’équipe choisit donc le code périphérique utilisé pour les opérations futures. Cette capacité impose de vérifier chaque remplacement, son bytecode et ses interactions.

## Les fonds déjà déposés

Un remplacement de Vault ne transfère ni les CUBIT déposés ni la réserve de récompenses de l’ancien contrat. Ses positions, ses échéances et ses sorties demeurent dans cet ancien Vault. Le registre conserve la liste des Vaults et le frontend doit continuer à exposer ces positions.

Un ancien routeur reste utilisable pour échanger et reste soumis aux taxes du hook ; une approval accordée à l’ancien routeur ne vaut pas pour le nouveau.

Remplacer Forge concerne les lancements futurs ; les enfants déjà créés gardent leurs contrats et le vault de gouvernance de la Forge qui les a lancés.

Ces setters ne réparent pas rétroactivement un contrat défectueux et ne déplacent pas des fonds qu’il détiendrait. La possibilité d’appeler une sortie on-chain et sa disponibilité dans le frontend doivent être vérifiées séparément.

## Le vault de gouvernance du launchpad

Le vault de gouvernance n’a ni administrateur ni sortie anticipée. Il reçoit les fees de lancement en ETH et les tokens absorbés par les murs des enfants : chaque dépôt y reste bloqué 30 jours à partir de sa réception, puis **seul son déployeur** peut le réclamer. Ce droit vaut pour toujours et aucune fonction ne permet de le transférer : c’est une confiance explicite envers ce compte. Ce déployeur peut allonger le blocage de tout le vault, dépôts présents et futurs, quand il veut ; aucune fonction ne le raccourcit.

## Approvals et signatures

Une approval est attachée à un **spender précis**. Elle ne suit pas l’adresse courante du registre. Le frontend doit revalider l’opération lorsque la révision ou les modules changent, notamment entre une approval et un swap.

Chaque action du protocole est une transaction : vérifiez son adresse cible et la chaîne avant de la signer.

<p class="source-note">Sources : <code>CubitV2.sol</code>, <code>CubitHook.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>contracts/docs/MODULE_SETTERS.md</code> et les contrôles frontend <code>releases.ts</code> / <code>vault.ts</code>.</p>
