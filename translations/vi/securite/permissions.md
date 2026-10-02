---
description: "Định danh cố định của lõi, việc hook không có quản trị viên và quyền vĩnh viễn của địa chỉ đội ngũ đối với các mô-đun của sổ đăng ký."
section: "05 / KIỂM CHỨNG"
reading: "ĐỌC TRONG 5 PHÚT"
search:
  keywords: [quyền, đội ngũ, quản trị đội ngũ, setters, thay thế, quản trị viên, authority, admin, quản trị]
---

# Quyền hạn và thay thế

CUBIT phân biệt lõi có định danh cố định, không có quản trị viên, và địa chỉ đội ngũ quản trị các mô-đun ngoại vi. **Quyền của địa chỉ đội ngũ là vĩnh viễn.**

## Điều giữ cố định

Token, hook chính, PoolManager, poolId và neo sổ đăng ký không bị thay bằng setter ngoại vi.

Token cấp quyền cho hook qua kết nối một lần. Thuế lõi, FDV khởi chạy và hình học của dải thanh khoản không có setter, và dải không bao giờ bị rút sau khi đã đặt. Chính sách mới thay đổi lõi cần phiên bản mới, xác thực và triển khai; chính sách đó không tự cập nhật pool cũ.

## Hook không có quản trị viên

Hook **không có quản trị viên nào**, và không ai có thể tạm dừng swap hay cơ chế tường.

Vì vậy không địa chỉ nào có thể đình chỉ một lệnh bán hay việc đặt một tường. Các quy tắc của hook được áp dụng đúng như khi đã được triển khai.

## Vai trò đội ngũ

Địa chỉ đội ngũ, `TEAM_ADDRESS`, được cố định trong hook và đóng vai trò `authority()` của sổ đăng ký `CubitV2`. Quyền của địa chỉ này là vĩnh viễn: địa chỉ này nhận phần đội ngũ của thuế, 3 % khi mua và 3 % khi bán, và thay rồi kích hoạt các mô-đun của sổ đăng ký. Địa chỉ này có thể thay Vault, router, Lens hoặc Forge **bất cứ lúc nào và ngay lập tức**, không có thời hạn báo trước. Bốn địa chỉ có thể thay là:

| Setter | Kiểm tra kết nối chính | Hệ quả |
| --- | --- | --- |
| `setVault(next)` | Có mã, cùng hook và cùng token, Vault mới không có stake | Hợp đồng tham chiếu mới cho khoản gửi sau và cho CUBIT hấp thụ được gửi sau đó |
| `setRouter(next)` | Có mã, cùng hook/PoolManager/poolId | Thay router hiện tại: router mà dapp dùng |
| `setLens(next)` | Có mã, cùng hook/PoolManager/poolId/token | Thay hợp đồng đọc hiện tại |
| `setForge(next)` | Có mã, cùng hook, vault quản trị có mã | Đăng ký hoặc thay launchpad tham chiếu, không có khi khởi chạy, cho các lần khởi chạy sau, cùng vault quản trị nhận phí của chúng |

Mỗi thay đổi phát `ModuleUpdated`, tăng `moduleRevision` và đóng chức năng tương ứng cho đến khi đội ngũ mở lại: thay Vault, Lens hoặc Forge sẽ lần lượt đóng Vault, Momentum hoặc Forge; thay router không đóng chức năng nào. Kiểm tra địa chỉ mới và mã trước thao tác.

## Phạm vi của một lần thay

Một lần thay có hiệu lực ngay trong giao dịch của nó. Việc thay cho phép chọn:

- nơi CUBIT do các tường của CUBIT hấp thụ được chuyển đến trong các lần gửi sau: hook giao chúng cho Vault đã đăng ký;
- nơi phí khởi chạy trong tương lai được chuyển đến: Forge đã đăng ký trả phí cho vault quản trị của chính nó;
- router mà dapp sử dụng.

Việc thay không động đến:

- lõi: token, hook, dải thanh khoản, tường và thuế;
- số dư đã có trong các vault hiện hữu, gồm tiền gốc và quỹ dự trữ thưởng.

Đội ngũ bảo vệ khóa riêng của địa chỉ này.

## Giới hạn kiểm tra tương thích

Getter khai báo đúng địa chỉ chỉ chứng minh kết nối mong đợi, không an toàn của toàn mã ứng viên. Không chứng minh vắng proxy hay hành vi độc hại trong triển khai tương lai.

Vì vậy đội ngũ chọn mã ngoại vi dùng cho thao tác tương lai. Khả năng này đòi hỏi kiểm tra từng lần thay, bytecode và tương tác.

## Vốn đã gửi

Thay Vault không chuyển CUBIT đã gửi hay quỹ dự trữ thưởng của hợp đồng cũ. Vị thế, hạn và đầu ra vẫn nằm ở Vault cũ đó. Sổ đăng ký giữ danh sách Vault, frontend phải tiếp tục hiển thị các vị thế đó.

Router cũ vẫn dùng được để swap và vẫn chịu thuế hook; phê duyệt đã cấp cho router cũ không áp dụng cho router mới.

Thay Forge liên quan khởi chạy tương lai; thị trường con đã tạo giữ hợp đồng và vault quản trị của Forge đã khởi chạy chúng.

Setter không sửa ngược hợp đồng lỗi và không chuyển vốn nó giữ. Phải kiểm tra riêng khả năng gọi đầu ra on-chain và khả dụng trên frontend.

## Vault quản trị của launchpad

Vault quản trị không có quản trị viên và không cho rút trước hạn. Vault nhận phí khởi chạy bằng ETH và token được tường của thị trường con hấp thụ: mỗi khoản gửi bị khóa tại đó 30 ngày kể từ khi được nhận, sau đó **chỉ deployer của vault** mới có thể nhận. Quyền này có hiệu lực vĩnh viễn và không hàm nào cho phép chuyển nhượng: đây là sự tin cậy rõ ràng dành cho tài khoản đó. Deployer này có thể gia hạn khóa của toàn bộ vault, cho các khoản gửi hiện tại và tương lai, vào bất cứ lúc nào; không hàm nào rút ngắn thời gian khóa.

## Phê duyệt và chữ ký

Phê duyệt gắn với **spender cụ thể**, không theo địa chỉ hiện tại của sổ đăng ký. Frontend phải xác thực lại khi bản sửa đổi hoặc mô-đun đổi, nhất là giữa phê duyệt và swap.

Mỗi thao tác của giao thức là một giao dịch: hãy kiểm tra địa chỉ đích và chain trước khi ký.

<p class="source-note">Nguồn: <code>CubitV2.sol</code>, <code>CubitHook.sol</code>, <code>periphery/CubitGovernanceVault.sol</code>, <code>contracts/docs/MODULE_SETTERS.md</code> và kiểm tra frontend <code>releases.ts</code> / <code>vault.ts</code>.</p>
