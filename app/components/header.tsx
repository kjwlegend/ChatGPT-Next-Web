"use client";
import styles from "./header.module.scss";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppConfig } from "../store/config";
import { useMobileScreen } from "../utils";

import Link from "next/link";
import Image from "next/image";

import type { MenuProps } from "antd";
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

import { useUserStore } from "../store/user";

import LoadingIcon from "../icons/three-dots.svg";
import {
  AliwangwangOutlined,
  UsergroupAddOutlined,
  HighlightOutlined,
  ContainerOutlined,
} from "@ant-design/icons";

import LogoutButton from "./logout";

const items = [
  {
    label: "对话",
    title: "对话",
    key: "chat",
    icon: <AliwangwangOutlined />,
    url: "/",
  },
  {
    label: "介绍",
    key: "aboutMenu",
    icon: <ContainerOutlined />,
    url: "/about",
    children: [
      {
        label: "关于小光AI",
        key: "about",
        icon: <ContainerOutlined />,
        url: "/about",
      },
      {
        label: "版本日志",
        key: "updates",
        icon: <ContainerOutlined />,
        url: "/updates",
      },
    ],
  },

  {
    label: "助手(开发中)",
    key: "assistant",
    icon: <UsergroupAddOutlined />,
    disabled: true,
    url: "/assistant",
  },
  {
    label: "社区(开发中)",
    key: "draw",
    icon: <HighlightOutlined />,
    disabled: true,
    url: "/draw",
  },
  // {
  //   label: "商城(开发中)",
  //   key: "mall",
  //   disabled: true,
  //   url: "/mall",
  // },
];

const { Header } = Layout;

interface Props {
  displayMobileVersion: boolean;
}
export function LoginButton() {
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
      {user?.nickname ? (
        <>
          {user?.avatar && (
            <div className={styles["avatar"]}>
              <Avatar src={user?.avatar} />
            </div>
          )}
          <Dropdown menu={{ items }} trigger={["click"]}>
            <a onClick={(f) => f.preventDefault()}>
              <Space>
                <Button>{user?.nickname}</Button>
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

export default function MainNav(
  props: Props = { displayMobileVersion: false },
) {
  const { displayMobileVersion } = props;

  const path = usePathname();
  const router = useRouter();

  const [current, setCurrent] = useState(() => {
    const current = path;
    // console.log("current", current);
    if (current === "/") {
      return "chat";
    }
    return current || "chat";
  });

  // 等待样式表加载完后, 再显示
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShow(true);
    }, 100);

    // 在组件卸载时清除定时器
    return () => clearTimeout(timeout);
  }, []);

  if (!show) {
    return <LoadingIcon />;
  }

  const onClick: MenuProps["onClick"] = (e) => {
    setCurrent(e.key);
    console.log("click ", e);
    const item = items.find((item) => item.key === e.key);
    if (item) {
      router.push(item.url);
    } else {
      const subItem = items.find((item) =>
        item.children?.some((child) => child.key === e.key),
      );
      if (subItem) {
        const subItemChild = subItem.children?.find(
          (child) => child.key === e.key,
        );
        if (subItemChild) {
          router.push(subItemChild.url);
        }
      }
    }
  };

  return (
    <>
      {displayMobileVersion ? (
        <Header className={styles.header}>
          <div className={styles.logo}>
            <img
              className={styles["logo-image"]}
              src="/logo-2.png"
              alt="Logo"
            />
            <div className={styles["logo-text"]}>
              <p className={styles["headline"]}>小光AI</p>
              {/* <p className={styles["subline"]}>XIAOGUANG.AI</p> */}
            </div>
          </div>

          <LoginButton />
        </Header>
      ) : (
        <Header className={styles.header}>
          <div className={styles.logo}>
            <img
              className={styles["logo-image"]}
              src="/logo-2.png"
              alt="Logo"
            />
            <div className={styles["logo-text"]}>
              <p className={styles["headline"]}>小光AI</p>
              <p className={styles["subline"]}>XIAOGUANG.AI</p>
            </div>
          </div>
          <div className={styles["ant-menu"]}>
            <Menu
              onClick={onClick}
              selectedKeys={[current]}
              mode="horizontal"
              style={{ backgroundColor: "transparent", height: "50px" }}
              className={styles["ant-menu"]}
              items={items}
              overflowedIndicator={<span>abc</span>}
            />
            {/* {items.map((item) => {
                if (item.disabled) {
                  return (
                    <Menu.Item key={item.key} disabled>
                      {item.icon}
                      {item.label}
                    </Menu.Item>
                  );
                }
                return (
                  <Menu.Item key={item.key}>
                    <Link href={item.url}>
                      {item.icon}
                      {item.label}
                    </Link>
                  </Menu.Item>
                );
              })}
            </Menu> */}
          </div>

          <LoginButton />
        </Header>
      )}
    </>
  );
}
