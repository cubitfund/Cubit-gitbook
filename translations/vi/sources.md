---
description: "Phạm vi đọc, thứ tự ưu tiên tài liệu, nguồn định hướng mỹ thuật và cách bảo trì GitBook."
section: "05 / KIỂM CHỨNG"
reading: "THAM KHẢO CỦA HƯỚNG DẪN"
search:
  keywords: [nguồn, tham chiếu, tham khảo, tài liệu, HonKit, đặc tả, phiên bản, redesign]
---

# Nguồn và phương pháp

Hướng dẫn này được viết dựa trên mã nguồn cục bộ và các quyết định thiết kế đã chốt ngày **14 tháng 9 năm 2026**. Tệp nêu dưới đây là đường dẫn trong kho, không phải endpoint mạng.

Phiên bản mới được mô tả theo nhánh `redesign/tide-lp-autowalls-vault`. Tham chiếu mã lịch sử chỉ bản sửa đổi `991fca9` của giao thức, giữ trên nhánh `work/v1-v2-fixed-walls`. Tài liệu công bố không cấu thành việc xác thực các hợp đồng được mô tả.

## Thứ tự đọc

Tham chiếu của phiên bản mới là **`contracts/docs/REDESIGN_HANDOFF.md`**. Tài liệu này ghi các quyết định thiết kế và việc hiện thực hóa chúng trong mã; tài liệu này được ưu tiên hơn các tài liệu trước.

Thuế không đổi: **mua 3 % cho đội ngũ**, và **bán 15 %: 12 % cho tường, 3 % cho đội ngũ**. Thanh khoản giao dịch là một dải thanh khoản duy nhất, tường được đặt và làm trống ở mỗi lệnh bán và FDV khởi chạy được chọn là **3,75 ETH**.

Tài liệu **`CUBIT-cahier-des-charges/docs/VERSION_ACTUELLE.md`** từng biểu thị cơ sở khởi chạy bằng **FDV 7 000 USD** trên 21 triệu token. Phiên bản mới cố định FDV trực tiếp bằng ETH; hướng dẫn này không thiết lập tương ứng giữa hai tham chiếu đó.

Muốn biết điều thực sự hoạt động, sau đó phải nối mã, kết quả xác thực và triển khai của cùng phiên bản.

Một chú thích mã không thay quyết định đã xác nhận. Ngược lại, một quyết định không chứng minh một hiện thực hay mạng thực thi nó.

## Mã đã đọc

| Nguồn | Dùng trong hướng dẫn |
| --- | --- |
| `contracts/docs/REDESIGN_HANDOFF.md` | Quyết định đã chốt và việc hiện thực hóa trong mã |
| `contracts/src/CubitToken.sol` | Nguồn cung cố định và quyền burn |
| `contracts/src/CubitHook.sol` | Thuế, dải thanh khoản, tường, tài khoản và kết nối V2 |
| `contracts/src/libraries/BandLib.sol` | Hình học, giá, tick và mục tiêu của tường |
| `contracts/src/libraries/WallLib.sol` | Tường theo tick: cấp vốn và làm trống các tường bị đi qua |
| `contracts/src/CubitLens.sol` và interface | Giá, dải thanh khoản, tường, số dư, nguồn cung lưu hành, CUBIT đang nắm giữ và tường tốt nhất |
| `contracts/src/periphery/CubitRouter.sol` | Swap, giới hạn, phê duyệt và chuyển CUBIT đã hấp thụ |
| `contracts/src/periphery/CubitV2.sol` | Định danh mô-đun và thay thế |
| `contracts/src/periphery/CubitVault.sol` | Khóa, thưởng hằng ngày và quỹ dự trữ |
| `contracts/src/periphery/CubitGovernanceVault.sol` | Khoản gửi bị khóa 30 ngày và việc nhận do deployer thực hiện |
| `contracts/src/periphery/CubitForge.sol` | Launchpad công khai, độc lập thị trường con và địa chỉ vault quản trị |
| `contracts/src/periphery/CubitLaunch.sol` | Khởi chạy trong một giao dịch: dải thanh khoản, quỹ dự trữ của vault và lệnh mua của deployer |
| `dapp/src/chain` | Khám phá, báo giá, ngữ cảnh ký và Vault cũ |
| `dapp/src/pages/Momentum.tsx` | Trang Momentum chỉ đọc: tường đang hoạt động, bị tiêu thụ một phần và bị đi qua |
| `services/` và README của chúng | Bộ chuyển tiếp sự kiện và keeper cũ |
| `contracts/foundry.toml` và package manifest | Lệnh và tham số build |

