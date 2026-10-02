---
description: "검토 범위, 문서 우선순위, 시각 디자인 출처, GitBook 유지관리 방법."
section: "05 / 검증하기"
reading: "가이드 참고자료"
search:
  keywords: [출처, 참조, 참고자료, 문서, HonKit, 사양서, 버전, redesign]
---

# 출처와 방법

이 가이드는 로컬 코드베이스와 **2026년 9월 14일** 확정된 설계 결정으로 작성했습니다. 아래 파일은 저장소 경로이며 네트워크 endpoint가 아닙니다.

새 버전은 `redesign/tide-lp-autowalls-vault` 브랜치를 기준으로 설명합니다. 과거 코드 참조는 `work/v1-v2-fixed-walls` 브랜치에 보존된 프로토콜 개정 `991fca9`입니다. 게시된 문서는 설명한 컨트랙트의 검증이 아닙니다.

## 읽기 순서

새 버전의 기준은 **`contracts/docs/REDESIGN_HANDOFF.md`**입니다. 이 문서는 설계 결정과 그 코드 구현을 기록하며 이전 문서보다 우선합니다.

세금은 바뀌지 않았습니다: **매수 3 % 팀**, **매도 15 %: 12 % 매수벽, 3 % 팀**. 거래 유동성은 단일 밴드이고, 매수벽은 매도마다 배치되고 비워지며, 채택된 출시 FDV는 **3.75 ETH**입니다.

**`CUBIT-cahier-des-charges/docs/VERSION_ACTUELLE.md`** 문서는 출시 기준값을 2,100만 토큰의 **FDV 7 000 USD**로 표현했습니다. 새 버전은 FDV를 ETH로 직접 고정하며, 이 가이드는 두 기준 사이의 대응 관계를 제시하지 않습니다.

실제 동작을 알려면 같은 버전의 코드·검증 결과·배포를 연결해야 합니다.

코드 주석은 확정된 결정을 대체하지 않습니다. 반대로 결정도 구현이나 네트워크가 실행한다는 증거가 아닙니다.

## 검토한 코드

| 출처 | 가이드 용도 |
| --- | --- |
| `contracts/docs/REDESIGN_HANDOFF.md` | 확정된 결정과 코드 구현 |
| `contracts/src/CubitToken.sol` | 고정 공급량·소각 권한 |
| `contracts/src/CubitHook.sol` | 세금, 밴드, 매수벽, 계정, V2 연결 |
| `contracts/src/libraries/BandLib.sol` | 형상, 가격, tick, 매수벽 목표 |
| `contracts/src/libraries/WallLib.sol` | tick별 매수벽: 자금 조달과 통과된 매수벽 비우기 |
| `contracts/src/CubitLens.sol` 및 인터페이스 | 가격, 밴드, 매수벽, 잔액, 유통 공급량, 보유 CUBIT, 최선 매수벽 |
| `contracts/src/periphery/CubitRouter.sol` | 스왑, 한도, 승인, 흡수된 CUBIT 전송 |
| `contracts/src/periphery/CubitV2.sol` | 모듈 식별·교체 |
| `contracts/src/periphery/CubitVault.sol` | 잠금, 일일 보상, 준비금 |
| `contracts/src/periphery/CubitGovernanceVault.sol` | 30일간 잠기는 예치와 배포자 청구 |
| `contracts/src/periphery/CubitForge.sol` | 공개 런치패드, 자식 격리, 거버넌스 vault 주소 |
| `contracts/src/periphery/CubitLaunch.sol` | 단일 트랜잭션 출시: 밴드, vault 준비금, 배포자 매수 |
| `dapp/src/chain` | 탐색, 견적, 서명 맥락, 이전 Vault |
| `dapp/src/pages/Momentum.tsx` | 읽기 전용 Momentum 페이지: 활성·일부 소모·통과된 매수벽 |
| `services/` 및 README | 이벤트 릴레이와 이전 keeper |
| `contracts/foundry.toml` 및 패키지 manifest | 명령·빌드 설정 |

## 과거 보고서·문서

이전 버전의 기준 결산은 `audit/reports/2026-09-10-v1-v2/BILAN_FINAL_FR.md`입니다. 새 버전에서 대체된 래더, keeper 유지보수, 매수벽 소각을 설명합니다.

`roadmapdev.md`와 과거 사양서는 V1/V2 의도·이정표 이해에 사용했습니다. 원문은 `CUBIT-cahier-des-charges/historique/2026-09-10-avant-murs-fixes/`에 보관했습니다. 단일 단조 매수벽, E/C 배치, 래더, keeper, 전체 관리권 소멸에 관한 부분은 새 버전의 규칙이 아닙니다.

`contracts/docs/STRICT_BURN.md`는 새 버전에서 폐기된 흡수 토큰 소각의 이력을, `contracts/docs/MODULE_SETTERS.md`는 주변 구성요소 교체를 설명합니다. 과거 테스트 수는 새 버전의 검증 결과로 제시하지 않습니다.

dapp의 이전 로드맵 페이지는 특정 시점의 편집 참고이며 새 버전 통합의 단독 근거로 쓰면 안 됩니다.

## 시각 디자인

테마는 dapp의 기존 디자인을 옮겼습니다:

| 시각 출처 | 채택 요소 |
| --- | --- |
| `dapp/src/index.css` | 크림 `#f5f1e8`, 잉크 `#111312`, 보라 `#5b4bff`, 라임 `#c7ff3d`, 주황 `#ff704d`, 종이 `#ede7d8` |
| `dapp/src/index.css` | 두껍고 넓은 Archivo 제목, Martian Mono 라벨, 은은한 질감 |
| `dapp/src/components/primitives.tsx` | 선명한 테두리, 어긋난 그림자, 패널·상태 |
| `dapp/src/components/Header.tsx` | 타이포 로고, 보라 사각형, 탐색·상태 구분 |
| `dapp/src/ui.tsx` | 별 모티프 장식·고정폭 라벨 |

빌드에서 글꼴과 라이선스를 로컬 복사합니다. 가이드는 dapp의 시각 언어를 쓰되 낡은 슬로건은 사용하지 않습니다.

## 문서

엔진은 Markdown 책·문서 작성용 GitBook fork **HonKit 6.2.2**입니다. 목차, 정적 생성, 검색, 페이지 탐색은 프레임워크가 제공하고 CUBIT 테마가 템플릿·스타일을 확장합니다. [HonKit 공식 문서](https://honkit.netlify.app/).

로컬 설치와 `serve` / `build`는 [공식 시작 문서](https://honkit.netlify.app/setup.html)를 따릅니다. [책 설정](https://honkit.netlify.app/config.html)은 콘텐츠 루트·스타일 등을 설명하고 6.2.2 릴리스가 사용 버전을 식별합니다.

`gitbook/` 루트 README는 설치·명령·브라우저 검사·도구 한계를 설명합니다. 사이트 검증은 책을 검사하며 프로토콜 컨트랙트를 검증하지 않습니다.

## 가이드 유지관리

새 릴리스는 버전 상태와 규범 참조부터 갱신하고 규칙·API·실제 연결 절차를 동기화합니다. 이전 결과가 최종 소스 대상이 아니면 과거 표시를 유지하세요.

`docs/`에 페이지를 추가하고 `SUMMARY.md`에 참조한 뒤 재빌드합니다. 문서 소스는 명시적으로 선택하며 비공개 설정·키·인증 RPC·거래 dump는 사이트에 포함하지 않습니다.
