---
description: "공식은 매수벽 위치를, 매도는 크기를 결정합니다. 매도마다 계산하는 목표, 예시, tick에 고정된 매수벽."
section: "01 / 이해하기"
reading: "7분 + 대화형 예시"
search:
  keywords: [매수벽, 벽, 목표, 가격, 깊이, 용량, capacity, 되돌림, 공식, 매도, 16200, 44200, 28200]
---

# 목표와 고정 매수벽

**공식은 매수벽 위치를, 매도는 크기를 결정합니다.** 매수벽은 현재 가격 아래의 정해진 tick에 ETH로 자금을 조달한 LP 포지션입니다.

## 매도마다 적용하는 공식

`M`을 매도 후 시장 시가총액, `B`를 출시 기준값으로 두고 둘 다 같은 단위로 표시합니다:

<div class="formula">목표 = M − (M − B) × 0.6<span class="line-break"></span>= 0.4 × M + 0.6 × B</div>

계수는 **시장과 기준값 차이의 60 %**를 되돌립니다. 따라서 기준값 위에 그 차이의 40 %를 남깁니다. 예시 기준값 `B = 7 000`이면:

| 매도 후 시장 | 계산 | 매수벽 목표 |
| --- | --- | --- |
| 30 000 | 30 000 − 23 000 × 0.6 | **16 200** |
| 100 000 | 100 000 − 93 000 × 0.6 | **44 200** |
| 60 000으로 복귀 | 60 000 − 53 000 × 0.6 | **28 200** |

시장이 이전에 100 000에 도달했어도 세 번째 계산은 **60 000**에서 시작합니다. 사상 최고가에 따른 상승 고정 장치는 없습니다. 목표는 **매도마다** 그 매도가 남긴 가격으로 다시 계산합니다. 준비금을 쌓아 두었다가 유지보수 호출로 배치하는 방식은 더 이상 없습니다.

## 시장값 바꿔 보기

아래 예시는 16.2k와 44.2k에 있는 기존 매수벽 두 개를 유지하고 다음 매수벽의 목표를 계산합니다. 값은 같은 시가총액 단위이며 예시 기준값은 7 000입니다. 이 그림은 흡수, 잔액, 거래를 시뮬레이션하지 않습니다.

<section class="wall-lab" aria-label="학습용 목표 계산기">
  <header><span>매도 후 목표</span><span>고정 기준: 7 000</span></header>
  <div class="wall-controls">
    <label for="market-cap">매도 후 시장 <output id="market-value" for="market-cap">60 000 단위</output></label>
    <input id="market-cap" type="range" min="7000" max="120000" step="1000" value="60000">
    <div class="wall-presets"><button type="button" data-market-preset="30000">30k</button><button type="button" data-market-preset="100000">100k</button><button type="button" data-market-preset="60000">60k로 복귀</button></div>
  </div>
  <div class="wall-levels" aria-label="시가총액 수준 비교">
    <div class="level-row"><span>기존 매수벽 A</span><div class="level-track"><i style="width:13.5%"></i></div><b>16.2k</b></div>
    <div class="level-row"><span>기존 매수벽 B</span><div class="level-track"><i style="width:36.833%"></i></div><b>44.2k</b></div>
    <div class="level-row new-target"><span>새 목표</span><div class="level-track"><i id="lab-target-bar" style="width:23.5%"></i></div><b id="lab-target-label">28.2k</b></div>
    <div class="level-row market"><span>현재 시장</span><div class="level-track"><i id="lab-market-bar" style="width:50%"></i></div><b id="lab-market-label">60k</b></div>
  </div>
  <div class="wall-result" aria-live="polite"><span>다음 매수벽의 목표</span><strong id="target-value">28 200 단위</strong></div>
  <p class="lab-explanation">새 자금만 현재 목표를 따릅니다. 기존 매수벽은 자기 tick에 머물며, 각 가격대에 아직 남은 ETH 양은 별도로 확인해야 합니다.</p>
</section>

## tick마다 하나, 이동하지 않는 매수벽

한번 배치된 매수벽의 ETH는 그 tick에 계속 귀속됩니다. 시장이 오르거나 내려도 기존 매수벽이 새 목표로 이동하지 않습니다.

