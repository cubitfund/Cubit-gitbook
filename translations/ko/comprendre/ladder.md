---
description: "출시 때 공급량의 80 %로 배치하고 회수하지 않는 넓은 단일 밴드: CUBIT의 거래 유동성."
section: "01 / 이해하기"
reading: "읽는 시간 4분"
search:
  keywords: [밴드, band, 유동성, TIDE, 곡선, x·y=k, 출시, FDV, ladder, 래더]
---

# 유동성 밴드

CUBIT의 거래 유동성은 TIDE 모델을 따른 **넓은 단일 밴드**에 담깁니다. hook은 출시 때 이 밴드를 배치하고 절대 회수하지 않습니다. 밴드는 기존 래더를 대체합니다.

## 밴드의 구성

| 매개변수 | 채택 값 |
| --- | --- |
| 예치 | 공급량의 80 %, 즉 1,680만 CUBIT |
| 출시 시 구성 | 100 % CUBIT, ETH 없음 |
| 가격 범위 | 출시 가격보다 높은 모든 가격 |
| 출시 FDV | 3.75 ETH, 즉 밴드 깊이 3 ETH |
| 회수 | 없음: 포지션은 회수되지 않음 |

밴드의 하단 경계는 tick 단위로 반올림한 출시 가격이므로 처음에는 포지션에 ETH가 없습니다. 그 위로는 풀의 가격 곡선 전체를 포괄합니다.

## x·y=k 곡선

매수와 매도는 밴드의 상수곱 곡선을 따릅니다. 매수는 밴드에 ETH를 넣고 CUBIT을 꺼내므로 가격이 오릅니다. 매도는 그 반대여서 가격이 내립니다.

출시 FDV가 3.75 ETH이면 1,680만 CUBIT의 가치는 **출시 가격 기준 3 ETH**입니다. 처음에 밴드는 1,680만 CUBIT과 3 ETH로 이루어진 x·y=k 풀처럼 동작합니다. 이 3 ETH는 **가상**입니다. 곡선의 기울기를 정할 뿐이며, 밴드가 실제로 보유하는 ETH는 매수자가 넣은 ETH뿐입니다.

## 밴드가 보장하지 않는 것

매도자가 밴드에서 꺼낼 수 있는 ETH는 매수자가 넣은 ETH입니다. 가격이 출시 가격으로 돌아오면 밴드에는 CUBIT만 남으므로 그 가격 아래에서는 더 이상 CUBIT을 사들일 수 없습니다.

따라서 출시 가격 아래에서는 매수벽에 아직 남아 있는 ETH로만 매도를 체결할 수 있습니다. 3 ETH 깊이는 프로토콜이 예치한 ETH 준비금도, 최저 가격도 아닙니다.

## 래더와 함께 사라진 것

밴드는 기존 이동식 장부를 대체합니다. 삭제된 항목:

- 래더, 그 연속 밴드와 토큰 준비금
- ETH 쿠션(cushion)
- `rebalance`, `raiseFloor`, 매수벽으로 향하던 sweep, keeper 보상금

시장 운영에 유지보수 호출은 필요 없습니다. keeper는 더 이상 없습니다.

## Forge 자식 시장의 밴드

Forge로 만든 자식 시장도 같은 모델을 따르지만 한 가지가 다릅니다. **공급량의 100 %를 자기 밴드에 예치합니다.** vault 준비금도 팀 할당도 없습니다. hook은 공급량의 80 % 이상을 예치하도록 요구하고 예치 전액을 밴드에 배치합니다. [Momentum과 Forge](../v2/momentum-forge.md).

## 밴드 확인

hook의 `band()` 뷰는 포지션의 tick과 유동성을 반환하며, 출시 때 `BandBootstrapped` 이벤트가 발생합니다. Lens는 현재 가격에서 밴드가 보유한 ETH와 CUBIT인 `bandEth`와 `bandTokens`를 LP 수수료를 제외하고 제공합니다. [컨트랙트와 통합](../developper/integration.md).

<p class="source-note">출처: <code>CubitHook._bootstrap</code>, <code>afterInitialize</code>, <code>band()</code>, <code>MIN_POOL_SUPPLY</code>, <code>CubitLens.bandEth</code> / <code>bandTokens</code> 및 <code>periphery/CubitForge.sol</code>. 2026년 9월 14일 설계 결정.</p>
