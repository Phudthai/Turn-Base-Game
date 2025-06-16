# Idle: Picoen Backend

A backend server for the Idle: Picoen game built with Bun and ElysiaJS.

## 🛠️ Setup

1. Install dependencies:

```bash
bun install
```

2. Create `.env` file (optional):

```bash
JWT_SECRET=supersecretkey
PORT=3000
```

3. Start the server:

```bash
bun run src/index.ts
```

## 🎮 API Endpoints

### Public Endpoints

#### GET /

- Welcome message
- Response: `Welcome to Idle: Picoen API`

#### POST /register

- Register a new user
- Body:

```json
{
  "username": "player1",
  "password": "password123"
}
```

- Response:

```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "player1",
    "createdAt": "timestamp"
  }
}
```

#### POST /login

- Login with existing credentials
- Body:

```json
{
  "username": "player1",
  "password": "password123"
}
```

- Response: Same as register

### Protected Endpoints

These endpoints require a JWT token in the Authorization header:
`Authorization: Bearer your_token_here`

#### GET /gacha

- Perform a gacha pull
- Response:

```json
{
  "success": true,
  "pull": {
    "type": "characters|pets|items",
    "item": {
      "id": "item_id",
      "name": "Item Name",
      "rarity": "R|SR|SSR"
      // ... other properties
    }
  }
}
```

## 📝 Development Notes

- Uses JSON files for data storage (`data/users.json`, `data/gacha-pool.json`)
- JWT authentication for protected endpoints
- CORS enabled for frontend integration
- Error handling middleware included

## 🎯 Future Improvements

- Add password hashing
- Implement battle system
- Add inventory management
- Integrate with database
- Add more gacha mechanics
- Add user progression system
