import type { NextApiRequest, NextApiResponse } from "next";
import { clearSessionCookieHeader } from "../../../lib/auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Set-Cookie", clearSessionCookieHeader());
  res.status(200).json({ authenticated: false });
}
