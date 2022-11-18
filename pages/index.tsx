import useSWR from 'swr';

import { ActivityTotalsCards } from '../components/ActivityTotalsCards';
import type { ActivityTotals } from './api/activities/totals';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const data = await res.json();

  if (res.status !== 200) {
    throw new Error(data.message);
  }

  return data;
}

const Home = () => {
  const { data, error } = useSWR<ActivityTotals>('/api/activities/totals', fetcher);

  return (
    <div className="p-4">
      {error ? 'Failed to load...' : <ActivityTotalsCards activityTotals={data ?? null} />}
    </div>
  );
};

export default Home;
