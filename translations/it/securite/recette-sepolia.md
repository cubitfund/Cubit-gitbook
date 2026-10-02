---
description: "Piano di test manuale su Sepolia per la nuova versione: banda, swap, tasse, muri, vault, sostituzioni, rifiuti attesi e scheda di rilevazione numerata."
section: "05 / VERIFICARE"
reading: "PIANO DI TEST NUMERATO"
search:
  keywords: ["collaudo", "test", "testnet", "Sepolia", "manuale", "checklist", "piano", "gravita", "gravità", "rilevazione", "rilevazione", "rifiuti"]
---

# Piano di test manuale su Sepolia

Questa pagina è una **lista di controllo da eseguire a mano**, sulla rete di test Sepolia, da una persona dotata di un wallet. Ogni caso ha un numero stabile nella forma `T-01`, citabile in un rapporto.

> **Prima di iniziare.** Questo piano riguarda la nuova versione. Il manifest pubblico del repository descrive il deployment Sepolia **in servizio**, con commissioni LP `100`: questo piano vi si applica. Un caso non pertinente per la versione testata si annota “fuori dall’ambito della versione”, mai “fallimento”.

I valori citati provengono dal codice della nuova versione, in `contracts/src/`, e dalle decisioni di design del 14 settembre 2026. Un comportamento che non è stato possibile stabilire è contrassegnato come **“da confermare durante il test”**.

## Come usare questo piano

Ogni sezione presenta i suoi casi in una tabella a sei colonne. Le ultime due si compilano durante il collaudo.

| Colonna | Cosa si scrive |
| --- | --- |
| Caso | L’identificatore stabile, da `T-01` a `T-110` |
| Precondizioni | Ciò che deve essere vero prima di iniziare |
| Passaggi | Le azioni, in ordine |
| Risultato atteso | Ciò che il codice e le decisioni prevedono |
| Risultato osservato | Ciò che è accaduto, con l’hash della transazione o il blocco di lettura |
| Gravità | Vuoto se conforme; altrimenti Bloccante, Maggiore, Minore o Cosmetico |

| Gravità | Criterio |
| --- | --- |
| Bloccante | Perdita o blocco di fondi, tassa non prelevata, muro perso, ricompensa pagata dal capitale |
| Maggiore | Comportamento contrario alle fonti, rifiuto mancante, cifra mostrata errata |
| Minore | Scostamento di visualizzazione senza conseguenze on-chain, messaggio impreciso |
| Cosmetico | Tipografia, impaginazione, etichetta |

Una transazione **rifiutata in conformità a un caso di rifiuto è un successo**. Un hash significa solo che la transazione è stata inviata: solo la ricevuta ne indica la riuscita.

**Alcuni casi non passano dall’interfaccia.** Nelle sue fonti attuali, la dapp legge l’ABI della versione in servizio e non espone né gli ordini con uscita esatta, né `claimTeam()`, né le letture dettagliate dei muri. Questi casi sono contrassegnati come “chiamata diretta”: si eseguono con uno strumento di chiamata dei contratti, sugli indirizzi del manifest del deployment testato.

## 1. Preparazione

Annota questi elementi **prima** del primo swap: servono da riferimento per tutti i confronti successivi.

- La rete: Sepolia, identificatore di catena `11155111`.
- Gli indirizzi del deployment testato, letti nel suo manifest: token, hook, PoolManager, `poolId`, router, Lens, registro V2, Vault, contratto di lancio; poi, una volta aggiunto il launchpad, vault di governance e Forge. **Non copiare alcuna chiave privata nei tuoi appunti.**
- I parametri fissi: `fee`, `tickSpacing`, `LAUNCH_ETH`, `MIN_POOL_SUPPLY`, `launchTimestamp`, `moduleRevision`.
- Lo stato iniziale: `snapshot()` del Lens, `band()` dell’hook, `totalSupply()` e `totalBurned()` del token, `pendingFloorEth`, `pendingAbsorbedTokens`, `wallCount()`, `activeWallCount()`, `teamAccrued`, `teamPaidCumulative`, `rewardReserve()` del Vault e il **numero di blocco** di lettura.

Prevedi ETH di test **in aggiunta** agli importi scambiati: ogni transazione paga il proprio gas e diversi casi richiedono transazioni rifiutate, che ne consumano anch’esse.

| Caso | Precondizioni | Passaggi | Risultato atteso | Risultato osservato | Gravità |
| --- | --- | --- | --- | --- | --- |
| T-01 | Wallet installato | Selezionare Sepolia; aprire la dapp collegata alla versione testata | La rete è riconosciuta; nessun invito a firmare su un’altra catena |  |  |
| T-02 | Account nuovo | Rifornire di ETH di test tramite un faucet Sepolia | Saldo visibile nel wallet e nella dapp dopo l’aggiornamento |  |  |
| T-03 | Manifest a portata di mano | Confrontare ogni indirizzo mostrato con quello del manifest | Identità identiche; `poolId`, `fee` e `tickSpacing` coincidono |  |  |
| T-04 | Nessuno swap ancora emesso | Leggere `snapshot()` e annotare il blocco | Valori di riferimento registrati, blocco identificato |  |  |
| T-05 | Chiamata diretta | Leggere `poolKey()` dell’hook | `currency0` uguale all’indirizzo zero, `fee = 100`, `tickSpacing = 10`, `hooks` uguale all’hook |  |  |
| T-06 | Registro V2 leggibile | Leggere `moduleRevision()` e gli indirizzi dei moduli | Revisione annotata; qualsiasi evoluzione durante il collaudo impone di ricontrollare prima di ogni firma |  |  |

