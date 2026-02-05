#!/usr/bin/env node
/**
 * Script to initialize TinaCMS database and create the first admin user.
 * This script connects to your production Upstash Redis and indexes the user collection.
 * 
 * Usage:
 *   node scripts/init-database.mjs
 * 
 * Required environment variables (set in .env or pass directly):
 *   - KV_REST_API_URL
 *   - KV_REST_API_TOKEN
 *   - GITHUB_OWNER
 *   - GITHUB_REPO
 *   - GITHUB_BRANCH (default: main)
 *   - GITHUB_PERSONAL_ACCESS_TOKEN
 * 
 * Optional:
 *   - TINA_ADMIN_USER (default: prompts)
 *   - TINA_ADMIN_PASS (default: prompts)
 */

import * as crypto from "crypto";
import * as readline from "readline";
import { execSync } from "child_process";

function hashPassword(password) {
  return crypto.createHash("sha512").update(password).digest("hex");
}

async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

function cleanEnvVar(value) {
  return (value || "").replace(/^["']|["']$/g, "").trim();
}

async function upstashSet(url, token, key, value) {
  const response = await fetch(`${url}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(value),
  });
  return response.json();
}

async function upstashGet(url, token, key) {
  const response = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
}

async function main() {
  console.log("TinaCMS Database Initializer\n");
  console.log("=".repeat(50));

  // Load environment
  const kvUrl = cleanEnvVar(process.env.KV_REST_API_URL);
  const kvToken = cleanEnvVar(process.env.KV_REST_API_TOKEN);
  const branch = cleanEnvVar(process.env.GITHUB_BRANCH) || "main";

  if (!kvUrl || !kvToken) {
    console.error("\nError: KV_REST_API_URL and KV_REST_API_TOKEN are required.");
    console.error("\nMake sure these are set in your environment or .env file.");
    process.exit(1);
  }

  console.log(`\nRedis URL: ${kvUrl}`);
  console.log(`Branch: ${branch}`);

  // Get username and password
  let username = process.env.TINA_ADMIN_USER;
  let password = process.env.TINA_ADMIN_PASS;

  if (!username) {
    username = await prompt("\nEnter admin username: ");
  }
  if (!password) {
    password = await prompt("Enter admin password: ");
  }

  if (!username || !password) {
    console.error("Username and password are required.");
    process.exit(1);
  }

  const hashedPassword = hashPassword(password);

  // Create user data structure that TinaCMS expects
  const userKey = `_tina:${branch}:user:_root`;
  const userData = {
    _collection: "user",
    _template: "user",
    users: [
      {
        username,
        name: username,
        email: "",
        password: hashedPassword,
      },
    ],
  };

  // Also need to create index entries for the user lookup
  const userIndexKey = `_tina:${branch}:user:_root:_idx`;
  const userLookupKey = `_tina:${branch}:_lookup:user:${username}`;
  
  console.log(`\nCreating user "${username}"...`);

  try {
    // Store user document
    let result = await upstashSet(kvUrl, kvToken, userKey, JSON.stringify(userData));
    console.log(`  - User document: ${result.result || result.error || "done"}`);

    // Store user index (for quick lookup by username)
    const indexData = {
      _id: "_root",
      username,
    };
    result = await upstashSet(kvUrl, kvToken, userLookupKey, JSON.stringify(indexData));
    console.log(`  - User lookup index: ${result.result || result.error || "done"}`);

    // Verify
    const verify = await upstashGet(kvUrl, kvToken, userKey);
    if (verify.result) {
      console.log("\n✅ User created successfully!");
      console.log(`\nYou can now login at your TinaCMS admin with:`);
      console.log(`  Username: ${username}`);
      console.log(`  Password: (the password you entered)`);
    } else {
      console.error("\n❌ Verification failed:", verify);
    }

  } catch (error) {
    console.error("\nFailed:", error.message);
    process.exit(1);
  }

  console.log("\n" + "=".repeat(50));
  console.log("\nNext steps:");
  console.log("1. Redeploy your Vercel project to trigger indexing");
  console.log("2. Visit your admin URL and login with the credentials above");
  console.log("\nIf login still fails, you may need to:");
  console.log("- Check Vercel function logs for errors");
  console.log("- Verify environment variables are set correctly in Vercel");
}

main();
