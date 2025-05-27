import { Git } from "node-git-server";
import { join } from "path";
import logger from "./logger/logger";

const port =
  !process.env.PORT || isNaN(Number(process.env.PORT))
    ? 7005
    : parseInt(process.env.PORT);

const repos = new Git(join(__dirname, "../repos"), {
  autoCreate: true,
  authenticate: ({ type, user }, next) =>
    type == "push"
      ? user((username, password) => {
          logger.info(username!, password!);
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
