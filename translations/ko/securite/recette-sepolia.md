---
description: "새 버전을 위한 Sepolia 수동 테스트 계획: 밴드, 스왑, 세금, 매수벽, vault, 교체, 예상 거절, 번호가 매겨진 기록표."
section: "05 / 검증하기"
reading: "번호가 매겨진 테스트 계획"
search:
  keywords: [인수 검증, 테스트, 테스트넷, Sepolia, 수동, 체크리스트, 계획, 심각도, 기록, 거절]
---

# Sepolia 수동 테스트 계획

이 페이지는 지갑을 갖춘 사람이 Sepolia 테스트 네트워크에서 **직접 손으로 수행하는 체크리스트**입니다. 각 사례에는 보고서에서 인용할 수 있는 `T-01` 형식의 고정 번호가 붙습니다.

> **시작하기 전에.** 이 계획은 새 버전을 대상으로 합니다. 저장소의 공개 manifest는 LP 수수료 `100`인 **운영 중인** Sepolia 배포를 설명하며, 이 계획은 그 배포에 적용됩니다. 테스트하는 버전에 해당하지 않는 사례는 “실패”가 아니라 “버전 범위 외”로 기록합니다.

인용한 값은 `contracts/src/` 아래의 새 버전 코드와 2026년 9월 14일 설계 결정에서 가져왔습니다. 확인하지 못한 동작에는 **“테스트 중 확인 필요”** 표시가 붙습니다.

## 이 계획 사용법

각 섹션은 사례를 6열 표로 제시합니다. 마지막 두 열은 인수 검증 중에 채웁니다.

| 열 | 기록할 내용 |
| --- | --- |
| 사례 | 고정 식별자, `T-01`부터 `T-110`까지 |
| 사전 조건 | 시작 전에 충족되어야 하는 조건 |
| 단계 | 순서대로 수행할 동작 |
| 예상 결과 | 코드와 결정이 예정하는 결과 |
| 관찰 결과 | 실제로 일어난 일, 트랜잭션 hash 또는 읽기 블록 포함 |
| 심각도 | 부합하면 비움, 아니면 차단, 중대, 경미, 외관 중 하나 |

| 심각도 | 기준 |
| --- | --- |
| 차단 | 자금 손실 또는 동결, 세금 미징수, 매수벽 손실, 원금에서 보상 지급 |
| 중대 | 소스와 반대되는 동작, 누락된 거절, 잘못 표시된 수치 |
| 경미 | 체인에 영향이 없는 표시 차이, 부정확한 메시지 |
| 외관 | 타이포그래피, 레이아웃, 문구 |

**거절 사례에 따라 거절된 트랜잭션은 성공**입니다. hash는 트랜잭션이 제출되었다는 뜻일 뿐이며 성공 여부는 영수증만 알려 줍니다.

**일부 사례는 인터페이스를 거치지 않습니다.** 현재 소스에서 dapp은 운영 중인 버전의 ABI를 읽으며, exact-output 주문도, `claimTeam()`도, 매수벽 상세 읽기도 제공하지 않습니다. 이런 사례에는 “직접 호출” 표시가 붙으며, 테스트하는 배포의 manifest 주소를 대상으로 컨트랙트 호출 도구로 실행합니다.

## 1. 준비

첫 스왑 **전에** 다음 항목을 기록하세요. 이후 모든 비교의 기준이 됩니다.

- 네트워크: Sepolia, 체인 ID `11155111`.
- 테스트하는 배포의 manifest에서 읽은 주소: 토큰, hook, PoolManager, `poolId`, 라우터, Lens, V2 레지스트리, Vault, 런처, 그리고 런치패드 추가 후에는 거버넌스 vault와 Forge. **메모에 개인 키를 절대 옮겨 적지 마세요.**
- 고정 매개변수: `fee`, `tickSpacing`, `LAUNCH_ETH`, `MIN_POOL_SUPPLY`, `launchTimestamp`, `moduleRevision`.
- 초기 상태: Lens의 `snapshot()`, hook의 `band()`, 토큰의 `totalSupply()`와 `totalBurned()`, `pendingFloorEth`, `pendingAbsorbedTokens`, `wallCount()`, `activeWallCount()`, `teamAccrued`, `teamPaidCumulative`, Vault의 `rewardReserve()`, 그리고 읽기 **블록 번호**.

교환 금액 **외에도** 테스트 ETH를 준비하세요. 모든 트랜잭션이 gas를 내며, 여러 사례에서 거절되는 트랜잭션이 필요한데 이것도 gas를 소모합니다.

| 사례 | 사전 조건 | 단계 | 예상 결과 | 관찰 결과 | 심각도 |
| --- | --- | --- | --- | --- | --- |
| T-01 | 지갑 설치됨 | Sepolia 선택, 테스트 버전에 연결된 dapp 열기 | 네트워크가 인식됨, 다른 체인에서 서명하라는 요청 없음 |  |  |
| T-02 | 새 계정 | Sepolia faucet으로 테스트 ETH 충전 | 새로고침 후 지갑과 dapp에 잔액 표시 |  |  |
| T-03 | manifest를 옆에 둠 | 표시된 각 주소를 manifest의 주소와 비교 | 식별자 동일, `poolId`, `fee`, `tickSpacing` 일치 |  |  |
| T-04 | 아직 스왑 없음 | `snapshot()`을 읽고 블록 기록 | 기준값 기록, 블록 식별 |  |  |
| T-05 | 직접 호출 | hook의 `poolKey()` 읽기 | `currency0`은 영 주소, `fee = 100`, `tickSpacing = 10`, `hooks`는 hook 주소 |  |  |
| T-06 | V2 레지스트리 읽기 가능 | `moduleRevision()`과 모듈 주소 읽기 | 개정 기록, 인수 검증 도중 변경되면 서명마다 다시 확인 필요 |  |  |

## 2. 출시와 밴드

