---
description: "CUBIT 코드베이스 지도: 컨트랙트, 밴드와 매수벽, vault, dapp과 서비스."
section: "04 / 개발하기"
reading: "읽는 시간 6분"
---

# 아키텍처와 코드베이스

저장소에는 Solidity 컨트랙트, React/Vite dapp, Node 서비스 두 개가 있습니다. 이 GitBook은 `gitbook/`에 독립적으로 있으며 빌드에서 비공개 설정이나 프로토콜 네트워크 데이터를 읽지 않습니다.

> 여기서 설명하는 버전은 `redesign/tide-lp-autowalls-vault` 브랜치에 있습니다.

## 디렉터리

| 디렉터리 | 역할 |
| --- | --- |
| `contracts/src` | 토큰, hook, 라이브러리, 인터페이스, 주변 컨트랙트 |
| `contracts/test` | 이전 API 기반의 과거 Foundry 테스트, 새 버전의 테스트는 `test/redesign`에 있음 |
| `contracts/audit` | 추가 검증 하네스·캠페인 |
| `contracts/script` | Foundry 배포 스크립트와 로컬 노드에서 재실행할 수 있는 시나리오 |
| `contracts/scripts` | ABI 내보내기, 검사, 배포 절차 |
| `contracts/deployments` | 공개 버전 manifest·이력 |
| `dapp/src/chain` | 설정, ABI, 읽기, 견적, 거래 |
| `dapp/src/pages` | Swap, Proof, Staking, 로드맵, V2 모듈 |
| `services/shared` | 공유 설정, 클라이언트, ABI, 실행 추적 |
| `services/keeper` | 이전 유지보수 서비스, 새 버전에서는 쓸모없음 |
| `services/floor-bot` | 이벤트 읽기·게시 준비 |
| `audit/reports` | 날짜·개정별 보고서와 증거 |
| `gitbook/docs` | 이 문서의 프랑스어 원본 |

## 핵심 컨트랙트

| 구성요소 | 역할 |
| --- | --- |
| `CubitToken` | 초기 2,100만 일회 발행 ERC-20, hook만 소각 가능 |
| `CubitHook` | 세금, 유동성 밴드, 매수벽 배치와 비우기, 팀 계정, V2 연결 |
| `BandLib` | 가격, 변환, tick 반올림, 매수벽 목표 |
| `WallLib` | tick별 매수벽: 영구 식별자, 유효 매수벽 색인, 매수벽 자금 조달과 통과된 매수벽 비우기 |
| `PoolManager` v4 | 풀 상태, 유동성 포지션, 스왑, 정산 |

hook은 CUBIT 풀의 유일한 유동성 공급자이며 다른 유동성 추가는 모두 거절됩니다. 자금은 포지션과 PoolManager의 ERC-6909 claims로 추적하므로 hook 주소의 네이티브 ETH 잔액만으로 준비금을 측정할 수 없습니다.

밴드는 `BAND_SALT`로 식별되는 단일 포지션입니다. 각 매수벽은 자기 salt 아래에서 `tickSpacing` 한 칸을 차지합니다. `WallLib`는 hook 저장소에서 동작하므로 claims와 포지션은 계속 hook에 귀속됩니다.

## 주변 컨트랙트

| 구성요소 | 역할 |
| --- | --- |
| `CubitRouter` | exact-input/output 스왑, 슬리피지 한도, 기한, 정산, 매도마다 흡수된 CUBIT 전송 |
| `CubitLens` | 파생 뷰: 시장, 밴드, 매수벽, 계정, 유통 공급량, 보유 CUBIT, 최선 매수벽 |
| `CubitV2` | 안정된 모듈 레지스트리, 개정, vault 기록 |
| `CubitVault` | CUBIT 예치, 24시간 잠금, 준비금에서 지급하는 CUBIT 보상 |
| `CubitGovernanceVault` | 런치패드 거버넌스 vault: ETH 출시 수수료와 자식 시장 매수벽의 토큰, 예치마다 30일간, 연장이 있으면 그만큼 더 잠김, 청구와 연장은 영구적으로 배포자만 가능 |
| `CubitForge` | 출시 후 추가되는 격리된 자식 시장의 공개 런치패드, 0.005 ETH의 출시 수수료는 생성 시 주소가 고정된 거버넌스 vault로 납부 |
| `CubitLaunch` | 단일 트랜잭션 출시: 공급량의 80 %는 밴드에, 20 %는 vault 준비금에 넣고 배포자 매수까지 실행 |

