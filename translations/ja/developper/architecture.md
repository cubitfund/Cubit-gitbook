---
description: "CUBIT コードベースの構成：コントラクト、バンドと買い壁、Vault、dapp、サービス。"
section: "04 / 開発する"
reading: "読了 6 分"
---

# アーキテクチャとコードベース

リポジトリには Solidity コントラクト、React/Vite dapp、二つの Node サービスがあります。GitBook は `gitbook/` 内で独立し、ビルドは非公開設定やプロトコルのネットワークデータを読みません。

> ここで説明するバージョンは `redesign/tide-lp-autowalls-vault` ブランチにあります。

## ディレクトリ

| ディレクトリ | 役割 |
| --- | --- |
| `contracts/src` | トークン、フック、ライブラリ、インターフェース、周辺コントラクト |
| `contracts/test` | 旧 API を使う過去の Foundry テスト。新バージョンのテストは `test/redesign` |
| `contracts/audit` | 補助検証ハーネス・検証実行 |
| `contracts/script` | Foundry のデプロイスクリプトと、ローカルノードで再実行できるシナリオ |
| `contracts/scripts` | ABI 出力、検査、デプロイ手順 |
| `contracts/deployments` | 公開版マニフェストと履歴 |
| `dapp/src/chain` | 設定、ABI、読取り、見積もり、取引 |
| `dapp/src/pages` | Swap、Proof、Staking、ロードマップ、V2 モジュール |
| `services/shared` | 共有設定、クライアント、ABI、実行追跡 |
| `services/keeper` | 旧メンテナンス用のサービス。新バージョンでは用途なし |
| `services/floor-bot` | イベント読取りと投稿準備 |
| `audit/reports` | 日付・改訂に紐付く報告と証拠 |
| `gitbook/docs` | 本文書のフランス語原稿 |

## 中核コントラクト

| 構成要素 | 役割 |
| --- | --- |
| `CubitToken` | 2,100万を一度だけ発行する ERC-20。バーンはフックのみ |
| `CubitHook` | 税、流動性バンド、買い壁の配置と空にする処理、チーム会計、V2 接続 |
| `BandLib` | 価格、換算と tick 丸め、買い壁の目標 |
| `WallLib` | tick ごとの買い壁：永続 ID、有効買い壁の索引、資金供給と通過された買い壁を空にする処理 |
| `PoolManager` v4 | プール状態、流動性ポジション、スワップ、決済 |

フックは CUBIT プールの唯一の流動性提供者であり、それ以外の流動性追加はすべて拒否されます。資金はポジションと PoolManager の ERC-6909 claims で追跡するため、フックアドレスのネイティブ ETH 残高だけでは準備金を測れません。

バンドは `BAND_SALT` で識別される単一のポジションです。各買い壁は独自の salt のもとで `tickSpacing` 1 区画を占めます。`WallLib` はフックのストレージで動作し、claims とポジションはフックに帰属したままです。

## 周辺コントラクト

| 構成要素 | 役割 |
| --- | --- |
| `CubitRouter` | exact-input/output スワップ、スリッページ制限、期限、決済、各売却後の吸収 CUBIT の送付 |
| `CubitLens` | 派生ビュー：市場、バンド、買い壁、会計、流通供給量、保有 CUBIT、最良の買い壁 |
| `CubitV2` | 安定したモジュールレジストリ、改訂、Vault の履歴 |
| `CubitVault` | CUBIT 預入れ、24 時間ロック、準備金から支払われる CUBIT 報酬 |
| `CubitGovernanceVault` | ローンチパッドのガバナンス Vault：ETH のローンチ手数料と子市場の買い壁のトークン。預入れごとに 30 日間、延長があればその分もロック。請求と延長は恒久的にデプロイヤーのみ |
| `CubitForge` | ローンチ後に追加される、独立子市場の公開ローンチパッド。0.005 ETH のローンチ手数料は、構築時にアドレスが固定されたガバナンス Vault に支払われる |
| `CubitLaunch` | 一つのトランザクションでのローンチ：供給量の 80 % をバンドへ、20 % を Vault の準備金へ入れ、デプロイヤーの購入まで実行 |

チームアドレスはレジストリで Router、Lens、Vault、Forge をいつでも遅延なく交換してから有効化でき、これらの権限は恒久的です。交換のたびに、該当する機能は再び有効化されるまで無効になります。トークン、フック、プール識別子、レジストリアンカーはこの交換の仕組みの対象外で、フックには管理者がいません。誰もスワップや買い壁の仕組みを一時停止できません。

## 読取りの経路

```text
画面またはサービス
    → 公開マニフェスト：ネットワーク、中核、レジストリ
    → 指定ブロックのレジストリ：モジュール + 改訂
    → モジュール接続の検証
    → 同ブロックの Lens と hook ビュー
    → 操作の表示または模擬実行
```

画面では `releases.ts` がモジュールを解決し、`vault.ts` が旧 Vault 読取りを維持します。RPC 無応答で署名を許可してはいけません。dapp のデータ層は稼働中のバージョンの ABI を読んでいます。

## スワップの経路

画面は見積もりを取得してから模擬実行します。ルーターが PoolManager の決済コンテキストを開き、フックが ETH 部分に税を適用し、スワップはバンドの曲線と通過する買い壁に従います。その後、ルーターが delta を決済します。

売却のたびに、フックは `afterSwap` の中で完全に通過された買い壁を空にし、次に待機中の ETH を売却後の価格で計算した目標の買い壁に配置します。ローンチ価格以下のようにその目標が市場より下にない場合は、現在価格の 1 % 下に配置します。売却の最後に CUBIT ルーターが `deliverAbsorbed()` を呼び出し、吸収された CUBIT を Vault の準備金へ送ります。この送付が失敗しても売却は妨げられません。

境界が重要です。ルーター callback は想定操作中に PoolManager のみアクセスでき、payer は認証済みのルーター呼び出し元から得ます。

## 新バージョンで変わったこと

バンドがラダーに代わり、`rebalance`、`raiseFloor`、sweep、報奨金は削除されました。買い壁は売却の処理中に配置され空にされ、通過された買い壁の CUBIT はバーンされずに Vault の準備金に移ります。

過去のテストスイート `contracts/test` は旧 API を使っており、新バージョンではコンパイルできません。新バージョンのテストは `test/redesign` にあります。今後のステップは[ロードマップ](../roadmap.md)に、テスト済みの構成要素は[バージョンの状況](../securite/etat.md)に記載しています。

<p class="source-note">出典：記載したリポジトリ内ファイル、特に <code>CubitHook</code>, <code>BandLib</code>, <code>WallLib.Book</code>, <code>periphery/CubitRouter.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>releases.ts</code>, <code>contracts/docs/REDESIGN_HANDOFF.md</code> と各サービスの README。</p>
