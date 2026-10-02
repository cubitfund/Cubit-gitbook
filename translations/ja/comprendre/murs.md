---
description: "数式が買い壁の位置を、売却が規模を決めます。売却ごとに計算される目標、例、tick に固定された買い壁。"
section: "01 / 理解する"
reading: "7 分 + 操作できる例"
search:
  keywords: [買い壁, 壁, 目標, 価格, 厚み, 容量, capacity, 戻り幅, 数式, 売却, 16200, 44200, 28200]
---

# 目標と固定買い壁

**数式が買い壁の位置を、売却が規模を決めます。** 買い壁は、現在価格より下の所定の tick に ETH で資金供給された LP ポジションです。

## 売却ごとの数式

`M` を売却後の市場の時価総額、`B` をローンチ時の基準とし、同じ単位で表します：

<div class="formula">目標 = M − (M − B) × 0.6<span class="line-break"></span>= 0.4 × M + 0.6 × B</div>

この係数は**市場と基準の差の 60 %** を戻します。したがって、基準より上に差の 40 % を残します。説明用の基準 `B = 7 000` の場合：

| 売却後の市場 | 計算 | 買い壁の目標 |
| --- | --- | --- |
| 30 000 | 30 000 − 23 000 × 0.6 | **16 200** |
| 100 000 | 100 000 − 93 000 × 0.6 | **44 200** |
| 60 000 に戻る | 60 000 − 53 000 × 0.6 | **28 200** |

以前 100 000 に達していても、3 回目の計算は **60 000** から行います。過去最高値に基づくラチェット（下方固定）はありません。目標は**売却のたびに**、その売却の後の価格で再計算されます。準備金を蓄積してからメンテナンス呼出しで配置する方式はもうありません。

## 市場の値を変える

以下の例では既存の買い壁を 16.2k と 44.2k に維持し、次の買い壁の目標を計算します。値は同じ時価総額単位を使い、説明用の基準は 7 000 です。この図は吸収量、残高、取引をシミュレートしません。

<section class="wall-lab" aria-label="学習用の目標計算機">
  <header><span>売却後の目標</span><span>固定基準：7 000</span></header>
  <div class="wall-controls">
    <label for="market-cap">売却後の市場 <output id="market-value" for="market-cap">60 000 単位</output></label>
    <input id="market-cap" type="range" min="7000" max="120000" step="1000" value="60000">
    <div class="wall-presets"><button type="button" data-market-preset="30000">30k</button><button type="button" data-market-preset="100000">100k</button><button type="button" data-market-preset="60000">60k に戻る</button></div>
  </div>
  <div class="wall-levels" aria-label="時価総額水準の比較">
    <div class="level-row"><span>既存の買い壁 A</span><div class="level-track"><i style="width:13.5%"></i></div><b>16.2k</b></div>
    <div class="level-row"><span>既存の買い壁 B</span><div class="level-track"><i style="width:36.833%"></i></div><b>44.2k</b></div>
    <div class="level-row new-target"><span>新しい目標</span><div class="level-track"><i id="lab-target-bar" style="width:23.5%"></i></div><b id="lab-target-label">28.2k</b></div>
    <div class="level-row market"><span>現在の市場</span><div class="level-track"><i id="lab-market-bar" style="width:50%"></i></div><b id="lab-market-label">60k</b></div>
  </div>
  <div class="wall-result" aria-live="polite"><span>次の買い壁の目標</span><strong id="target-value">28 200 単位</strong></div>
  <p class="lab-explanation">現在の目標に従うのは新しい資金供給だけです。既存の買い壁は自身の tick にとどまり、各水準でまだ利用可能な ETH の量は別に確認する必要があります。</p>
</section>

## tick ごとに一つの買い壁、移動なし

いったん配置されると、買い壁の ETH はその tick に紐付き続けます。市場が上昇しても下落しても、既存の買い壁が新しい目標へ移動することはありません。

- 目標が既存の買い壁の tick に当たる資金供給は、二つ目を作らずに**その買い壁を厚くします**。
- 売却は買い壁を一部消費することがあります。その場合、買い壁の ETH の一部が CUBIT を買い戻します。
- 一部消費されただけの買い壁は**その場にとどまります**。価格が戻れば、CUBIT を売り戻して ETH を回復します。
- **完全に通過された**買い壁は、通過した売却によって空にされます。その CUBIT はバーンされずに Vault の報酬準備金へ送られ、残りの ETH は待機資金に戻ります。

買い壁の識別子は永続的です。tick の索引により、売却が触れた買い壁を見つけられます。[通過された買い壁と Vault の準備金](burn.md)。

## 目標が配置可能でないとき

買い壁は 100 % ETH のポジションなので、現在価格より下になければなりません。価格がローンチ価格以下のとき、数式は市場以上の目標を返し、その目標には ETH だけで資金供給できません。

この場合、フックは資金を待機させずに、買い壁を**現在価格の 1 % 下**に tick へ丸めて配置します。そうしなければ、直前の購入で価格を吊り上げた取引によって、蓄積した資金がその吊り上げられた価格で一度に配置され、その取引が自分の CUBIT をこの買い壁に売却できてしまいます。フックは正確な目標ではなく丸めた tick で判断します。ローンチ価格の近くでは、丸めた 40/60 の目標が市場のすぐ下に残ってそのまま使われることがあり、その場合は 1 % より近くなります。

`pendingFloorEth` で待機するのは、ポジションを作るには小さすぎる金額、つまり端数と、狙った買い壁が tick あたりの流動性上限（Uniswap v4 の制限）に達したときに生じうる余剰、そして価格が tick 範囲の最上端にあり価格の下に買い壁を置く余地がない極端な場合だけです。次の売却がそれを配置します。この理由で売却そのものが拒否されることは決してありません。

## 実際に配置された ETH

フックは各売却の 12 % を含むすべての待機中の ETH を、目標に対応するポジションに配置します。その後の売却でこの ETH は消費され得るため、各買い壁の準備金は有限です。供給量全体をカバーできるまで待たずに買い壁へ資金供給できます。

## ローンチ価格から tick へ

コントラクトは CUBIT 当たりの ETH 価格で `cible = 0.4 × prix courant + 0.6 × prix de lancement` を計算します。ローンチ価格は、**デプロイ時に固定されるローンチ時 FDV** を 2,100万 CUBIT で割って求めます。新バージョンは FDV として **3.75 ETH** を採用しており、この価格はその後固定され、ドルには追従しません。

このページの単位建ての例は、同じ数式を時価総額に適用したものです。基準の 7 000 は説明用であり、採用された 3.75 ETH を換算した値ではありません。

tick は実行可能な水準を丸めます。ETH は `currency0` なので、**CUBIT 価格が高いほどプールの tick は低くなります。** 数学上の目標、実際の配置 tick、売却の手取り価格は異なる場合があります。

## 画面に表示すべき情報

画面は、現在の市場、バンド、次の目標、各有効買い壁とその厚み、そして待機中の ETH と CUBIT を区別する必要があります。「floor」一行ではオーダーブック全体を表せません。

従来の `floorPrice` は**最後に資金供給された買い壁**を示し、前の買い壁より低い場合もあります。全体で保証される最低価格と解釈してはいけません。[dapp のデータを読む](../utiliser/preuves.md)。

<p class="source-note">出典：2026 年 9 月 14 日の設計上の決定、 <code>BandLib.retracementWallTarget</code>, <code>underMarketWallTarget</code>, <code>WALL_RETRACEMENT_BPS</code>, <code>WallLib.fund</code> および <code>CubitHook._placeWall</code>。</p>
