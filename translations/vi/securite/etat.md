---
description: "Tình trạng ngày 26 tháng 9 năm 2026: phiên bản mới đã triển khai trên Ethereum, thị trường đã mở, Vault, Momentum và Forge đã mở."
section: "05 / KIỂM CHỨNG"
reading: "ĐỌC TRONG 4 PHÚT"
search:
  keywords: [phiên bản, trạng thái, testnet, Sepolia, mainnet, xác thực, kiểm toán, triển khai, đã triển khai, redesign]
---

# Tình trạng thực tế các phiên bản

**Hướng dẫn này mô tả phiên bản CUBIT mới.** Dapp kết nối dùng bản triển khai Ethereum của phiên bản này, với phí LP 0,01 %. Thị trường đã mở từ ngày 22 tháng 9 năm 2026, tại khối 26.035.793.

Ấn bản hướng dẫn này đề ngày **26 tháng 9 năm 2026**. Ấn bản dựa trên các quyết định thiết kế, mã của phiên bản mới và báo cáo trong kho.

## Ba trạng thái riêng

| Phạm vi | Trạng thái trong ấn bản |
| --- | --- |
| Quyết định thiết kế, chốt ngày 14 tháng 9 năm 2026 | Mua 3 % đội ngũ; bán 15 % (12 % tường, 3 % đội ngũ); dải thanh khoản duy nhất gồm 80 % nguồn cung; tường được tạo ở mỗi lệnh bán; CUBIT của tường bị đi qua chuyển sang quỹ dự trữ của vault; vault 3 % mỗi ngày; FDV khởi chạy 3,75 ETH |
| Mã của phiên bản mới | Các thành phần liệt kê trong bảng tiếp theo |
| Ethereum nối dapp | Bản hiện hành: mua 3 %, bán 15 % trong đó 12 % cho tường, LP fee 100 = 0,01 %, dải thanh khoản duy nhất 80 % và tường đặt ở mỗi lệnh bán, với sổ đăng ký V2 và mô-đun thay được |

Đổi mã nguồn cục bộ không đổi hợp đồng đã triển khai. Đồng bộ tài liệu không chuyển vốn của pool cũ.

## Các thành phần đang chạy

| Phần | Trạng thái |
| --- | --- |
| Dải rộng khi khởi chạy, loại bỏ ladder và bảo trì | Đang chạy trên Ethereum |
| Tường được đặt và làm trống ở mỗi lệnh bán, chuyển CUBIT của tường sang vault | Đang chạy trên Ethereum |
| Vault 3 % mỗi ngày bằng CUBIT, trả từ quỹ dự trữ | Đang chạy trên Ethereum từ ngày 26 tháng 9 năm 2026 |
| Vault quản trị của launchpad: phí khởi chạy bằng ETH và token của thị trường con Forge | Đang chạy trên Ethereum từ ngày 23 tháng 9 năm 2026 |
| Momentum: tường đang hoạt động, bị tiêu thụ một phần và bị đi qua của từng token | Đang chạy trên Ethereum từ ngày 23 tháng 9 năm 2026 |
| Forge công khai: thị trường con độc lập, phí khởi chạy 0,005 ETH | Đang chạy trên Ethereum từ ngày 23 tháng 9 năm 2026 |
| Thưởng của Vault chỉ bằng CUBIT, hook không có quản trị viên | Có trong mã đã triển khai trên Ethereum |
| Khởi chạy trong một giao dịch: 80 % vào dải thanh khoản, 20 % vào quỹ dự trữ của vault và lệnh mua 0,1 ETH | Đang chạy trên Ethereum |

Các thành phần này đã triển khai trên Ethereum từ ngày 22 tháng 9 năm 2026, riêng launchpad và Momentum từ ngày 23 tháng 9 năm 2026; Vault nhận khoản gửi từ ngày 26 tháng 9 năm 2026. Chúng được bao phủ bởi kiểm thử Foundry, fuzzing, bất biến, phân tích tĩnh và kiểm chứng ký hiệu của kho mã. Các bước tiếp theo có trong [lộ trình](../roadmap.md).

## Báo cáo lịch sử chứng minh gì

Tổng kết Sepolia mô tả triển khai bản trước, kiểm tra runtime và kết nối, mua bán nghiệm thu, đặt tường và kiểm tra từ chối thao tác không đủ điều kiện.

Bằng chứng thuộc phiên bản đó. Chúng không kiểm thử dải thanh khoản, tường được tạo ở mỗi lệnh bán hay vault mới.

Ở bản sửa đổi lịch sử `991fca9`, bộ Solidity đầy đủ có **133 thành công và 15 thất bại trong 148 kiểm thử**. Kết quả và giới hạn ở tổng kết trạng thái đã công bố. Đây không phải số liệu xác thực của phiên bản mới.

## Điều chưa phải xác thực đầy đủ

Biên dịch thành công kiểm tra việc tạo bytecode. Một mình nó không chứng minh bất biến kế toán, hành vi của một tập hợp tường bị đi qua, nhất quán frontend hay giao dịch trên mạng đã chọn.

Tương tự, so hash runtime không có nghĩa đã công bố mã nguồn trên explorer. Kiểm thử frontend tự động không thay nghiệm thu ví trình duyệt hoặc di động thật.

Việc xác thực đầy đủ phiên bản mới còn bao gồm tách biệt tài khoản, vault không bị rút vượt mức, CUBIT của các tường được làm trống đến được quỹ dự trữ và không tác nhân nào có thể rút ETH của tường với tỷ lệ có lợi.

## Theo nguồn nào

Với phiên bản mới, tham chiếu là tài liệu bàn giao `contracts/docs/REDESIGN_HANDOFF.md` của nhánh `redesign/tide-lp-autowalls-vault`. Tài liệu này ghi các quyết định đã chốt và việc hiện thực hóa chúng trong mã.

Với lịch sử, điểm bắt đầu vẫn là tổng kết tiếng Pháp của bản `991fca9`. Manifest công khai trong `contracts/deployments/` định danh các bản triển khai hiện có.

[Trang Nguồn](../sources.md) nêu thứ tự đọc và tài liệu đã thành lịch sử.
