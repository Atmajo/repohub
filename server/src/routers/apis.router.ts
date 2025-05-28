import { Router } from "express";
import { repositoriesRouter } from "./repositories.router";

const router = Router();

router.use("/repositories", repositoriesRouter);

export { router as apisRouter };
