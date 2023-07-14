import { useState, useEffect } from "react";
import { loginAPI } from "../api/auth";

interface User {
  // 用户数据类型
}

interface LoginParams {
  username: string;
  password: string;
}

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  /**
   * 用户登录
   * @param params - 登录参数
   * @returns 登录结果
   */

  const login = async (params: LoginParams) => {
    const user: User = await loginAPI(params);
    setUser(user);
  };

  const logout = () => {
    // 登出逻辑
    setUser(null);
  };

  useEffect(() => {
    // 初始化当前用户状态
  }, []);

  return {
    user,
    login,
    logout,
  };
}
