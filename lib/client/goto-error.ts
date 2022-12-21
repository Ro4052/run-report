import { NextRouter } from 'next/router';

export const gotoErrorPage = (message: string, router: NextRouter) => {
  router.replace(`/error?message=${message.replace(' ', '%20')}`);
};
