"use client";
import { useState, useEffect } from "react";
import { Modal } from "antd";
import styles from "./welcome.module.scss";
import { Button } from "antd";
import Image from "next/image";

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
				<div className={styles.banner}>
					<Image
						src="/assets/banner-2.png"
						alt="banner"
						fill={true}
						objectFit="contain"
						style={{ objectFit: "contain" }}
					/>
				</div>

				<p className={styles.title}> 进群可领取邀请码, 领取1个月免费福利</p>
				{/* subtitle */}
				<p className={styles.subtitle}>为什么使用小光AI?</p>
				{/* 基于工作 , 生活, 娱乐 3大块, 以flex组件帮我生成带有 小标题, 描述的代码 */}
				<div className={styles.description}>
					<div className={styles["description-item"]}>
						<p className={styles["description-title"]}>工作</p>
						<p className={styles["description-content"]}>
							产品文案, 社交媒体协作, 合同起草, 法律文书, 专业术语翻译 ...
						</p>
					</div>
					<div className={styles["description-item"]}>
						<p className={styles["description-title"]}>生活</p>
						<p className={styles["description-content"]}>
							百科学习,旅游指南, 餐厅推荐, 电影推荐, 电视剧推荐, 书籍推荐 ...
						</p>
					</div>
					<div className={styles["description-item"]}>
						<p className={styles["description-title"]}>娱乐</p>
						<p className={styles["description-content"]}>
							角色陪伴, 起名算命, 角色扮演游戏, 文字冒险, 星座占卜 ...
						</p>
					</div>
				</div>

				<p className={styles.button}>
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
