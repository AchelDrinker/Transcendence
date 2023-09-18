import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = Cookies.get('jwt');
      console.log(token);
      if (!token) {
        window.location.href = '/';
      } else {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return null; // You can return a loading spinner or another placeholder here if preferred.
  }
  if (isAuthenticated) {
    return <div>{children}</div>;
  }
  return null; // Should not reach here, but return null just in case.
};

