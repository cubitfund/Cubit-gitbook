---
description: "양도 불가 CUBIT 예치, 24시간 잠금, 준비금에서만 지급하며 하루치로 상한을 둔 하루 3 %의 CUBIT 보상."
section: "03 / V2 모듈"
reading: "읽는 시간 5분"
search:
  keywords: [vault, 스테이킹, stake, 잠금, lock, 인출, 보상, 준비금, claim, 청구, mCUBIT]
---

# mCUBIT Vault

Vault는 CUBIT을 **양도 불가** 포지션에 예치하고 **CUBIT으로** 보상을 받게 합니다. 이 모델은 CUBIT을 발행하지 않으며 매수벽 자금에 대한 어떤 권리도 주지 않습니다.

mCUBIT은 이 예치 경험의 이름입니다. 코드는 자유롭게 양도할 수 있는 ERC-20 증표 토큰을 만들지 않습니다.

> **2026년 9월 26일부터 Ethereum에서 열려 있습니다.**

## 보상의 출처

보상은 **Vault 보상 준비금에서만** 지급하며 예치 원금에서는 절대 지급하지 않습니다. 이 준비금의 자금원:

- 출시 때 넣는 **공급량의 20 %**, 즉 420만 CUBIT
- 매도 후 `deliverAbsorbed()`가 보내는 **완전히 통과된 매수벽의 CUBIT**
- 모든 자발적 추가분: 어떤 계정이든 `fundRewardReserve(amount)`로 준비금에 CUBIT을 더할 수 있음

준비금은 유한하며 비면 보상이 멈춥니다. **보상은 CUBIT으로만 지급되며** `claimCubit()`로 청구하고, 어떤 수익도 보장하지 않습니다.

## 보상률과 상한

보상은 **하루 예치액의 3 %**이며 마지막 청구 이후 경과 시간에 비례해 계산합니다.

청구 가능 금액은 **하루치로 상한**이 있습니다. 24시간 동안 청구하지 않으면 더 늘어나지 않습니다. 보상을 모두 받으려면 매일 청구해야 하며, **청구하지 않은 초과분은 소멸합니다**.

| 마지막 청구 이후 경과 시간 | 1 000 CUBIT 예치 시 청구 가능 금액 |
| --- | --- |
| 12시간 | 15 CUBIT |
| 24시간 | 30 CUBIT |
| 48시간 | 30 CUBIT: 둘째 날분은 소멸 |

이 금액은 준비금이 충분하다고 가정합니다. 준비금이 지급할 금액보다 적으면 준비금 잔액만 지급합니다.

## CUBIT 예치

1. 제공된 Vault 주소와 프로토콜 연결을 확인합니다.
2. 선택 금액의 Vault 전송을 승인합니다.
3. `stake(amount)`를 호출하고 확인을 기다립니다.
4. 예치 컨트랙트의 `balanceOf(account)`, `unlockAt(account)`, `pendingCubit(account)`를 읽습니다.

**추가 예치마다 해당 지갑의 해당 Vault 전체 포지션에 24시간 잠금이 다시 시작됩니다.** 추가 예치는 그때까지 쌓인 보상도 지급하고 하루 계산 기간을 다시 시작합니다.

예치한 CUBIT도 기존 토큰입니다. 예치는 소각도 공급량 감소도 아닙니다.

## 청구와 인출

`claimCubit()`은 쌓인 보상을 지급하고 하루 계산 기간을 다시 시작합니다. 인출 잠금은 이 청구를 막지 않습니다.

체인 timestamp가 `unlockAt`에 도달하면 `withdraw(amount)`로 예치한 CUBIT을 돌려받습니다. 일부 인출도 가능하며, 인출 시 쌓인 보상을 먼저 지급합니다.

누구도 이 출금을 중단시킬 수 없습니다. 다만 포지션을 보유한 컨트랙트의 규칙과 정상 동작에 따릅니다.

## Vault가 교체될 때

팀은 Vault를 언제든 지체 없이 교체할 수 있습니다. 교체는 새 예치에 제공하는 컨트랙트와, 이후 전송되는 흡수 CUBIT을 받는 컨트랙트에 관한 것입니다. **이미 기록된 예치 CUBIT, 보상 준비금, 잠금 해제 날짜는 이전 Vault에 남습니다.** 교체가 사용자 자금을 옮기지는 않습니다.

레지스트리는 역대 Vault 목록을 보존합니다. 잔액 조회·청구·인출 전에 선택한 주소를 확인하세요. 이전 Vault 승인은 새 Vault에 적용되지 않습니다.

레지스트리는 새 Vault가 같은 hook과 같은 토큰에 연결되어 있고 stake가 없을 것을 요구합니다. 교체는 Vault를 비활성화하므로, 새 컨트랙트는 다시 활성화된 뒤에만 예치를 받습니다.

## 모듈의 한계

보상은 준비금 잔액에 달려 있습니다. 하루 3 %의 보상률은 준비금을 고갈시킬 수 있으며, 그러면 지급이 멈춥니다. 교체 검사는 선언된 주소의 호환성을 확인할 뿐 교체 코드 전체의 안전성을 증명하지 않습니다. 준비금 회계, 하루치 상한, 매수벽 CUBIT의 유입, 이전 Vault 출금은 릴리스마다 검증해야 합니다.

<p class="source-note">출처: <code>periphery/CubitVault.sol</code> (<code>pendingCubit</code>, <code>claimCubit</code>, <code>fundRewardReserve</code>, <code>DAILY_REWARD_BPS</code>, <code>REWARD_PERIOD</code>, <code>LOCK_DURATION</code>), <code>CubitHook.deliverAbsorbed</code>, <code>CubitV2.setVault</code> 및 2026년 9월 14일 설계 결정.</p>
