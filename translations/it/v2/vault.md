---
description: "Deposito CUBIT non trasferibile, blocco di 24 ore e ricompensa del 3% al giorno in CUBIT, pagata esclusivamente da una riserva e limitata a un giorno."
section: "03 / MODULI V2"
reading: "5 MIN DI LETTURA"
search:
  keywords: ["vault", "staking", "stake", "blocco", "lock", "prelievo", "ricompensa", "ricompensa", "riserva", "riserva", "claim", "mCUBIT"]
---

# mCUBIT Vault

Il Vault permette di depositare CUBIT in una posizione **non trasferibile** e di ricevere una ricompensa **in CUBIT**. Il suo modello non crea CUBIT e non concede alcun diritto sui fondi dei muri.

Il nome mCUBIT indica questa esperienza di deposito; il codice non crea un token di ricevuta ERC-20 liberamente trasferibile.

> **Aperto su Ethereum dal 26 settembre 2026.**

## Da dove proviene la ricompensa

La ricompensa viene pagata **esclusivamente dalla riserva di ricompense** del Vault, mai dal capitale depositato. Questa riserva è alimentata da:

- il **20% dell’offerta**, ossia 4,2 milioni di CUBIT, versato al lancio;
- i **CUBIT dei muri interamente attraversati**, inviati da `deliverAbsorbed()` dopo le vendite;
- qualsiasi apporto volontario: qualunque account può aggiungere CUBIT alla riserva con `fundRewardReserve(amount)`.

La riserva è finita: quando è vuota, le ricompense si interrompono. **La ricompensa è esclusivamente in CUBIT**, riscossa con `claimCubit()`, e nessun rendimento è garantito.

## Il tasso e il suo tetto

La ricompensa vale il **3% del deposito al giorno**, calcolata in proporzione al tempo trascorso dall’ultima riscossione.

L’importo riscuotibile è **limitato a un giorno**: dopo 24 ore senza riscossione, non aumenta più. Per ricevere la ricompensa completa bisogna riscuotere ogni giorno; **l’eccedenza non riscossa va persa**.

| Tempo dall’ultima riscossione | Importo riscuotibile per 1 000 CUBIT depositati |
| --- | --- |
| 12 ore | 15 CUBIT |
| 24 ore | 30 CUBIT |
| 48 ore | 30 CUBIT: il secondo giorno va perso |

Questi importi presuppongono una riserva sufficiente. Se la riserva contiene meno dell’importo dovuto, viene versato solo il suo saldo.

## Depositare CUBIT

1. Verifica l’indirizzo del Vault proposto e il suo collegamento al protocollo.
2. Autorizza il Vault a trasferire l’importo scelto.
3. Chiama `stake(amount)` e attendi la conferma.
4. Leggi `balanceOf(account)`, `unlockAt(account)` e `pendingCubit(account)` sul contratto di deposito.

**Ogni deposito aggiuntivo riavvia il blocco di 24 ore dell’intera posizione di quel wallet in quel Vault.** Versa inoltre la ricompensa maturata fino a quel momento e fa ripartire il giorno di conteggio.

I CUBIT depositati restano token esistenti. Un deposito non è né un burn né una riduzione dell’offerta.

## Riscuotere e prelevare

`claimCubit()` versa la ricompensa maturata e fa ripartire il giorno di conteggio. Il blocco del prelievo non impedisce questa riscossione.

`withdraw(amount)` restituisce i CUBIT depositati quando il timestamp della catena raggiunge `unlockAt`. Il prelievo può essere parziale; versa prima la ricompensa maturata.

Nessuno può sospendere queste uscite. Restano soggette alle regole e al corretto funzionamento del contratto che detiene la posizione.

## Se il Vault viene sostituito

Il team può sostituire il Vault in qualsiasi momento, senza ritardo. La sostituzione riguarda il contratto proposto per i nuovi depositi e quello che riceve i CUBIT assorbiti inviati in seguito. **I CUBIT depositati, la riserva di ricompense e le date di sblocco già registrati restano nel vecchio Vault.** La sostituzione non sposta i fondi dell’utente.

Il registro conserva l’elenco dei Vault successivi. Verifica l’indirizzo selezionato prima di leggere un saldo, riscuotere o prelevare. Un’approvazione del Vault precedente non autorizza quello nuovo.

Il registro richiede un nuovo Vault collegato allo stesso hook e allo stesso token, senza stake. La sostituzione disattiva il Vault: il nuovo contratto accetta depositi solo dopo la sua riattivazione.

## I limiti del modulo

La ricompensa dipende dal saldo della riserva: un tasso del 3% al giorno può esaurirla, e a quel punto i versamenti si interrompono. I controlli di sostituzione verificano la compatibilità dichiarata degli indirizzi; non dimostrano la sicurezza di tutto il codice sostitutivo. La contabilità della riserva, il tetto di un giorno, l’arrivo dei CUBIT dei muri e le uscite dai vecchi Vault devono essere validati per ogni rilascio.

<p class="source-note">Fonti: <code>periphery/CubitVault.sol</code> (<code>pendingCubit</code>, <code>claimCubit</code>, <code>fundRewardReserve</code>, <code>DAILY_REWARD_BPS</code>, <code>REWARD_PERIOD</code>, <code>LOCK_DURATION</code>), <code>CubitHook.deliverAbsorbed</code>, <code>CubitV2.setVault</code> e le decisioni di design del 14 settembre 2026.</p>
