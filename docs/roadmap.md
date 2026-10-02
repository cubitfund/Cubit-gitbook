---
description: "Les étapes de la refonte, les prochaines releases CUBIT, leurs fenêtres et les conditions de validation."
section: "05 / VÉRIFIER"
reading: "5 MIN DE LECTURE"
search:
  keywords: [roadmap, calendrier, ouverture, V1, V2, refonte, etapes, étapes, launchpad]
---

# Roadmap et conditions de sortie

Le calendrier décrit une intention de publication. **La cadence de release ne remplace pas la validation du code.** Une fonctionnalité qui déplace des fonds doit être préparée, testée et acceptée avant son ouverture.

Les références `roadmapdev.md` et l’ancienne roadmap du dapp contiennent des règles dépassées. Cette page reprend les jalons en distinguant le travail décidé, le code écrit et les versions déjà attestées.

## Le préalable actuel

Le protocole est en cours de refonte : **une bande de liquidité unique** remplace le ladder, **les murs sont posés et vidés à chaque vente** et le vault verse une récompense en CUBIT depuis une réserve. La FDV de lancement retenue est de **3,75 ETH**.

Cette nouvelle version est déployée sur le réseau principal Ethereum, marché ouvert depuis le 22 septembre 2026. Le déploiement Sepolia sert aux tests.

## Les étapes de la refonte

| Étape | Contenu | Statut |
| --- | --- | --- |
| 1 | Bande large au lancement ; retrait du ladder, de `rebalance`, de `raiseFloor` et des keepers | Codée et testée en local |
| Vaults | Vault à 3 % par jour en CUBIT et vault de gouvernance du launchpad | Codés et testés en local |
| 2 | Murs créés à chaque vente ; CUBIT des murs traversés vers le vault ; tokens des enfants vers le vault de gouvernance | Codée et testée en local |
| 3 | Nettoyage : retrait du flux WETH, de la pause et du guardian, et des erreurs inutilisées | Codée et testée en local |
| 4 | Lancement en une transaction : 80 % dans la bande, 20 % dans la réserve du vault, achat de 0,1 ETH | Codée et testée en local |
| 5 | Réécriture des tests et des invariants | Pas encore faite |

## Les jalons

| Jalon | Fonction | Statut et condition |
| --- | --- | --- |
| J0 | Marché V1 | Nouvelle version déployée sur Ethereum, marché ouvert le 22 septembre 2026 au bloc 26 035 793 |
| 23 septembre 2026 | Momentum | Ouvert : page de l’app en lecture seule, avec les murs actifs, entamés et traversés de chaque token |
| 23 septembre 2026 | Forge publique | Ouverte : launchpad ouvert à tous, ajouté ce jour-là avec son vault de gouvernance, fee de lancement de 0,005 ETH |
| 26 septembre 2026 | mCUBIT Vault | Ouvert : lock de 24 h, récompense de 3 % par jour en CUBIT depuis la réserve |
| À définir | Token du launchpad | Pas encore conçu ; les avoirs du vault de gouvernance lui serviront de NAV |

Aucune fonctionnalité ne s’ouvre toute seule : l’équipe a ouvert Momentum et la Forge le 23 septembre 2026, puis le Vault le 26 septembre 2026, par des transactions explicites. L’administration des modules par l’adresse équipe est permanente.

## Conditions pour le Vault

La comptabilité des récompenses doit tenir face aux dépôts, retraits, réclamations, au plafond d’une journée, aux arrondis et aux remplacements, avec zéro création de CUBIT, aucun paiement depuis le principal et aucun accès aux fonds des murs. La réserve est alimentée au lancement, puis par les murs traversés.

## Conditions pour Momentum et Forge

Momentum reste une lecture seule : les murs actifs, entamés et traversés de chaque token. La Forge doit conserver l’isolation des enfants et le contrôle du template ; l’envoi des tokens de leurs murs au vault de gouvernance est en service sur Ethereum depuis le 23 septembre 2026. Rien ne s’ouvre avec l’écoulement du temps : l’équipe a ajouté le launchpad, puis l’a ouvert, par des transactions explicites.

## Conditions pour une version de production

La release doit publier ses identités, ses paramètres de compilation, les bibliothèques liées, les bytecodes attendus et les permissions. Les tests doivent porter sur les sources finales et être reliés à cette release.

L’adaptation du dapp, dont le découpage des ventes qui traversent de nombreux murs, les parcours wallets réels, les agrégateurs, les services et la surveillance complètent les tests locaux. Un déploiement ne constitue pas une acceptation automatique de ces nouveaux changements.

## Les annonces historiques à requalifier

Un « floor qui ne fait que monter », un crossing de breakeven à une capitalisation prédéfinie, un token « déflationniste » par le burn des murs ou une « immutabilité totale » ne décrivent pas la nouvelle version et ses permissions.

Les communications doivent indiquer le mur financé, sa cible, les fonds placés et la version du protocole. Les résultats historiques restent consultables comme tels dans les [sources](sources.md).
