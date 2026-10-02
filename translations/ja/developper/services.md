---
description: "イベント中継の運用：dry-run、cursor、モジュール改訂、買い壁の表現。keeper は用途がなくなりました。"
section: "04 / 開発する"
reading: "読了 4 分"
---

# サービスと運用

リポジトリには二つの Node プロセスがあります。旧モデルに属する **keeper** と、投稿を準備できる**イベント中継**です。ローカル設定はサービスが連続稼働している証拠ではありません。

## 新バージョンに keeper はない

旧 keeper は `rebalance`、`raiseFloor`、吸収トークンのバーンを呼び出していました。これらのメンテナンス関数はなくなりました。バンドは再編成されず、買い壁は売却の処理中に配置され空にされ、CUBIT ルーターが吸収された CUBIT を Vault へ送ります。

`services/keeper` サービスはリポジトリに残っていますが、もはや存在理由はなく、新バージョンに対して運用してはいけません。報奨金は支払われません。たとえば別のルーターを通した売却の後に吸収された CUBIT が待機したままなら、どのアカウントも `deliverAbsorbed()` を呼び出せます。

## イベント中継

`services/floor-bot` はイベントを読み、文章を準備し、cursor と重複除外キー `transactionHash:logIndex` を保持します。

dry-run と投稿モードは別状態です。cursor はチェーン・hook 情報を含み、対象ネットワークでは finalized ブロックを使います。再編や不整合 checkpoint は復旧前に整合させます。

中継は投稿前に `pendingPost` を永続化します。外部サービスが受理後、成功記録前に停止したら再試行前に投稿の存在を確認します。ローカル DB と SNS は同時 commit できません。

GitBook は投稿を実行しません。中継の実運用には別の設定と運用許可が必要です。

## モジュールの変化

現行 Lens はレジストリから解決します。操作中は中核識別情報と改訂コンテキストを保持します。

サービスは記載のバージョンの ABI とイベントを読み取ります。旧モデル向けの中継を、受入検証なしに新バージョンで検証済みとして示してはいけません。

## 買い壁に表現を合わせる

旧中継は `FloorRaised` イベントを通知していましたが、このイベントはもう存在しません。新バージョンでは、売却のたびに買い壁が作成されるか厚くなり（`WallFunded`）、前の買い壁より低い価格になることもあります。また、完全に通過された買い壁は空にされ（`WallAbsorbed`）、その後その CUBIT が Vault の準備金へ送られます（`AbsorbedDelivered`）。

したがって中継は、イベント名から全体の上昇を推定せず、**対象の買い壁、その水準、追加または吸収された資金**を示す必要があります。「floor は常に上がる」という旧表現はこのポリシーを説明せず、どの告知も買い壁を価格保証として示してはいけません。

## 有用な運用確認

RPC エラー、設定差異、cursor、最終処理ブロックからの経過時間、待機中の投稿を追跡します。秘密の署名データを含めずに、復旧ログと版識別情報を保持します。

プロセスを再起動する監視は、不整合な checkpoint やレジストリ変更の解決を代替しません。

<p class="source-note">出典： <code>services/floor-bot/README.md</code>, <code>services/keeper/README.md</code>, <code>services/shared</code>, <code>interfaces/ICubitHook.sol</code> および <code>contracts/docs/REDESIGN_HANDOFF.md</code>。</p>
