---
description: "Quy trình mua bán CUBIT: phiên bản pool, báo giá ròng, slippage, phê duyệt và biên nhận giao dịch."
section: "02 / SỬ DỤNG"
reading: "ĐỌC TRONG 5 PHÚT"
---

# Mua và bán

Dapp đổi ETH/CUBIT qua router của bản triển khai đã chọn. Hook áp dụng thuế; số ước tính nhận phải là số ròng sau các thuế đã có trong báo giá.

> Dapp kết nối Ethereum dùng phiên bản hiện hành với **phí LP 0,01 %** và đọc ABI của phiên bản đó. Khi thị trường chưa mở, không thể giao dịch. Bản trình diễn hoặc chế độ mô phỏng không phải trạng thái on-chain.

## Trước khi chuẩn bị swap

Kiểm tra mạng ví, bản triển khai hiển thị và block dữ liệu. Dành ETH cho gas ngoài số tiền đổi. Dapp phải báo RPC không khả dụng hoặc dữ liệu cũ, ngăn ký dựa trên trạng thái chưa xác minh.

Đổi tài khoản, mạng, số tiền hoặc địa chỉ router đều cần báo giá mới. Địa chỉ ngoại vi có thể đổi qua sổ đăng ký V2.

## Mua CUBIT

1. Chọn số ETH. Với exact-input, thuế mua 3 % đã nằm trong số đó.
2. Đọc CUBIT ròng ước tính, phí và mức nhận tối thiểu theo dung sai slippage.
3. Kiểm tra mô phỏng và chi tiết trong ví rồi ký.
4. Chờ biên nhận thành công và số dư on-chain làm mới.

Mua dùng ETH gốc qua `msg.value`. Router CUBIT không dùng Permit2 trên đường này. Trong phiên bản mới, lệnh mua lấy CUBIT ra khỏi dải thanh khoản theo đường cong x·y=k của dải.

## Bán CUBIT

Bán có thể cần **phê duyệt ERC-20** để router chuyển lượng CUBIT đã chọn. Frontend chuẩn bị phê duyệt đúng lượng yêu cầu.

Sau xác nhận phê duyệt, dapp kiểm tra lại tài khoản, mạng, bản sửa đổi sổ đăng ký và độ mới báo giá trước swap. Nếu hạn mức cũ không đủ, phê duyệt và bán là hai giao dịch riêng.

Bán trả ETH ròng sau thuế 15 %: 12 % ETH gộp cấp vốn cho tường, 3 % cho đội ngũ. Trong phiên bản mới, lệnh bán làm trống các tường mà lệnh đó đi qua hoàn toàn và đặt ETH đang chờ vào một tường; sau đó router CUBIT chuyển số CUBIT đã hấp thụ sang quỹ dự trữ của vault.

## Mức nhận tối thiểu và hạn chót

**Slippage** giới hạn độ lệch chấp nhận so với báo giá. Thuế đã có trong báo giá không phải lý do tự cộng 15 điểm phần trăm slippage.

Trong frontend đã đọc, báo giá còn mới trong **30 giây**. Hạn giao dịch tính từ timestamp của chain. Các kiểm tra có thể ngăn ký sau khi chờ phê duyệt lâu; khi đó cần xem lại báo giá mới.

Giao dịch bị giới hạn từ chối đang bảo vệ số tối thiểu hoặc tối đa đã thỏa thuận. Thất bại không có nghĩa nên bỏ giới hạn.

## Nếu giao dịch không qua

| Tình huống | Hành động hữu ích |
| --- | --- |
| Sai mạng hoặc đổi tài khoản | Trở về ngữ cảnh mong muốn và lấy báo giá mới |
| Báo giá hết hạn | Tính lại số ròng và mức nhận tối thiểu |
| Router hoặc bản sửa đổi thay đổi | Kiểm tra địa chỉ hiện tại và thao tác mới; phê duyệt cũ vẫn thuộc spender cũ |
| Thiếu thanh khoản | Kiểm tra báo giá số nhỏ hơn và các vị thế hiện có |
| Lệnh bán đi qua rất nhiều tường | Chia nhỏ lệnh bán: quá khoảng 88 tường bị đi qua, lệnh bán vượt giới hạn gas của một giao dịch |
| RPC không khả dụng | Chờ đọc on-chain hợp lệ trước khi ký |
| Giao dịch đã gửi | Kiểm tra hash và biên nhận trước khi chuẩn bị giao dịch khác |

Router từ chối đầu vào chưa dùng hết và đầu ra chính xác chưa đáp ứng đủ. EVM hoàn tác số vốn đã chi khi giao dịch revert, trừ gas.

## Kiểm tra kết quả

Hash nghĩa là giao dịch đã gửi; chỉ biên nhận cho biết thành công. Kiểm tra mạng explorer, trạng thái, người nhận và sự kiện `BuyTaxed` hoặc `SellTaxed`.

Giá tham chiếu tường không thay thế báo giá cho lệnh cụ thể. [Đọc dữ liệu dapp](preuves.md).

<p class="source-note">Nguồn: <code>dapp/src/chain/swap.ts</code>, <code>executeSwap.ts</code>, <code>deployment.ts</code> và <code>contracts/src/periphery/CubitRouter.sol</code>. Nghiệm thu ví trình duyệt/di động tách biệt với kiểm thử tự động.</p>
