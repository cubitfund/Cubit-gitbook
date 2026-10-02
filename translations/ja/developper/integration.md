---
description: "プール識別子、交換可能モジュール、流動性バンド、買い壁と吸収 CUBIT の送付、Vault、削除された関数、単位、連携イベント。"
section: "04 / 開発する"
reading: "読了 10 分"
search:
  keywords: [API, ABI, 連携, 統合, コントラクト, address, band, バンド, BAND_SALT, MIN_POOL_SUPPLY, bandEth, bandTokens, walls, WallLib, wallCount, deliverAbsorbed, pendingAbsorbedTokens]
---

# コントラクトと連携

連携では**チェーン、プール中核、ABI、モジュール改訂**を特定します。旧報告からコピーしたルーターアドレスは交換されている可能性があり、新しい ABI は過去のプールと互換性がない場合があります。

> 以下の ABI は新バージョンのコードのものです。クライアントを接続する前に、検証済みリリースの ABI を出力し runtime を確認してください。

## プールの識別

`PoolKey` は `currency0`、`currency1`、`fee`、`tickSpacing`、`hooks` を含みます。CUBIT ではネイティブ ETH が `currency0`、CUBIT が `currency1` です。

| フィールド | 想定値 |
| --- | --- |
| `currency0` | ネイティブ ETH を表すゼロアドレス |
| `currency1` | 特定したデプロイのトークン |
| `fee` | 稼働中のバージョンでは `100`、すなわち 0.01 % |
| `tickSpacing` | 確認ソースでは `10` |
| `hooks` | 特定したデプロイの hook |

poolId は key 全体に依存します。画面の `fee` だけ変えても旧プールは新デプロイにはなりません。

## 同じブロックでモジュールを解決

まず `hook.v2()` に固定されたレジストリを読み、同ブロックで利用可能モジュールのアドレスと `moduleRevision` を解決し、中核への接続を検証します。

以下は**読取り専用**の断片で、設定済み viem クライアントと確認済みレジストリアドレスを使用します：

```ts
import { parseAbi, type Address, type PublicClient } from "viem";

const registryAbi = parseAbi([
  "function router() view returns (address)",
  "function moduleRevision() view returns (uint256)",
]);

export async function readRelease(
  client: PublicClient,
  registry: Address,
) {
  const blockNumber = await client.getBlockNumber();
  const [router, revision] = await Promise.all([
    client.readContract({ address: registry, abi: registryAbi,
      functionName: "router", blockNumber }),
    client.readContract({ address: registry, abi: registryAbi,
      functionName: "moduleRevision", blockNumber }),
  ]);
  return { blockNumber, router, revision };
}
```

この断片だけでは全接続を検証せず、署名も許可しません。リポジトリ画面は `resolveRelease`、`readRelease`、`assertCurrentDeployment` で確認します。

署名前にモジュールと改訂を利用者の確認済み状態と比較します。承認先を無断で切り替えてはいけません。

## バンドを読む

| 要素 | 結果 / 用途 |
| --- | --- |
| `band()` | 単一の取引用ポジションの `(int24 lower, int24 upper, uint128 liquidity)` |
| `MIN_POOL_SUPPLY()` | 初期化時に受け付ける最低預入額：供給量の 80 % |
| `BAND_SALT()` | バンドポジションの salt、`keccak256("CUBIT.BAND")` |
| `BandBootstrapped(lower, upper, liquidity, tokens)` | プール初期化時に一度だけ発行されるイベント |
| Lens `bandEth()` / `bandTokens()` | 現在価格でバンドが保有する ETH と CUBIT（LP 手数料を除く） |

`lower` は間隔 10 の `minUsableTick`、すなわち −887 270 です。`upper` はプールの開始 tick を間隔に合わせて切り下げた値で、ローンチ時 FDV が 3.75 ETH なら 155 390 です。切り上げるとポジションがアクティブになり、ETH が必要になります。

フックは**預入れの全額**をバンドに入れます。`afterInitialize` は `MIN_POOL_SUPPLY` 未満の預入れを `SupplyNotDeposited` で拒否します。親のローンチはちょうどこの最低額を預け入れ、Forge の子市場は供給量の全額を預け入れます。丸めによる端数はバーンされるため、初期化後のフックは CUBIT トークンそのものも CUBIT の claim も保持しません。

