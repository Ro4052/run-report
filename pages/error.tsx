import { useRouter } from 'next/router';

const Error = () => {
  const router = useRouter();

  return (
    <>
      {router.query.message}
    </>
  );
};

export default Error;
