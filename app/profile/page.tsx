"use client";
import React from "react";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/auth";
import LogoutButton from "../components/logout";
import PersonalInfoTab from "./PersonalInfoTab";
import SecurityInfoTab from "./SecurityInfoTab";
// import AccountInfoTab from "./AccountInfoTab";
// import InvitationInfoTab from "./InvitationInfoTab";
import styles from "./profile.module.scss";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import { useUserStore } from "../store";

const items: TabsProps["items"] = [
  {
    key: "1",
    label: "个人信息",
    children: <PersonalInfoTab />,
  },
  {
    key: "2",
    label: "密码信息",
    children: <SecurityInfoTab />,
  },
  //   {
  //     key: "3",
  //     tab: "账户信息",
  //     component: <AccountInfoTab />,
  //     disabled: true,
  //   },
  //   {
  //     key: "4",
  //     tab: "邀请信息",
  //     component: <InvitationInfoTab />,
  //     disabled: true,
  //   },
];

const ProfilePage = () => {
  const { isAuthenticated } = useAuthStore();
  const { user } = useUserStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const onChange = (key: string) => {
    console.log(key);
  };

  return (
    <div className="main">
      <h1>用户中心</h1>
      {isAuthenticated && isClient ? (
        <div className="form-container">
          <Tabs
            defaultActiveKey="1"
            items={items}
            onChange={onChange}
            size="large"
            tabBarGutter={50}
            centered={true}
          />
          <div className={styles["logout"]}>
            <LogoutButton />
          </div>
        </div>
      ) : (
        <div>请先登录</div>
      )}
    </div>
  );
};

export default ProfilePage;
