import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import logger from "./logger/logger";

// Load environment variables
dotenv.config();

// Create Express app
const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server is running");
});

app.post("/api/repos", (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name) {
    logger.error("Repo name is required");
    res.status(400).json({ error: "Repo name is required" });
    return;
  }
  
  logger.info(`Repo name stored: ${name}`);
  
  res.status(201).json({ message: "Repo registered" });
});

// Redirect Git CLI requests to Git server
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
