/**
 * Script to create the first admin user for TinaCMS.
 * 
 * Usage:
 *   1. Set environment variables (KV_REST_API_URL, KV_REST_API_TOKEN)
 *   2. Run: npx ts-node --esm scripts/create-user.ts
 * 
 * Or set username/password via environment:
 *   TINA_ADMIN_USER=admin TINA_ADMIN_PASS=yourpassword npx ts-node --esm scripts/create-user.ts
 */

import * as crypto from "crypto";
import * as readline from "readline";

// Upstash Redis REST API client
async function redisCommand(
  url: string,
  token: string,
  command: string[]
): Promise<any> {
  const response = await fetch(`${url}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });
  if (!response.ok) {
    throw new Error(`Redis command failed: ${response.statusText}`);
  }
  return response.json();
}

// Hash password using the same method as TinaCMS
function hashPassword(password: string): string {
  return crypto.createHash("sha512").update(password).digest("hex");
}

async function prompt(question: string, hidden = false): Promise<string> {
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
    console.error("Error: KV_REST_API_URL and KV_REST_API_TOKEN must be set.");
    console.error("\nExample:");
    console.error(
      '  KV_REST_API_URL="https://xxx.upstash.io" KV_REST_API_TOKEN="xxx" npx ts-node scripts/create-user.ts'
    );
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
  // Key format: _tina:{branch}:{collection}:{filename}
  // For users: _tina:main:user:_root
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
    // Store the user data
    await redisCommand(kvUrl, kvToken, ["SET", userKey, JSON.stringify(userData)]);
    console.log("\n✅ User created successfully!");
    console.log(`\nYou can now login at your TinaCMS admin with:`);
    console.log(`  Username: ${username}`);
    console.log(`  Password: (the password you entered)`);
  } catch (error) {
    console.error("Failed to create user:", error);
    process.exit(1);
  }
}

main();
