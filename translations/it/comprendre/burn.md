---
description: "Cosa diventa un muro raggiunto dalle vendite: se parzialmente consumato resta al suo posto; se interamente attraversato, viene svuotato e i suoi CUBIT confluiscono nella riserva di ricompense del vault, senza burn."
section: "01 / CAPIRE"
reading: "4 MIN DI LETTURA"
search:
  keywords: ["assorbimento", "attraversato", "attraversare", "consumato", "riserva", "riserva", "vault", "ricompense", "ricompense", "burn", "distruzione", "governance", "deliverAbsorbed"]
---

# Muri attraversati e riserva del vault

Quando una vendita raggiunge un muro, gli ETH di quel muro riacquistano CUBIT. Nella nuova versione, questi CUBIT **non vengono più bruciati**: quelli di un muro interamente attraversato confluiscono nella **riserva di ricompense del vault**.

## Parzialmente consumato o interamente attraversato

| Stato del muro | Cosa succede |
| --- | --- |
| Non raggiunto | Il muro contiene solo ETH, al suo tick |
| Parzialmente consumato | Una parte dei suoi ETH ha riacquistato CUBIT; il muro resta al suo posto |
| Prezzo risalito dopo un muro parzialmente consumato | Il muro rivende i suoi CUBIT e si ricarica di ETH |
| Interamente attraversato | Il muro contiene ormai solo CUBIT; la vendita che lo ha attraversato lo svuota, i suoi CUBIT attendono l’invio e i suoi ETH residui tornano a `pendingFloorEth` |

Un muro viene svuotato solo quando è **interamente attraversato**. Finché è solo parzialmente consumato, l’hook non lo tocca: continua a funzionare come una normale posizione LP al suo tick. Una stessa vendita svuota tutti i muri che ha interamente attraversato, dal più vicino al più lontano.

## Il percorso dei CUBIT

```text
Una vendita attraversa interamente un muro
    → la vendita svuota il muro
    → i suoi CUBIT attendono in pendingAbsorbedTokens
    → deliverAbsorbed() li invia alla riserva di ricompense del vault
```

Il router CUBIT chiama `deliverAbsorbed()` alla fine di ogni vendita, nella stessa transazione. Se questo invio fallisce, la vendita non viene bloccata: i CUBIT restano isolati nell’hook. Dopo una vendita passata per un altro router, o dopo un invio non riuscito, qualunque account può chiamare `deliverAbsorbed()`, senza scegliere né destinatario né importo. La riserva paga poi la ricompensa giornaliera dei depositanti del vault. [mCUBIT Vault](../v2/vault.md).

## L’offerta non diminuisce più

L’offerta resta fissata a **21 milioni di CUBIT**, senza mint. Poiché i CUBIT dei muri non vengono più distrutti, l’offerta non diminuisce più con gli assorbimenti: CUBIT non viene più presentato come deflazionistico. Solo la polvere di arrotondamento del deposito iniziale, trascurabile, viene bruciata al lancio.

I CUBIT versati come ricompense dalla riserva sono token ordinari: i beneficiari possono conservarli, depositarli o venderli.

## I figli Forge

Per un mercato figlio creato dalla Forge, i token dei muri svuotati non vanno a un vault di staking: `deliverAbsorbed()` li invia al **vault di governance del launchpad**, il cui indirizzo è fissato nella Forge che ha distribuito il token figlio. Ogni deposito vi resta bloccato per 30 giorni a partire dalla propria ricezione, e solo il deployer di quel vault può riscuoterli. [Momentum e Forge](../v2/momentum-forge.md).

## Cosa non garantisce l’assorbimento

Un muro che assorbe una vendita spende i suoi ETH. Un muro parzialmente consumato si ricarica di ETH solo se il prezzo risale sopra di esso; un muro svuotato ritrova profondità solo se un nuovo finanziamento cade sul suo tick.

Le prove del vecchio strict-burn non validano questo nuovo percorso. È in funzione su Ethereum dal 22 settembre 2026. [I limiti noti](../securite/risques.md).

## Verificare i movimenti

Per seguire un assorbimento, riconcilia gli eventi dell’hook: `WallAbsorbed(id, cubit, ethRemaining)` per ogni muro svuotato, `TokensAbsorbed(amount, pendingAbsorbedTokens)` per il totale messo in attesa, poi `AbsorbedDelivered(sink, amount)` all’invio. Lato destinazione, il vault emette `RewardReserveFunded`; per un figlio Forge, il vault di governance emette `Deposited`.

<p class="source-note">Fonti: decisioni di design del 14 settembre 2026, <code>CubitHook._collectCrossedWalls</code>, <code>deliverAbsorbed</code>, <code>absorbedTokenSink</code>, <code>WallLib.collectCrossed</code>, <code>CubitRouter._finishSwap</code>, <code>CubitVault.fundRewardReserve</code> e <code>periphery/CubitGovernanceVault.sol</code>.</p>