- 목표가 기존 매수벽의 tick에 떨어진 자금은 두 번째 매수벽을 만드는 대신 **그 매수벽을 두껍게 합니다**.
- 매도는 매수벽을 일부 소모할 수 있습니다. 이때 매수벽 ETH 일부로 CUBIT을 매입합니다.
- 일부만 소모된 매수벽은 **그 자리에 남습니다**. 가격이 다시 오르면 CUBIT을 되팔고 ETH로 다시 채워집니다.
- **완전히 통과된** 매수벽은 그 매수벽을 통과한 매도가 비웁니다. 그 CUBIT은 소각되지 않고 vault 보상 준비금으로 가며, 남은 ETH는 대기 자금으로 돌아갑니다.

매수벽 식별자는 영구적입니다. tick 색인으로 매도가 닿은 매수벽을 찾을 수 있습니다. [통과된 매수벽과 vault 준비금](burn.md).

## 목표에 배치할 수 없을 때

매수벽은 100 % ETH 포지션이므로 현재 가격 아래에 있어야 합니다. 가격이 출시 가격 이하이면 공식은 시장과 같거나 더 높은 목표를 내놓으며, 이런 목표에는 순수 ETH로 자금을 조달할 수 없습니다.

이 경우 hook은 자금을 대기시키지 않고 매수벽을 **현재 가격보다 1 % 낮은 곳**에 tick 단위로 반올림해 배치합니다. 그렇지 않으면 쌓인 자금이, 직전에 매수해 가격을 끌어올린 거래에 의해 부풀려진 가격에 한꺼번에 배치되고, 그 거래가 자기 CUBIT을 이 매수벽에 매도할 수 있습니다. hook은 정확한 목표가 아니라 반올림된 tick으로 판단합니다. 출시 가격 근처에서는 반올림된 40/60 목표가 시장 바로 아래에 남아 그대로 쓰일 수 있고, 그러면 1 %보다 가깝습니다.

`pendingFloorEth`에서 대기하는 것은 포지션을 만들기에 너무 작은 금액, 즉 미세 잔량과, 목표 매수벽이 tick의 유동성 상한(Uniswap v4의 제한)에 도달했을 때 생길 수 있는 잉여, 그리고 가격이 tick 범위의 맨 위에 있어 가격 아래에 매수벽을 둘 자리가 없는 극단적인 경우뿐입니다. 이후 매도가 이를 배치합니다. 이 이유로 매도 자체가 거절되는 일은 없습니다.

## 실제 배치된 ETH

hook은 매도마다 받는 12 %를 포함한 대기 중인 ETH 전부를 목표에 해당하는 포지션에 배치합니다. 이후 매도가 이 ETH를 소모할 수 있으므로 각 매수벽의 준비금은 유한합니다. 전체 공급량을 충당할 때까지 기다리지 않고 매수벽에 자금을 조달할 수 있습니다.

## 출시 가격에서 tick으로

컨트랙트는 CUBIT당 ETH 가격으로 `cible = 0.4 × prix courant + 0.6 × prix de lancement`를 계산합니다. 출시 가격은 **배포 때 고정한 출시 FDV**를 2,100만 CUBIT으로 나눈 값입니다. 새 버전은 FDV **3.75 ETH**를 채택했으며, 이 가격은 이후 고정되어 달러를 따르지 않습니다.

이 페이지의 단위 예시는 같은 공식을 시가총액에 적용합니다. 7 000이라는 기준값은 예시일 뿐이며, 채택된 3.75 ETH를 환산한 값이 아닙니다.

이어서 tick이 실행 가능한 가격대를 반올림합니다. ETH가 `currency0`이므로 **CUBIT 가격이 높을수록 풀 tick은 낮습니다.** 수학적 목표, 실제 배치 tick, 매도 순가격은 다를 수 있습니다.

## 인터페이스가 보여야 할 정보

인터페이스는 현재 시장, 밴드, 다음 목표, 각 유효 매수벽과 그 깊이, 대기 ETH와 대기 CUBIT을 구분해야 합니다. “floor” 한 줄로 전체 장부를 표현할 수 없습니다.

과거 참조값 `floorPrice`는 **가장 최근에 자금을 조달한 매수벽**을 나타내며 이전 매수벽보다 낮을 수 있습니다. 전역 보장 최저가로 해석하면 안 됩니다. [dapp 데이터 읽기](../utiliser/preuves.md).

<p class="source-note">출처: 2026년 9월 14일 설계 결정, <code>BandLib.retracementWallTarget</code>, <code>underMarketWallTarget</code>, <code>WALL_RETRACEMENT_BPS</code>, <code>WallLib.fund</code> 및 <code>CubitHook._placeWall</code>.</p>
