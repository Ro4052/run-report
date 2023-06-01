import { Collection, MongoClient, WithId } from 'mongodb';

export interface UserEntry {
  _id: string;
  accessToken: string;
  accessTokenExpiry: number; // Note: This comes in seconds, so convert to ms
  refreshToken: string;
  stravaID: number;
}

export interface AccessTokenEntry {
  _id: string;
  userID: string;
  created: number;
}

interface WebhookSubscriptionEntry {
  _id: string; // Host URL
  subscriptionID: string;
}

const USERS_COLLECTION_NAME = 'users';
const WEBHOOK_SUBSCRIPTIONS_COLLECTION_NAME = 'webhook-subscriptions';
const ACCESS_TOKENS_COLLECTION_NAME = 'access-tokens';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is not correctly configured in this environment');
}

let dbConnection: Promise<MongoClient>
if (process.env.NODE_ENV === 'development') {
  // Persist connection across HMR reloads
  if (!global._mongoClientPromise) {
    const dbClient = new MongoClient(uri);
    global._mongoClientPromise = dbClient.connect();
  }
  dbConnection = global._mongoClientPromise;
} else {
  const client = new MongoClient(uri);
  dbConnection = client.connect();
}

const getUsersCollection = async (): Promise<Collection<UserEntry>> => {
  const client = await dbConnection;
  return client.db().collection<UserEntry>(USERS_COLLECTION_NAME);
};

const getAccessTokenCollection = async (): Promise<Collection<AccessTokenEntry>> => {
  const client = await dbConnection;
  return client.db().collection<AccessTokenEntry>(ACCESS_TOKENS_COLLECTION_NAME);
};

const getWebhookSubscriptionCollection = async (): Promise<Collection<WebhookSubscriptionEntry>> => {
  const client = await dbConnection;
  return client.db().collection<WebhookSubscriptionEntry>(WEBHOOK_SUBSCRIPTIONS_COLLECTION_NAME);
};

export const createUserEntry = async (entry: UserEntry) => {
  const collection = await getUsersCollection();
  collection.insertOne(entry);
}

export const getUserEntry = async (userID: string): Promise<UserEntry | null> => {
  console.log(`Getting user entry for: '${userID}'`);
  const collection = await getUsersCollection();
  return collection.findOne({ _id: userID });
};

export const getUserEntryByStravaID = async (stravaID: number): Promise<UserEntry | null> => {
  console.log(`Getting user entry by Strava ID for: '${stravaID}'`);
  const collection = await getUsersCollection();
  return collection.findOne({ stravaID });
};

export const updateUserEntry = async (partialEntry: WithId<Partial<UserEntry>>) => {
  const { _id, ...update } = partialEntry;
  console.log(`Updating user entry for: '${_id}'`);
  const collection = await getUsersCollection();
  return collection.updateOne({ _id }, { $set: update });
};

export const deleteUserEntry = async (userID: string) => {
  console.log(`Deleting user entry: ${userID}`);
  const collection = await getUsersCollection();
  collection.deleteOne({ _id: userID });
};

export const createAccessTokenEntry = async (entry: AccessTokenEntry) => {
  console.log(`Creating access token for: ${entry.userID}`);
  const collection = await getAccessTokenCollection();
  collection.insertOne(entry);
};

export const getAccessTokenEntry = async (accessToken: string): Promise<AccessTokenEntry | null> => {
  console.log(`Getting access token entry for: ${accessToken}`);
  const collection = await getAccessTokenCollection();
  return collection.findOne({ _id: accessToken });
};

export const deleteAccessTokenEntry = async (accessToken: string) => {
  console.log(`Deleting access token: ${accessToken}`);
  const collection = await getAccessTokenCollection();
  collection.deleteOne({ _id: accessToken });
};

export const deleteAccessTokenEntriesForUserID = async (userID: string) => {
  console.log(`Deleting access tokens for: ${userID}`);
  const collection = await getAccessTokenCollection();
  collection.deleteMany({ userID });
};

export const getWebhookSubscription = async (origin: string): Promise<WebhookSubscriptionEntry | null> => {
  console.log(`Getting Webhook subscription for: '${origin}'`);
  const collection = await getWebhookSubscriptionCollection();
  return collection.findOne({ _id: origin });
};

export const createOrUpdateWebhookSubscription = async (origin: string, subscriptionID: string) => {
  console.log(`Creating or updating Webhook subscription for: '${origin}'`);
  const collection = await getWebhookSubscriptionCollection();
  collection.replaceOne({ _id: origin }, { subscriptionID }, { upsert: true });
};
