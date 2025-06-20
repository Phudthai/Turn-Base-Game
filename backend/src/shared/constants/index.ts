// Application constants
export const APP_CONFIG = {
  NAME: "Idle: Picoen",
  VERSION: "1.0.0",
  DESCRIPTION: "Turn-based RPG game backend API",
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const GAME_CONFIG = {
  MAX_LEVEL: 100,
  BASE_EXPERIENCE: 100,
  GACHA_RATES: {
    SSR: 0.03, // 3%
    SR: 0.12, // 12%
    R: 0.85, // 85%
  },
  PITY_SYSTEM: {
    SSR_PITY: 90,
    SR_PITY: 10,
  },
} as const;

export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Invalid username or password",
  TOKEN_EXPIRED: "Token has expired",
  UNAUTHORIZED_ACCESS: "Unauthorized access",
  RESOURCE_NOT_FOUND: "Resource not found",
  INTERNAL_ERROR: "Internal server error",
} as const;
