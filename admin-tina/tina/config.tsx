import { defineConfig, LocalAuthProvider, AbstractAuthProvider } from "tinacms";
import { installationsCollection } from "./collections/installations";
import { videotapesCollection } from "./collections/videotapes";
import { textsCollection } from "./collections/texts";

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === "true";

/**
 * Custom Auth Provider that trusts Vercel Authentication.
 * When Vercel Authentication is enabled, users are already authenticated
 * by Vercel before reaching this app, so we just need to verify that.
 */
class VercelAuthProvider extends AbstractAuthProvider {
  async authenticate() {
    // Vercel Authentication handles the login - check if user is authenticated
    const response = await fetch("/.well-known/vercel-user-meta");
    if (response.ok) {
      return true;
    }
    // If not authenticated, Vercel will redirect to login
    window.location.href = window.location.href;
    return false;
  }

  async getUser() {
    try {
      const response = await fetch("/.well-known/vercel-user-meta");
      if (response.ok) {
        const data = await response.json();
        return {
          id: data.id || "vercel-user",
          name: data.name || data.email || "Vercel User",
          email: data.email || "",
          role: "user",
        };
      }
    } catch (e) {
      console.log("Not authenticated via Vercel");
    }
    return false;
  }

  async getToken() {
    return { id_token: "vercel-auth" };
  }

  async logout() {
    // Vercel doesn't have a direct logout - user needs to log out from Vercel
    window.location.href = "https://vercel.com/logout";
  }

  async authorize() {
    const user = await this.getUser();
    return !!user;
  }
}

export default defineConfig({
  authProvider: isLocal
    ? new LocalAuthProvider()
    : new VercelAuthProvider(),
  contentApiUrlOverride: "/api/tina/gql",
  build: {
    publicFolder: "public",
    outputFolder: "admin",
  },
  media: {
    // Use Git-backed media storage (uploads go to GitHub repo)
    tina: {
      mediaRoot: "content/uploads",
      publicFolder: "",
      // static: false enables upload functionality
    },
  },
  schema: {
    collections: [
      installationsCollection,
      videotapesCollection,
      textsCollection,
    ],
  },
});
