import React from "react";
import { ClockCircleOutlined } from "@ant-design/icons";
import {
  Card,
  Carousel,
  Layout,
  Row,
  Col,
  Collapse,
  Button,
  Divider,
  Tabs,
  Timeline,
} from "antd";
import { createFromIconfontCN } from "@ant-design/icons";
import type { CollapseProps } from "antd";
import styles from "./updates.module.scss";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;

const items = [
  {
    label: "2023-04-15",
    children: "小规模测试版发布, 主要为朋友和公司团队内部使用",
    color: "green",
  },
  {
    label: "2023-05-06",
    children: "系统升级, 增加预设功能",
  },
  {
    label: "2023-06-30",
    children: `更名, 从 "某个Chatgpt" 变为 "小光AI", 开启内部Alpha测试, 正式发布v0.1 `,
    color: "red",
  },
  {
    label: "2023-07-01",
    children: "发布 v0.2 版本, 重构预设和面具功能界面",
  },
  {
    label: "2023-07-02",
    children:
      "发布 v0.3 版本, 重构聊天界面, 增加聊天窗口快捷命令, 可以快速新建角色, 切换对话",
  },
  {
    label: "2023-07-03",
    children:
      "发布 v0.3.1 版本, 优化小光AI默认模型预设, 增加阳光温暖的人设对话逻辑, 增加代码解释器预设(主要自用)",
  },
  {
    label: "2023-07-04",
    children:
      '发布 v0.3.2 版本,增加 "小光AI" 介绍页面, 重构了整个站点的配色风格',
  },
  {
    label: "2023-07-05",
    children:
      "发布 v0.3.3 版本, 增加版本更新日志页面, 主要用于记录开发里程碑, 修复介绍页面的手机端bug",
  },
  {
    label: "2023-07-07",
    children:
      "发布 v0.3.4 版本, 小光为了更好的陪伴你, 他现在已经可以识别你的名字了",
  },
];
const App: React.FC = () => (
  <div className={styles["home-page"]}>
    <Timeline mode="left" items={items} pending="On my road.." />
    <Content></Content>
  </div>
);

export default App;