## 2. Lancio e banda

All’inizializzazione del pool, l’hook colloca **tutto il suo deposito** in un’unica posizione `[minUsableTick, tickUpper]`, identificata da `BAND_SALT`. `tickUpper` è il tick di apertura arrotondato per difetto allo spacing, così la posizione contiene solo CUBIT. L’hook rifiuta un deposito inferiore a `MIN_POOL_SUPPLY`, ossia l’80% dell’offerta, e brucia la polvere di arrotondamento.

Il lancio completo versa anche il 20% dell’offerta alla riserva del Vault ed effettua un acquisto di 0,1 ETH nella stessa transazione.

| Caso | Precondizioni | Passaggi | Risultato atteso | Risultato osservato | Gravità |
| --- | --- | --- | --- | --- | --- |
| T-07 | Lancio effettuato, chiamata diretta | Leggere `band()` | `lower = −887 270`; `upper` uguale al tick di apertura arrotondato per difetto al multiplo di 10, ossia `155 390` per una FDV di 3,75 ETH; liquidità non nulla |  |  |
| T-08 | Transazione di lancio nota | Leggerne gli eventi | `BandBootstrapped(lower, upper, liquidity, tokens)` emesso una sola volta, con i valori di `band()`; `tokens` uguale al deposito meno una polvere di arrotondamento |  |  |
| T-09 | Lancio senza acquisto iniziale | Leggere `bandEth` e `bandTokens` in `snapshot()` prima di qualsiasi swap | `bandEth = 0`; `bandTokens` uguale al deposito, salvo arrotondamenti |  |  |
| T-10 | Lancio effettuato, chiamata diretta | Leggere `token.balanceOf(hook)` | Zero, salvo trasferimento diretto di terzi: l’hook non conserva alcun CUBIT grezzo dopo l’inizializzazione |  |  |
| T-11 | Chiamata diretta | Tentare di aggiungere liquidità al pool | Rifiuto `ExternalLiquidityForbidden`: l’hook è l’unico fornitore di liquidità |  |  |
| T-12 | Deployment di prova | Inizializzare il pool con un deposito inferiore a `MIN_POOL_SUPPLY` | Rifiuto `SupplyNotDeposited`; nessuna banda collocata |  |  |
| T-13 | Lancio completo | Leggere `rewardReserve()` del Vault dopo la transazione di lancio | Riserva pari al 20% dell’offerta, ossia 4,2 milioni di CUBIT; nessuna allocazione al team né airdrop |  |  |
| T-14 | Lancio completo | Leggere l’acquisto del deployer nella transazione di lancio | Acquisto di 0,1 ETH; `BuyTaxed` con il 3% per il team; CUBIT ricevuti liberamente trasferibili |  |  |
| T-15 | Acquisto confermato, chiamata diretta | Ricalcolare l’uscita attesa a partire dalle riserve virtuali della banda | Uscita coerente con la curva x·y=k dopo la tassa del 3% e le commissioni LP; all’inizio, 16,8 milioni di CUBIT contro 3 ETH virtuali — da confermare durante il test |  |  |
| T-16 | Acquisto e poi rivendita dei CUBIT acquistati | Leggere `bandEth` prima, in mezzo e dopo | `bandEth` aumenta con l’acquisto e poi torna verso il valore di partenza; non supera mai gli ETH realmente apportati dagli acquisti |  |  |

## 3. Percorso di acquisto e di vendita

Il router espone `swapExactIn(key, zeroForOne, amountIn, amountOutMin, recipient, deadline)` e `swapExactOut(key, zeroForOne, amountOut, amountInMax, recipient, deadline)`. `zeroForOne = true` compra CUBIT con ETH.

**Nelle fonti attuali della dapp, l’interfaccia usa solo l’ingresso esatto.** L’utente inserisce sempre l’importo che paga; la quantità ricevuta è un campo di sola lettura. I percorsi con uscita esatta vanno quindi testati tramite chiamata diretta al router.

Un acquisto invia ETH nativi in `msg.value`. Una vendita invia un valore nullo e richiede un’**approvazione ERC-20** del CUBIT al router: l’interfaccia chiede l’autorizzazione **per l’importo esatto**, mai illimitata, quindi una vendita più grande richiede una nuova autorizzazione.

Il router rifiuta i riempimenti parziali: un ingresso esatto non interamente consumato attiva `IncompleteInput`, un’uscita esatta non interamente soddisfatta attiva `InsufficientOutput`. Poiché la tassa è dimensionata sull’importo richiesto, l’annullamento protegge l’utente.

Impostazioni dell’interfaccia lette nelle fonti della dapp, da verificare durante il collaudo: tolleranza di slippage **predefinita all’1,0%**, inserimento limitato a **due decimali** e all’intervallo da `0` a `99,99`; minimo ricevuto calcolato con interi e **arrotondato per eccesso al wei**; quotazione **aggiornata per 30 secondi**; scadenza on-chain = timestamp della catena **più 120 secondi meno l’età della quotazione**.

