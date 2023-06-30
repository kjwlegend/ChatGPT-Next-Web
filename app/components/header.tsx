"use client";

import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
  Link,
} from "react-router-dom";

import React, { useState, useEffect } from "react";
import {
  AliwangwangOutlined,
  UsergroupAddOutlined,
  HighlightOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import LoadingIcon from "../icons/three-dots.svg";
import { useAppConfig } from "../store/config";
import { useMobileScreen } from "../utils";

const items: MenuProps["items"] = [
  {
    label: "对话",
    key: "chat",
    icon: <AliwangwangOutlined />,
  },
  {
    label: "助手(开发中)",
    key: "assistant",
    icon: <UsergroupAddOutlined />,
    disabled: true,
  },
  {
    label: "绘画(开发中)",
    key: "draw",
    icon: <HighlightOutlined />,
    disabled: true,
  },
  {
    label: "商城(开发中)",
    key: "mall",
    disabled: true,
  },
];

import { Layout, Menu, Button } from "antd";

import styles from "./header.module.scss";

const { Header } = Layout;

export function MainNav() {
  const [current, setCurrent] = useState("chat");

  // 等待样式表加载完后, 再显示
  const [show, setShow] = useState(false);
  setTimeout(() => {
    setShow(true);
  }, 200);

  const onClick: MenuProps["onClick"] = (e) => {
    console.log("click ", e);
    setCurrent(e.key);
  };

  if (!show) {
    return <LoadingIcon />;
  }

  return (
    <Header className={styles.header}>
      <div className={styles.logo}>
        <img className={styles["logo-image"]} src="/logo-2.png" alt="Logo" />
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
          items={items}
          style={{ backgroundColor: "transparent", height: "50px" }}
          className={styles["ant-menu"]}
        />
      </div>

      {/* <div className={styles["login-register"]}>
          <Button type="primary">Login / Register</Button>
        </div> */}
    </Header>
  );
}
