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

interface CardData {
  description: string;
  value: string;
}

interface CardComponentProps {
  title: string;
  data: CardData[];
  price: string;
  isCurrentPackage: boolean;
  onUpgrade: () => void;
}

const CardComponent: React.FC<CardComponentProps> = ({
  title,
  data,
  price,
  isCurrentPackage,
  onUpgrade,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3>{title}</h3>
        <button
          className={
            isCurrentPackage ? styles.currentButton : styles.upgradeButton
          }
          onClick={onUpgrade}
        >
          {isCurrentPackage ? "当前" : "升级"}
        </button>
      </div>
      <p className={styles.price}>{price}</p>

      {data.map((item, index) => (
        <div key={index} className={styles.row}>
          <p className={styles.description}>{item.description}</p>
          <p className={styles.value}>{item.value}</p>
        </div>
      ))}
    </div>
  );
};

const MembershipTab = () => {
  const { user } = useUserStore();
  const { member_type, chat_balance, draw_balance, member_expire_date } = user;

  useEffect(() => {
    // 在这里可以根据需要加载邀请人数和邀请点数的数据
  }, []);

  const currentPackage = (packageType: string) => {
    return member_type === packageType;
  };

  const handleUpgrade = () => {
    // 在这里可以根据需要处理升级的逻辑
  };

  const baseUrl = new URL(window.location.href).origin;

  return (
    <div>
      <Row justify="center" gutter={16} style={{ textAlign: "center" }}>
        <Col xs={12} sm={4}>
          <Statistic title="会员类型" value={member_type} />
        </Col>
        <Col xs={12} sm={4}>
          <Statistic title="到期时间" value={member_expire_date} />
        </Col>
        <Col xs={12} sm={4}>
          <Statistic
            title="剩余对话次数"
            value={chat_balance || ""}
            groupSeparator=""
          />
        </Col>
        <Col xs={12} sm={4}>
          <Statistic
            title="剩余绘画次数"
            value={draw_balance || ""}
            groupSeparator=""
          />
        </Col>
        <Col xs={12} sm={4}>
          <Statistic
            title="下次重置时间"
            value={member_expire_date || ""}
            groupSeparator=""
          />
        </Col>
      </Row>
      <Divider />
      {/* 生成一个标准的 3种类型的会员介绍 卡片*/}
      <div className={styles.cardcontainer}>
        <CardComponent
          title="普通会员"
          price="免费"
          data={[
            { description: "对话次数", value: "100 次/月" },
            { description: "最大token支持", value: "4000" },
            { description: "模型支持", value: "小光3.5" },
            { description: "上下文长度", value: "8k" },
            { description: "绘画支持", value: "是" },
            { description: "绘画次数", value: "20 次/月" },
            { description: "联网查询支持", value: "否" },
          ]}
          isCurrentPackage={currentPackage("普通会员")}
          onUpgrade={handleUpgrade}
        />
        <CardComponent
          title="黄金会员(1个月)"
          price="￥15"
          data={[
            { description: "对话次数", value: "无限次/月" },
            { description: "最大token支持", value: "6000" },
            { description: "模型支持", value: "小光3.5" },
            { description: "上下文长度", value: "16k" },
            { description: "绘画支持", value: "是" },
            { description: "绘画次数", value: "30 次/月" },
            { description: "联网查询支持", value: "是" },
          ]}
          isCurrentPackage={currentPackage("黄金会员")}
          onUpgrade={handleUpgrade}
        />
        <CardComponent
          title="白金会员(3个月)"
          price="￥45"
          data={[
            { description: "对话次数", value: "无限次/月" },
            { description: "最大token支持", value: "8000" },
            { description: "模型支持", value: "小光3.5, 4.0" },
            { description: "上下文长度", value: "16k" },
            { description: "绘画支持", value: "是" },
            { description: "绘画次数", value: "40 次/月" },
            { description: "联网查询支持", value: "是" },
            { description: "特殊功能支持", value: "工作流" },
          ]}
          isCurrentPackage={currentPackage("白金会员")}
          onUpgrade={handleUpgrade}
        />
        <CardComponent
          title="钻石会员(6个月)"
          price="￥90"
          data={[
            { description: "对话次数", value: "无限次/月" },
            { description: "最大token支持", value: "10000" },
            { description: "模型支持", value: "普通4.0, 星火大模型" },
            { description: "上下文长度", value: "16k" },
            { description: "绘画支持", value: "是" },
            { description: "绘画次数", value: "50 次/月" },
            { description: "联网查询支持", value: "是" },
            { description: "特殊功能支持", value: "工作流" },
          ]}
          isCurrentPackage={currentPackage("钻石会员")}
          onUpgrade={handleUpgrade}
        />
      </div>
    </div>
  );
};

export default MembershipTab;