풀 초기화 때 hook은 **예치 전액**을 `BAND_SALT`로 식별되는 단일 포지션 `[minUsableTick, tickUpper]`에 배치합니다. `tickUpper`는 개시 tick을 간격 단위로 내림한 값이므로 포지션에는 CUBIT만 들어 있습니다. hook은 `MIN_POOL_SUPPLY`, 즉 공급량의 80 %보다 적은 예치를 거절하고 반올림 잔량을 소각합니다.

전체 출시는 같은 트랜잭션에서 공급량의 20 %를 Vault 준비금에 넣고 0.1 ETH 매수도 실행합니다.

| 사례 | 사전 조건 | 단계 | 예상 결과 | 관찰 결과 | 심각도 |
| --- | --- | --- | --- | --- | --- |
| T-07 | 출시 완료, 직접 호출 | `band()` 읽기 | `lower = −887 270`, `upper`는 개시 tick을 10의 배수로 내림한 값으로 FDV 3.75 ETH에서 `155 390`, 유동성은 0이 아님 |  |  |
| T-08 | 출시 트랜잭션 확인됨 | 그 이벤트 읽기 | `BandBootstrapped(lower, upper, liquidity, tokens)`가 `band()` 값과 함께 한 번 발생, `tokens`는 예치액에서 반올림 잔량을 뺀 값 |  |  |
| T-09 | 첫 매수 없는 출시 | 스왑 전에 `snapshot()`에서 `bandEth`와 `bandTokens` 읽기 | `bandEth = 0`, `bandTokens`는 반올림 오차 범위에서 예치액과 같음 |  |  |
| T-10 | 출시 완료, 직접 호출 | `token.balanceOf(hook)` 읽기 | 제3자의 직접 전송이 없으면 0: 초기화 후 hook은 토큰 그대로의 CUBIT을 보유하지 않음 |  |  |
| T-11 | 직접 호출 | 풀에 유동성 추가 시도 | `ExternalLiquidityForbidden`으로 거절: hook이 유일한 유동성 공급자 |  |  |
| T-12 | 리허설 배포 | `MIN_POOL_SUPPLY`보다 적은 예치로 풀 초기화 | `SupplyNotDeposited`로 거절, 밴드 배치 없음 |  |  |
| T-13 | 전체 출시 | 출시 트랜잭션 후 Vault의 `rewardReserve()` 읽기 | 준비금은 공급량의 20 %, 즉 420만 CUBIT, 팀 할당도 에어드롭도 없음 |  |  |
| T-14 | 전체 출시 | 출시 트랜잭션에서 배포자 매수 읽기 | 0.1 ETH 매수, 팀 몫 3 %가 담긴 `BuyTaxed`, 받은 CUBIT은 자유롭게 전송 가능 |  |  |
| T-15 | 매수 확인됨, 직접 호출 | 밴드의 가상 준비금으로 예상 출력 재계산 | 3 % 세금과 LP 수수료 적용 후 x·y=k 곡선과 일치하는 출력, 처음에는 1,680만 CUBIT 대 가상 3 ETH — 테스트 중 확인 필요 |  |  |
| T-16 | 매수 후 매수한 CUBIT 재매도 | 매수 전, 두 거래 사이, 매도 후에 `bandEth` 읽기 | `bandEth`는 매수 때 늘었다가 시작값 쪽으로 돌아옴, 매수로 실제 들어온 ETH를 넘지 않음 |  |  |

## 3. 매수와 매도 절차

라우터는 `swapExactIn(key, zeroForOne, amountIn, amountOutMin, recipient, deadline)`과 `swapExactOut(key, zeroForOne, amountOut, amountInMax, recipient, deadline)`을 제공합니다. `zeroForOne = true`는 ETH로 CUBIT을 매수합니다.

**현재 dapp 소스에서 인터페이스는 exact-input만 사용합니다.** 사용자는 항상 지불할 금액을 입력하며 받을 수량은 읽기 전용 필드입니다. 따라서 exact-output 절차는 라우터를 직접 호출해 테스트해야 합니다.

매수는 `msg.value`로 네이티브 ETH를 보냅니다. 매도는 value 0을 보내며 라우터에 대한 CUBIT **ERC-20 승인(approval)**이 필요합니다. 인터페이스는 무제한이 아니라 **정확한 금액**만큼 승인을 요청하므로, 더 큰 매도에는 새 승인이 필요합니다.

라우터는 부분 체결을 거절합니다. 완전히 소모되지 않은 exact-input은 `IncompleteInput`을, 완전히 제공되지 않은 exact-output은 `InsufficientOutput`을 발생시킵니다. 세금은 요청 금액 기준으로 산정되므로 취소가 사용자를 보호합니다.

dapp 소스에서 읽은 인터페이스 설정이며 인수 검증 중에 확인해야 합니다. 슬리피지 허용치 **기본값 1.0 %**, 입력은 **소수점 둘째 자리**와 `0`부터 `99.99`까지의 범위로 제한, 최소 수령량은 정수로 계산해 **wei 단위로 올림**, 견적 **유효 시간 30초**, 온체인 기한 = 체인 timestamp **+ 120초 − 견적 경과 시간**.

