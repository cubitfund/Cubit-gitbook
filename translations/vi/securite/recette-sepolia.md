---
description: "Kế hoạch kiểm thử thủ công trên Sepolia cho phiên bản mới: dải thanh khoản, swap, thuế, tường, các vault, thay thế, các trường hợp từ chối dự kiến và phiếu ghi nhận có đánh số."
section: "05 / KIỂM CHỨNG"
reading: "KẾ HOẠCH KIỂM THỬ CÓ ĐÁNH SỐ"
search:
  keywords: [nghiệm thu, kiểm thử, testnet, Sepolia, thủ công, checklist, kế hoạch, mức độ nghiêm trọng, mức độ, ghi nhận, phiếu ghi nhận, từ chối]
---

# Kế hoạch kiểm thử thủ công trên Sepolia

Trang này là **danh sách kiểm tra thực hiện thủ công**, trên mạng thử nghiệm Sepolia, bởi một người có ví. Mỗi trường hợp mang một số hiệu ổn định dạng `T-01`, có thể trích dẫn trong báo cáo.

> **Trước khi bắt đầu.** Kế hoạch này dành cho phiên bản mới. Manifest công khai trong kho mô tả bản triển khai Sepolia **đang vận hành**, với phí LP `100`: kế hoạch này áp dụng cho bản đó. Trường hợp không áp dụng được cho phiên bản đang kiểm thử được ghi là “ngoài phạm vi phiên bản”, không bao giờ ghi “thất bại”.

Các giá trị được nêu lấy từ mã của phiên bản mới, trong `contracts/src/`, và từ các quyết định thiết kế ngày 14 tháng 9 năm 2026. Hành vi chưa thể xác lập được đánh dấu **“cần xác nhận khi kiểm thử”**.

## Cách dùng kế hoạch này

Mỗi mục trình bày các trường hợp trong một bảng sáu cột. Hai cột cuối được điền trong lúc nghiệm thu.

| Cột | Nội dung ghi vào |
| --- | --- |
| Trường hợp | Mã định danh ổn định, `T-01` đến `T-110` |
| Điều kiện trước | Điều phải đúng trước khi bắt đầu |
| Các bước | Các thao tác, theo thứ tự |
| Kết quả mong đợi | Điều mà mã và các quyết định dự kiến |
| Kết quả quan sát | Điều đã xảy ra, kèm hash giao dịch hoặc block đọc |
| Mức độ | Để trống nếu đạt; nếu không: Chặn, Nghiêm trọng, Nhỏ hoặc Hình thức |

| Mức độ | Tiêu chí |
| --- | --- |
| Chặn | Mất hoặc kẹt vốn, thuế không được thu, mất tường, thưởng trả từ vốn gốc |
| Nghiêm trọng | Hành vi trái với nguồn, thiếu từ chối, số hiển thị sai |
| Nhỏ | Sai lệch hiển thị không ảnh hưởng on-chain, thông báo thiếu chính xác |
| Hình thức | Chữ, bố cục, nhãn |

Giao dịch **bị từ chối đúng như một trường hợp từ chối là thành công**. Hash chỉ có nghĩa giao dịch đã được gửi: chỉ biên nhận cho biết giao dịch thành công.

**Một số trường hợp không đi qua giao diện.** Trong mã nguồn hiện tại, dapp đọc ABI của phiên bản đang vận hành và không cung cấp lệnh đầu ra chính xác, `claimTeam()` hay các lần đọc chi tiết về tường. Các trường hợp này được đánh dấu “gọi trực tiếp”: chúng được thực hiện bằng công cụ gọi hợp đồng, trên các địa chỉ trong manifest của bản triển khai đang kiểm thử.

## 1. Chuẩn bị

Ghi lại các thông tin này **trước** swap đầu tiên: chúng làm tham chiếu cho mọi phép so sánh về sau.

- Mạng: Sepolia, mã chain `11155111`.
- Các địa chỉ của bản triển khai đang kiểm thử, đọc từ manifest: token, hook, PoolManager, `poolId`, router, Lens, sổ đăng ký V2, Vault, hợp đồng khởi chạy; rồi, khi đã thêm launchpad, vault quản trị và Forge. **Không chép khóa riêng nào vào ghi chú.**
- Các tham số cố định: `fee`, `tickSpacing`, `LAUNCH_ETH`, `MIN_POOL_SUPPLY`, `launchTimestamp`, `moduleRevision`.
- Trạng thái ban đầu: `snapshot()` của Lens, `band()` của hook, `totalSupply()` và `totalBurned()` của token, `pendingFloorEth`, `pendingAbsorbedTokens`, `wallCount()`, `activeWallCount()`, `teamAccrued`, `teamPaidCumulative`, `rewardReserve()` của Vault, và **số block** đọc.

Chuẩn bị ETH thử nghiệm **ngoài** số tiền đem đổi: mỗi giao dịch trả gas, và nhiều trường hợp đòi hỏi giao dịch bị từ chối, vốn cũng tiêu tốn gas.

| Trường hợp | Điều kiện trước | Các bước | Kết quả mong đợi | Kết quả quan sát | Mức độ |
| --- | --- | --- | --- | --- | --- |
| T-01 | Đã cài ví | Chọn Sepolia; mở dapp kết nối với phiên bản đang kiểm thử | Mạng được nhận diện; không có lời mời ký trên chain khác |  |  |
| T-02 | Tài khoản mới | Nạp ETH thử nghiệm từ faucet Sepolia | Số dư hiển thị trong ví và trong dapp sau khi làm mới |  |  |
| T-03 | Có sẵn manifest để đối chiếu | So từng địa chỉ hiển thị với địa chỉ trong manifest | Định danh giống nhau; `poolId`, `fee` và `tickSpacing` khớp |  |  |
| T-04 | Chưa phát swap nào | Đọc `snapshot()` và ghi lại block | Giá trị tham chiếu được ghi lại, block được xác định |  |  |
| T-05 | Gọi trực tiếp | Đọc `poolKey()` của hook | `currency0` bằng địa chỉ không, `fee = 100`, `tickSpacing = 10`, `hooks` bằng hook |  |  |
| T-06 | Sổ đăng ký V2 đọc được | Đọc `moduleRevision()` và địa chỉ các mô-đun | Bản sửa đổi được ghi lại; mọi thay đổi trong lúc nghiệm thu buộc phải kiểm tra lại trước mỗi chữ ký |  |  |

