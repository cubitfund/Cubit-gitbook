---
description: "売却が届いた買い壁はどうなるか：一部消費ならその場にとどまり、完全に通過されれば空にされ、その CUBIT はバーンされずに Vault の報酬準備金へ移ります。"
section: "01 / 理解する"
reading: "読了 4 分"
search:
  keywords: [吸収, 通過, 完全に通過, 一部消費, 準備金, 報酬準備金, vault, 報酬, burn, バーン, 破棄, ガバナンス, deliverAbsorbed]
---

# 通過された買い壁と Vault の準備金

売却が買い壁に達すると、その買い壁の ETH が CUBIT を買い戻します。新バージョンでは、これらの CUBIT は**バーンされなくなります**。完全に通過された買い壁の CUBIT は **Vault の報酬準備金**に移ります。

## 一部消費か、完全に通過か

| 買い壁の状態 | 起こること |
| --- | --- |
| 未到達 | 買い壁は自身の tick で ETH だけを保有する |
| 一部消費 | ETH の一部が CUBIT を買い戻した。買い壁はその場にとどまる |
| 一部消費の後に価格が回復 | 買い壁は CUBIT を売り戻し、ETH を回復する |
| 完全に通過 | 買い壁には CUBIT しか残らない。通過した売却がそれを空にし、その CUBIT は送付を待ち、残りの ETH は `pendingFloorEth` に戻る |

買い壁が空にされるのは、**完全に通過された**ときだけです。一部消費にとどまる間はフックは手を触れず、買い壁は自身の tick で通常の LP ポジションとして機能し続けます。一つの売却は、完全に通過したすべての買い壁を、近いものから遠いものへ順に空にします。

## CUBIT の経路

```text
売却が買い壁を完全に通過する
    → 売却が買い壁を空にする
    → その CUBIT は pendingAbsorbedTokens で待機する
    → deliverAbsorbed() がそれを Vault の報酬準備金に送る
```

CUBIT ルーターは各売却の最後に、同じトランザクション内で `deliverAbsorbed()` を呼び出します。この送付が失敗しても売却は妨げられず、CUBIT はフック内に分離されたまま残ります。別のルーターを通した売却の後や送付の失敗後は、どのアカウントも `deliverAbsorbed()` を呼び出せます。その際、送付先も金額も選ぶことはできません。準備金はその後、Vault の預入者への日次報酬を支払います。[mCUBIT Vault](../v2/vault.md)。

## 供給量はもう減らない

供給量は追加発行なしの **2,100万 CUBIT** に固定されたままです。買い壁の CUBIT はもう破棄されないため、吸収が進んでも供給量は減りません。CUBIT はもはやデフレ型とは説明されません。ローンチ時にバーンされるのは、初回預入れで生じるごくわずかな丸めの端数だけです。

準備金から報酬として支払われる CUBIT は通常のトークンです。受け取った人はそれを保有、預入れ、売却できます。

## Forge の子市場

Forge で作成された子市場では、空にされた買い壁のトークンはステーキング Vault には行きません。`deliverAbsorbed()` がそれらを**ローンチパッドのガバナンス Vault** に送ります。そのアドレスは、子市場のトークンをデプロイした Forge に固定されています。各預入れはそれぞれの受領時から 30 日間ロックされ、この Vault のデプロイヤーだけが請求できます。[Momentum と Forge](../v2/momentum-forge.md)。

## 吸収が保証しないもの

売却を吸収する買い壁は ETH を使います。一部消費された買い壁が ETH を回復するのは価格がその上に戻った場合だけで、空にされた買い壁が厚みを取り戻すのは、新しい資金供給がその tick に当たった場合だけです。

旧来の strict burn の証拠はこの新しい経路を検証しません。この経路は 2026 年 9 月 22 日から Ethereum で稼働しています。[既知の限界を見る](../securite/risques.md)。

## 動きを確認する

吸収を追跡するには、フックのイベントを照合します。空にされた各買い壁については `WallAbsorbed(id, cubit, ethRemaining)`、待機に回された合計については `TokensAbsorbed(amount, pendingAbsorbedTokens)`、送付時には `AbsorbedDelivered(sink, amount)` を確認します。送付先側では Vault が `RewardReserveFunded` を発行し、Forge の子市場ではガバナンス Vault が `Deposited` を発行します。

<p class="source-note">出典：2026 年 9 月 14 日の設計上の決定、 <code>CubitHook._collectCrossedWalls</code>, <code>deliverAbsorbed</code>, <code>absorbedTokenSink</code>, <code>WallLib.collectCrossed</code>, <code>CubitRouter._finishSwap</code>, <code>CubitVault.fundRewardReserve</code> および <code>periphery/CubitGovernanceVault.sol</code>。</p>
