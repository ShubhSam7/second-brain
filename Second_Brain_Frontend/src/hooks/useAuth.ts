import { useState } from 'react';
import { signup, signin, signout, isAuthenticated, getCurrentUser } from '../lib/api';
import type { SignupData, SigninData } from '../lib/types';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (data: SignupData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await signup(data);
      setLoading(false);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Signup failed';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const handleSignin = async (data: SigninData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await signin(data);
      setLoading(false);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Signin failed';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const handleSignout = () => {
    signout();
  };

  return {
    signup: handleSignup,
    signin: handleSignin,
    signout: handleSignout,
    isAuthenticated: isAuthenticated(),
    currentUser: getCurrentUser(),
    loading,
    error,
  };
};
