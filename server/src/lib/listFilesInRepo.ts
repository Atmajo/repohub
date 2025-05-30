import fs from "fs";
import * as git from "isomorphic-git";
import { execSync } from "child_process";

export async function listFilesInRepo(repoPath: string) {
  const branch = execSync("git rev-parse HEAD", { cwd: repoPath })

  const commitOid = await git.resolveRef({ fs, gitdir: repoPath, ref: branch.toString().trim() });
  
  const commit = await git.readCommit({ fs, gitdir: repoPath, oid: commitOid });
  
  const files = await git.readTree({ fs, gitdir: repoPath, oid: commit.oid });
  
  return { files: files.tree, commit: commit };
}
