---
description: "Lệnh cục bộ để biên dịch, kiểm thử Foundry của phiên bản mới, dapp, dịch vụ và GitBook; không phát giao dịch."
section: "04 / XÂY DỰNG"
reading: "ĐỌC TRONG 5 PHÚT"
---

# Chạy dự án cục bộ

Mỗi thư mục có phụ thuộc riêng. Dùng lockfile của kho và giữ đồng bộ phiên bản hợp đồng, ABI, manifest và client.

Lệnh dưới đây build hoặc kiểm tra thành phần cục bộ, không phải quy trình đưa vào sản xuất.

## Điều kiện trước

Dự án dùng Node.js gần đây, pnpm cho dapp và dịch vụ, Foundry cho Solidity, npm cho GitBook. Dịch vụ yêu cầu Node **22 trở lên**; GitBook được chuẩn bị bằng Node 24.

Hợp đồng cố định **Solidity 0.8.26**, EVM **Cancun**, **via IR**, tối ưu **10 runs**, không metadata CBOR. Các tham số thuộc định danh bytecode cần kiểm chứng.

Sau clone, phụ thuộc Solidity của kho phải có sẵn:

```bash
git submodule update --init --recursive
```

## Biên dịch và kiểm thử hợp đồng

Từ `contracts/`, trên nhánh `redesign/tide-lp-autowalls-vault`:

```bash
FOUNDRY_TEST=test/redesign forge build --sizes
FOUNDRY_TEST=test/redesign forge test
```

Bộ kiểm thử lịch sử `test/` dùng API cũ của ladder và không biên dịch được với phiên bản mới: `FOUNDRY_TEST` giới hạn việc biên dịch vào các kiểm thử trong `test/redesign`. Chế độ via IR làm quá trình biên dịch chậm.

Các profile fuzzing và bất biến trong cấu hình áp dụng cho bộ kiểm thử lịch sử:

```bash
FOUNDRY_PROFILE=ci forge test
FOUNDRY_PROFILE=gate forge test
```

Kết quả kiểm thử phải gắn với đúng bản sửa đổi, tham số và mã đã biên dịch; log cũ không phải kết quả của phiên bản mới.

Script `script/Scenarios.s.sol` chạy lại các kịch bản trên node Anvil cục bộ: `SCENARIO=band` cho dải thanh khoản, `SCENARIO=walls` cho tường và `SCENARIO=crossing` cho gas của các tường bị đi qua. Làm theo hướng dẫn của kho để triển khai cục bộ, không chép khóa vào ghi chú.

## Khởi động dapp

Từ `dapp/`:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
pnpm dev
```

Vite hiển thị URL phát triển. Cấu hình tách chế độ mô phỏng và dữ liệu của bản triển khai đã cấu hình. Theo ví dụ và hướng dẫn kho để đặt RPC cục bộ, không chép thông tin truy cập vào mã hoặc bundle công khai.

Frontend biên dịch được không chứng minh manifest khớp hợp đồng trên mạng. Dapp đọc ABI của phiên bản đang vận hành.

## Duy trì ABI

Từ `contracts/`, xuất sau biên dịch:

```bash
bash scripts/export-abi.sh
python3 scripts/check-abi.py
```

Dapp có `pnpm gen-abi`, dịch vụ có `pnpm gen:abi`. Xem thay đổi sinh ra của interface, sự kiện và kiểu liên quan. View `band()`, các trường `bandEth` và `bandTokens`, các view tường, `deliverAbsorbed()`, `pendingAbsorbedTokens()` và hai vault phải nằm trong lần đồng bộ bản phát hành.

`pnpm sync-deployment` của dapp đọc lại manifest triển khai: chỉ chạy với metadata của phiên bản thực sự đã kiểm chứng.

## Kiểm tra dịch vụ

Từ `services/`:

```bash
pnpm install --frozen-lockfile
pnpm gen:abi
pnpm typecheck
pnpm test
```

Dịch vụ keeper thuộc mô hình cũ và không còn tác dụng trong phiên bản mới. Vận hành bộ chuyển tiếp sự kiện có [trang riêng](services.md).

## Khởi động GitBook này

Từ `gitbook/`:

```bash
npm ci
npm run dev
```

Site phục vụ ở `http://localhost:4000`, có build lại trang. Để tạo thư mục tĩnh `_book/` và kiểm tra liên kết:

```bash
npm run build
npm run preview
```

Xem trước cục bộ dùng `http://localhost:4001`. Font được đóng gói; tìm kiếm chạy trong trình duyệt trên chỉ mục sách.

Để kiểm tra quy trình trình duyệt của tài liệu:

```bash
npm run test:install
npm run test:browser
```

[README của `gitbook/`](../sources.md#la-documentation) mô tả lựa chọn HonKit, cây thư mục, kiểm tra và bảo trì nội dung.

<p class="source-note">Nguồn: <code>contracts/foundry.toml</code>, <code>contracts/docs/REDESIGN_HANDOFF.md</code>, <code>contracts/script/Scenarios.s.sol</code>, script trong kho, <code>dapp/package.json</code>, <code>services/package.json</code> và <code>gitbook/package.json</code>. Build tài liệu không cần khóa hay URL RPC có xác thực.</p>
