import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { gotoErrorPage } from '../lib/client/goto-error';
import { Page } from '../components/Page';
import { Home } from '../components/Home';

const Index = () => {
  const router = useRouter();
  const [authorised, setAuthorised] = useState<boolean>(false);

  useEffect(() => {
    const requestAuthorise = async () => {
      const response = await fetch('/api/user/authorise', { method: 'POST' });
      if (response.status !== 200 && response.status !== 307) {
        gotoErrorPage('Failed to authorise', router);
        return;
      }

      const redirectURL = await response.json() as string;
      if (redirectURL.length > 0) {
        router.replace(redirectURL);
        return;
      }

      setAuthorised(true);
    };

    requestAuthorise();
  }, [router]);

  return (
    <Page>
      {authorised && <Home />}
    </Page>
  );
};

export default Index;
