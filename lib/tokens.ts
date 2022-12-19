import fetch from 'node-fetch';

import { createOrUpdateUserEntry, updateUserEntry, UserEntry } from './db';
import { createURL } from './create-url';
import { STRAVA_HOST } from './shared-constants';

const TEN_MINS_MS = 600_000;
const REFRESH_PATH = '/oauth/token';
const EXCHANGE_PATH = '/api/v3/oauth/token';

const clientID = process.env.CLIENT_ID;
if (!clientID) {
  throw new Error('CLIENT_ID is not correctly configured in this environment');
}

const clientSecret = process.env.CLIENT_SECRET;
if (!clientSecret) {
  throw new Error('CLIENT_SECRET is not correctly configured in this environment');
}

export const hasAccessTokenExpired = ({ accessTokenExpiry }: UserEntry): boolean => {
  const timeToExpiry = accessTokenExpiry - new Date().getTime();

  // If the access token has less than an hour until it expires, Strava will
  // give us a new one. Give ourselves 10 minutes just in case.
  return timeToExpiry < TEN_MINS_MS;
};

interface TokenRefreshResponse {
  access_token: string;
  expires_at: number;
  refresh_token: string;
}

export const refreshAccessToken = async (user: UserEntry) => {
  const { _id } = user;
  console.log(`Refreshing access token '${_id}'`);
  const refreshURL = createURL(STRAVA_HOST, REFRESH_PATH)
    .addQueryParam('client_id', clientID)
    .addQueryParam('client_secret', clientSecret)
    .addQueryParam('grant_type', 'refresh_token')
    .addQueryParam('refresh_token', user.refreshToken)
    .toString();
  const response = await fetch(refreshURL, { method: 'POST' });
  const body = await response.json() as TokenRefreshResponse;

  const {
    access_token: accessToken,
    expires_at,
    refresh_token: refreshToken
  } = body;

  const entryUpdate: Partial<UserEntry> & { _id: string } = {
    _id,
    accessToken,
    accessTokenExpiry: expires_at * 1_000,
    refreshToken
  };

  updateUserEntry(entryUpdate);
};

interface TokenExchangeResponse extends TokenRefreshResponse {
  athlete: {
    id: number;
  };
}

export const exchangeTokens = async (accessCode: string): Promise<string | null> => {
  try {
    const exchangeURL = createURL(STRAVA_HOST, EXCHANGE_PATH)
      .addQueryParam('client_id', clientID)
      .addQueryParam('client_secret', clientSecret)
      .addQueryParam('code', accessCode)
      .addQueryParam('grant_type', 'authorization_code')
      .toString();
    const response = await fetch(exchangeURL, { method: 'POST' });
    const body = await response.json() as TokenExchangeResponse;

    const {
      access_token: accessToken,
      athlete: {
        id,
      },
      expires_at,
      refresh_token: refreshToken
    } = body;

    const _id = id.toString();
    const userData: UserEntry = {
      _id,
      accessToken,  
      accessTokenExpiry: expires_at * 1000,
      refreshToken
    };

    await createOrUpdateUserEntry(userData);

    return _id;
  } catch (e) {
    return null;
  }
};
