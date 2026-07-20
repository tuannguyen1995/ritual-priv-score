# 🛡️ Ritual PrivScore (TEE & ZKP Reputation System)

## 📌 Giới thiệu dự án (Introduction)
**Ritual PrivScore** là một ứng dụng phi tập trung (dApp) tiên tiến được xây dựng trên mạng lưới **Ritual Testnet**. Dự án giải quyết bài toán chống Sybil (tài khoản ảo) và chấm điểm uy tín cho ví Web3 một cách hoàn toàn bảo mật và riêng tư. 

Bằng việc kết hợp môi trường thực thi tin cậy **(TEE - Trusted Execution Environment)** và mạng lưới AI của Ritual, hệ thống sẽ tự động quét, phân tích siêu dữ liệu on-chain của bất kỳ địa chỉ ví nào và cấp một số điểm uy tín (PrivScore). Điểm số này sau đó được mã hóa bằng **Zero-Knowledge Proof (ZKP)** để người dùng có thể chứng minh uy tín của mình mà không cần tiết lộ lịch sử giao dịch chi tiết.

## 🚀 Các tính năng cốt lõi (Key Features)
- **🧠 TEE LLM Inference:** Sử dụng các mô hình AI phi tập trung (như Llama-3, Mistral) chạy trong các node TEE của Ritual để phân tích dữ liệu ví (tuổi đời, số lượng giao dịch, volume DeFi, tần suất tương tác Smart Contract).
- **🔒 Zero-Knowledge Minting:** Kết quả phân tích được đóng gói thành ZKP và mint dưới dạng Soulbound Token (SBT) để xác thực danh tính Web3.
- **⚡ Tính điểm Deterministic:** Mỗi địa chỉ ví sẽ luôn nhận được một mức điểm duy nhất và công bằng dựa trên lịch sử on-chain thực tế của họ (Điểm từ 450 - 850).
- **📡 Trực quan hóa dữ liệu (Data Visualization):** Hệ thống Radar và đồ thị tương tác (Force Graph) giúp người dùng dễ dàng hình dung biểu đồ hành vi tương tác trên mạng lưới.
- **🔗 Tích hợp Web3 Tiêu Chuẩn:** Kết nối mượt mà với bất kỳ ví EVM nào thông qua kiến trúc **Wagmi & RainbowKit**, theo dõi số dư RITUAL token theo thời gian thực (real-time).

## 🛠️ Công nghệ sử dụng (Tech Stack)
- **Giao diện (Frontend):** React 19, Vite, Framer Motion (Animation), Recharts (Radar Chart), react-force-graph-2d (On-chain graph).
- **Web3 & Blockchain:** Wagmi, Viem, RainbowKit (Wallet Connection).
- **Mạng lưới triển khai:** Ritual Testnet (Chain ID: 1979).
- **Lưu trữ & Triển khai:** Vercel (Production-Ready).
- **UI/UX Design:** Dark Mode / Light Mode, CSS Variables, Glassmorphism, Responsive Grid cho mọi thiết bị di động.

## 🎯 Luồng hoạt động (Workflow)
1. **Kết nối ví:** Người dùng truy cập và kết nối ví thông qua nút RainbowKit.
2. **Thu thập On-chain:** Ứng dụng quét toàn bộ dấu vết của ví trên blockchain.
3. **Phân tích TEE:** Dữ liệu được gửi vào môi trường bảo mật Enclave của Ritual, nơi LLM phân tích và đánh giá điểm Sybil.
4. **ZKP & SBT:** Điểm số cuối cùng (PrivScore) được mã hóa bằng ZKP và cấp chứng nhận (Verified Soulbound).

## 🌐 Trải nghiệm trực tiếp (Live Demo)
- **Website:** [https://ritualprivscore.vercel.app](https://ritualprivscore.vercel.app)
- **Smart Contract Network:** Ritual Testnet

---
*Dự án được phát triển nhằm mục đích tham gia hệ sinh thái Ritual, minh chứng cho sức mạnh của sự kết hợp giữa AI phi tập trung và bảo mật mật mã học.*
