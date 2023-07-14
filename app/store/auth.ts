import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  user: any;
  token: string | null;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  token: null,
}));

export const login = (token: string) => {
  useAuthStore.setState({
    isAuthenticated: true,
    token: token,
  });
};

export const logout = () => {
  useAuthStore.setState({
    isAuthenticated: false,
    token: null,
  });
};

export const getUser = () => {
  return useAuthStore.getState().user;
};

export const getToken = () => {
  return useAuthStore.getState().token;
};

export const isAuthenticated = () => {
  return useAuthStore.getState().isAuthenticated;
};
