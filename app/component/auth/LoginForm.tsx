"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signInWithEmailPassword } from '@/app/auth/actions'; // Import server action

// Removed onSubmit prop
// interface LoginFormProps {
//   onSubmit?: (values: { email?: string; password?: string }) => void;
// }

// const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    try {
      const result = await signInWithEmailPassword(formData);

      if (result.error) {
        console.error('LoginForm: Sign in error from server action:', result.error.message);
        setError(result.error.message);
      } else if (result.data?.user) {
        console.log('LoginForm: Sign in successful from server action.');
        console.log('LoginForm: User data:', result.data.user);
        console.log('LoginForm: Session data:', result.data.session);
        setMessage('Sign in successful! Redirecting...');
        // Here you would typically redirect the user, e.g.:
        // import { useRouter } from 'next/navigation';
        // const router = useRouter();
        // router.push('/dashboard'); 
        // For now, a message is displayed and page can be manually reloaded to reflect session change.
        // A redirect can also be done in the server action itself.
      } else {
        // This case should ideally be covered by error from server action,
        // but as a fallback or if server action returns success with no user (unlikely for signin)
        setError('Sign in failed. Please check your credentials.');
      }
    } catch (catchError: any) {
      console.error('Client-side error calling server action:', catchError.message);
      setError('An unexpected error occurred on the client. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {message && <p className="text-green-500 text-sm">{message}</p>}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <Input
          id="email"
          name="email" // Name attribute for FormData
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="mt-1 block w-full"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <Input
          id="password"
          name="password" // Name attribute for FormData
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="mt-1 block w-full"
        />
      </div>
      <Button type="submit" className="w-full">
        Login
      </Button>
    </form>
  );
};

export default LoginForm;
