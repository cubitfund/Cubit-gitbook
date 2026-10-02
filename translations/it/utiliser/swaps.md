---
description: "Il percorso di acquisto e vendita CUBIT: versione del pool, quotazione netta, slippage, approvazioni e ricevuta della transazione."
section: "02 / USARE"
reading: "5 MIN DI LETTURA"
---

# Comprare e vendere

La dapp propone uno scambio ETH/CUBIT tramite il router del deployment selezionato. Le tasse vengono applicate nell’hook; l’importo stimato da ricevere deve essere già al netto delle tasse incluse nella quotazione.

> La dapp collegata a Ethereum usa la versione attuale, con **commissioni LP dello 0,01%**, e legge l’ABI di questa versione. Finché il mercato non è aperto, nessuno scambio è possibile. Una dimostrazione o una modalità simulazione non è uno stato on-chain.

## Prima di preparare uno swap

Verifica la rete del wallet, il deployment mostrato e il blocco dei dati. Prevedi ETH per il gas oltre all’importo da scambiare. La dapp deve segnalare un RPC indisponibile o dati obsoleti e impedire una firma basata su uno stato non verificato.

Un cambio di account, rete, importo o indirizzo del router richiede una nuova quotazione. Gli indirizzi periferici possono cambiare tramite il registro V2.

## Comprare CUBIT

1. Scegli un importo in ETH. In exact-input, la tassa d’acquisto del 3% è inclusa nell’importo.
2. Leggi il numero netto di CUBIT stimato, le commissioni e il minimo ricevuto fissato dalla tolleranza di slippage.
3. Verifica la simulazione e i dettagli presentati dal wallet, poi firma.
4. Attendi una ricevuta riuscita e l’aggiornamento dei saldi on-chain.

L’acquisto usa ETH nativi tramite `msg.value`. Il router CUBIT non usa Permit2 per questo percorso. Nella nuova versione, un acquisto preleva CUBIT dalla banda seguendo la sua curva x·y=k.

## Vendere CUBIT

La vendita può richiedere un’**approvazione ERC-20** che consenta al router di trasferire la quantità di CUBIT scelta. Il frontend prepara un’autorizzazione per l’importo richiesto.

Dopo la conferma dell’approvazione, la dapp ricontrolla account, rete, revisione del registro e aggiornamento della quotazione prima dello swap. Approvazione e vendita sono due transazioni distinte quando l’autorizzazione era insufficiente.

La vendita restituisce ETH al netto della tassa del 15%: il 12% degli ETH lordi finanzia i muri e il 3% va al team. Nella nuova versione, la vendita svuota i muri che attraversa interamente e colloca gli ETH in attesa in un muro; il router CUBIT invia poi i CUBIT assorbiti alla riserva del vault.

## Il minimo ricevuto e la scadenza

Lo **slippage** limita lo scarto accettato rispetto alla quotazione. Una tassa già inclusa nella quotazione non giustifica l’aggiunta arbitraria di 15 punti di slippage.

Nelle fonti del frontend lette, una quotazione resta aggiornata per **30 secondi**. La scadenza della transazione è calcolata dal timestamp della catena. Questi controlli possono impedire la firma dopo una lunga attesa dell’approvazione; occorre allora rivedere una quotazione aggiornata.

Una transazione rifiutata dai limiti protegge l’importo minimo o massimo concordato. Il suo fallimento non significa che quel limite vada rimosso.

## Se la transazione non riesce

| Situazione | Azione utile |
| --- | --- |
| Rete errata o account cambiato | Tornare al contesto desiderato e richiedere una nuova quotazione |
| Quotazione scaduta | Ricalcolare l’importo netto e il minimo ricevuto |
| Router o revisione cambiati | Rivedere l’indirizzo corrente e la nuova azione; la vecchia approvazione resta legata al vecchio spender |
| Liquidità insufficiente | Verificare una quotazione per un importo minore e le posizioni presenti |
| Vendita che attraversa moltissimi muri | Suddividere la vendita: oltre circa 88 muri attraversati, supera il limite di gas di una transazione |
| RPC indisponibile | Attendere una lettura on-chain valida prima di firmare |
| Transazione già inviata | Verificare hash e ricevuta prima di prepararne un’altra |

Il router rifiuta un ingresso non interamente consumato e un’uscita esatta non interamente soddisfatta. I fondi spesi in una transazione annullata vengono ripristinati dall’EVM, escluso il gas.

## Controllare il risultato

Un hash significa che la transazione è stata inviata; solo la ricevuta ne indica il successo. Verifica la rete dell’explorer, lo stato, il destinatario e gli eventi `BuyTaxed` o `SellTaxed`.

I prezzi di riferimento dei muri non sostituiscono la quotazione di uno specifico ordine. [Leggere i dati della dapp](preuves.md).

<p class="source-note">Fonti: <code>dapp/src/chain/swap.ts</code>, <code>executeSwap.ts</code>, <code>deployment.ts</code> e <code>contracts/src/periphery/CubitRouter.sol</code>. Il collaudo con wallet browser e mobile resta distinto dai test automatizzati.</p>
