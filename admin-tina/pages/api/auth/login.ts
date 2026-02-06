import type { NextApiRequest, NextApiResponse } from "next";
import {
  verifyPassword,
  createSessionToken,
  sessionCookieHeader,
} from "../../../lib/auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { password } = req.body ?? {};

  if (!password || typeof password !== "string") {
    res.status(400).json({ authenticated: false, message: "Password required" });
    return;
  }

  if (!verifyPassword(password)) {
    res.status(401).json({ authenticated: false, message: "Wrong password" });
    return;
  }

  const token = createSessionToken();
  res.setHeader("Set-Cookie", sessionCookieHeader(token));
  res.status(200).json({ authenticated: true });
}
