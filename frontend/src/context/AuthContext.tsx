import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  userId: number | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Simple mapping from email to userId for demo purposes
const USER_ID_MAP: Record<string, number> = {
  'alice@octocat.com': 1,
  'bob@github.com': 2,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const login = async (email: string, password: string) => {
    // In a real app, you would validate credentials with an API
    // For now, we'll just check the email domain
    if (email && password) {
      setIsLoggedIn(true);
      setIsAdmin(email.endsWith('@github.com'));
      setUserId(USER_ID_MAP[email] ?? 1);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isAdmin, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}