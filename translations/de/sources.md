---
description: "Umfang der gelesenen Quellen, Dokumentenhierarchie, Quellen der visuellen Gestaltung und Methode zur Pflege des GitBooks."
section: "05 / PRÜFEN"
reading: "REFERENZEN DES LEITFADENS"
search:
  keywords: [Quellen, Referenzen, Dokumentation, HonKit, Lastenheft, Version, redesign]
---

# Quellen und Methode

Dieser Leitfaden wurde auf Grundlage der lokalen Codebasis und der am **14. September 2026** festgeschriebenen Designentscheidungen verfasst. Die nachstehend genannten Dateien sind Repository-Pfade und keine Netzwerkendpunkte.

Die neue Version wird anhand des Branchs `redesign/tide-lp-autowalls-vault` beschrieben. Die historischen Codereferenzen bezeichnen die Protokollrevision `991fca9`, die auf dem Branch `work/v1-v2-fixed-walls` erhalten bleibt. Die veröffentlichte Dokumentation stellt keine Validierung der beschriebenen Verträge dar.

## Lesereihenfolge

Die Referenz der neuen Version ist **`contracts/docs/REDESIGN_HANDOFF.md`**. Dieses Dokument hält die Designentscheidungen und deren Umsetzung im Code fest; es hat Vorrang vor früheren Dokumenten.

Die Steuern sind unverändert: **3 % beim Kauf für das Team** und **15 % beim Verkauf: 12 % für die Walls und 3 % für das Team**. Die Handelsliquidität ist ein einziges Band, die Walls werden bei jedem Verkauf platziert und geleert, und die festgelegte Start-FDV beträgt **3,75 ETH**.

Das Dokument **`CUBIT-cahier-des-charges/docs/VERSION_ACTUELLE.md`** drückte die Startbasis als **7 000 USD FDV** auf 21 Millionen Token aus. Die neue Version legt die FDV direkt in ETH fest; dieser Leitfaden stellt keine Entsprechung zwischen diesen beiden Referenzen her.

Um zu wissen, was tatsächlich funktioniert, müssen anschließend Code, Validierungsergebnisse und Deployment derselben Version miteinander verknüpft werden.

Ein Codekommentar ersetzt keine bestätigte Entscheidung. Umgekehrt beweist eine Entscheidung nicht, dass eine Implementierung oder ein Netzwerk sie ausführt.

## Der gelesene Code

| Quelle | Verwendung im Leitfaden |
| --- | --- |
| `contracts/docs/REDESIGN_HANDOFF.md` | Festgeschriebene Entscheidungen und Umsetzung im Code |
| `contracts/src/CubitToken.sol` | Festes Angebot und Burn-Berechtigung |
| `contracts/src/CubitHook.sol` | Steuern, Band, Walls, Konten und V2-Anbindung |
| `contracts/src/libraries/BandLib.sol` | Geometrie, Preise, Ticks und Ziel der Walls |
| `contracts/src/libraries/WallLib.sol` | Walls pro Tick: Finanzierung und Leeren durchlaufener Walls |
| `contracts/src/CubitLens.sol` und Schnittstellen | Preise, Band, Walls, Guthaben, Umlaufangebot, gehaltene CUBIT und beste Wall |
| `contracts/src/periphery/CubitRouter.sol` | Swaps, Grenzen, Freigaben und Übertragung der aufgenommenen CUBIT |
| `contracts/src/periphery/CubitV2.sol` | Modulidentitäten und Austausch |
| `contracts/src/periphery/CubitVault.sol` | Sperre, tägliche Belohnung und Reserve |
| `contracts/src/periphery/CubitGovernanceVault.sol` | 30 Tage gesperrte Einlagen und Abruf durch den Deployer |
| `contracts/src/periphery/CubitForge.sol` | Öffentliches Launchpad, Isolierung der Kindmärkte und Adresse des Governance-Vaults |
| `contracts/src/periphery/CubitLaunch.sol` | Start in einer Transaktion: Band, Vault-Reserve und Kauf des Deployers |
| `dapp/src/chain` | Ermittlung, Quotierungen, Signaturkontext und frühere Vaults |
| `dapp/src/pages/Momentum.tsx` | Schreibgeschützte Momentum-Seite: aktive, teilweise aufgebrauchte und durchlaufene Walls |
| `services/` und ihre README-Dateien | Ereignisrelais und früherer Keeper |
| `contracts/foundry.toml` und Paketmanifeste | Build-Befehle und -Parameter |

