import { useState, useEffect } from 'react';

interface SessionData {
  authenticated: boolean;
  username?: string;
  catName?: string | null;
}

export function useSession() {
  const [session, setSession] = useState<SessionData>({ authenticated: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      setSession(data);
    } catch (error) {
      console.error('Session check failed:', error);
      setSession({ authenticated: false });
    } finally {
      setLoading(false);
    }
  };

  return { session, loading, checkSession };
}