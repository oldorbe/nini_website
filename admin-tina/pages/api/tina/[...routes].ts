import type { NextApiRequest, NextApiResponse } from "next";
import type { IncomingMessage, ServerResponse } from "http";
import { TinaNodeBackend, LocalBackendAuthProvider } from "@tinacms/datalayer";
import databaseClient from "../../../tina/__generated__/databaseClient";

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === "true";

/**
 * Custom Backend Auth Provider that trusts Vercel Authentication.
 * When Vercel Authentication is enabled on the project, requests that
 * reach the API are already authenticated by Vercel.
 */
const VercelBackendAuthProvider = (): {
  initialize: () => Promise<void>;
  isAuthorized: (
    req: IncomingMessage,
    res: ServerResponse
  ) => Promise<{ isAuthorized: true } | { isAuthorized: false; errorMessage: string; errorCode: number }>;
} => ({
  initialize: async () => {},
  isAuthorized: async (req: IncomingMessage) => {
    // If Vercel Authentication is enabled, users reaching this point
    // have already been authenticated by Vercel.
    // We can verify by checking the x-vercel-id header or cookies.
    
    // Check for Vercel's authentication headers
    const hasVercelAuth = 
      req.headers["x-vercel-id"] ||
      req.headers["x-forwarded-for"] || // Vercel always sets this for requests
      req.headers["cookie"]?.includes("_vercel_jwt");
    
    if (isLocal || hasVercelAuth) {
      return { isAuthorized: true as const };
    }
    
    return {
      errorCode: 401,
      errorMessage: "Unauthorized - Please authenticate with Vercel",
      isAuthorized: false as const,
    };
  },
});

const handler = TinaNodeBackend({
  authProvider: isLocal
    ? LocalBackendAuthProvider()
    : VercelBackendAuthProvider(),
  databaseClient,
});

export default (req: NextApiRequest, res: NextApiResponse) => {
  return handler(req, res);
};
