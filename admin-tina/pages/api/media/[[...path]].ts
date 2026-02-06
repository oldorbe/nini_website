import type { NextApiRequest, NextApiResponse } from "next";
import { mediaRouteHandler } from "../tina/mediaHandler";

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === "true";

export const config = {
  api: { bodyParser: false },
};

function isAuthorized(req: NextApiRequest): boolean {
  if (isLocal) return true;
  // On Vercel with Vercel Authentication enabled, requests that reach
  // the serverless function have already passed Vercel's auth layer.
  // We trust them. Check common Vercel headers as a safeguard.
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

  // req.query.path is the catch-all segments from [[...path]]
  // e.g. /api/media/list       → path = ["list"]
  //      /api/media/list/sub   → path = ["list", "sub"]
  //      /api/media/upload     → path = ["upload"]
  //      /api/media            → path = undefined (empty)
  const rawPath = req.query.path;
  const segments: string[] = Array.isArray(rawPath)
    ? rawPath
    : rawPath
      ? [rawPath]
      : [];

  await mediaRouteHandler(req, res, segments);
}
