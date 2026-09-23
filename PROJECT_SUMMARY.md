# สรุปโครงสร้างและเทคโนโลยีในโปรเจกต์ RoomReserve (Meeting Room Booking)

เอกสารนี้รวบรวมและอธิบายรายละเอียดเกี่ยวกับเทคโนโลยี เครื่องมือ และไลบรารีทั้งหมดที่เลือกใช้ในโปรเจกต์ **RoomReserve (ระบบจองห้องประชุมออนไลน์สำหรับองค์กร)** พร้อมทั้งหน้าที่และเหตุผลในการเลือกใช้แต่ละเทคโนโลยี

---

## 1. ภาพรวมสถาปัตยกรรมของโปรเจกต์ (Architecture Overview)

โปรเจกต์นี้พัฒนาด้วยสถาปัตยกรรมแบบ **Decoupled Client-Server (SPA + RESTful API)** โดยแบ่งออกเป็น 2 ส่วนหลัก:
1. **Client (Frontend):** พัฒนาด้วย **React + TypeScript + Vite** ทำหน้าที่แสดงผลหน้าเว็บ (Single Page Application) และจัดการปฏิสัมพันธ์กับผู้ใช้
2. **Server (Backend):** พัฒนาด้วย **Node.js + Express + TypeScript** ทำหน้าที่ให้บริการ RESTful API, ตรวจสอบความถูกต้องของข้อมูล (Validation), จัดการระบบยืนยันตัวตน (Authentication) และเชื่อมต่อฐานข้อมูลผ่าน **Prisma ORM**

```
+-------------------------------------------------------------+
|                      Client (Frontend)                      |
|            React 18 + TypeScript + Vite + Tailwind          |
|    - Single Page Application (SPA)                          |
|    - ไทม์ไลน์ปฏิทิน, หน้าต่างจองห้อง, ระบบสลับภาษา (TH/EN)        |
+-------------------------------------------------------------+
                               |
                        RESTful API (JSON)
                               |
+-------------------------------------------------------------+
|                      Server (Backend)                       |
|           Node.js + Express + TypeScript + Zod              |
|    - Authentication (JWT + Bcrypt)                          |
|    - Conflict Detection Algorithm (ป้องกันเวลาจองชนกัน)         |
+-------------------------------------------------------------+
                               |
                           Prisma ORM
                               |
+-------------------------------------------------------------+
|                      Database Layer                         |
|                   SQLite (dev.db)                           |
+-------------------------------------------------------------+
```

---

## 2. รายละเอียดเทคโนโลยีฝั่ง Frontend (Client)

