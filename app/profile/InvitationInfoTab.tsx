"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useUserStore } from "../store/user";
import styles from "./profile.module.scss";
import CountUp from "react-countup";

import { Col, Divider, Row, Statistic } from "antd";
import { Typography } from "antd";
import { QRCode } from "antd";
import { useRouter } from "next/router";

const { Paragraph } = Typography;

const InvitePage = () => {
  const { user } = useUserStore();
  const { invite_code, invite_count } = user;

  useEffect(() => {
    // 在这里可以根据需要加载邀请人数和邀请点数的数据
  }, []);

  const baseUrl = new URL(window.location.href).origin;

  const inviteLink = `${baseUrl}/auth?i=${invite_code}`;

  return (
    <div>
      <Row justify="center" gutter={16} style={{ textAlign: "center" }}>
        <Col xs={12} sm={8}>
          <Statistic title="邀请人数" value={invite_count} />
        </Col>
        <Col xs={12} sm={8}>
          <Statistic title="邀请点数" value={invite_count * 20} />
        </Col>
        <Col xs={12} sm={8}>
          <Statistic
            title="专属id"
            value={invite_code || ""}
            groupSeparator=""
          />
        </Col>
      </Row>
      <Divider />
      <div>
        <Row gutter={16}>
          <Col xs={24} sm={14}>
            <p className={styles["label-title"]}>邀请方法1 - 链接:</p>
            <Paragraph className={styles["link"]} copyable>
              {inviteLink}
            </Paragraph>
            <p>
              {" "}
              或者将 <span style={{ color: "red" }}>?i=您的专属id</span>{" "}
              添加到小光同学的任意网址后面
            </p>
          </Col>
          <Col xs={24} sm={10}>
            <p className={styles["label-title"]}>方法2 - 使用专属二维码:</p>
            <QRCode
              errorLevel="H"
              value={inviteLink}
              icon="https://xiaoguang.chat/bot.png"
            />
          </Col>
        </Row>
        <Divider />

        <p className={styles["label-title"]}>规则说明:</p>
        <p>
          每一位通过您的链接注册小光，双方都会获得20点邀请点数,
          邀请点数可以用来兑换未来的小光会员服务。包括GPT-4.0 接口,
          文案批量自动化生成, 以及更多高级功能。
        </p>
      </div>
    </div>
  );
};

export default InvitePage;
