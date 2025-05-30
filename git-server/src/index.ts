import { Git } from "node-git-server";
import { join } from "path";
import { config } from "./config/config";
import { prisma } from "./lib/prisma";
import logger from "./logger/logger";
import bcrypt from "bcrypt";
import fs from "fs";
import * as git from "isomorphic-git";
import http from "isomorphic-git/http/node";
import { execSync } from "child_process";

const port = config.port;

const repos = new Git(join(__dirname, "../../repos"), {
  autoCreate: true,
  authenticate: ({ type, user }, next) =>
    type == "push"
      ? user(async (username, password) => {
          if (!username || !password) {
            return next(new Error("Username and password are required"));
          }

          const user = await prisma.user.findUnique({
            where: { email: username },
          });

          if (!user) {
            return next(new Error("User not found"));
          }

          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            return next(new Error("Invalid password"));
          }

          next();
        })
      : next(),
});

repos.on("push", async (push) => {
  logger.info(`PUSH to ${push.repo}/${push.commit} (${push.branch})`);

  const name = push.repo.split("/")[1].replace(/\.git$/, "");

  const repository = await prisma.repository.findUnique({
    where: { name },
    include: { user: true },
  });

  if (!repository) {
    logger.error(`Repository ${name} not found`);
    push.reject(`Repository ${name} not found`);
    return;
  }

  try {
    // Define paths
    const bareRepoPath = join(
      __dirname,
      "../../repos/" + repository.user.name,
      `${name}.git`
    );
    const workingDir = join(
      __dirname,
      "../../working",
      repository.user.name,
      name
    );

    const pushedBranch: string = push.branch;
    const headPath = join(bareRepoPath, "HEAD");
    
    fs.writeFile(headPath, `ref: refs/heads/${pushedBranch}\n`, (err) => {
      if (err) {
        logger.error(`Failed to set HEAD for ${pushedBranch}:`, err);
        push.reject("Failed to set HEAD for pushed branch");
        return;
      }
    });
    
    // Clean the working directory if it already exists
    if (fs.existsSync(workingDir)) {
      fs.rmSync(workingDir, { recursive: true, force: true });
    }
    
    push.log();
    push.log("Hey!");
    push.log("Checkout these other repos:");
    push.log(`- ${push.repo}`);
    push.log();
    push.accept();
  } catch (err) {
    logger.error(`❌ Failed to clone pushed repo: `, err);
    push.reject("Failed to sync working directory");
  }
});

repos.on("fetch", (fetch) => {
  logger.info(`FETCH ${fetch.commit} from ${fetch.repo}`);
  fetch.accept();
});

repos.listen(port, { type: "http" }, () => {
  logger.info(`🚀 node-git-server running at http://localhost:${port}`);
});
