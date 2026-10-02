---
description: "Giới hạn cụ thể: độ sâu hữu hạn của dải thanh khoản và tường, gas của các tường bị đi qua, quỹ dự trữ thưởng, tích hợp, thay mô-đun và bằng chứng phiên bản."
section: "05 / KIỂM CHỨNG"
reading: "ĐỌC TRONG 5 PHÚT"
search:
  keywords: [bảo mật, an toàn, rủi ro, giới hạn, thua lỗ, kiểm toán, quỹ dự trữ, dự trữ, rút vốn, gas]
---

# Rủi ro và giới hạn

Dải thanh khoản và tường là các vị thế LP. Sự hiện diện của chúng xác định thanh khoản khả dụng, không làm kết quả giao dịch độc lập với giá, phí hoặc trạng thái pool.

> Các giới hạn dưới đây không phải là danh sách đầy đủ. Mã có thể chứa lỗi mà các kiểm thử chưa phát hiện.

## Giá và thực thi

Dải thanh khoản chỉ giữ ETH do người mua đưa vào: độ sâu 3 ETH khi khởi chạy là ảo. Khi giá trở về giá khởi chạy, dải chỉ còn chứa CUBIT. Còn các tường chỉ chứa ETH mà lệnh bán đã đặt vào.

Thị trường, mục tiêu của tường tiếp theo, giá của một tường và số tiền ròng nhận được từ lệnh bán là dữ liệu riêng. Dùng báo giá cho lượng dự định. Biến động mạnh giữa báo giá và thực thi có thể dẫn đến bị từ chối bởi mức nhận tối thiểu hoặc trần đầu vào; thuế, phí pool và gas vẫn là chi phí thật.

## Tường và kế toán

Mỗi tường bị đi qua tốn khoảng 185 000 gas cho lệnh bán làm trống nó. Vì EIP-7825 giới hạn mỗi giao dịch ở 16 777 216 gas, một lệnh bán đi qua tối đa khoảng 88 tường: vượt quá mức đó, lệnh bán thất bại mà không mất vốn và phải được chia thành nhiều lệnh bán. Một lần chuyển CUBIT đã hấp thụ thất bại không chặn lệnh bán: số CUBIT này vẫn được giữ riêng trong hook và bất kỳ ai cũng có thể thực hiện lại việc chuyển.

Không có bằng chứng công bố nào bảo đảm rằng một tác nhân không thể rút ETH tích lũy trong tường với tỷ lệ có lợi, chẳng hạn bằng cách mua sớm rồi bán vào các tường được cấp vốn bởi những lệnh bán khác.

Tách biệt tài khoản phải luôn đúng sau mua, bán, hấp thụ, thưởng và thay thế. Kích thước hợp đồng, liên kết thư viện và tham số biên dịch cũng thuộc phạm vi kiểm tra.

## Vault và quỹ dự trữ

Thưởng 3 % mỗi ngày được trả từ một quỹ dự trữ hữu hạn: với nhịp này, quỹ có thể cạn và việc chi trả dừng lại. Thưởng không được nhận quá một ngày sẽ bị mất.

CUBIT trả làm thưởng có thể giao dịch: nếu được bán, chúng tạo áp lực lên thị trường như mọi lệnh bán khác. Phí khởi chạy của Forge và token từ tường của thị trường con được chuyển vào vault quản trị, nơi chỉ deployer mới có thể nhận các đợt đã mở khóa, vĩnh viễn và không thể chuyển nhượng.

## Tích hợp và mô-đun

Router bên thứ ba không nhất thiết gọi `deliverAbsorbed()` sau lệnh bán: khi đó CUBIT đã hấp thụ vẫn đang chờ cho đến khi có một lệnh gọi công khai. Tương thích aggregator phải kiểm thử với thuế hook và phiên bản pool.

Mô-đun thay được tạo sự tin cậy vào quyết định tương lai của đội ngũ: đội ngũ có thể thay chúng ngay lập tức, không chậm trễ, và bảo vệ khóa riêng của địa chỉ mình. Kiểm tra getter không chứng minh mã chọn an toàn. Địa chỉ mới cần xem lại phê duyệt hoặc chữ ký.

Hook không có quản trị viên nào: không ai có thể tạm dừng swap hay cơ chế tường, kể cả khi có sự cố. Ngược lại, địa chỉ đội ngũ giữ quyền vĩnh viễn đối với các mô-đun của sổ đăng ký.

## Frontend và dữ liệu

Hiển thị có thể dùng mô phỏng, manifest cũ hoặc dữ liệu lỗi thời; dapp hiện tại đọc phiên bản đang vận hành. Giao diện phải định danh mạng và block, báo lỗi, ngăn ký trong ngữ cảnh đã mất nhất quán.

Số liệu USD phụ thuộc cách quy đổi được chọn: FDV khởi chạy cố định bằng ETH và không theo đồng đô la.

## Kiểm thử cho phép kết luận gì

Kiểm thử và chiến dịch bất biến cung cấp bằng chứng cho tình huống, trạng thái và bản sửa đổi thực sự được khảo sát. Các chiến dịch lịch sử áp dụng cho mô hình cũ và không xác thực phiên bản mới. Chiến dịch dài thành công không phải chứng minh hình thức tổng quát.

Ấn bản này không bảo đảm rằng sẽ không có thua lỗ. [Tình trạng thực tế các phiên bản](etat.md) nêu chi tiết những gì đã được kiểm thử, còn [lộ trình](../roadmap.md) nêu các bước tiếp theo.

<p class="source-note">Nguồn: <code>contracts/docs/REDESIGN_HANDOFF.md</code>, <code>CubitHook.sol</code>, <code>WallLib.collectCrossed</code>, <code>CubitRouter._finishSwap</code>, <code>periphery/CubitVault.sol</code>, <code>periphery/CubitGovernanceVault.sol</code> và, với lịch sử, <code>audit/reports/2026-09-10-v1-v2/BILAN_FINAL_FR.md</code>.</p>
