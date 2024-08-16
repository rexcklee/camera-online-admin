"use client";

import { User } from "@/apis/user";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

interface AuthContextValue {
  token: string | null;
  setToken: (newToken: string | null) => void;
  currentUser: User | null;
  setCurrentUser: (newCurrentUser: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Initialize token and user from localStorage in useEffect to avoid SSR issues
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("currentUser");
    if (storedToken) setToken(storedToken);
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
  }, []);

  const contextValue = useMemo(
    () => ({
      token,
      setToken,
      currentUser,
      setCurrentUser,
    }),
    [token, currentUser]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
