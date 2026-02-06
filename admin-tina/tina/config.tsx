import { defineConfig, LocalAuthProvider, AbstractAuthProvider } from "tinacms";
import { imagesCollection } from "./collections/images";
import { videotapesCollection } from "./collections/videotapes";
import { textsCollection } from "./collections/texts";
import { siteCollection } from "./collections/site";
import { homeCollection } from "./collections/home";
import { aboutCollection } from "./collections/about";

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === "true";

/**
 * Password-based Auth Provider for self-hosted TinaCMS.
 *
 * Uses a simple password set via ADMIN_PASSWORD env var.
 * Works on both Production and Preview deployments without
 * relying on Vercel Authentication (which requires a paid plan
 * to protect Production).
 */
class PasswordAuthProvider extends AbstractAuthProvider {
  private loginPrompt: (() => Promise<string>) | null = null;

  async authenticate() {
    // Check if already authenticated
    const checkRes = await fetch("/api/auth/check");
    if (checkRes.ok) {
      const data = await checkRes.json();
      if (data.authenticated) return true;
    }

    // Prompt for password
    const password = window.prompt("Enter admin password:");
    if (!password) return false;

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.authenticated) {
        // Reload to pick up the new session cookie
        window.location.reload();
        return true;
      }
    }

    window.alert("Wrong password");
    return false;
  }

  async getUser() {
    try {
      const res = await fetch("/api/auth/check");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          return {
            id: "admin",
            name: "Admin",
            email: "",
            role: "admin",
          };
        }
      }
    } catch {
      // not authenticated
    }
    return false;
  }

  async getToken() {
    return { id_token: "password-auth" };
  }

  async logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.reload();
  }

  async authorize() {
    const user = await this.getUser();
    return !!user;
  }
}

export default defineConfig({
  authProvider: isLocal
    ? new LocalAuthProvider()
    : new PasswordAuthProvider(),
  contentApiUrlOverride: "/api/tina/gql",
  build: {
    publicFolder: "public",
    outputFolder: "admin",
  },
  media: {
    // Custom self-hosted media store: always calls /media/* routes on our own backend.
    // The built-in TinaMediaStore switches to Tina Cloud assets API in production,
    // which doesn't work for self-hosted. This custom store avoids that entirely.
    loadCustomStore: async () => {
      const pack = await import("./self-hosted-media-store");
      return pack.default;
    },
  },
  schema: {
    collections: [
      siteCollection,
      homeCollection,
      aboutCollection,
      imagesCollection,
      videotapesCollection,
      textsCollection,
    ],
  },
});
