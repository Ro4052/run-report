import { Collection, MongoClient } from 'mongodb';

export interface UserEntry {
  _id: string;
  accessToken: string;
  accessTokenExpiry: number; // Note: This comes in seconds, so convert to ms
  firstName: string;
  lastName: string;
  refreshToken: string;
}

const COLLECTION_NAME = "users";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is not correctly configured in this environment");
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

const getCollection = async (): Promise<Collection<UserEntry>> => {
  const client = await dbConnection;
  return client.db().collection<UserEntry>(COLLECTION_NAME);
};

export const getUserEntry = async (_id: string): Promise<UserEntry | null> => {
  console.log(`Getting entry for '${_id}'`);
  const collection = await getCollection();
  return collection.findOne({ _id });
};

export const createOrUpdateUserEntry = async (entry: UserEntry) => {
  const { _id } = entry;
  console.log(`Creating or updating entry for '${_id}'`);
  const collection = await getCollection();
  collection.replaceOne({ _id }, entry, { upsert: true });
};

export const updateUserEntry = async (partialEntry: Partial<UserEntry> & { _id: string }) => {
  const { _id, ...update } = partialEntry;
  console.log(`Updating entry for '${_id}'`);
  const collection = await getCollection();
  return collection.updateOne({ _id }, update);
};