| Caso | Precondizioni | Passaggi | Risultato atteso | Risultato osservato | Gravità |
| --- | --- | --- | --- | --- | --- |
| T-17 | Saldo ETH sufficiente | Acquistare un piccolo importo, per esempio 0,001 ETH | Ricevuta riuscita; CUBIT accreditati; evento `BuyTaxed` emesso |  |  |
| T-18 | Saldo ETH elevato | Acquistare un importo elevato | Ricevuta riuscita; l’impatto sul prezzo si vede nella quotazione, non nell’aliquota della tassa |  |  |
| T-19 | CUBIT nel portafoglio | Approvare e poi vendere | Due transazioni distinte; ETH netti ricevuti; `SellTaxed` emesso |  |  |
| T-20 | Vendita precedente confermata | Vendere un importo **superiore** al precedente | Viene richiesta una nuova autorizzazione: l’approvazione riguardava l’importo esatto |  |  |
| T-21 | Schermata di swap aperta | Leggere la tolleranza proposta senza modificarla | Valore predefinito **1,0%** |  |  |
| T-22 | Schermata di swap aperta | Inserire `0.005`, poi `100`, poi un valore negativo | Inserimenti rifiutati con un messaggio sull’intervallo 0–99,99 e sui due decimali |  |  |
| T-23 | Quotazione aggiornata | Impostare la tolleranza sul valore più basso accettato, attendere un movimento di prezzo, poi firmare | Rifiuto `TooLittleReceived(received, minimum)`; nessun token perso; l’interfaccia non invita a rimuovere la protezione |  |  |
| T-24 | Quotazione mostrata | Lasciar passare più di 30 secondi senza azioni, poi tentare di firmare | La quotazione è considerata obsoleta e ricalcolata prima di qualsiasi firma |  |  |
| T-25 | Quotazione quasi obsoleta | Firmare poco prima della scadenza e leggere la scadenza trasmessa | La scadenza vale 120 secondi **meno** l’età della quotazione: una quotazione di 30 secondi lascia circa 90 secondi |  |  |
| T-26 | Chiamata diretta | Chiamare `swapExactIn` con una scadenza già superata | Rifiuto `Expired`; nessun movimento di fondi |  |  |
| T-27 | Chiamata diretta | Chiamare `swapExactOut` per un acquisto, con un limite d’ingresso ampio | Quantità esatta ricevuta; eccedenza di ETH rimborsata al caller nella stessa transazione |  |  |
| T-28 | Chiamata diretta | Chiamare `swapExactOut` con un limite d’ingresso inferiore di un wei all’importo richiesto | Rifiuto `TooMuchRequested(required, maximum)` |  |  |
| T-29 | Saldo CUBIT superiore a quanto la banda e i muri possono riacquistare, per esempio CUBIT ricevuti come ricompensa | Vendere questo saldo in ingresso esatto tramite il router | Rifiuto `IncompleteInput`; la tassa viene annullata con la transazione — da confermare durante il test |  |  |
| T-30 | Chiamata diretta | Chiedere in uscita esatta più ETH di quanti il libro possa servirne | Rifiuto `InsufficientOutput`; nessun regolamento parziale |  |  |
| T-31 | Chiamata diretta | Inviare in successione un importo nullo, un destinatario nullo, un valore `msg.value` incoerente, poi un’altra chiave di pool | Rifiuti rispettivi `InvalidAmount`, `ZeroRecipient`, `WrongValue`, `WrongPool` |  |  |
| T-32 | Router di terze parti compatibile | Acquistare e poi vendere tramite un percorso di terze parti | Le tasse dell’hook si applicano |  |  |
| T-33 | Contratto chiamante o batch di transazioni | Concatenare un acquisto e poi una vendita nella **stessa transazione** | Le due componenti vengono tassate separatamente |  |  |

## 4. Tasse e contabilità

| Operazione | Base | Ripartizione |
| --- | --- | --- |
| Acquisto | 3% della componente ETH lorda | 100% quota del team; l’allocazione ai muri è esplicitamente nulla |
| Vendita | 15% degli ETH lordi in uscita | 12% verso i muri, 3% verso il team |

In ingresso esatto, la tassa d’acquisto è **inclusa** nell’importo fornito e arrotondata per eccesso al wei. In uscita esatta, si aggiunge sopra la componente del pool, in modo che la tassa rapportata al totale resti il 3%.

Per una vendita con uscita esatta, la tassa vale `ceil(uscita × 1500 / 8500)`: il pool produce l’uscita richiesta **più** la tassa. Per una vendita con ingresso esatto, vale `ceil(lordo × 15%)`. Nella ripartizione, la quota del team è arrotondata per difetto e **tutto il residuo in wei va ai muri**.

Nelle fonti attuali della dapp, l’interfaccia richiede di leggere queste aliquote on-chain prima di autorizzare uno swap: finché non sono verificate, il pulsante resta in attesa.

| Caso | Precondizioni | Passaggi | Risultato atteso | Risultato osservato | Gravità |
| --- | --- | --- | --- | --- | --- |
| T-34 | Acquisto confermato | Leggere `BuyTaxed(ethIn, toFloor, toTeam)` | `toFloor` vale zero; `toTeam` vale il 3% dell’ingresso lordo, arrotondato per eccesso al wei |  |  |
| T-35 | Acquisto confermato | Confrontare `teamAccrued` prima e dopo | Aumento pari alla quota del team |  |  |
| T-36 | Vendita confermata | Leggere `SellTaxed(ethOut, toFloor, toTeam)` | `toFloor + toTeam` è pari al 15% del lordo; `toTeam` vale il 3% del lordo; la somma è esatta al wei |  |  |
| T-37 | `teamAccrued` non nullo, chiamata diretta | Chiamare `claimTeam()` da un account qualsiasi | I fondi vanno all’indirizzo fisso del team; `TeamPaid(amount, cumulative)` emesso; `teamAccrued` azzerato |  |  |
| T-38 | `teamAccrued` nullo, chiamata diretta | Chiamare `claimTeam()` | La chiamata non fallisce e non trasferisce nulla |  |  |
| T-39 | Un acquisto e poi una vendita dello stesso importo | Confrontare l’ETH iniziale e quello finale, escluso il gas | Il fattore conservato si avvicina a `0,97 × 0,85 = 0,8245`; lo scarto si spiega con le commissioni LP, l’impatto e gli arrotondamenti |  |  |
| T-40 | Due vendite di dimensioni molto diverse | Confrontare le tasse rapportate ai lordi | L’aliquota resta del 15% in entrambi i casi; nessuno scaglione né esenzione |  |  |

