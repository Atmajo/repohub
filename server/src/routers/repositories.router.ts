import { Router } from "express";
import {
  createRepository,
  deleteRepository,
  getRepositories,
  getRepository,
  updateRepository,
} from "../controllers/apis/repository";

const router = Router();

router.get("/", getRepositories);
router.get("/:id", getRepository);
router.post("/", createRepository);
router.patch("/:id", updateRepository);
router.delete("/:id", deleteRepository);

export { router as repositoriesRouter };
