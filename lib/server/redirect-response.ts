import type { NextApiResponse } from 'next';

export const redirectToErrorPage = (res: NextApiResponse, message: string) => {
  res.redirect(308, `/error?message=${message.replace(' ', '%20')}`).end();
};