| 사례 | 사전 조건 | 단계 | 예상 결과 | 관찰 결과 | 심각도 |
| --- | --- | --- | --- | --- | --- |
| T-17 | ETH 잔액 충분 | 소액 매수, 예: 0.001 ETH | 성공 영수증, CUBIT 입금, `BuyTaxed` 이벤트 발생 |  |  |
| T-18 | ETH 잔액 많음 | 큰 금액 매수 | 성공 영수증, 가격 영향은 세율이 아니라 견적에 나타남 |  |  |
| T-19 | CUBIT 보유 | 승인 후 매도 | 별도 트랜잭션 두 건, 순 ETH 수령, `SellTaxed` 발생 |  |  |
| T-20 | 이전 매도 확인됨 | 이전보다 **큰** 금액 매도 | 새 승인 요청: 이전 승인은 정확한 금액에 대한 것이었음 |  |  |
| T-21 | 스왑 화면 열림 | 제안된 허용치를 건드리지 않고 읽기 | 기본값 **1.0 %** |  |  |
| T-22 | 스왑 화면 열림 | `0.005`, `100`, 음수 값을 차례로 입력 | 0–99.99 범위와 소수점 둘째 자리에 관한 메시지와 함께 입력 거절 |  |  |
| T-23 | 최신 견적 | 허용치를 허용되는 최저값으로 설정하고 가격 변동을 기다린 뒤 서명 | `TooLittleReceived(received, minimum)`으로 거절, 토큰 손실 없음, 인터페이스가 보호 해제를 권하지 않음 |  |  |
| T-24 | 견적 표시됨 | 아무 동작 없이 30초 넘게 기다린 뒤 서명 시도 | 견적이 만료된 것으로 간주되어 서명 전에 다시 계산됨 |  |  |
| T-25 | 곧 만료될 견적 | 만료 직전에 서명하고 전달된 기한 읽기 | 기한은 120초 **빼기** 견적 경과 시간: 30초 지난 견적이면 약 90초 남음 |  |  |
| T-26 | 직접 호출 | 이미 지난 기한으로 `swapExactIn` 호출 | `Expired`로 거절, 자금 이동 없음 |  |  |
| T-27 | 직접 호출 | 넉넉한 입력 상한으로 매수용 `swapExactOut` 호출 | 정확한 수량 수령, 남은 ETH는 같은 트랜잭션에서 caller에게 환불 |  |  |
| T-28 | 직접 호출 | 필요 금액보다 1 wei 낮은 입력 상한으로 `swapExactOut` 호출 | `TooMuchRequested(required, maximum)`으로 거절 |  |  |
| T-29 | 밴드와 매수벽이 사들일 수 있는 양보다 많은 CUBIT 잔액, 예: 보상으로 받은 CUBIT | 라우터로 이 잔액을 exact-input 매도 | `IncompleteInput`으로 거절, 세금도 트랜잭션과 함께 취소 — 테스트 중 확인 필요 |  |  |
| T-30 | 직접 호출 | 장부가 제공할 수 있는 것보다 많은 ETH를 exact-output으로 요청 | `InsufficientOutput`으로 거절, 부분 정산 없음 |  |  |
| T-31 | 직접 호출 | 0 금액, 영 주소 수신자, 맞지 않는 `msg.value`, 다른 풀 key를 차례로 전송 | 각각 `InvalidAmount`, `ZeroRecipient`, `WrongValue`, `WrongPool`로 거절 |  |  |
| T-32 | 호환 타사 라우터 | 타사 경로로 매수 후 매도 | hook 세금 적용 |  |  |
| T-33 | 호출 컨트랙트 또는 트랜잭션 묶음 | **같은 트랜잭션**에서 매수 후 매도를 연속 실행 | 두 부분이 각각 과세됨 |  |  |

## 4. 세금과 회계

| 작업 | 기준 | 배분 |
| --- | --- | --- |
| 매수 | 총 ETH 부분의 3 % | 100 % 팀 몫, 매수벽 배분은 명시적으로 0 |
| 매도 | 총 ETH 출력의 15 % | 12 %는 매수벽, 3 %는 팀 |

exact-input에서 매수세는 제공한 금액에 **포함**되며 wei 단위로 올림합니다. exact-output에서는 풀 부분 위에 더해지므로 총액 대비 세금은 3 %로 유지됩니다.

exact-output 매도의 세금은 `ceil(sortie × 1500 / 8500)`입니다. 풀은 요청 출력에 세금을 **더한** 금액을 내놓습니다. exact-input 매도의 세금은 `ceil(brut × 15 %)`입니다. 배분에서 팀 몫은 내림하고 **wei 단위 잔여분은 모두 매수벽에 귀속됩니다**.

현재 dapp 소스에서 인터페이스는 스왑을 허용하기 전에 이 세율을 체인에서 읽도록 요구합니다. 확인되기 전까지 버튼은 대기 상태로 남습니다.

| 사례 | 사전 조건 | 단계 | 예상 결과 | 관찰 결과 | 심각도 |
| --- | --- | --- | --- | --- | --- |
| T-34 | 매수 확인됨 | `BuyTaxed(ethIn, toFloor, toTeam)` 읽기 | `toFloor`는 0, `toTeam`은 총입력의 3 %를 wei 단위로 올림한 값 |  |  |
| T-35 | 매수 확인됨 | 전후 `teamAccrued` 비교 | 증가분은 팀 몫과 같음 |  |  |
| T-36 | 매도 확인됨 | `SellTaxed(ethOut, toFloor, toTeam)` 읽기 | `toFloor + toTeam`은 총액의 15 %, `toTeam`은 총액의 3 %, 합계는 wei 단위까지 정확 |  |  |
| T-37 | `teamAccrued`가 0이 아님, 직접 호출 | 아무 계정에서 `claimTeam()` 호출 | 자금은 고정된 팀 주소로 전송, `TeamPaid(amount, cumulative)` 발생, `teamAccrued`는 0으로 초기화 |  |  |
| T-38 | `teamAccrued`가 0, 직접 호출 | `claimTeam()` 호출 | 호출은 오류로 되돌려지지 않고 아무것도 전송하지 않음 |  |  |
| T-39 | 같은 금액의 매수 후 매도 | gas를 제외하고 시작 ETH와 최종 ETH 비교 | 잔존 비율은 `0.97 × 0.85 = 0.8245`에 가까움, 차이는 LP 수수료, 가격 영향, 반올림으로 설명됨 |  |  |
| T-40 | 크기가 크게 다른 매도 두 건 | 총액 대비 세금 비교 | 두 경우 모두 세율 15 %, 구간이나 면제 없음 |  |  |

