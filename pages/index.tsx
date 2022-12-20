import { useEffect, useState } from 'react';

import { Home } from '../components/Home';

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
    <div className="flex flex-col h-screen">
      <div className="grow">
        {error ? 'Failed to authorise...' : (authorised && <Home />)}
      </div>
      <div className='text-right p-1 text-xs'>
        <a href='/privacy-and-cookies'>Privacy and Cookies</a>
      </div>
    </div>
  );
};

export default Index;
