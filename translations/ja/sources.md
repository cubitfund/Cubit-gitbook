---
description: "読取り対象、文書の優先順位、デザインの出典、GitBook の保守方法。"
section: "05 / 検証する"
reading: "ガイドの参考資料"
search:
  keywords: [出典, 参照, 参考資料, 文書, HonKit, 仕様書, バージョン, redesign]
---

# 出典と方法

本ガイドはローカルのコードベースと、**2026 年 9 月 14 日**に確定した設計上の決定に基づいて作成しました。以下のファイルはリポジトリパスで、ネットワーク endpoint ではありません。

新バージョンは、`redesign/tide-lp-autowalls-vault` ブランチに基づいて説明しています。過去コードの参照先は、`work/v1-v2-fixed-walls` ブランチに保存されたプロトコル改訂 `991fca9`です。公開された文書は、説明するコントラクトの検証ではありません。

## 読む順序

新バージョンの基準は **`contracts/docs/REDESIGN_HANDOFF.md`** です。この文書は設計上の決定と、そのコードへの実装を記録しており、以前の文書に優先します。

税は変わりません：**購入 3 % をチーム**、**売却 15 %：12 % 買い壁、3 % チーム**です。取引用流動性は単一のバンドで、買い壁は売却ごとに配置され空にされ、採用したローンチ時 FDV は **3.75 ETH** です。

文書 **`CUBIT-cahier-des-charges/docs/VERSION_ACTUELLE.md`** は、ローンチ時の基準を 2,100万トークンに対する **FDV 7 000 USD** と表していました。新バージョンは FDV を直接 ETH で固定しており、このガイドはこの二つの基準の対応関係を定めません。

実際の動作を知るには、同じ版のコード、検証結果、デプロイを対応させる必要があります。

コードコメントは確定した決定を代替しません。逆に決定も、実装やネットワークがそれを実行している証拠ではありません。

## 確認したコード

| 出典 | ガイドでの用途 |
| --- | --- |
| `contracts/docs/REDESIGN_HANDOFF.md` | 確定した決定とコードへの実装 |
| `contracts/src/CubitToken.sol` | 固定供給量とバーン権限 |
| `contracts/src/CubitHook.sol` | 税、バンド、買い壁、会計、V2 接続 |
| `contracts/src/libraries/BandLib.sol` | 配置形状、価格、tick、買い壁の目標 |
| `contracts/src/libraries/WallLib.sol` | tick ごとの買い壁：資金供給と通過された買い壁を空にする処理 |
| `contracts/src/CubitLens.sol` とインターフェース | 価格、バンド、買い壁、残高、流通供給量、保有 CUBIT、最良の買い壁 |
| `contracts/src/periphery/CubitRouter.sol` | スワップ、制限、承認、吸収 CUBIT の送付 |
| `contracts/src/periphery/CubitV2.sol` | モジュール識別・交換 |
| `contracts/src/periphery/CubitVault.sol` | ロック、日次報酬、準備金 |
| `contracts/src/periphery/CubitGovernanceVault.sol` | 30 日間ロックされる預入れとデプロイヤーによる請求 |
| `contracts/src/periphery/CubitForge.sol` | 公開ローンチパッド、子の独立性、ガバナンス Vault のアドレス |
| `contracts/src/periphery/CubitLaunch.sol` | 一つのトランザクションでのローンチ：バンド、Vault の準備金、デプロイヤーの購入 |
| `dapp/src/chain` | 探索、見積もり、署名状態、旧 Vault |
| `dapp/src/pages/Momentum.tsx` | 読取り専用の Momentum ページ：有効、一部消費、通過された買い壁 |
| `services/` とその README | イベント中継と旧 keeper |
| `contracts/foundry.toml` と package manifest | コマンドとビルド設定 |

## 過去の報告と文書

旧バージョンの参照報告は `audit/reports/2026-09-10-v1-v2/BILAN_FINAL_FR.md` です。ラダー、keeper によるメンテナンス、買い壁のバーンを説明しており、これらは新バージョンで置き換えられました。

`roadmapdev.md` と過去仕様書は V1/V2 の意図・節目の理解に使いました。原文は `CUBIT-cahier-des-charges/historique/2026-09-10-avant-murs-fixes/` に保存されています。単一単調買い壁、E/C 配置、ラダー、keeper、管理権の全面消滅に関する記述は、新バージョンのルールではありません。

`contracts/docs/STRICT_BURN.md` は、新バージョンで廃止された吸収トークンのバーンの変遷を説明します。`contracts/docs/MODULE_SETTERS.md` は周辺部品の交換を説明します。旧テスト件数を新バージョンの検証結果として示すことはありません。

dapp の旧ロードマップページは日付付きの編集上の目安であり、新バージョンとの連携にその内容だけを使ってはいけません。

## アートディレクション

テーマは既存 dapp のデザインを反映しています：

| 視覚出典 | 採用要素 |
| --- | --- |
| `dapp/src/index.css` | クリーム `#f5f1e8`、インク `#111312`、紫 `#5b4bff`、ライム `#c7ff3d`、橙 `#ff704d`、紙 `#ede7d8` |
| `dapp/src/index.css` | 太く幅広の Archivo 見出し、Martian Mono ラベル、控えめな質感 |
| `dapp/src/components/primitives.tsx` | 明確な枠線、ずれた影、パネル、状態 |
| `dapp/src/components/Header.tsx` | 文字ロゴ、紫の四角、ナビ、状態の区別 |
| `dapp/src/ui.tsx` | 星形のアクセント、等幅ラベル |

ビルド時にフォントをライセンスと共にローカルへコピーします。ガイドは dapp の視覚表現を使い、古くなった標語は引き継ぎません。

## ドキュメント

エンジンは Markdown から本・文書を作る GitBook fork の **HonKit 6.2.2** です。目次、静的生成、検索、ページ移動は本体が提供し、CUBIT テーマがテンプレートとスタイルを拡張します。[HonKit 公式文書](https://honkit.netlify.app/)。

ローカル導入と `serve` / `build` は[公式開始文書](https://honkit.netlify.app/setup.html)に従います。[書籍設定](https://honkit.netlify.app/config.html)は内容ルートやスタイルを説明し、6.2.2 リリースが使用版を特定します。

`gitbook/` 直下の README は導入、コマンド、ブラウザー確認、ツールの限界を説明します。このサイトの検証は本を検査し、プロトコルのコントラクトは検証しません。

## ガイドの保守

新版では版の状況と規範参照を先に更新し、ルール、API、実接続の手順を同期します。旧結果が最終ソース対象でなければ過去との表記を保ちます。

`docs/` にページを加え、`SUMMARY.md` に登録して再ビルドします。出典は明示的に選び、非公開設定、鍵、認証 RPC、取引 dump はサイトに含めません。
