import type { NextApiRequest, NextApiResponse } from 'next';
import absoluteUrl from 'next-absolute-url';
import fetch from 'node-fetch';

import { createURL } from './create-url';
import { createOrUpdateWebhookSubscription, deleteUserEntry, getWebhookSubscription } from './db';
import { STRAVA_HOST } from './shared-constants';

const SUBSCRIBE_PATH = '/api/v3/push_subscriptions';
const CALLBACK_PATH = '/api/user/deauthorise';

const clientID = process.env.CLIENT_ID;
if (!clientID) {
  throw new Error('CLIENT_ID is not correctly configured in this environment');
}

const clientSecret = process.env.CLIENT_SECRET;
if (!clientSecret) {
  throw new Error('CLIENT_SECRET is not correctly configured in this environment');
}

const webhookVerificationToken = process.env.WEBHOOK_VERIFICATION_TOKEN;
global.webhookInitialised = false;

export const initialiseWebhook = async (req: NextApiRequest) => {
  if (!webhookVerificationToken || global.webhookInitialised) {
    return;
  }

  console.log('Initialising Webhooks');
  global.webhookInitialised = true;
  const { origin } = absoluteUrl(req);
  const existingSubscription = await getWebhookSubscription(origin);
  if (existingSubscription) {
    console.log(`Found existing Webhook subscription '${existingSubscription.subscriptionID}'`);
    return;
  }

  const createSubscriptionURL = createURL(STRAVA_HOST, SUBSCRIBE_PATH)
    .addQueryParam('client_id', clientID)
    .addQueryParam('client_secret', clientSecret)
    .addQueryParam('callback_url', origin + CALLBACK_PATH)
    .addQueryParam('verify_token', webhookVerificationToken)
    .toString();
  
  const response = await fetch(createSubscriptionURL, { method: 'POST' });
  const data = await response.json() as { id: number };
  if (!data.id) {
    global.webhookInitialised = false;
    return;
  }

  await createOrUpdateWebhookSubscription(origin, data.id.toString());
};

export const verifyWebhookCallback = (req: NextApiRequest, res: NextApiResponse) => {
  console.log('Verifying Webhook callback');
  const {
    ['hub.mode']: mode,
    ['hub.challenge']: challenge,
    ['hub.verify_token']: token
  } = req.query;
  if (mode !== 'subscribe' || token !== webhookVerificationToken) {
    console.log('Webhook verification failed');
    res.status(400).end();
    return;
  }

  console.log('Webhook verification successful');
  res.status(200).json({
    'hub.challenge': challenge
  });
};

interface WebhookEvent {
  aspect_type: 'create' | 'update' | 'delete';
  object_id: number;
  object_type: 'activity' | 'athlete';
  updates: Record<string, string>;
}

export const processWebhookEvent = async (req: NextApiRequest, res: NextApiResponse) => {
  const { object_id, updates }: WebhookEvent = req.body;
  console.log('Processing Webhook event');
  console.log(req.body);
  res.status(200).end();
  if (updates.authorized !== 'false') {
    console.log('Webhook event not relevant');
    return;
  }

  console.log(`Deauthorising '${object_id}'`);
  deleteUserEntry(object_id.toString());
};
