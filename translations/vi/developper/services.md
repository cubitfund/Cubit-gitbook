---
description: "Vận hành bộ chuyển tiếp sự kiện: dry-run, con trỏ, bản sửa đổi mô-đun và từ ngữ về tường; keeper không còn tác dụng."
section: "04 / XÂY DỰNG"
reading: "ĐỌC TRONG 4 PHÚT"
---

# Dịch vụ và vận hành

Kho có hai tiến trình Node: **keeper**, thuộc mô hình cũ, và **bộ chuyển tiếp sự kiện** có thể chuẩn bị bài đăng. Cấu hình cục bộ không chứng minh dịch vụ đang chạy liên tục.

## Không còn keeper trong phiên bản mới

Keeper cũ gọi `rebalance`, `raiseFloor` và burn token hấp thụ. Các hàm bảo trì này đã biến mất: dải thanh khoản không bao giờ được tổ chức lại, tường được đặt và làm trống trong các lệnh bán, và router CUBIT chuyển CUBIT đã hấp thụ sang vault.

Dịch vụ `services/keeper` vẫn nằm trong kho, nhưng không còn lý do tồn tại và không được vận hành với phiên bản mới. Không có khoản thưởng nào được trả: nếu CUBIT đã hấp thụ vẫn đang chờ, chẳng hạn sau một lệnh bán đi qua router khác, bất kỳ tài khoản nào cũng có thể gọi `deliverAbsorbed()`.

## Bộ chuyển tiếp sự kiện

`services/floor-bot` đọc sự kiện, chuẩn bị văn bản, lưu con trỏ và khóa chống trùng `transactionHash:logIndex`.

Dry-run và chế độ đăng có trạng thái riêng. Con trỏ gồm ngữ cảnh chain và hook; dịch vụ dùng block finalized trên các mạng được hỗ trợ. Phải đối chiếu lại khi reorg hoặc checkpoint không nhất quán trước khi tiếp tục.

Bộ chuyển tiếp lưu bền vững `pendingPost` trước đăng. Nếu dịch vụ ngoài đã nhận thông điệp nhưng tiến trình dừng trước ghi thành công, cần kiểm tra thông điệp tồn tại trước thử lại: cơ sở dữ liệu cục bộ và mạng xã hội không thể commit cùng nhau.

GitBook không thực hiện đăng bài. Vận hành thực bộ chuyển tiếp cần cấu hình và cấp phép vận hành riêng.

## Thay đổi mô-đun

Lens hiện tại phân giải từ sổ đăng ký. Giữ định danh lõi và ngữ cảnh bản sửa đổi trong toàn bộ thao tác.

Các dịch vụ đọc ABI và các sự kiện của phiên bản được mô tả. Bộ chuyển tiếp phù hợp với mô hình cũ không được trình bày là đã xác thực cho phiên bản mới nếu chưa nghiệm thu.

## Điều chỉnh từ ngữ cho tường

Bộ chuyển tiếp cũ thông báo sự kiện `FloorRaised`, nay không còn tồn tại. Trong phiên bản mới, một tường có thể được tạo hoặc làm dày ở mỗi lệnh bán (`WallFunded`), đôi khi ở mức giá thấp hơn tường trước, và tường bị đi qua hoàn toàn được làm trống (`WallAbsorbed`) trước khi CUBIT của nó chuyển sang quỹ dự trữ của vault (`AbsorbedDelivered`).

Vì vậy bộ chuyển tiếp cần nêu **tường liên quan, mức giá của tường và vốn được thêm hoặc bị hấp thụ**, không suy ra tăng toàn cục chỉ từ tên sự kiện. Thông điệp cũ “floor luôn tăng” không mô tả chính sách này, và không thông báo nào được trình bày tường như một sự bảo đảm giá.

## Kiểm tra vận hành hữu ích

Theo dõi lỗi RPC, lệch cấu hình, con trỏ, tuổi của block cuối đã xử lý và bài đăng đang chờ. Giữ nhật ký phục hồi và định danh phiên bản, không chứa dữ liệu ký riêng tư.

Giám sát khởi động lại tiến trình không thay việc giải quyết checkpoint không nhất quán hay thay đổi sổ đăng ký.

<p class="source-note">Nguồn: <code>services/floor-bot/README.md</code>, <code>services/keeper/README.md</code>, <code>services/shared</code>, <code>interfaces/ICubitHook.sol</code> và <code>contracts/docs/REDESIGN_HANDOFF.md</code>.</p>
