# 🏢 RoomReserve - Modern Conference & Meeting Room Booking System

> ระบบจองห้องประชุมออนไลน์ระดับองค์กร (Enterprise Meeting Room Booking System) พัฒนาด้วย React, TypeScript, Node.js, Express และ Prisma ORM

---

## ✨ ไฮไลท์ฟีเจอร์เด่น (Key Features)

1. **ไทม์ไลน์ปฏิทินแบบเรียลไทม์ (Interactive Schedule Timeline)**:
   - ตารางแสดงคิวจองแบบรายชั่วโมงของแต่ละห้องประชุม
   - ระบบสลับวันที่พร้อมรองรับปี พ.ศ. (ไทย) และ ค.ศ. (English)
2. **ระบบป้องกันการจองเวลาชนกัน (Collision Conflict Prevention)**:
   - ตรวจสอบผ่านสมการ `(newStart < existingEnd) AND (newEnd > existingStart)`
   - ปฏิเสธทันทีด้วยรหัส HTTP `409 Conflict` พร้อมแจ้งชื่อผู้ที่จองคิวก่อนหน้า
3. **ระบบค้นหาและกรองห้องประชุมอัจฉริยะ (Smart Filter & Search)**:
   - แถบตัวกรองแบบพับเก็บได้ (Collapsible Drawer) สบายตา ไม่รกหน้าจอ
   - ค้นหาคำสำคัญจากชื่อห้อง, ชั้น/สถานที่, หรืออุปกรณ์
   - กรองตามความจุ (1-4 คน, 5-10 คน, 11+ คน) และกรองเฉพาะห้องพร้อมใช้งาน
4. **ระบบเช็คอิน & ปล่อยห้องว่างอัตโนมัติ (Check-in & Auto-Release)**:
   - แก้ปัญหา "จองกั๊กแล้วไม่มาใช้งาน"
   - ผู้จองต้องกดปุ่ม "เช็คอินเข้าห้อง" ในช่วง 15 นาทีก่อนหรือหลังเวลาเริ่มประชุม
   - หากไม่มาเช็คอินใน 15 นาที ระบบจะยกเลิกคิวและคืนห้องว่างให้เพื่อนร่วมงานทันที
5. **ศูนย์ควบคุมสำหรับผู้ดูแลระบบ (Admin Dashboard)**:
   - สิทธิ์ `ADMIN` เข้าถึงปุ่ม "จัดการระบบ" บน Navbar
   - CRUD เพิ่ม, แก้ไข, ลบข้อมูลห้องประชุม
   - โหมดปิดปรับปรุง (Maintenance Mode Toggle)
   - ดูประวัติการจองของทุกคนในองค์กร พร้อมสิทธิ์ยกเลิกคิวฉุกเฉิน
6. **Toast Notification ลอยมุมจอ (Floating Toast Alerts)**:
   - แจ้งเตือนสถานะการทำงานนุ่มนวล พร้อม Auto-dismiss 4 วินาที
7. **ระบบ 2 ภาษา (Bilingual Support)**:
   - สลับใช้งานระหว่างภาษาไทย (TH) และภาษาอังกฤษ (EN) ได้ทันที

---

## 🛠️ สถาปัตยกรรมและเทคโนโลยีที่ใช้ (Tech Stack)

### Frontend (`/client`)
- **React 18** + **TypeScript**
- **Vite** (Build Tool & Dev Server)
- **Tailwind CSS** (Utility-First Modern Styling)
- **Lucide React** (Clean Enterprise Icons)
- **Date-fns** (Date manipulation & Thai Buddhist era formatting)

### Backend (`/server`)
- **Node.js** + **Express** (TypeScript)
- **Prisma ORM** + **SQLite** (พร้อม Schema Migration)
- **JWT (JSON Web Token)** + **Bcrypt.js** (Security & Role-based Auth)
- **Zod** (Schema Validation)

---

## 🚀 เริ่มต้นใช้งาน (Getting Started)

### 1. โคลนโปรเจกต์ (Clone Repository)
```bash
git clone https://github.com/your-username/meeting-room-booking.git
cd meeting-room-booking
```

### 2. ติดตั้ง Dependencies และตั้งค่า Backend (`/server`)
```bash
cd server
npm install

# คัดลอกไฟล์ Environment Variables
cp .env.example .env

# ตั้งค่าฐานข้อมูลและสร้างตาราง
npx prisma db push

# ใส่ข้อมูลตัวอย่าง (Admin, User, Rooms, Bookings)
npm run seed

# รัน Backend Server (Port 5000)
npm run dev
```

### 3. ติดตั้ง Dependencies และรัน Frontend (`/client`)
เปิด Terminal ใหม่อีกหน้าต่าง:
```bash
cd client
npm install

# รัน Frontend Dev Server (Port 5173)
npm run dev
```

เปิดเบราว์เซอร์ไปที่: **`http://localhost:5173`**

---

## 🔑 บัญชีสำหรับทดสอบระบบ (Demo Accounts)

สามารถกดปุ่ม **1-Click Demo** ในหน้าเข้าสู่ระบบ หรือใช้บัญชีด้านล่าง:

| บทบาท (Role) | อีเมล (Email) | รหัสผ่าน (Password) | สิทธิ์การใช้งาน |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `admin123` | จัดการห้องประชุม, ปิดปรับปรุงห้อง, ดู/ยกเลิกคิวทุกคน |
| **Employee** | `john@company.com` | `user123` | จองห้อง, เช็คอิน, จัดการการจองของตนเอง |

---

## 🚢 คำแนะนำสำหรับการ Deploy ขึ้น Production

### ฝั่ง Frontend (Vercel / Netlify)
1. Deploy โฟลเดอร์ `client/`
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. ตั้งค่า Environment Variable:
   - `VITE_API_URL`: URL ของ Backend ที่ Deploy แล้ว เช่น `https://your-backend.onrender.com`

### ฝั่ง Backend (Render / Railway / Fly.io)
1. Deploy โฟลเดอร์ `server/`
2. Build Command: `npm run build` *(สคริปต์จะรัน `prisma generate && tsc` อัตโนมัติ)*
3. Start Command: `npm start`
4. ตั้งค่า Environment Variables:
   - `PORT`: `5000` (หรือตามที่ผู้ให้บริการกำหนด)
   - `DATABASE_URL`: `"file:./dev.db"` (หรือต่อ PostgreSQL / MySQL)
   - `JWT_SECRET`: คีย์สุ่มความปลอดภัยสูง
   - `FRONTEND_URL`: URL ของ Frontend เช่น `https://your-app.vercel.app`

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
