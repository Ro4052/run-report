import type { NextApiRequest, NextApiResponse } from 'next';

import type { ActivityTotals } from '../../../types/activities';


const getActivityTotals = (): ActivityTotals => {
  return {
    distance: 24_123_050,
    elevation: 1_000,
    time: 4132
  };
};

const handler = (req: NextApiRequest, res: NextApiResponse<ActivityTotals>) => {
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
