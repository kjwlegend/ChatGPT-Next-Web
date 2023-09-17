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
import { IconButton } from "./button";
import LightningIcon from "../icons/lightning.svg";
import { Modal } from "antd";
import style from "./welcome.module.scss";
import Image from "next/image";

export default function UserInfo() {
  const { user } = useUserStore();
  const [visible, setVisible] = useState(false);

  const handleButtonClick = () => {
    setVisible(true);
  };
  const handleOk = () => {
    setVisible(false);
  };

  const handleCancel = () => {
    setVisible(false);
  };

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
          <Dropdown menu={{ items }} trigger={["click"]}>
            <a onClick={(f) => f.preventDefault()}>
              {user?.avatar && (
                <div className={styles["avatar"]}>
                  <Avatar src={user?.avatar} />
                </div>
              )}
              <Space>
                <Button>
                  欢迎您, {user.nickname ? user.nickname : "神秘人"}
                </Button>
              </Space>
            </a>
          </Dropdown>

          <Button onClick={handleButtonClick}>
            <LightningIcon /> 领福利
          </Button>
        </>
      ) : (
        <>
          <Link href="/auth">
            <Button type="default">登录</Button>
          </Link>
          <Button onClick={handleButtonClick}>
            <LightningIcon /> 领福利
          </Button>
        </>
      )}
      <Modal
        centered
        open={visible}
        onCancel={handleCancel}
        onOk={handleOk}
        width={800}
      >
        <div className={style.content}>
          <div className={style.banner}>
            <Image
              src="/assets/banner-2.png"
              alt="banner"
              fill={true}
              objectFit="contain"
              // style={{ objectFit: "contain" }}
            />
          </div>

          <p className={style.title}> 进群可领取邀请码, 领取2个月免费福利</p>
        </div>
      </Modal>
    </div>
  );
}