## 5. Muri automatici

A ogni vendita, sia in ingresso esatto sia in uscita esatta, l’hook chiama `_collectCrossedWalls()` e poi `_placeWall()`. Svuota prima tutti i muri che il prezzo ha interamente attraversato, dal più vicino al più lontano, poi colloca tutti gli ETH in attesa all’obiettivo `0,4 × prezzo corrente + 0,6 × prezzo di lancio`, calcolato sul prezzo **dopo** la vendita e arrotondato al tick. Se quell’obiettivo non è strettamente sopra il tick del pool, cosa che accade al prezzo di lancio o al di sotto, il muro viene collocato l’1% sotto il prezzo corrente.

Un muro svuotato aggiunge i suoi CUBIT a `pendingAbsorbedTokens` e restituisce i suoi ETH residui, commissioni e polvere, a `pendingFloorEth`. Un muro solo parzialmente consumato resta al suo posto. Solo un importo troppo piccolo per creare liquidità e il caso estremo di un prezzo in cima all’intervallo di tick, dove nessun muro trova posto sotto il prezzo, lasciano fondi in attesa in `pendingFloorEth`: la vendita non viene mai rifiutata per questo. Il router CUBIT chiama poi `deliverAbsorbed()` in un try/catch.

Il riferimento `floorPrice()` del Lens descrive l’**ultimo muro finanziato**, non un minimo globale. Ogni muro attraversato costa circa 185 000 gas: una vendita attraversa al massimo circa 88 muri entro il limite di 16 777 216 gas di una transazione.

| Caso | Precondizioni | Passaggi | Risultato atteso | Risultato osservato | Gravità |
| --- | --- | --- | --- | --- | --- |
| T-41 | Prezzo sopra il prezzo di lancio | Vendere, poi leggere i muri | `WallFunded(id, lower, addedEth, liquidity)` emesso; un muro viene creato o ispessito al tick obiettivo con gli ETH in attesa, compreso il 12% della vendita, salvo arrotondamenti; `pendingFloorEth` conserva solo il residuo non collocato |  |  |
| T-42 | Situazione precedente | Ricalcolare l’obiettivo a partire dal prezzo **dopo** la vendita e dal prezzo di lancio | Il `lower` del muro corrisponde all’obiettivo 40/60 calcolato su questo prezzo, arrotondato al tick |  |  |
| T-43 | Due vendite il cui obiettivo cade sullo stesso tick | Leggere `wallCount()` e `walls(id)` | Un solo muro: i due `WallFunded` riportano lo stesso `id`, la liquidità aumenta, non viene creato alcun identificatore |  |  |
| T-44 | Più muri a tick diversi | Vendere e acquistare più volte, poi rileggere `walls(id)` | Il `lower` di ogni muro resta invariato; nessun muro viene spostato |  |  |
| T-45 | Muro attivo sotto il prezzo | Vendere un importo che consuma parzialmente il muro senza attraversarlo | Il muro resta attivo con ETH e CUBIT; nessun `WallAbsorbed`; `pendingAbsorbedTokens` invariato |  |  |
| T-46 | Muro parzialmente consumato | Acquistare fino a tornare sopra il muro | Il muro ha rivenduto i suoi CUBIT e ha ritrovato ETH; il suo identificatore e il suo tick sono invariati |  |  |
| T-47 | Muro attivo, vendita tramite il router CUBIT | Vendere un importo che attraversa interamente il muro | `WallAbsorbed(id, cubit, ethRemaining)` e `TokensAbsorbed(amount, pendingAbsorbedTokens)`, poi `AbsorbedDelivered(sink, amount)` e `RewardReserveFunded` nella stessa transazione; `rewardReserve()` aumenta di questi CUBIT; `pendingAbsorbedTokens` torna a zero; `totalSupply()` e `totalBurned()` sono invariati |  |  |
| T-48 | Prezzo vicino al prezzo di lancio, obiettivo 40/60 non sotto il mercato | Vendere un piccolo importo servibile, poi leggere i muri | La vendita riesce; `WallFunded` emesso; il muro viene collocato l’1% sotto il prezzo dopo la vendita, arrotondato al tick; `pendingFloorEth` conserva solo il residuo non collocato |  |  |
| T-49 | Situazione di T-48 | Vendere di nuovo un piccolo importo servibile, poi leggere `pendingFloorEth` | `WallFunded` emesso l’1% sotto il nuovo prezzo; `pendingFloorEth` conserva solo una polvere di arrotondamento: nessun arretrato si accumula da una vendita all’altra |  |  |
| T-50 | Router di terze parti compatibile | Vendere attraversando interamente un muro tramite un percorso di terze parti, poi chiamare `deliverAbsorbed()` da un account qualsiasi | Tasse applicate; `TokensAbsorbed` emesso e i CUBIT restano in `pendingAbsorbedTokens` fino alla chiamata, che emette `AbsorbedDelivered` |  |  |
| T-51 | Più muri finanziati | Leggere `floorPrice()` e `netFloorPrice()` del Lens, poi `wallAmountsPage(0, 500)` e le pagine successive fino a `activeWallCount`, tutte allo stesso blocco | Riferimento dell’ultimo muro finanziato, presentato come tale; i CUBIT dei muri sono la somma delle pagine più `pendingAbsorbedTokens`, aggiunto una sola volta |  |  |
| T-52 | Figlio Forge, muro interamente attraversato | Leggere `absorbedTokenSink()` dell’hook figlio, poi gli eventi della vendita | Destinazione uguale a `governanceVault()` della Forge; `AbsorbedDelivered` emesso; lotto `Deposited(token, from, amount, unlockAt)` bloccato per 30 giorni |  |  |
| T-106 | Molti muri da attraversare in una vendita | Stimare il gas della vendita, poi inviarla | Circa 185 000 gas per muro attraversato; oltre circa 88 muri, la vendita supera 16 777 216 gas e fallisce senza perdite: suddividerla |  |  |
| T-107 | Deployment di prova in cui la destinazione dei CUBIT rifiuta l’invio | Vendere attraversando un muro tramite il router CUBIT, poi richiamare `deliverAbsorbed()` | La vendita riesce; i CUBIT restano in `pendingAbsorbedTokens`; la chiamata è aperta a qualsiasi account e fallisce finché la destinazione rifiuta |  |  |

