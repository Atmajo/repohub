import { Request, Response, Router } from "express";
import { register } from "../controllers/apis/auth/register";
import { login } from "../controllers/apis/auth/login";
import { AuthenticatedRequest } from "../middlewares/token";

const router = Router();

router.post("/login", login);
router.post("/register", register);

export { router as authRouter };
