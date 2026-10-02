---
description: "Định danh pool, mô-đun thay được, dải thanh khoản, tường và việc chuyển CUBIT đã hấp thụ, các vault, hàm đã loại bỏ, đơn vị và sự kiện tích hợp."
section: "04 / XÂY DỰNG"
reading: "ĐỌC TRONG 10 PHÚT"
search:
  keywords: [API, ABI, tích hợp, kết nối, hợp đồng, address, band, BAND_SALT, MIN_POOL_SUPPLY, bandEth, bandTokens, walls, WallLib, wallCount, deliverAbsorbed, pendingAbsorbedTokens]
---

# Hợp đồng và tích hợp

Tích hợp phải xác định **chain, lõi pool, ABI và bản sửa đổi mô-đun**. Router từ báo cáo cũ có thể đã bị thay; ABI mới có thể không tương thích với pool lịch sử.

> ABI dưới đây là ABI của mã phiên bản mới. Xuất ABI của bản phát hành đã xác thực và kiểm tra runtime trước khi nối client.

## Định danh pool

`PoolKey` gồm `currency0`, `currency1`, `fee`, `tickSpacing` và `hooks`. Với CUBIT, ETH gốc là `currency0`, token CUBIT là `currency1`.

| Trường | Giá trị mong đợi |
| --- | --- |
| `currency0` | Địa chỉ không, đại diện ETH gốc |
| `currency1` | Token của bản triển khai được xác định |
| `fee` | `100` ở phiên bản đang vận hành, tức 0,01 % |
| `tickSpacing` | `10` trong mã đã đọc |
| `hooks` | Hook của bản triển khai được xác định |

PoolId phụ thuộc toàn bộ key. Chỉ thay `fee` ở frontend không biến pool cũ thành bản triển khai mới.

## Phân giải mô-đun tại cùng block

Đọc sổ đăng ký neo trong `hook.v2()` trước. Sau đó phân giải địa chỉ mô-đun khả dụng và `moduleRevision` tại cùng block. Kiểm tra kết nối với lõi.

Đoạn sau **chỉ đọc**, dùng với client viem đã cấu hình và địa chỉ sổ đăng ký đã xác minh:

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

Đoạn này không tự kiểm tra mọi kết nối và không cho phép ký. Frontend kho mã kiểm tra chúng trong `resolveRelease`, `readRelease` và `assertCurrentDeployment`.

Trước mỗi chữ ký, so mô-đun và bản sửa đổi với ngữ cảnh người dùng đã xem. Không âm thầm chuyển hướng phê duyệt.

## Đọc dải thanh khoản

| Thành phần | Kết quả / cách dùng |
| --- | --- |
| `band()` | `(int24 lower, int24 upper, uint128 liquidity)` của vị thế giao dịch duy nhất |
| `MIN_POOL_SUPPLY()` | Khoản gửi tối thiểu được chấp nhận khi khởi tạo: 80 % nguồn cung |
| `BAND_SALT()` | Salt của vị thế dải thanh khoản, `keccak256("CUBIT.BAND")` |
| `BandBootstrapped(lower, upper, liquidity, tokens)` | Sự kiện chỉ phát một lần, khi khởi tạo pool |
| Lens `bandEth()` / `bandTokens()` | ETH và CUBIT mà dải nắm giữ theo giá hiện tại, không tính phí LP |

`lower` bằng `minUsableTick` với spacing 10, tức −887 270. `upper` là tick mở pool làm tròn xuống theo spacing: với FDV khởi chạy 3,75 ETH, giá trị là 155 390. Làm tròn lên sẽ khiến vị thế hoạt động và cần ETH.

Hook đặt **toàn bộ khoản gửi** vào dải. `afterInitialize` từ chối khoản gửi thấp hơn `MIN_POOL_SUPPLY` bằng `SupplyNotDeposited`: lần khởi chạy thị trường mẹ gửi đúng mức tối thiểu này, thị trường con Forge gửi toàn bộ nguồn cung. Phần dư nhỏ do làm tròn bị burn, nên sau khởi tạo hook không giữ token thô hay claim CUBIT nào.

Snapshot của Lens thay các trường cũ của ladder và keeper bằng `bandEth` và `bandTokens`. Các giá trị này tính trên vốn gốc của vị thế: phí LP tích lũy trong dải không được thu cũng không được tính.

## Đọc nhiều tường