Lens の snapshot は、ラダーと keeper の旧フィールドを `bandEth` と `bandTokens` に置き換えます。これらの値はポジションの元本を対象とし、バンドに蓄積された LP 手数料は回収も計上もされません。

## 複数の買い壁を読む

| フックのビュー | 結果 / 用途 |
| --- | --- |
| `wallCount()` | 過去 ID 数。有効ポジション数とは異なる |
| `activeWallCount()` | 読取り状態の有効買い壁数 |
| `activeWallId(index)` | 現在の有効一覧 index にある永続 ID |
| `latestWallId()` | 最後に資金供給された買い壁の ID。先に買い壁の存在を確認 |
| `walls(id)` | `(int24 lower, uint128 liquidity, uint256 idleEth, uint256 fundedEth)` |
| `wallIdleEth()` | 買い壁に帰属する ETH 残余の合計 |

売却が買い壁を作成し、厚くし、空にします。空にされた買い壁は有効一覧から外れますが、識別子と tick は保持します。

吸収後は有効一覧の index が変わり得ます。**走査 index ではなく買い壁 ID を識別子にします。** count と要素は同じブロックで読みます。

`fundedEth` はその tick に実際に配置された資金の累計で、残りの厚みとして表示してはいけません。`idleEth` は配置済み流動性とは別の、その買い壁に紐付く残余です。買い壁の上端は `lower + tickSpacing` です。配置できなかった買い壁の資金は `pendingFloorEth` に分離されたままです。

Lens の従来フィールド `floorPrice` と `netFloorPrice` は最後に資金供給された買い壁を示し、すべての水準を要約するものではありません。市場に最も近い有効な買い壁については、`bestWallPrice` と `netBestWallPrice` を読みます。

## 通過された買い壁と CUBIT の送付

exact-input でも exact-output でも、売却のたびに `afterSwap` は `_collectCrossedWalls()` を呼び、次に `_placeWall()` を呼びます。価格が完全に通過したすべての買い壁が、近いものから遠いものへ順に空にされます。その CUBIT は `pendingAbsorbedTokens` に加算され、残りの ETH（実現した手数料と端数）は `pendingFloorEth` に戻ります。その後 `_placeWall()` は、すべての待機中の ETH を売却後の価格で計算した目標に配置します。ローンチ価格以下のように目標がプールの tick より厳密に上にない場合は、`BandLib.underMarketWallTarget` で買い壁を現在価格の 1 % 下に配置します。`pendingFloorEth` に残るのは、ポジションを作るには小さすぎる金額と、価格が tick 範囲の最上端にあり価格の下に買い壁を置く余地がない極端な場合だけです。

| 要素 | 結果 / 用途 |
| --- | --- |
| `pendingAbsorbedTokens()` | 通過された買い壁の CUBIT。送付されるまで PoolManager の claims としてフック内に分離して保持 |
| `deliverAbsorbed()` | これらの CUBIT を `absorbedTokenSink()` へ送る、公開かつ許可不要の呼出し。呼び出し元は送付先も金額も選べない |
| `absorbedTokenSink()` | CUBIT ではレジストリの Vault。Forge の子市場では、そのトークンをデプロイした Forge の `governanceVault()` |
| `WallFunded(id, lower, addedEth, liquidity)` | 目標 tick で作成された、または厚くなった買い壁 |
| `WallAbsorbed(id, cubit, ethRemaining)` | 完全に通過され、空にされた買い壁 |
| `TokensAbsorbed(amount, pendingAbsorbedTokens)` | 売却によって送付待ちになった CUBIT |
| `AbsorbedDelivered(sink, amount)` | 行き先へ送られた CUBIT |

CUBIT では、`deliverAbsorbed()` は Vault の `fundRewardReserve` を呼び出します。レジストリを持たない Forge の子市場では、トークンをガバナンス Vault に送金してから `lockUntracked` を呼び出します。CUBIT ルーターは各売却の後に try/catch の中でこれを呼び出します。送付が失敗しても売却が妨げられることは決してなく、誰でも送付を再実行できます。Lens は `snapshot()` で買い壁を合計しなくなりました。`wallAmountsPage(start, count)` が買い壁の一区間の ETH と CUBIT を返し、送付待ちの CUBIT は `pendingAbsorbedTokens` フィールドによってページの合計に一度だけ加算されます。

