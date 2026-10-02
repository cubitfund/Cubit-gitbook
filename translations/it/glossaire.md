---
description: "Definizioni dei termini della guida CUBIT: banda, muro, obiettivo, riserva di ricompense, tick, hook e claim."
section: "05 / VERIFICARE"
reading: "IL VOCABOLARIO DEL PROTOCOLLO"
search:
  keywords: ["glossario", "definizione", "definizione", "vocabolario", "termini"]
---

# Glossario

| Termine | Definizione in CUBIT |
| --- | --- |
| ABI | Descrizione di funzioni, eventi e tipi che permette di comunicare con un contratto |
| Acquisto del deployer | Acquisto di 0,1 ETH incluso nella transazione di lancio, tassato al 3% e non bloccato |
| Indirizzo del team | Indirizzo fisso che riceve la quota del team sulle tasse e può sostituire in qualsiasi momento, senza ritardo, e poi attivare i moduli del registro; i suoi poteri sono permanenti |
| Approvazione | Autorizzazione ERC-20 concessa a un indirizzo spender per un importo |
| Banda | Unica posizione di trading collocata al lancio con l’80% dell’offerta, che copre tutti i prezzi sopra il prezzo di lancio e non viene mai ritirata |
| Burn | Distruzione di token; la nuova versione non brucia più i CUBIT dei muri, ma solo la polvere di arrotondamento del lancio |
| Obiettivo | Livello calcolato a ogni vendita, sul prezzo dopo la vendita, per collocare un muro: 0,4 × prezzo corrente + 0,6 × prezzo di lancio; al prezzo di lancio o al di sotto, il muro viene collocato l’1% sotto il prezzo corrente |
| Claim ERC-6909 | Unità contabile detenuta nel PoolManager per regolare o conservare asset |
| Riscossione delle ricompense | Chiamata che riscuote una ricompensa maturata; uso distinto dal termine claim ERC-6909 |
| Curva x·y=k | Curva a prodotto costante seguita da acquisti e vendite nella banda |
| CUBIT detenuti | Offerta in circolazione meno i CUBIT che la banda non ha ancora venduto: ciò che detengono gli holder, compresi i CUBIT in stake |
| Deadline | Timestamp massimo accettato per un’operazione o una firma |
| Exact-input | Swap con ingresso fisso e uscita protetta da un minimo |
| Exact-output | Swap con uscita fissa e ingresso protetto da un massimo |
| FDV di lancio | Capitalizzazione completamente diluita che fissa il prezzo di lancio; 3,75 ETH scelti per la nuova versione |
| Commissione LP | Commissione del pool, distinta dalle tasse dell’hook |
| Floor | Nome storico usato nel codice; leggere separatamente i muri e l’obiettivo |
| Hook | Contratto collegato alle operazioni Uniswap v4 che applica qui la meccanica CUBIT; non ha alcun amministratore |
| ETH inattivi | ETH contabilizzati al di fuori di qualsiasi posizione; occorre precisarne il compartimento |
| Lens | Contratto di lettura che ricava cifre dall’hook e dal pool |
| Liquidità / profondità | Asset realmente disponibili nelle posizioni, secondo stato e prezzo |
| Miglior muro | Muro attivo più vicino al mercato, il primo che una vendita incontra; il Lens fornisce il suo prezzo lordo e il suo prezzo al netto di commissioni e tassa |
| Muro | Posizione LP finanziata in ETH dalle vendite, a un tick fisso; un solo muro per tick |
| Muro parzialmente consumato | Muro di cui una parte degli ETH ha riacquistato CUBIT; resta al suo posto |
| Muro attraversato | Muro interamente convertito in CUBIT dalle vendite; la vendita che lo ha attraversato lo svuota a favore della riserva del vault |
| Offerta in circolazione | Offerta totale meno i CUBIT dei muri, quelli in attesa di invio e la riserva di ricompense di tutti i vault registrati; i CUBIT in stake restano in circolazione |
| Pending absorbed tokens | CUBIT dei muri attraversati, isolati nell’hook fino al loro invio tramite `deliverAbsorbed()` |
| Pending floor ETH | Fondi dei muri in attesa di collocamento: 12% delle vendite ed ETH liberati dai muri attraversati, collocati dalla stessa vendita; vi restano solo una polvere troppo piccola per creare una posizione e il caso estremo di un prezzo in cima all’intervallo di tick |
| Permissionless | Chiamata aperta a tutti, soggetta alle condizioni deterministiche del contratto |
| PoolId | Identificatore derivato dall’intera PoolKey |
| Prezzo di lancio | Prezzo in ETH per CUBIT fissato al deployment: FDV di lancio divisa per 21 milioni |
| Registro V2 | Contratto che conserva i moduli correnti, la loro revisione, le funzionalità aperte e lo storico dei vault |
| Riserva di ricompense | CUBIT detenuti dal vault per pagare i depositanti: 20% dell’offerta al lancio, poi i CUBIT dei muri attraversati |
| Slippage | Scarto di esecuzione accettato rispetto a una quotazione, vincolato dai limiti dello swap |
| Snapshot | Insieme coerente di dati letti a un dato blocco |
| Tick | Unità discreta di prezzo del pool; orientamento inverso rispetto al prezzo ETH/CUBIT |
| V1 / V2 | Nucleo del mercato / funzionalità aggiuntive della roadmap |
| Vault di governance | Vault del launchpad che riceve le commissioni di lancio della Forge, in ETH, mai restituite a chi lancia, e i token dei muri dei figli Forge; ogni deposito è bloccato per 30 giorni, più l’eventuale estensione, poi solo il suo deployer può riscuotere, per sempre e senza possibilità di trasferire questo diritto; quel deployer può estendere il blocco, mai accorciarlo |

Per unità e metodi dei contratti, consulta l’[integrazione](developper/integration.md).
