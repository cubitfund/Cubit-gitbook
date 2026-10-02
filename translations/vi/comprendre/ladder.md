---
description: "Một dải rộng duy nhất, đặt khi khởi chạy với 80 % nguồn cung và không bao giờ bị rút: thanh khoản giao dịch của CUBIT."
section: "01 / TÌM HIỂU"
reading: "ĐỌC TRONG 4 PHÚT"
search:
  keywords: [dải thanh khoản, dải, band, thanh khoản, TIDE, đường cong, x·y=k, khởi chạy, FDV, ladder]
---

# Dải thanh khoản

Thanh khoản giao dịch của CUBIT nằm trong **một dải rộng duy nhất**, theo mô hình TIDE. Hook đặt dải này khi khởi chạy và không bao giờ rút ra. Dải thay thế ladder cũ.

## Dải thanh khoản chứa gì

| Tham số | Giá trị đã chọn |
| --- | --- |
| Khoản gửi | 80 % nguồn cung, tức 16,8 triệu CUBIT |
| Thành phần khi khởi chạy | 100 % CUBIT, không có ETH |
| Khoảng giá | Mọi mức giá trên giá khởi chạy |
| FDV khởi chạy | 3,75 ETH, tức độ sâu 3 ETH cho dải |
| Rút ra | Không: vị thế không bao giờ bị rút |

Biên dưới của dải tương ứng với giá khởi chạy, làm tròn theo tick, nên ban đầu vị thế không chứa ETH nào. Phía trên, dải bao phủ toàn bộ đường cong giá của pool.

## Đường cong x·y=k

Lệnh mua và lệnh bán đi theo đường cong tích không đổi của dải. Lệnh mua gửi ETH vào dải và lấy CUBIT ra: giá tăng. Lệnh bán làm ngược lại: giá giảm.

Với FDV khởi chạy 3,75 ETH, 16,8 triệu CUBIT có giá trị **3 ETH theo giá khởi chạy**. Ban đầu, dải hoạt động như một pool x·y=k gồm 16,8 triệu CUBIT đối ứng với 3 ETH. 3 ETH này là **ảo**: chúng quyết định độ dốc của đường cong, nhưng dải thực sự chỉ giữ ETH do người mua đưa vào.

## Dải thanh khoản không bảo đảm điều gì

ETH mà người bán có thể lấy ra khỏi dải là ETH người mua đã gửi vào. Khi giá trở về giá khởi chạy, dải chỉ còn chứa CUBIT: dải không thể mua lại CUBIT dưới mức giá này.

Vì vậy, dưới giá khởi chạy, lệnh bán chỉ có thể được đáp ứng bằng ETH còn nằm trong các tường. Độ sâu 3 ETH không phải quỹ ETH do giao thức gửi vào, cũng không phải giá sàn.

## Những gì đã biến mất cùng ladder

Dải thanh khoản thay thế sổ lệnh di động cũ. Các thành phần bị loại bỏ:

- ladder, các dải nối tiếp và dự trữ token của nó;
- cushion bằng ETH;
- `rebalance`, `raiseFloor`, sweep sang tường và thưởng cho keeper.

Không cần lệnh gọi bảo trì nào để thị trường vận hành: không còn keeper.

## Dải thanh khoản của thị trường con Forge

Thị trường con do Forge tạo theo cùng mô hình, với một khác biệt: **nó gửi 100 % nguồn cung vào dải của mình**. Nó không có quỹ dự trữ vault hay phân bổ cho đội ngũ. Hook yêu cầu khoản gửi tối thiểu 80 % nguồn cung và đặt toàn bộ khoản gửi vào dải. [Momentum và Forge](../v2/momentum-forge.md).

## Kiểm tra dải thanh khoản

View `band()` của hook trả về các tick và thanh khoản của vị thế; sự kiện `BandBootstrapped` được phát khi khởi chạy. Lens cung cấp `bandEth` và `bandTokens`, tức ETH và CUBIT mà dải nắm giữ theo giá hiện tại, không tính phí LP. [Hợp đồng và tích hợp](../developper/integration.md).

<p class="source-note">Nguồn: <code>CubitHook._bootstrap</code>, <code>afterInitialize</code>, <code>band()</code>, <code>MIN_POOL_SUPPLY</code>, <code>CubitLens.bandEth</code> / <code>bandTokens</code> và <code>periphery/CubitForge.sol</code>. Các quyết định thiết kế ngày 14 tháng 9 năm 2026.</p>