## 6. mCUBIT Vault

Il Vault versa una ricompensa **in CUBIT**, prelevata esclusivamente da `rewardReserve`. Vale `DAILY_REWARD_BPS = 300`, ossia il 3% del deposito per periodo di 24 ore (`REWARD_PERIOD`), calcolata in proporzione e **limitata a un periodo**: oltre, l’eccedenza va persa. Non supera mai il saldo della riserva e non viene mai pagata dal capitale.

Ogni deposito riavvia un blocco di **24 ore** (`LOCK_DURATION`) sull’intera posizione del wallet; il prelievo prima della scadenza viene rifiutato con `Locked`. Un deposito, un prelievo o una riscossione versa prima la ricompensa maturata e fa ripartire il periodo. Qualunque account può alimentare la riserva con `fundRewardReserve(amount)`. La scadenza si valuta sul timestamp della catena, non sull’orologio del browser.

La ricompensa è **esclusivamente in CUBIT**, riscossa con `claimCubit()`: il Vault non espone alcuna funzione di ricompensa in WETH.

| Caso | Precondizioni | Passaggi | Risultato atteso | Risultato osservato | Gravità |
| --- | --- | --- | --- | --- | --- |
| T-53 | Vault disponibile, CUBIT nel portafoglio | Approvare e poi depositare | `Staked(user, amount, unlockAt)` emesso; `unlockAt` uguale al timestamp del blocco più 24 ore |  |  |
| T-54 | Posizione esistente | Depositare di nuovo prima della scadenza | Il blocco viene **riavviato per l’intera posizione**; la ricompensa maturata, se non nulla, viene versata con `CubitRewardClaimed` e il periodo riparte |  |  |
| T-55 | Blocco in corso | Chiedere un prelievo | Rifiuto `Locked` |  |  |
| T-56 | Blocco scaduto | Prelevare una parte del deposito | Prelievo parziale accettato; `Withdrawn` emesso; la ricompensa maturata viene versata per prima; il saldo restante resta depositato |  |  |
| T-57 | Deposito di 1 000 CUBIT, riserva sufficiente | Leggere `pendingCubit` dopo 12 ore, poi dopo 24 ore | Circa 15 CUBIT, poi 30 CUBIT |  |  |
| T-58 | Situazione precedente | Attendere 48 ore senza riscuotere, poi leggere `pendingCubit` | Sempre 30 CUBIT: il secondo giorno va perso |  |  |
| T-59 | Ricompensa maturata | Chiamare `claimCubit()` | CUBIT trasferiti; `CubitRewardClaimed` emesso; `rewardReserve` diminuisce dell’importo versato; `pendingCubit` torna a zero |  |  |
| T-60 | Deployment di prova con una piccola riserva | Riscuotere una ricompensa superiore alla riserva | Viene versato solo il saldo della riserva; la riserva scende a zero; il capitale non viene toccato |  |  |
| T-61 | Chiamata diretta | Chiamare `fundRewardReserve(0)`, poi `fundRewardReserve(x)` da un account qualsiasi dopo l’approvazione | Rifiuto `InvalidAmount`, poi `RewardReserveFunded(from, x)`; `rewardReserve` aumenta di `x` |  |  |
| T-62 | Chiamata diretta | Confrontare `token.balanceOf(vault)` con `totalStaked + rewardReserve` in diversi momenti | Il saldo del Vault non è mai inferiore a questa somma |  |  |
| T-63 | Importo nullo, chiamata diretta | Chiamare `stake(0)` e poi `withdraw(0)` | Rifiuto `InvalidAmount` in entrambi i casi |  |  |
| T-64 | Vault non collegato al registro corrente | Tentare un deposito | Rifiuto `Inactive` |  |  |
| T-65 | Posizione aperta | Leggere la durata del blocco mostrata | Visualizzazione in ore, derivata da `LOCK_DURATION`: 24 ore |  |  |
| T-66 | Dapp aperta | Cercare un percorso di ricompensa in WETH | Nessuno: viene proposta solo la ricompensa in CUBIT |  |  |

## 7. Vault di governance del launchpad

Il vault di governance riceve le commissioni di lancio della Forge, in ETH, e i token assorbiti dai muri dei figli Forge. **Ogni deposito è bloccato per 30 giorni** (`LOCK_DURATION`) a partire dalla propria ricezione. **Solo il deployer** può riscuotere, per sempre e senza possibilità di trasferire questo diritto, e soltanto i lotti la cui data è passata, dal più vecchio al più recente. L’ETH è contabilizzato sotto la chiave `ETH()`, l’indirizzo zero. Rileggi l’ABI del deployment testato prima del collaudo. Il deployer può estendere il blocco di tutti i depositi, presenti e futuri, con `extendLock`; `lockExtension()` può solo crescere e si somma a ogni data.