## 2. Khởi chạy và dải thanh khoản

Khi khởi tạo pool, hook đặt **toàn bộ khoản gửi** vào một vị thế duy nhất `[minUsableTick, tickUpper]`, được định danh bằng `BAND_SALT`. `tickUpper` là tick mở pool làm tròn xuống theo spacing, nên vị thế chỉ chứa CUBIT. Hook từ chối khoản gửi thấp hơn `MIN_POOL_SUPPLY`, tức 80 % nguồn cung, và burn phần dư nhỏ do làm tròn.

Việc khởi chạy đầy đủ còn nạp 20 % nguồn cung vào quỹ dự trữ của Vault và thực hiện lệnh mua 0,1 ETH trong cùng giao dịch.

| Trường hợp | Điều kiện trước | Các bước | Kết quả mong đợi | Kết quả quan sát | Mức độ |
| --- | --- | --- | --- | --- | --- |
| T-07 | Đã khởi chạy, gọi trực tiếp | Đọc `band()` | `lower = −887 270`; `upper` bằng tick mở pool làm tròn xuống bội số của 10, tức `155 390` với FDV 3,75 ETH; thanh khoản khác không |  |  |
| T-08 | Đã biết giao dịch khởi chạy | Đọc các sự kiện của giao dịch đó | `BandBootstrapped(lower, upper, liquidity, tokens)` được phát một lần, với các giá trị của `band()`; `tokens` bằng khoản gửi trừ phần dư nhỏ do làm tròn |  |  |
| T-09 | Khởi chạy không có lệnh mua ban đầu | Đọc `bandEth` và `bandTokens` trong `snapshot()` trước mọi swap | `bandEth = 0`; `bandTokens` bằng khoản gửi, trong phạm vi sai số làm tròn |  |  |
| T-10 | Đã khởi chạy, gọi trực tiếp | Đọc `token.balanceOf(hook)` | Bằng không, trừ khi bên thứ ba chuyển trực tiếp: hook không giữ CUBIT thô nào sau khi khởi tạo |  |  |
| T-11 | Gọi trực tiếp | Thử thêm thanh khoản vào pool | Bị từ chối `ExternalLiquidityForbidden`: hook là nhà cung cấp thanh khoản duy nhất |  |  |
| T-12 | Bản triển khai diễn tập | Khởi tạo pool với khoản gửi thấp hơn `MIN_POOL_SUPPLY` | Bị từ chối `SupplyNotDeposited`; không có dải nào được đặt |  |  |
| T-13 | Khởi chạy đầy đủ | Đọc `rewardReserve()` của Vault sau giao dịch khởi chạy | Quỹ dự trữ bằng 20 % nguồn cung, tức 4,2 triệu CUBIT; không có phân bổ cho đội ngũ hay airdrop |  |  |
| T-14 | Khởi chạy đầy đủ | Đọc lệnh mua của deployer trong giao dịch khởi chạy | Lệnh mua 0,1 ETH; `BuyTaxed` với 3 % cho đội ngũ; CUBIT nhận được có thể chuyển nhượng tự do |  |  |
| T-15 | Lệnh mua đã xác nhận, gọi trực tiếp | Tính lại đầu ra mong đợi từ dự trữ ảo của dải | Đầu ra nhất quán với đường cong x·y=k sau thuế 3 % và phí LP; ban đầu là 16,8 triệu CUBIT đối ứng với 3 ETH ảo — cần xác nhận khi kiểm thử |  |  |
| T-16 | Mua rồi bán lại số CUBIT đã mua | Đọc `bandEth` trước, giữa và sau | `bandEth` tăng khi mua rồi trở về gần giá trị ban đầu; không bao giờ vượt quá ETH thực sự do các lệnh mua đưa vào |  |  |

## 3. Quy trình mua và bán

Router cung cấp `swapExactIn(key, zeroForOne, amountIn, amountOutMin, recipient, deadline)` và `swapExactOut(key, zeroForOne, amountOut, amountInMax, recipient, deadline)`. `zeroForOne = true` mua CUBIT bằng ETH.

**Trong mã nguồn hiện tại của dapp, giao diện chỉ dùng đầu vào chính xác.** Người dùng luôn nhập số tiền mình trả; lượng nhận được là trường chỉ đọc. Vì vậy các quy trình đầu ra chính xác phải được kiểm thử bằng cách gọi trực tiếp router.

Lệnh mua gửi ETH gốc qua `msg.value`. Lệnh bán gửi giá trị bằng không và cần **phê duyệt ERC-20** CUBIT cho router: giao diện yêu cầu phê duyệt **đúng số tiền**, không bao giờ không giới hạn, nên lệnh bán lớn hơn cần phê duyệt mới.

Router từ chối khớp một phần: đầu vào chính xác không được dùng hết kích hoạt `IncompleteInput`, đầu ra chính xác không được đáp ứng đủ kích hoạt `InsufficientOutput`. Vì thuế được tính theo số tiền yêu cầu, việc hủy giao dịch bảo vệ người dùng.

Các thiết lập giao diện đọc trong mã nguồn của dapp, cần kiểm tra trong quá trình nghiệm thu: dung sai slippage **mặc định 1,0 %**, giá trị nhập giới hạn ở **hai chữ số thập phân** và trong khoảng `0` đến `99,99`; mức nhận tối thiểu tính bằng số nguyên và **làm tròn lên wei**; báo giá **còn mới trong 30 giây**; hạn on-chain = timestamp của chain **cộng 120 giây trừ tuổi của báo giá**.

