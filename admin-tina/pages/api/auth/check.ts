import type { NextApiRequest, NextApiResponse } from "next";
import { isAuthenticatedApi } from "../../../lib/auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (isAuthenticatedApi(req)) {
    res.status(200).json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false });
  }
}
