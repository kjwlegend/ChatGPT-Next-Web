import React, { useState, useEffect } from "react";
import LogoutButton from "./logout";
import { useUserStore } from "../store/user";
import Link from "next/link";

import {
  Layout,
  Menu,
  Button,
  Form,
  Input,
  Avatar,
  Space,
  Dropdown,
} from "antd";
import type { MenuProps } from "antd";
import styles from "./header.module.scss";

export default function LoginButton() {
  const { user } = useUserStore();

  const items: MenuProps["items"] = [
    {
      label: <Link href="/profile/">个人中心</Link>,
      key: "0",
    },

    {
      type: "divider",
    },
    {
      label: <LogoutButton isButton={false} />,
      key: "3",
    },
  ];

  return (
    <div className={styles["login-wrapper"]}>
      {user?.username ? (
        <>
          {user?.avatar && (
            <div className={styles["avatar"]}>
              <Avatar src={user?.avatar} />
            </div>
          )}
          <Dropdown menu={{ items }} trigger={["click"]}>
            <a onClick={(f) => f.preventDefault()}>
              <Space>
                <Button>
                  欢迎您, {user.nickname ? user.nickname : "未命名用户"}
                </Button>
              </Space>
            </a>
          </Dropdown>
        </>
      ) : (
        <Link href="/auth">
          <Button type="default">登录</Button>
        </Link>
      )}
    </div>
  );
}
