import { useEffect, useState } from 'react';

import { Home } from '../components/Home';


const SWR_OPTIONS = {
  revalidateOnFocus: false
};

const fetcher = async (url: string) => {
  const res = await fetch(url, { method: 'POST' });
  const data = await res.json();

  if (res.status !== 200 && res.status !== 307) {
    throw new Error(data.message);
  }

  return data ?? '';
};

const Index = () => {
  const [authorised, setAuthorised] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const requestAuthorise = async () => {
      const response = await fetch('/api/user/authorise', { method: 'POST' });
      if (response.status !== 200 && response.status !== 307) {
        setError(true);
        return;
      }

      const redirectURL = await response.json() as string;
      if (redirectURL.length > 0) {
        window.location.replace(redirectURL);
        return;
      }

      setAuthorised(true);
    };

    requestAuthorise();
  }, []);

  return (
    <>
      {error ? 'Failed to authorise...' : (authorised && <Home />)}
    </>
  );
};

export default Index;
