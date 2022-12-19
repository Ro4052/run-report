import type { NextApiRequest, NextApiResponse } from 'next';
import { setCookie } from 'cookies-next';
import absoluteUrl from 'next-absolute-url';

import { exchangeTokens } from './tokens';
import { STRAVA_HOST, USER_ID_COOKIE } from './shared-constants';
import { createURL } from './create-url';
import { redirectToErrorPage } from './error-redirect';

const AUTHORISE_PATH = '/oauth/authorize';
const INITIATE_EXCHANGE_PATH = '/api/user/exchange';
const REQUESTED_SCOPES = [
  'read',
  'activity:read',
  'activity:read_all'
];

const clientID = process.env.CLIENT_ID;
if (!clientID) {
  throw new Error('CLIENT_ID is not correctly configured in this environment');
}

const createOAuthURL = (req: NextApiRequest): string => {
  const { origin } = absoluteUrl(req);

  return createURL(STRAVA_HOST, AUTHORISE_PATH)
    .addQueryParam('client_id', clientID)
    .addQueryParam('response_type', 'code')
    .addQueryParam('redirect_uri', origin + INITIATE_EXCHANGE_PATH)
    .addQueryParam('scope', REQUESTED_SCOPES.join(','))
    .toString();
}

export const initiateOAuthJourney = (req: NextApiRequest, res: NextApiResponse<string>) => {
  console.log('Initiating OAuth journey');
  const oAuthURL = createOAuthURL(req);
  res.status(307).json(oAuthURL);
};

const getAccessCode = (req: NextApiRequest, res: NextApiResponse<void>): string | null => {
  const { query: { error, scope, code } } = req;
  if (error === 'access_denied') {
    redirectToErrorPage(res, 'Access to Strava not granted');
    return null;
  }

  if (typeof scope !== 'string' || !code || typeof code !== 'string') {
    redirectToErrorPage(res, 'Authentication failed');
    return null;
  }

  const permittedScopes = scope.split(',');
  if (!permittedScopes.includes('activity:read') || !permittedScopes.includes('activity:read_all')) {
    redirectToErrorPage(res, 'Insufficient permissions granted');
    return null;
  }

  return code;
};

export const initiateTokenExchangeJourney = async (req: NextApiRequest, res: NextApiResponse<void>) => {
  const accessCode = getAccessCode(req, res);
  if (!accessCode) {
    redirectToErrorPage(res, 'Authentication failed');
    return;
  }

  const userID = await exchangeTokens(accessCode);
  if (!userID) {
    redirectToErrorPage(res, 'Authentication failed');
    return;
  }

  setCookie(USER_ID_COOKIE, userID, { req, res });
  res.redirect(308, '/').end();
};
