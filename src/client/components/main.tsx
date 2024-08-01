import { serverFunctions } from '@/utils/serverFunctions';
import { Button } from './ui/button';
import { useState } from 'react';
import { Label } from '@radix-ui/react-label';
import { Input } from './ui/input';

export const Main = ({
  token,
  setToken,
}: {
  token: string;
  setToken: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClickLogout = async () => {
    try {
      setIsLoading(true);
      await serverFunctions.removeToken();
      setToken('');
      alert('Your API key was removed.');
    } catch (error) {
      alert('Could not remove your API key' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateText = async () => {
    try {
      setIsLoading(true);
      await serverFunctions.getResponseForSelectedText();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl mb-2 text-center bg-primary text-primary-foreground py-2">
        Playground
      </h1>
      <div className="px-3">
        <div className="grid w-full max-w-sm items-center gap-1.5 mb-5">
          <Label htmlFor="password">API key</Label>
          <Input
            type="password"
            id="apiKey"
            defaultValue={token}
            disabled={isLoading}
          />
        </div>
        <div className="flex flex-col gap-3 items-center w-full">
          <Button
            className="w-full"
            size="sm"
            variant="default"
            disabled={isLoading}
            onClick={handleGenerateText}
          >
            Click here to generate and insert text
          </Button>
          <Button
            className="w-full"
            size="sm"
            variant="destructive"
            onClick={handleClickLogout}
            disabled={isLoading}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};
