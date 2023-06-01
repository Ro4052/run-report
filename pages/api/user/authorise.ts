import type { NextApiRequest, NextApiResponse } from 'next';
import { getCookie } from 'cookies-next';

import { initiateOAuthJourney } from '../../../lib/server/oauth-journey';
import { getUserIDFromAccessToken, hasStravaAccessTokenExpired, refreshStravaAccessToken } from '../../../lib/server/tokens';
import { getUserEntry } from '../../../lib/server/db';
import { ACCESS_TOKEN_COOKIE } from '../../../lib/server/shared-constants';
import { initialiseWebhook } from '../../../lib/server/webhook';

const startAuthoriseWithAccessToken = async (req: NextApiRequest, res: NextApiResponse<string>, accessToken: string) => {
  console.log(`Using existing access token: ${accessToken}`);
  const userID = await getUserIDFromAccessToken(accessToken);
  const user = userID ? await getUserEntry(userID) : null;
  if (!user) {
    initiateOAuthJourney(req, res);
    return;
  }

  if (hasStravaAccessTokenExpired(user)) {
    try {
      await refreshStravaAccessToken(user);
    } catch (e) {
      initiateOAuthJourney(req, res);
      return;
    }
  }
  
  res.status(200).json('');
};

const authorise = async (req: NextApiRequest, res: NextApiResponse<string>) => {
  try {
    initialiseWebhook(req);
    const accessToken = getCookie(ACCESS_TOKEN_COOKIE, { req, res });
    if (!accessToken || typeof accessToken !== 'string') {
      initiateOAuthJourney(req, res);
    } else {
      await startAuthoriseWithAccessToken(req, res, accessToken);
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
