---
description: "Bản đồ mã nguồn CUBIT: hợp đồng, dải thanh khoản và tường, các vault, dapp và dịch vụ."
section: "04 / XÂY DỰNG"
reading: "ĐỌC TRONG 6 PHÚT"
---

# Kiến trúc và mã nguồn

Kho mã gồm hợp đồng Solidity, dapp React/Vite và hai dịch vụ Node. GitBook này độc lập trong `gitbook/`: quá trình build không đọc cấu hình riêng tư hay dữ liệu mạng giao thức.

> Phiên bản mô tả ở đây nằm trên nhánh `redesign/tide-lp-autowalls-vault`.

## Các thư mục

| Thư mục | Trách nhiệm |
| --- | --- |
| `contracts/src` | Token, hook, thư viện, interface và hợp đồng ngoại vi |
| `contracts/test` | Kiểm thử Foundry lịch sử trên API cũ; kiểm thử của phiên bản mới trong `test/redesign` |
| `contracts/audit` | Bộ khung và chiến dịch kiểm chứng bổ sung |
| `contracts/script` | Script Foundry để triển khai và kịch bản chạy lại được trên node cục bộ |
| `contracts/scripts` | Xuất ABI, kiểm tra và quy trình triển khai |
| `contracts/deployments` | Manifest công khai của phiên bản và lịch sử |
| `dapp/src/chain` | Cấu hình, ABI, đọc, báo giá và giao dịch |
| `dapp/src/pages` | Swap, Proof, Staking, lộ trình và mô-đun V2 |
| `services/shared` | Cấu hình chung, client, ABI và theo dõi thực thi |
| `services/keeper` | Dịch vụ bảo trì cũ, không còn tác dụng trong phiên bản mới |
| `services/floor-bot` | Đọc sự kiện và chuẩn bị bài đăng |
| `audit/reports` | Báo cáo có ngày và bằng chứng gắn với bản sửa đổi |
| `gitbook/docs` | Nguồn tiếng Pháp của tài liệu này |

## Hợp đồng lõi

| Thành phần | Trách nhiệm |
| --- | --- |
| `CubitToken` | ERC-20 phát hành ban đầu một lần 21 triệu; chỉ hook được burn |
| `CubitHook` | Thuế, dải thanh khoản, đặt và làm trống tường, tài khoản đội ngũ, kết nối V2 |
| `BandLib` | Giá, chuyển đổi và làm tròn tick, mục tiêu của tường |
| `WallLib` | Tường theo tick: định danh vĩnh viễn, chỉ mục các tường hoạt động, cấp vốn và làm trống các tường bị đi qua |
| `PoolManager` v4 | Trạng thái pool, vị thế thanh khoản, swap và quyết toán |

Hook là nhà cung cấp thanh khoản duy nhất của pool CUBIT: mọi việc thêm thanh khoản khác đều bị từ chối. Vốn được theo dõi trong vị thế và qua claim ERC-6909 của PoolManager; vì vậy số dư ETH gốc ở địa chỉ hook không đủ để đo dự trữ.

Dải thanh khoản là một vị thế duy nhất được định danh bằng `BAND_SALT`. Mỗi tường chiếm một ô rộng `tickSpacing` dưới salt riêng của nó. `WallLib` thao tác trên storage của hook: claim và vị thế vẫn thuộc về hook.

## Hợp đồng ngoại vi

