---
description: "Các khái niệm chính: token CUBIT, hook Uniswap v4, dải thanh khoản và tường được cấp vốn bằng ETH ở mỗi lệnh bán."
section: "01 / TÌM HIỂU"
reading: "ĐỌC TRONG 5 PHÚT"
---

# CUBIT trong 5 phút

CUBIT là token ERC-20 gắn với thị trường ETH/CUBIT trên Uniswap v4. Giao thức tự cấp thanh khoản cho pool: **hook** là nhà cung cấp thanh khoản duy nhất và áp dụng thuế theo quy tắc hợp đồng.

Nguồn cung cố định ở **21 triệu CUBIT**, tạo một lần duy nhất. Không có hàm nào cho phép tạo thêm. Trong phiên bản mới, CUBIT được tường mua lại **không còn bị burn**: chúng chuyển vào quỹ dự trữ thưởng của vault.

> Trang này mô tả phiên bản mới. Xem [tình trạng phiên bản](../securite/etat.md).

## Hai sổ của thị trường

| Sổ | Vai trò | Điều có thể thay đổi |
| --- | --- | --- |
| Dải thanh khoản | Một vị thế rộng duy nhất, đặt khi khởi chạy với 80 % nguồn cung; bán CUBIT cho người mua và mua lại CUBIT từ người bán | Tỷ lệ giữa CUBIT và ETH thay đổi theo giá; vị thế không bao giờ bị rút |
| Tường | Các vị thế bằng ETH đặt dưới giá hiện tại, được cấp vốn từ lệnh bán | Nội dung thay đổi khi giá đi qua; tick không bao giờ thay đổi |

Số dư đội ngũ và quỹ dự trữ thưởng của vault được hạch toán riêng. Vì vậy một tổng số dư không đủ để mô tả ETH thực sự khả dụng trong các tường.

## Swap cấp vốn cho những gì

Với **lệnh mua exact-input 1 ETH**, chưa tính gas:

- **0,97 ETH** vào phần swap đến pool, trước phí LP riêng của pool.
- **0,03 ETH** thuộc ngăn đội ngũ.

Với **lệnh bán tạo 1 ETH gộp**, **0,85 ETH** trả người bán, **0,12 ETH** cấp vốn cho tường và **0,03 ETH** cho đội ngũ. Gas trả riêng.

Phiên bản mới hướng tới **phí LP 0,01 %**. Phí pool này tách biệt với thuế mua 3 % và thuế bán 15 %. [Chi tiết thuế](taxes.md).

## Tường mua hình thành thế nào

Ở **mỗi lệnh bán**, trước tiên hook làm trống các tường mà giá đã đi qua hoàn toàn, rồi đặt ETH đang chờ, trong đó có 12 % của lệnh bán, vào một tường tại mục tiêu `0,4 × prix courant + 0,6 × prix de lancement`, tính trên giá sau lệnh bán và làm tròn theo tick. Hai lần cấp vốn rơi vào cùng một tick được cộng dồn vào một tường duy nhất. Sau đó không tường nào bị di chuyển.

Khi giá bằng hoặc thấp hơn giá khởi chạy, mục tiêu này sẽ nằm trên thị trường: khi đó tường được đặt thấp hơn giá hiện tại 1 %, thay vì để vốn chờ một lệnh bán tiếp theo. Không cần lệnh gọi bảo trì nào: việc tạo và làm trống tường là một phần của lệnh bán.

**Công thức chọn vị trí tường; lệnh bán quyết định quy mô.** Một mức giá hiển thị không chứng minh mọi người nắm giữ đều có thể bán ở mức đó. [Mục tiêu và tường mua cố định](murs.md).

## Điều gì diễn ra khi khởi chạy

Việc khởi chạy diễn ra trong một giao dịch duy nhất:

- **80 % nguồn cung**, tức 16,8 triệu CUBIT, được gửi vào dải thanh khoản;
- **20 %**, tức 4,2 triệu CUBIT, được nạp vào quỹ dự trữ thưởng của vault;
- deployer thực hiện **lệnh mua 0,1 ETH**, chịu thuế 3 % như mọi lệnh mua, và số CUBIT mua được không bị khóa.

Không có airdrop hay phân bổ cho đội ngũ. [Dải thanh khoản](ladder.md).

## V1 và V2

**V1** là thị trường: token, hook, dải thanh khoản, tường và swap. **V2** bổ sung Vault, Momentum và Forge, được đội ngũ mở khi quyết định: Momentum và Forge đã mở từ ngày 23 tháng 9 năm 2026, Vault từ ngày 26 tháng 9 năm 2026.

Địa chỉ đội ngũ nhận phần đội ngũ của thuế và thay rồi kích hoạt các mô-đun ngoại vi tương thích của sổ đăng ký; các quyền này là vĩnh viễn. Hook không có quản trị viên nào: không ai có thể tạm dừng swap hay cơ chế tường, và lõi pool giữ các định danh cố định của riêng nó.

Các bước tiếp theo có trong [lộ trình](../roadmap.md).

<p class="source-note">Nguồn trong kho mã: <code>contracts/src/CubitToken.sol</code>, <code>CubitHook.sol</code>, <code>periphery/CubitV2.sol</code> và các quyết định thiết kế ngày 14 tháng 9 năm 2026 được ghi trong <code>contracts/docs/REDESIGN_HANDOFF.md</code>.</p>
