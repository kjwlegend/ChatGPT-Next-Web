"use client";
import styles from "./auth.module.scss";
import Locale from "../locales";

import { Tabs } from "antd";
import type { TabsProps } from "antd";

import CodeLogin from "./code-login";
import Register from "./register";
import Login from "./login";

import React, { useState, createContext, useEffect } from "react";
import { useAuthStore } from "../store/auth";
import LogoutButton from "../components/logout";
import LoadingIcon from "../icons/three-dots.svg";

export default function AuthPage() {
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState("1");
  const [isClient, setIsClient] = useState(false);

  // 等待样式表加载完后, 再显示
  const [show, setShow] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const timeout = setTimeout(() => {
      setShow(true);
    }, 200);

    // 在组件卸载时清除定时器
    return () => clearTimeout(timeout);
  }, []);

  if (!show) {
    return (
      <div className="main">
        <LoadingIcon />{" "}
      </div>
    );
  }

  const onChange = (key: string) => {
    console.log(key);
    setActiveTab(key);
  };

  const onRegisterSuccess = () => {
    setActiveTab("2");
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `快捷密码登录`,
      children: <CodeLogin />,
    },
    {
      key: "2",
      label: `账户登录`,
      children: <Login />,
      disabled: false,
    },
    {
      key: "3",
      label: `账号注册`,
      children: <Register onRegisterSuccess={onRegisterSuccess} />,
      disabled: false,
    },
  ];

  return (
    <div className={styles["auth-page"] + " main"}>
      <div className={styles["welcome-header"]}>
        <div className={styles["auth-title"]}>{Locale.Auth.Title}</div>
        <div className={styles["auth-tips"]}>{Locale.Auth.Tips}</div>
      </div>
      <div className={styles["login-container"]}>
        <Tabs
          activeKey={activeTab}
          items={items}
          onChange={onChange}
          size="large"
          tabBarGutter={50}
          centered={true}
        />
      </div>
      {isAuthenticated && isClient && <LogoutButton />}
    </div>
  );
}
