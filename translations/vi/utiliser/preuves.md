---
description: "Phân biệt thị trường, dải thanh khoản, mục tiêu, tường, vốn đang chờ và dữ liệu on-chain trên dashboard CUBIT."
section: "02 / SỬ DỤNG"
reading: "ĐỌC TRONG 4 PHÚT"
search:
  keywords: [proof, bằng chứng, dashboard, dữ liệu, dữ liệu on-chain, floor, mô phỏng, độ sâu, dải thanh khoản]
---

# Đọc dữ liệu dapp

Trang Proof đối chiếu số hiển thị với trạng thái và sự kiện giao thức. Bắt đầu từ **mạng, bản triển khai, phiên bản và block đọc** trước khi diễn giải số tiền.

> Dapp công khai đọc bản triển khai Ethereum đang vận hành và ABI của nó. Dữ liệu dưới đây mô tả những gì một giao diện phải phân biệt.

## Các số cần phân biệt

| Dữ liệu | Mô tả |
| --- | --- |
| Giá thị trường | Giá pool hiện tại, khác kết quả ròng cho lượng cụ thể |
| ETH của dải thanh khoản | ETH mà dải thực sự nắm giữ theo giá hiện tại, do người mua đưa vào |
| CUBIT của dải thanh khoản | CUBIT mà dải vẫn còn chào bán cho người mua |
| Mục tiêu của tường tiếp theo | Mức tính theo giá hiện tại, khác với vị thế đã có vốn |
| Tường hoạt động | Vị thế đã có vốn, mỗi vị thế có ID, tick và thanh khoản còn lại |
| ETH đang chờ | Vốn của tường còn lại chưa được đặt: phần dư nhỏ quá nhỏ để tạo vị thế, hoặc giá ở tận đỉnh dải tick |
| CUBIT đang chờ chuyển | CUBIT từ các tường bị đi qua, được giữ riêng trong hook cho đến khi được chuyển sang vault |
| Quỹ dự trữ thưởng | CUBIT do vault nắm giữ để trả cho người gửi, tách biệt với khoản gửi |
| Nguồn cung lưu hành | Tổng nguồn cung trừ CUBIT trong tường, CUBIT đang chờ chuyển và quỹ dự trữ thưởng của các vault; CUBIT gửi vào vault vẫn được tính là lưu hành |

Phải đọc mức giá của tường cùng lượng ETH còn lại. ETH của dải thanh khoản và ETH của các tường thuộc hai sổ riêng biệt.

## Điều thay đổi với phiên bản mới

View cũ hiển thị ladder, cushion, hàng đợi burn và màn hình bảo trì. Phiên bản mới thay chúng bằng một dải thanh khoản duy nhất, các tường được đặt và làm trống ở mỗi lệnh bán và quỹ dự trữ thưởng trong vault. Không còn trang Keepers.

Tên lịch sử `floorPrice` mô tả tường được cấp vốn gần nhất: không được đọc như mức tối thiểu toàn thị trường. Tường mới có thể được đặt thấp hơn tường trước khi giá đã giảm.

Các trường mới được nêu chi tiết ở [tích hợp](../developper/integration.md). Dapp kết nối Ethereum đọc các trường của phiên bản hiện hành.

## Giá gộp, giá ròng và báo giá

Tham chiếu gộp biểu thị mức giá vị thế. Tham chiếu ròng có thể gồm biên khoảng, phí LP, thuế bán và giả định phí giao thức v4.

Lệnh bán thực phụ thuộc lượng, vị thế đi qua, làm tròn và gas. “Net floor” không phải phép tính hiệu suất ví và không thay thế báo giá.

## Chế độ dữ liệu

| Hiển thị | Diễn giải |
| --- | --- |
| On-chain, block xác định | Dữ liệu từ bản triển khai được chỉ định |
| Đang tải | Lần đọc đầu chưa hoàn tất |
| Dữ liệu cũ hoặc RPC lỗi | Trạng thái cuối đã biết, không cho phép ký |
| Mô phỏng hoặc trình diễn | Minh họa cơ chế tại máy cục bộ |

Với bản phát hành tương lai, kiểm tra thông báo khả dụng và địa chỉ mô-đun cung cấp cho người dùng.

## Kiểm tra lại

Kiểm tra định danh token, hook, pool, rồi mô-đun hiện tại và `moduleRevision` của sổ đăng ký. Đối chiếu sự kiện với hash giao dịch và block chuẩn của chúng.

Trang Proof cho phép theo dõi thuế và tường. Ảnh chụp màn hình hay báo cáo cũ không thay thế việc xác định phiên bản này. [Tình trạng thực tế các phiên bản](../securite/etat.md).

<p class="source-note">Nguồn: <code>CubitLens.sol</code>, <code>interfaces/ICubitLens.sol</code> và, với frontend, <code>dapp/src/chain/snapshot.ts</code>, <code>releases.ts</code> và <code>events.ts</code>.</p>
