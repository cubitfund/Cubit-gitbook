---
description: "Hướng dẫn CUBIT bằng tiếng Việt: thuế, dải thanh khoản, tường được cấp vốn từ lệnh bán và các mô-đun V2, cùng tình trạng thực tế của từng phần."
section: "CHÀO MỪNG / CUBIT"
reading: "GIẢI THÍCH GIAO THỨC"
home: true
search:
  keywords: [trang chủ, tài liệu, hướng dẫn, CUBIT, bắt đầu]
---

<div class="home-hero">
  <p class="eyebrow">UNISWAP V4 · THANH KHOẢN CỦA GIAO THỨC</p>
  <h1>Hiểu<span class="line-break"></span>điều gì<span class="line-break"></span><span class="highlight">giữ vững các tường mua.</span></h1>
  <span class="hero-spark" aria-hidden="true"></span>
  <p class="lead">Một dải thanh khoản được đặt khi khởi chạy. Các lệnh bán cấp vốn cho tường bằng ETH. Hướng dẫn này giải thích quy tắc, cách dùng và giới hạn của CUBIT.</p>
  <div class="hero-actions">
    <a href="comprendre/essentiel.md" class="primary-button">Bắt đầu tại đây →</a>
    <a href="securite/etat.md" class="secondary-button">Xem tình trạng phiên bản ↗</a>
  </div>
</div>

<div class="edition-alert">
  <span class="alert-icon" aria-hidden="true">!</span>
  <p><strong>Hướng dẫn này mô tả phiên bản CUBIT mới.</strong><span class="line-break"></span>CUBIT đã triển khai trên Ethereum và ứng dụng đọc bản triển khai đó, với phí LP 0,01 %. Thị trường đã mở từ ngày 22 tháng 9 năm 2026: mua và bán diễn ra trong ứng dụng.</p>
</div>

<dl class="metric-strip">
  <div><dt>Tổng cung</dt><dd>21 triệu</dd><small>CUBIT · không phát hành thêm</small></div>
  <div><dt>Thuế mua</dt><dd>3 %</dd><small>Phần của đội ngũ</small></div>
  <div><dt>Thuế bán</dt><dd>15 %</dd><small>12 % tường mua / 3 % đội ngũ</small></div>
  <div><dt>Phí LP mục tiêu</dt><dd>0,01 %</dd><small>Phiên bản mới · fee 100</small></div>
</dl>

<div class="home-heading"><h2>Chọn điểm bắt đầu.</h2><span>01 — LỘ TRÌNH ĐỌC</span></div>

<div class="guide-cards">
  <a href="comprendre/murs.md" class="guide-card"><span class="card-index">01 / TÌM HIỂU</span><strong>Tường mua được<span class="line-break"></span>cấp vốn thế nào.</strong><p>Giá mục tiêu, 12 % của mỗi lệnh bán và các tường cố định tại tick của chúng.</p><span class="card-link">Khám phá cơ chế →</span></a>
  <a href="utiliser/swaps.md" class="guide-card"><span class="card-index">02 / SỬ DỤNG</span><strong>Đọc trước<span class="line-break"></span>khi ký.</strong><p>Báo giá ròng, phê duyệt và dữ liệu on-chain.</p><span class="card-link">Mở hướng dẫn sử dụng →</span></a>
  <a href="developper/architecture.md" class="guide-card"><span class="card-index">03 / XÂY DỰNG</span><strong>Từ hợp đồng<span class="line-break"></span>đến giao diện.</strong><p>Hook, dải thanh khoản, sổ đăng ký V2 và các vault.</p><span class="card-link">Khám phá mã nguồn →</span></a>
</div>

<div class="home-heading"><h2>Một thị trường, hai sổ riêng biệt.</h2><span>02 — CÁCH VẬN HÀNH</span></div>

<div class="mechanism-strip">
  <div><div class="number">01 — LỆNH BÁN</div><strong>12 % cấp vốn<span class="line-break"></span>cho một tường ở mỗi lệnh bán.</strong><p>Tường được đặt tại mục tiêu tính sau lệnh bán; khi giá bằng hoặc thấp hơn giá khởi chạy, tường được đặt thấp hơn giá hiện tại 1 %.</p></div>
  <div><div class="number">02 — TƯỜNG MUA</div><strong>Mức giá cố định.<span class="line-break"></span>ETH hữu hạn.</strong><p>Giá của tường và khả năng hấp thụ là hai thông tin khác nhau.</p></div>
  <div><div class="number">03 — DẢI THANH KHOẢN</div><strong>Thanh khoản<span class="line-break"></span>đặt một lần.</strong><p>80 % nguồn cung, từ giá khởi chạy đến đỉnh đường cong, không bao giờ bị rút ra.</p></div>
</div>

## Điểm cốt lõi

Mỗi lệnh bán dành **12 % ETH gộp của lệnh đó** cho các tường. Trước tiên hook làm trống các tường mà giá đã đi qua hoàn toàn, rồi đặt ETH đang chờ vào một tường tại `cible = 0,4 × prix courant + 0,6 × prix de lancement`, tính trên giá sau lệnh bán. Khi giá bằng hoặc thấp hơn giá khởi chạy, lúc mục tiêu này sẽ nằm trên thị trường, tường được đặt thấp hơn giá hiện tại 1 %. Với cơ sở minh họa 7 000 đơn vị, mục tiêu là **16,2k khi thị trường ở 30k**, **44,2k ở 100k**, rồi **28,2k nếu thị trường trở về 60k**. Mục tiêu không phụ thuộc đỉnh lịch sử.

Tường giữ nguyên tại tick của nó. Khi bị đi qua hoàn toàn, tường được làm trống và CUBIT của nó chuyển vào quỹ dự trữ thưởng của vault: chúng không còn bị burn. Quy tắc này không tạo thêm vốn hay khả năng mua lại vô hạn. [Xem ví dụ và trình mô phỏng mục tiêu](comprendre/murs.md).

## Tài liệu nêu rõ từng trạng thái

Hướng dẫn mô tả giao thức đúng như mã đã viết và nêu rõ **bản triển khai Ethereum đang vận hành**. Trong V2, Momentum và Forge đã mở từ ngày 23 tháng 9 năm 2026, còn Vault từ ngày 26 tháng 9 năm 2026. Các bước tiếp theo có trong [lộ trình](roadmap.md).

Để kiểm tra một phiên bản, bắt đầu với [tình trạng phiên bản](securite/etat.md), rồi [quyền hạn](securite/permissions.md) và [giới hạn](securite/risques.md). Báo cáo kiểm thử cũ không chứng nhận phiên bản mới.