| Trường hợp | Điều kiện trước | Các bước | Kết quả mong đợi | Kết quả quan sát | Mức độ |
| --- | --- | --- | --- | --- | --- |
| T-17 | Đủ số dư ETH | Mua một lượng nhỏ, ví dụ 0,001 ETH | Biên nhận thành công; CUBIT được ghi có; sự kiện `BuyTaxed` được phát |  |  |
| T-18 | Số dư ETH lớn | Mua một lượng lớn | Biên nhận thành công; tác động giá thể hiện trong báo giá, không phải trong tỷ lệ thuế |  |  |
| T-19 | Có CUBIT trong ví | Phê duyệt rồi bán | Hai giao dịch riêng; nhận ETH ròng; `SellTaxed` được phát |  |  |
| T-20 | Lệnh bán trước đã xác nhận | Bán một lượng **lớn hơn** lần trước | Yêu cầu phê duyệt mới: phê duyệt trước chỉ cho đúng số tiền của lần đó |  |  |
| T-21 | Màn hình swap đang mở | Đọc dung sai được đề xuất mà không chỉnh | Giá trị mặc định **1,0 %** |  |  |
| T-22 | Màn hình swap đang mở | Nhập `0.005`, rồi `100`, rồi một giá trị âm | Các giá trị nhập bị từ chối, kèm thông báo về khoảng 0–99,99 và hai chữ số thập phân |  |  |
| T-23 | Báo giá còn mới | Đặt dung sai ở mức thấp nhất được chấp nhận, chờ giá biến động, rồi ký | Bị từ chối `TooLittleReceived(received, minimum)`; không mất token nào; giao diện không mời bỏ cơ chế bảo vệ |  |  |
| T-24 | Báo giá đang hiển thị | Để quá 30 giây không thao tác, rồi thử ký | Báo giá bị coi là cũ và được tính lại trước mọi chữ ký |  |  |
| T-25 | Báo giá sắp hết hạn | Ký ngay trước khi hết hạn và đọc hạn được truyền đi | Hạn bằng 120 giây **trừ** tuổi của báo giá: báo giá 30 giây tuổi còn lại khoảng 90 giây |  |  |
| T-26 | Gọi trực tiếp | Gọi `swapExactIn` với hạn đã qua | Bị từ chối `Expired`; không có dịch chuyển vốn |  |  |
| T-27 | Gọi trực tiếp | Gọi `swapExactOut` cho lệnh mua, với trần đầu vào dư dả | Nhận đúng lượng yêu cầu; ETH dư được hoàn cho người gọi trong cùng giao dịch |  |  |
| T-28 | Gọi trực tiếp | Gọi `swapExactOut` với trần đầu vào thấp hơn số tiền cần thiết một wei | Bị từ chối `TooMuchRequested(required, maximum)` |  |  |
| T-29 | Số dư CUBIT lớn hơn lượng mà dải thanh khoản và các tường có thể mua lại, ví dụ CUBIT nhận làm thưởng | Bán số dư này bằng đầu vào chính xác qua router | Bị từ chối `IncompleteInput`; thuế bị hủy cùng giao dịch — cần xác nhận khi kiểm thử |  |  |
| T-30 | Gọi trực tiếp | Yêu cầu đầu ra chính xác nhiều ETH hơn lượng sổ lệnh có thể đáp ứng | Bị từ chối `InsufficientOutput`; không quyết toán một phần |  |  |
| T-31 | Gọi trực tiếp | Lần lượt gửi số tiền bằng không, người nhận là địa chỉ không, giá trị `msg.value` không nhất quán, rồi một key pool khác | Lần lượt bị từ chối `InvalidAmount`, `ZeroRecipient`, `WrongValue`, `WrongPool` |  |  |
| T-32 | Router bên thứ ba tương thích | Mua rồi bán qua một tuyến bên thứ ba | Thuế hook được áp dụng |  |  |
| T-33 | Hợp đồng gọi hoặc lô giao dịch | Thực hiện liên tiếp một lệnh mua rồi một lệnh bán trong **cùng một giao dịch** | Hai phần được đánh thuế riêng |  |  |

## 4. Thuế và kế toán

| Thao tác | Cơ sở | Phân bổ |
| --- | --- | --- |
| Mua | 3 % của phần ETH gộp | 100 % phần đội ngũ; phân bổ cho tường được đặt tường minh bằng không |
| Bán | 15 % ETH đầu ra gộp | 12 % cho tường, 3 % cho đội ngũ |

Với đầu vào chính xác, thuế mua **nằm trong** số tiền cung cấp và được làm tròn lên wei. Với đầu ra chính xác, thuế được cộng thêm trên phần pool, sao cho thuế tính trên tổng vẫn là 3 %.

Với lệnh bán đầu ra chính xác, thuế bằng `ceil(sortie × 1500 / 8500)`: pool tạo ra đầu ra yêu cầu **cộng** thuế. Với lệnh bán đầu vào chính xác, thuế bằng `ceil(brut × 15 %)`. Khi phân bổ, phần đội ngũ được làm tròn xuống và **toàn bộ phần dư tính bằng wei thuộc về tường**.

Trong mã nguồn hiện tại của dapp, giao diện yêu cầu đọc các tỷ lệ này on-chain trước khi cho phép swap: chừng nào chưa kiểm tra xong, nút vẫn ở trạng thái chờ.

| Trường hợp | Điều kiện trước | Các bước | Kết quả mong đợi | Kết quả quan sát | Mức độ |
| --- | --- | --- | --- | --- | --- |
| T-34 | Lệnh mua đã xác nhận | Đọc `BuyTaxed(ethIn, toFloor, toTeam)` | `toFloor` bằng không; `toTeam` bằng 3 % đầu vào gộp, làm tròn lên wei |  |  |
| T-35 | Lệnh mua đã xác nhận | So `teamAccrued` trước và sau | Mức tăng bằng phần đội ngũ |  |  |
| T-36 | Lệnh bán đã xác nhận | Đọc `SellTaxed(ethOut, toFloor, toTeam)` | `toFloor + toTeam` bằng 15 % phần gộp; `toTeam` bằng 3 % phần gộp; tổng chính xác đến từng wei |  |  |
| T-37 | `teamAccrued` khác không, gọi trực tiếp | Gọi `claimTeam()` từ bất kỳ tài khoản nào | Vốn được chuyển đến địa chỉ đội ngũ cố định; `TeamPaid(amount, cumulative)` được phát; `teamAccrued` về không |  |  |
| T-38 | `teamAccrued` bằng không, gọi trực tiếp | Gọi `claimTeam()` | Lệnh gọi không revert và không chuyển gì |  |  |
| T-39 | Một lệnh mua rồi một lệnh bán cùng số tiền | So ETH ban đầu và ETH cuối, không tính gas | Hệ số còn lại xấp xỉ `0,97 × 0,85 = 0,8245`; chênh lệch đến từ phí LP, tác động giá và làm tròn |  |  |
| T-40 | Hai lệnh bán có quy mô rất khác nhau | So thuế với phần gộp tương ứng | Tỷ lệ vẫn là 15 % trong cả hai trường hợp; không có bậc hay miễn trừ |  |  |