L’invio automatico dai muri dei figli è verificato da T-52, e il deposito della commissione di lancio da T-81. I casi da T-67 a T-73 depositano token di test tramite chiamata diretta; T-108 riscuote l’ETH di una commissione.

| Caso | Precondizioni | Passaggi | Risultato atteso | Risultato osservato | Gravità |
| --- | --- | --- | --- | --- | --- |
| T-67 | Token di test, chiamata diretta | Approvare e poi chiamare `deposit(token, amount)` | `Deposited(token, from, amount, unlockAt)` emesso; `unlockAt` uguale al timestamp del blocco più 30 giorni; `held(token)` aumenta di altrettanto |  |  |
| T-68 | Deposito di meno di 30 giorni | Chiamare `claim(token, n)` dal deployer | Rifiuto `NothingToClaim` |  |  |
| T-69 | Lotto sbloccato | Chiamare `claim(token, n)` da un altro account | Rifiuto `NotDeployer` |  |  |
| T-70 | Un deposito al giorno per 7 giorni | Riscuotere ogni giorno a partire dal 30º giorno successivo al primo deposito | Esce un lotto al giorno, dal più vecchio al più recente; l’ultimo esce 30 giorni dopo il settimo deposito; `Claimed(token, amount, tranches)` a ogni riscossione |  |  |
| T-71 | Più lotti sbloccati | Chiamare `claim(token, 1)` | Viene versato un solo lotto; il successivo resta riscuotibile |  |  |
| T-72 | Token inviati con un semplice trasferimento | Chiamare `lockUntracked(token)`, poi richiamarlo senza un nuovo trasferimento | Nuovo lotto bloccato per 30 giorni a partire dalla prima chiamata; la seconda chiamata viene rifiutata con `NothingToLock` |  |  |
| T-73 | Lotti bloccati e sbloccati | Leggere `claimable(token)` e `locked(token)` | L’importo riscuotibile più l’importo bloccato è pari a `held(token)` |  |  |
| T-108 | Commissione di lancio di T-81 depositata da più di 30 giorni | Chiamare `claim(address(0), 1)` da un altro account, poi dal deployer | Rifiuto `NotDeployer`, poi ETH versati al deployer; `Claimed(address(0), amount, 1)` emesso; `held(address(0))` diminuisce dell’importo versato |  |  |
| T-109 | Lotti bloccati | Chiamare `extendLock(extra)` da un altro account, poi dal deployer | Rifiuto `NotDeployer`, poi `LockExtended(extra, lockExtension)` emesso; ogni data letta con `tranche(token, i)` slitta di `extra`; nessuna funzione accorcia il blocco |  |  |

## 8. Forge

La Forge è un launchpad pubblico, presentato come rilascio futuro. Non fa parte del lancio di CUBIT: viene aggiunta dopo, con il suo vault di governance. Annota i suoi indirizzi una volta aggiunto il launchpad.

Qualsiasi account lancia un figlio pagando la commissione esatta. Un figlio Forge deposita tutta la propria offerta nella sua banda, la Forge riceve l’indirizzo del vault di governance alla sua costruzione e ogni lancio versa la sua commissione di 0,005 ETH a quel vault, che la trattiene: chi lancia non la recupera mai. I salt di deployment sono legati a chi lancia.

| Caso | Precondizioni | Passaggi | Risultato atteso | Risultato osservato | Gravità |
| --- | --- | --- | --- | --- | --- |
| T-81 | Forge disponibile, account qualsiasi | Lanciare un figlio con la commissione esatta di 0,005 ETH | `ChildLaunched(token, hook, launcher, team, fee)` emesso; il `BandBootstrapped` del figlio indica un deposito pari a tutta la sua offerta, salvo arrotondamenti; il vault di governance emette `Deposited(address(0), forge, fee, unlockAt)`, con `unlockAt` pari al timestamp del blocco più 30 giorni e l’eventuale estensione; `pendingFloorEth` dell’hook padre invariato |  |  |
| T-82 | Forge disponibile | Tentare un lancio con un valore errato, un nome vuoto, un team nullo o un altro template | Rifiuto: `wrong launch fee`, `invalid name`, `invalid team` o `template mismatch` |  |  |
| T-110 | Salt di un lancio visti da un altro account | Lanciare da un secondo account con gli stessi salt | Gli indirizzi del primo lancio non vengono presi: i salt sono legati a chi lancia, e il secondo lancio viene rifiutato con `child deployment failed` se il suo indirizzo di hook non porta i permessi |  |  |

## 9. Sostituzioni e poteri

L’autorità del registro può sostituire quattro indirizzi periferici in qualsiasi momento, senza ritardo: Vault, router, Lens e Forge. Ogni sostituzione emette `ModuleUpdated`, **incrementa `moduleRevision`** e chiude la funzionalità interessata finché il team non la riapre: Vault, Momentum o Forge; sostituire il router non chiude alcuna funzionalità. Un candidato già registrato, collegato a un altro hook o a un altro token, o che detiene già stake, viene rifiutato con `InvalidModule`.

L’hook non ha **alcun amministratore** e nessuno può mettere in pausa gli swap né il meccanismo dei muri. L’indirizzo del team conserva poteri permanenti: riceve la quota del team sulle tasse e sostituisce e poi attiva i moduli del registro.

