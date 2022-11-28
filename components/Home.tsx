import useSWR from 'swr';

import type { ActivityTotals } from '../types/activities';
import { ActivityTotalsCards } from '../components/ActivityTotalsCards';

const SWR_OPTIONS = {
  revalidateOnFocus: false
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const data = await res.json();

  if (res.status !== 200) {
    throw new Error(data.message);
  }

  return data;
};

export const Home = () => {
  const { data, error } = useSWR<ActivityTotals>('/api/activities/totals', fetcher, SWR_OPTIONS);

  return (
    <div className="p-4">
      {error ? 'Failed to load...' : <ActivityTotalsCards activityTotals={data ?? null} />}
    </div>
  );
};