| เทคโนโลยี / ไลบรารี | หน้าที่ในโปรเจกต์ | เหตุผลที่เลือกใช้ (Why use it?) |
|---|---|---|
| **React 18** | ไลบรารีหลักสำหรับสร้าง User Interface (UI) | • รองรับการพัฒนาแบบ Component-driven แยกชิ้นส่วน UI เช่น Navbar, RoomCard, ScheduleView, Modal ชัดเจน<br>• จัดการ State และ Re-render ข้อมูลแบบเรียลไทม์ได้อย่างมีประสิทธิภาพ<br>• มี Ecosystem และชุมชนผู้ใช้งานกว้างขวาง |
| **Vite** | Frontend Build Tool และ Development Server | • ทำงานเร็วกว่า Webpack หรือ Create-React-App มาก<br>• รองรับ **Hot Module Replacement (HMR)** ที่สะท้อนการแก้โค้ดบนหน้าเว็บได้ในเสี้ยววินาที<br>• มีระบบ Build สำหรับ Production ที่มีประสิทธิภาพสูง (Rollup-based) |
| **TypeScript** | ภาษาหลักในการพัฒนา (Static Typing) | • ช่วยกำหนด Type ให้กับข้อมูล (เช่น Room, Booking, User)<br>• ป้องกันข้อผิดพลาด (Runtime Bugs) ตั้งแต่ขั้นตอนเขียนโค้ด<br>• ทำงานร่วมกับ IDE ได้ดี มี Autocomplete ครบถ้วน |
| **Tailwind CSS** | Utility-first CSS Framework สำหรับตกแต่งหน้าเว็บ | • ปรับแต่งสไตล์ได้รวดเร็วผ่าน Class Name โดยไม่ต้องสลับไปเขียนไฟล์ CSS ขนาดใหญ่<br>• รองรับ Responsive Design (มือถือ, แท็บเล็ต, เดสก์ท็อป) ได้ง่าย<br>• จัดการ Design System (สี, ระยะห่าง, แอนิเมชัน) ได้สม่ำเสมอทั่วทั้งแอป |
| **Lucide React** | ชุดไอคอนแบบ SVG (Icons Library) | • ไอคอนสไตล์โมเดิร์น สวยงาม คมชัดในทุกขนาดหน้าจอ<br>• น้ำหนักเบา (Tree-shakable) ดึงมาเฉพาะไอคอนที่เรียกใช้เท่านั้น เช่น Calendar, Clock, MapPin, Users |
| **Date-fns** | จัดการวันที่และเวลา (Date Utility Library) | • ใช้จัดรูปแบบวันที่ เวลา และคำนวณช่วงเวลาสำหรับการจอง<br>• เป็นแบบ Modular ทำให้ขนาดบันเดิลเล็กกว่า Moment.js |
| **clsx & tailwind-merge** | จัดการการต่อ Class Name แบบมีเงื่อนไข | • ช่วยรวม Class ของ Tailwind อย่างถูกต้อง ป้องกันปัญหา Class ชนกันเมื่อมีการ Overwrite สไตล์ |

---

## 3. รายละเอียดเทคโนโลยีฝั่ง Backend (Server)

| เทคโนโลยี / ไลบรารี | หน้าที่ในโปรเจกต์ | เหตุผลที่เลือกใช้ (Why use it?) |
|---|---|---|
| **Node.js** | JavaScript Runtime สภาพแวดล้อมสำหรับรันฝั่งเซิร์ฟเวอร์ | • ใช้ภาษา JavaScript/TypeScript เดียวกันทั้งระบบ (Full-stack JS)<br>• สถาปัตยกรรม Non-blocking I/O รองรับคำขอ (Concurrent Requests) จำนวนมากได้ดีและกินทรัพยากรน้อย |
| **Express.js** | เว็บเฟรมเวิร์กสำหรับสร้าง RESTful API | • เรียบง่าย น้ำหนักเบา (Lightweight & Unopinionated) ไม่ซับซ้อน<br>• มีระบบ Routing และ Middleware ที่ยืดหยุ่น จัดการ Error Handling ได้สะดวก |
| **TypeScript & TSX** | ภาษาและตัวรันไทม์สำหรับ Backend | • ช่วยให้ API Requests และ Responses มี Data Types ชัดเจน<br>• `tsx` ช่วยให้รันไฟล์ `.ts` ได้โดยตรงโดยไม่ต้องคอมไพล์เป็น `.js` ก่อนในระหว่าง Development |
| **Prisma ORM** | Object-Relational Mapping เชื่อมต่อฐานข้อมูล | • สร้าง Data Model ผ่านไฟล์ `schema.prisma` ที่อ่านเข้าใจง่าย<br>• มี **Auto-generated Type-safe Client** ป้องกันปัญหาเขียน Query ผิด<br>• มีระบบ Migrate และ Seed ข้อมูลเริ่มต้นที่สะดวกมาก |
| **SQLite (`dev.db`)** | ฐานข้อมูลเชิงสัมพันธ์ (Relational Database) | • เป็นไฟล์ฐานข้อมูลเดี่ยว (File-based) ไม่ต้องติดตั้งและเปิด Database Server แยก<br>• เหมาะสำหรับการพัฒนา (Development), การทดสอบ (Testing) และพอร์ตโฟลิโอ<br>• สามารถสลับไปใช้ PostgreSQL หรือ MySQL ใน Production ได้ง่ายผ่าน Prisma โดยแทบไม่ต้องแก้โค้ด |
| **JSON Web Token (JWT)** | ระบบยืนยันตัวตนแบบไร้สถานะ (Stateless Auth) | • ปลอดภัยและไม่ต้องเก็บ Session ในหน่วยความจำเซิร์ฟเวอร์<br>• ส่ง Token ผ่าน Header เพื่อตรวจสอบสิทธิ์การเข้าถึงข้อมูล (เช่น สิทธิ์ Admin หรือ User ทั่วไป) |
| **Bcryptjs** | เข้ารหัสผ่าน (Password Hashing) | • ใช้แฮชรหัสผ่านของผู้ใช้ก่อนบันทึกลงฐานข้อมูล พร้อมระบบ Salt ป้องกันการถูกโจมตีแบบ Rainbow Table |
| **Zod** | ตรวจสอบความถูกต้องของข้อมูล (Schema Validation) | • ใช้ตรวจสอบข้อมูลที่ส่งเข้ามาใน API (เช่น รูปแบบอีเมล, ความยาวรหัสผ่าน, วันเวลาเริ่มต้น-สิ้นสุดของการจอง)<br>• แจ้งข้อผิดพลาดกลับไปยังผู้ใช้ได้อย่างแม่นยำ |
| **CORS** | Middleware จัดการ Cross-Origin Resource Sharing | • อนุญาตให้ Frontend ที่รันอยู่คนละพอร์ต (`localhost:5173`) สามารถสื่อสารกับ Backend (`localhost:5000`) ได้อย่างปลอดภัย |
| **Dotenv** | จัดการ Environment Variables | • แยกการตั้งค่าที่สำคัญ เช่น `PORT`, `JWT_SECRET`, `DATABASE_URL` ออกจากโค้ดจริงตามหลัก 12-Factor App |

