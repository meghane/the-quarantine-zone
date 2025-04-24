import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function getInitialSession() {
      setLoading(true);
      const { data: { session: initialSession }, error } = await supabase.auth.getSession();
      if (!ignore) {
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      }
      setLoading(false);
      if (error) console.error("Error getting initial session:", error);
    }

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!ignore) {
          setSession(session);
          setUser(session?.user ?? null);
        }
      }
    );

    return () => {
      ignore = true;
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user && !profile) {
      const userMetadata = user.user_metadata;
      if (userMetadata?.username) {
        setProfile({ username: userMetadata.username });
      }
    } else if (!user) {
      setProfile(null);
    }
  }, [user, profile]);


  const value = {
    session,
    user,
    profile,
    loading,
    signOut: () => supabase.auth.signOut(),
  };


  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}