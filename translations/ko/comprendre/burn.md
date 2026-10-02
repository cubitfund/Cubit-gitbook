---
description: "매도가 닿은 매수벽의 변화: 일부 소모되면 그대로 남고, 완전히 통과되면 비워지며 그 CUBIT이 소각 없이 vault 보상 준비금으로 들어갑니다."
section: "01 / 이해하기"
reading: "읽는 시간 4분"
search:
  keywords: [흡수, 통과, 완전 통과, 일부 소모, 준비금, vault, 보상, burn, 소각, 파기, 거버넌스, deliverAbsorbed]
---

# 통과된 매수벽과 vault 준비금

매도가 매수벽에 닿으면 그 매수벽의 ETH로 CUBIT을 매입합니다. 새 버전에서는 이 CUBIT을 **더 이상 소각하지 않습니다**. 완전히 통과된 매수벽의 CUBIT은 **vault 보상 준비금**으로 들어갑니다.

## 일부 소모 또는 완전 통과

| 매수벽 상태 | 일어나는 일 |
| --- | --- |
| 닿지 않음 | 매수벽은 자기 tick에서 ETH만 보유 |
| 일부 소모 | ETH 일부로 CUBIT을 매입함. 매수벽은 그대로 남음 |
| 일부 소모 후 가격 반등 | 매수벽이 CUBIT을 되팔고 ETH로 다시 채워짐 |
| 완전히 통과됨 | 매수벽에는 CUBIT만 남음. 통과한 매도가 매수벽을 비우며, 그 CUBIT은 전송을 기다리고 남은 ETH는 `pendingFloorEth`로 돌아감 |

매수벽은 **완전히 통과된** 뒤에만 비워집니다. 일부만 소모된 동안에는 hook이 건드리지 않으며, 매수벽은 자기 tick에서 일반 LP 포지션처럼 계속 작동합니다. 한 번의 매도는 자신이 완전히 통과한 매수벽을 가장 가까운 것부터 가장 먼 것까지 모두 비웁니다.

## CUBIT의 경로

```text
매도가 매수벽을 완전히 통과
    → 그 매도가 매수벽을 비움
    → 그 CUBIT은 pendingAbsorbedTokens에서 대기
    → deliverAbsorbed()가 vault 보상 준비금으로 전송
```

CUBIT 라우터는 매도가 끝날 때마다 같은 트랜잭션에서 `deliverAbsorbed()`를 호출합니다. 이 전송이 실패해도 매도는 막히지 않으며, CUBIT은 hook 안에 격리되어 남습니다. 다른 라우터를 거친 매도 뒤나 전송이 실패한 뒤에는 어떤 계정이든 `deliverAbsorbed()`를 호출할 수 있으며, 수신자도 금액도 선택할 수 없습니다. 이후 준비금이 vault 예치자에게 일일 보상을 지급합니다. [mCUBIT Vault](../v2/vault.md).

## 공급량은 더 이상 줄지 않습니다

공급량은 추가 발행 없이 **2,100만 CUBIT**으로 고정됩니다. 매수벽의 CUBIT을 더 이상 파기하지 않으므로 흡수가 거듭되어도 공급량은 줄지 않으며, CUBIT은 더 이상 디플레이션형으로 소개되지 않습니다. 출시 때에는 초기 예치에서 생긴 무시할 만한 반올림 잔량만 소각됩니다.

준비금에서 보상으로 지급된 CUBIT은 일반 토큰입니다. 받은 사람은 보유하거나 예치하거나 매도할 수 있습니다.

## Forge 자식 시장

Forge로 만든 자식 시장에서는 비워진 매수벽의 토큰이 스테이킹 vault로 가지 않습니다. `deliverAbsorbed()`는 이 토큰을 **런치패드 거버넌스 vault**로 보내며, 이 vault의 주소는 자식 토큰을 배포한 Forge에 고정되어 있습니다. 각 예치분은 자기 수령 시점부터 30일간 잠기며, 이 vault의 배포자만 청구할 수 있습니다. [Momentum과 Forge](../v2/momentum-forge.md).

## 흡수가 보장하지 않는 것

매도를 흡수한 매수벽은 ETH를 씁니다. 일부 소모된 매수벽은 가격이 그 위로 다시 올라야만 ETH로 다시 채워지고, 비워진 매수벽은 새 자금이 그 tick에 떨어져야만 깊이를 되찾습니다.

이전 strict-burn 방식의 증거는 이 새 경로를 검증하지 않습니다. 새 경로는 2026년 9월 22일부터 Ethereum에서 가동 중입니다. [알려진 한계 보기](../securite/risques.md).

## 이동 확인

흡수를 추적하려면 hook 이벤트를 대조하세요. 비워진 매수벽마다 `WallAbsorbed(id, cubit, ethRemaining)`, 대기로 넘어간 총량에는 `TokensAbsorbed(amount, pendingAbsorbedTokens)`, 전송 때에는 `AbsorbedDelivered(sink, amount)`가 발생합니다. 수신 측에서는 vault가 `RewardReserveFunded`를 발생시키고, Forge 자식 시장의 경우 거버넌스 vault가 `Deposited`를 발생시킵니다.

<p class="source-note">출처: 2026년 9월 14일 설계 결정, <code>CubitHook._collectCrossedWalls</code>, <code>deliverAbsorbed</code>, <code>absorbedTokenSink</code>, <code>WallLib.collectCrossed</code>, <code>CubitRouter._finishSwap</code>, <code>CubitVault.fundRewardReserve</code> 및 <code>periphery/CubitGovernanceVault.sol</code>.</p>
