import type { NextApiRequest, NextApiResponse } from "next";
import { mediaRouteHandler } from "../tina/mediaHandler";
import { isAuthenticatedApi } from "../../../lib/auth";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (!isAuthenticatedApi(req)) {
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
