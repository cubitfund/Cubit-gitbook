---
description: "이벤트 릴레이 운영: dry-run, cursor, 모듈 개정, 매수벽 용어. keeper는 더 이상 쓰이지 않습니다."
section: "04 / 개발하기"
reading: "읽는 시간 4분"
---

# 서비스와 운영

저장소에는 Node 프로세스 두 개가 있습니다. 이전 모델에 속하는 **keeper**와 게시를 준비할 수 있는 **이벤트 릴레이**입니다. 로컬 설정은 서비스가 연속 실행된다는 증거가 아닙니다.

## 새 버전에는 keeper가 없습니다

이전 keeper는 `rebalance`, `raiseFloor`, 흡수 토큰 소각을 호출했습니다. 이 유지보수 함수들은 사라졌습니다. 밴드는 재구성되지 않고, 매수벽은 매도 중에 배치되고 비워지며, CUBIT 라우터가 흡수된 CUBIT을 vault로 보냅니다.

`services/keeper` 서비스는 저장소에 남아 있지만 더 이상 존재 이유가 없으며 새 버전을 대상으로 운영하면 안 됩니다. 보상금은 지급하지 않습니다. 예를 들어 다른 라우터를 거친 매도 뒤에 흡수된 CUBIT이 대기 상태로 남아 있으면 어떤 계정이든 `deliverAbsorbed()`를 호출할 수 있습니다.

## 이벤트 릴레이

`services/floor-bot`은 이벤트를 읽어 문구를 준비하고 cursor와 중복 제거 키 `transactionHash:logIndex`를 유지합니다.

dry-run과 게시 모드는 상태가 분리됩니다. cursor에는 체인·hook 맥락이 포함되며 서비스가 지원하는 네트워크에서는 finalized 블록을 씁니다. 재구성이나 불일치 checkpoint는 재개 전에 조정해야 합니다.

릴레이는 게시 전 `pendingPost`를 저장합니다. 외부 서비스가 메시지를 수락했지만 성공 기록 전에 프로세스가 멈추면 다시 실행하기 전에 메시지가 게시되었는지 확인하세요. 로컬 DB와 소셜 네트워크는 함께 commit할 수 없습니다.

GitBook은 게시하지 않습니다. 실제 릴레이 가동에는 별도의 운영 설정과 승인이 필요합니다.

## 모듈 변화

현재 Lens는 레지스트리에서 확인합니다. 전체 작업 동안 핵심 식별자와 개정 맥락을 유지하세요.

서비스는 설명하는 버전의 ABI와 이벤트를 읽습니다. 이전 모델에 맞춘 릴레이를 인수 검증 없이 새 버전에서 검증된 것으로 소개하면 안 됩니다.

## 매수벽 용어 조정

이전 릴레이는 지금은 존재하지 않는 `FloorRaised` 이벤트를 알렸습니다. 새 버전에서는 매도마다 매수벽이 만들어지거나 두꺼워질 수 있고(`WallFunded`) 때로는 이전 매수벽보다 낮은 가격에 자리하며, 완전히 통과된 매수벽은 비워진 뒤(`WallAbsorbed`) 그 CUBIT이 vault 준비금으로 갑니다(`AbsorbedDelivered`).

따라서 릴레이는 **대상 매수벽, 가격대, 추가되거나 흡수된 자금**을 명시해야 하며 이벤트 이름만으로 전역 상승을 추론하면 안 됩니다. 이전의 “floor는 항상 상승” 메시지는 이 정책을 설명하지 않으며, 어떤 안내도 매수벽을 가격 보장으로 소개해서는 안 됩니다.

## 유용한 운영 점검

RPC 오류, 설정 차이, cursor, 마지막 처리 블록 경과 시간, 대기 중인 게시를 추적하세요. 개인 서명 데이터 없이 복구 로그와 버전 식별자를 보존하세요.

프로세스를 재시작하는 감독은 불일치 checkpoint나 레지스트리 변경 해결을 대체하지 않습니다.

<p class="source-note">출처: <code>services/floor-bot/README.md</code>, <code>services/keeper/README.md</code>, <code>services/shared</code>, <code>interfaces/ICubitHook.sol</code> 및 <code>contracts/docs/REDESIGN_HANDOFF.md</code>.</p>
