"use client";

import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

import React, { useState, useEffect } from "react";
import {
  AliwangwangOutlined,
  UsergroupAddOutlined,
  HighlightOutlined,
  ContainerOutlined,
} from "@ant-design/icons";

import type { MenuProps } from "antd";
import LoadingIcon from "../icons/three-dots.svg";
import { useAppConfig } from "../store/config";
import { useUserStore } from "../store/user";
import { useMobileScreen } from "../utils";
import { Layout, Menu, Button, Form, Input } from "antd";
import styles from "./header.module.scss";

const items = [
  {
    label: "对话",
    title: "对话",
    key: "chat",
    icon: <AliwangwangOutlined />,
    url: "/chat",
  },
  {
    label: "介绍",
    key: "intro",
    icon: <ContainerOutlined />,
    url: "/intro",
  },
  {
    label: "版本日志",
    key: "updates",
    icon: <ContainerOutlined />,
    url: "/updates",
  },
  {
    label: "助手(开发中)",
    key: "assistant",
    icon: <UsergroupAddOutlined />,
    disabled: true,
    url: "/assistant",
  },
  {
    label: "绘画(开发中)",
    key: "draw",
    icon: <HighlightOutlined />,
    disabled: true,
    url: "/draw",
  },
  {
    label: "商城(开发中)",
    key: "mall",
    disabled: true,
    url: "/mall",
  },
];

const { Header } = Layout;

interface Props {
  displayMobileVersion: boolean;
}

export default function MainNav(
  props: Props = { displayMobileVersion: false },
) {
  const { displayMobileVersion } = props;

  const path = usePathname();

  const { updateNickname, nickname } = useUserStore();

  const [current, setCurrent] = useState(() => {
    const current = path;
    console.log("current", current);
    return current || "chat";
  });

  // 等待样式表加载完后, 再显示
  const [show, setShow] = useState(false);
  setTimeout(() => {
    setShow(true);
  }, 200);

  const onClick: MenuProps["onClick"] = (e) => {
    setCurrent(e.key);
  };

  if (!show) {
    return <LoadingIcon />;
  }

  const onFinish = (values: any) => {
    updateNickname(values.nickname);
  };

  const changeName = () => {
    updateNickname("");
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

          <div className={styles["login-register"]}>
            {nickname ? (
              <Button type="default" onClick={changeName}>
                欢迎您, {nickname}
              </Button>
            ) : (
              <Form
                name="nickname_edit"
                initialValues={{ nickname: nickname }}
                layout="inline"
                size="small"
                onFinish={onFinish}
                style={{ maxWidth: 200 }}
                wrapperCol={{ span: 24 }}
              >
                <Form.Item
                  name="nickname"
                  rules={[
                    {
                      required: true,
                      message: "输入昵称",
                    },
                  ]}
                >
                  <Input
                    size="small"
                    style={{ width: 100 }}
                    placeholder="昵称"
                    defaultValue={nickname}
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="default" htmlType="submit">
                    确认
                  </Button>
                </Form.Item>
              </Form>
            )}
          </div>
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
            >
              {items.map((item) => {
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
            </Menu>
          </div>

          <div className={styles["login-register"]}>
            {nickname ? (
              <Button type="default" onClick={changeName}>
                欢迎您, {nickname}
              </Button>
            ) : (
              <Form
                name="nickname_edit"
                initialValues={{ nickname: nickname }}
                layout="inline"
                size="small"
                onFinish={onFinish}
                style={{ maxWidth: 200 }}
                wrapperCol={{ span: 24 }}
              >
                <Form.Item
                  name="nickname"
                  rules={[
                    {
                      required: true,
                      message: "输入昵称",
                    },
                  ]}
                >
                  <Input
                    size="small"
                    style={{ width: 100 }}
                    placeholder="昵称"
                    defaultValue={nickname}
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="default" htmlType="submit">
                    确认
                  </Button>
                </Form.Item>
              </Form>
            )}
          </div>
        </Header>
      )}
    </>
  );
}
