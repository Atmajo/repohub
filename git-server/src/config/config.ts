import { config as dotenvConfig } from "dotenv";
dotenvConfig();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT) : 7005,
  jwtSecret: process.env.JWT_SECRET,
  gitServerUrl: process.env.GIT_SERVER_URL || "http://localhost:7005",
};
