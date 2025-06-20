# Backend Architecture Documentation

## 🏗️ Project Structure

```
backend/src/
├── api/                    # API Layer
│   ├── controllers/       # Request handlers & validation
│   ├── routes/           # Route definitions & grouping
│   ├── middleware/       # Custom middleware (auth, logging, etc.)
│   └── index.ts         # API layer exports
├── business/             # Business Logic Layer
│   ├── services/        # Business logic & operations
│   ├── models/         # Data models & schemas
│   ├── utils/         # Business-specific utilities
│   └── index.ts      # Business layer exports
├── core/                # Core Framework
│   ├── app.ts          # App configuration
│   ├── database.ts     # Database connection
│   ├── env.ts         # Environment configuration
│   └── index.ts      # Core exports
├── shared/             # Shared Resources
│   ├── types/         # Type definitions
│   ├── utils/        # Generic utilities
│   ├── constants/    # Application constants
│   └── index.ts     # Shared exports
├── data/              # Data Layer
│   ├── seeders/      # Database seeders
│   ├── mock/        # Mock data for testing
│   └── index.ts    # Data exports
└── index.ts         # Main application entry point
```

## 📋 Layer Responsibilities

### 🌐 API Layer (`/api`)

- **Controllers**: Handle HTTP requests, input validation, response formatting
- **Routes**: Define API endpoints and route grouping
- **Middleware**: Authentication, logging, error handling, rate limiting

### 💼 Business Layer (`/business`)

- **Services**: Core business logic, data processing, business rules
- **Models**: Data models, database schemas, entity definitions
- **Utils**: Business-specific helper functions

### ⚙️ Core Layer (`/core`)

- **App**: Express/Elysia app configuration and setup
- **Database**: Database connection and configuration
- **Environment**: Environment variable management

### 🔧 Shared Layer (`/shared`)

- **Types**: TypeScript type definitions and interfaces
- **Utils**: Generic utility functions
- **Constants**: Application-wide constants and configurations

### 📊 Data Layer (`/data`)

- **Seeders**: Database initialization and seeding
- **Mock**: Test data and fixtures

## 🔄 Import Strategy

### Barrel Exports

Each directory contains an `index.ts` file that re-exports all modules within that directory, enabling clean imports:

```typescript
// ❌ Before: Long, specific imports
import { authController } from "./controllers/auth.controller";
import { userService } from "./services/user.service";
import { userModel } from "./models/user.model";

// ✅ After: Clean barrel imports
import { authController } from "./api";
import { userService, userModel } from "./business";
```

### Layer-based Imports

- API layer can import from Business and Shared layers
- Business layer can import from Shared layer
- Core layer is independent but exports for others
- Shared layer should not import from other layers (except external packages)

## 🎯 Benefits

1. **Separation of Concerns**: Clear responsibility boundaries
2. **Maintainability**: Easy to locate and modify code
3. **Scalability**: Simple to add new features within appropriate layers
4. **Testing**: Isolated layers for unit and integration testing
5. **Clean Imports**: Barrel exports reduce import complexity
6. **Documentation**: Self-documenting through structure

## 🚀 Getting Started

1. **Adding a new feature**:

   - Create models in `/business/models/`
   - Add business logic in `/business/services/`
   - Create API handlers in `/api/controllers/`
   - Define routes in `/api/routes/`
   - Update respective `index.ts` files

2. **Adding shared utilities**:

   - Add to `/shared/utils/` for generic functions
   - Add to `/shared/types/` for type definitions
   - Add to `/shared/constants/` for app-wide constants

3. **Database changes**:
   - Update models in `/business/models/`
   - Add migrations/seeders in `/data/`

## 📝 Best Practices

- Always use barrel exports via `index.ts` files
- Follow the layer dependency rules
- Keep controllers thin, services thick
- Use TypeScript types from `/shared/types/`
- Place constants in `/shared/constants/`
- Write tests for each layer independently