通過される買い壁 1 つにつき約 185 000 gas かかります。EIP-7825 が定める 1 トランザクションあたり 16 777 216 gas の上限により、1 回の売却で通過できる買い壁は最大で約 88 です。それを超えると売却は損失なしに失敗するため、分割する必要があります。

## 削除された関数

新バージョンはラダー、メンテナンス、WETH フロー、Forge による買い壁への資金供給の API を削除し、吸収トークンの API の名前を変更します。これらの要素をまだ呼び出すクライアントは旧バージョンを対象としています。

| コントラクト | 削除された要素 |
| --- | --- |
| フック、関数 | `rebalance()`, `raiseFloor()`, `previewRaiseFloor()`, `canRebalance()`, `referenceTick()`, `lastRebalanceTick()`, `lastRebalanceBlock()`, `reserveTokens()`, `ladderIdleEth()`, `asks(i)`, `bid()`, `vaultAccrued()`, `claimVault()`, `fundFloor()` |
| フック、名前が変更された関数 | `burnAbsorbed()` は `deliverAbsorbed()` に、`pendingBurnTokens()` は `pendingAbsorbedTokens()` になった |
| フック、定数 | `PHI_BPS`, `SWEEP_BPS`, `REBALANCE_THRESHOLD`, `REBALANCE_COOLDOWN`, `KEEPER_BOUNTY_BPS`, `KEEPER_BOUNTY_CAP`, `BOUNTY_RESERVE_TARGET`, `BOUNTY_RESERVE_BPS` |
| フック、イベントとエラー | `Rebalanced`, `SweepExecuted`, `BountyPaid`, `LadderBootstrapped`, `VaultFeesAccrued`, `FloorRaised`, `FloorFunded`, `ThresholdNotMet`, `CooldownActive`, `NothingToRaise`, `WallLimitReached`, `ProtocolFeeActive`, `WallRangeNotEmpty`, `NotInitialized` |
| Lens、関数 | `canRebalance()`, `canRaiseFloor()`, `previewRaiseFloor()`, `cushionEth()`, `ladderTokens()` |
| Lens、snapshot のフィールド | `cushionEth`, `ladderTokens`, `reserveTokens`, `ladderIdleEth`, `lastRebalanceTick`, `lastRebalanceBlock`, `canRebalance`, `movedTicks`, `blocksRemaining`, `canRaiseFloor`, `raiseReason`, `referenceTick` |
| Vault | `weth()`, `earned()`, `claim()`, `fundRewards()`, `rewardPerToken()`, `RewardsFunded`, `RewardPaid` |
| レジストリ | `weth()` |

内部では、`_fundWall` と `_planRaise` がなくなり、`_collectCrossedWalls` と `_placeWall` に置き換わりました。Vault の報酬は CUBIT のみで `claimCubit()` で請求し、デプロイスクリプトは `WETH` 変数をもう使いません。

## Vault とガバナンス Vault

| コントラクト | 有用な関数 |
| --- | --- |
| `CubitVault` | `stake(amount)`, `withdraw(amount)`, `pendingCubit(user)`, `claimCubit()`, `fundRewardReserve(amount)`, `rewardReserve()`, `balanceOf(user)`, `unlockAt(user)` |
| `CubitGovernanceVault` | `deposit(token, amount)`, `depositEth()`, `lockUntracked(token)`, `claimable(token)`, `locked(token)`, `lockExtension()`、およびデプロイヤー専用でこの権利を譲渡できない `claim(token, maxTranches)` と `extendLock(extra)` |
| `CubitForge` | 正確な手数料で誰でも呼べる `launch(name, symbol, team, tokenSalt, hookSalt, creationCode)`。`launchFee()` は 0.005 ETH で不変。salt はローンチするアカウントに結び付く。`governanceVault()` はアドレスが構築時に固定され、`depositEth()` でローンチ手数料を受け取る |

Vault 側では `DAILY_REWARD_BPS` が 300、`REWARD_PERIOD` が 1 日です。`pendingCubit` は 24 時間にわたり比例して増えた後は上限で止まり、`rewardReserve` を超えることはありません。ガバナンス Vault 側では、各預入れの `LOCK_DURATION` が 30 日で、ETH はキー `ETH()`（ゼロアドレス）で記帳されます。`extendLock(extra)` は現在と将来のすべての預入れのロックに `extra` 秒を加え、`lockExtension()` は増えるだけです。