## 5. 자동 매수벽

매도마다, exact-input이든 exact-output이든 hook은 `_collectCrossedWalls()`를 호출한 다음 `_placeWall()`을 호출합니다. 먼저 가격이 완전히 통과한 매수벽을 가장 가까운 것부터 가장 먼 것까지 모두 비운 다음, 대기 중인 ETH 전부를 목표 `0.4 × prix courant + 0.6 × prix de lancement`에 배치합니다. 목표는 매도 **후** 가격으로 계산하고 tick 단위로 반올림합니다. 출시 가격 이하처럼 이 목표가 풀 tick보다 엄밀히 위에 있지 않으면 매수벽을 현재 가격보다 1 % 낮은 곳에 배치합니다.

비워진 매수벽은 그 CUBIT을 `pendingAbsorbedTokens`에 더하고, 남은 ETH(수수료와 미세 잔량)를 `pendingFloorEth`로 돌려보냅니다. 일부만 소모된 매수벽은 그 자리에 남습니다. 유동성을 만들기에 너무 작은 금액과, 가격이 tick 범위의 맨 위에 있어 가격 아래에 매수벽을 둘 자리가 없는 극단적인 경우만 자금을 `pendingFloorEth`에서 기다리게 하며, 이 이유로 매도가 거절되는 일은 없습니다. 이어서 CUBIT 라우터가 try/catch 안에서 `deliverAbsorbed()`를 호출합니다.

Lens의 참조값 `floorPrice()`는 전역 최저가가 아니라 **가장 최근에 자금을 조달한 매수벽**을 나타냅니다. 통과한 매수벽 하나마다 약 185 000 gas가 들므로, 트랜잭션 하나의 16 777 216 gas 한도 안에서 매도 하나는 최대 약 88개의 매수벽을 통과할 수 있습니다.

| 사례 | 사전 조건 | 단계 | 예상 결과 | 관찰 결과 | 심각도 |
| --- | --- | --- | --- | --- | --- |
| T-41 | 가격이 출시 가격보다 높음 | 매도 후 매수벽 읽기 | `WallFunded(id, lower, addedEth, liquidity)` 발생, 반올림 오차 범위에서 매도의 12 %를 포함한 대기 ETH로 목표 tick에 매수벽이 생성되거나 두꺼워짐, `pendingFloorEth`에는 배치되지 않은 잔여분만 남음 |  |  |
| T-42 | 이전 상황 | 매도 **후** 가격과 출시 가격으로 목표 재계산 | 매수벽의 `lower`가 이 가격으로 계산하고 tick 단위로 반올림한 40/60 목표와 일치 |  |  |
| T-43 | 목표가 같은 tick에 떨어지는 매도 두 건 | `wallCount()`와 `walls(id)` 읽기 | 매수벽은 하나: 두 `WallFunded`의 `id`가 같고, 유동성은 늘고 새 식별자는 생기지 않음 |  |  |
| T-44 | 서로 다른 tick의 매수벽 여러 개 | 매도와 매수를 여러 번 반복한 뒤 `walls(id)` 다시 읽기 | 각 매수벽의 `lower`는 그대로, 이동한 매수벽 없음 |  |  |
| T-45 | 가격 아래의 유효 매수벽 | 매수벽을 통과하지 않고 일부 소모하는 금액 매도 | 매수벽은 ETH와 CUBIT을 함께 보유한 유효 상태로 남음, `WallAbsorbed` 없음, `pendingAbsorbedTokens` 그대로 |  |  |
| T-46 | 일부 소모된 매수벽 | 가격이 매수벽 위로 다시 올라갈 때까지 매수 | 매수벽이 CUBIT을 되팔고 ETH를 되찾음, 식별자와 tick은 그대로 |  |  |
| T-47 | 유효 매수벽, CUBIT 라우터로 매도 | 매수벽을 완전히 통과하는 금액 매도 | 같은 트랜잭션에서 `WallAbsorbed(id, cubit, ethRemaining)`와 `TokensAbsorbed(amount, pendingAbsorbedTokens)`, 이어서 `AbsorbedDelivered(sink, amount)`와 `RewardReserveFunded` 발생, `rewardReserve()`가 그 CUBIT만큼 증가, `pendingAbsorbedTokens`는 0으로 돌아감, `totalSupply()`와 `totalBurned()`는 그대로 |  |  |
| T-48 | 가격이 출시 가격에 가깝고 40/60 목표가 시장 아래에 있지 않음 | 체결 가능한 소액 매도 후 매수벽 읽기 | 매도 성공, `WallFunded` 발생, 매수벽이 매도 후 가격보다 1 % 낮은 곳에 tick 단위로 반올림해 배치됨, `pendingFloorEth`에는 배치되지 않은 잔여분만 남음 |  |  |
| T-49 | T-48의 상황 | 체결 가능한 소액을 다시 매도한 후 `pendingFloorEth` 읽기 | 새 가격보다 1 % 낮은 곳에 `WallFunded` 발생, `pendingFloorEth`에는 반올림 미세 잔량만 남음, 매도 사이에 적체가 쌓이지 않음 |  |  |
| T-50 | 호환 타사 라우터 | 타사 경로로 매수벽을 완전히 통과하며 매도한 뒤 아무 계정에서 `deliverAbsorbed()` 호출 | 세금 적용, `TokensAbsorbed` 발생, CUBIT은 호출 때까지 `pendingAbsorbedTokens`에 남고 호출 시 `AbsorbedDelivered` 발생 |  |  |
| T-51 | 자금을 조달한 매수벽 여러 개 | Lens의 `floorPrice()`와 `netFloorPrice()`를 읽고, 이어서 `wallAmountsPage(0, 500)`부터 `activeWallCount`까지의 페이지를 모두 같은 블록에서 읽기 | 가장 최근에 자금을 조달한 매수벽의 참조값이며 그렇게 표시됨, 매수벽의 CUBIT은 페이지 합계에 `pendingAbsorbedTokens`를 한 번만 더한 값 |  |  |
| T-52 | Forge 자식 시장, 완전히 통과된 매수벽 | 자식 hook의 `absorbedTokenSink()`를 읽은 뒤 매도 이벤트 읽기 | 목적지가 Forge의 `governanceVault()`와 같음, `AbsorbedDelivered` 발생, `Deposited(token, from, amount, unlockAt)` 묶음이 30일간 잠김 |  |  |
| T-106 | 매도 한 번에 통과할 매수벽이 많음 | 매도의 gas를 추정한 뒤 전송 | 통과한 매수벽 하나마다 약 185 000 gas, 약 88개를 넘으면 매도가 16 777 216 gas를 초과해 손실 없이 실패: 매도를 나눔 |  |  |
| T-107 | CUBIT 목적지가 전송을 거부하는 리허설 배포 | CUBIT 라우터로 매수벽을 통과하며 매도한 뒤 `deliverAbsorbed()` 다시 호출 | 매도 성공, CUBIT은 `pendingAbsorbedTokens`에 남음, 호출은 모든 계정에 열려 있으며 목적지가 거부하는 동안에는 실패 |  |  |