| View của hook | Kết quả / cách dùng |
| --- | --- |
| `wallCount()` | Số định danh lịch sử, khác số vị thế hoạt động |
| `activeWallCount()` | Số tường hoạt động trong trạng thái đọc |
| `activeWallId(index)` | ID vĩnh viễn tại chỉ số trong danh sách hoạt động hiện tại |
| `latestWallId()` | ID tường cấp vốn gần nhất; kiểm tra có tường trước |
| `walls(id)` | `(int24 lower, uint128 liquidity, uint256 idleEth, uint256 fundedEth)` |
| `wallIdleEth()` | Tổng ETH dư thuộc các tường |

Các lệnh bán tạo, làm dày và làm trống tường. Tường được làm trống rời khỏi danh sách hoạt động nhưng vẫn giữ định danh và tick của nó.

Chỉ số danh sách hoạt động có thể đổi sau hấp thụ. **Giữ ID tường làm định danh**, không dùng chỉ số duyệt. Đọc count và phần tử tại cùng block.

`fundedEth` là tổng vốn thực sự đã đặt tại tick đó; không được hiển thị như độ sâu còn lại. `idleEth` là phần dư gắn với tường, khác thanh khoản đã triển khai của nó. Biên trên của tường là `lower + tickSpacing`. Vốn dành cho tường mà chưa thể đặt vẫn được giữ riêng trong `pendingFloorEth`.

Các trường lịch sử `floorPrice` và `netFloorPrice` của Lens mô tả tường được cấp vốn gần nhất; chúng không tóm tắt mọi mức. Với tường đang hoạt động gần thị trường nhất, hãy đọc `bestWallPrice` và `netBestWallPrice`.

## Tường bị đi qua và việc chuyển CUBIT

Ở mỗi lệnh bán, với đầu vào chính xác cũng như đầu ra chính xác, `afterSwap` gọi `_collectCrossedWalls()` rồi `_placeWall()`. Mọi tường mà giá đã đi qua hoàn toàn đều được làm trống, từ gần nhất đến xa nhất: CUBIT của chúng được cộng vào `pendingAbsorbedTokens` và ETH còn lại, gồm phí đã thu và phần dư nhỏ, trở về `pendingFloorEth`. Sau đó `_placeWall()` đặt toàn bộ ETH đang chờ tại mục tiêu tính trên giá sau lệnh bán. Nếu mục tiêu đó không nằm hẳn trên tick của pool, điều xảy ra khi giá bằng hoặc thấp hơn giá khởi chạy, hàm này đặt tường thấp hơn giá hiện tại 1 % bằng `BandLib.underMarketWallTarget`. Chỉ số tiền quá nhỏ để tạo vị thế và trường hợp cực đoan khi giá ở tận đỉnh dải tick, nơi không còn chỗ đặt tường nào dưới giá, mới nằm lại trong `pendingFloorEth`.

| Thành phần | Kết quả / cách dùng |
| --- | --- |
| `pendingAbsorbedTokens()` | CUBIT từ các tường bị đi qua, được giữ riêng trong hook dưới dạng claim của PoolManager cho đến khi được chuyển đi |
| `deliverAbsorbed()` | Chuyển số CUBIT này đến `absorbedTokenSink()`, công khai và không cần quyền; người gọi không chọn được người nhận hay số tiền |
| `absorbedTokenSink()` | Vault của sổ đăng ký đối với CUBIT; với thị trường con Forge, là `governanceVault()` của Forge đã triển khai token của thị trường con |
| `WallFunded(id, lower, addedEth, liquidity)` | Tường được tạo hoặc làm dày tại tick mục tiêu |
| `WallAbsorbed(id, cubit, ethRemaining)` | Tường bị đi qua hoàn toàn và được làm trống |
| `TokensAbsorbed(amount, pendingAbsorbedTokens)` | CUBIT được một lệnh bán đưa vào trạng thái chờ chuyển |
| `AbsorbedDelivered(sink, amount)` | CUBIT đã được chuyển đến đích |

Với CUBIT, `deliverAbsorbed()` gọi `fundRewardReserve` của vault. Với thị trường con Forge, vốn không có sổ đăng ký, hàm này chuyển token vào vault quản trị rồi gọi `lockUntracked`. Router CUBIT gọi hàm này sau mỗi lệnh bán trong một try/catch: lần chuyển thất bại không bao giờ chặn lệnh bán, và bất kỳ ai cũng có thể thực hiện lại việc chuyển. Lens không còn cộng tổng các tường trong `snapshot()`: `wallAmountsPage(start, count)` trả về ETH và CUBIT của một đoạn tường, còn CUBIT đang chờ chuyển được cộng đúng một lần vào tổng các trang, qua trường `pendingAbsorbedTokens`.

