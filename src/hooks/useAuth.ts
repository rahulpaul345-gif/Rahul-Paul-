import { useState, useEffect } from 'react';
import { auth, loginWithGoogle } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

// @ts-ignore
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const getCalendarToken = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        // @ts-ignore
        const client = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (response: any) => {
            if (response.access_token) {
              setAccessToken(response.access_token);
              resolve(response.access_token);
            } else {
              reject(new Error('Failed to get access token'));
            }
          },
        });
        client.requestAccessToken();
      } catch (error) {
        reject(error);
      }
    });
  };

  return { user, accessToken, loading, loginWithGoogle, getCalendarToken };
}
