---
description: "La guía en español de CUBIT: tasas, banda de liquidez, muros financiados por las ventas y módulos V2, con el estado real de cada parte."
section: "BIENVENIDA / CUBIT"
reading: "EL PROTOCOLO, EXPLICADO"
home: true
search:
  keywords: ["inicio", "documentación", "guía", "CUBIT", "empezar"]
---

<div class="home-hero">
  <p class="eyebrow">UNISWAP V4 · LIQUIDEZ DEL PROTOCOLO</p>
  <h1>Entiende<span class="line-break"></span>qué mantiene<span class="line-break"></span><span class="highlight">los muros en pie.</span></h1>
  <span class="hero-spark" aria-hidden="true"></span>
  <p class="lead">Una banda de liquidez colocada en el lanzamiento. Ventas que financian muros en ETH. Esta guía explica las reglas, los usos y los límites de CUBIT.</p>
  <div class="hero-actions">
    <a href="comprendre/essentiel.md" class="primary-button">Empieza aquí →</a>
    <a href="securite/etat.md" class="secondary-button">Consulta el estado de las versiones ↗</a>
  </div>
</div>

<div class="edition-alert">
  <span class="alert-icon" aria-hidden="true">!</span>
  <p><strong>Esta guía describe la nueva versión de CUBIT.</strong><span class="line-break"></span>CUBIT está desplegado en Ethereum y la app lee ese despliegue, con un 0,01% de comisiones LP. El mercado está abierto desde el 22 de septiembre de 2026: las compras y las ventas se hacen en la app.</p>
</div>

<dl class="metric-strip">
  <div><dt>Oferta total</dt><dd>21 M</dd><small>CUBIT · sin emisión posterior</small></div>
  <div><dt>Tasa de compra</dt><dd>3%</dd><small>Parte del equipo</small></div>
  <div><dt>Tasa de venta</dt><dd>15%</dd><small>12% muros / 3% equipo</small></div>
  <div><dt>Comisiones LP previstas</dt><dd>0,01%</dd><small>Nueva versión · fee 100</small></div>
</dl>

<div class="home-heading"><h2>Elige por dónde empezar.</h2><span>01 — LOS RECORRIDOS</span></div>

<div class="guide-cards">
  <a href="comprendre/murs.md" class="guide-card"><span class="card-index">01 / ENTENDER</span><strong>Cómo se financia<span class="line-break"></span>un muro.</strong><p>El precio objetivo, el 12% de cada venta y los muros fijados en su tick.</p><span class="card-link">Explora el mecanismo →</span></a>
  <a href="utiliser/swaps.md" class="guide-card"><span class="card-index">02 / USAR</span><strong>Lee antes<span class="line-break"></span>de firmar.</strong><p>Las cotizaciones netas, las autorizaciones y los datos on-chain.</p><span class="card-link">Abre la guía de usuario →</span></a>
  <a href="developper/architecture.md" class="guide-card"><span class="card-index">03 / CONSTRUIR</span><strong>Del contrato<span class="line-break"></span>a la interfaz.</strong><p>El hook, la banda, el registro V2 y los vaults.</p><span class="card-link">Explora el código →</span></a>
</div>

<div class="home-heading"><h2>Un mercado, dos libros distintos.</h2><span>02 — EL FUNCIONAMIENTO</span></div>

<div class="mechanism-strip">
  <div><div class="number">01 — LAS VENTAS</div><strong>El 12% financia<span class="line-break"></span>un muro en cada venta.</strong><p>El muro se coloca en el objetivo calculado después de la venta; en el precio de lanzamiento o por debajo, se coloca un 1% por debajo del precio actual.</p></div>
  <div><div class="number">02 — LOS MUROS</div><strong>Un nivel fijo.<span class="line-break"></span>ETH limitado.</strong><p>El precio de un muro y su capacidad de absorción son dos datos diferentes.</p></div>
  <div><div class="number">03 — LA BANDA</div><strong>Una liquidez<span class="line-break"></span>colocada una sola vez.</strong><p>El 80% de la oferta, desde el precio de lanzamiento hasta la cima de la curva, sin retirarse nunca.</p></div>
</div>

## El punto esencial

Cada venta destina **el 12% de sus ETH brutos** a los muros. El hook vacía primero los muros que el precio ha atravesado por completo y, después, coloca los ETH pendientes en un muro en `objetivo = 0,4 × precio actual + 0,6 × precio de lanzamiento`, calculado sobre el precio después de la venta. En el precio de lanzamiento o por debajo, donde este objetivo quedaría por encima del mercado, el muro se coloca un 1% por debajo del precio actual. Para una base ilustrativa de 7 000 unidades, el objetivo es **16,2k a 30k**, **44,2k a 100k** y **28,2k si el mercado vuelve a 60k**. No depende de un máximo histórico.

Un muro permanece en su tick. Cuando se atraviesa por completo, se vacía y sus CUBIT pasan a la reserva de recompensas del vault: ya no se queman. Esta regla no crea fondos adicionales ni capacidad ilimitada de recompra. [Consulta los ejemplos y el simulador del objetivo](comprendre/murs.md).

## Una documentación con estados explícitos

La guía describe el protocolo tal como está programado e identifica el **despliegue Ethereum en servicio**. En la V2, Momentum y la Forge están abiertos desde el 23 de septiembre de 2026, y el Vault desde el 26 de septiembre de 2026. Las próximas etapas figuran en el [roadmap](roadmap.md).

Para verificar una versión, empieza por el [estado de las versiones](securite/etat.md), después por los [permisos](securite/permissions.md) y los [límites](securite/risques.md). Los informes de pruebas antiguos no certifican la nueva versión.
