import type { NextApiRequest, NextApiResponse } from "next";

import { initiateTokenExchangeJourney } from "../../../lib/oauth-journey";

const handler = async (req: NextApiRequest, res: NextApiResponse<void>) => {
  const { method } = req;
  console.log(method)
  switch (method) {
    case 'GET':
      initiateTokenExchangeJourney(req, res);
      break;
    default:
      res.status(405).end(`${method} method not allowed`);
  }
};

export default handler;
