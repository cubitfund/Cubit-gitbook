---
description: "Các tính năng V2 của CUBIT: Momentum và Forge, đã mở từ ngày 23 tháng 9 năm 2026, và Vault, đã mở từ ngày 26 tháng 9 năm 2026."
section: "03 / MÔ-ĐUN V2"
reading: "ĐỌC TRONG 3 PHÚT"
---

# Các tính năng V2

V2 mở rộng thị trường CUBIT với ba mục đích: gửi CUBIT để nhận thưởng hằng ngày bằng CUBIT, quan sát thị trường và khởi chạy token mới trên một launchpad công khai.

Momentum và Forge đã mở từ ngày 23 tháng 9 năm 2026, Vault từ ngày 26 tháng 9 năm 2026.

## Mở các tính năng

| Tính năng | Mở | Mục đích dự kiến |
| --- | --- | --- |
| mCUBIT Vault | Ngày 26 tháng 9 năm 2026 | Gửi CUBIT, khóa 24 giờ, thưởng bằng CUBIT trả từ quỹ dự trữ |
| Momentum | Ngày 23 tháng 9 năm 2026 | Trang ứng dụng chỉ đọc: tường đang hoạt động, tường bị tiêu thụ một phần và lịch sử tường bị đi qua |
| Forge | Ngày 23 tháng 9 năm 2026, cùng với việc thêm launchpad | Launchpad công khai: bất kỳ tài khoản nào cũng khởi chạy thị trường con độc lập bằng cách trả phí khởi chạy 0,005 ETH |

Thay một mô-đun sẽ đóng tính năng của nó cho đến khi đội ngũ mở lại.

## Thưởng cho khoản gửi

[Vault](vault.md) cung cấp vị thế gửi không chuyển nhượng, khóa 24 giờ và thưởng bằng CUBIT bằng 3 % khoản gửi mỗi ngày, cần nhận mỗi ngày. Thưởng chỉ được trả từ một quỹ dự trữ: 20 % nguồn cung nạp vào khi khởi chạy, sau đó là CUBIT của các tường bị đi qua hoàn toàn. Không có thưởng bằng WETH.

## Quan sát và tạo mới

[Momentum và Forge](momentum-forge.md) có hai chức năng riêng: quan sát thị trường và khởi chạy thị trường con. Momentum vẫn chỉ đọc. Forge là một launchpad công khai, được thêm sau khi CUBIT khởi chạy; phí khởi chạy bằng ETH và token được tường của thị trường con hấp thụ chuyển vào vault quản trị của launchpad.

## Quyền liên quan mô-đun

Địa chỉ đội ngũ có thể thay các mô-đun ngoại vi của sổ đăng ký bất cứ lúc nào, không chậm trễ, rồi kích hoạt chúng. Các quyền này là vĩnh viễn.

Thay thế không lấy vốn vị thế Vault cũ và không di chuyển dự trữ thị trường con đã tạo. Mỗi mô-đun cho người dùng phải được xác định và kiểm tra. [Quyền hạn và thay thế](../securite/permissions.md).

[Lộ trình](../roadmap.md) nêu chi tiết tiêu chí cho các lần ra mắt.
