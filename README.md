# ScanCCCD — bản thử nghiệm Windows 10

Ứng dụng Electron quét QR CCCD, lưu cục bộ, xuất CSV và nhập dữ liệu vào Excel/HIS bằng thao tác dán clipboard rồi Tab/Enter. Không thực hiện OCR, không xác thực danh tính hoặc tính thật giả của CCCD.

## Chạy trên Windows 10

Cài Node.js 22 LTS hoặc 24 LTS từ nodejs.org. Mở PowerShell tại thư mục dự án:

```
npm ci
npm start
```

Tạo bộ cài Windows trên máy Windows:

```
npm run dist:win
```

Bộ cài nằm trong `dist`. Chưa ký mã; bản này cần thử nghiệm trước khi triển khai. Không yêu cầu quyền quản trị; chạy cùng mức quyền với Excel/HIS.

## Sử dụng

1. Bật webcam và đưa QR vào khung hình, hoặc chọn Ghép đôi điện thoại.
2. Điện thoại và PC cùng Wi-Fi tin cậy. Quét mã ghép đôi, chụp/chọn ảnh QR rồi bấm Gửi. Nếu Windows Firewall hỏi, chỉ cho phép trên mạng Private. Ghép đôi lại sẽ vô hiệu hóa mã cũ. Đóng ứng dụng sẽ đóng máy chủ LAN.
3. Kiểm tra thông tin. Ngày giữ dạng DDMMYYYY. Bấm Lưu trên PC; cùng số CCCD cập nhật hồ sơ cũ.
4. Excel mặc định: CCCD → CMND cũ → Họ tên → Ngày sinh → Giới tính → Địa chỉ → Ngày cấp. Chọn định dạng Text cho các cột trước khi nhập để giữ số 0 đầu. Xuất CSV cũng cần nhập bằng Data → From Text/CSV và chọn kiểu Text cho mã số/ngày.
5. HIS: chọn trường và Tab/Enter/Không chuyển ở từng dòng. Xóa hoặc thêm dòng theo biểu mẫu; cấu hình tự lưu. Chưa hỗ trợ bấm dropdown, chọn ngày bằng lịch hoặc biểu mẫu có điều hướng đặc biệt.
6. Mở Excel/HIS, chuẩn bị ô đích, bấm Nhập sau 5 giây và chuyển ngay sang ô đích. Không chạm bàn phím/chuột trong quá trình nhập. Kiểm tra với dữ liệu giả trước. Enter có thể gửi biểu mẫu, vì vậy chỉ cấu hình khi đã hiểu hành vi HIS.

Chức năng nhập dùng clipboard Windows tạm thời và khôi phục nội dung văn bản sau đó; clipboard ảnh/định dạng khác không được khôi phục. Clipboard history có thể giữ dữ liệu CCCD: tắt lịch sử/đồng bộ clipboard trên máy sử dụng. Chưa có phím hủy khẩn cấp hoặc khả năng xác định cửa sổ đích; luôn giám sát thao tác nhập.

## Lưu trữ và kết nối

Hồ sơ lưu trong `records.json` ở thư mục userData của Electron (Windows thường là `%APPDATA%/scancccd`). Dữ liệu chưa mã hóa, không có đăng nhập. Chỉ dùng trong tài khoản Windows được bảo vệ, hạn chế quyền truy cập, sao lưu và xóa theo chính sách của đơn vị. Không đưa CCCD thật vào Git.

Kênh điện thoại dùng HTTP LAN cùng token ngẫu nhiên; không có TLS. Chỉ dùng trên mạng riêng tin cậy. Token là quyền gửi dữ liệu, không cho phép tải hồ sơ. Điện thoại xử lý ảnh tại chỗ, chỉ gửi nội dung QR; PC không tự lưu hoặc tự nhập kết quả nhận được. Phiên bản này chưa phù hợp triển khai y tế thực tế nếu chưa bổ sung kiểm soát truy cập, mã hóa và kiểm thử HIS.

## Kiểm tra

```
npm test
node --check main.js
node --check ui/app.js
node --check ui/phone.js
```

Bộ kiểm tra hiện bao phủ phân tích QR và CSV, không thay thế kiểm thử webcam/điện thoại/Windows/HIS. Môi trường Linux không kiểm chứng được SendKeys Windows. Cần chạy thử Windows 10 với dữ liệu giả, đủ 7 trường, số 0 đầu, tiếng Việt, ô trống, xóa/cập nhật hồ sơ, ghép đôi lại và cấu hình HIS trước khi sử dụng thật.

## Giao diện web trên PC

Chạy chương trình kết nối bằng `npm start`, bấm Ghép đôi điện thoại và sao chép địa chỉ `http://127.0.0.1:.../desktop?token=...` hiển thị để mở bằng trình duyệt ngay trên PC. Không chia sẻ địa chỉ chứa token. Giao diện PC bị giới hạn truy cập từ máy cục bộ; điện thoại chỉ dùng trang chụp QR. Chương trình kết nối phải tiếp tục chạy để lưu và nhập Excel/HIS. Ghép đôi lại trong một cửa sổ sẽ vô hiệu hóa token của các cửa sổ cũ.

### Chẩn đoán QR đọc được nhưng không tách được trường

Bộ đọc dùng byte gốc của jsQR để tránh mất đoạn UTF-8, hỗ trợ UTF-16 có BOM hoặc mẫu số CCCD UTF-16 rõ ràng. Không suy đoán tên/địa chỉ khi không giải mã được. Nếu gặp thông báo gồm số byte, số ký tự và số dấu `|`, chỉ gửi các con số cùng cách quét để hỗ trợ chẩn đoán; không gửi nội dung QR hoặc ảnh CCCD. Bộ kiểm tra có ảnh QR tổng hợp UTF-8, UTF-8 chia đoạn và UTF-16, chưa thay thế kiểm thử trên thẻ và webcam thực tế.
