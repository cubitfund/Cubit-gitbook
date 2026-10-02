---
description: "ローカルのコンパイル、新バージョンの Foundry テスト、dapp、サービス、GitBook コマンド。取引は送信しません。"
section: "04 / 開発する"
reading: "読了 5 分"
---

# プロジェクトをローカルで動かす

各ディレクトリに独自の依存関係があります。リポジトリの lockfile を使い、コントラクト、ABI、マニフェスト、クライアントの版を揃えます。

以下はローカルでのビルド・検証コマンドで、本番投入の手順ではありません。

## 前提条件

新しい Node.js、dapp・サービスに pnpm、Solidity に Foundry、GitBook に npm を使います。サービスは **Node 22 以上**が必要で、GitBook は Node 24 で準備しました。

コントラクトは **Solidity 0.8.26**、EVM **Cancun**、**via IR**、最適化 **10 runs**、CBOR metadata なしで固定します。これらも bytecode 識別検証の一部です。

clone 後、Solidity の依存関係を揃える必要があります：

```bash
git submodule update --init --recursive
```

## コントラクトのコンパイルとテスト

`contracts/` 内で、`redesign/tide-lp-autowalls-vault` ブランチ上で：

```bash
FOUNDRY_TEST=test/redesign forge build --sizes
FOUNDRY_TEST=test/redesign forge test
```

過去のテストスイート `test/` はラダーの旧 API を使っており、新バージョンではコンパイルできません。`FOUNDRY_TEST` はコンパイル対象を `test/redesign` のテストに限定します。via IR を使うためコンパイルは遅くなります。

設定にある fuzzing と不変条件のプロファイルは、過去のテストスイートを対象とします：

```bash
FOUNDRY_PROFILE=ci forge test
FOUNDRY_PROFILE=gate forge test
```

テスト結果には正確な改訂、設定、コンパイルしたソースを紐付ける必要があり、旧ログは新バージョンの結果ではありません。

スクリプト `script/Scenarios.s.sol` はローカルの Anvil ノードでシナリオを再実行します。バンド用の `SCENARIO=band`、買い壁用の `SCENARIO=walls`、通過される買い壁の gas 用の `SCENARIO=crossing` があります。ローカルデプロイはリポジトリの説明に従い、鍵をメモにコピーしないでください。

## dapp を起動する

`dapp/` 内で：

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
pnpm dev
```

Vite が開発 URL を表示します。設定はシミュレーションと指定デプロイのデータを区別します。リポジトリの例と説明でローカル RPC を設定し、認証情報をソースや公開 bundle にコピーしないでください。

画面のコンパイル成功はマニフェストとネットワーク上のコントラクトの一致を証明しません。dapp は稼働中のバージョンの ABI を読んでいます。

## ABI の保守

`contracts/` 内でコンパイル後に出力します：

```bash
bash scripts/export-abi.sh
python3 scripts/check-abi.py
```

dapp は `pnpm gen-abi`、サービスは `pnpm gen:abi` を提供します。生成されたインターフェース、イベント、型の変更を確認します。リリースの同期には `band()` ビュー、`bandEth` と `bandTokens` フィールド、買い壁のビュー、`deliverAbsorbed()`、`pendingAbsorbedTokens()`、二つの Vault を含める必要があります。

dapp の `pnpm sync-deployment` はデプロイマニフェストを読み直します。実際に検証した版のメタデータでのみ実行します。

## サービスの検証

`services/` 内で：

```bash
pnpm install --frozen-lockfile
pnpm gen:abi
pnpm typecheck
pnpm test
```

keeper サービスは旧モデルのもので、新バージョンでは用途がありません。イベント中継の運用は[専用ページ](services.md)を参照してください。

## この GitBook を起動する

`gitbook/` 内で：

```bash
npm ci
npm run dev
```

サイトは `http://localhost:4000` でページ再構築付きで提供します。静的 `_book/` の生成とリンク検査：

```bash
npm run build
npm run preview
```

ローカルプレビューは `http://localhost:4001` です。フォントは同梱され、検索はブラウザー内の書籍索引で動作します。

文書のブラウザー操作を検証するには：

```bash
npm run test:install
npm run test:browser
```

[`gitbook/` README](../sources.md#la-documentation)は HonKit の選択、構造、検査、編集保守を説明します。

<p class="source-note">出典： <code>contracts/foundry.toml</code>, <code>contracts/docs/REDESIGN_HANDOFF.md</code>, <code>contracts/script/Scenarios.s.sol</code>、リポジトリのスクリプト、 <code>dapp/package.json</code>, <code>services/package.json</code> および <code>gitbook/package.json</code>。この文書のビルドに鍵や認証付き RPC URL は不要です。</p>
