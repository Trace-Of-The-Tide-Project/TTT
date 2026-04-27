export type CookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  path: string;
  maxAge: number;
};

export type SessionTokens = {
  accessToken: string;
  refreshToken?: string;
};