Mỗi tường bị đi qua tốn khoảng 185 000 gas. Với giới hạn 16 777 216 gas mỗi giao dịch do EIP-7825 đặt ra, một lệnh bán đi qua tối đa khoảng 88 tường; vượt quá mức đó, lệnh bán thất bại mà không mất vốn và phải được chia nhỏ.

## Các hàm đã bị loại bỏ

Phiên bản mới loại bỏ API của ladder, bảo trì, luồng WETH và việc Forge cấp vốn cho tường, đồng thời đổi tên API của token hấp thụ. Client vẫn gọi các thành phần này đang nhắm tới phiên bản cũ.

| Hợp đồng | Thành phần bị loại bỏ |
| --- | --- |
| Hook, hàm | `rebalance()`, `raiseFloor()`, `previewRaiseFloor()`, `canRebalance()`, `referenceTick()`, `lastRebalanceTick()`, `lastRebalanceBlock()`, `reserveTokens()`, `ladderIdleEth()`, `asks(i)`, `bid()`, `vaultAccrued()`, `claimVault()`, `fundFloor()` |
| Hook, hàm được đổi tên | `burnAbsorbed()` thành `deliverAbsorbed()`; `pendingBurnTokens()` thành `pendingAbsorbedTokens()` |
| Hook, hằng số | `PHI_BPS`, `SWEEP_BPS`, `REBALANCE_THRESHOLD`, `REBALANCE_COOLDOWN`, `KEEPER_BOUNTY_BPS`, `KEEPER_BOUNTY_CAP`, `BOUNTY_RESERVE_TARGET`, `BOUNTY_RESERVE_BPS` |
| Hook, sự kiện và lỗi | `Rebalanced`, `SweepExecuted`, `BountyPaid`, `LadderBootstrapped`, `VaultFeesAccrued`, `FloorRaised`, `FloorFunded`, `ThresholdNotMet`, `CooldownActive`, `NothingToRaise`, `WallLimitReached`, `ProtocolFeeActive`, `WallRangeNotEmpty`, `NotInitialized` |
| Lens, hàm | `canRebalance()`, `canRaiseFloor()`, `previewRaiseFloor()`, `cushionEth()`, `ladderTokens()` |
| Lens, trường snapshot | `cushionEth`, `ladderTokens`, `reserveTokens`, `ladderIdleEth`, `lastRebalanceTick`, `lastRebalanceBlock`, `canRebalance`, `movedTicks`, `blocksRemaining`, `canRaiseFloor`, `raiseReason`, `referenceTick` |
| Vault | `weth()`, `earned()`, `claim()`, `fundRewards()`, `rewardPerToken()`, `RewardsFunded`, `RewardPaid` |
| Sổ đăng ký | `weth()` |

Ở bên trong, `_fundWall` và `_planRaise` đã biến mất, nhường chỗ cho `_collectCrossedWalls` và `_placeWall`. Thưởng của Vault chỉ bằng CUBIT, được nhận bằng `claimCubit()`, và các script triển khai không còn dùng biến `WETH`.

## Vault và vault quản trị

| Hợp đồng | Hàm hữu ích |
| --- | --- |
| `CubitVault` | `stake(amount)`, `withdraw(amount)`, `pendingCubit(user)`, `claimCubit()`, `fundRewardReserve(amount)`, `rewardReserve()`, `balanceOf(user)`, `unlockAt(user)` |
| `CubitGovernanceVault` | `deposit(token, amount)`, `depositEth()`, `lockUntracked(token)`, `claimable(token)`, `locked(token)`, `lockExtension()`, rồi `claim(token, maxTranches)` và `extendLock(extra)`, chỉ dành cho deployer, không thể chuyển nhượng quyền này |
| `CubitForge` | `launch(name, symbol, team, tokenSalt, hookSalt, creationCode)`, mở cho mọi người với đúng phí, `launchFee()` bất biến ở 0,005 ETH, salt gắn với tài khoản khởi chạy; `governanceVault()`, địa chỉ được cố định khi tạo hợp đồng, nhận phí khởi chạy bằng `depositEth()` |

Về phía Vault, `DAILY_REWARD_BPS` bằng 300 và `REWARD_PERIOD` là một ngày: `pendingCubit` tăng theo tỷ lệ trong 24 giờ rồi dừng ở mức trần, không vượt quá `rewardReserve`. Về phía vault quản trị, `LOCK_DURATION` là 30 ngày cho mỗi khoản gửi, và ETH được ghi sổ dưới khóa `ETH()`, tức địa chỉ không. `extendLock(extra)` cộng thêm `extra` giây vào thời gian khóa của mọi khoản gửi, hiện tại và tương lai, và `lockExtension()` chỉ tăng.

