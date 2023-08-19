"use client";
import { useState, useEffect } from "react";
import { Modal } from "antd";
import styles from "./welcome.module.scss";
import { Button } from "antd";

const ModalPopup = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isFirstVisit = localStorage.getItem("isFirstVisit");
    const lastVisitTime = localStorage.getItem("lastVisitTime");
    const currentTime = new Date().getTime();
    const twentyFourHours = 1000 * 60 * 60 * 24 * 2; // 48小时的毫秒数

    if (
      !isFirstVisit ||
      (isFirstVisit && currentTime - Number(lastVisitTime) > twentyFourHours)
    ) {
      setVisible(true);
      localStorage.setItem("isFirstVisit", "false");
      localStorage.setItem("lastVisitTime", String(currentTime));
    }
  }, []);

  const handleOk = () => {
    setVisible(false);
  };

  const handleCancel = () => {
    localStorage.setItem("isFirstVisit", "true");

    setVisible(false);
  };

  return (
    <Modal
      centered
      open={visible}
      onCancel={handleCancel}
      onOk={handleOk}
      width={800}
      footer={null}
    >
      <div className={styles.content}>
        <img
          src="assets/carousel-2.png"
          alt="二维码"
          className={styles.banner}
        />

        <img src="assets/wechat-qr.png" alt="Logo" className={styles.qrcode} />
        <p className={styles.title}> 进群可领取邀请码, 领取2个月免费福利</p>
        {/* subtitle */}
        <p className={styles.subtitle}>为什么使用小光AI?</p>
        <div className={styles.description}>
          <ul>
            <li>
              小光
              AI是一个基于人工智能的提示词训练平台，它可以帮助您快速训练模型，生成优质的提示词。
            </li>
            <li>
              比国内多数chat平台, 例如百度文心一言,讯飞等, 提供更多的功能,
              更好的体验
            </li>
            <li>
              除了基础对话以外, 即将上线超级自动化对话, multi-agents chat等功能
            </li>
          </ul>
        </div>
        <p className={styles.description}>
          {/* 插入四个Button , 立即注册, 查看介绍 立即登录 */}
          <Button type="primary" href="/auth#tab2">
            立即注册
          </Button>
          <Button type="primary" href="/about">
            查看介绍
          </Button>
          <Button type="primary" href="/auth">
            立即登录
          </Button>
        </p>
      </div>
    </Modal>
  );
};

export default ModalPopup;
