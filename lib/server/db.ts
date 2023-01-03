import { Collection, MongoClient, WithId } from 'mongodb';

export interface UserEntry {
  _id: string;
  accessToken: string;
  accessTokenExpiry: number; // Note: This comes in seconds, so convert to ms
  refreshToken: string;
}

interface WebhookSubscriptionEntry {
  _id: string; // Host URL
  subscriptionID: string;
}

const USERS_COLLECTION_NAME = 'users';
const WEBHOOK_SUBSCRIPTIONS_COLLECTION_NAME = 'webhook-subscriptions';

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

const getWebhookSubscriptionCollection = async (): Promise<Collection<WebhookSubscriptionEntry>> => {
  const client = await dbConnection;
  return client.db().collection<WebhookSubscriptionEntry>(WEBHOOK_SUBSCRIPTIONS_COLLECTION_NAME);
};

export const getUserEntry = async (userID: string): Promise<UserEntry | null> => {
  console.log(`Getting user entry for '${userID}'`);
  const collection = await getUsersCollection();
  return collection.findOne({ _id: userID });
};

export const createOrUpdateUserEntry = async (entry: UserEntry) => {
  const { _id } = entry;
  console.log(`Creating or updating user entry for '${_id}'`);
  const collection = await getUsersCollection();
  collection.replaceOne({ _id }, entry, { upsert: true });
};

export const updateUserEntry = async (partialEntry: WithId<Partial<UserEntry>>) => {
  const { _id, ...update } = partialEntry;
  console.log(`Updating user entry for '${_id}'`);
  const collection = await getUsersCollection();
  return collection.updateOne({ _id }, { $set: { ...update } });
};

export const deleteUserEntry = async (userID: string) => {
  const collection = await getUsersCollection();
  collection.deleteOne({ _id: userID });
};

export const getWebhookSubscription = async (origin: string): Promise<WebhookSubscriptionEntry | null> => {
  console.log(`Getting Webhook subscription for '${origin}'`);
  const collection = await getWebhookSubscriptionCollection();
  return collection.findOne({ _id: origin });
}


export const createOrUpdateWebhookSubscription = async (origin: string, subscriptionID: string) => {
  console.log(`Creating or updating Webhook subscription for '${origin}'`);
  const collection = await getWebhookSubscriptionCollection();
  collection.replaceOne({ _id: origin }, { subscriptionID }, { upsert: true });
};