## Báo cáo và tài liệu lịch sử

Tổng kết tham chiếu của phiên bản cũ là `audit/reports/2026-09-10-v1-v2/BILAN_FINAL_FR.md`. Tổng kết này mô tả ladder, bảo trì bởi keeper và burn của tường, những thứ đã được thay thế trong phiên bản mới.

`roadmapdev.md` và tài liệu đặc tả lịch sử giúp hiểu ý định và mốc V1/V2. Bản gốc được lưu trữ trong `CUBIT-cahier-des-charges/historique/2026-09-10-avant-murs-fixes/`. Các đoạn về một tường đơn điệu duy nhất, đặt E/C, ladder, keeper hay xóa hết quyền quản trị không phải quy tắc của phiên bản mới.

`contracts/docs/STRICT_BURN.md` giải thích diễn tiến lịch sử của việc burn token hấp thụ, đã bị từ bỏ trong phiên bản mới. `contracts/docs/MODULE_SETTERS.md` ghi cách thay ngoại vi. Không số kiểm thử cũ nào được trình bày ở đây như kết quả xác thực phiên bản mới.

Trang lộ trình cũ của dapp là tham chiếu biên tập tại một thời điểm; không dùng riêng nội dung đó để tích hợp phiên bản mới.

## Định hướng mỹ thuật

Theme chuyển các lựa chọn đã có trong dapp:

| Nguồn hình ảnh | Yếu tố dùng lại |
| --- | --- |
| `dapp/src/index.css` | Kem `#f5f1e8`, mực `#111312`, tím `#5b4bff`, chanh `#c7ff3d`, cam `#ff704d`, giấy `#ede7d8` |
| `dapp/src/index.css` | Tiêu đề Archivo đậm và rộng; nhãn Martian Mono; chất liệu nhẹ |
| `dapp/src/components/primitives.tsx` | Viền rõ, bóng lệch, panel và trạng thái |
| `dapp/src/components/Header.tsx` | Logo chữ, ô tím, điều hướng và phân biệt trạng thái |
| `dapp/src/ui.tsx` | Họa tiết sao điểm xuyết và nhãn monospace |

Font được chép cục bộ lúc build cùng giấy phép. Hướng dẫn dùng ngôn ngữ hình ảnh dapp, không dùng lại khẩu hiệu lỗi thời.

## Tài liệu

Engine được chọn là **HonKit 6.2.2**, fork GitBook để tạo sách và tài liệu từ Markdown. Mục lục, tạo tĩnh, tìm kiếm và chuyển trang đến từ framework. Theme CUBIT mở rộng template và style. [Tài liệu HonKit chính thức](https://honkit.netlify.app/).

Cài cục bộ và lệnh `serve` / `build` theo [hướng dẫn bắt đầu chính thức](https://honkit.netlify.app/setup.html). [Cấu hình sách](https://honkit.netlify.app/config.html) nêu gốc nội dung và style. Bản phát hành 6.2.2 xác định phiên bản dùng.

README gốc `gitbook/` mô tả cài đặt, lệnh, kiểm tra trình duyệt và giới hạn công cụ. Xác thực site kiểm tra sách, không xác thực hợp đồng giao thức.

## Duy trì hướng dẫn

Với bản mới, cập nhật tình trạng phiên bản và tham chiếu chuẩn trước. Sau đó đồng bộ quy tắc, API và quy trình thực sự kết nối. Giữ ghi chú lịch sử nếu kết quả cũ không trên mã cuối.

Thêm trang vào `docs/`, tham chiếu trong `SUMMARY.md`, rồi build lại. Nguồn tài liệu được chọn rõ ràng; cấu hình riêng, khóa, RPC có xác thực và dump giao dịch không thuộc site.
