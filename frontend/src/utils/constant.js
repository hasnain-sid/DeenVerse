
/**
 * API endpoint for user-related operations
 * Uses production URL in production environment, localhost in development
 */
export const USER_API_END_POINT = process.env.NODE_ENV === 'production'
  ? "https://deenverse-backend.onrender.com/api/v1/user"
  : "http://localhost:8081/api/v1/user";

/**
 * Base API for hadith content
 */
export const HADITH_API_BASE = "https://hadeethenc.com/api/v1/hadeeths";

