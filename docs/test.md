import { useEffect } from "react";
import { useRouter } from "next/router";

export const LogoutButton = () => {
  const router = useRouter();

  useEffect(() => {
    const logout = () => {
      // 清除保存的访问令牌和刷新令牌
      set({ isAuthenticated: false, accessToken: null, refreshToken: null });

      // 使用 Next.js 的路由导航重定向到 /about 页面
      router.push("/about");
    };

    logout();
  }, [router]);

  return null;
};
