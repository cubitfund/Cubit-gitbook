---
description: "Điều gì xảy ra với tường bị lệnh bán chạm tới: bị tiêu thụ một phần thì tường giữ nguyên vị trí; bị đi qua hoàn toàn thì tường được làm trống và CUBIT của tường chuyển vào quỹ dự trữ thưởng của vault, không burn."
section: "01 / TÌM HIỂU"
reading: "ĐỌC TRONG 4 PHÚT"
search:
  keywords: [hấp thụ, đi qua, bị đi qua, tiêu thụ một phần, quỹ dự trữ, dự trữ, vault, thưởng, phần thưởng, burn, hủy, quản trị, deliverAbsorbed]
---

# Tường bị đi qua và quỹ dự trữ của vault

Khi lệnh bán chạm tới một tường, ETH của tường đó mua lại CUBIT. Trong phiên bản mới, số CUBIT này **không còn bị burn**: CUBIT của tường bị đi qua hoàn toàn chuyển vào **quỹ dự trữ thưởng của vault**.

## Bị tiêu thụ một phần hay bị đi qua hoàn toàn

| Trạng thái tường | Điều xảy ra |
| --- | --- |
| Không bị chạm tới | Tường chỉ chứa ETH, tại tick của nó |
| Bị tiêu thụ một phần | Một phần ETH của tường đã mua lại CUBIT; tường giữ nguyên vị trí |
| Giá tăng trở lại sau khi tường bị tiêu thụ một phần | Tường bán lại CUBIT và nạp lại ETH |
| Bị đi qua hoàn toàn | Tường chỉ còn chứa CUBIT; tường được chính lệnh bán đã đi qua nó làm trống, CUBIT của tường chờ được chuyển đi và ETH còn lại của tường trở về `pendingFloorEth` |

Tường chỉ được làm trống khi đã **bị đi qua hoàn toàn**. Khi tường mới chỉ bị tiêu thụ một phần, hook không động đến nó: tường tiếp tục hoạt động như một vị thế LP thông thường tại tick của nó. Cùng một lệnh bán làm trống mọi tường mà lệnh đó đã đi qua hoàn toàn, từ gần nhất đến xa nhất.

## Đường đi của CUBIT

```text
Một lệnh bán đi qua hoàn toàn một tường
    → lệnh bán làm trống tường
    → CUBIT của tường chờ trong pendingAbsorbedTokens
    → deliverAbsorbed() gửi chúng vào quỹ dự trữ thưởng của vault
```

Router CUBIT gọi `deliverAbsorbed()` ở cuối mỗi lệnh bán, trong cùng giao dịch. Nếu việc chuyển này thất bại, lệnh bán không bị chặn: số CUBIT vẫn được giữ riêng trong hook. Sau một lệnh bán đi qua router khác, hoặc sau một lần chuyển thất bại, bất kỳ tài khoản nào cũng có thể gọi `deliverAbsorbed()`, nhưng không chọn được người nhận hay số tiền. Sau đó quỹ dự trữ trả thưởng hằng ngày cho người gửi vào vault. [mCUBIT Vault](../v2/vault.md).

## Nguồn cung không còn giảm

Nguồn cung giữ cố định ở **21 triệu CUBIT**, không mint. Vì CUBIT của tường không còn bị hủy, nguồn cung không còn giảm qua các lần hấp thụ: CUBIT không còn được trình bày là giảm phát. Chỉ phần dư nhỏ do làm tròn của khoản gửi ban đầu, không đáng kể, bị burn khi khởi chạy.

CUBIT trả làm thưởng từ quỹ dự trữ là token thông thường: người nhận có thể giữ, gửi vào hoặc bán chúng.

## Thị trường con Forge

Với thị trường con do Forge tạo, token của các tường được làm trống không đi vào vault staking: `deliverAbsorbed()` chuyển chúng vào **vault quản trị của launchpad**, có địa chỉ được cố định trong Forge đã triển khai token của thị trường con. Mỗi khoản gửi bị khóa tại đó 30 ngày kể từ lúc chính khoản đó được nhận, và chỉ deployer của vault này mới có thể nhận chúng. [Momentum và Forge](../v2/momentum-forge.md).

## Hấp thụ không bảo đảm điều gì

Tường hấp thụ lệnh bán sẽ tiêu ETH của nó. Tường bị tiêu thụ một phần chỉ nạp lại ETH nếu giá tăng trở lại trên tường; tường đã được làm trống chỉ có lại độ sâu nếu một lần cấp vốn mới rơi vào tick của nó.

Bằng chứng của cơ chế strict-burn cũ không xác thực đường đi mới này. Đường đi này đang chạy trên Ethereum từ ngày 22 tháng 9 năm 2026. [Xem các giới hạn đã biết](../securite/risques.md).

## Kiểm tra các chuyển động

Để theo dõi một lần hấp thụ, đối chiếu các sự kiện của hook: `WallAbsorbed(id, cubit, ethRemaining)` cho mỗi tường được làm trống, `TokensAbsorbed(amount, pendingAbsorbedTokens)` cho tổng số được đưa vào trạng thái chờ, rồi `AbsorbedDelivered(sink, amount)` khi chuyển đi. Về phía đích đến, vault phát `RewardReserveFunded`; với thị trường con Forge, vault quản trị phát `Deposited`.

<p class="source-note">Nguồn: các quyết định thiết kế ngày 14 tháng 9 năm 2026, <code>CubitHook._collectCrossedWalls</code>, <code>deliverAbsorbed</code>, <code>absorbedTokenSink</code>, <code>WallLib.collectCrossed</code>, <code>CubitRouter._finishSwap</code>, <code>CubitVault.fundRewardReserve</code> và <code>periphery/CubitGovernanceVault.sol</code>.</p>
