import { config as dotenvConfig } from "dotenv";
dotenvConfig();

export const config = {
  port: process.env.PORT ? process.env.PORT : 3000,
};
