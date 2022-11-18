import type { NextApiRequest, NextApiResponse } from "next";

export interface ActivityTotals {
  distance: number;
  elevation: number;
  time: number;
}
export type TotalType = keyof ActivityTotals;

const getActivityTotals = (): ActivityTotals => {
  return {
    distance: 24_123_050,
    elevation: 1_000,
    time: 4132
  };
};

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  switch (method) {
    case 'GET':
      res.status(200).json(getActivityTotals());
      break;
    default:
      res.status(405).end(`${method} method not allowed`);
  }
};

export default handler;
