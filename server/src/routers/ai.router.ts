import { Router } from "express";
import {
  geminiFileResponse,
  geminiTextResponse,
} from "../controllers/ai/gemini";
import multer from "multer";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post("/text", geminiTextResponse);
router.post("/file", upload.array("files"), geminiFileResponse);

export { router as aiRouter };