## 5. Tường tự động

Ở mỗi lệnh bán, với đầu vào chính xác cũng như đầu ra chính xác, hook gọi `_collectCrossedWalls()` rồi `_placeWall()`. Trước tiên hook làm trống mọi tường mà giá đã đi qua hoàn toàn, từ gần nhất đến xa nhất, rồi đặt toàn bộ ETH đang chờ tại mục tiêu `0,4 × prix courant + 0,6 × prix de lancement`, tính trên giá **sau** lệnh bán và làm tròn theo tick. Nếu mục tiêu đó không nằm hẳn trên tick của pool, điều xảy ra khi giá bằng hoặc thấp hơn giá khởi chạy, tường được đặt thấp hơn giá hiện tại 1 %.

Tường được làm trống cộng CUBIT của nó vào `pendingAbsorbedTokens` và trả ETH còn lại, gồm phí và phần dư nhỏ, về `pendingFloorEth`. Tường chỉ bị tiêu thụ một phần vẫn giữ nguyên vị trí. Chỉ số tiền quá nhỏ để tạo thanh khoản và trường hợp cực đoan khi giá ở tận đỉnh dải tick, nơi không còn chỗ đặt tường nào dưới giá, mới để vốn chờ trong `pendingFloorEth`: lệnh bán không bao giờ bị từ chối vì lý do đó. Sau đó router CUBIT gọi `deliverAbsorbed()` trong một try/catch.

Tham chiếu `floorPrice()` của Lens mô tả **tường được cấp vốn gần nhất**, không phải mức tối thiểu toàn cục. Mỗi tường bị đi qua tốn khoảng 185 000 gas: một lệnh bán đi qua tối đa khoảng 88 tường trong giới hạn 16 777 216 gas của một giao dịch.

| Trường hợp | Điều kiện trước | Các bước | Kết quả mong đợi | Kết quả quan sát | Mức độ |
| --- | --- | --- | --- | --- | --- |
| T-41 | Giá trên giá khởi chạy | Bán, rồi đọc các tường | `WallFunded(id, lower, addedEth, liquidity)` được phát; một tường được tạo hoặc làm dày tại tick mục tiêu với ETH đang chờ, trong đó có 12 % của lệnh bán, trong phạm vi sai số làm tròn; `pendingFloorEth` chỉ giữ phần dư chưa được đặt |  |  |
| T-42 | Tình huống trước | Tính lại mục tiêu từ giá **sau** lệnh bán và giá khởi chạy | `lower` của tường ứng với mục tiêu 40/60 tính trên giá này, làm tròn theo tick |  |  |
| T-43 | Hai lệnh bán có mục tiêu rơi vào cùng một tick | Đọc `wallCount()` và `walls(id)` | Chỉ một tường: hai sự kiện `WallFunded` mang cùng `id`, thanh khoản tăng, không tạo định danh mới |  |  |
| T-44 | Nhiều tường ở các tick khác nhau | Bán và mua nhiều lần, rồi đọc lại `walls(id)` | `lower` của mỗi tường giữ nguyên; không tường nào bị di chuyển |  |  |
| T-45 | Tường hoạt động dưới giá | Bán một lượng tiêu thụ một phần tường mà không đi qua hết tường | Tường vẫn hoạt động với cả ETH lẫn CUBIT; không có `WallAbsorbed`; `pendingAbsorbedTokens` không đổi |  |  |
| T-46 | Tường bị tiêu thụ một phần | Mua đến khi giá vượt trở lại trên tường | Tường đã bán lại CUBIT và có lại ETH; định danh và tick của tường không đổi |  |  |
| T-47 | Tường hoạt động, bán qua router CUBIT | Bán một lượng đi qua hoàn toàn tường | `WallAbsorbed(id, cubit, ethRemaining)` và `TokensAbsorbed(amount, pendingAbsorbedTokens)`, rồi `AbsorbedDelivered(sink, amount)` và `RewardReserveFunded` trong cùng giao dịch; `rewardReserve()` tăng thêm số CUBIT này; `pendingAbsorbedTokens` về không; `totalSupply()` và `totalBurned()` không đổi |  |  |
| T-48 | Giá gần giá khởi chạy, mục tiêu 40/60 không nằm dưới thị trường | Bán một lượng nhỏ có thể đáp ứng được, rồi đọc các tường | Lệnh bán thành công; `WallFunded` được phát; tường được đặt thấp hơn giá sau lệnh bán 1 %, làm tròn theo tick; `pendingFloorEth` chỉ giữ phần dư chưa được đặt |  |  |
| T-49 | Tình huống của T-48 | Bán lại một lượng nhỏ có thể đáp ứng được, rồi đọc `pendingFloorEth` | `WallFunded` được phát thấp hơn giá mới 1 %; `pendingFloorEth` chỉ giữ phần dư làm tròn: không có khoản tồn đọng nào tích lũy từ lệnh bán này sang lệnh bán khác |  |  |
| T-50 | Router bên thứ ba tương thích | Bán qua tuyến bên thứ ba sao cho đi qua hoàn toàn một tường, rồi gọi `deliverAbsorbed()` từ một tài khoản bất kỳ | Thuế được áp dụng; `TokensAbsorbed` được phát và CUBIT nằm lại trong `pendingAbsorbedTokens` cho đến lệnh gọi, lệnh này phát `AbsorbedDelivered` |  |  |
| T-51 | Nhiều tường đã được cấp vốn | Đọc `floorPrice()` và `netFloorPrice()` của Lens, rồi `wallAmountsPage(0, 500)` và các trang tiếp theo cho đến `activeWallCount`, tất cả ở cùng một block | Tham chiếu của tường được cấp vốn gần nhất, được trình bày đúng như vậy; CUBIT trong các tường bằng tổng các trang cộng `pendingAbsorbedTokens`, chỉ cộng một lần |  |  |
| T-52 | Thị trường con Forge, tường bị đi qua hoàn toàn | Đọc `absorbedTokenSink()` của hook thị trường con, rồi các sự kiện của lệnh bán | Đích đến bằng `governanceVault()` của Forge; `AbsorbedDelivered` được phát; đợt `Deposited(token, from, amount, unlockAt)` bị khóa 30 ngày |  |  |
| T-106 | Nhiều tường cần đi qua trong một lệnh bán | Ước tính gas của lệnh bán, rồi gửi lệnh bán | Khoảng 185 000 gas cho mỗi tường bị đi qua; quá khoảng 88 tường, lệnh bán vượt 16 777 216 gas và thất bại mà không mất vốn: cần chia nhỏ lệnh bán |  |  |
| T-107 | Bản triển khai diễn tập có đích đến của CUBIT từ chối nhận | Bán qua router CUBIT sao cho đi qua một tường, rồi gọi lại `deliverAbsorbed()` | Lệnh bán thành công; CUBIT nằm lại trong `pendingAbsorbedTokens`; lệnh gọi mở cho mọi tài khoản và thất bại chừng nào đích đến còn từ chối |  |  |

