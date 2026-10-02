---
description: "O guia em português brasileiro do CUBIT: taxas, faixa de liquidez, muros financiados pelas vendas e módulos V2, com o estado real de cada parte."
section: "BOAS-VINDAS / CUBIT"
reading: "O PROTOCOLO, EXPLICADO"
home: true
search:
  keywords: ["início", "documentação", "guia", "CUBIT", "começar"]
---

<div class="home-hero">
  <p class="eyebrow">UNISWAP V4 · LIQUIDEZ DO PROTOCOLO</p>
  <h1>Entenda<span class="line-break"></span>o que mantém<span class="line-break"></span><span class="highlight">os muros de pé.</span></h1>
  <span class="hero-spark" aria-hidden="true"></span>
  <p class="lead">Uma faixa de liquidez colocada no lançamento. Vendas que financiam muros em ETH. Este guia explica as regras, os usos e os limites do CUBIT.</p>
  <div class="hero-actions">
    <a href="comprendre/essentiel.md" class="primary-button">Comece aqui →</a>
    <a href="securite/etat.md" class="secondary-button">Veja o estado das versões ↗</a>
  </div>
</div>

<div class="edition-alert">
  <span class="alert-icon" aria-hidden="true">!</span>
  <p><strong>Este guia descreve a nova versão do CUBIT.</strong><span class="line-break"></span>O CUBIT está implantado na Ethereum e o app lê essa implantação, com 0,01% de taxas LP. O mercado está aberto desde 22 de setembro de 2026: as compras e as vendas acontecem no app.</p>
</div>

<dl class="metric-strip">
  <div><dt>Oferta total</dt><dd>21 M</dd><small>CUBIT · sem emissão posterior</small></div>
  <div><dt>Taxa de compra</dt><dd>3%</dd><small>Parcela da equipe</small></div>
  <div><dt>Taxa de venda</dt><dd>15%</dd><small>12% muros / 3% equipe</small></div>
  <div><dt>Taxas LP previstas</dt><dd>0,01%</dd><small>Nova versão · fee 100</small></div>
</dl>

<div class="home-heading"><h2>Escolha por onde começar.</h2><span>01 — OS PERCURSOS</span></div>

<div class="guide-cards">
  <a href="comprendre/murs.md" class="guide-card"><span class="card-index">01 / ENTENDER</span><strong>Como um muro<span class="line-break"></span>é financiado.</strong><p>O preço-alvo, os 12% de cada venda e os muros fixados em seu tick.</p><span class="card-link">Explore o mecanismo →</span></a>
  <a href="utiliser/swaps.md" class="guide-card"><span class="card-index">02 / USAR</span><strong>Leia antes<span class="line-break"></span>de assinar.</strong><p>Cotações líquidas, aprovações e dados on-chain.</p><span class="card-link">Abra o guia do usuário →</span></a>
  <a href="developper/architecture.md" class="guide-card"><span class="card-index">03 / CONSTRUIR</span><strong>Do contrato<span class="line-break"></span>à interface.</strong><p>O hook, a faixa, o registro V2 e os vaults.</p><span class="card-link">Explore a base de código →</span></a>
</div>

<div class="home-heading"><h2>Um mercado, dois livros distintos.</h2><span>02 — O FUNCIONAMENTO</span></div>

<div class="mechanism-strip">
  <div><div class="number">01 — AS VENDAS</div><strong>12% financiam<span class="line-break"></span>um muro a cada venda.</strong><p>O muro é colocado no alvo calculado após a venda; no preço de lançamento ou abaixo dele, é colocado 1% abaixo do preço atual.</p></div>
  <div><div class="number">02 — OS MUROS</div><strong>Um nível fixo.<span class="line-break"></span>ETH limitado.</strong><p>O preço de um muro e sua capacidade de absorção são informações diferentes.</p></div>
  <div><div class="number">03 — A FAIXA</div><strong>Uma liquidez<span class="line-break"></span>colocada uma única vez.</strong><p>80% da oferta, do preço de lançamento até o topo da curva, nunca retirados.</p></div>
</div>

## O ponto essencial

Cada venda destina **12% de seus ETH brutos** aos muros. O hook primeiro esvazia os muros que o preço atravessou totalmente e depois aloca os ETH pendentes em um muro em `alvo = 0,4 × preço atual + 0,6 × preço de lançamento`, calculado sobre o preço após a venda. No preço de lançamento ou abaixo dele, onde esse alvo ficaria acima do mercado, o muro é colocado 1% abaixo do preço atual. Para uma base ilustrativa de 7 000 unidades, o alvo é **16,2k a 30k**, **44,2k a 100k** e depois **28,2k se o mercado voltar a 60k**. Ele não depende de uma máxima histórica.

Um muro permanece em seu tick. Quando totalmente atravessado, ele é esvaziado e seus CUBIT vão para a reserva de recompensas do vault: eles não são mais queimados. Essa regra não cria fundos adicionais nem capacidade ilimitada de recompra. [Veja os exemplos e o simulador de alvo](comprendre/murs.md).

## Uma documentação com estados explícitos

O guia descreve o protocolo tal como está codificado e identifica a **implantação Ethereum em serviço**. Na V2, Momentum e a Forge estão abertos desde 23 de setembro de 2026, e o Vault desde 26 de setembro de 2026. As próximas etapas estão no [roadmap](roadmap.md).

Para verificar uma versão, comece pelo [estado das versões](securite/etat.md), depois pelas [permissões](securite/permissions.md) e pelos [limites](securite/risques.md). Relatórios antigos de testes não certificam a nova versão.
