import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch";

import {
  AccessTokenEntry,
  createAccessTokenEntry,
  createUserEntry,
  deleteAccessTokenEntry,
  getAccessTokenEntry,
  getUserEntryByStravaID,
  updateUserEntry,
  UserEntry,
} from "./db";
import { createURL } from "./create-url";
import { STRAVA_HOST } from "./shared-constants";

const ACCESS_TOKEN_EXPIRY_MS = 3_600_000;
const TEN_MINS_MS = 600_000;
const REFRESH_PATH = "/oauth/token";
const EXCHANGE_PATH = "/api/v3/oauth/token";

const clientID = process.env.CLIENT_ID;
if (!clientID) {
  throw new Error("CLIENT_ID is not correctly configured in this environment");
}

const clientSecret = process.env.CLIENT_SECRET;
if (!clientSecret) {
  throw new Error(
    "CLIENT_SECRET is not correctly configured in this environment"
  );
}

export const hasStravaAccessTokenExpired = ({
  stravaAccessTokenExpiry,
}: UserEntry): boolean => {
  const timeToExpiry = stravaAccessTokenExpiry - new Date().getTime();

  // If the access token has less than an hour until it expires, Strava will
  // give us a new one. Give ourselves 10 minutes just in case.
  return timeToExpiry < TEN_MINS_MS;
};

interface TokenRefreshResponse {
  access_token: string;
  expires_at: number;
  refresh_token: string;
}

export const refreshStravaAccessToken = async (user: UserEntry) => {
  const { _id } = user;
  console.log(`Refreshing access token '${_id}'`);
  const refreshURL = createURL(STRAVA_HOST, REFRESH_PATH)
    .addQueryParam("client_id", clientID)
    .addQueryParam("client_secret", clientSecret)
    .addQueryParam("grant_type", "refresh_token")
    .addQueryParam("refresh_token", user.stravaRefreshToken)
    .toString();
  const response = await fetch(refreshURL, { method: "POST" });
  const body = (await response.json()) as TokenRefreshResponse;

  const {
    access_token: stravaAccessToken,
    expires_at,
    refresh_token: stravaRefreshToken,
  } = body;

  const entryUpdate: Partial<UserEntry> & { _id: string } = {
    _id,
    stravaAccessToken,
    stravaAccessTokenExpiry: expires_at * 1_000,
    stravaRefreshToken: stravaRefreshToken,
  };

  await updateUserEntry(entryUpdate);
};

interface TokenExchangeResponse extends TokenRefreshResponse {
  athlete: {
    id: number;
  };
}

export const exchangeTokens = async (
  accessCode: string
): Promise<string | null> => {
  try {
    console.log("Exchanging tokens");
    const exchangeURL = createURL(STRAVA_HOST, EXCHANGE_PATH)
      .addQueryParam("client_id", clientID)
      .addQueryParam("client_secret", clientSecret)
      .addQueryParam("code", accessCode)
      .addQueryParam("grant_type", "authorization_code")
      .toString();
    const response = await fetch(exchangeURL, { method: "POST" });
    const body = (await response.json()) as TokenExchangeResponse;

    const {
      access_token: stravaAccessToken,
      athlete: { id: stravaID },
      expires_at,
      refresh_token: stravaRefreshToken,
    } = body;

    const userData: Omit<UserEntry, "_id"> = {
      stravaAccessToken,
      stravaAccessTokenExpiry: expires_at * 1_000,
      stravaRefreshToken,
      stravaID,
    };

    const existingUser = await getUserEntryByStravaID(stravaID);
    if (!existingUser) {
      const userID = uuidv4();
      console.log(
        `No entry for Strava ID: ${stravaID}, creating user: ${userID}`
      );
      await createUserEntry({ ...userData, _id: userID });

      return userID;
    }

    console.log(`Updating existing user ${existingUser._id}`);
    await updateUserEntry({ ...existingUser, ...userData });

    return existingUser._id;
  } catch (e) {
    console.log("Token exchange failed", e);
    return null;
  }
};

// TODO: When should access tokens be purged?
export const createNewAccessToken = async (userID: string): Promise<string> => {
  const accessToken = uuidv4();
  const accessTokenEntry: AccessTokenEntry = {
    _id: accessToken,
    userID,
    created: Date.now(),
  };

  await createAccessTokenEntry(accessTokenEntry);

  return accessToken;
};

export const getUserIDFromAccessToken = async (
  accessToken: string
): Promise<string | null> => {
  const entry = await getAccessTokenEntry(accessToken);
  if (!entry) {
    return null;
  }

  const currentTime = Date.now();
  if (currentTime - entry.created > ACCESS_TOKEN_EXPIRY_MS) {
    await deleteAccessTokenEntry(accessToken);
    return null;
  }

  return entry.userID;
};
