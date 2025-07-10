@rules

# Turn-Base Game Project Rules

## 1. Project Structure

```
frontend/
  src/
    pages/                # React page components (1 page = 1 screen)
    components/           # Reusable React components (modals, cards, etc.)
    context/              # React context providers (AuthContext, etc.)
    hooks/                # Custom React hooks
    services/             # API calls, data logic
    styles/               # Global & component CSS
      global.css
      animations.css
      components/
  public/                 # Static files (images, icons, etc.)
  index.html              # Entry HTML file
  frontend.tsx            # React entry point
index.ts                  # Bun server entry point
```

## 2. Naming & Code Style

- PascalCase สำหรับ React components และไฟล์ `.tsx`
- kebab-case สำหรับไฟล์ CSS
- camelCase สำหรับตัวแปรและฟังก์ชัน
- ทุกหน้าต้อง import CSS ที่เกี่ยวข้องเอง (ไม่ import CSS ซ้อนกัน)
- ใช้ TypeScript ทุกไฟล์

## 3. CSS & Styling

- CSS แบ่งเป็น global, components, และ page-specific
- ใช้ CSS ปกติ (ไม่ใช้ CSS-in-JS, styled-components)
- ทุกหน้าต้อง import global.css, animations.css, และ CSS ของตัวเอง
- ปุ่ม/Modal/ฟอร์ม ใช้ CSS จาก `styles/components/`

## 4. Build & Run

- ใช้ Bun เท่านั้น (ห้ามใช้ Node.js, npm, vite, pnpm, yarn)
- รันเซิร์ฟเวอร์ด้วย `bun --hot index.ts`
- ติดตั้ง dependency ด้วย `bun install`
- ไม่ต้องใช้ dotenv, Bun โหลด .env อัตโนมัติ

## 5. Main Features

- **Auth**: ใช้ AuthContext, มี login/register/logout, ดึง user profile จาก backend
- **Lobby**: หน้า GameLobby, มีระบบ drag, area, profile, currency, ปุ่มลอยขวาล่าง
- **Gacha**: ระบบสุ่มไอเท็ม/ตัวละคร, มี animation, pity, multi-pull
- **Inventory**: แสดงไอเท็ม, modal รายละเอียด, filter/sort
- **Settings**: ตั้งค่าเกม, ภาษา, กราฟิก, logout, reset, export/import save
- **Battle**: (ถ้ามี) ระบบเลือกตัว, เริ่มต่อสู้

## 6. Special Rules

- ห้ามใช้ Express, Vite, Webpack, styled-components, dotenv, ioredis, pg, postgres.js, ws
- ใช้ Bun API (Bun.serve, Bun.sql, Bun.redis, WebSocket built-in)
- HTML import React/CSS ได้ตรงๆ ใน index.html

## 7. อื่นๆ

- ทุกฟีเจอร์ต้องรองรับ Responsive/Mobile
- Animation ใช้ keyframes ใน animations.css
- ถ้าสงสัย path import ให้เช็คจากโครงสร้างจริง
- ถ้าต้องการเพิ่มฟีเจอร์ใหม่ ให้แยกเป็นไฟล์/โฟลเดอร์ใหม่ตามหมวด

---

**โปรดแนบ @rules นี้ในทุกคำสั่งที่เกี่ยวกับโค้ดหรือโครงสร้างโปรเจค เพื่อให้ AI Cursor ทำงานได้ถูกต้องและสอดคล้องกับแนวทางของโปรเจคนี้**
