---
description: "Lokale Befehle für Kompilierung, Foundry-Tests der neuen Version, dApp, Dienste und GitBook; keine Übertragung von Transaktionen."
section: "04 / ENTWICKELN"
reading: "5 MIN LESEZEIT"
---

# Das Projekt lokal starten

Die Verzeichnisse haben eigene Abhängigkeiten. Verwenden Sie die Lockfiles des Repositorys und halten Sie die Versionen von Verträgen, ABI, Manifesten und Clients aufeinander abgestimmt.

Die folgenden Befehle bauen oder prüfen die Komponenten lokal. Sie sind kein Verfahren zur Produktionsbereitstellung.

## Voraussetzungen

Das Projekt verwendet eine aktuelle Node.js-Version, pnpm für dApp und Dienste, Foundry für Solidity sowie npm für dieses GitBook. Die Dienste benötigen Node **22 oder neuer**; das GitBook wurde mit Node 24 vorbereitet.

Die Verträge legen **Solidity 0.8.26**, die EVM **Cancun**, die Verarbeitung **via IR**, den Optimierer mit **10 Runs** und den Verzicht auf CBOR-Metadaten fest. Diese Parameter gehören zur Identität der zu prüfenden Bytecodes.

Nach dem Klonen müssen die Solidity-Abhängigkeiten des Repositorys vorhanden sein:

```bash
git submodule update --init --recursive
```

## Verträge kompilieren und testen

Im Verzeichnis `contracts/`, auf dem Branch `redesign/tide-lp-autowalls-vault`:

```bash
FOUNDRY_TEST=test/redesign forge build --sizes
FOUNDRY_TEST=test/redesign forge test
```

Die historische Suite `test/` verwendet die frühere API der Ladder und kompiliert nicht mit der neuen Version: `FOUNDRY_TEST` beschränkt die Kompilierung auf die Tests in `test/redesign`. Die Verarbeitung via IR macht die Kompilierung langsam.

Die Fuzzing- und Invariantenprofile der Konfiguration beziehen sich auf die historische Suite:

```bash
FOUNDRY_PROFILE=ci forge test
FOUNDRY_PROFILE=gate forge test
```

Ein Testergebnis muss der genauen Revision, den Parametern und den kompilierten Quellen zugeordnet werden; ein früheres Log ist kein Ergebnis der neuen Version.

Das Skript `script/Scenarios.s.sol` spielt Szenarien auf einem lokalen Anvil-Knoten ab: `SCENARIO=band` für das Band, `SCENARIO=walls` für die Walls und `SCENARIO=crossing` für das Gas durchlaufener Walls. Folgen Sie den Anweisungen des Repositorys für das lokale Deployment, ohne einen Schlüssel in Ihre Notizen zu kopieren.

## Die dApp starten

Im Verzeichnis `dapp/`:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
pnpm dev
```

Vite zeigt die Entwicklungs-URL an. Die Konfiguration unterscheidet zwischen einem Simulationsmodus und den Daten des konfigurierten Deployments. Verwenden Sie die Beispiele und Anweisungen des Repositorys, um lokal einen RPC zu konfigurieren, ohne Zugangsdaten in die Quellen oder das öffentliche Bundle zu kopieren.

Dass das Frontend kompiliert, beweist nicht, dass sein Manifest dem im Netzwerk vorhandenen Vertrag entspricht. Die dApp liest die ABI der im Einsatz befindlichen Version.

## Die ABI pflegen

Im Verzeichnis `contracts/` folgt der Export auf die Kompilierung:

```bash
bash scripts/export-abi.sh
python3 scripts/check-abi.py
```

Für die dApp steht `pnpm gen-abi`, für die Dienste `pnpm gen:abi` bereit. Prüfen Sie die erzeugten Änderungen an den betroffenen Schnittstellen, Ereignissen und Typen. Die Ansicht `band()`, die Felder `bandEth` und `bandTokens`, die Wall-Ansichten, `deliverAbsorbed()`, `pendingAbsorbedTokens()` und die beiden Vaults müssen in die Synchronisierung der Veröffentlichung aufgenommen werden.

Der dApp-Befehl `pnpm sync-deployment` liest ein Deployment-Manifest erneut ein: Er darf nur mit den Metadaten der tatsächlich geprüften Version ausgeführt werden.

## Die Dienste prüfen

Im Verzeichnis `services/`:

```bash
pnpm install --frozen-lockfile
pnpm gen:abi
pnpm typecheck
pnpm test
```

Der Keeper-Dienst gehört zum früheren Modell und hat in der neuen Version keine Verwendung mehr. Der Betrieb des Ereignisrelais hat eine [eigene Seite](services.md).

## Dieses GitBook starten

Im Verzeichnis `gitbook/`:

```bash
npm ci
npm run dev
```

Die Website wird unter `http://localhost:4000` mit erneutem Aufbau der Seiten bereitgestellt. Um das statische Verzeichnis `_book/` zu erzeugen und die Links zu prüfen:

```bash
npm run build
npm run preview
```

Die lokale Vorschau verwendet `http://localhost:4001`. Die Schriftarten sind eingebettet; die Suche läuft im Browser auf dem Index des Buchs.

Um die Browserabläufe der Dokumentation zu prüfen:

```bash
npm run test:install
npm run test:browser
```

Die [README von `gitbook/`](../sources.md#la-documentation) beschreibt die Wahl von HonKit, die Verzeichnisstruktur, die Prüfungen und die redaktionelle Pflege.

<p class="source-note">Quellen: <code>contracts/foundry.toml</code>, <code>contracts/docs/REDESIGN_HANDOFF.md</code>, <code>contracts/script/Scenarios.s.sol</code>, Repository-Skripte, <code>dapp/package.json</code>, <code>services/package.json</code> und <code>gitbook/package.json</code>. Für den Build dieser Dokumentation sind weder Schlüssel noch authentifizierte RPC-URLs erforderlich.</p>
