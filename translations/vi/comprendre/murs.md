---
description: "Công thức chọn vị trí tường; lệnh bán quyết định quy mô. Mục tiêu tính ở mỗi lệnh bán, ví dụ và các tường cố định tại tick của chúng."
section: "01 / TÌM HIỂU"
reading: "7 PHÚT + VÍ DỤ TƯƠNG TÁC"
search:
  keywords: [tường mua, tường, mục tiêu, giá, độ sâu, sức chứa, capacity, thoái lui, công thức, lệnh bán, 16200, 44200, 28200]
---

# Mục tiêu và tường mua cố định

**Công thức chọn vị trí tường; lệnh bán quyết định quy mô.** Tường là vị thế LP được cấp vốn bằng ETH tại một tick xác định, dưới giá hiện tại.

## Công thức ở mỗi lệnh bán

Gọi `M` là vốn hóa thị trường sau lệnh bán và `B` là cơ sở khởi chạy, cùng một đơn vị:

<div class="formula">mục tiêu = M − (M − B) × 0,6<span class="line-break"></span>= 0,4 × M + 0,6 × B</div>

Hệ số thoái lui **60 % chênh lệch giữa thị trường và cơ sở**. Do đó hệ số giữ lại 40 % chênh lệch này trên cơ sở. Với cơ sở minh họa `B = 7 000`:

| Thị trường sau lệnh bán | Tính toán | Mục tiêu của tường |
| --- | --- | --- |
| 30 000 | 30 000 − 23 000 × 0,6 | **16 200** |
| 100 000 | 100 000 − 93 000 × 0,6 | **44 200** |
| Trở về 60 000 | 60 000 − 53 000 × 0,6 | **28 200** |

Phép tính thứ ba bắt đầu lại từ **60 000**, dù trước đó thị trường từng đạt 100 000. Không có cơ chế khóa tăng dựa trên đỉnh lịch sử. Mục tiêu được tính lại **ở mỗi lệnh bán**, trên mức giá mà lệnh bán đó để lại: không còn quỹ tích lũy rồi được đặt bằng một lệnh gọi bảo trì.

## Thay đổi thị trường

Ví dụ dưới đây giữ hai tường cũ ở 16,2k và 44,2k, rồi tính mục tiêu của tường tiếp theo. Các giá trị dùng cùng một đơn vị vốn hóa, với cơ sở minh họa 7 000. Sơ đồ này không mô phỏng hấp thụ, số dư hay giao dịch.

<section class="wall-lab" aria-label="Máy tính mục tiêu để học">
  <header><span>MỤC TIÊU SAU LỆNH BÁN</span><span>CƠ SỞ CỐ ĐỊNH: 7 000</span></header>
  <div class="wall-controls">
    <label for="market-cap">Thị trường sau lệnh bán <output id="market-value" for="market-cap">60 000 đơn vị</output></label>
    <input id="market-cap" type="range" min="7000" max="120000" step="1000" value="60000">
    <div class="wall-presets"><button type="button" data-market-preset="30000">30k</button><button type="button" data-market-preset="100000">100k</button><button type="button" data-market-preset="60000">Trở về 60k</button></div>
  </div>
  <div class="wall-levels" aria-label="So sánh các mức vốn hóa">
    <div class="level-row"><span>Tường cũ A</span><div class="level-track"><i style="width:13.5%"></i></div><b>16,2k</b></div>
    <div class="level-row"><span>Tường cũ B</span><div class="level-track"><i style="width:36.833%"></i></div><b>44,2k</b></div>
    <div class="level-row new-target"><span>Mục tiêu mới</span><div class="level-track"><i id="lab-target-bar" style="width:23.5%"></i></div><b id="lab-target-label">28,2k</b></div>
    <div class="level-row market"><span>Thị trường hiện tại</span><div class="level-track"><i id="lab-market-bar" style="width:50%"></i></div><b id="lab-market-label">60k</b></div>
  </div>
  <div class="wall-result" aria-live="polite"><span>Mục tiêu của tường tiếp theo</span><strong id="target-value">28 200 đơn vị</strong></div>
  <p class="lab-explanation">Chỉ các lần cấp vốn mới theo mục tiêu hiện tại. Các tường cũ giữ nguyên tick; lượng ETH còn khả dụng ở từng mức cần đọc riêng.</p>
</section>

## Một tường mỗi tick, không bao giờ bị di chuyển

Khi đã đặt, ETH của một tường vẫn gắn với tick của tường đó. Thị trường tăng hay giảm không di chuyển tường cũ sang mục tiêu mới.

