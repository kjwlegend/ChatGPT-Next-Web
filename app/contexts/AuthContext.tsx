import { createContext } from "react";

interface AuthState {
  isAuthenticated: boolean;
  user: any;
  token: string | null;
}

export const AuthContext = createContext<AuthState>({
  isAuthenticated: false,
  user: null,
  token: null,
});
