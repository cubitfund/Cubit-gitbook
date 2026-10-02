---
description: "Comandi locali per compilazione, test Foundry della nuova versione, dapp, servizi e GitBook; nessun invio di transazioni."
section: "04 / SVILUPPARE"
reading: "5 MIN DI LETTURA"
---

# Avviare il progetto in locale

Le directory hanno dipendenze proprie. Usa i lockfile del repository e mantieni allineate le versioni di contratti, ABI, manifest e client.

I comandi seguenti costruiscono o verificano i componenti in locale. Non costituiscono una procedura di messa in produzione.

## Prerequisiti

Il progetto usa Node.js recente, pnpm per dapp e servizi, Foundry per Solidity e npm per questo GitBook. I servizi richiedono Node **22 o superiore**; il GitBook è stato preparato con Node 24.

I contratti fissano **Solidity 0.8.26**, EVM **Cancun**, compilazione **via IR**, ottimizzatore a **10 runs** e nessun metadato CBOR. Questi parametri fanno parte dell’identità dei bytecode da verificare.

Dopo la clonazione, le dipendenze Solidity del repository devono essere presenti:

```bash
git submodule update --init --recursive
```

## Compilare e testare i contratti

Da `contracts/`, sul branch `redesign/tide-lp-autowalls-vault`:

```bash
FOUNDRY_TEST=test/redesign forge build --sizes
FOUNDRY_TEST=test/redesign forge test
```

La suite storica `test/` usa la vecchia API del ladder e non compila con la nuova versione: `FOUNDRY_TEST` limita la compilazione ai test di `test/redesign`. La compilazione via IR è lenta.

I profili di fuzzing e di invarianti della configurazione riguardano la suite storica:

```bash
FOUNDRY_PROFILE=ci forge test
FOUNDRY_PROFILE=gate forge test
```

Un risultato di test deve essere associato alla revisione esatta, ai parametri e alle fonti compilate; un vecchio log non è un risultato della nuova versione.

Lo script `script/Scenarios.s.sol` riesegue scenari su un nodo locale Anvil: `SCENARIO=band` per la banda, `SCENARIO=walls` per i muri e `SCENARIO=crossing` per il gas dei muri attraversati. Segui le istruzioni del repository per il deployment locale, senza copiare chiavi nei tuoi appunti.

## Avviare la dapp

Da `dapp/`:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
pnpm dev
```

Vite mostra l’URL di sviluppo. La configurazione distingue una modalità simulazione dai dati del deployment configurato. Usa gli esempi e le istruzioni del repository per configurare un RPC locale, senza copiare credenziali d’accesso nelle fonti o nel bundle pubblico.

La compilazione del frontend non prova che il suo manifest corrisponda al contratto presente sulla rete. La dapp legge l’ABI della versione in servizio.

## Mantenere le ABI

Da `contracts/`, l’esportazione segue la compilazione:

```bash
bash scripts/export-abi.sh
python3 scripts/check-abi.py
```

La dapp dispone di `pnpm gen-abi` e i servizi di `pnpm gen:abi`. Esamina le modifiche prodotte per interfacce, eventi e tipi interessati. La vista `band()`, i campi `bandEth` e `bandTokens`, le viste dei muri, `deliverAbsorbed()`, `pendingAbsorbedTokens()` e i due vault vanno inclusi nella sincronizzazione della release.

Il comando `pnpm sync-deployment` della dapp rilegge un manifest di deployment: va eseguito solo con i metadati della versione realmente verificata.

## Verificare i servizi

Da `services/`:

```bash
pnpm install --frozen-lockfile
pnpm gen:abi
pnpm typecheck
pnpm test
```

Il servizio keeper appartiene al vecchio modello e non ha più alcuna utilità nella nuova versione. La gestione operativa del relay degli eventi ha una [pagina dedicata](services.md).

## Avviare questo GitBook

Da `gitbook/`:

```bash
npm ci
npm run dev
```

Il sito viene servito su `http://localhost:4000` con ricostruzione delle pagine. Per produrre la directory statica `_book/` e verificare i collegamenti:

```bash
npm run build
npm run preview
```

L’anteprima locale usa `http://localhost:4001`. I font sono inclusi; la ricerca viene eseguita nel browser sull’indice del libro.

Per verificare i percorsi browser della documentazione:

```bash
npm run test:install
npm run test:browser
```

Il [README di `gitbook/`](../sources.md#la-documentation) descrive la scelta di HonKit, la struttura, i controlli e la manutenzione editoriale.

<p class="source-note">Fonti: <code>contracts/foundry.toml</code>, <code>contracts/docs/REDESIGN_HANDOFF.md</code>, <code>contracts/script/Scenarios.s.sol</code>, script del repository, <code>dapp/package.json</code>, <code>services/package.json</code> e <code>gitbook/package.json</code>. Per la build di questa documentazione non servono chiavi né URL RPC autenticati.</p>
