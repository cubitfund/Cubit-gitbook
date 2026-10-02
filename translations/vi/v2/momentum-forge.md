---
description: "Momentum cung cấp khả năng chỉ đọc thị trường. Forge là một launchpad công khai; phí khởi chạy của Forge và token được tường của thị trường con hấp thụ chuyển vào vault quản trị của launchpad."
section: "03 / MÔ-ĐUN V2"
reading: "ĐỌC TRONG 5 PHÚT"
search:
  keywords: [momentum, forge, thị trường con, launchpad, công khai, quản trị, NAV, khóa, 30 ngày, gia hạn]
---

# Momentum và Forge

Hai mô-đun có vai trò riêng: **Momentum hiển thị trạng thái thị trường**, còn **Forge cho phép bất kỳ ai khởi chạy thị trường con độc lập**.

## Momentum: quan sát thị trường

Momentum là một trang của ứng dụng: với mỗi token, trang hiển thị tường đang hoạt động, tường bị tiêu thụ một phần và lịch sử tường bị đi qua, dựa trên sự kiện của hook và dữ liệu đọc từ Lens. Trang đã mở từ ngày 23 tháng 9 năm 2026.

Đây là tính năng **chỉ đọc**, không có quyền rút ETH khỏi tường hay đổi quy tắc lõi. Thay đổi hiển thị không phải lệnh giao dịch.

Hình học thực sự được dùng vẫn là hình học của hook. Thành phần frontend không thể tự đặt ra hình học đó.

## Forge: launchpad công khai

Forge **mở cho tất cả mọi người**: bất kỳ tài khoản nào cũng khởi chạy thị trường con bằng cách trả đúng phí khởi chạy. Forge không thuộc lần khởi chạy CUBIT: đội ngũ đã thêm nó vào ngày 23 tháng 9 năm 2026, cùng vault quản trị của nó, và mở nó cùng ngày.

Mỗi thị trường con có token, hook, định danh pool và dự trữ riêng. Mẫu mã tạo hook được kiểm soát bằng hash cố định trong constructor Forge. Salt triển khai gắn với tài khoản khởi chạy: hai lần khởi chạy trong cùng một khối không làm mất hiệu lực của nhau, và sao chép salt của tài khoản khác không chiếm được lần khởi chạy của tài khoản đó.

Thị trường con **gửi 100 % nguồn cung vào dải thanh khoản của mình**. Nó không có quỹ dự trữ vault hay phân bổ cho đội ngũ. Tên, ký hiệu, địa chỉ đội ngũ, salt triển khai và mã cung cấp đều được kiểm tra. Giống như hook của thị trường mẹ, hook của thị trường con không có quản trị viên nào. Tạo thị trường con không cấp quyền đối với pool CUBIT mẹ. Các tham số được áp đặt: cùng mức định giá khởi chạy, cùng nguồn cung và cùng mức thuế cho mọi thị trường con.

## Vault quản trị của launchpad

**Vault quản trị của launchpad** nhận phí khởi chạy của Forge bằng ETH và token được tường của thị trường con hấp thụ; các token này không đi vào vault staking của thị trường mẹ:

- mỗi khoản gửi bị khóa tại đó **30 ngày kể từ khi được ghi nhận**, cộng thêm thời gian gia hạn nếu có: việc ghi nhận là tức thời với một khoản gửi, một khoản phí khởi chạy hay một lần chuyển từ thị trường con, và chỉ xảy ra khi `lockUntracked` được gọi đối với token gửi thẳng vào vault;
- **deployer có thể gia hạn khóa** của toàn bộ vault, cho các khoản gửi hiện tại và tương lai, token và ETH, bằng `extendLock`, vào bất cứ lúc nào; không hàm nào rút ngắn thời gian khóa;
- ví dụ, 10 token nhận mỗi ngày trong 7 ngày sẽ được giải phóng thành 7 đợt, mỗi ngày một đợt, đợt cuối cùng sau 1 tháng và 7 ngày;
- **chỉ deployer** của vault này mới có thể nhận các đợt đã mở khóa, vĩnh viễn: không hàm nào cho phép chuyển nhượng quyền này;
- tài sản của vault nhằm làm tham chiếu giá trị, hay NAV, cho token của launchpad.

Forge nhận địa chỉ của vault này khi được tạo, trong `governanceVault`. Hook của thị trường con tìm lại địa chỉ đó qua Forge đã triển khai token của mình, rồi `deliverAbsorbed()` chuyển token của các tường được làm trống vào vault đó và khóa chúng bằng `lockUntracked`.

## Phí khởi chạy

Mỗi lần khởi chạy trả phí của mình bằng ETH cho vault quản trị của launchpad qua `depositEth()`, trong cùng giao dịch. Từ lúc đó khoản phí thuộc về bên quản trị: **người khởi chạy không bao giờ lấy lại được**, và **chỉ deployer** của vault mới có thể nhận bằng `claim`. Phí này không cấp vốn cho các tường của CUBIT. Giống mọi khoản gửi mà vault này nhận, sau đó nó theo quy tắc khóa mô tả ở trên.

Số tiền `launchFee()` cố định khi tạo từng Forge: nó bằng **0,005 ETH**, tức 5 × 10^15 wei, và là bất biến. Vì vậy muốn đổi phí thì phải có một Forge mới; luôn đọc lại số on-chain của hợp đồng thực sự được dùng.

## Khi Forge bị thay thế

Đội ngũ có thể thay Forge bất cứ lúc nào, không chậm trễ. Thay thế đổi factory tham chiếu cho lần khởi chạy tương lai, và cùng với nó là vault quản trị nhận phí của các lần khởi chạy đó; việc thay sẽ tắt Forge cho đến khi được kích hoạt lại. Thị trường con đã tạo giữ hợp đồng và vốn riêng. Nhờ vậy, launchpad v2 có thể đặt tham số khác cho các lần khởi chạy của chính nó.

Kiểm tra tương thích sổ đăng ký không thay thế đánh giá mẫu mã và factory.

## Launchpad v2

Tham số của thị trường con do Forge đã đăng ký áp đặt. Một Forge thay thế, tức launchpad v2, có thể đặt tham số khác; đội ngũ mở nó khi quyết định.

Các thị trường con đã khởi chạy vẫn hoạt động trên pool riêng, và token do tường của chúng hấp thụ vẫn đi vào vault quản trị của Forge đã khởi chạy chúng.

<p class="source-note">Nguồn: các quyết định thiết kế ngày 14 và 15 tháng 9 năm 2026, <code>periphery/CubitForge.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>CubitHook.absorbedTokenSink</code>, <code>CubitV2.setForge</code> và <code>dapp/src/pages/Momentum.tsx</code>.</p>
