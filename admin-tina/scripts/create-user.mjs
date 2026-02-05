#!/usr/bin/env node
/**
 * Script to create the first admin user for TinaCMS.
 * 
 * Usage:
 *   node scripts/create-user.mjs
 * 
 * Required environment variables:
 *   - KV_REST_API_URL (Upstash Redis URL)
 *   - KV_REST_API_TOKEN (Upstash Redis Token)
 * 
 * Optional environment variables:
 *   - TINA_ADMIN_USER (default: prompts for input)
 *   - TINA_ADMIN_PASS (default: prompts for input)
 *   - GITHUB_BRANCH (default: main)
 */

import * as crypto from "crypto";
import * as readline from "readline";

// Hash password using the same method as TinaCMS
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

async function main() {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (!kvUrl || !kvToken) {
    console.error("Error: KV_REST_API_URL and KV_REST_API_TOKEN must be set.\n");
    console.error("Example:");
    console.error('  KV_REST_API_URL="https://xxx.upstash.io" KV_REST_API_TOKEN="xxx" node scripts/create-user.mjs\n');
    console.error("You can find these values in your Upstash Console or Vercel project settings.");
    process.exit(1);
  }

  // Get username and password
  let username = process.env.TINA_ADMIN_USER;
  let password = process.env.TINA_ADMIN_PASS;

  if (!username) {
    username = await prompt("Enter admin username: ");
  }
  if (!password) {
    password = await prompt("Enter admin password: ");
  }

  if (!username || !password) {
    console.error("Username and password are required.");
    process.exit(1);
  }

  const hashedPassword = hashPassword(password);

  // TinaCMS stores users with this structure in Redis
  const branch = process.env.GITHUB_BRANCH || "main";
  const userKey = `_tina:${branch}:user:_root`;

  const userData = {
    users: [
      {
        username,
        name: username,
        email: "",
        password: hashedPassword,
      },
    ],
  };

  console.log(`\nCreating user "${username}" in Redis...`);
  console.log(`Key: ${userKey}`);

  try {
    const response = await fetch(kvUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${kvToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["SET", userKey, JSON.stringify(userData)]),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Redis request failed: ${response.status} - ${text}`);
    }

    const result = await response.json();
    console.log("\n✅ User created successfully!");
    console.log(`\nYou can now login at your TinaCMS admin with:`);
    console.log(`  Username: ${username}`);
    console.log(`  Password: (the password you entered)\n`);
  } catch (error) {
    console.error("\nFailed to create user:", error.message);
    process.exit(1);
  }
}

main();
