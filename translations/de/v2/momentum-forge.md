---
description: "Momentum bietet eine schreibgeschützte Marktansicht. Die Forge ist ein öffentliches Launchpad; ihre Startgebühren und die von den Walls der Kindmärkte aufgenommenen Token fließen in den Governance-Vault des Launchpads."
section: "03 / DIE V2-MODULE"
reading: "5 MIN LESEZEIT"
search:
  keywords: [Momentum, Forge, Kindmarkt, Launchpad, öffentlich, Governance, NAV, Sperre, Lock, 30 Tage, Verlängerung]
---

# Momentum und Forge

Diese beiden Module haben unterschiedliche Aufgaben: **Momentum macht den Zustand des Marktes sichtbar**, während **die Forge es jedem ermöglicht, einen isolierten Kindmarkt zu starten**.

## Momentum: den Markt beobachten

Momentum ist eine Seite der App: Für jeden Token zeigt sie die aktiven Walls, die teilweise aufgebrauchten Walls und den Verlauf der durchlaufenen Walls, auf Grundlage der Events des Hooks und der Abfragen des Lens. Sie ist seit dem 23. September 2026 geöffnet.

Es handelt sich um eine **schreibgeschützte** Funktion ohne Befugnis, ETH aus den Walls zu entnehmen oder die Regeln des Kerns zu ändern. Eine Änderung der Anzeige ist kein Handelsbefehl.

Die tatsächlich verwendete Geometrie bleibt diejenige des Hooks. Sie kann nicht von einer Frontend-Komponente erfunden werden.

## Forge: ein öffentliches Launchpad

Die Forge ist **für alle offen**: Jedes Konto startet einen Kindmarkt gegen Zahlung der exakten Startgebühr. Sie war nicht Teil des CUBIT-Starts: Das Team hat sie am 23. September 2026 zusammen mit ihrem Governance-Vault hinzugefügt und am selben Tag geöffnet.

Jeder Kindmarkt erhält seinen Token, seinen Hook, seine Poolidentitäten und seine eigenen Reserven. Die Vorlage zur Erstellung des Hooks wird durch einen im Forge-Konstruktor festgelegten Hash kontrolliert. Die Deployment-Salts sind an den startenden Account gebunden: Zwei Starts im selben Block machen sich nicht gegenseitig ungültig, und das Kopieren der Salts eines anderen Kontos übernimmt nicht dessen Start.

Ein Kindmarkt **hinterlegt 100 % seines Angebots in seinem Band**. Er hat weder eine Vault-Reserve noch eine Teamzuteilung. Name, Symbol, Teamadresse, Deployment-Salt und bereitgestellter Code werden geprüft. Wie der des übergeordneten Marktes hat auch der Hook eines Kindmarkts keinen Administrator. Die Erstellung eines Kindmarkts verleiht keine Berechtigungen für den übergeordneten CUBIT-Pool. Die Parameter sind vorgegeben: dieselbe Startbewertung, dasselbe Angebot und dieselben Steuern für jeden Kindmarkt.

## Der Governance-Vault des Launchpads

Der **Governance-Vault des Launchpads** erhält die Startgebühren der Forge in ETH und die von den Walls der Kindmärkte aufgenommenen Token, die nicht an den Staking-Vault des übergeordneten Marktes gehen:

- jede Einlage ist dort **30 Tage ab ihrer Verbuchung** gesperrt, zuzüglich einer etwaigen Verlängerung: Die Verbuchung erfolgt sofort bei einer Einzahlung, einer Startgebühr oder einer Lieferung eines Kindmarkts und bei direkt an den Vault gesendeten Token erst beim Aufruf von `lockUntracked`;
- **der Deployer kann die Sperre** des gesamten Vaults, für bestehende und künftige Einlagen, Token und ETH, jederzeit mit `extendLock` **verlängern**; keine Funktion verkürzt eine Sperre;
- zum Beispiel werden 10 Token, die 7 Tage lang täglich eingehen, in 7 Tranchen entsperrt, eine pro Tag, die letzte nach 1 Monat und 7 Tagen;
- **nur der Deployer** dieses Vaults kann die entsperrten Tranchen abrufen, und das dauerhaft: Keine Funktion kann dieses Recht übertragen;
- seine Bestände sollen dem Token des Launchpads als Wertreferenz oder NAV dienen.

Die Forge erhält die Adresse dieses Vaults bei ihrer Erstellung in `governanceVault`. Der Hook eines Kindmarkts ermittelt sie über die Forge, die seinen Token bereitgestellt hat; anschließend überträgt `deliverAbsorbed()` die Token der geleerten Walls dorthin und sperrt sie mit `lockUntracked`.

## Die Startgebühr

Jeder Start zahlt seine Gebühr in ETH über `depositEth()` in derselben Transaktion an den Governance-Vault des Launchpads. Die Gebühr gehört damit der Governance: **der startende Account erhält sie nie zurück**, und **nur der Deployer** des Vaults kann sie mit `claim` abrufen. Die Gebühr finanziert nicht die Walls von CUBIT. Wie jede Einlage dieses Vaults folgt sie danach der oben beschriebenen Sperrregel.

Der Betrag `launchFee()` wird bei der Erstellung jeder Forge festgelegt: Er beträgt **0,005 ETH**, also 5 × 10^15 Wei, und ist unveränderlich. Eine Änderung der Gebühr erfordert daher eine neue Forge; fragen Sie stets den On-Chain-Betrag des tatsächlich verwendeten Vertrags ab.

## Wenn Forge ausgetauscht wird

Das Team kann die Forge jederzeit ohne Verzögerung austauschen. Der Austausch ändert die Referenz-Factory für zukünftige Starts und mit ihr den Governance-Vault, der deren Gebühren erhält; er deaktiviert Forge bis zur erneuten Aktivierung. Bereits erstellte Kindmärkte behalten ihre eigenen Verträge und Mittel. Ein Launchpad v2 kann so für seine eigenen Starts andere Parameter festlegen.

Die Kompatibilitätsprüfungen der Registry ersetzen keine Prüfung der Vorlage und der Factory.

## Ein Launchpad v2

Die Parameter der Kindmärkte werden von der registrierten Forge vorgegeben. Eine Ersatz-Forge, ein Launchpad v2, kann andere festlegen; das Team öffnet sie, wann es dies beschließt.

Bereits gestartete Kindmärkte laufen auf ihren eigenen Pools weiter, und die von ihren Walls aufgenommenen Token gehen weiterhin an den Governance-Vault der Forge, die sie gestartet hat.

<p class="source-note">Quellen: Designentscheidungen vom 14. und 15. September 2026, <code>periphery/CubitForge.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>CubitHook.absorbedTokenSink</code>, <code>CubitV2.setForge</code> und <code>dapp/src/pages/Momentum.tsx</code>.</p>