## 6. mCUBIT Vault

Vault는 `rewardReserve`에서만 떼어 내는 **CUBIT** 보상을 지급합니다. 보상은 `DAILY_REWARD_BPS = 300`, 즉 24시간 기간(`REWARD_PERIOD`)마다 예치액의 3 %이며, 경과 시간에 비례해 계산하고 **한 기간으로 상한**을 둡니다. 그 이상은 초과분이 소멸합니다. 보상은 준비금 잔액을 절대 넘지 않으며 원금에서 절대 지급되지 않습니다.

예치할 때마다 지갑의 전체 포지션에 **24시간** 잠금(`LOCK_DURATION`)이 다시 시작되며, 기한 전 인출은 `Locked`로 거절됩니다. 예치, 인출, 청구는 먼저 쌓인 보상을 지급하고 기간을 다시 시작합니다. 어떤 계정이든 `fundRewardReserve(amount)`로 준비금을 채울 수 있습니다. 기한은 브라우저 시계가 아니라 체인 timestamp로 판단합니다.

보상은 **CUBIT으로만** 지급되며 `claimCubit()`로 청구합니다. Vault는 WETH 보상 함수를 전혀 제공하지 않습니다.

| 사례 | 사전 조건 | 단계 | 예상 결과 | 관찰 결과 | 심각도 |
| --- | --- | --- | --- | --- | --- |
| T-53 | Vault 이용 가능, CUBIT 보유 | 승인 후 예치 | `Staked(user, amount, unlockAt)` 발생, `unlockAt`은 블록 timestamp에 24시간을 더한 값 |  |  |
| T-54 | 기존 포지션 | 기한 전에 다시 예치 | **전체 포지션의** 잠금이 다시 시작됨, 쌓인 보상이 0이 아니면 `CubitRewardClaimed`와 함께 지급되고 기간이 다시 시작됨 |  |  |
| T-55 | 잠금 진행 중 | 인출 요청 | `Locked`로 거절 |  |  |
| T-56 | 잠금 만료 | 예치액 일부 인출 | 일부 인출 허용, `Withdrawn` 발생, 쌓인 보상을 먼저 지급, 남은 잔액은 계속 예치됨 |  |  |
| T-57 | 1 000 CUBIT 예치, 준비금 충분 | 12시간 후, 이어서 24시간 후 `pendingCubit` 읽기 | 약 15 CUBIT, 이어서 30 CUBIT |  |  |
| T-58 | 이전 상황 | 청구하지 않고 48시간 기다린 뒤 `pendingCubit` 읽기 | 여전히 30 CUBIT: 둘째 날분은 소멸 |  |  |
| T-59 | 보상 쌓임 | `claimCubit()` 호출 | CUBIT 전송, `CubitRewardClaimed` 발생, `rewardReserve`가 지급액만큼 감소, `pendingCubit`은 0으로 돌아감 |  |  |
| T-60 | 준비금이 작은 리허설 배포 | 준비금보다 큰 보상 청구 | 준비금 잔액만 지급, 준비금은 0이 됨, 원금은 건드리지 않음 |  |  |
| T-61 | 직접 호출 | `fundRewardReserve(0)`을 호출한 뒤, 아무 계정에서 승인 후 `fundRewardReserve(x)` 호출 | `InvalidAmount`로 거절, 이어서 `RewardReserveFunded(from, x)` 발생, `rewardReserve`가 `x`만큼 증가 |  |  |
| T-62 | 직접 호출 | 여러 시점에 `token.balanceOf(vault)`를 `totalStaked + rewardReserve`와 비교 | Vault 잔액은 이 합계보다 작아지지 않음 |  |  |
| T-63 | 0 금액, 직접 호출 | `stake(0)` 후 `withdraw(0)` 호출 | 두 경우 모두 `InvalidAmount`로 거절 |  |  |
| T-64 | 현재 레지스트리에 연결되지 않은 Vault | 예치 시도 | `Inactive`로 거절 |  |  |
| T-65 | 열린 포지션 | 표시된 잠금 기간 읽기 | `LOCK_DURATION`에서 도출한 시간 단위 표시: 24시간 |  |  |
| T-66 | dapp 열림 | WETH 보상 절차 찾기 | 없음: CUBIT 보상만 제공 |  |  |

## 7. 런치패드 거버넌스 vault

