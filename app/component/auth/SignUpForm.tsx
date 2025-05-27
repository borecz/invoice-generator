"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signUpWithEmailPassword } from '@/app/auth/actions'; // Import server action

// Removed onSubmit prop as the form now directly calls the server action
// interface SignUpFormProps {
//   onSubmit?: (values: { email?: string; password?: string }) => void;
// }

// const SignUpForm: React.FC<SignUpFormProps> = ({ onSubmit }) => {
const SignUpForm: React.FC = () => {
  const t = useTranslations('auth.signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    // Basic validation
    if (!email || !password) {
      setError(t('fillAllFields'));
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t('passwordTooShort'));
      setIsLoading(false);
      return;
    }

    // Create FormData to pass to the server action
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    try {
      // Show loading message
      setMessage(t('creatingAccount'));

      const result = await signUpWithEmailPassword(formData);

      // Clear loading message
      setMessage(null);

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
            setMessage(t('accountCreated'));
            // Note: If auto-login is enabled, the server action will redirect to dashboard
        } else {
            setMessage('Sign up successful! Please check your email to confirm your account.');
        }

      } else {
         setError('Sign up failed for an unknown reason. Please try again.');
      }
    } catch (catchError: any) {
      setMessage(null);

      // Check if this is a redirect error (which is expected on successful auto-login)
      if (catchError.message?.includes('NEXT_REDIRECT')) {
        // This is expected - the server action is redirecting after successful signup with auto-login
        console.log('SignUpForm: Redirect detected - signup successful with auto-login');
        return;
      }

      console.error('Client-side error calling server action:', catchError.message);
      setError(t('unexpectedError'));
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
          {t('email')}
        </label>
        <Input
          id="email"
          name="email" // Name attribute for FormData if not manually appending
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('emailPlaceholder')}
          required
          className="mt-1 block w-full"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          {t('password')}
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
        {isLoading ? t('creatingAccount') : t('signUp')}
      </Button>
    </form>
  );
};

export default SignUpForm;
