
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Platform } from "react-native";
import { authClient, storeWebBearerToken } from "@/lib/auth";

interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function openOAuthPopup(provider: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const popupUrl = `${window.location.origin}/auth-popup?provider=${provider}`;
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    console.log(`Opening OAuth popup for ${provider}:`, popupUrl);

    const popup = window.open(
      popupUrl,
      "oauth-popup",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
    );

    if (!popup) {
      console.error("Failed to open popup window");
      reject(new Error("Failed to open popup. Please allow popups for this site."));
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      console.log("Received message from popup:", event.data);
      
      if (event.data?.type === "oauth-success" && event.data?.token) {
        window.removeEventListener("message", handleMessage);
        clearInterval(checkClosed);
        console.log("OAuth success, received token");
        resolve(event.data.token);
      } else if (event.data?.type === "oauth-error") {
        window.removeEventListener("message", handleMessage);
        clearInterval(checkClosed);
        console.error("OAuth error:", event.data.error);
        reject(new Error(event.data.error || "OAuth authentication failed"));
      }
    };

    window.addEventListener("message", handleMessage);

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener("message", handleMessage);
        console.log("OAuth popup was closed by user");
        reject(new Error("Authentication cancelled"));
      }
    }, 500);
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider mounted, fetching user session");
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      console.log("Fetching user session from backend...");
      const session = await authClient.getSession();
      console.log("Session response:", session);
      
      if (session?.data?.user) {
        console.log("User authenticated:", session.data.user.email);
        setUser(session.data.user as User);
      } else {
        console.log("No active session found");
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user session:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log("Signing in with email:", email);
      const result = await authClient.signIn.email({ email, password });
      console.log("Sign in result:", result);
      
      await fetchUser();
      console.log("User signed in successfully");
    } catch (error: any) {
      console.error("Email sign in failed:", error);
      
      // Provide user-friendly error messages
      if (error.message?.includes("Invalid")) {
        throw new Error("Invalid email or password. Please check your credentials.");
      } else if (error.message?.includes("not found")) {
        throw new Error("Account not found. Please sign up first.");
      } else {
        throw new Error(error.message || "Sign in failed. Please try again.");
      }
    }
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    try {
      console.log("Signing up with email:", email);
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });
      console.log("Sign up result:", result);
      
      await fetchUser();
      console.log("User signed up successfully");
    } catch (error: any) {
      console.error("Email sign up failed:", error);
      
      // Provide user-friendly error messages
      if (error.message?.includes("already exists")) {
        throw new Error("An account with this email already exists. Please sign in instead.");
      } else if (error.message?.includes("password")) {
        throw new Error("Password must be at least 8 characters long.");
      } else {
        throw new Error(error.message || "Sign up failed. Please try again.");
      }
    }
  };

  const signInWithSocial = async (provider: "google" | "apple" | "github") => {
    try {
      console.log(`Attempting ${provider} sign in on platform:`, Platform.OS);
      
      if (Platform.OS === "web") {
        console.log("Using web OAuth popup flow");
        const token = await openOAuthPopup(provider);
        storeWebBearerToken(token);
        await fetchUser();
      } else {
        console.log("Using native OAuth flow");
        await authClient.signIn.social({
          provider,
          callbackURL: "/profile",
        });
        await fetchUser();
      }
      
      console.log(`${provider} sign in successful`);
    } catch (error: any) {
      console.error(`${provider} sign in failed:`, error);
      
      // Provide helpful error messages
      if (error.message?.includes("popup")) {
        throw new Error("Please allow popups for this site to use social sign-in.");
      } else if (error.message?.includes("cancelled")) {
        throw new Error("Sign in was cancelled.");
      } else if (error.message?.includes("not configured") || error.message?.includes("Invalid")) {
        throw new Error(`${provider} sign-in is not configured yet. Please use email/password instead.`);
      } else {
        throw new Error(error.message || `${provider} sign-in failed. Please try again.`);
      }
    }
  };

  const signInWithGoogle = () => signInWithSocial("google");
  const signInWithApple = () => signInWithSocial("apple");
  const signInWithGitHub = () => signInWithSocial("github");

  const signOut = async () => {
    try {
      console.log("Signing out user");
      await authClient.signOut();
      setUser(null);
      console.log("User signed out successfully");
    } catch (error) {
      console.error("Sign out failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithApple,
        signInWithGitHub,
        signOut,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