거버넌스 vault는 Forge 출시 수수료(ETH)와 Forge 자식 시장의 매수벽이 흡수한 토큰을 받습니다. **각 예치분은 자기 수령 시점부터 30일간 잠깁니다**(`LOCK_DURATION`). **배포자만** 청구할 수 있고, 이 권리는 영구적이며 양도할 수 없습니다. 날짜가 지난 묶음만 오래된 것부터 최신 순으로 청구합니다. ETH는 키 `ETH()`, 즉 영 주소로 기록됩니다. 인수 검증 전에 테스트하는 배포의 ABI를 다시 읽으세요. 배포자는 `extendLock`으로 현재와 향후 모든 예치분의 잠금을 연장할 수 있으며, `lockExtension()`은 늘어나기만 하고 모든 날짜에 더해집니다.

자식 시장 매수벽에서 자동으로 보내는 기능은 T-52로, 출시 수수료 예치는 T-81로 확인합니다. T-67~T-73 사례에서는 직접 호출로 테스트 토큰을 예치하고, T-108에서는 수수료의 ETH를 청구합니다.

| 사례 | 사전 조건 | 단계 | 예상 결과 | 관찰 결과 | 심각도 |
| --- | --- | --- | --- | --- | --- |
| T-67 | 테스트 토큰, 직접 호출 | 승인 후 `deposit(token, amount)` 호출 | `Deposited(token, from, amount, unlockAt)` 발생, `unlockAt`은 블록 timestamp에 30일을 더한 값, `held(token)`이 같은 양만큼 증가 |  |  |
| T-68 | 30일이 안 된 예치 | 배포자 계정으로 `claim(token, n)` 호출 | `NothingToClaim`으로 거절 |  |  |
| T-69 | 잠금이 풀린 묶음 | 다른 계정으로 `claim(token, n)` 호출 | `NotDeployer`로 거절 |  |  |
| T-70 | 7일 동안 하루 한 번 예치 | 첫 예치 후 30일째부터 매일 청구 | 하루에 한 묶음씩 오래된 것부터 풀림, 마지막 묶음은 일곱 번째 예치 30일 후에 풀림, 청구마다 `Claimed(token, amount, tranches)` 발생 |  |  |
| T-71 | 잠금이 풀린 묶음 여러 개 | `claim(token, 1)` 호출 | 한 묶음만 지급, 다음 묶음은 계속 청구 가능 |  |  |
| T-72 | 단순 전송으로 보낸 토큰 | `lockUntracked(token)`을 호출한 뒤 새 전송 없이 다시 호출 | 첫 호출부터 30일간 잠기는 새 묶음 생성, 두 번째 호출은 `NothingToLock`으로 거절 |  |  |
| T-73 | 잠긴 묶음과 풀린 묶음 | `claimable(token)`과 `locked(token)` 읽기 | 청구 가능 금액과 잠긴 금액의 합은 `held(token)`과 같음 |  |  |
| T-108 | T-81의 출시 수수료가 예치된 지 30일 초과 | 다른 계정에서, 이어서 배포자에서 `claim(address(0), 1)` 호출 | 먼저 `NotDeployer`로 거절, 이어서 ETH가 배포자에게 지급됨, `Claimed(address(0), amount, 1)` 발생, `held(address(0))`가 지급액만큼 감소 |  |  |
| T-109 | 잠긴 묶음 | 다른 계정에서, 이어서 배포자에서 `extendLock(extra)` 호출 | 먼저 `NotDeployer`로 거절, 이어서 `LockExtended(extra, lockExtension)` 발생, `tranche(token, i)`로 읽은 모든 날짜가 `extra`만큼 늦춰짐, 잠금을 줄이는 함수 없음 |  |  |

## 8. Forge

Forge는 향후 릴리스로 소개되는 공개 런치패드입니다. CUBIT 출시에 포함되지 않으며, 나중에 거버넌스 vault와 함께 추가됩니다. 런치패드가 추가되면 그 주소를 기록하세요.

모든 계정이 정확한 수수료를 내면 자식을 출시할 수 있습니다. Forge 자식은 공급량 전체를 자기 밴드에 예치하고, Forge는 생성 시 거버넌스 vault 주소를 받으며, 각 출시는 0.005 ETH의 수수료를 이 vault에 납부하며 vault가 이를 보유합니다. 출시자는 이를 결코 돌려받지 못합니다. 배포 salt는 출시하는 계정에 묶입니다.

| 사례 | 사전 조건 | 단계 | 예상 결과 | 관찰 결과 | 심각도 |
| --- | --- | --- | --- | --- | --- |
| T-81 | Forge 이용 가능, 임의의 계정 | 0.005 ETH의 정확한 수수료로 자식 출시 | `ChildLaunched(token, hook, launcher, team, fee)` 발생, 자식의 `BandBootstrapped`가 반올림 오차 범위에서 공급량 전체와 같은 예치를 표시, 거버넌스 vault가 `Deposited(address(0), forge, fee, unlockAt)` 발생(`unlockAt`은 블록 타임스탬프에 30일과 연장분을 더한 값), 부모 hook의 `pendingFloorEth` 변화 없음 |  |  |
| T-82 | Forge 이용 가능 | 잘못된 value, 빈 이름, 0 팀 주소 또는 다른 템플릿으로 출시 시도 | 거절: `wrong launch fee`, `invalid name`, `invalid team` 또는 `template mismatch` |  |  |
| T-110 | 다른 계정이 본 출시의 salt | 같은 salt로 두 번째 계정에서 출시 | 첫 출시의 주소를 가져가지 못함: salt는 출시 계정에 묶이며, hook 주소에 권한이 없으면 두 번째 출시는 `child deployment failed`로 거절됨 |  |  |

## 9. 교체와 권한

레지스트리 authority는 주변 주소 네 개(Vault, 라우터, Lens, Forge)를 언제든 지체 없이 교체할 수 있습니다. 교체마다 `ModuleUpdated`를 내고 **`moduleRevision`을 증가시키며**, 해당 기능(Vault, Momentum, Forge)을 팀이 다시 열 때까지 닫습니다. 라우터 교체로 닫히는 기능은 없습니다. 이미 등록되었거나, 다른 hook이나 토큰에 연결되었거나, 이미 stake가 있는 후보는 `InvalidModule`로 거절됩니다.

