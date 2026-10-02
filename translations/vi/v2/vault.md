---
description: "Gửi CUBIT không chuyển nhượng, khóa 24 giờ và thưởng 3 % mỗi ngày bằng CUBIT, chỉ trả từ quỹ dự trữ và giới hạn ở một ngày."
section: "03 / MÔ-ĐUN V2"
reading: "ĐỌC TRONG 5 PHÚT"
search:
  keywords: [vault, staking, stake, khóa, lock, rút, thưởng, phần thưởng, quỹ dự trữ, dự trữ, claim, mCUBIT]
---

# mCUBIT Vault

Vault cho phép gửi CUBIT vào vị thế **không chuyển nhượng** và nhận thưởng **bằng CUBIT**. Mô hình này không tạo CUBIT và không cấp quyền nào đối với vốn của tường.

Tên mCUBIT chỉ trải nghiệm gửi này; mã không tạo token biên nhận ERC-20 tự do chuyển nhượng.

> **Đã mở trên Ethereum từ ngày 26 tháng 9 năm 2026.**

## Nguồn thưởng

Thưởng được trả **chỉ từ quỹ dự trữ thưởng** của Vault, không bao giờ từ vốn gốc đã gửi. Quỹ dự trữ này được nạp bởi:

- **20 % nguồn cung**, tức 4,2 triệu CUBIT, nạp vào khi khởi chạy;
- **CUBIT của các tường bị đi qua hoàn toàn**, được `deliverAbsorbed()` gửi đến sau các lệnh bán;
- mọi khoản đóng góp tự nguyện: bất kỳ tài khoản nào cũng có thể thêm CUBIT vào quỹ dự trữ bằng `fundRewardReserve(amount)`.

Quỹ dự trữ là hữu hạn: khi quỹ cạn, thưởng dừng lại. **Thưởng chỉ bằng CUBIT**, được nhận bằng `claimCubit()`, và không có lợi suất nào được bảo đảm.

## Tỷ lệ và mức trần

Thưởng là **3 % khoản gửi mỗi ngày**, tính theo tỷ lệ thời gian trôi qua kể từ lần nhận gần nhất.

Số tiền có thể nhận **giới hạn ở một ngày**: sau 24 giờ không nhận, số này không tăng nữa. Để nhận đủ thưởng, cần nhận mỗi ngày; **phần vượt quá chưa nhận sẽ bị mất**.

| Thời gian từ lần nhận gần nhất | Số tiền có thể nhận cho 1 000 CUBIT đã gửi |
| --- | --- |
| 12 giờ | 15 CUBIT |
| 24 giờ | 30 CUBIT |
| 48 giờ | 30 CUBIT: ngày thứ hai bị mất |

Các số này giả định quỹ dự trữ đủ. Nếu quỹ dự trữ còn ít hơn số phải trả, chỉ số dư của quỹ được trả.

## Gửi CUBIT

1. Kiểm tra địa chỉ Vault cung cấp và kết nối giao thức.
2. Phê duyệt Vault chuyển lượng đã chọn.
3. Gọi `stake(amount)` và chờ xác nhận.
4. Đọc `balanceOf(account)`, `unlockAt(account)` và `pendingCubit(account)` trên hợp đồng gửi.

**Mỗi lần gửi thêm khởi động lại khóa 24 giờ cho toàn bộ vị thế của ví đó trong Vault đó.** Lần gửi này cũng trả thưởng đã tích lũy đến lúc đó và bắt đầu lại ngày tính thưởng.

CUBIT đã gửi vẫn là token hiện có. Gửi không phải burn hay giảm nguồn cung.

## Nhận thưởng và rút

`claimCubit()` trả thưởng đã tích lũy và bắt đầu lại ngày tính thưởng. Khóa rút không chặn việc nhận thưởng này.

`withdraw(amount)` trả lại CUBIT đã gửi khi timestamp của chain đạt `unlockAt`. Có thể rút một phần; lệnh rút trả thưởng đã tích lũy trước.

Không ai có thể đình chỉ các đầu ra này. Đầu ra vẫn phụ thuộc quy tắc và hoạt động đúng của hợp đồng giữ vị thế.

## Khi Vault bị thay thế

Đội ngũ có thể thay Vault bất cứ lúc nào, không chậm trễ. Thay thế tác động đến hợp đồng dành cho khoản gửi mới và hợp đồng nhận CUBIT hấp thụ được gửi sau đó. **CUBIT đã gửi, quỹ dự trữ thưởng và ngày mở khóa đã ghi vẫn nằm trong Vault cũ.** Thay thế không chuyển vốn của người dùng.

Sổ đăng ký giữ danh sách các Vault kế tiếp nhau. Kiểm tra địa chỉ đã chọn trước khi đọc số dư, nhận thưởng hoặc rút. Phê duyệt cho Vault trước không cấp quyền cho Vault mới.

Sổ đăng ký yêu cầu Vault mới kết nối với cùng hook và cùng token, không có stake. Việc thay sẽ tắt Vault: hợp đồng mới chỉ nhận khoản gửi sau khi được kích hoạt lại.

## Giới hạn mô-đun

Thưởng phụ thuộc số dư quỹ dự trữ: tỷ lệ 3 % mỗi ngày có thể làm cạn quỹ, và khi đó việc chi trả dừng lại. Kiểm tra khi thay thế xác minh tương thích địa chỉ được khai báo; chúng không chứng minh an toàn của toàn bộ mã thay thế. Kế toán quỹ dự trữ, mức trần một ngày, việc CUBIT từ tường chuyển đến và đầu ra của các Vault cũ phải được xác thực cho mỗi bản phát hành.

<p class="source-note">Nguồn: <code>periphery/CubitVault.sol</code> (<code>pendingCubit</code>, <code>claimCubit</code>, <code>fundRewardReserve</code>, <code>DAILY_REWARD_BPS</code>, <code>REWARD_PERIOD</code>, <code>LOCK_DURATION</code>), <code>CubitHook.deliverAbsorbed</code>, <code>CubitV2.setVault</code> và các quyết định thiết kế ngày 14 tháng 9 năm 2026.</p>
