"use client";
import styles from "./auth.module.scss";
import Locale from "../locales";

import { Tabs } from "antd";
import type { TabsProps } from "antd";

import CodeLogin from "./code-login";
import Register from "./register";
import Login from "./login";

import React, { useState, createContext } from "react";

export default function AuthPage() {
  const onChange = (key: string) => {
    console.log(key);
    setActiveTab(key);
  };

  const [activeTab, setActiveTab] = useState("1");

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
    </div>
  );
}
