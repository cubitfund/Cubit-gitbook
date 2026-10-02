---
description: "Definitionen der Begriffe im CUBIT-Leitfaden: Band, Wall, Ziel, Belohnungsreserve, Tick, Hook und Claim."
section: "05 / PRÜFEN"
reading: "DER WORTSCHATZ DES PROTOKOLLS"
search:
  keywords: [Glossar, Definition, Wortschatz, Begriffe]
---

# Glossar

| Begriff | Definition in CUBIT |
| --- | --- |
| ABI | Beschreibung der Funktionen, Ereignisse und Typen zur Kommunikation mit einem Vertrag |
| Kauf des Deployers | In der Starttransaktion enthaltener Kauf über 0,1 ETH, mit 3 % besteuert und nicht gesperrt |
| Teamadresse | Festgeschriebene Adresse, die den Teamanteil der Steuern erhält und die Module der Registry jederzeit ohne Verzögerung austauschen und anschließend aktivieren kann; ihre Befugnisse sind dauerhaft |
| Freigabe | ERC-20-Genehmigung, die einer Spender-Adresse für einen Betrag erteilt wird |
| Band | Einzige Handelsposition, beim Start mit 80 % des Angebots platziert, deckt alle Preise oberhalb des Startpreises ab und wird nie abgezogen |
| Burn | Vernichtung von Token; die neue Version verbrennt keine CUBIT der Walls mehr, nur den Rundungsstaub des Starts |
| Ziel | Bei jedem Verkauf anhand des Preises nach dem Verkauf berechnetes Niveau zur Platzierung einer Wall: 0,4 × aktueller Preis + 0,6 × Startpreis; auf oder unter dem Startpreis wird die Wall 1 % unter dem aktuellen Preis platziert |
| ERC-6909-Claim | Im PoolManager gehaltene Buchhaltungseinheit zur Abrechnung oder Aufbewahrung von Vermögenswerten |
| Belohnungs-Claim | Aufruf zum Abrufen einer erworbenen Belohnung; andere Verwendung des Wortes Claim als bei ERC-6909 |
| x·y=k-Kurve | Kurve mit konstantem Produkt, der Käufe und Verkäufe im Band folgen |
| Gehaltene CUBIT | Umlaufangebot abzüglich der CUBIT, die das Band noch nicht verkauft hat: was die Halter besitzen, gestakte CUBIT eingeschlossen |
| Deadline | Höchster für einen Vorgang oder eine Signatur akzeptierter Zeitstempel |
| Exact-Input | Swap mit festgelegter Eingabe und durch einen Mindestwert geschützter Ausgabe |
| Exact-Output | Swap mit festgelegter Ausgabe und durch einen Höchstwert geschützter Eingabe |
| Start-FDV | Vollständig verwässerte Kapitalisierung, die den Startpreis festlegt; 3,75 ETH für die neue Version |
| LP-Gebühr | Poolgebühr, getrennt von den Steuern des Hooks |
| Floor | Historischer Name im Code; Walls und Ziel getrennt betrachten |
| Hook | An Uniswap-v4-Vorgänge angebundener Vertrag, der hier die CUBIT-Mechanik anwendet; er hat keinen Administrator |
| Ungenutzte ETH | Außerhalb jeder Position verbuchte ETH; ihr Bereich muss angegeben werden |
| Lens | Abfragevertrag, der Zahlen aus Hook und Pool ableitet |
| Liquidität / Tiefe | Tatsächlich in Positionen verfügbare Vermögenswerte, abhängig von deren Zustand und dem Preis |
| Beste Wall | Die dem Markt am nächsten liegende aktive Wall, die ein Verkauf zuerst erreicht; der Lens liefert ihren Bruttopreis und ihren Preis nach Gebühren und Steuer |
| Wall | Durch Verkäufe mit ETH finanzierte LP-Position an einem festen Tick; nur eine Wall pro Tick |
| Teilweise aufgebrauchte Wall | Wall, deren ETH teilweise CUBIT zurückgekauft haben; sie bleibt bestehen |
| Durchlaufene Wall | Durch Verkäufe vollständig in CUBIT umgewandelte Wall; der Verkauf, der sie durchlaufen hat, leert sie zugunsten der Reserve des Vaults |
| Umlaufangebot | Gesamtangebot abzüglich der CUBIT in den Walls, der auf ihre Übertragung wartenden CUBIT und der Belohnungsreserve aller registrierten Vaults; gestakte CUBIT bleiben im Umlauf |
| Pending Absorbed Tokens | CUBIT durchlaufener Walls, isoliert im Hook bis zu ihrer Übertragung durch `deliverAbsorbed()` |
| Pending Floor ETH | Auf Platzierung wartende Mittel der Walls: 12 % der Verkäufe und von durchlaufenen Walls freigegebene ETH, die derselbe Verkauf platziert; dort bleiben nur Staub, der zu klein für eine Position ist, und der Extremfall eines Preises ganz oben im Tick-Bereich |
| Permissionless | Für alle offener Aufruf, der den deterministischen Bedingungen des Vertrags unterliegt |
| PoolId | Aus der gesamten PoolKey abgeleitete Kennung |
| Startpreis | Beim Deployment festgeschriebener Preis in ETH pro CUBIT: Start-FDV geteilt durch 21 Millionen |
| V2-Registry | Vertrag, der die aktuellen Module, ihre Revision, die geöffneten Funktionen und den Verlauf der Vaults speichert |
| Belohnungsreserve | Vom Vault gehaltene CUBIT zur Bezahlung der Einleger: 20 % des Angebots beim Start, danach die CUBIT durchlaufener Walls |
| Slippage | Akzeptierte Ausführungsabweichung gegenüber einer Quotierung, begrenzt durch die Swap-Grenzen |
| Snapshot | Konsistente Gesamtheit von Daten, die an einem bestimmten Block abgefragt wurden |
| Tick | Diskrete Preiseinheit des Pools; ihre Ausrichtung ist gegenüber dem ETH/CUBIT-Preis umgekehrt |
| V1 / V2 | Marktkern / zusätzliche Funktionen der Roadmap |
| Governance-Vault | Vault des Launchpads, der die Startgebühren der Forge in ETH, die nie erstattet werden, und die Token der Walls von Forge-Kindmärkten erhält; jede Einlage ist 30 Tage gesperrt, zuzüglich einer etwaigen Verlängerung, danach kann nur sein Deployer abrufen, dauerhaft und ohne Möglichkeit, dieses Recht zu übertragen; dieser Deployer kann die Sperre verlängern, aber nie verkürzen |

Für Einheiten und Vertragsmethoden siehe [Integration](developper/integration.md).
