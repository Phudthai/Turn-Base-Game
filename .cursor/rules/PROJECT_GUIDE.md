# Idle: Picoen - Project Overview & Rules

---

## 1. Project Overview

I'm developing "Idle: Picoen" - a sophisticated turn-based RPG game with gacha mechanics. This is a full-stack web application with plans for mobile/desktop expansion.

### Technology Stack

- **Backend**: Bun + ElysiaJS + MongoDB + TypeScript
- **Frontend**: React + TypeScript + Bun (No Vite/Node.js/npm/pnpm per workspace rule)
- **Database**: MongoDB with Mongoose ODM
- **Development**: All commands use Bun instead of Node.js/npm

---

## 2. Project Structure

```
/Users/kanokpol/Game/Turn-Base-Game/
├── backend/                 # Bun + ElysiaJS API server
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── services/        # Business logic layer
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── types/           # TypeScript type definitions
│   │   └── index.ts         # Server entry point
│   └── package.json
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── screens/     # Game screens
│   │   │   └── ui/          # Reusable UI components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   └── App.tsx
│   └── package.json
└── BATTLE_SYSTEM.md         # Battle system documentation
```

---

## 3. Game Features & Mechanics

### Core Game Systems

1. **Character System**
   - Multiple character types with unique stats
   - Level progression (1-100)
   - Rarity system (R/SR/SSR)
   - Grade system (C/B/A/S)
   - Favorite marking system
2. **Gacha System**
   - Character summoning with different rates
   - Currency-based pulls
   - Rarity-based drop rates
3. **Battle System** (Recently Enhanced)
   - Turn-based combat mechanics
   - 5 AI strategies: Aggressive, Defensive, Tactical, Berserker, Support
   - 5 enemy types with unique behaviors
   - Dynamic damage calculation with variance
   - Critical hit system
   - Energy management system
   - Performance-based rewards
   - Difficulty scaling (Easy/Normal/Hard/Nightmare)
4. **Inventory & Items**
   - Item management system
   - Equipment system
   - Consumables
5. **Market System**
   - Item trading
   - Character trading

---

## 4. API Endpoints

### Battle System

```
POST /api/battle/start          # Start new battle
POST /api/battle/action         # Execute battle action
POST /api/battle/complete       # Complete battle and get rewards
GET  /api/battle/rewards        # Get battle rewards
GET  /api/battle/statistics     # Get battle stats
```

### Character System

```
GET  /api/characters           # Get all characters
GET  /api/characters/:id       # Get specific character
POST /api/characters           # Create character
PUT  /api/characters/:id       # Update character
```

### Gacha System

```
POST /api/gacha/pull          # Pull characters
GET  /api/gacha/rates         # Get pull rates
```

---

## 5. Development Commands

### Backend

```bash
cd backend
bun install        # Install dependencies
bun run dev        # Start development server (port 8000)
```

### Frontend

```bash
cd frontend
bun install        # Install dependencies
bun run dev        # Start development server (port 3001 - currently failing)
```

---

## 6. Project Rules

@rules

### 1. Project Structure

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

### 2. Naming & Code Style

- PascalCase สำหรับ React components และไฟล์ `.tsx`
- kebab-case สำหรับไฟล์ CSS
- camelCase สำหรับตัวแปรและฟังก์ชัน
- ทุกหน้าต้อง import CSS ที่เกี่ยวข้องเอง (ไม่ import CSS ซ้อนกัน)
- ใช้ TypeScript ทุกไฟล์

### 3. CSS & Styling

- CSS แบ่งเป็น global, components, และ page-specific
- ใช้ CSS ปกติ (ไม่ใช้ CSS-in-JS, styled-components)
- ทุกหน้าต้อง import global.css, animations.css, และ CSS ของตัวเอง
- ปุ่ม/Modal/ฟอร์ม ใช้ CSS จาก `styles/components/`

### 4. Build & Run

- ใช้ Bun เท่านั้น (ห้ามใช้ Node.js, npm, vite, pnpm, yarn)
- รันเซิร์ฟเวอร์ด้วย `bun --hot index.ts`
- ติดตั้ง dependency ด้วย `bun install`
- ไม่ต้องใช้ dotenv, Bun โหลด .env อัตโนมัติ

### 5. Main Features

- **Auth**: ใช้ AuthContext, มี login/register/logout, ดึง user profile จาก backend
- **Lobby**: หน้า GameLobby, มีระบบ drag, area, profile, currency, ปุ่มลอยขวาล่าง
- **Gacha**: ระบบสุ่มไอเท็ม/ตัวละคร, มี animation, pity, multi-pull
- **Inventory**: แสดงไอเท็ม, modal รายละเอียด, filter/sort
- **Settings**: ตั้งค่าเกม, ภาษา, กราฟิก, logout, reset, export/import save
- **Battle**: (ถ้ามี) ระบบเลือกตัว, เริ่มต่อสู้

### 6. Special Rules

- ห้ามใช้ Express, Vite, Webpack, styled-components, dotenv, ioredis, pg, postgres.js, ws
- ใช้ Bun API (Bun.serve, Bun.sql, Bun.redis, WebSocket built-in)
- HTML import React/CSS ได้ตรงๆ ใน index.html

### 7. อื่นๆ

- ทุกฟีเจอร์ต้องรองรับ Responsive/Mobile
- Animation ใช้ keyframes ใน animations.css
- ถ้าสงสัย path import ให้เช็คจากโครงสร้างจริง
- ถ้าต้องการเพิ่มฟีเจอร์ใหม่ ให้แยกเป็นไฟล์/โฟลเดอร์ใหม่ตามหมวด

---

## 7. Battle System

For full details, see [BATTLE_SYSTEM.md](./BATTLE_SYSTEM.md)

- Smart AI (5 strategies)
- Dynamic rewards
- Performance-based loot
- API endpoints for battle flow
- See BATTLE_SYSTEM.md for mechanics, formulas, and advanced features

---