## 6. mCUBIT Vault

Vault trả thưởng **bằng CUBIT**, chỉ lấy từ `rewardReserve`. Thưởng là `DAILY_REWARD_BPS = 300`, tức 3 % khoản gửi cho mỗi kỳ 24 giờ (`REWARD_PERIOD`), tính theo tỷ lệ thời gian và **giới hạn ở một kỳ**: quá mức đó, phần vượt quá bị mất. Thưởng không bao giờ vượt quá số dư quỹ dự trữ và không bao giờ được trả từ vốn gốc.

Mỗi lần gửi khởi động lại khóa **24 giờ** (`LOCK_DURATION`) cho toàn bộ vị thế của ví; rút trước hạn bị từ chối bằng `Locked`. Một lần gửi, rút hoặc nhận thưởng đều trả trước thưởng đã tích lũy và bắt đầu lại kỳ. Bất kỳ tài khoản nào cũng có thể nạp quỹ dự trữ bằng `fundRewardReserve(amount)`. Hạn được xét theo timestamp của chain, không theo đồng hồ trình duyệt.

Thưởng **chỉ bằng CUBIT**, được nhận bằng `claimCubit()`: Vault không cung cấp hàm thưởng WETH nào.

| Trường hợp | Điều kiện trước | Các bước | Kết quả mong đợi | Kết quả quan sát | Mức độ |
| --- | --- | --- | --- | --- | --- |
| T-53 | Vault khả dụng, có CUBIT trong ví | Phê duyệt rồi gửi | `Staked(user, amount, unlockAt)` được phát; `unlockAt` bằng timestamp của block cộng 24 giờ |  |  |
| T-54 | Đã có vị thế | Gửi thêm trước hạn | Khóa được **khởi động lại cho toàn bộ vị thế**; thưởng đã tích lũy, nếu khác không, được trả kèm `CubitRewardClaimed` và kỳ bắt đầu lại |  |  |
| T-55 | Đang bị khóa | Yêu cầu rút | Bị từ chối `Locked` |  |  |
| T-56 | Đã hết khóa | Rút một phần khoản gửi | Chấp nhận rút một phần; `Withdrawn` được phát; thưởng đã tích lũy được trả trước; số dư còn lại vẫn nằm trong khoản gửi |  |  |
| T-57 | Gửi 1 000 CUBIT, quỹ dự trữ đủ | Đọc `pendingCubit` sau 12 giờ, rồi sau 24 giờ | Khoảng 15 CUBIT, rồi 30 CUBIT |  |  |
| T-58 | Tình huống trước | Chờ 48 giờ không nhận, rồi đọc `pendingCubit` | Vẫn 30 CUBIT: ngày thứ hai bị mất |  |  |
| T-59 | Có thưởng đã tích lũy | Gọi `claimCubit()` | CUBIT được chuyển; `CubitRewardClaimed` được phát; `rewardReserve` giảm đúng số đã trả; `pendingCubit` về không |  |  |
| T-60 | Bản triển khai diễn tập với quỹ dự trữ nhỏ | Nhận thưởng lớn hơn quỹ dự trữ | Chỉ số dư quỹ dự trữ được trả; quỹ dự trữ về không; vốn gốc không bị động đến |  |  |
| T-61 | Gọi trực tiếp | Gọi `fundRewardReserve(0)`, rồi `fundRewardReserve(x)` từ một tài khoản bất kỳ sau khi phê duyệt | Bị từ chối `InvalidAmount`, rồi `RewardReserveFunded(from, x)`; `rewardReserve` tăng thêm `x` |  |  |
| T-62 | Gọi trực tiếp | So `token.balanceOf(vault)` với `totalStaked + rewardReserve` ở nhiều thời điểm | Số dư của Vault không bao giờ nhỏ hơn tổng này |  |  |
| T-63 | Số tiền bằng không, gọi trực tiếp | Gọi `stake(0)` rồi `withdraw(0)` | Bị từ chối `InvalidAmount` trong cả hai trường hợp |  |  |
| T-64 | Vault không kết nối với sổ đăng ký hiện tại | Thử gửi | Bị từ chối `Inactive` |  |  |
| T-65 | Vị thế đang mở | Đọc thời hạn khóa hiển thị | Hiển thị theo giờ, suy ra từ `LOCK_DURATION`: 24 giờ |  |  |
| T-66 | Đang mở dapp | Tìm quy trình thưởng bằng WETH | Không có: chỉ có thưởng bằng CUBIT |  |  |

## 7. Vault quản trị của launchpad

Vault quản trị nhận phí khởi chạy của Forge bằng ETH và token được tường của thị trường con Forge hấp thụ. **Mỗi khoản gửi bị khóa 30 ngày** (`LOCK_DURATION`) kể từ lúc chính khoản đó được nhận. **Chỉ deployer** mới có thể nhận, vĩnh viễn và không thể chuyển nhượng quyền này, và chỉ các đợt đã qua hạn, từ cũ nhất đến mới nhất. ETH được ghi sổ dưới khóa `ETH()`, tức địa chỉ không. Đọc lại ABI của bản triển khai đang kiểm thử trước khi nghiệm thu. Deployer có thể gia hạn khóa của mọi khoản gửi, hiện tại và tương lai, bằng `extendLock`; `lockExtension()` chỉ tăng và được cộng vào mọi ngày mở khóa.

