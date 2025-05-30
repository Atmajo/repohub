// Register module aliases first
import './config/module-alias';

import express, { Express, Request, Response } from "express";
import { indexRouter } from "./routers";
import { config } from "./config/config";
import logger from "./logger/logger";

// Create Express app
const app: Express = express();
const port = config.port;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", indexRouter);

app.get("/git/{*path}", (req: Request, res: Response) => {
  try {
    const path = req.originalUrl;
    const joinedPath = path.split("/").slice(2).join("/");

    logger.info(`Redirecting Git CLI to Git server: ${joinedPath}`);
    const redirectUrl = `http://localhost:7005/${joinedPath}`;

    res.redirect(307, redirectUrl);
  } catch (error) {
    logger.error(`Error processing request: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start server
app.listen(port, () => {
  logger.info(`Server is running at http://localhost:${port}`);
});
