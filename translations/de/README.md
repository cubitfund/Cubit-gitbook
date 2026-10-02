---
description: "Der deutsche CUBIT-Leitfaden: Steuern, Liquiditätsband, durch Verkäufe finanzierte Walls und V2-Module mit dem tatsächlichen Status jedes Teils."
section: "WILLKOMMEN / CUBIT"
reading: "DAS PROTOKOLL ERKLÄRT"
home: true
search:
  keywords: [Startseite, Dokumentation, Leitfaden, CUBIT, Einstieg]
---

<div class="home-hero">
  <p class="eyebrow">UNISWAP V4 · LIQUIDITÄT DES PROTOKOLLS</p>
  <h1>Verstehen,<span class="line-break"></span>was die<span class="line-break"></span><span class="highlight">Walls trägt.</span></h1>
  <span class="hero-spark" aria-hidden="true"></span>
  <p class="lead">Ein beim Start platziertes Liquiditätsband. Verkäufe, die Walls in ETH finanzieren. Dieser Leitfaden erklärt die Regeln, die Nutzung und die Grenzen von CUBIT.</p>
  <div class="hero-actions">
    <a href="comprendre/essentiel.md" class="primary-button">Hier beginnen →</a>
    <a href="securite/etat.md" class="secondary-button">Versionsstatus ansehen ↗</a>
  </div>
</div>

<div class="edition-alert">
  <span class="alert-icon" aria-hidden="true">!</span>
  <p><strong>Dieser Leitfaden beschreibt die neue Version von CUBIT.</strong><span class="line-break"></span>CUBIT ist auf Ethereum bereitgestellt, und die App liest dieses Deployment, mit 0,01 % LP-Gebühren. Der Markt ist seit dem 22. September 2026 eröffnet: Käufe und Verkäufe laufen über die App.</p>
</div>

<dl class="metric-strip">
  <div><dt>Gesamtangebot</dt><dd>21 Mio.</dd><small>CUBIT · kein späteres Minting</small></div>
  <div><dt>Kaufsteuer</dt><dd>3 %</dd><small>Teamanteil</small></div>
  <div><dt>Verkaufssteuer</dt><dd>15 %</dd><small>12 % Walls / 3 % Team</small></div>
  <div><dt>Angestrebte LP-Gebühren</dt><dd>0,01 %</dd><small>Neue Version · fee 100</small></div>
</dl>

<div class="home-heading"><h2>Wählen Sie Ihren Einstieg.</h2><span>01 — DIE WEGE</span></div>

<div class="guide-cards">
  <a href="comprendre/murs.md" class="guide-card"><span class="card-index">01 / VERSTEHEN</span><strong>Wie eine Wall<span class="line-break"></span>finanziert wird.</strong><p>Das Preisziel, die 12 % jedes Verkaufs und die an ihrem Tick festen Walls.</p><span class="card-link">Den Mechanismus erkunden →</span></a>
  <a href="utiliser/swaps.md" class="guide-card"><span class="card-index">02 / NUTZEN</span><strong>Vor dem Signieren<span class="line-break"></span>lesen.</strong><p>Nettoquotierungen, Freigaben und On-Chain-Daten.</p><span class="card-link">Nutzerleitfaden öffnen →</span></a>
  <a href="developper/architecture.md" class="guide-card"><span class="card-index">03 / ENTWICKELN</span><strong>Vom Vertrag<span class="line-break"></span>zur Oberfläche.</strong><p>Der Hook, das Band, die V2-Registry und die Vaults.</p><span class="card-link">Die Codebasis erkunden →</span></a>
</div>

<div class="home-heading"><h2>Ein Markt, zwei getrennte Bücher.</h2><span>02 — DIE FUNKTIONSWEISE</span></div>

<div class="mechanism-strip">
  <div><div class="number">01 — DIE VERKÄUFE</div><strong>12 % finanzieren<span class="line-break"></span>bei jedem Verkauf eine Wall.</strong><p>Die Wall wird an dem nach dem Verkauf berechneten Ziel platziert; auf oder unter dem Startpreis wird sie 1 % unter dem aktuellen Preis platziert.</p></div>
  <div><div class="number">02 — DIE WALLS</div><strong>Ein festes Niveau.<span class="line-break"></span>Begrenzte ETH.</strong><p>Der Preis einer Wall und ihre Aufnahmekapazität sind zwei unterschiedliche Angaben.</p></div>
  <div><div class="number">03 — DAS BAND</div><strong>Liquidität,<span class="line-break"></span>einmal platziert.</strong><p>80 % des Angebots, vom Startpreis bis zur Spitze der Kurve, nie abgezogen.</p></div>
</div>

## Das Wesentliche

Jeder Verkauf weist **12 % seiner Brutto-ETH** den Walls zu. Der Hook leert zuerst die Walls, die der Preis vollständig durchlaufen hat, und platziert dann die wartenden ETH in einer Wall bei `cible = 0,4 × prix courant + 0,6 × prix de lancement`, wobei das Ziel anhand des Preises nach dem Verkauf berechnet wird. Auf oder unter dem Startpreis, wo dieses Ziel über dem Markt läge, wird die Wall 1 % unter dem aktuellen Preis platziert. Bei einer beispielhaften Basis von 7 000 Einheiten beträgt das Ziel **16,2k bei 30k**, **44,2k bei 100k** und anschließend **28,2k, wenn der Markt auf 60k zurückfällt**. Es hängt nicht von einem historischen Höchststand ab.

Eine Wall bleibt an ihrem Tick. Wird sie vollständig durchlaufen, wird sie geleert, und ihre CUBIT fließen in die Belohnungsreserve des Vaults: Sie werden nicht mehr verbrannt. Diese Regel schafft weder zusätzliche Mittel noch eine unbegrenzte Rückkaufkapazität. [Beispiele und Zielsimulator ansehen](comprendre/murs.md).

## Eine Dokumentation mit klaren Statusangaben

Der Leitfaden beschreibt das Protokoll so, wie es programmiert ist, und benennt das **im Einsatz befindliche Ethereum-Deployment**. In V2 sind Momentum und die Forge seit dem 23. September 2026 geöffnet, der Vault seit dem 26. September 2026. Die nächsten Schritte stehen in der [Roadmap](roadmap.md).

Um eine Version zu prüfen, beginnen Sie mit dem [Versionsstatus](securite/etat.md), danach folgen die [Berechtigungen](securite/permissions.md) und die [Grenzen](securite/risques.md). Frühere Testberichte bestätigen die neue Version nicht.
