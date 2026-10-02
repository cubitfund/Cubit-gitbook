---
description: "Le guide français de CUBIT : taxes, bande de liquidité, murs financés par les ventes et modules V2, avec le statut réel de chaque partie."
section: "BIENVENUE / CUBIT"
reading: "LE PROTOCOLE, EXPLIQUÉ"
home: true
search:
  keywords: [accueil, documentation, guide, CUBIT, commencer]
---

<div class="home-hero">
  <p class="eyebrow">UNISWAP V4 · LIQUIDITÉ DU PROTOCOLE</p>
  <h1>Comprendre<span class="line-break"></span>ce qui fait<span class="line-break"></span><span class="highlight">tenir les murs.</span></h1>
  <span class="hero-spark" aria-hidden="true"></span>
  <p class="lead">Une bande de liquidité posée au lancement. Des ventes qui financent des murs en ETH. Ce guide explique les règles, les usages et les limites de CUBIT.</p>
  <div class="hero-actions">
    <a href="comprendre/essentiel.md" class="primary-button">Commencer ici →</a>
    <a href="securite/etat.md" class="secondary-button">Voir l’état des versions ↗</a>
  </div>
</div>

<div class="edition-alert">
  <span class="alert-icon" aria-hidden="true">!</span>
  <p><strong>Ce guide décrit la nouvelle version de CUBIT.</strong><span class="line-break"></span>CUBIT est déployé sur Ethereum et l’app lit ce déploiement, avec 0,01 % de frais LP. Le marché est ouvert depuis le 22 septembre 2026 : les achats et les ventes se font dans l’app.</p>
</div>

<dl class="metric-strip">
  <div><dt>Offre totale</dt><dd>21 M</dd><small>CUBIT · aucun mint ultérieur</small></div>
  <div><dt>Taxe d’achat</dt><dd>3 %</dd><small>Part équipe</small></div>
  <div><dt>Taxe de vente</dt><dd>15 %</dd><small>12 % murs / 3 % équipe</small></div>
  <div><dt>Frais LP visés</dt><dd>0,01 %</dd><small>Nouvelle version · fee 100</small></div>
</dl>

<div class="home-heading"><h2>Choisissez votre point d’entrée.</h2><span>01 — LES PARCOURS</span></div>

<div class="guide-cards">
  <a href="comprendre/murs.md" class="guide-card"><span class="card-index">01 / COMPRENDRE</span><strong>Comment un mur<span class="line-break"></span>est financé.</strong><p>La cible de prix, les 12 % de chaque vente et les murs fixés à leur tick.</p><span class="card-link">Explorer le mécanisme →</span></a>
  <a href="utiliser/swaps.md" class="guide-card"><span class="card-index">02 / UTILISER</span><strong>Lire avant<span class="line-break"></span>de signer.</strong><p>Les cotations nettes, les approvals et les données on-chain.</p><span class="card-link">Ouvrir le guide utilisateur →</span></a>
  <a href="developper/architecture.md" class="guide-card"><span class="card-index">03 / CONSTRUIRE</span><strong>Du contrat<span class="line-break"></span>à l’interface.</strong><p>Le hook, la bande, le registre V2 et les vaults.</p><span class="card-link">Parcourir la codebase →</span></a>
</div>

<div class="home-heading"><h2>Un marché, deux livres distincts.</h2><span>02 — LE FONCTIONNEMENT</span></div>

<div class="mechanism-strip">
  <div><div class="number">01 — LES VENTES</div><strong>12 % financent<span class="line-break"></span>un mur à chaque vente.</strong><p>Le mur est placé à la cible calculée après la vente ; au prix de lancement ou en dessous, il est posé 1 % sous le prix courant.</p></div>
  <div><div class="number">02 — LES MURS</div><strong>Un niveau fixe.<span class="line-break"></span>Des ETH limités.</strong><p>Le prix d’un mur et sa capacité d’absorption sont deux informations différentes.</p></div>
  <div><div class="number">03 — LA BANDE</div><strong>Une liquidité<span class="line-break"></span>posée une fois.</strong><p>80 % de l’offre, du prix de lancement jusqu’au sommet de la courbe, jamais retirés.</p></div>
</div>

## Le point essentiel

Chaque vente affecte **12 % de ses ETH bruts** aux murs. Le hook vide d’abord les murs que le prix a entièrement traversés, puis place les ETH en attente dans un mur à `cible = 0,4 × prix courant + 0,6 × prix de lancement`, calculée sur le prix après la vente. Au prix de lancement ou en dessous, où cette cible serait au-dessus du marché, le mur est posé 1 % sous le prix courant. Pour une base illustrative de 7 000 unités, la cible vaut **16,2k à 30k**, **44,2k à 100k**, puis **28,2k si le marché revient à 60k**. Elle ne dépend pas d’un plus haut historique.

Un mur reste à son tick. Entièrement traversé, il est vidé et ses CUBIT rejoignent la réserve de récompenses du vault : ils ne sont plus brûlés. Cette règle ne crée ni fonds supplémentaires ni capacité de rachat illimitée. [Voir les exemples et le simulateur de cible](comprendre/murs.md).

## Une documentation avec des statuts explicites

Le guide décrit le protocole tel qu’il est codé et identifie le **déploiement Ethereum en service**. Dans la V2, Momentum et la Forge sont ouverts depuis le 23 septembre 2026, et le Vault depuis le 26 septembre 2026. Les prochaines étapes figurent dans la [roadmap](roadmap.md).

Pour vérifier une version, commencez par [l’état des versions](securite/etat.md), puis [les permissions](securite/permissions.md) et [les limites](securite/risques.md). Les anciens rapports de tests ne certifient pas la nouvelle version.
