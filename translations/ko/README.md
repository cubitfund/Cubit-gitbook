---
description: "CUBIT 한국어 가이드: 세금, 유동성 밴드, 매도로 조성하는 매수벽, V2 모듈과 각 부분의 실제 상태."
section: "환영합니다 / CUBIT"
reading: "프로토콜 알아보기"
home: true
search:
  keywords: [홈, 문서, 가이드, CUBIT, 시작]
---

<div class="home-hero">
  <p class="eyebrow">UNISWAP V4 · 프로토콜 유동성</p>
  <h1>매수벽을<span class="line-break"></span>지탱하는<span class="line-break"></span><span class="highlight">원리 알아보기.</span></h1>
  <span class="hero-spark" aria-hidden="true"></span>
  <p class="lead">출시 때 배치하는 유동성 밴드. 매도로 조성하는 ETH 매수벽. 이 가이드는 CUBIT의 규칙, 사용법, 한계를 설명합니다.</p>
  <div class="hero-actions">
    <a href="comprendre/essentiel.md" class="primary-button">여기서 시작 →</a>
    <a href="securite/etat.md" class="secondary-button">버전 상태 보기 ↗</a>
  </div>
</div>

<div class="edition-alert">
  <span class="alert-icon" aria-hidden="true">!</span>
  <p><strong>이 가이드는 CUBIT의 새 버전을 설명합니다.</strong><span class="line-break"></span>CUBIT은 Ethereum에 배포되어 있고 앱은 그 배포를 읽습니다. LP 수수료는 0.01 %입니다. 시장은 2026년 9월 22일에 열렸습니다. 매수와 매도는 앱에서 이루어집니다.</p>
</div>

<dl class="metric-strip">
  <div><dt>총공급량</dt><dd>2,100만</dd><small>CUBIT · 이후 추가 발행 없음</small></div>
  <div><dt>매수세</dt><dd>3 %</dd><small>팀 몫</small></div>
  <div><dt>매도세</dt><dd>15 %</dd><small>12 % 매수벽 / 3 % 팀</small></div>
  <div><dt>목표 LP 수수료</dt><dd>0.01 %</dd><small>새 버전 · fee 100</small></div>
</dl>

<div class="home-heading"><h2>시작할 곳을 선택하세요.</h2><span>01 — 읽기 경로</span></div>

<div class="guide-cards">
  <a href="comprendre/murs.md" class="guide-card"><span class="card-index">01 / 이해하기</span><strong>매수벽의<span class="line-break"></span>자금 조달 방식.</strong><p>목표 가격, 매도마다 배분되는 12 %, tick에 고정된 매수벽.</p><span class="card-link">작동 원리 보기 →</span></a>
  <a href="utiliser/swaps.md" class="guide-card"><span class="card-index">02 / 사용하기</span><strong>서명 전에<span class="line-break"></span>확인하세요.</strong><p>순액 견적, 승인, 온체인 데이터.</p><span class="card-link">사용자 가이드 열기 →</span></a>
  <a href="developper/architecture.md" class="guide-card"><span class="card-index">03 / 개발하기</span><strong>컨트랙트에서<span class="line-break"></span>인터페이스까지.</strong><p>Hook, 밴드, V2 레지스트리, vault.</p><span class="card-link">코드베이스 살펴보기 →</span></a>
</div>

<div class="home-heading"><h2>하나의 시장, 두 개의 별도 장부.</h2><span>02 — 작동 방식</span></div>

<div class="mechanism-strip">
  <div><div class="number">01 — 매도</div><strong>매도마다 12 %로<span class="line-break"></span>매수벽을 조성합니다.</strong><p>매수벽은 매도 후에 계산한 목표에 배치됩니다. 출시 가격 이하에서는 현재 가격보다 1 % 낮은 곳에 배치됩니다.</p></div>
  <div><div class="number">02 — 매수벽</div><strong>고정된 가격대.<span class="line-break"></span>한정된 ETH.</strong><p>매수벽 가격과 매도 흡수 능력은 서로 다른 정보입니다.</p></div>
  <div><div class="number">03 — 밴드</div><strong>한 번 배치하는<span class="line-break"></span>유동성.</strong><p>공급량의 80 %를 출시 가격부터 곡선 꼭대기까지 배치하며 회수하지 않습니다.</p></div>
</div>

## 핵심 사항

매도마다 **총 ETH의 12 %**를 매수벽에 배분합니다. hook은 먼저 가격이 완전히 통과한 매수벽을 비운 다음, 대기 중인 ETH를 매도 후 가격으로 계산한 `cible = 0.4 × prix courant + 0.6 × prix de lancement` 위치의 매수벽에 배치합니다. 이 목표가 시장보다 위에 놓이는 출시 가격 이하에서는 매수벽을 현재 가격보다 1 % 낮은 곳에 배치합니다. 예시 기준값이 7 000 단위이면 목표는 **시장 30k에서 16.2k**, **100k에서 44.2k**, **60k로 돌아오면 28.2k**입니다. 사상 최고가에 의존하지 않습니다.

매수벽은 자기 tick에 머뭅니다. 완전히 통과되면 비워지고 그 CUBIT은 vault 보상 준비금으로 들어가며 더 이상 소각되지 않습니다. 이 규칙이 추가 자금이나 무제한 매입 능력을 만들지는 않습니다. [예시와 목표 시뮬레이터 보기](comprendre/murs.md).

## 상태를 명확히 구분하는 문서

가이드는 코드로 구현된 그대로의 프로토콜을 설명하고 **운영 중인 Ethereum 배포**를 명시합니다. V2에서는 Momentum과 Forge가 2026년 9월 23일부터, Vault가 2026년 9월 26일부터 열려 있습니다. 다음 단계는 [로드맵](roadmap.md)에 정리했습니다.

버전을 확인하려면 [버전 상태](securite/etat.md), [권한](securite/permissions.md), [한계](securite/risques.md)를 차례로 보세요. 과거 테스트 보고서는 새 버전을 인증하지 않습니다.
