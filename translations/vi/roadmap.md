---
description: "Các bước của đợt thiết kế lại, các bản CUBIT sắp tới, khung thời gian và điều kiện xác thực."
section: "05 / KIỂM CHỨNG"
reading: "ĐỌC TRONG 5 PHÚT"
search:
  keywords: [lộ trình, lịch, mở, V1, V2, thiết kế lại, các bước, bước, launchpad]
---

# Lộ trình và điều kiện phát hành

Lịch mô tả ý định công bố. **Nhịp phát hành không thay xác thực mã.** Tính năng di chuyển vốn phải chuẩn bị, kiểm thử và chấp nhận trước mở.

`roadmapdev.md` và lộ trình cũ của dapp chứa quy tắc lỗi thời. Trang này nêu lại các mốc, phân biệt công việc đã quyết định, mã đã viết và các phiên bản đã được chứng thực.

## Điều kiện tiên quyết hiện tại

Giao thức đang được thiết kế lại: **một dải thanh khoản duy nhất** thay thế ladder, **tường được đặt và làm trống ở mỗi lệnh bán** và vault trả thưởng bằng CUBIT từ một quỹ dự trữ. FDV khởi chạy được chọn là **3,75 ETH**.

Phiên bản mới này đã triển khai trên mạng chính Ethereum, thị trường đã mở từ ngày 22 tháng 9 năm 2026. Bản triển khai Sepolia dùng để kiểm thử.

## Các bước của đợt thiết kế lại

| Bước | Nội dung | Trạng thái |
| --- | --- | --- |
| 1 | Dải rộng khi khởi chạy; loại bỏ ladder, `rebalance`, `raiseFloor` và keeper | Đã viết mã và kiểm thử cục bộ |
| Các vault | Vault 3 % mỗi ngày bằng CUBIT và vault quản trị của launchpad | Đã viết mã và kiểm thử cục bộ |
| 2 | Tường được tạo ở mỗi lệnh bán; CUBIT của tường bị đi qua chuyển sang vault; token của thị trường con chuyển sang vault quản trị | Đã viết mã và kiểm thử cục bộ |
| 3 | Dọn dẹp: loại bỏ luồng WETH, cơ chế tạm dừng và guardian, cùng các lỗi không còn dùng | Đã viết mã và kiểm thử cục bộ |
| 4 | Khởi chạy trong một giao dịch: 80 % vào dải thanh khoản, 20 % vào quỹ dự trữ của vault, lệnh mua 0,1 ETH | Đã viết mã và kiểm thử cục bộ |
| 5 | Viết lại kiểm thử và bất biến | Chưa thực hiện |

## Các mốc

| Mốc | Chức năng | Trạng thái và điều kiện |
| --- | --- | --- |
| J0 | Thị trường V1 | Phiên bản mới đã triển khai trên Ethereum, thị trường mở ngày 22 tháng 9 năm 2026 tại khối 26.035.793 |
| Ngày 23 tháng 9 năm 2026 | Momentum | Đã mở: trang ứng dụng chỉ đọc, hiển thị tường đang hoạt động, bị tiêu thụ một phần và bị đi qua của từng token |
| Ngày 23 tháng 9 năm 2026 | Forge công khai | Đã mở: launchpad mở cho mọi người, được thêm vào ngày đó cùng vault quản trị của nó, phí khởi chạy 0,005 ETH |
| Ngày 26 tháng 9 năm 2026 | mCUBIT Vault | Đã mở: khóa 24 giờ, thưởng 3 % mỗi ngày bằng CUBIT từ quỹ dự trữ |
| Chưa xác định | Token của launchpad | Chưa được thiết kế; tài sản của vault quản trị sẽ làm NAV cho token này |

Không tính năng nào tự mở: đội ngũ đã mở Momentum và Forge vào ngày 23 tháng 9 năm 2026, rồi mở Vault vào ngày 26 tháng 9 năm 2026, bằng các giao dịch tường minh. Việc quản trị mô-đun của địa chỉ đội ngũ là vĩnh viễn.

## Điều kiện cho Vault

Kế toán thưởng phải đứng vững trước các khoản gửi, rút, nhận thưởng, mức trần một ngày, làm tròn và thay thế, không tạo CUBIT nào, không trả từ vốn gốc và không truy cập vốn của tường. Quỹ dự trữ được nạp khi khởi chạy, sau đó từ các tường bị đi qua.

## Điều kiện cho Momentum và Forge

Momentum vẫn chỉ đọc: tường đang hoạt động, bị tiêu thụ một phần và bị đi qua của từng token. Forge phải giữ độc lập thị trường con và kiểm soát mẫu mã; việc chuyển token từ tường của thị trường con sang vault quản trị đang vận hành trên Ethereum từ ngày 23 tháng 9 năm 2026. Không gì tự mở theo thời gian: đội ngũ đã thêm launchpad, rồi mở nó, bằng các giao dịch tường minh.

## Điều kiện phiên bản sản xuất

Bản phát hành phải công bố định danh, tham số biên dịch, thư viện liên kết, bytecode mong đợi và quyền hạn. Kiểm thử phải trên mã cuối, gắn với bản đó.

Việc điều chỉnh dapp, bao gồm chia nhỏ các lệnh bán đi qua nhiều tường, quy trình ví thật, aggregator, dịch vụ và giám sát bổ sung kiểm thử cục bộ. Một bản triển khai không tự chấp nhận các thay đổi mới này.

## Thông báo lịch sử cần diễn giải lại

“Floor chỉ tăng”, đạt hòa vốn tại vốn hóa định trước, token “giảm phát” nhờ burn của tường hay “bất biến hoàn toàn” không mô tả phiên bản mới và quyền của nó.

Thông báo phải nêu tường được cấp vốn, mục tiêu của tường, vốn đã đặt và phiên bản giao thức. Kết quả lịch sử vẫn xem được với đúng tư cách đó trong [nguồn](sources.md).