Việc tự động chuyển từ tường của thị trường con được kiểm tra bởi T-52, còn khoản gửi phí khởi chạy bởi T-81. Các trường hợp T-67 đến T-73 gửi token thử nghiệm bằng cách gọi trực tiếp; T-108 nhận ETH của một khoản phí.

| Trường hợp | Điều kiện trước | Các bước | Kết quả mong đợi | Kết quả quan sát | Mức độ |
| --- | --- | --- | --- | --- | --- |
| T-67 | Token thử nghiệm, gọi trực tiếp | Phê duyệt rồi gọi `deposit(token, amount)` | `Deposited(token, from, amount, unlockAt)` được phát; `unlockAt` bằng timestamp của block cộng 30 ngày; `held(token)` tăng tương ứng |  |  |
| T-68 | Khoản gửi chưa đủ 30 ngày | Gọi `claim(token, n)` từ deployer | Bị từ chối `NothingToClaim` |  |  |
| T-69 | Đợt đã mở khóa | Gọi `claim(token, n)` từ một tài khoản khác | Bị từ chối `NotDeployer` |  |  |
| T-70 | Mỗi ngày một khoản gửi trong 7 ngày | Nhận mỗi ngày kể từ ngày thứ 30 sau khoản gửi đầu tiên | Mỗi ngày mở ra một đợt, từ cũ nhất đến mới nhất; đợt cuối mở ra 30 ngày sau khoản gửi thứ bảy; `Claimed(token, amount, tranches)` ở mỗi lần nhận |  |  |
| T-71 | Nhiều đợt đã mở khóa | Gọi `claim(token, 1)` | Chỉ một đợt được trả; đợt tiếp theo vẫn có thể nhận |  |  |
| T-72 | Token được gửi bằng chuyển khoản đơn thuần | Gọi `lockUntracked(token)`, rồi gọi lại mà không có chuyển khoản mới | Đợt mới bị khóa 30 ngày kể từ lần gọi đầu; lần gọi thứ hai bị từ chối bằng `NothingToLock` |  |  |
| T-73 | Có đợt bị khóa và đợt đã mở khóa | Đọc `claimable(token)` và `locked(token)` | Số tiền có thể nhận cộng số tiền bị khóa bằng `held(token)` |  |  |
| T-108 | Phí khởi chạy của T-81 đã được gửi hơn 30 ngày | Gọi `claim(address(0), 1)` từ một tài khoản khác, rồi từ deployer | Bị từ chối bằng `NotDeployer`, rồi ETH được trả cho deployer; `Claimed(address(0), amount, 1)` được phát; `held(address(0))` giảm đúng số tiền đã trả |  |  |
| T-109 | Các đợt đang bị khóa | Gọi `extendLock(extra)` từ một tài khoản khác, rồi từ deployer | Bị từ chối bằng `NotDeployer`, rồi `LockExtended(extra, lockExtension)` được phát; mọi ngày đọc bằng `tranche(token, i)` lùi thêm `extra`; không hàm nào rút ngắn thời gian khóa |  |  |

## 8. Forge

Forge là một launchpad công khai, được trình bày như bản phát hành tương lai. Forge không thuộc lần khởi chạy CUBIT: nó được thêm sau, cùng vault quản trị của nó. Hãy ghi lại các địa chỉ của nó sau khi launchpad được thêm.

Bất kỳ tài khoản nào cũng khởi chạy thị trường con bằng cách trả đúng phí. Thị trường con Forge gửi toàn bộ nguồn cung vào dải thanh khoản của mình, Forge nhận địa chỉ vault quản trị khi được tạo, và mỗi lần khởi chạy trả phí 0,005 ETH cho vault đó, vault giữ lại khoản này: người khởi chạy không bao giờ lấy lại được. Salt triển khai gắn với tài khoản khởi chạy.

| Trường hợp | Điều kiện trước | Các bước | Kết quả mong đợi | Kết quả quan sát | Mức độ |
| --- | --- | --- | --- | --- | --- |
| T-81 | Forge khả dụng, tài khoản bất kỳ | Khởi chạy một thị trường con với đúng phí 0,005 ETH | `ChildLaunched(token, hook, launcher, team, fee)` được phát; `BandBootstrapped` của thị trường con cho thấy khoản gửi bằng toàn bộ nguồn cung, trong phạm vi sai số làm tròn; vault quản trị phát `Deposited(address(0), forge, fee, unlockAt)`, với `unlockAt` bằng timestamp của block cộng 30 ngày và phần gia hạn nếu có; `pendingFloorEth` của hook mẹ không đổi |  |  |
| T-82 | Forge khả dụng | Thử khởi chạy với giá trị sai, tên trống, đội ngũ bằng không hoặc mẫu mã khác | Bị từ chối: `wrong launch fee`, `invalid name`, `invalid team` hoặc `template mismatch` |  |  |
| T-110 | Salt của một lần khởi chạy bị tài khoản khác nhìn thấy | Khởi chạy từ tài khoản thứ hai với cùng salt | Các địa chỉ của lần khởi chạy đầu không bị chiếm: salt gắn với tài khoản khởi chạy, và lần khởi chạy thứ hai bị từ chối bằng `child deployment failed` nếu địa chỉ hook của nó không mang các quyền |  |  |

## 9. Thay thế và quyền hạn

Authority của sổ đăng ký có thể thay bốn địa chỉ ngoại vi bất cứ lúc nào, không chậm trễ: Vault, router, Lens và Forge. Mỗi lần thay phát `ModuleUpdated`, **tăng `moduleRevision`** và đóng chức năng tương ứng cho đến khi đội ngũ mở lại: Vault, Momentum hoặc Forge; thay router không đóng chức năng nào. Ứng viên đã được đăng ký, kết nối với hook khác hoặc token khác, hoặc đã có stake, bị từ chối bằng `InvalidModule`.

Hook **không có quản trị viên nào**, và không ai có thể tạm dừng swap hay cơ chế tường. Địa chỉ đội ngũ giữ quyền vĩnh viễn: địa chỉ này nhận phần đội ngũ của thuế và thay rồi kích hoạt các mô-đun của sổ đăng ký.

