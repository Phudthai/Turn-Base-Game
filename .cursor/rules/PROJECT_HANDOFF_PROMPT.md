# Turn-Base Game Project - Complete Handoff Documentation

## Project Overview

I'm developing "Idle: Picoen" - a sophisticated turn-based RPG game with gacha mechanics. This is a full-stack web application with plans for mobile/desktop expansion.

## Technology Stack

- **Backend**: Bun + ElysiaJS + MongoDB + TypeScript
- **Frontend**: React + TypeScript + Bun (No Vite/Node.js/npm/pnpm per workspace rule)
- **Database**: MongoDB with Mongoose ODM
- **Development**: All commands use Bun instead of Node.js/npm

## Project Structure

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

## Game Features & Mechanics

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

## Current Game State

### Backend Status

- **Running**: Successfully on localhost:8000
- **Database**: MongoDB connected and operational
- **APIs**: All endpoints working (characters, battles, gacha, etc.)

### Frontend Status

- **Issue**: Frontend won't start due to port 3001 being in use (EADDRINUSE error)
- **Expected Port**: localhost:3001
- **Current Screen**: Character Selection Screen with horizontal layout
- **UI Features**:
  - Modern gradient backgrounds
  - Responsive design for all screen sizes
  - Character filtering and selection
  - Team preview system
  - Battle ready button

### Game Lobby Features (As shown in user's screenshot)

- **Gacha**: Character summoning system
- **Campaign**: Story mode battles
- **Market**: Trading marketplace
- **Arena**: PvP battles
- **Guild**: Social features
- **Dungeon**: Special challenge content

## Recent Major Development

### Enhanced Battle System (Just Completed)

I recently implemented a comprehensive battle system overhaul with:

#### Smart AI System

```typescript
// 5 AI Strategies implemented
- AGGRESSIVE: High damage, low defense
- DEFENSIVE: High defense, healing focus
- TACTICAL: Balanced with strategic decisions
- BERSERKER: High risk/reward gameplay
- SUPPORT: Team-based healing and buffs
```

#### Enemy Variety

- **Goblin**: Basic aggressive enemy
- **Orc**: Defensive tank enemy
- **Skeleton**: Speed-based attacker
- **Troll**: High HP regenerator
- **Dragon**: Elite boss-type enemy

#### Reward System

- Performance-based scoring
- Loot drops with rarity (R/SR/SSR)
- Experience and currency rewards
- Battle statistics tracking

#### Key Files Modified

- `backend/src/services/battle.service.ts` - Core battle logic with AI
- `backend/src/services/battle-rewards.service.ts` - Reward calculation
- `backend/src/types/battle.types.ts` - Enhanced type definitions
- `backend/src/controllers/battle.controller.ts` - API endpoints
- `BATTLE_SYSTEM.md` - Complete documentation

## API Endpoints

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

## Current Issues

### Frontend Port Conflict

- Port 3001 is occupied, preventing frontend startup
- Need to either free port 3001 or configure different port
- Backend is running fine on port 8000

### Missing Battle Entry Point

- User noted no direct "Battle" button in game lobby
- May need to add battle access through Campaign or create dedicated Battle section

## Development Commands

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

## Next Steps Needed

1. **Resolve Frontend Port Issue**

   - Kill process on port 3001 or configure new port
   - Get frontend running and accessible

2. **Battle System Integration**

   - Add battle entry point to game lobby
   - Connect character selection to battle system
   - Test battle flow end-to-end

3. **Frontend Battle UI**
   - Create battle interface components
   - Implement real-time battle state updates
   - Add battle results screen

## Important Notes

- **Use Bun Only**: Workspace rule prohibits Node.js/npm/pnpm/vite
- **MongoDB**: Database needs to be running for backend
- **Character Selection**: Has comprehensive filtering and team selection
- **Responsive Design**: All screens support mobile to desktop
- **TypeScript**: Strict typing throughout the project

## User's Current Request

User asked me to "handle it" (จัดการมาเลย) referring to resolving the frontend access issue and getting the battle system fully functional in the game interface.

---

**Status**: Backend fully operational, frontend blocked by port conflict, battle system ready for integration.