| Caso | Precondizioni | Passaggi | Risultato atteso | Risultato osservato | Gravità |
| --- | --- | --- | --- | --- | --- |
| T-83 | Depositi e riserva nel Vault corrente | Sostituire il Vault | CUBIT depositati, riserva di ricompense e scadenze **restano nel vecchio Vault**; nessun fondo spostato |  |  |
| T-84 | Vault sostituito | Sul vecchio Vault, riscuotere e poi prelevare, poi tentare un deposito | Riscossione e prelievo restano disponibili; il nuovo deposito viene rifiutato con `Inactive` |  |  |
| T-85 | Candidato già registrato, o che detiene stake | Tentare la rotazione | Rifiuto `InvalidModule` |  |  |
| T-86 | Sostituzione effettuata | Leggere `moduleRevision()` e l’evento; dopo una sostituzione del Vault, tentare un deposito nel nuovo Vault | Revisione incrementata; `ModuleUpdated(module, previous, current, revision)` coincide; il deposito viene rifiutato con `Inactive` fino alla riattivazione del Vault |  |  |
| T-87 | Approvazione concessa al vecchio router | Sostituire il router, poi tentare una vendita | La vecchia approvazione non vale per il nuovo spender; viene richiesta una nuova autorizzazione |  |  |
| T-88 | Router sostituito | Effettuare uno swap tramite il vecchio router | Lo swap resta possibile e si applicano le tasse dell’hook; la dapp usa il nuovo router |  |  |
| T-89 | Chiamata diretta | Ispezionare l’ABI dell’hook distribuito | Nessuna funzione permette di sospendere gli swap o il meccanismo dei muri; l’hook non ha alcun amministratore |  |  |
| T-90 | Chiamata diretta | Leggere `snapshot()` del Lens, poi le pagine dei muri allo stesso blocco | Lo snapshot contiene solo campi di mercato, banda, muri, conti, l’offerta totale, la riserva di ricompense, il numero di muri attivi, il blocco di lettura e il miglior muro: nessun totale dei muri, e il suo costo non dipende dal numero di muri; l’offerta in circolazione è uguale a `totalSupply` meno i CUBIT dei muri e `rewardReserve`, e i CUBIT detenuti sono quell’offerta meno `bandTokens` |  |  |
| T-91 | In qualsiasi momento dopo il lancio | Acquistare e vendere | Gli swap funzionano normalmente: nessun account può bloccarli |  |  |

## 10. Casi di rifiuto attesi

Questa tabella serve da riferimento durante tutto il collaudo. I muri automatici non aggiungono rifiuti alla vendita: un muro che non può essere collocato lascia i fondi in attesa e un invio non riuscito lascia i CUBIT in attesa.

> **Punto di attenzione.** Nelle fonti attuali della dapp, gli errori dei contratti non sono tradotti: un rifiuto on-chain può comparire come un messaggio grezzo, troncato nella visualizzazione. **Per ogni rifiuto provocato, annota il testo esatto mostrato** e valuta se è comprensibile.

| Errore | Cosa lo provoca | Cosa dovrebbe mostrare l’applicazione |
| --- | --- | --- |
| `ExternalLiquidityForbidden` | Aggiunta di liquidità da parte di terzi | Operazione impossibile: il protocollo è l’unico fornitore di liquidità |
| `SupplyNotDeposited` | Inizializzazione con un deposito inferiore all’80% dell’offerta | Lancio impossibile, deposito insufficiente |
| `Expired` | Scadenza della transazione superata | Quotazione scaduta, calcolarne una nuova |
| `TooLittleReceived(received, minimum)` | Uscita inferiore al minimo accettato | Protezione di slippage attivata |
| `TooMuchRequested(required, maximum)` | Ingresso superiore al limite accettato | Protezione del limite d’ingresso attivata |
| `IncompleteInput` | Ingresso esatto non interamente consumato | Importo troppo grande per la liquidità disponibile |
| `InsufficientOutput` | Uscita esatta non interamente soddisfatta | Il libro non può servire questa uscita |
| `InvalidAmount`, `ZeroRecipient`, `WrongValue`, `WrongPool` | Parametri d’ordine non validi, o importo nullo inviato al Vault | Errore di inserimento, senza codice grezzo |
| `Inactive`, `Locked` | Vault non collegato al registro corrente, o prelievo prima della scadenza | Modulo non disponibile, o data di sblocco |
| `NotDeployer`, `NothingToClaim`, `NothingToLock`, `NothingToExtend` | Riscossione o estensione sul vault di governance da parte di terzi, riscossione prima della scadenza, blocco senza nuovo saldo, estensione nulla | Azione riservata, niente da riscuotere, niente da bloccare o niente da estendere |
| `NotAuthority`, `InvalidModule` | Sostituzione richiesta da terzi, o candidato incompatibile | Sostituzione rifiutata, con il motivo |

Anche i rifiuti puramente applicativi vanno annotati: quotazione obsoleta, contesto di swap modificato, wallet su un’altra catena, account cambiato, revisione dei moduli cambiata, aliquote delle tasse non ancora verificate.

## 11. Applicazione

Questi casi si svolgono con la dapp. I comportamenti dell’interfaccia citati provengono dalle sue fonti e si verificano durante il collaudo.

