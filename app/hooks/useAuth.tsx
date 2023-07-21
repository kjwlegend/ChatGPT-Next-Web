import { useState, useEffect } from "react";
import { loginAPI } from "../api/auth";
import { useAuthStore } from "../store/auth";
import { useUserStore, User } from "../store/user";

interface LoginParams {
  username: string;
  password: string;
}

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const authStore = useAuthStore();
  const userStore = useUserStore();

  const login = async (params: LoginParams): Promise<void> => {
    try {
      const result = await loginAPI(params);

      const authInfo = {
        accessToken: result.data.access,
        refreshToken: result.data.refresh,
        user: result.data.user,
      };

      authStore.login(authInfo.accessToken, authInfo.refreshToken);
      userStore.setUser(authInfo.user);

      setUser(authInfo.user);
    } catch (error) {
      throw new Error("登录失败，请重试");
    }
  };

  const logout = () => {
    authStore.logout();
    setUser(null);
  };

  useEffect(() => {
    const storedUser = authStore.isAuthenticated ? userStore.user : null;
    setUser(storedUser);
  }, [authStore, userStore]);

  return {
    user,
    login,
    logout,
  };
}
