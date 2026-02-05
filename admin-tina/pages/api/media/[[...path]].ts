import type { NextApiRequest, NextApiResponse } from "next";
import { mediaRouteHandler } from "../tina/mediaHandler";

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === "true";

export const config = {
  api: { bodyParser: false },
};

function isAuthorized(req: NextApiRequest): boolean {
  if (isLocal) return true;
  const hasVercelAuth =
    req.headers["x-vercel-id"] ||
    req.headers["x-forwarded-for"] ||
    req.headers["cookie"]?.includes("_vercel_jwt");
  return !!hasVercelAuth;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (!isAuthorized(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  await mediaRouteHandler(req, res);
}
