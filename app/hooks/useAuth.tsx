import { useState, useEffect } from "react";
import { loginAPI } from "../api/auth";
import { useAuthStore } from "../store/auth";
import { useUserStore, User } from "../store/user";
import { logoutAPI } from "../api/auth";

interface LoginParams {
  username: string;
  password: string;
}

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const authStore = useAuthStore();
  const userStore = useUserStore();

  const loginHook = async (params: LoginParams): Promise<void> => {
    try {
      setIsLoading(true);

      const result = await loginAPI(params);

      const authInfo = {
        accessToken: result.data.access,
        refreshToken: result.data.refresh,
        user: result.data.user,
      };

      authStore.login(authInfo.accessToken, authInfo.refreshToken);
      userStore.setUser(authInfo.user);

      setUser(authInfo.user);
      setIsLoading(false);
      return result;
    } catch (error) {
      setIsLoading(false);

      throw new Error("登录失败，请重试");
    }
  };
  const logoutHook = async () => {
    await logoutAPI();
    authStore.logout();
    userStore.clearUser();
  };

  useEffect(() => {
    const storedUser = authStore.isAuthenticated ? userStore.user : null;
    setUser(storedUser);
  }, [authStore, userStore]);

  return {
    user,
    loginHook,
    logoutHook,
    isLoading,
  };
}
