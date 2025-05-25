"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signUpWithEmailPassword } from '@/app/auth/actions'; // Import server action

// Removed onSubmit prop as the form now directly calls the server action
// interface SignUpFormProps {
//   onSubmit?: (values: { email?: string; password?: string }) => void;
// }

// const SignUpForm: React.FC<SignUpFormProps> = ({ onSubmit }) => {
const SignUpForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    // Create FormData to pass to the server action
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    try {
      const result = await signUpWithEmailPassword(formData);

      if (result.error) {
        console.error('SignUpForm: Sign up error from server action:', result.error.message);
        setError(result.error.message);
      } else if (result.data?.user || result.data?.session) { // Check for user or session
        console.log('SignUpForm: Sign up action successful.');
        console.log('SignUpForm: User data:', result.data.user);
        console.log('SignUpForm: Session data:', result.data.session);

        if (result.data.user?.identities?.length === 0) {
             setMessage('User already registered. Please try logging in or check your email for confirmation if you recently signed up.');
        } else if (result.data.user?.email_confirmed_at || result.data.session ) {
            setMessage('Sign up successful! You are now logged in.');
            // Optionally reset form:
            // setEmail('');
            // setPassword('');
            // Or redirect, e.g., router.push('/dashboard');
        } else {
            setMessage('Sign up successful! Please check your email to confirm your account.');
        }
        // console.log('Sign up action result:', result.data); // Already logged above

      } else {
         setError('Sign up failed for an unknown reason. Please try again.');
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
          name="email" // Name attribute for FormData if not manually appending
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
        Sign Up
      </Button>
    </form>
  );
};

export default SignUpForm;
