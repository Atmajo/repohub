import { Request, Response } from "express";
import { fileResponse, testResponse } from "../../lib/gemini";
import logger from "../../logger/logger";
import * as fs from "fs";

export const geminiTextResponse = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text) {
      res.status(400).json({ error: "Text is required" });
      return;
    }

    const result = await testResponse({ text });

    if (!result.success) {
      logger.error("Gemini AI response failed:", result.error);
      res.status(500).json({ error: result.error });
      return;
    }

    logger.info("Gemini AI response generated successfully");
    res.status(200).json({ data: result.text });
  } catch (error) {
    logger.error("Error in textResponse:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const geminiFileResponse = async (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      res.status(400).json({ error: "File is required" });
      return;
    }

    const files = req.files.map((file: Express.Multer.File) => ({
      path: file.path,
      mimeType: "text/plain",
    }));

    const result = await fileResponse(files);

    if (!result.success) {
      logger.error("Gemini AI file response failed:", result.error);
      res.status(500).json({ error: result.error });
      return;
    }

    files.forEach((file) => {
      fs.unlink(file.path, (err) => {
        if (err) {
          logger.error(`Error deleting temporary file: ${file.path}`, err);
          return;
        }
      });
    });

    logger.info("Gemini AI file response generated successfully");
    res.status(200).json({ data: result.text });
  } catch (error) {
    logger.error("Error in fileResponse:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
