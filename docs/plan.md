# Kế hoạch phát triển dự án Aven (IT3120)

Tài liệu này chi tiết hóa lộ trình và kế hoạch triển khai từng bước để hoàn thiện ứng dụng **Aven**, đáp ứng đầy đủ yêu cầu tính năng tương đương Trello, hệ thống quản lý tri thức kiểu Obsidian, gọi video P2P và các tiêu chí đánh giá môn học IT3120.

---

## Mục lục
1. [Nguyên tắc triển khai](#1-nguyên-tắc-triển-khai)
2. [Giai đoạn 0: Nền tảng cốt lõi đã hoàn thành (Phase 0 - Done)](#giai-đoạn-0-nền-tảng-cốt-lõi-đã-hoàn-thành-phase-0---done-)
3. [Giai đoạn 1: Nền tảng Dữ liệu & Xác thực (Auth & Persistence)](#giai-đoạn-1-nền-tảng-dữ-liệu--xác-thực-auth--persistence)
4. [Giai đoạn 2: Trello Parity & Chi tiết thẻ (Card Back)](#giai-đoạn-2-trello-parity--chi-tiết-thẻ-card-back)
5. [Giai đoạn 3: Chia sẻ, Phân quyền & Cộng tác (Collaboration)](#giai-đoạn-3-chia-sẻ-phân-quyền--cộng-tác-collaboration)
6. [Giai đoạn 4: Tính năng Obsidian & Realtime Nâng cao](#giai-đoạn-4-tính-năng-obsidian--realtime-nâng-cao)
7. [Giai đoạn 5: Tối ưu chất lượng, Deploy & Nghiệm thu IT3120](#giai-đoạn-5-tối-ưu-chất-lượng-deploy--nghiệm-thu-it3120)
8. [Bảng tổng hợp tiến độ](#bảng-tổng-hợp-tiến-độ)

---

## 1. Nguyên tắc triển khai
- **Dependency First:** Hoàn thiện tầng dữ liệu và danh tính trước (`Auth`, `Firestore`, `Space/Board dynamic`) để làm nền tảng cho phân quyền, chia sẻ và cộng tác.
- **Optimistic UI & Write-behind:** Giữ nguyên triết lý phản hồi tức thì cho người dùng, sau đó lưu ngầm xuống Firestore/LocalStorage.
- **Chất lượng code:** Chạy `pnpm check` (linter, types, format, unit test) trước mỗi lần commit.
- **Demo-ready:** Mỗi giai đoạn sau khi hoàn thành đều phải chạy được mượt mà trên môi trường thật.

---

## Giai đoạn 0: Nền tảng cốt lõi đã hoàn thành (Phase 0 - Done) ✅
> Các tính năng nền tảng Kanban, Trình soạn thảo Markdown và Tầng lưu trữ LocalStorage đã được xây dựng và kiểm thử thành công:

- [x] **Khung ứng dụng & Điều hướng (TanStack Router + Mantine UI):**
  - [x] Cấu hình React 19 + TypeScript + Vite 8 với chế độ strict mode.
  - [x] Hệ thống route kiểm tra kiểu: `/`, `/s/$spaceId`, `/s/$spaceId/$boardId`, `/login`, `/g/$token`.
  - [x] Giao diện Slate Theme, hiệu ứng chuyển tab Cross-fade mượt mà.
  - [x] Bộ công cụ chất lượng mã nguồn: `oxlint`, `oxfmt`, `vitest` (đạt 100% test pass).
- [x] **Kanban Core & Kéo - Thả nâng cao (DnD):**
  - [x] Tích hợp `@atlaskit/pragmatic-drag-and-drop`.
  - [x] Hiệu ứng chuyển động **FLIP Animation** lướt mượt mà ([`flip.ts`](../src/shared/lib/dnd/flip.ts)).
  - [x] Cơ chế **Auto-scroll** khi kéo thẻ/cột chạm mép màn hình.
  - [x] Kéo thả sắp xếp cột và kéo thả thẻ giữa các cột.
  - [x] Kéo thả sắp xếp danh sách Board trên Sidebar.
  - [x] Thuật toán **Fractional Indexing** ([`order.ts`](../src/features/board/lib/order.ts)) chèn phần tử không gây xung đột.
  - [x] Thêm cột mới ([`AddColumn.tsx`](../src/features/board/components/AddColumn.tsx)), đổi tên cột tại chỗ, đổi màu nhấn (accent color) và xóa cột.
  - [x] Thêm thẻ nhanh dưới chân mỗi cột ([`CardComposer.tsx`](../src/features/board/components/CardComposer.tsx)).
  - [x] Sửa tiêu đề thẻ tại chỗ ([`InlineEdit.tsx`](../src/features/board/components/InlineEdit.tsx)).
- [x] **Markdown Pipeline & Soạn thảo CodeMirror 6:**
  - [x] Trình soạn thảo **CodeMirror 6** ([`CodeEditor.tsx`](../src/features/editor/components/CodeEditor.tsx)) có Live Preview trang trí Markdown trực tiếp khi soạn thảo.
  - [x] Modal soạn thảo thẻ hai chế độ Write / Preview ([`CardEditorModal.tsx`](../src/features/board/components/CardEditorModal.tsx)).
  - [x] Hiển thị Markdown chuẩn GitHub ([`MarkdownView.tsx`](../src/features/editor/components/MarkdownView.tsx)) kèm gộp ô bảng (`tableMerge.ts`).
  - [x] Tự động render sơ đồ lưu đồ **Mermaid.js** ([`MermaidBlock.tsx`](../src/features/editor/components/MermaidBlock.tsx)).
  - [x] Hỗ trợ hộp chú thích cảnh báo Callout / Admonition ([`rehype-callouts`](../src/features/editor/components/MarkdownView.tsx)).
  - [x] **Task Checklist tương tác trực tiếp ([`TaskItem.tsx`](../src/features/editor/components/TaskItem.tsx)):** Checkbox có thể click đổi 9 trạng thái ngay khi đang xem.
- [x] **Quản lý State & Offline LocalStorage:**
  - [x] Kiến trúc **Zustand Optimistic UI + Write-behind** ([`boardStore.ts`](../src/features/board/stores/boardStore.ts)).
  - [x] Lưu trữ bảng hoàn chỉnh vào `localStorage` của trình duyệt ([`local.ts`](../src/features/board/stores/storage/local.ts)), không mất dữ liệu khi F5.
  - [x] Tự sinh dữ liệu mẫu ban đầu ([`seed.ts`](../src/features/board/lib/seed.ts)).

---

## Giai đoạn 1: Nền tảng Dữ liệu & Xác thực (Auth & Persistence)
> **Mục tiêu:** Chuyển từ mock data (`fixtures.ts`) sang cơ sở dữ liệu thật, có hệ thống tài khoản và đồng bộ thời gian thực hai chiều.

### Nhiệm vụ chi tiết:
- [ ] **Firebase Authentication:**
  - [ ] Hoàn thiện giao diện [`LoginPage.tsx`](../src/features/auth/components/LoginPage.tsx) với Mantine: Đăng ký, Đăng nhập (Email/Password, Google Auth), Đăng xuất.
  - [ ] Xây dựng Auth Guard bảo vệ các route (chuyển hướng về `/login` nếu chưa xác thực).
  - [ ] Quản lý phiên đăng nhập người dùng trong Zustand store.
- [ ] **Quản lý Space & Board động (Thay thế `fixtures.ts`):**
  - [ ] Tạo bảng điều khiển Spaces: Tạo Space mới, đổi tên, xóa Space.
  - [ ] Quản lý danh sách Boards trong từng Space: Thêm Board mới, đổi tên, xóa Board.
  - [ ] Lưu cấu trúc phân cấp người dùng vào Firestore.
- [ ] **Firestore Security Rules & Realtime Sync:**
  - [ ] Cập nhật [`firestore.rules`](../firestore.rules): Cho phép người dùng đọc/ghi dữ liệu thuộc quyền sở hữu của chính họ (`request.auth.uid`).
  - [ ] Tích hợp `onSnapshot` vào [`boardStore.ts`](../src/features/board/stores/boardStore.ts) để đồng bộ 2 chiều (khi mở nhiều tab/nhiều thiết bị).

---

## Giai đoạn 2: Trello Parity & Chi tiết thẻ (Card Back)
> **Mục tiêu:** Cung cấp đầy đủ các tính năng quản lý công việc chuẩn Kanban.

### Nhiệm vụ chi tiết:
- [ ] **Mở rộng thuộc tính của Card:**
  - [ ] Bổ sung schema: `labels` (màu sắc + tiêu đề), `dueDate` (hạn chót + trạng thái hoàn thành), `customFields` (danh sách tùy chọn).
  - [ ] Hiển thị nhãn màu và badge ngày hết hạn ngay trên thẻ ngoài bảng Kanban ([`CardTile.tsx`](../src/features/board/components/CardTile.tsx)).
- [ ] **Nâng cấp Card Back chi tiết (Modal xem/sửa thẻ đầy đủ):**
  - [ ] Cột chính: Tiêu đề sửa tại chỗ, trình soạn thảo Markdown chi tiết, checklist công việc.
  - [ ] Cột bên (Sidebar controls): Chọn nhãn (Labels), Hạn chót (Due Date), Tệp đính kèm (Attachments), Di chuyển/Sao chép/Xóa thẻ.
- [ ] **Tệp đính kèm (Attachments):**
  - [ ] Tích hợp tải file/ảnh lên Firebase Storage.
  - [ ] Hiển thị danh sách file đính kèm trên Card Back, hỗ trợ xem trước ảnh (image preview).
- [ ] **Quick Menu & Tinh chỉnh UI:**
  - [ ] Thêm menu ngữ cảnh thao tác nhanh trên thẻ (Đổi tên nhanh, Đổi nhãn, Di chuyển sang cột khác).
  - [ ] Trau chuốt giao diện Mantine Theme, khoảng cách và hiệu ứng hover.

---

## Giai đoạn 3: Chia sẻ, Phân quyền & Cộng tác (Collaboration)
> **Mục tiêu:** Hỗ trợ làm việc nhóm, chia sẻ cho thành viên ngoài qua link và thảo luận tại thẻ.

### Nhiệm vụ chi tiết:
- [ ] **Chia sẻ bằng liên kết (Guest Link):**
  - [ ] Tạo dialog sinh mã liên kết chia sẻ cho cả Space hoặc từng Board cụ thể.
  - [ ] Hỗ trợ các cấp độ phân quyền: `view` (chỉ xem), `comment` (bình luận), `edit` (chỉnh sửa).
  - [ ] Hoàn thiện route [`/g/$token`](../src/routes/g.$token.tsx) và cấu hình Firestore Security Rules cho phép guest truy cập theo token hợp lệ.
  - [ ] Cơ chế nhúng Stack: Stack được nhúng trong tab đã chia sẻ vẫn hiển thị được dù tab gốc không chia sẻ.
- [ ] **Bình luận & Nhật ký hoạt động (Comments & Activity Log):**
  - [ ] Tạo component khung thảo luận riêng trên Card Back.
  - [ ] Lưu bình luận vào thẻ (hỗ trợ hiển thị avatar, tên người gửi, thời gian gửi tương đối).
  - [ ] Ghi nhận lịch sử hoạt động cơ bản (ai đã tạo thẻ, di chuyển thẻ sang cột nào).
- [ ] **Quản lý thành viên (Members):**
  - [ ] Hoàn thiện popup Members trên thanh công cụ: Mời thành viên theo email, gán vai trò (Owner, Editor, Viewer).

---

## Giai đoạn 4: Tính năng Obsidian & Realtime Nâng cao
> **Mục tiêu:** Tạo điểm nhấn công nghệ độc đáo (Knowledge Management + Serverless WebRTC).

### Nhiệm vụ chi tiết:
- [ ] **Hệ thống liên kết tri thức ([[Wikilink]]):**
  - [ ] Hỗ trợ nhận diện cú pháp `[[Tên Card]]` và `[[Board/Cột/Tên]]`.
  - [ ] Khung danh sách tham chiếu ngược (**Backlinks**) dưới chân mỗi Card.
  - [ ] Tự động quét và cập nhật lại các liên kết tham chiếu khi đổi tên Card.
- [ ] **Nâng cấp Live Preview CodeMirror:**
  - [ ] Tự động ẩn các ký hiệu Markdown (link, list mark, code fence) khi con trỏ rời dòng; render callout và bảng ngay trong lúc soạn thảo.
- [ ] **Tìm kiếm & Bộ lọc (Search & Filter):**
  - [ ] Thanh tìm kiếm nhanh (Ctrl + K / Cmd + K): Tìm kiếm toàn văn theo tiêu đề và nội dung Markdown của tất cả các thẻ trong Space.
  - [ ] Bộ lọc thông minh theo Label, thành viên và trạng thái ngày hết hạn.
- [ ] **Loại thẻ chuyên biệt & Gọi video P2P:**
  - [ ] Tạo `Context Card` (thẻ ghi chú độc lập, thẻ sơ đồ Mermaid không thuộc luồng công việc).
  - [ ] Hoàn thiện Cloudflare Worker ([`worker/src/index.ts`](../worker/src/index.ts)): Tạo API cấp HMAC TURN credentials ngắn hạn.
  - [ ] Tích hợp Trystero (`@trystero-p2p/firebase`) để thực hiện cuộc gọi video WebRTC mesh tối đa 3 peers trực tiếp trên Card gọi video.
  - [ ] Khung chat trao đổi nội bộ trong Space.

---

## Giai đoạn 5: Tối ưu chất lượng, Deploy & Nghiệm thu IT3120
> **Mục tiêu:** Đóng gói hoàn chỉnh, đạt điểm tối đa báo cáo và bảo vệ đồ án.

### Nhiệm vụ chi tiết:
- [ ] **Khả năng tiếp cận & Trải nghiệm (Accessibility):**
  - [ ] Hỗ trợ thao tác kéo thả và điều hướng bằng bàn phím (Keyboard navigation).
  - [ ] Rà soát nhãn ARIA cho trình đọc màn hình trên tất cả các modal và menu popup.
  - [ ] Kiểm thử giao diện và độ tương thích mượt mà trên Firefox, Chrome, Edge.
- [ ] **Đóng gói & Triển khai (Deploy Production):**
  - [ ] Build tối ưu hóa ứng dụng: `pnpm build`.
  - [ ] Deploy Single Page Application lên **Firebase Hosting**.
  - [ ] Deploy Worker lên **Cloudflare Workers** (`pnpm worker:deploy`).
- [ ] **Hồ sơ đồ án IT3120:**
  - [ ] Viết tài liệu báo cáo kỹ thuật hoàn chỉnh: Đặt vấn đề, Thiết kế kiến trúc hệ thống, Giải pháp kỹ thuật nổi bật (Fractional Indexing, FLIP Animation, Write-behind Pattern, WebRTC Mesh).
  - [ ] Soạn thảo Slide thuyết trình chuyên nghiệp.
  - [ ] Chuẩn bị kịch bản Demo: Mở 2 trình duyệt song song để minh họa khả năng đồng bộ realtime, kéo thả thẻ, soạn thảo Markdown live preview và gọi video P2P.

---

## Bảng tổng hợp tiến độ

| Giai đoạn | Trọng tâm | Số đầu việc | Trạng thái |
| :--- | :--- | :---: | :---: |
| **Giai đoạn 0** | Core Kanban DnD, FLIP, Markdown, CodeMirror 6, LocalStorage | **18/18** | ✅ **Đã hoàn thành** |
| **Giai đoạn 1** | Auth, Firestore Rules, onSnapshot, Space/Board CRUD | 0/3 | ⏳ **Đang chuẩn bị làm** |
| **Giai đoạn 2** | Labels, Due Date, Card Back chi tiết, Attachments | 0/4 | ⏹️ Chờ GĐ 1 |
| **Giai đoạn 3** | Guest Link, Phân quyền, Comments, Members | 0/3 | ⏹️ Chờ GĐ 2 |
| **Giai đoạn 4** | Wikilink, Live Preview, Tìm kiếm, Video call P2P | 0/4 | ⏹️ Chờ GĐ 3 |
| **Giai đoạn 5** | Accessibility, Deploy, Báo cáo & Slide IT3120 | 0/3 | ⏹️ Chờ GĐ 4 |