| Caso | Precondizioni | Passaggi | Risultato atteso | Risultato osservato | Gravità |
| --- | --- | --- | --- | --- | --- |
| T-92 | Dapp aperta | Scorrere le dieci lingue del selettore | Ogni lingua mostra un contenuto tradotto, senza testo mancante né debordamenti; i nomi dei prodotti restano in inglese per scelta |  |  |
| T-93 | Lingua scelta | Ricaricare, poi ridurre la finestra sotto 640 px | La scelta viene conservata da una sessione all’altra; sotto 640 px, il selettore mostra solo la bandiera |  |  |
| T-94 | Lingua diversa dall’inglese | Confrontare il titolo della home con la versione inglese | Il titolo è volutamente ridotto nelle lingue diverse dall’inglese; non deve né debordare né essere tagliato |  |  |
| T-95 | Schermo di circa 400 px | Scorrere ogni schermata | Nessun debordamento orizzontale; le zone larghe scorrono nel proprio contenitore; i pulsanti restano raggiungibili |  |  |
| T-96 | Finestra tra 768 e 1279 px | Aprire la navigazione | Il menu compatto viene usato fino a 1279 px; si richiude dopo la navigazione |  |  |
| T-97 | Transazione confermata | Confrontare ogni importo mostrato con i valori on-chain allo stesso blocco | Gli importi coincidono; gli arrotondamenti di visualizzazione non modificano l’importo firmato |  |  |
| T-98 | Operazione in preparazione | Cambiare rete nel wallet a metà del percorso | La quotazione viene invalidata e la firma rifiutata fuori dalla rete attesa; il pulsante propone prima il cambio di rete, poi richiede una seconda azione per scambiare |  |  |
| T-99 | Operazione in preparazione | Cambiare account nel wallet a metà del percorso | Saldi, autorizzazione e quotazione vengono ricalcolati per il nuovo account; una firma preparata per il vecchio account viene rifiutata |  |  |
| T-100 | Autorizzazione concessa, swap non firmato | Lasciare che la revisione dei moduli cambi tra le due operazioni | L’applicazione rivalida il contesto e non prosegue silenziosamente verso un nuovo spender |  |  |
| T-101 | RPC indisponibile o lettura non aggiornata | Interrompere l’accesso all’RPC e osservare | Lo stato viene segnalato come non verificato e le azioni vengono disattivate |  |  |
| T-102 | Transazione inviata | Seguire l’hash e poi la ricevuta | L’interfaccia distingue “inviata” e “riuscita”; gli eventi sono verificabili su un explorer Sepolia |  |  |
| T-103 | Un rifiuto on-chain provocato | Annotare il testo mostrato, per intero | Il messaggio deve restare comprensibile per un utente; registrare qualsiasi codice tecnico grezzo o messaggio troncato |  |  |
| T-104 | Lingue cinese, coreana e giapponese | Mostrare queste lingue senza accesso a un servizio di font esterno | I caratteri vengono visualizzati correttamente: i font sono serviti dal sito |  |  |
| T-105 | Schermata Proof aperta | Leggere la banda, i muri e i fondi in attesa | `bandEth`, `bandTokens`, i muri, gli ETH in attesa e i CUBIT in attesa di invio sono mostrati separatamente; nessuna schermata presenta ladder, keeper o burn dei muri |  |  |

## 12. Scheda di rilevazione

Ogni tabella delle sezioni precedenti **è** la scheda di rilevazione della propria sezione: compila le colonne “Risultato osservato” e “Gravità” man mano che procedi con i casi. Per il risultato osservato, annota come minimo l’hash della transazione o il blocco di lettura, poi ciò che è stato constatato.

Riepilogo da allegare al rapporto:

| Sezione | Casi | Conformi | Scostamenti | Gravità massima |
| --- | --- | --- | --- | --- |
| 1. Preparazione | Da T-01 a T-06 |  |  |  |
| 2. Lancio e banda | Da T-07 a T-16 |  |  |  |
| 3. Acquisto e vendita | Da T-17 a T-33 |  |  |  |
| 4. Tasse e contabilità | Da T-34 a T-40 |  |  |  |
| 5. Muri automatici | Da T-41 a T-52, T-106 e T-107 |  |  |  |
| 6. mCUBIT Vault | Da T-53 a T-66 |  |  |  |
| 7. Vault di governance | Da T-67 a T-73, T-108 e T-109 |  |  |  |
| 8. Forge | T-81, T-82 e T-110 |  |  |  |
| 9. Sostituzioni e poteri | Da T-83 a T-91 |  |  |  |
| 10. Casi di rifiuto | Riferimento trasversale |  |  |  |
| 11. Applicazione | Da T-92 a T-105 |  |  |  |

Uno scostamento si riferisce **al numero del caso**, mai a un solo screenshot. Allega la rete, l’indirizzo del deployment, il blocco, l’hash e la versione dell’applicazione.

## Limiti di questo piano

Questo piano descrive ciò che il codice della nuova versione e le decisioni del 14 settembre 2026 prevedono. **Non costituisce una validazione**: un collaudo riuscito su Sepolia non sostituisce le campagne di test.

I punti “da confermare durante il test” devono essere osservati e poi riportati in questa pagina.

<p class="source-note">Fonti: <code>contracts/src/CubitHook.sol</code>, <code>CubitLens.sol</code>, <code>interfaces/ICubitHook.sol</code>, <code>interfaces/ICubitLens.sol</code>, <code>libraries/BandLib.sol</code>, <code>libraries/WallLib.sol</code>, <code>periphery/CubitRouter.sol</code>, <code>CubitV2.sol</code>, <code>CubitVault.sol</code>, <code>CubitGovernanceVault.sol</code>, <code>CubitForge.sol</code>, <code>CubitLaunch.sol</code>, i percorsi attuali di <code>dapp/src</code> e le decisioni di design del 14 settembre 2026 registrate in <code>contracts/docs/REDESIGN_HANDOFF.md</code>.</p>
