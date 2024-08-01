import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { serverFunctions } from '@/utils/serverFunctions';

export const Signup = ({
  setToken,
}: {
  setToken: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isGettingToken, setIsGettingToken] = useState(false);

  const handleClick = async () => {
    try {
      setIsGettingToken(true);
      const t = await serverFunctions.getTokenFromApi(email, password);
      if (t) {
        setToken(t);
        alert('API key was saved successfully');
      }
    } catch (error) {
      alert('Could not get the API key. Please try again.');
    } finally {
      setIsGettingToken(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl mb-2 text-center bg-primary text-primary-foreground py-2">
        Sign Up
      </h1>
      <section className="px-2">
        <div className="grid w-full max-w-sm items-center gap-1.5 mb-5">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isGettingToken}
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5 mb-5">
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isGettingToken}
          />
        </div>
        <Button
          size="sm"
          className="w-full"
          disabled={isGettingToken || !email || !password}
          onClick={handleClick}
        >
          {isGettingToken
            ? 'Please wait while we get your token'
            : 'Click here to get your API key'}
        </Button>
      </section>
    </div>
  );
};
