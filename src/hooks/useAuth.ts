import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { App } from "@capacitor/app";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Set up deep link listener for native OAuth callback
    let appUrlOpenListener: any = null;
    
    if (Capacitor.isNativePlatform()) {
      App.addListener('appUrlOpen', async (data) => {
        console.log('App opened with URL:', data.url);
        
        // Check if this is an auth callback
        if (data.url.includes('auth-callback') || data.url.includes('access_token') || data.url.includes('code=')) {
          try {
            // Extract the URL parameters
            const url = new URL(data.url);
            
            // Check for authorization code (PKCE flow)
            const code = url.searchParams.get('code');
            if (code) {
              const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);
              if (error) {
                console.error('Error exchanging code for session:', error);
              } else {
                console.log('Successfully authenticated via deep link');
                setSession(sessionData.session);
                setUser(sessionData.session?.user ?? null);
              }
            }
            
            // Close the browser after handling the callback
            await Browser.close();
          } catch (error) {
            console.error('Error handling auth callback:', error);
          }
        }
      }).then(listener => {
        appUrlOpenListener = listener;
      });
    }

    return () => {
      subscription.unsubscribe();
      if (appUrlOpenListener) {
        appUrlOpenListener.remove();
      }
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const signInWithGoogle = async () => {
    // Check if running in native Capacitor environment
    if (Capacitor.isNativePlatform()) {
      try {
        // Use PKCE flow for native apps
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            skipBrowserRedirect: true,
            redirectTo: 'com.pixora.app://auth-callback',
          },
        });

        if (error) {
          console.error('OAuth error:', error);
          return { error };
        }

        if (data?.url) {
          // Open the OAuth URL in the system browser
          await Browser.open({ url: data.url });
        }

        return { error: null };
      } catch (error) {
        console.error('Native OAuth error:', error);
        return { error: error as Error };
      }
    } else {
      // Web flow - standard redirect
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      return { error };
    }
  };

  return {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    isAuthenticated: !!user,
  };
}
