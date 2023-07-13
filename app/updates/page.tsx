"use client";
import React from "react";
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
import type { CollapseProps } from "antd";
import styles from "./updates.module.scss";

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
  {
    label: "2023-07-08",
    children: (
      <>
        发布 v0.4.0 版本,
        <ul>
          <li>
            我们重构了角色页面, 增加了角色的分类,你可以在全部角色中进行分类筛选.
            (但深度定制的角色还没有上线).
          </li>
          <li>
            {" "}
            我们引入了小亮(开发者), 主要来帮助小光同学编写代码, 他们会一起努力,
            让小光变得更加强大.
          </li>
          <li>
            同时加入了女巫小双, 小双心中追随者小亮, 但是小亮眼中只有小光.
            (佐为在天之灵感到甚是无奈) .
          </li>
          <li>
            {" "}
            其中角色等级, 代表着当前语言模型的深度定制程度. Lv1 为较为基础模型
          </li>
          <li>其他小细节, 间距, 色调调整</li>
        </ul>
      </>
    ),
  },
  {
    label: "2023-07-11",
    children:
      "发布 v0.4.1 版本, 优化了角色选择页的展示, 代码重新结构化, 改进了网站路由(后端功能), 优化bug修复",
  },
  {
    label: "2023-07-12",
    children: (
      <>
        发布 v0.4.2 版本,
        <ul>
          <li>
            我们加入了第一个超级角色, 孔老师. 孔老师拥有极其复杂的提示词工程,
            他能够根据你的性格, 偏好, 特征, 当前学历程度进行个性化课程的定制.
          </li>
          <li>
            原本用户打开每个角色, 都会提示 小光来了 的bug.
            我们已经修复了这个bug, 对于特殊角色,他们终于有了自己的开场白.
          </li>
          <li>
            我们意识到原本的小光底层, 性格过于乐观单一, 在回答的时候略显啰嗦.
            我们重新对小光进行了调整, 他由原本的lv2, 升级到了lv2.5
            (lv3的中间状态), 他的回答更加简洁, 但是也更加有趣.
          </li>
        </ul>
      </>
    ),
  },
];

const Log = () => {
  return (
    <div className={styles["home-page"]}>
      <Timeline mode="left" items={items} pending="On my road.." />
    </div>
  );
};

export default Log;
