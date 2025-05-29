import { Git } from "node-git-server";
import { join } from "path";
import { config } from "./config/config";
import logger from "./logger/logger";
import bcrypt from "bcrypt";
import { prisma } from "./lib/prisma";

const port = config.port;

const repos = new Git(join(__dirname, "../repos"), {
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
  push.log();
  push.log("Hey!");
  push.log("Checkout these other repos:");
  push.log(`- ${push.repo}`);
  push.log();
  push.accept();
});

repos.on("fetch", (fetch) => {
  logger.info(`FETCH ${fetch.commit} from ${fetch.repo}`);
  fetch.accept();
});

repos.listen(port, { type: "http" }, () => {
  logger.info(`🚀 node-git-server running at http://localhost:${port}`);
});
