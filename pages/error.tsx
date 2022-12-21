import { useRouter } from 'next/router';

import { Page } from '../components/Page';

const Error = () => {
  const router = useRouter();

  return (
    <Page>
      <div className='w-fit'>
        <span className='text-3xl'>Something went wrong</span>
        <div className='mt-2 mb-3 border-t border-solid border-black dark:border-white' />
      </div>
      <div>
        {router.query.message}
      </div>
    </Page>
  );
};

export default Error;
