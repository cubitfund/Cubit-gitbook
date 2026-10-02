---
description: "Trả lời câu hỏi thường gặp về dải thanh khoản, tường được cấp vốn ở mỗi lệnh bán, phí, Vault, quyền hạn và phiên bản."
section: "05 / KIỂM CHỨNG"
reading: "TRẢ LỜI NHANH"
---

# Câu hỏi thường gặp

## Tường mua cụ thể là gì?

Vị thế thanh khoản được cấp vốn bằng ETH trong pool, tại một tick xác định dưới giá hiện tại. Công thức chọn vị trí, còn 12 % từ lệnh bán quyết định quy mô.

## Dải thanh khoản là gì?

Vị thế giao dịch duy nhất: 80 % nguồn cung, đặt khi khởi chạy, bao phủ mọi mức giá trên giá khởi chạy và không bao giờ bị rút. Lệnh mua và lệnh bán đi theo đường cong x·y=k của dải. [Dải thanh khoản](comprendre/ladder.md).

## Mục tiêu có theo đỉnh lịch sử không?

Không. Mục tiêu dùng mức giá mà mỗi lệnh bán để lại: `0,4 × prix courant + 0,6 × prix de lancement`. Với cơ sở minh họa 7 000, từ 100k trở về 60k cho **28,2k**. [Xem phép tính](comprendre/murs.md).

## Tường cũ có hạ theo mục tiêu mới không?

Không. Tường giữ nguyên tại tick của nó. Lần cấp vốn rơi vào cùng tick sẽ làm dày tường đó; tuy nhiên lệnh bán có thể tiêu thụ ETH của tường.

## 12 % có được đặt ở mỗi lệnh bán không?

Có: mỗi lệnh bán đặt ETH đang chờ, trong đó có 12 % của chính lệnh đó, vào một tường tại mục tiêu tính trên giá sau lệnh bán. Khi giá bằng hoặc thấp hơn giá khởi chạy, mục tiêu này sẽ nằm trên thị trường: khi đó tường được đặt thấp hơn giá hiện tại 1 %. Chỉ phần dư nhỏ quá nhỏ để tạo vị thế và trường hợp cực đoan khi giá ở tận đỉnh dải tick mới chờ một lệnh bán tiếp theo.

## Phí LP có nằm trong 15 % không?

Không. 15 % là thuế bán của hook; thuế mua là 3 %. Tỷ lệ LP của phiên bản mới là 0,01 %, theo cơ sở tính riêng của pool. Pool Ethereum đang kết nối áp dụng đúng tỷ lệ này. [Chi tiết phí](comprendre/taxes.md).

## Tường bị đi qua sẽ ra sao?

Tường chỉ bị tiêu thụ một phần vẫn giữ nguyên vị trí và nạp lại ETH nếu giá tăng trở lại. Tường bị đi qua hoàn toàn được làm trống bởi chính lệnh bán đã đi qua nó: CUBIT của nó chuyển vào quỹ dự trữ thưởng của vault. [Xem giải thích](comprendre/burn.md).

## Một lệnh bán có thể đi qua số lượng tường không giới hạn không?

Không. Mỗi tường bị đi qua tốn khoảng 185 000 gas, và một giao dịch bị giới hạn ở 16 777 216 gas: một lệnh bán đi qua tối đa khoảng 88 tường. Vượt quá mức đó, lệnh bán thất bại mà không mất vốn và phải được chia nhỏ. [Rủi ro và giới hạn](securite/risques.md).

## CUBIT có giảm phát không?

Không còn trong phiên bản mới. Nguồn cung giữ cố định ở 21 triệu, không mint, nhưng CUBIT được tường mua lại không còn bị burn: chúng nạp vào quỹ dự trữ thưởng của vault.

## Có còn cần keeper không?

Không. `rebalance` và `raiseFloor` đã bị loại bỏ, và tường được đặt và làm trống trong các lệnh bán. Không có khoản thưởng nào được trả cho người gọi.

## Có ai có thể chặn lệnh bán không?

Không. Hook không có quản trị viên nào, và không ai có thể tạm dừng swap hay cơ chế tường.

## Đội ngũ có còn giữ quyền không?

Có, một cách vĩnh viễn. Địa chỉ đội ngũ nhận phần đội ngũ của thuế và có thể thay các mô-đun ngoại vi của sổ đăng ký bất cứ lúc nào, không chậm trễ, rồi kích hoạt chúng. Các lần thay này không động đến lõi cũng như số dư đã có trong các vault. [Quyền hạn](securite/permissions.md).

## Tính năng V2 đã khả dụng chưa?

Đã khả dụng: Momentum và Forge từ ngày 23 tháng 9 năm 2026, Vault từ ngày 26 tháng 9 năm 2026. [Các tính năng V2](v2/prochaines-fonctionnalites.md).

## Điều gì xảy ra nếu tôi không nhận thưởng mỗi ngày?

Số tiền có thể nhận chỉ tăng tối đa đến mức một ngày, tức 3 % khoản gửi. Quá 24 giờ không nhận, phần vượt quá bị mất. Thưởng cũng bị giới hạn bởi số dư của quỹ dự trữ.

## Gửi thêm có kéo dài khóa Vault không?

Có. Gửi thêm khởi động lại khóa 24 giờ cho toàn bộ vị thế của ví đó trong hợp đồng. Thưởng đã tích lũy có thể được nhận độc lập với khóa rút.

## Vốn của tôi ra sao khi Vault bị thay?

Vốn vẫn nằm trong Vault cũ, cùng quỹ dự trữ thưởng của Vault đó và ngày mở khóa của bạn. Chọn hợp đồng cũ đó để xem vị thế và thực hiện đầu ra. Vốn không tự chuyển sang mô-đun mới.

## Token được tường của thị trường con Forge hấp thụ đi đâu?

Vào vault quản trị của launchpad, nơi cũng nhận phí khởi chạy của Forge bằng ETH. Mỗi khoản gửi bị khóa tại đó 30 ngày kể từ khi được ghi nhận — tức thời với một khoản gửi hay một khoản phí khởi chạy, và tại thời điểm gọi `lockUntracked` với token gửi thẳng vào vault — cộng thêm thời gian gia hạn nếu có, sau đó chỉ deployer của vault này mới có thể nhận: quyền này là vĩnh viễn và không thể chuyển nhượng. Deployer này có thể gia hạn khóa, nhưng không bao giờ rút ngắn. [Momentum và Forge](v2/momentum-forge.md).

## Ai có thể khởi chạy token trên Forge?

Bất kỳ tài khoản nào, bằng cách trả đúng phí khởi chạy 0,005 ETH, khoản phí này vào vault quản trị và không bao giờ được hoàn lại. Forge không thuộc lần khởi chạy CUBIT: đội ngũ đã thêm launchpad và mở nó vào ngày 23 tháng 9 năm 2026. [Momentum và Forge](v2/momentum-forge.md).