## Berichte und historische Dokumente

Der Referenzbericht der früheren Version ist `audit/reports/2026-09-10-v1-v2/BILAN_FINAL_FR.md`. Er beschreibt die Ladder, die Wartung durch Keepers und den Burn der Walls, die in der neuen Version ersetzt wurden.

`roadmapdev.md` und die historischen Dokumente des Lastenhefts dienten dazu, die Absicht und die V1-/V2-Meilensteine zu verstehen. Die ursprünglichen Texte wurden unter `CUBIT-cahier-des-charges/historique/2026-09-10-avant-murs-fixes/` archiviert. Passagen über eine einzelne monotone Wall, E/C-Platzierung, die Ladder, die Keeper oder das vollständige Verschwinden administrativer Rechte bilden nicht die Regel der neuen Version.

`contracts/docs/STRICT_BURN.md` erläutert die historische Entwicklung des Burns aufgenommener Token, der in der neuen Version aufgegeben wurde. `contracts/docs/MODULE_SETTERS.md` dokumentiert den Austausch der Peripherie. Keine frühere Testzahl wird hier als Validierungsergebnis der neuen Version dargestellt.

Die frühere Roadmap-Seite der dApp ist eine datierte redaktionelle Referenz; ihr Inhalt darf nicht allein zur Integration der neuen Version verwendet werden.

## Die visuelle Gestaltung

Das Theme überträgt die bereits in der dApp vorhandenen Gestaltungsentscheidungen:

| Visuelle Quelle | Übernommene Elemente |
| --- | --- |
| `dapp/src/index.css` | Creme `#f5f1e8`, Tinte `#111312`, Violett `#5b4bff`, Limette `#c7ff3d`, Orange `#ff704d`, Papier `#ede7d8` |
| `dapp/src/index.css` | Archivo-Titel mit hohem Schriftgewicht und breiter Laufweite; Martian-Mono-Beschriftungen; dezente Textur |
| `dapp/src/components/primitives.tsx` | Klare Rahmen, versetzte Schatten, Bereiche und Statusanzeigen |
| `dapp/src/components/Header.tsx` | Typografische Wortmarke, violettes Quadrat, Navigation und Unterscheidung von Zuständen |
| `dapp/src/ui.tsx` | Vereinzelt eingesetztes Sternmotiv und Monospace-Beschriftungen |

Die Schriftarten werden beim Build mitsamt ihren Lizenzen lokal kopiert. Der Leitfaden übernimmt die grafische Sprache der dApp, ohne ihre inzwischen überholten Slogans zu übernehmen.

## Die Dokumentation

Als Engine wurde **HonKit 6.2.2** gewählt, ein Fork der GitBook-Engine zur Erstellung von Büchern und Dokumentationen aus Markdown. Inhaltsverzeichnis, statische Erzeugung, Suche und Seitennavigation stammen aus diesem Framework. Das CUBIT-Theme erweitert seine Vorlagen und Stile. [Offizielle HonKit-Dokumentation](https://honkit.netlify.app/).

Die lokale Installation und die Befehle `serve` / `build` folgen der [offiziellen Einstiegsdokumentation](https://honkit.netlify.app/setup.html). Die [Buchkonfiguration](https://honkit.netlify.app/config.html) erläutert insbesondere das Inhaltswurzelverzeichnis und die Stile. Die Veröffentlichung 6.2.2 identifiziert die verwendete Version.

Die README im Wurzelverzeichnis von `gitbook/` beschreibt Installation, Befehle, Browserprüfungen und die Grenzen der Werkzeuge. Die Validierungen dieser Website prüfen das Buch; sie validieren nicht die Verträge des Protokolls.

## Diesen Leitfaden pflegen

Aktualisieren Sie für eine neue Veröffentlichung zuerst den Versionsstatus und die maßgebliche Referenz. Synchronisieren Sie danach die Regeln, die API und die tatsächlich angebundenen Abläufe. Behalten Sie den historischen Hinweis bei, wenn ein früheres Ergebnis nicht die endgültigen Quellen betrifft.

Fügen Sie eine Seite in `docs/` hinzu, verweisen Sie in `SUMMARY.md` auf sie und bauen Sie das Buch anschließend neu. Die Quellen dieser Dokumentation werden ausdrücklich ausgewählt; private Konfigurationen, Schlüssel, authentifizierte RPCs und Transaktionsdumps gehören nicht zur Website.
