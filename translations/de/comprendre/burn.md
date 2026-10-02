---
description: "Was aus einer von Verkäufen erreichten Wall wird: teilweise aufgebraucht, bleibt sie bestehen; vollständig durchlaufen, wird sie geleert, und ihre CUBIT fließen ohne Burn in die Belohnungsreserve des Vaults."
section: "01 / VERSTEHEN"
reading: "4 MIN LESEZEIT"
search:
  keywords: [Aufnahme, durchlaufen, durchlaufene, aufgebraucht, Reserve, Vault, Belohnungen, Belohnungsreserve, Burn, Vernichtung, Governance, deliverAbsorbed]
---

# Durchlaufene Walls und Vault-Reserve

Wenn ein Verkauf eine Wall erreicht, kaufen die ETH dieser Wall CUBIT zurück. In der neuen Version werden diese CUBIT **nicht mehr verbrannt**: Die CUBIT einer vollständig durchlaufenen Wall fließen in die **Belohnungsreserve des Vaults**.

## Teilweise aufgebraucht oder vollständig durchlaufen

| Zustand der Wall | Was geschieht |
| --- | --- |
| Nicht erreicht | Die Wall enthält nur ETH, an ihrem Tick |
| Teilweise aufgebraucht | Ein Teil ihrer ETH hat CUBIT zurückgekauft; die Wall bleibt bestehen |
| Preis nach einer teilweise aufgebrauchten Wall wieder gestiegen | Die Wall verkauft ihre CUBIT und füllt sich wieder mit ETH auf |
| Vollständig durchlaufen | Die Wall enthält nur noch CUBIT; der Verkauf, der sie durchlaufen hat, leert sie, ihre CUBIT warten auf ihre Übertragung, und ihre restlichen ETH fließen zurück in `pendingFloorEth` |

Eine Wall wird erst geleert, wenn sie **vollständig durchlaufen** ist. Solange sie nur teilweise aufgebraucht ist, greift der Hook nicht ein: Sie funktioniert weiter wie eine gewöhnliche LP-Position an ihrem Tick. Ein und derselbe Verkauf leert alle Walls, die er vollständig durchlaufen hat, von der nächstgelegenen bis zur entferntesten.

## Der Weg der CUBIT

```text
Ein Verkauf durchläuft eine Wall vollständig
    → der Verkauf leert die Wall
    → ihre CUBIT warten in pendingAbsorbedTokens
    → deliverAbsorbed() sendet sie an die Belohnungsreserve des Vaults
```

Der CUBIT-Router ruft `deliverAbsorbed()` am Ende jedes Verkaufs in derselben Transaktion auf. Schlägt diese Übertragung fehl, wird der Verkauf nicht blockiert: Die CUBIT bleiben isoliert im Hook. Nach einem Verkauf über einen anderen Router oder nach einer fehlgeschlagenen Übertragung kann jedes Konto `deliverAbsorbed()` aufrufen, ohne Empfänger oder Betrag festzulegen. Die Reserve zahlt anschließend die tägliche Belohnung der Einleger des Vaults. [mCUBIT Vault](../v2/vault.md).

## Das Angebot sinkt nicht mehr

Das Angebot bleibt auf **21 Millionen CUBIT** festgelegt, ohne Minting. Da die CUBIT der Walls nicht mehr vernichtet werden, sinkt es durch Aufnahmen nicht mehr: CUBIT wird nicht mehr als deflationär dargestellt. Nur der vernachlässigbare Rundungsstaub der anfänglichen Einlage wird beim Start verbrannt.

Die aus der Reserve als Belohnungen ausgezahlten CUBIT sind gewöhnliche Token: Ihre Empfänger können sie behalten, hinterlegen oder verkaufen.

## Die Forge-Kindmärkte

Bei einem von der Forge erstellten Kindmarkt gehen die Token der geleerten Walls nicht an einen Staking-Vault: `deliverAbsorbed()` sendet sie an den **Governance-Vault des Launchpads**, dessen Adresse in der Forge festgelegt ist, die den Kind-Token bereitgestellt hat. Jede Einlage bleibt dort ab ihrem eigenen Eingang 30 Tage gesperrt, und nur der Deployer dieses Vaults kann sie abrufen. [Momentum und Forge](../v2/momentum-forge.md).

## Was die Aufnahme nicht garantiert

Eine Wall, die einen Verkauf aufnimmt, gibt ihre ETH aus. Eine teilweise aufgebrauchte Wall füllt sich nur dann wieder mit ETH auf, wenn der Preis über sie steigt; eine geleerte Wall erhält nur dann wieder Tiefe, wenn eine neue Finanzierung auf ihren Tick fällt.

Die Nachweise des früheren Strict-Burn validieren diesen neuen Weg nicht. Er läuft seit dem 22. September 2026 auf Ethereum. [Bekannte Grenzen ansehen](../securite/risques.md).

## Die Bewegungen prüfen

Um eine Aufnahme zu verfolgen, gleichen Sie die Ereignisse des Hooks ab: `WallAbsorbed(id, cubit, ethRemaining)` für jede geleerte Wall, `TokensAbsorbed(amount, pendingAbsorbedTokens)` für die Gesamtmenge, die auf ihre Übertragung wartet, und anschließend `AbsorbedDelivered(sink, amount)` bei der Übertragung. Auf der Empfängerseite emittiert der Vault `RewardReserveFunded`; bei einem Forge-Kindmarkt emittiert der Governance-Vault `Deposited`.

<p class="source-note">Quellen: Designentscheidungen vom 14. September 2026, <code>CubitHook._collectCrossedWalls</code>, <code>deliverAbsorbed</code>, <code>absorbedTokenSink</code>, <code>WallLib.collectCrossed</code>, <code>CubitRouter._finishSwap</code>, <code>CubitVault.fundRewardReserve</code> und <code>periphery/CubitGovernanceVault.sol</code>.</p>