| Thành phần | Trách nhiệm |
| --- | --- |
| `CubitRouter` | Swap exact-input/output, giới hạn slippage, deadline, quyết toán và chuyển CUBIT đã hấp thụ sau mỗi lệnh bán |
| `CubitLens` | View suy ra: thị trường, dải thanh khoản, tường, tài khoản, nguồn cung lưu hành, CUBIT đang nắm giữ và tường tốt nhất |
| `CubitV2` | Sổ đăng ký mô-đun ổn định, bản sửa đổi và lịch sử vault |
| `CubitVault` | Gửi CUBIT, khóa 24 giờ và thưởng bằng CUBIT trả từ quỹ dự trữ |
| `CubitGovernanceVault` | Vault quản trị của launchpad: phí khởi chạy bằng ETH và token từ tường của thị trường con, mỗi khoản gửi bị khóa 30 ngày, cộng thêm thời gian gia hạn nếu có; chỉ deployer được nhận và gia hạn, vĩnh viễn |
| `CubitForge` | Launchpad công khai cho thị trường con độc lập, được thêm sau khởi chạy; phí khởi chạy 0,005 ETH trả cho vault quản trị, có địa chỉ được cố định khi tạo hợp đồng |
| `CubitLaunch` | Khởi chạy trong một giao dịch duy nhất: 80 % nguồn cung vào dải thanh khoản, 20 % vào quỹ dự trữ của vault và lệnh mua của deployer |

Địa chỉ đội ngũ có thể thay Router, Lens, Vault và Forge trong sổ đăng ký bất cứ lúc nào, không chậm trễ, rồi kích hoạt chúng; các quyền này là vĩnh viễn, và mỗi lần thay sẽ tắt chức năng tương ứng cho đến khi được kích hoạt lại. Token, hook, định danh pool và neo sổ đăng ký không theo cơ chế thay này, và hook không có quản trị viên nào: không ai có thể tạm dừng swap hay cơ chế tường.

## Đường đi của lần đọc

```text
Frontend hoặc dịch vụ
    → manifest công khai: mạng, lõi, sổ đăng ký
    → sổ đăng ký ở block xác định: mô-đun + bản sửa đổi
    → kiểm tra kết nối các mô-đun
    → Lens và view hook tại cùng block
    → hiển thị hoặc mô phỏng thao tác
```

Ở frontend, `releases.ts` phân giải mô-đun, `vault.ts` giữ khả năng đọc Vault cũ. RPC không trả lời không được cho phép ký. Lớp dữ liệu của dapp đọc ABI của phiên bản đang vận hành.

## Đường đi của swap

Frontend lấy báo giá rồi mô phỏng. Router mở ngữ cảnh quyết toán PoolManager; hook áp thuế trên phần ETH, và swap đi theo đường cong của dải thanh khoản và các tường mà giá đi qua. Sau đó router quyết toán delta.

Ở mỗi lệnh bán, trong `afterSwap`, hook làm trống các tường bị đi qua hoàn toàn rồi đặt ETH đang chờ vào một tường tại mục tiêu tính trên giá sau lệnh bán, hoặc thấp hơn giá hiện tại 1 % khi mục tiêu đó không nằm dưới thị trường, tức khi giá bằng hoặc thấp hơn giá khởi chạy. Ở cuối lệnh bán, router CUBIT gọi `deliverAbsorbed()` để chuyển CUBIT đã hấp thụ sang quỹ dự trữ của vault; nếu việc chuyển này thất bại, lệnh bán không bị chặn.

Ranh giới rất quan trọng: chỉ PoolManager được gọi callback router trong thao tác mong đợi; payer đến từ người gọi router đã xác thực.

## Những gì phiên bản mới đã thay đổi

Dải thanh khoản thay thế ladder, và `rebalance`, `raiseFloor`, sweep cùng các khoản thưởng đã bị loại bỏ. Tường được đặt và làm trống trong các lệnh bán, và CUBIT của các tường bị đi qua chuyển vào quỹ dự trữ của vault thay vì bị burn.

Bộ kiểm thử lịch sử `contracts/test` dùng API cũ và không biên dịch được với phiên bản mới; kiểm thử của phiên bản mới nằm trong `test/redesign`. Các bước tiếp theo có trong [lộ trình](../roadmap.md), còn các thành phần đã kiểm thử có trong [tình trạng phiên bản](../securite/etat.md).

<p class="source-note">Nguồn: các tệp trong kho được nêu, nhất là <code>CubitHook</code>, <code>BandLib</code>, <code>WallLib.Book</code>, <code>periphery/CubitRouter.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>releases.ts</code>, <code>contracts/docs/REDESIGN_HANDOFF.md</code> và README dịch vụ.</p>