hook에는 **관리자가 없으며**, 누구도 스왑이나 매수벽 메커니즘을 일시 중지할 수 없습니다. 팀 주소는 영구 권한을 유지합니다. 세금의 팀 몫을 받고 레지스트리 모듈을 교체한 뒤 활성화합니다.

| 사례 | 사전 조건 | 단계 | 예상 결과 | 관찰 결과 | 심각도 |
| --- | --- | --- | --- | --- | --- |
| T-83 | 현재 Vault에 예치와 준비금 있음 | Vault 교체 | 예치 CUBIT, 보상 준비금, 기한은 **이전 Vault에 남음**, 자금 이동 없음 |  |  |
| T-84 | Vault 교체됨 | 이전 Vault에서 청구, 인출 후 예치 시도 | 청구와 인출은 계속 가능, 새 예치는 `Inactive`로 거절 |  |  |
| T-85 | 이미 등록되었거나 stake가 있는 후보 | 교체 시도 | `InvalidModule`로 거절 |  |  |
| T-86 | 교체 완료 | `moduleRevision()`과 이벤트 읽기, Vault 교체 후에는 새 Vault에 예치 시도 | 개정 증가, `ModuleUpdated(module, previous, current, revision)` 일치, Vault가 다시 활성화될 때까지 예치는 `Inactive`로 거절됨 |  |  |
| T-87 | 이전 라우터에 승인 부여 | 라우터 교체 후 매도 시도 | 이전 승인은 새 spender에 적용되지 않음, 새 승인 요청 |  |  |
| T-88 | 라우터 교체됨 | 이전 라우터로 스왑 | 스왑은 계속 가능하고 hook 세금 적용, dapp은 새 라우터 사용 |  |  |
| T-89 | 직접 호출 | 배포된 hook의 ABI 검사 | 스왑이나 매수벽 메커니즘을 중단시키는 함수가 없음, hook에는 관리자가 없음 |  |  |
| T-90 | 직접 호출 | Lens의 `snapshot()`을 읽고, 같은 블록에서 매수벽 페이지를 읽기 | snapshot에는 시장, 밴드, 매수벽, 계정 필드, 총공급량, 보상 준비금, 활성 매수벽 수, 읽기 블록과 최선 매수벽만 있고 매수벽 합계는 없으며, 그 비용은 매수벽 수에 좌우되지 않음, 유통 공급량은 `totalSupply`에서 매수벽의 CUBIT과 `rewardReserve`를 뺀 값이고 보유 CUBIT은 그 공급량에서 `bandTokens`를 뺀 값 |  |  |
| T-91 | 출시 후 언제든 | 매수와 매도 | 스왑이 정상 동작: 어떤 계정도 스왑을 막을 수 없음 |  |  |

## 10. 예상 거절 사례

이 표는 인수 검증 내내 기준으로 씁니다. 자동 매수벽은 매도에 거절을 추가하지 않습니다. 매수벽을 배치할 수 없으면 자금이 대기 상태로 남고, 실패한 전송은 CUBIT을 대기 상태로 둡니다.

> **주의할 점.** 현재 dapp 소스에서는 컨트랙트 오류가 번역되지 않습니다. 온체인 거절이 원시 메시지로, 잘린 채 표시될 수 있습니다. **발생한 거절마다 표시된 정확한 문구를 기록하고** 이해할 수 있는지 판단하세요.

| 오류 | 발생 원인 | 애플리케이션이 보여야 할 내용 |
| --- | --- | --- |
| `ExternalLiquidityForbidden` | 제3자의 유동성 추가 | 작업 불가: 프로토콜이 유일한 유동성 공급자 |
| `SupplyNotDeposited` | 공급량의 80 % 미만 예치로 초기화 | 예치 부족으로 출시 불가 |
| `Expired` | 트랜잭션 기한 초과 | 견적 만료, 다시 계산 필요 |
| `TooLittleReceived(received, minimum)` | 허용 최솟값보다 적은 출력 | 슬리피지 보호 작동 |
| `TooMuchRequested(required, maximum)` | 허용 상한보다 큰 입력 | 입력 상한 보호 작동 |
| `IncompleteInput` | 완전히 소모되지 않은 exact-input | 가용 유동성에 비해 금액이 너무 큼 |
| `InsufficientOutput` | 완전히 제공되지 않은 exact-output | 장부가 이 출력을 제공할 수 없음 |
| `InvalidAmount`, `ZeroRecipient`, `WrongValue`, `WrongPool` | 잘못된 주문 매개변수 또는 Vault에 보낸 0 금액 | 원시 코드 없는 입력 오류 |
| `Inactive`, `Locked` | 현재 레지스트리에 연결되지 않은 Vault 또는 기한 전 인출 | 모듈 사용 불가 또는 잠금 해제 날짜 |
| `NotDeployer`, `NothingToClaim`, `NothingToLock`, `NothingToExtend` | 제3자의 거버넌스 vault 청구나 연장, 기한 전 청구, 새 잔액 없는 잠금, 0 연장 | 제한된 작업, 청구할 것 없음, 잠글 것 없음 또는 연장할 것 없음 |
| `NotAuthority`, `InvalidModule` | 제3자의 교체 요청 또는 호환되지 않는 후보 | 교체 거절과 그 이유 |

순수하게 애플리케이션에서 발생하는 거절도 기록합니다: 만료된 견적, 바뀐 스왑 맥락, 다른 체인의 지갑, 바뀐 계정, 바뀐 모듈 개정, 아직 확인되지 않은 세율.

## 11. 애플리케이션

이 사례는 dapp으로 수행합니다. 인용한 인터페이스 동작은 소스에서 가져온 것이며 인수 검증 중에 확인합니다.

