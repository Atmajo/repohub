import { Router } from "express";
import { repositoriesRouter } from "./repositories.router";
import { aiRouter } from "./ai.router";

const router = Router();

router.use("/repositories", repositoriesRouter);
router.use("/ai", aiRouter);

export { router as apisRouter };
