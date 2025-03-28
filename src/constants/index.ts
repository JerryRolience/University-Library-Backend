export const JWT_SECRET = process.env.JWT_SECRET as string;
export const JWT_EXPIRES_IN = Math.floor(Date.now() / 1000) + 3 * 24 * 60 * 60;
