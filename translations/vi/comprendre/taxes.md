---
description: "Mua 3 %, bán 15 % trong đó 12 % cho tường, phí LP mục tiêu 0,01 %: hiểu các cơ sở tính."
section: "01 / TÌM HIỂU"
reading: "ĐỌC TRONG 5 PHÚT"
search:
  keywords: [thuế, phí, fee, tỷ lệ, mua, bán, đội ngũ, tường mua, tường]
---

# Thuế và dòng ETH

**Thuế hook** và **phí LP của pool** là hai thao tác khác nhau. Chúng không cùng cơ sở tính nên không thể cộng như một loại thuế duy nhất.

Các mức thuế này thuộc phiên bản mới và được áp dụng trong pool Ethereum đang kết nối. Kiểm tra [tình trạng phiên bản](../securite/etat.md) và báo giá của pool đang dùng.

## Thuế mua

Tổng thuế là **3 % đầu vào ETH gộp**, toàn bộ thuộc đội ngũ. Với exact-input, thuế nằm trong số tiền gửi router.

| Với lệnh mua 1 ETH | Số tiền | Đích đến |
| --- | --- | --- |
| Phần swap | 0,97 ETH | Pool, sau đó phí LP và đổi sang CUBIT |
| Phần đội ngũ | 0,03 ETH | Hạch toán đội ngũ |

Với mua exact-output, nếu phần pool cần `x` ETH, tổng trước gas xấp xỉ `x / 0,97`, có làm tròn số nguyên. Router áp dụng trần đầu vào người dùng chọn và hoàn phần dư.

## Thuế bán

Tổng thuế là **15 % ETH đầu ra gộp**: **12 % cho tường mua và 3 % cho đội ngũ**.

| Với đầu ra gộp 1 ETH | Số tiền | Đích đến |
| --- | --- | --- |
| ETH ròng của người bán | 0,85 ETH | Ví người nhận |
| Vốn cho tường mua | 0,12 ETH | Tường đặt tại mục tiêu của lệnh bán này, hoặc thấp hơn giá hiện tại 1 % khi giá bằng hoặc thấp hơn giá khởi chạy |
| Phần đội ngũ | 0,03 ETH | Hạch toán đội ngũ |

Người bán nhận **0,85 ETH**, trước gas trả riêng. Để nhận ròng `x` ETH bằng exact-output, pool cần xuất khoảng `x / 0,85` ETH gộp, tùy làm tròn số nguyên và báo giá thực tế.

**Lệnh bán trực tiếp cấp vốn cho tường.** 12 % và 3 % tính trên ETH gộp của lệnh bán, không phải 12 % của thuế 15 %. Phần đội ngũ thuộc hoàn toàn về đội ngũ.

## Phí LP

Tham số `fee` của Uniswap v4 tính theo phần triệu:

| Phiên bản | Tham số | Tỷ lệ LP |
| --- | --- | --- |
| Phiên bản mới | `100` | **0,01 %** |

`tickSpacing` và độ rộng tường là tham số hình học, không phải cách khác để biểu diễn phí LP. Pool CUBIT dùng khoảng cách 10 tick trong mã đã đọc.

Phí LP áp dụng cho phần swap theo cơ chế pool. Báo giá thật xét làm tròn, tick đi qua, thanh khoản và phí giao thức v4 nếu có. **Không trừ thuế lần nữa từ báo giá đã là giá ròng.**

## 12 % đi đâu

Ở mỗi lệnh bán, trước tiên hook làm trống các tường mà giá đã đi qua hoàn toàn, rồi đặt toàn bộ ETH đang chờ, trong đó có 12 % này, vào một tường nằm tại mục tiêu tính trên giá sau lệnh bán. Nếu đã có tường tại tick này, tường đó được làm dày thêm. Khi giá bằng hoặc thấp hơn giá khởi chạy, mục tiêu này thường nằm trên thị trường: khi đó tường được đặt thấp hơn giá hiện tại 1 %. Chỉ phần dư quá nhỏ để tạo thanh khoản, phần thừa khi chạm trần thanh khoản của một tick, và trường hợp cực đoan khi giá ở tận đỉnh dải tick mới nằm lại trong `pendingFloorEth`, cho đến một lệnh bán tiếp theo.

Không còn sweep: việc chuyển một phần ETH của ladder sang tường trước đây đã biến mất cùng ladder. [Mục tiêu và tường mua cố định](murs.md).

## Nguồn thu dự kiến cho V2

| Mô-đun | Nguồn thu | Không dùng làm nguồn vốn |
| --- | --- | --- |
| Vault | Quỹ dự trữ CUBIT: 20 % nguồn cung khi khởi chạy, sau đó là CUBIT từ các tường bị đi qua hoàn toàn | Vốn gốc đã gửi, tạo CUBIT mới, phí LP; không có thưởng bằng WETH |
| Forge | Phí khởi chạy 0,005 ETH, trả bằng ETH cho vault quản trị của launchpad và không bao giờ hoàn lại cho người khởi chạy | Rút vốn của tường cho một thị trường con |

Phí của Forge được thu từ khi Forge mở, ngày 23 tháng 9 năm 2026. Quỹ dự trữ của Vault trả thưởng từ khi Vault mở, ngày 26 tháng 9 năm 2026. Số tiền phụ thuộc hoạt động thực tế.

## Mua rồi bán không tốn đúng 18 %

Chỉ tính thuế tỷ lệ, giá không đổi, không tác động giá hay phí khác, hệ số còn lại là `0,97 × 0,85 = 0,8245`. Mức mất tương ứng là **17,55 %**, không phải cộng máy móc 15 và 3 trên cùng một số tiền.

Giao dịch khứ hồi thực còn phí pool, gas và biến động giá. Số ròng từ báo giá là tham chiếu cho từng giao dịch. [Mua và bán](../utiliser/swaps.md).

<p class="source-note">Phân bổ thuế: các quyết định thiết kế ngày 14 tháng 9 năm 2026. Mã: <code>CubitHook._creditBuyTax</code>, <code>_creditSellTax</code>, <code>_placeWall</code> và <code>periphery/CubitRouter.sol</code>.</p>
