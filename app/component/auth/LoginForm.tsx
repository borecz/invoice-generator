"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signInWithEmailPassword } from '@/app/auth/actions'; // Import server action
import { useRouter } from 'next/navigation';

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
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    try {
      // Show loading message
      setMessage('Signing in...');

      // Call the server action
      const result = await signInWithEmailPassword(formData);

      if (result.error) {
        setMessage(null);
        setError(result.error.message);
      } else if (result.success) {
        setMessage('Sign in successful! Redirecting...');
        // Wait a moment for the session to be established, then redirect
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      } else {
        setMessage(null);
        setError('Sign in failed. Please check your credentials.');
      }
    } catch (catchError: any) {
      setMessage(null);
      console.error('Client-side error calling server action:', catchError.message);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
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
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Login'}
      </Button>
    </form>
  );
};

export default LoginForm;
