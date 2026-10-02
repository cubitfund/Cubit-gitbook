---
description: "La guida italiana a CUBIT: tasse, banda di liquidità, muri finanziati dalle vendite e moduli V2, con lo stato reale di ogni parte."
section: "BENVENUTO / CUBIT"
reading: "IL PROTOCOLLO, SPIEGATO"
home: true
search:
  keywords: ["inizio", "documentazione", "guida", "CUBIT", "iniziare"]
---

<div class="home-hero">
  <p class="eyebrow">UNISWAP V4 · LIQUIDITÀ DEL PROTOCOLLO</p>
  <h1>Capire<span class="line-break"></span>cosa mantiene<span class="line-break"></span><span class="highlight">i muri in piedi.</span></h1>
  <span class="hero-spark" aria-hidden="true"></span>
  <p class="lead">Una banda di liquidità collocata al lancio. Vendite che finanziano muri in ETH. Questa guida spiega le regole, gli utilizzi e i limiti di CUBIT.</p>
  <div class="hero-actions">
    <a href="comprendre/essentiel.md" class="primary-button">Inizia qui →</a>
    <a href="securite/etat.md" class="secondary-button">Consulta lo stato delle versioni ↗</a>
  </div>
</div>

<div class="edition-alert">
  <span class="alert-icon" aria-hidden="true">!</span>
  <p><strong>Questa guida descrive la nuova versione di CUBIT.</strong><span class="line-break"></span>CUBIT è distribuito su Ethereum e l’app legge quel deployment, con commissioni LP dello 0,01%. Il mercato è aperto dal 22 settembre 2026: acquisti e vendite avvengono nell’app.</p>
</div>

<dl class="metric-strip">
  <div><dt>Offerta totale</dt><dd>21 M</dd><small>CUBIT · nessuna emissione successiva</small></div>
  <div><dt>Tassa di acquisto</dt><dd>3%</dd><small>Quota del team</small></div>
  <div><dt>Tassa di vendita</dt><dd>15%</dd><small>12% muri / 3% team</small></div>
  <div><dt>Commissioni LP previste</dt><dd>0,01%</dd><small>Nuova versione · fee 100</small></div>
</dl>

<div class="home-heading"><h2>Scegli da dove iniziare.</h2><span>01 — I PERCORSI</span></div>

<div class="guide-cards">
  <a href="comprendre/murs.md" class="guide-card"><span class="card-index">01 / CAPIRE</span><strong>Come viene<span class="line-break"></span>finanziato un muro.</strong><p>Il prezzo obiettivo, il 12% di ogni vendita e i muri fissati al loro tick.</p><span class="card-link">Esplora il meccanismo →</span></a>
  <a href="utiliser/swaps.md" class="guide-card"><span class="card-index">02 / USARE</span><strong>Leggi prima<span class="line-break"></span>di firmare.</strong><p>Quotazioni nette, approvazioni e dati on-chain.</p><span class="card-link">Apri la guida utente →</span></a>
  <a href="developper/architecture.md" class="guide-card"><span class="card-index">03 / SVILUPPARE</span><strong>Dal contratto<span class="line-break"></span>all’interfaccia.</strong><p>Hook, banda, registro V2 e vault.</p><span class="card-link">Esplora il codice →</span></a>
</div>

<div class="home-heading"><h2>Un mercato, due libri distinti.</h2><span>02 — IL FUNZIONAMENTO</span></div>

<div class="mechanism-strip">
  <div><div class="number">01 — LE VENDITE</div><strong>Il 12% finanzia<span class="line-break"></span>un muro a ogni vendita.</strong><p>Il muro viene collocato all’obiettivo calcolato dopo la vendita; al prezzo di lancio o al di sotto, viene collocato l’1% sotto il prezzo corrente.</p></div>
  <div><div class="number">02 — I MURI</div><strong>Un livello fisso.<span class="line-break"></span>ETH limitati.</strong><p>Il prezzo di un muro e la sua capacità di assorbimento sono informazioni diverse.</p></div>
  <div><div class="number">03 — LA BANDA</div><strong>Una liquidità<span class="line-break"></span>collocata una sola volta.</strong><p>L’80% dell’offerta, dal prezzo di lancio fino alla cima della curva, mai ritirato.</p></div>
</div>

## Il punto essenziale

Ogni vendita destina il **12% dei suoi ETH lordi** ai muri. L’hook svuota prima i muri che il prezzo ha interamente attraversato, poi colloca gli ETH in attesa in un muro a `obiettivo = 0,4 × prezzo corrente + 0,6 × prezzo di lancio`, calcolato sul prezzo dopo la vendita. Al prezzo di lancio o al di sotto, dove questo obiettivo sarebbe sopra il mercato, il muro viene collocato l’1% sotto il prezzo corrente. Per una base illustrativa di 7 000 unità, l’obiettivo è **16,2k a 30k**, **44,2k a 100k**, poi **28,2k se il mercato torna a 60k**. Non dipende da un massimo storico.

Un muro resta al suo tick. Una volta interamente attraversato, viene svuotato e i suoi CUBIT confluiscono nella riserva di ricompense del vault: non vengono più bruciati. Questa regola non crea fondi aggiuntivi né capacità illimitata di riacquisto. [Consulta gli esempi e il simulatore dell’obiettivo](comprendre/murs.md).

## Una documentazione con stati espliciti

La guida descrive il protocollo così come è implementato e identifica il **deployment Ethereum in servizio**. Nella V2, Momentum e la Forge sono aperti dal 23 settembre 2026, e il Vault dal 26 settembre 2026. Le prossime fasi figurano nella [roadmap](roadmap.md).

Per verificare una versione, inizia dallo [stato delle versioni](securite/etat.md), poi dai [permessi](securite/permissions.md) e dai [limiti](securite/risques.md). I vecchi rapporti di test non certificano la nuova versione.