| Trường hợp | Điều kiện trước | Các bước | Kết quả mong đợi | Kết quả quan sát | Mức độ |
| --- | --- | --- | --- | --- | --- |
| T-83 | Có khoản gửi và quỹ dự trữ trong Vault hiện tại | Thay Vault | CUBIT đã gửi, quỹ dự trữ thưởng và các hạn **vẫn nằm trong Vault cũ**; không vốn nào bị di chuyển |  |  |
| T-84 | Vault đã bị thay | Trên Vault cũ, nhận thưởng rồi rút, rồi thử gửi | Nhận thưởng và rút vẫn khả dụng; khoản gửi mới bị từ chối bằng `Inactive` |  |  |
| T-85 | Ứng viên đã được đăng ký, hoặc đã có stake | Thử thay thế | Bị từ chối `InvalidModule` |  |  |
| T-86 | Đã thay thế | Đọc `moduleRevision()` và sự kiện; sau khi thay Vault, thử gửi vào Vault mới | Bản sửa đổi được tăng; `ModuleUpdated(module, previous, current, revision)` khớp; khoản gửi bị từ chối bằng `Inactive` cho đến khi Vault được kích hoạt lại |  |  |
| T-87 | Đã phê duyệt cho router cũ | Thay router, rồi thử bán | Phê duyệt cũ không có hiệu lực với spender mới; yêu cầu phê duyệt mới |  |  |
| T-88 | Router đã bị thay | Swap qua router cũ | Swap vẫn thực hiện được và thuế hook được áp dụng; dapp dùng router mới |  |  |
| T-89 | Gọi trực tiếp | Kiểm tra ABI của hook đã triển khai | Không hàm nào cho phép đình chỉ swap hay cơ chế tường; hook không có quản trị viên nào |  |  |
| T-90 | Gọi trực tiếp | Đọc `snapshot()` của Lens, rồi đọc các trang tường ở cùng block | Snapshot chỉ chứa các trường về thị trường, dải thanh khoản, tường, tài khoản, tổng cung, quỹ dự trữ thưởng, số tường đang hoạt động, block đọc và tường tốt nhất: không có tổng của các tường, và chi phí của nó không phụ thuộc vào số tường; nguồn cung lưu hành bằng `totalSupply` trừ CUBIT trong các tường và `rewardReserve`, còn CUBIT đang nắm giữ bằng nguồn cung đó trừ `bandTokens` |  |  |
| T-91 | Bất kỳ lúc nào sau khi khởi chạy | Mua và bán | Swap hoạt động bình thường: không tài khoản nào có thể chặn swap |  |  |

## 10. Các trường hợp từ chối dự kiến

Bảng này làm tham chiếu trong suốt quá trình nghiệm thu. Tường tự động không thêm trường hợp từ chối nào cho lệnh bán: một tường không thể đặt khiến vốn chuyển sang trạng thái chờ, và lần chuyển thất bại để CUBIT tiếp tục chờ.

> **Điểm cần lưu ý.** Trong mã nguồn hiện tại của dapp, lỗi hợp đồng không được dịch: một lần từ chối on-chain có thể hiển thị dưới dạng thông báo thô, bị cắt ngắn khi hiển thị. **Với mỗi lần từ chối được kích hoạt, ghi lại chính xác văn bản hiển thị** và đánh giá xem văn bản đó có dễ hiểu không.

| Lỗi | Nguyên nhân kích hoạt | Điều ứng dụng nên hiển thị |
| --- | --- | --- |
| `ExternalLiquidityForbidden` | Bên thứ ba thêm thanh khoản | Không thể thực hiện: giao thức là nhà cung cấp thanh khoản duy nhất |
| `SupplyNotDeposited` | Khởi tạo với khoản gửi thấp hơn 80 % nguồn cung | Không thể khởi chạy, khoản gửi không đủ |
| `Expired` | Đã quá hạn giao dịch | Báo giá hết hạn, cần tính báo giá mới |
| `TooLittleReceived(received, minimum)` | Đầu ra thấp hơn mức tối thiểu chấp nhận | Cơ chế bảo vệ slippage đã kích hoạt |
| `TooMuchRequested(required, maximum)` | Đầu vào cao hơn trần chấp nhận | Cơ chế bảo vệ trần đầu vào đã kích hoạt |
| `IncompleteInput` | Đầu vào chính xác không được dùng hết | Số tiền quá lớn so với thanh khoản khả dụng |
| `InsufficientOutput` | Đầu ra chính xác không được đáp ứng đủ | Sổ lệnh không thể đáp ứng đầu ra này |
| `InvalidAmount`, `ZeroRecipient`, `WrongValue`, `WrongPool` | Tham số lệnh không hợp lệ, hoặc gửi số tiền bằng không vào Vault | Lỗi nhập liệu, không kèm mã thô |
| `Inactive`, `Locked` | Vault không kết nối với sổ đăng ký hiện tại, hoặc rút trước hạn | Mô-đun không khả dụng, hoặc ngày mở khóa |
| `NotDeployer`, `NothingToClaim`, `NothingToLock`, `NothingToExtend` | Bên thứ ba nhận hoặc gia hạn tại vault quản trị, nhận trước hạn, khóa khi không có số dư mới, gia hạn bằng không | Hành động bị giới hạn quyền, không có gì để nhận, không có gì để khóa hoặc không có gì để gia hạn |
| `NotAuthority`, `InvalidModule` | Bên thứ ba yêu cầu thay thế, hoặc ứng viên không tương thích | Thay thế bị từ chối, kèm lý do |

Cũng cần ghi lại các trường hợp từ chối thuần túy ở ứng dụng: báo giá cũ, ngữ cảnh swap bị thay đổi, ví ở chain khác, tài khoản đã đổi, bản sửa đổi mô-đun đã đổi, tỷ lệ thuế chưa được kiểm tra.

## 11. Ứng dụng

Các trường hợp này được thực hiện với dapp. Các hành vi giao diện được nêu lấy từ mã nguồn của dapp và được kiểm tra trong quá trình nghiệm thu.

