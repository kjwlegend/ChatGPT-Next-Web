import { useState, useEffect } from "react";
import { loginAPI } from "../api/auth";
import { useAuthStore } from "../store/auth";
import { useUserStore, User } from "../store/user";
import { logoutAPI } from "../api/auth";
import { Result } from "antd";

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
      let gender = authInfo.user.gender;

      // 对 user 中的 gender 属性判断保存, 1 为男, 2 为女 0 为未知
      if (authInfo.user) {
        if (gender == 1) {
          gender = "1";
          // 处理男性的逻辑
        } else if (gender == 2) {
          gender = "2";
          // 处理女性的逻辑
        } else {
          gender = "0";
        }
      }
      authInfo.user.gender = gender;

      authStore.login(authInfo.accessToken, authInfo.refreshToken);
      userStore.setUser(authInfo.user);

      setUser(authInfo.user);
      setIsLoading(false);
      return result;
    } catch (error) {
      setIsLoading(false);
      const result = await loginAPI(params);

      throw new Error(result.msg);
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