Lens は、登録済みのすべての Vault（現行のものと退役したものの両方）の報酬準備金の合計である `rewardReserve()` も公開します。2026 年 9 月 19 日の Lens 入れ替え以降、買い壁の合計と供給量はオンチェーンで計算されなくなりました。`wallEth()`、`wallTokens()`、`circulatingSupply()`、`heldSupply()` の各ゲッターと同名の snapshot フィールドは削除され、代わりに snapshot が `totalSupply`、`activeWallCount`、`pendingAbsorbedTokens` を返します。呼び出し側がすべてのページを同じブロックで読み、自分で数値を導きます。`wallTokens` は各ページの CUBIT の合計に `pendingAbsorbedTokens` を加えた値、次に `circulatingSupply = totalSupply − wallTokens − rewardReserve`、`heldSupply = circulatingSupply − bandTokens` で、いずれの減算もゼロで止まります。ステークされた CUBIT は流通供給量に含まれたままです。`bestWallPrice()` と `netBestWallPrice()` は、フックの `nearestWallTick()` で読んだ市場に最も近い有効な買い壁の総額価格と純価格を返し、買い壁がなければゼロです。snapshot は `blockNumber`、`bestWallPrice`、`netBestWallPrice` で終わります。

## 単位と方向

CUBIT と ETH は小数 18 桁です。Lens 派生価格は **1e18 スケールの CUBIT 当たり ETH**です。v4 tick は ETH 当たり CUBIT の向きなので、CUBIT の ETH 価格が上がると下がります。

整形前の金額・計算は整数 `bigint` を使います。早い `Number` 変換は精度を失う場合があります。ローンチ時 FDV はデプロイ時に `LAUNCH_ETH()` で固定され、新バージョンでは 2,100万 CUBIT に対して 3.75 ETH を採用しています。USD、wei、トークン単位を混ぜないでください。

## ルーターのメソッド

```text
swapExactIn(
    PoolKey key, bool zeroForOne,
    uint256 amountIn, uint256 amountOutMin,
    address recipient, uint256 deadline
)

swapExactOut(
    PoolKey key, bool zeroForOne,
    uint256 amountOut, uint256 amountInMax,
    address recipient, uint256 deadline
)
```

`zeroForOne = true` は ETH で CUBIT を買います。exact-input は value に `amountIn`、exact-output 購入は `amountInMax` を渡して余剰返金を受けます。売却は `zeroForOne = false`、value ゼロ、ルーターへの CUBIT 承認を使います。

戻り額はルーターの手取り・総額区分に従い、exact-input は手取り出力、exact-output は総入力です。不完全約定を検査し、正しいプール key と版で模擬見積もりが必要です。売却の後、送付待ちの吸収 CUBIT が残っていれば、ルーターは `deliverAbsorbed()` も呼び出します。

## イベントとエラー

フックのイベントには `BuyTaxed`、`SellTaxed`、`BandBootstrapped`、`TeamPaid`、買い壁用の `WallFunded`、`WallAbsorbed`、`TokensAbsorbed`、`AbsorbedDelivered` があります。`ModuleUpdated` でモジュールの交換を追跡できます。

Vault 側では `Staked`、`Withdrawn`、`RewardReserveFunded`、`CubitRewardClaimed` を、ガバナンス Vault では `Deposited`、`Claimed`、`LockExtended` を追跡します。

`WallLib` のログはフックのコンテキストで発行されます。フックのアドレスと対応する ABI シグネチャで索引化してください。旧イベント `FloorRaised` はもう存在しません。

ルーターでは特に `Expired`、`WrongPool`、`TooLittleReceived`、`TooMuchRequested`、`InsufficientOutput`、`IncompleteInput` を処理します。フック側では、`ExternalLiquidityForbidden` が第三者の流動性をすべて拒否し、`SupplyNotDeposited` が不十分なローンチ預入れを拒否します。検証済みリリースのコードと ABI を読み直してください。

<p class="source-note">出典： <code>interfaces/ICubitHook.sol</code>, <code>interfaces/ICubitLens.sol</code>, <code>CubitHook.sol</code>, <code>WallLib.sol</code>, <code>CubitRouter.sol</code>, <code>periphery/CubitVault.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>periphery/CubitForge.sol</code>、およびコミット <code>4aa063ac</code> を含む新バージョンの Git 履歴。</p>