---

## 4. จุดเด่นและฟีเจอร์สำคัญของระบบ (Key Features)

1. **Intelligent Collision Conflict Detection (ระบบป้องกันเวลาจองชนกัน):**
   - เซิร์ฟเวอร์ใช้สมการทางคณิตศาสตร์ในการตรวจสอบช่วงเวลาที่ทับซ้อนกัน:
     $$\text{Overlapping} = (\text{Start}_A < \text{End}_B) \land (\text{End}_A > \text{Start}_B)$$
   - หากตรวจพบว่าห้องประชุมถูกจองไปแล้วในช่วงเวลาดังกล่าว ระบบจะปฏิเสธคำขอทันทีด้วยรหัส `HTTP 409 Conflict` พร้อมระบุชื่อผู้ที่จองไว้ก่อนหน้า
2. **Role-Based Access Control (RBAC):**
   - แบ่งสิทธิ์ผู้ใช้งานเป็น `USER` (จองห้อง, ดูคิว, ยกเลิกการจองของตนเอง) และ `ADMIN` (จัดการห้องประชุมและระบบ)
3. **Bilingual Support (รองรับ 2 ภาษา):**
   - สลับภาษาได้ทันทีระหว่าง **ไทย** และ **อังกฤษ**
   - มีระบบแปลงปีเป็น **พ.ศ. (พุทธศักราช)** เมื่อใช้งานภาษาไทย และ **ค.ศ.** เมื่อใช้งานภาษาอังกฤษ
4. **Interactive UI & Animations:**
   - **Splash Screen:** หน้าจอโหลดเปิดตัวแบบ Staggered Entrance Animation พร้อมวงแหวนประเรืองแสงและแถบสถานะ
   - **Timeline View:** ตารางไทม์ไลน์แสดงสถานะห้องว่างแบบเรียลไทม์ พร้อมปุ่มปฏิทินแบบ Popover สองภาษา
   - **Skeleton Loader:** แสดงโครงร่างการ์ดห้องประชุมพร้อมแอนิเมชันกระพริบขณะดึงข้อมูล