Lens còn cung cấp `rewardReserve()`, tổng quỹ dự trữ thưởng của mọi vault đã đăng ký, cả vault hiện tại lẫn vault đã bị thay thế. Kể từ lần thay Lens ngày 19 tháng 9 năm 2026, tổng của các tường và nguồn cung không còn được tính on chain: các getter `wallEth()`, `wallTokens()`, `circulatingSupply()` và `heldSupply()` cùng các trường trùng tên đã biến mất khỏi snapshot, thay vào đó snapshot trả về `totalSupply`, `activeWallCount` và `pendingAbsorbedTokens`. Bên gọi tự suy ra các con số, mọi trang đều đọc ở cùng một block: `wallTokens` là tổng CUBIT của các trang cộng `pendingAbsorbedTokens`, rồi `circulatingSupply = totalSupply − wallTokens − rewardReserve` và `heldSupply = circulatingSupply − bandTokens`, mỗi phép trừ dừng ở không. CUBIT đã stake vẫn nằm trong nguồn cung lưu hành. `bestWallPrice()` và `netBestWallPrice()` cho giá gộp và giá ròng của tường đang hoạt động gần thị trường nhất, đọc bằng `nearestWallTick()` của hook, hoặc bằng không khi không còn tường nào. Snapshot kết thúc bằng `blockNumber`, `bestWallPrice` và `netBestWallPrice`.

## Đơn vị và chiều

Lượng CUBIT và ETH dùng 18 chữ số thập phân. Giá suy ra từ Lens là **ETH mỗi CUBIT theo thang 1e18**. Tick v4 theo chiều CUBIT mỗi ETH, giảm khi giá ETH mỗi CUBIT tăng.

Dùng số nguyên `bigint` cho lượng và tính toán trước định dạng. Chuyển quá sớm sang `Number` có thể mất độ chính xác. FDV khởi chạy được cố định khi triển khai trong `LAUNCH_ETH()`: 3,75 ETH được chọn cho phiên bản mới, trên 21 triệu CUBIT. Không trộn USD, wei và đơn vị token.

## Phương thức router

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

`zeroForOne = true` mua CUBIT bằng ETH. Exact-input gửi `amountIn` qua value; mua exact-output gửi `amountInMax`, được hoàn dư. Bán dùng `zeroForOne = false`, value bằng không và phê duyệt CUBIT cho router.

Số trả về theo ranh giới ròng/gộp router: đầu ra ròng với exact-input, đầu vào gộp với exact-output. Hợp đồng kiểm soát khớp không đủ. Báo giá phải mô phỏng với đúng key pool và phiên bản. Sau một lệnh bán, router còn gọi `deliverAbsorbed()` nếu vẫn còn CUBIT đã hấp thụ đang chờ.

## Sự kiện và lỗi

Sự kiện của hook gồm `BuyTaxed`, `SellTaxed`, `BandBootstrapped`, `TeamPaid` và, với tường, `WallFunded`, `WallAbsorbed`, `TokensAbsorbed` và `AbsorbedDelivered`. `ModuleUpdated` cho phép theo dõi việc thay mô-đun.

Về phía các vault, theo dõi `Staked`, `Withdrawn`, `RewardReserveFunded` và `CubitRewardClaimed`, rồi `Deposited`, `Claimed` và `LockExtended` cho vault quản trị.

Log của `WallLib` được phát trong ngữ cảnh hook: lập chỉ mục theo địa chỉ hook với chữ ký ABI tương ứng. Sự kiện cũ `FloorRaised` không còn tồn tại.

Ở router, xử lý nhất là `Expired`, `WrongPool`, `TooLittleReceived`, `TooMuchRequested`, `InsufficientOutput` và `IncompleteInput`. Về phía hook, `ExternalLiquidityForbidden` từ chối mọi thanh khoản bên thứ ba và `SupplyNotDeposited` từ chối khoản gửi khởi chạy không đủ. Đọc lại mã lỗi và ABI của bản phát hành đã xác thực.

<p class="source-note">Nguồn: <code>interfaces/ICubitHook.sol</code>, <code>interfaces/ICubitLens.sol</code>, <code>CubitHook.sol</code>, <code>WallLib.sol</code>, <code>CubitRouter.sol</code>, <code>periphery/CubitVault.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>periphery/CubitForge.sol</code> và lịch sử Git của phiên bản mới, trong đó có commit <code>4aa063ac</code>.</p>
