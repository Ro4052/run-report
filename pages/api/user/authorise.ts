import type { NextApiRequest, NextApiResponse } from 'next';
import { getCookie } from 'cookies-next';

import { initiateOAuthJourney } from '../../../lib/oauth-journey';
import { hasAccessTokenExpired, refreshAccessToken } from '../../../lib/tokens';
import { getUserEntry } from '../../../lib/db';
import { USER_ID_COOKIE } from '../../../lib/shared-constants';

const startAuthoriseWithID = async (req: NextApiRequest, res: NextApiResponse<string>, userID: string) => {
  console.log(`Using existing user ID: ${userID}`);
  const user = await getUserEntry(userID);
  if (!user) {
    initiateOAuthJourney(req, res);
    return;
  }

  if (hasAccessTokenExpired(user)) {
    try {
      await refreshAccessToken(user);
    } catch (e) {
      initiateOAuthJourney(req, res);
      return;
    }
  }
  
  res.status(200).json('');
};

const authorise = async (req: NextApiRequest, res: NextApiResponse<string>) => {
  try {
    const userID = getCookie(USER_ID_COOKIE, { req, res });
    if (!userID || typeof userID !== 'string') {
      initiateOAuthJourney(req, res);
    } else {
      await startAuthoriseWithID(req, res, userID);
    }
  } catch (e) {
    res.status(400).end();
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse<string>) => {
  const { method } = req;
  switch (method) {
    case 'POST':
      authorise(req, res);
      break;
    default:
      res.status(405).end(`${method} method not allowed`);
  }
};

export default handler;
