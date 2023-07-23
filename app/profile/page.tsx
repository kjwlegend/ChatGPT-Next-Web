"use client";
import React from "react";
import { useAuthStore } from "../store/auth";
import LogoutButton from "../components/logtou";
import PersonalInfoTab from "./PersonalInfoTab";
import SecurityInfoTab from "./SecurityInfoTab";
// import AccountInfoTab from "./AccountInfoTab";
// import InvitationInfoTab from "./InvitationInfoTab";

import { Tabs } from "antd";
import type { TabsProps } from "antd";

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

  const onChange = (key: string) => {
    console.log(key);
  };

  return (
    <div className="main">
      <h1>用户中心</h1>
      {isAuthenticated ? (
        <Tabs
          defaultActiveKey="1"
          items={items}
          onChange={onChange}
          size="large"
          tabBarGutter={50}
          centered={true}
        />
      ) : (
        <div>请先登录</div>
      )}
      {isAuthenticated && <LogoutButton />}
    </div>
  );
};

export default ProfilePage;
