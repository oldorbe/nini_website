import { createDatabase, createLocalDatabase } from "@tinacms/datalayer";
import { RedisLevel } from "upstash-redis-level";
import { GitHubProvider } from "tinacms-gitprovider-github";

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === "true";

const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN as string;
const owner = (process.env.GITHUB_OWNER ||
  process.env.VERCEL_GIT_REPO_OWNER) as string;
const repo = (process.env.GITHUB_REPO ||
  process.env.VERCEL_GIT_REPO_SLUG) as string;
const branch = (process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  "main") as string;

if (!branch) {
  throw new Error(
    "No branch found. Set GITHUB_BRANCH or VERCEL_GIT_COMMIT_REF."
  );
}

export default isLocal
  ? createLocalDatabase()
  : createDatabase({
      gitProvider: new GitHubProvider({
        branch,
        owner,
        repo,
        token,
      }),
      databaseAdapter: new RedisLevel({
        redis: {
          url: (process.env.KV_REST_API_URL as string) || "http://localhost:8079",
          token: (process.env.KV_REST_API_TOKEN as string) || "example_token",
        },
        debug: process.env.DEBUG === "true" || false,
      }),
      namespace: branch,
    });
