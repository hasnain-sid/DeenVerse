import jwt from 'jsonwebtoken';

/**
 * Generate a short-lived access token (15 minutes).
 * Stored in memory on the client (Zustand store).
 */
export function generateAccessToken(userId) {
  return jwt.sign({ userId }, process.env.TOKEN_SECRET, { expiresIn: '15m' });
}

/**
 * Generate a long-lived refresh token (7 days).
 * Stored in an httpOnly cookie.
 */
export function generateRefreshToken(userId) {
  const secret = process.env.REFRESH_TOKEN_SECRET || process.env.TOKEN_SECRET;
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
}

/**
 * Verify a refresh token and return decoded payload.
 */
export function verifyRefreshToken(token) {
  const secret = process.env.REFRESH_TOKEN_SECRET || process.env.TOKEN_SECRET;
  return jwt.verify(token, secret);
}

/**
 * Cookie options for the refresh token.
 */
export function getRefreshCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'None' : 'Lax',
    path: '/',
  };
}