| Trường hợp | Điều kiện trước | Các bước | Kết quả mong đợi | Kết quả quan sát | Mức độ |
| --- | --- | --- | --- | --- | --- |
| T-92 | Dapp đang mở | Lần lượt xem mười ngôn ngữ của bộ chọn | Mỗi ngôn ngữ hiển thị nội dung đã dịch, không thiếu chữ hay tràn; tên sản phẩm được cố ý giữ bằng tiếng Anh |  |  |
| T-93 | Đã chọn ngôn ngữ | Tải lại, rồi thu nhỏ cửa sổ xuống dưới 640 px | Lựa chọn được giữ từ phiên này sang phiên khác; dưới 640 px, bộ chọn chỉ còn hiển thị lá cờ |  |  |
| T-94 | Ngôn ngữ khác tiếng Anh | So tiêu đề trang chủ với bản tiếng Anh | Tiêu đề được cố ý rút gọn ở các ngôn ngữ khác tiếng Anh; tiêu đề không được tràn hay bị cắt |  |  |
| T-95 | Màn hình khoảng 400 px | Lần lượt xem từng màn hình | Không tràn ngang; các vùng rộng cuộn trong khung chứa riêng; các nút vẫn bấm được |  |  |
| T-96 | Cửa sổ từ 768 đến 1279 px | Mở điều hướng | Menu thu gọn được dùng đến 1279 px; menu tự đóng sau khi điều hướng |  |  |
| T-97 | Giao dịch đã xác nhận | So từng số tiền hiển thị với giá trị on-chain tại cùng block | Các số tiền khớp; làm tròn khi hiển thị không thay đổi số tiền được ký |  |  |
| T-98 | Thao tác đang chuẩn bị | Đổi mạng trong ví giữa chừng | Báo giá bị vô hiệu và chữ ký bị từ chối ngoài mạng mong đợi; nút trước tiên đề xuất đổi mạng, rồi yêu cầu thao tác thứ hai để swap |  |  |
| T-99 | Thao tác đang chuẩn bị | Đổi tài khoản trong ví giữa chừng | Số dư, phê duyệt và báo giá được tính lại cho tài khoản mới; chữ ký chuẩn bị cho tài khoản cũ bị từ chối |  |  |
| T-100 | Đã phê duyệt, chưa ký swap | Để bản sửa đổi mô-đun thay đổi giữa hai bước | Ứng dụng xác thực lại ngữ cảnh và không âm thầm tiếp tục với spender mới |  |  |
| T-101 | RPC không khả dụng hoặc dữ liệu đọc đã cũ | Cắt truy cập RPC rồi quan sát | Trạng thái được báo là chưa xác minh và các thao tác bị vô hiệu hóa |  |  |
| T-102 | Giao dịch đã gửi | Theo dõi hash rồi biên nhận | Giao diện phân biệt “đã gửi” và “thành công”; có thể kiểm tra sự kiện trên một explorer Sepolia |  |  |
| T-103 | Đã gây ra một lần từ chối on-chain | Ghi lại toàn bộ văn bản hiển thị | Thông báo phải dễ hiểu với người dùng; ghi lại mọi mã kỹ thuật thô hoặc thông báo bị cắt |  |  |
| T-104 | Tiếng Trung, tiếng Hàn và tiếng Nhật | Hiển thị các ngôn ngữ này mà không truy cập dịch vụ font bên ngoài | Ký tự hiển thị đúng: font do site cung cấp |  |  |
| T-105 | Màn hình Proof đang mở | Đọc dải thanh khoản, các tường và vốn đang chờ | `bandEth`, `bandTokens`, các tường, ETH đang chờ và CUBIT đang chờ chuyển được hiển thị riêng; không màn hình nào hiển thị ladder, keeper hay burn của tường |  |  |

## 12. Phiếu ghi nhận

Mỗi bảng trong các mục trước **chính là** phiếu ghi nhận của mục đó: điền các cột “Kết quả quan sát” và “Mức độ” theo từng trường hợp. Với kết quả quan sát, ghi tối thiểu hash giao dịch hoặc block đọc, rồi điều đã ghi nhận được.

Bảng tổng hợp đính kèm báo cáo:

| Mục | Trường hợp | Đạt | Sai lệch | Mức độ cao nhất |
| --- | --- | --- | --- | --- |
| 1. Chuẩn bị | T-01 đến T-06 |  |  |  |
| 2. Khởi chạy và dải thanh khoản | T-07 đến T-16 |  |  |  |
| 3. Mua và bán | T-17 đến T-33 |  |  |  |
| 4. Thuế và kế toán | T-34 đến T-40 |  |  |  |
| 5. Tường tự động | T-41 đến T-52, T-106 và T-107 |  |  |  |
| 6. mCUBIT Vault | T-53 đến T-66 |  |  |  |
| 7. Vault quản trị | T-67 đến T-73, T-108 và T-109 |  |  |  |
| 8. Forge | T-81, T-82 và T-110 |  |  |  |
| 9. Thay thế và quyền hạn | T-83 đến T-91 |  |  |  |
| 10. Trường hợp từ chối | Tham chiếu chung |  |  |  |
| 11. Ứng dụng | T-92 đến T-105 |  |  |  |

Mỗi sai lệch gắn với **số hiệu của trường hợp**, không bao giờ chỉ với một ảnh chụp màn hình. Đính kèm mạng, địa chỉ bản triển khai, block, hash và phiên bản ứng dụng.

## Giới hạn của kế hoạch này

Kế hoạch này mô tả những gì mã của phiên bản mới và các quyết định ngày 14 tháng 9 năm 2026 dự kiến. Kế hoạch **không phải là xác thực**: nghiệm thu thành công trên Sepolia không thay thế các chiến dịch kiểm thử.

Các điểm “cần xác nhận khi kiểm thử” phải được quan sát, rồi cập nhật lại vào trang này.

<p class="source-note">Nguồn: <code>contracts/src/CubitHook.sol</code>, <code>CubitLens.sol</code>, <code>interfaces/ICubitHook.sol</code>, <code>interfaces/ICubitLens.sol</code>, <code>libraries/BandLib.sol</code>, <code>libraries/WallLib.sol</code>, <code>periphery/CubitRouter.sol</code>, <code>CubitV2.sol</code>, <code>CubitVault.sol</code>, <code>CubitGovernanceVault.sol</code>, <code>CubitForge.sol</code>, <code>CubitLaunch.sol</code>, các quy trình hiện tại của <code>dapp/src</code> và các quyết định thiết kế ngày 14 tháng 9 năm 2026 được ghi trong <code>contracts/docs/REDESIGN_HANDOFF.md</code>.</p>
