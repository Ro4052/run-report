import { useEffect, useState } from 'react';

import type { ActivityTotals } from '../types/activities';
import { ActivityTotalsCards } from '../components/ActivityTotalsCards';

export const Home = () => {
  const [totals, setTotals] = useState<ActivityTotals | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const requestTotals = async () => {
      const response = await fetch('/api/activities/totals');
      if (response.status !== 200) {
        setError(false);
        return;
      }

      const data = await response.json() as ActivityTotals;
      setTotals(data);
    };

    requestTotals();
  }, []);

  return (
    <div className="p-4">
      {error ? 'Failed to load...' : <ActivityTotalsCards activityTotals={totals} />}
    </div>
  );
};
