---
description: "Định nghĩa thuật ngữ hướng dẫn CUBIT: dải thanh khoản, tường, mục tiêu, quỹ dự trữ thưởng, tick, hook và claim."
section: "05 / KIỂM CHỨNG"
reading: "THUẬT NGỮ GIAO THỨC"
search:
  keywords: [thuật ngữ, định nghĩa, giải nghĩa, từ vựng, khái niệm]
---

# Bảng thuật ngữ

| Thuật ngữ | Định nghĩa trong CUBIT |
| --- | --- |
| ABI | Mô tả hàm, sự kiện và kiểu để giao tiếp hợp đồng |
| Lệnh mua của deployer | Lệnh mua 0,1 ETH nằm trong giao dịch khởi chạy, chịu thuế 3 % và không bị khóa |
| Địa chỉ đội ngũ | Địa chỉ cố định nhận phần đội ngũ của thuế và có thể thay các mô-đun của sổ đăng ký bất cứ lúc nào, không chậm trễ, rồi kích hoạt chúng; quyền của địa chỉ này là vĩnh viễn |
| Approval | Phê duyệt ERC-20 cho địa chỉ spender với một lượng |
| Dải thanh khoản | Vị thế giao dịch duy nhất đặt khi khởi chạy với 80 % nguồn cung, bao phủ mọi mức giá trên giá khởi chạy và không bao giờ bị rút |
| Burn | Hủy token; phiên bản mới không còn burn CUBIT của tường, chỉ burn phần dư nhỏ do làm tròn khi khởi chạy |
| Mục tiêu | Mức tính ở mỗi lệnh bán, trên giá sau lệnh bán, để đặt tường: 0,4 × giá hiện tại + 0,6 × giá khởi chạy; khi giá bằng hoặc thấp hơn giá khởi chạy, tường được đặt thấp hơn giá hiện tại 1 % |
| Claim ERC-6909 | Đơn vị kế toán giữ trong PoolManager để quyết toán hoặc giữ tài sản |
| Claim thưởng | Lệnh gọi nhận thưởng đã tích lũy; nghĩa khác với claim ERC-6909 |
| Đường cong x·y=k | Đường cong tích không đổi mà lệnh mua và lệnh bán đi theo trong dải thanh khoản |
| CUBIT đang nắm giữ | Nguồn cung lưu hành trừ CUBIT mà dải thanh khoản chưa bán: lượng người nắm giữ có, kể cả CUBIT đã stake |
| Deadline | Timestamp tối đa chấp nhận cho thao tác hoặc chữ ký |
| Exact-input | Swap cố định đầu vào, bảo vệ đầu ra bằng mức tối thiểu |
| Exact-output | Swap cố định đầu ra, bảo vệ đầu vào bằng mức tối đa |
| FDV khởi chạy | Vốn hóa pha loãng hoàn toàn quyết định giá khởi chạy; 3,75 ETH được chọn cho phiên bản mới |
| Phí LP | Phí pool, khác thuế hook |
| Floor | Tên lịch sử dùng trong mã; đọc riêng tường và mục tiêu |
| Hook | Hợp đồng nối thao tác Uniswap v4, ở đây áp dụng cơ chế CUBIT; hook không có quản trị viên nào |
| Idle ETH | ETH đã hạch toán nằm ngoài mọi vị thế; phải nêu ngăn tương ứng |
| Lens | Hợp đồng đọc suy ra số liệu từ hook và pool |
| Thanh khoản / độ sâu | Tài sản thực khả dụng trong vị thế, tùy trạng thái và giá |
| Tường tốt nhất | Tường đang hoạt động gần thị trường nhất, tường đầu tiên mà một lệnh bán gặp; Lens cung cấp giá gộp và giá ròng sau phí và thuế của tường này |
| Tường | Vị thế LP được cấp vốn bằng ETH từ lệnh bán, tại một tick cố định; mỗi tick chỉ có một tường |
| Tường bị tiêu thụ một phần | Tường có một phần ETH đã mua lại CUBIT; tường giữ nguyên vị trí |
| Tường bị đi qua | Tường đã bị lệnh bán chuyển hoàn toàn thành CUBIT; chính lệnh bán đã đi qua tường làm trống tường để chuyển sang quỹ dự trữ của vault |
| Nguồn cung lưu hành | Tổng nguồn cung trừ CUBIT trong tường, CUBIT đang chờ chuyển và quỹ dự trữ thưởng của mọi vault đã đăng ký; CUBIT đã stake vẫn được tính là lưu hành |
| Pending absorbed tokens | CUBIT từ các tường bị đi qua, được giữ riêng trong hook cho đến khi `deliverAbsorbed()` chuyển chúng đi |
| Pending floor ETH | Vốn của tường đang chờ được đặt: 12 % từ lệnh bán và ETH được giải phóng từ các tường bị đi qua, do chính lệnh bán đó đặt; chỉ còn lại phần dư nhỏ quá nhỏ để tạo vị thế và trường hợp cực đoan khi giá ở tận đỉnh dải tick |
| Permissionless | Ai cũng được gọi, chịu điều kiện xác định của hợp đồng |
| PoolId | Định danh suy ra từ toàn bộ PoolKey |
| Giá khởi chạy | Giá ETH mỗi CUBIT cố định khi triển khai: FDV khởi chạy chia cho 21 triệu |
| Sổ đăng ký V2 | Hợp đồng giữ mô-đun hiện tại, bản sửa đổi, các tính năng đang mở và lịch sử vault |
| Quỹ dự trữ thưởng | CUBIT do vault nắm giữ để trả cho người gửi: 20 % nguồn cung khi khởi chạy, sau đó là CUBIT của các tường bị đi qua |
| Slippage | Chênh lệch thực thi chấp nhận so báo giá, chặn bằng giới hạn swap |
| Snapshot | Tập dữ liệu nhất quán đọc tại một block |
| Tick | Đơn vị giá rời rạc của pool, chiều ngược với giá ETH/CUBIT |
| V1 / V2 | Lõi thị trường / tính năng thêm trong lộ trình |
| Vault quản trị | Vault của launchpad nhận phí khởi chạy của Forge bằng ETH, không bao giờ hoàn lại cho người khởi chạy, và token từ tường của thị trường con Forge; mỗi khoản gửi bị khóa 30 ngày, cộng thêm thời gian gia hạn nếu có, sau đó chỉ deployer của vault mới có thể nhận, vĩnh viễn và không thể chuyển nhượng quyền này; deployer này có thể gia hạn khóa, nhưng không bao giờ rút ngắn |

Về đơn vị và phương thức hợp đồng, xem [tích hợp](developper/integration.md).
