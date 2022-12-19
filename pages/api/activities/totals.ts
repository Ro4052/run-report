import type { NextApiRequest, NextApiResponse } from 'next';
import { getCookie } from 'cookies-next';

import type { ActivityTotals } from '../../../types/activities';
import { STRAVA_HOST, USER_ID_COOKIE } from '../../../lib/shared-constants';
import { redirectToErrorPage } from '../../../lib/error-redirect';
import { getUserEntry } from '../../../lib/db';
import { createURL } from '../../../lib/create-url';

const ACTIVITIES_PATH = '/api/v3/activities';

const DEFAULT_ITEMS_PER_PAGE = 30;
const SEVEN_DAYS_IN_MS = 1_000 * 60 * 60 * 24 * 7;

const emptyTotals = Object.freeze({
  distance: 0,
  elevation: 0,
  time: 0
});

const getActivityTotals = async (userID: string): Promise<ActivityTotals> => {
  const userEntry = await getUserEntry(userID);
  if (!userEntry) {
    return emptyTotals;
  }

  const { accessToken } = userEntry;
  const beforeTimestamp = new Date().getTime() - SEVEN_DAYS_IN_MS;

  const activities = [];
  let retrievalComplete = false;
  let page = 1;
  while (!retrievalComplete) {
    const requestURL = createURL(STRAVA_HOST, ACTIVITIES_PATH)
      .addQueryParam('after', beforeTimestamp / 1_000)
      .addQueryParam('page', page)
      .toString();
    
    const response = await fetch(requestURL, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    const activitiesInPage = await response.json(); // TODO: Add types to the response?
    activities.push(...activitiesInPage);

    retrievalComplete = activitiesInPage.length < DEFAULT_ITEMS_PER_PAGE;
    page++;
  }

  return activities
    .filter(({ type }) => type === "Run")
    .reduce<ActivityTotals>((acc, { distance, total_elevation_gain, moving_time }) => ({
      distance: acc.distance + distance,
      elevation: acc.elevation + total_elevation_gain,
      time: acc.time + moving_time * 1_000
    }), emptyTotals);
};

const handler = async (req: NextApiRequest, res: NextApiResponse<ActivityTotals>) => {
  const { method } = req;
  switch (method) {
    case 'GET':
      const userID = getCookie(USER_ID_COOKIE, { req, res });
      if (typeof userID === 'string' && userID !== '') {
        const totals = await getActivityTotals(userID);
        res.status(200).json(totals);
      } else {
        redirectToErrorPage(res, "Could not get activity totals");
      }
      break;
    default:
      res.status(405).end(`${method} method not allowed`);
  }
};

export default handler;
