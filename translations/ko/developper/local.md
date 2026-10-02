---
description: "로컬 컴파일, 새 버전 Foundry 테스트, dapp, 서비스, GitBook 명령. 거래를 전송하지 않습니다."
section: "04 / 개발하기"
reading: "읽는 시간 5분"
---

# 프로젝트 로컬 실행

각 디렉터리는 자체 의존성이 있습니다. 저장소 lockfile을 사용하고 컨트랙트·ABI·manifest·클라이언트 버전을 맞추세요.

아래 명령은 로컬 구성요소 빌드·검증용이며 운영 배포 절차가 아닙니다.

## 사전 요구사항

최근 Node.js, dapp·서비스용 pnpm, Solidity용 Foundry, GitBook용 npm을 사용합니다. 서비스는 **Node 22 이상**, GitBook은 Node 24로 준비했습니다.

컨트랙트는 **Solidity 0.8.26**, EVM **Cancun**, **via IR**, 옵티마이저 **10 runs**, CBOR 메타데이터 없음을 고정합니다. 모두 bytecode 식별 검증의 일부입니다.

클론 후 저장소 Solidity 의존성을 준비해야 합니다:

```bash
git submodule update --init --recursive
```

## 컨트랙트 컴파일·테스트

`redesign/tide-lp-autowalls-vault` 브랜치의 `contracts/`에서:

```bash
FOUNDRY_TEST=test/redesign forge build --sizes
FOUNDRY_TEST=test/redesign forge test
```

과거 테스트 모음 `test/`는 이전 래더 API를 사용하므로 새 버전과 함께 컴파일되지 않습니다. `FOUNDRY_TEST`는 컴파일을 `test/redesign`의 테스트로 제한합니다. via IR 방식 때문에 컴파일이 느립니다.

설정의 fuzzing·불변조건 프로필은 과거 테스트 모음을 대상으로 합니다:

```bash
FOUNDRY_PROFILE=ci forge test
FOUNDRY_PROFILE=gate forge test
```

테스트 결과는 정확한 개정, 매개변수, 컴파일 소스와 묶어야 하며, 옛 로그는 새 버전의 결과가 아닙니다.

`script/Scenarios.s.sol` 스크립트는 로컬 Anvil 노드에서 시나리오를 재실행합니다. 밴드용 `SCENARIO=band`, 매수벽용 `SCENARIO=walls`, 통과된 매수벽의 gas 측정용 `SCENARIO=crossing`이 있습니다. 로컬 배포는 저장소 지침을 따르고 메모에 키를 옮겨 적지 마세요.

## dapp 시작

`dapp/`에서:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
pnpm dev
```

Vite가 개발 URL을 표시합니다. 설정은 시뮬레이션 모드와 설정된 배포의 데이터를 구분합니다. 저장소 예시·지침으로 로컬 RPC를 설정하고 접근 자격정보를 소스나 공개 번들에 넣지 마세요.

프런트엔드 컴파일은 manifest와 네트워크 컨트랙트의 일치를 증명하지 않습니다. dapp은 운영 중인 버전의 ABI를 읽습니다.

## ABI 유지관리

`contracts/`에서 컴파일 후 내보냅니다:

```bash
bash scripts/export-abi.sh
python3 scripts/check-abi.py
```

dapp은 `pnpm gen-abi`, 서비스는 `pnpm gen:abi`를 제공합니다. 생성된 인터페이스·이벤트·타입 변경을 검토하세요. 릴리스 동기화에는 `band()` 뷰, `bandEth`와 `bandTokens` 필드, 매수벽 뷰, `deliverAbsorbed()`, `pendingAbsorbedTokens()`, 두 vault를 포함해야 합니다.

dapp의 `pnpm sync-deployment`는 배포 manifest를 다시 읽습니다. 실제 검증한 버전의 메타데이터로만 실행해야 합니다.

## 서비스 검증

`services/`에서:

```bash
pnpm install --frozen-lockfile
pnpm gen:abi
pnpm typecheck
pnpm test
```

keeper 서비스는 이전 모델에 속하며 새 버전에서는 더 이상 쓰이지 않습니다. 이벤트 릴레이 운영은 [전용 페이지](services.md)를 보세요.

## 이 GitBook 시작

`gitbook/`에서:

```bash
npm ci
npm run dev
```

사이트는 `http://localhost:4000`에서 페이지 재빌드를 제공합니다. 정적 `_book/` 생성과 링크 확인:

```bash
npm run build
npm run preview
```

로컬 미리보기는 `http://localhost:4001`입니다. 글꼴이 내장되며 검색은 브라우저의 책 색인에서 실행됩니다.

문서 브라우저 절차 검증:

```bash
npm run test:install
npm run test:browser
```

[`gitbook/` README](../sources.md#la-documentation)는 HonKit 선택, 구조, 검사, 편집 유지관리를 설명합니다.

<p class="source-note">출처: <code>contracts/foundry.toml</code>, <code>contracts/docs/REDESIGN_HANDOFF.md</code>, <code>contracts/script/Scenarios.s.sol</code>, 저장소 스크립트, <code>dapp/package.json</code>, <code>services/package.json</code> 및 <code>gitbook/package.json</code>. 이 문서 빌드에는 키나 인증 RPC URL이 필요하지 않습니다.</p>