- Lần cấp vốn có mục tiêu rơi vào tick của một tường hiện có sẽ **làm dày tường đó** thay vì tạo tường thứ hai.
- Lệnh bán có thể tiêu thụ một phần tường: khi đó một phần ETH của tường mua lại CUBIT.
- Tường chỉ bị tiêu thụ một phần **vẫn giữ nguyên vị trí**. Nếu giá tăng trở lại, tường bán lại CUBIT và nạp lại ETH.
- Tường **bị đi qua hoàn toàn** được làm trống bởi chính lệnh bán đã đi qua nó: CUBIT của tường chuyển sang quỹ dự trữ thưởng của vault, không burn, và ETH còn lại của tường trở về vốn đang chờ.

Định danh của tường là vĩnh viễn. Chỉ mục tick cho phép tìm lại các tường bị lệnh bán chạm tới. [Tường bị đi qua và quỹ dự trữ của vault](burn.md).

## Khi mục tiêu không thể đặt

Tường là vị thế 100 % ETH: tường phải nằm dưới giá hiện tại. Khi giá bằng hoặc thấp hơn giá khởi chạy, công thức cho mục tiêu bằng hoặc cao hơn thị trường, không thể cấp vốn chỉ bằng ETH.

Khi đó, hook đặt tường **thấp hơn giá hiện tại 1 %**, làm tròn theo tick, thay vì để vốn chờ. Nếu không, vốn tích lũy có thể bị đặt một lần tại mức giá bị đẩy lên bởi một giao dịch mua ngay trước đó, rồi giao dịch này bán CUBIT của mình vào tường đó. Hook quyết định dựa trên tick đã làm tròn, không dựa trên mục tiêu chính xác: gần giá khởi chạy, mục tiêu 40/60 sau khi làm tròn vẫn có thể nằm ngay dưới thị trường và được dùng nguyên như vậy, tức gần hơn 1 %.

Chỉ một số tiền quá nhỏ để tạo vị thế, tức phần dư nhỏ, phần thừa có thể phát sinh khi tường nhắm tới chạm trần thanh khoản của một tick — giới hạn của Uniswap v4 — và trường hợp cực đoan khi giá ở tận đỉnh dải tick, nơi không còn chỗ đặt tường nào dưới giá, mới nằm chờ trong `pendingFloorEth`. Một lệnh bán sau sẽ đặt số vốn này. Bản thân lệnh bán không bao giờ bị từ chối vì lý do này.

## ETH thực sự được đặt

Hook đặt toàn bộ ETH đang chờ, trong đó có 12 % của mỗi lệnh bán, vào vị thế ứng với mục tiêu. Các lệnh bán sau có thể tiêu thụ số ETH này: quỹ của từng tường là hữu hạn. Có thể cấp vốn tường mà không chờ đủ bao phủ toàn bộ nguồn cung.

## Từ giá khởi chạy đến tick

Hợp đồng tính theo giá ETH mỗi CUBIT: `cible = 0,4 × prix courant + 0,6 × prix de lancement`. Giá khởi chạy suy ra từ **FDV khởi chạy cố định khi triển khai**, chia cho 21 triệu CUBIT. Phiên bản mới chọn FDV **3,75 ETH**; sau đó giá này giữ cố định và không theo đồng đô la.

Các ví dụ theo đơn vị trên trang này áp dụng cùng công thức cho một mức vốn hóa. Cơ sở 7 000 của các ví dụ chỉ để minh họa: đó không phải quy đổi từ 3,75 ETH đã chọn.

Tick tiếp tục làm tròn mức có thể thực thi. ETH là `currency0`, nên **giá CUBIT càng cao thì tick pool càng thấp**. Mục tiêu toán học, tick đặt thực và giá bán ròng có thể khác nhau.

## Giao diện cần hiển thị gì

Giao diện cần tách riêng thị trường hiện tại, dải thanh khoản, mục tiêu tiếp theo, từng tường hoạt động và độ sâu của nó, cùng ETH và CUBIT đang chờ. Một dòng “floor” duy nhất không tóm tắt được toàn bộ sổ lệnh.

Tham chiếu lịch sử `floorPrice` mô tả **tường được cấp vốn gần nhất**, có thể thấp hơn tường trước. Không được hiểu đó là mức tối thiểu toàn cục được bảo đảm. [Đọc dữ liệu dapp](../utiliser/preuves.md).

<p class="source-note">Nguồn: các quyết định thiết kế ngày 14 tháng 9 năm 2026, <code>BandLib.retracementWallTarget</code>, <code>underMarketWallTarget</code>, <code>WALL_RETRACEMENT_BPS</code>, <code>WallLib.fund</code> và <code>CubitHook._placeWall</code>.</p>
