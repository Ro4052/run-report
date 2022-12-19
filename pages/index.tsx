import { useEffect, useState } from 'react';
import useSWR from 'swr';
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
  const { data: redirectURL, error } = useSWR<string>('/api/user/authorise', fetcher, SWR_OPTIONS);
  const [authorised, setAuthorised] = useState<boolean>(false);
  
  useEffect(() => {
    if (redirectURL?.length) {
      window.location.replace(redirectURL);
      return;
    }

    setAuthorised(redirectURL !== undefined);
  }, [redirectURL]);

  return (
    <>
      {error ? 'Failed to authorise...' : (authorised && <Home />)}
    </>
  );
};

export default Index;
