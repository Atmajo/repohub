import { Request, Response, Router } from "express";
import { apisRouter } from "./apis.router";
import { verifyToken } from "../middlewares/token";
import { authRouter } from "./auth.router";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server is running");
});

router.use("/auth", authRouter);
router.use("/api", verifyToken, apisRouter);

export { router as indexRouter };