| 사례 | 사전 조건 | 단계 | 예상 결과 | 관찰 결과 | 심각도 |
| --- | --- | --- | --- | --- | --- |
| T-92 | dapp 열림 | 선택기의 10개 언어를 모두 확인 | 각 언어가 누락 문구나 넘침 없이 번역된 내용을 표시, 제품명은 의도적으로 영어로 유지 |  |  |
| T-93 | 언어 선택됨 | 새로고침 후 창을 640 px 미만으로 줄이기 | 선택이 세션 간에 유지됨, 640 px 미만에서 선택기는 국기만 표시 |  |  |
| T-94 | 영어 외 언어 | 홈 제목을 영어판과 비교 | 영어 외 언어에서는 제목을 의도적으로 줄임, 넘치거나 잘리면 안 됨 |  |  |
| T-95 | 약 400 px 화면 | 모든 화면 확인 | 가로 넘침 없음, 넓은 영역은 자체 컨테이너 안에서 스크롤, 버튼은 계속 누를 수 있음 |  |  |
| T-96 | 768~1279 px 창 | 탐색 메뉴 열기 | 1279 px까지 축소 메뉴 사용, 이동 후 메뉴가 닫힘 |  |  |
| T-97 | 트랜잭션 확인됨 | 표시된 각 금액을 같은 블록의 온체인 값과 비교 | 금액 일치, 표시 반올림이 서명 금액을 바꾸지 않음 |  |  |
| T-98 | 작업 준비 중 | 절차 도중 지갑에서 네트워크 변경 | 견적이 무효화되고 예상 네트워크 밖에서는 서명 거절, 버튼은 먼저 네트워크 전환을 제안하고 교환에는 두 번째 동작을 요구 |  |  |
| T-99 | 작업 준비 중 | 절차 도중 지갑에서 계정 변경 | 새 계정 기준으로 잔액, 승인, 견적 재계산, 이전 계정용으로 준비한 서명은 거절 |  |  |
| T-100 | 승인 완료, 스왑 미서명 | 그 사이에 모듈 개정이 바뀌게 두기 | 애플리케이션이 맥락을 재검증하며 새 spender로 조용히 넘어가지 않음 |  |  |
| T-101 | RPC 불가 또는 오래된 읽기 | RPC 접근을 끊고 관찰 | 상태가 미확인으로 표시되고 동작이 비활성화됨 |  |  |
| T-102 | 트랜잭션 전송됨 | hash에 이어 영수증 추적 | 인터페이스가 “제출됨”과 “성공”을 구분, Sepolia 탐색기에서 이벤트 확인 가능 |  |  |
| T-103 | 온체인 거절 유발 | 표시된 문구 전체 기록 | 메시지는 사용자가 이해할 수 있어야 함, 원시 기술 코드나 잘린 메시지는 모두 기록 |  |  |
| T-104 | 중국어, 한국어, 일본어 | 외부 글꼴 서비스 접근 없이 이 언어 표시 | 문자가 올바르게 표시됨: 글꼴은 사이트가 제공 |  |  |
| T-105 | Proof 화면 열림 | 밴드, 매수벽, 대기 자금 읽기 | `bandEth`, `bandTokens`, 매수벽, 대기 ETH, 전송 대기 CUBIT이 따로 표시됨, 어떤 화면에도 래더, keeper, 매수벽 소각이 나오지 않음 |  |  |

## 12. 기록표

앞 섹션의 각 표가 그 섹션의 기록표**입니다**. 사례를 진행하면서 “관찰 결과”와 “심각도” 열을 채우세요. 관찰 결과에는 최소한 트랜잭션 hash나 읽기 블록을 적고, 이어서 확인한 내용을 적습니다.

보고서에 첨부할 요약:

| 섹션 | 사례 | 부합 | 차이 | 최고 심각도 |
| --- | --- | --- | --- | --- |
| 1. 준비 | T-01~T-06 |  |  |  |
| 2. 출시와 밴드 | T-07~T-16 |  |  |  |
| 3. 매수와 매도 | T-17~T-33 |  |  |  |
| 4. 세금과 회계 | T-34~T-40 |  |  |  |
| 5. 자동 매수벽 | T-41~T-52, T-106, T-107 |  |  |  |
| 6. mCUBIT Vault | T-53~T-66 |  |  |  |
| 7. 거버넌스 vault | T-67~T-73, T-108, T-109 |  |  |  |
| 8. Forge | T-81, T-82, T-110 |  |  |  |
| 9. 교체와 권한 | T-83~T-91 |  |  |  |
| 10. 거절 사례 | 공통 참조 |  |  |  |
| 11. 애플리케이션 | T-92~T-105 |  |  |  |

차이는 스크린샷만이 아니라 반드시 **사례 번호**에 연결합니다. 네트워크, 배포 주소, 블록, hash, 애플리케이션 버전을 함께 첨부하세요.

## 이 계획의 한계

이 계획은 새 버전 코드와 2026년 9월 14일 결정이 예정하는 내용을 설명합니다. 이 계획은 **검증이 아닙니다**. Sepolia 인수 검증에 성공해도 테스트 캠페인을 대체하지 않습니다.

“테스트 중 확인 필요” 항목은 관찰한 뒤 이 페이지에 반영해야 합니다.

<p class="source-note">출처: <code>contracts/src/CubitHook.sol</code>, <code>CubitLens.sol</code>, <code>interfaces/ICubitHook.sol</code>, <code>interfaces/ICubitLens.sol</code>, <code>libraries/BandLib.sol</code>, <code>libraries/WallLib.sol</code>, <code>periphery/CubitRouter.sol</code>, <code>CubitV2.sol</code>, <code>CubitVault.sol</code>, <code>CubitGovernanceVault.sol</code>, <code>CubitForge.sol</code>, <code>CubitLaunch.sol</code>, <code>dapp/src</code>의 현재 절차, 그리고 <code>contracts/docs/REDESIGN_HANDOFF.md</code>에 기록된 2026년 9월 14일 설계 결정.</p>
