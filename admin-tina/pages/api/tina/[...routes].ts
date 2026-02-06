import type { NextApiRequest, NextApiResponse } from "next";
import type { IncomingMessage, ServerResponse } from "http";
import { TinaNodeBackend, LocalBackendAuthProvider } from "@tinacms/datalayer";
import databaseClient from "../../../tina/__generated__/databaseClient";
import { isAuthenticated } from "../../../lib/auth";

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === "true";

/**
 * Password-based Backend Auth Provider.
 * Checks for a valid session cookie set by /api/auth/login.
 */
const PasswordBackendAuthProvider = (): {
  initialize: () => Promise<void>;
  isAuthorized: (
    req: IncomingMessage,
    res: ServerResponse
  ) => Promise<
    | { isAuthorized: true }
    | { isAuthorized: false; errorMessage: string; errorCode: number }
  >;
} => ({
  initialize: async () => {},
  isAuthorized: async (req: IncomingMessage) => {
    if (isAuthenticated(req)) {
      return { isAuthorized: true as const };
    }

    return {
      errorCode: 401,
      errorMessage: "Unauthorized - Please log in with the admin password",
      isAuthorized: false as const,
    };
  },
});

const handler = TinaNodeBackend({
  authProvider: isLocal
    ? LocalBackendAuthProvider()
    : PasswordBackendAuthProvider(),
  databaseClient,
});

export default (req: NextApiRequest, res: NextApiResponse) => {
  return handler(req, res);
};