팀 주소는 레지스트리에서 Router, Lens, Vault, Forge를 언제든 지체 없이 교체한 뒤 활성화할 수 있으며, 이 권한은 영구적입니다. 교체할 때마다 해당 기능은 다시 활성화될 때까지 비활성화됩니다. 토큰, hook, 풀 식별자, 레지스트리 앵커는 이 교체 방식에 해당하지 않고, hook에는 관리자가 없습니다. 누구도 스왑이나 매수벽 메커니즘을 일시 중지할 수 없습니다.

## 읽기 경로

```text
프런트엔드 또는 서비스
    → 공개 manifest: 네트워크, 핵심, 레지스트리
    → 특정 블록의 레지스트리: 모듈 + 개정
    → 모듈 연결 검사
    → 같은 블록의 Lens와 hook 뷰
    → 작업 표시 또는 시뮬레이션
```

프런트엔드에서는 `releases.ts`가 모듈을 확인하고 `vault.ts`가 이전 Vault 읽기를 유지합니다. RPC 무응답은 서명을 허용하는 근거가 아닙니다. dapp 데이터 계층은 운영 중인 버전의 ABI를 읽습니다.

## 스왑 경로

프런트엔드는 견적 후 시뮬레이션합니다. 라우터가 PoolManager 정산 맥락을 열면 hook은 ETH 부분에 세금을 적용하고, 스왑은 밴드 곡선과 통과하는 매수벽을 따라갑니다. 이어서 라우터가 delta를 정산합니다.

매도마다 hook은 `afterSwap`에서 완전히 통과된 매수벽을 비운 다음, 대기 중인 ETH를 매도 후 가격으로 계산한 목표의 매수벽에 배치하고, 출시 가격 이하처럼 그 목표가 시장 아래에 있지 않으면 현재 가격보다 1 % 낮은 곳에 배치합니다. 매도가 끝나면 CUBIT 라우터가 `deliverAbsorbed()`를 호출해 흡수된 CUBIT을 vault 준비금으로 보냅니다. 이 전송이 실패해도 매도는 막히지 않습니다.

경계가 중요합니다. 라우터 callback은 예상 작업 동안 PoolManager만 접근하며 payer는 라우터의 인증된 caller에서 나옵니다.

## 새 버전에서 바뀐 점

밴드가 래더를 대체하며 `rebalance`, `raiseFloor`, sweep, 보상금은 제거되었습니다. 매수벽은 매도 중에 배치되고 비워지며, 통과된 매수벽의 CUBIT은 소각되지 않고 vault 준비금으로 들어갑니다.

과거 테스트 모음 `contracts/test`는 이전 API를 사용하므로 새 버전과 함께 컴파일되지 않습니다. 새 버전의 테스트는 `test/redesign`에 있습니다. 다음 단계는 [로드맵](../roadmap.md)에, 테스트한 구성요소는 [버전 상태](../securite/etat.md)에 있습니다.

<p class="source-note">출처: 명시된 저장소 파일, 특히 <code>CubitHook</code>, <code>BandLib</code>, <code>WallLib.Book</code>, <code>periphery/CubitRouter.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>releases.ts</code>, <code>contracts/docs/REDESIGN_HANDOFF.md</code> 및 서비스 README.</p>
