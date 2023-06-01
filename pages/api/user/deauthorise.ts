import type { NextApiRequest, NextApiResponse } from "next";

import { runStravaCorsMiddleware } from "../../../lib/server/middleware";
import {
  processWebhookEvent,
  verifyWebhookCallback,
} from "../../../lib/server/webhook";

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  runStravaCorsMiddleware(req, res);
  const { method } = req;
  switch (method) {
    case "GET":
      verifyWebhookCallback(req, res);
      break;
    case "POST":
      processWebhookEvent(req, res);
      break;
    default:
      res.status(405).end(`${method} method not allowed`);
  }
};

export default handler;
