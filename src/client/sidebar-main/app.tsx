import { Main } from '@/components/main';
import { Signup } from '@/components/signup';
import { serverFunctions } from '@/utils/serverFunctions';
import { useLayoutEffect, useState } from 'react';

export const App = () => {
  const [token, setToken] = useState('');

  useLayoutEffect(() => {
    (async () => {
      try {
        const t = await serverFunctions.getTokenFromProps();
        if (t) setToken(t);
      } catch (error) {
        alert(error);
      }
    })();
  }, []);

  if (!token) return <Signup setToken={setToken} />;

  return <Main token={token} setToken={setToken} />;
};
