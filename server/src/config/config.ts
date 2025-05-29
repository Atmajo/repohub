import { config as dotenvConfig } from "dotenv";
dotenvConfig();

export const config = {
  port: process.env.PORT ? process.env.PORT : 3000,
  jwtsecret: process.env.JWT_SECRET!,
  model: "gemini-2.0-flash",
  geminiApiKey: process.env.GEMINI_API_KEY!
};
