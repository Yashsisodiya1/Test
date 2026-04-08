import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://app-hxvayvmr.fly.dev';

interface User {
  id: number;
  username: string;
  email: string;
  display_name: string | null;
  problems_solved: number;
  total_submissions: number;
  streak_days: number;
  score: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signUp: (username: string, email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('apex_token');
    const savedUser = localStorage.getItem('apex_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      // Verify token is still valid
      fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((res) => {
          if (!res.ok) {
            localStorage.removeItem('apex_token');
            localStorage.removeItem('apex_user');
            setToken(null);
            setUser(null);
          }
          return res.json();
        })
        .then((data) => {
          if (data.id) {
            setUser(data);
            localStorage.setItem('apex_user', JSON.stringify(data));
          }
        })
        .catch(() => {
          // Token invalid, clear auth
          localStorage.removeItem('apex_token');
          localStorage.removeItem('apex_user');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (username: string, email: string, password: string, displayName?: string) => {
    const res = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, display_name: displayName }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Sign up failed');
    }
    const data = await res.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('apex_token', data.token);
    localStorage.setItem('apex_user', JSON.stringify(data.user));
  };

  const signIn = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Sign in failed');
    }
    const data = await res.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('apex_token', data.token);
    localStorage.setItem('apex_user', JSON.stringify(data.user));
  };

  const signOut = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('apex_token');
    localStorage.removeItem('apex_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signUp,
        signIn,
        signOut,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
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

export { API_URL };
