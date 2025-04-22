import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient'; // Adjust path if needed

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // To store username etc. later
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function getInitialSession() {
      setLoading(true);
      const { data: { session: initialSession }, error } = await supabase.auth.getSession();
      // Only set session if the component is still mounted
      if (!ignore) {
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        // console.log("Initial session:", initialSession);
      }
       setLoading(false);
       if(error) console.error("Error getting initial session:", error);
    }

    getInitialSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!ignore) {
          // console.log("Auth state changed:", _event, session);
          setSession(session);
          setUser(session?.user ?? null);
          // Consider fetching profile here if needed on auth change
        }
      }
    );

    // Cleanup function
    return () => {
      ignore = true;
      subscription?.unsubscribe();
    };
  }, []);

   // Optional: Fetch user profile (like username) when user object changes
   useEffect(() => {
     if (user && !profile) { // Fetch profile only if we have a user but no profile yet
        // We'll add profile fetching logic later if needed
        // console.log("Need to fetch profile for user:", user.id);
        // Example: Fetch username stored during signup
        const userMetadata = user.user_metadata;
        if (userMetadata?.username) {
            setProfile({ username: userMetadata.username }); // Simple profile from metadata
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