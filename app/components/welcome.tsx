"use client";
import { useState, useEffect } from "react";
import { Modal } from "antd";
import styles from "./welcome.module.scss";
import { Button } from "antd";
import Image from "next/image";
import { useAuthStore } from "../store/auth";

const ModalPopup = () => {
	const [visible, setVisible] = useState(true);
	const useAuth = useAuthStore();

	const isLogin = useAuth.isAuthenticated;

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
				<p className={styles.subtitle}>小光核心特色</p>
				{/* 基于工作 , 生活, 娱乐 3大块, 以flex组件帮我生成带有 小标题, 描述的代码 */}
				<div className={styles.description}>
					<div className={styles["description-item"]}>
						<p className={styles["description-title"]}>对话及绘画</p>
						<p className={styles["description-content"]}>
							集成合规大模型,并加入了大量定制化微调. 专业提示词工程师研究.
						</p>
					</div>
					<div className={styles["description-item"]}>
						<p className={styles["description-title"]}>工作流+双AI</p>
						<p className={styles["description-content"]}>
							可支持无限制工作流定制, 集成双AI特色训练.
						</p>
					</div>
					<div className={styles["description-item"]}>
						<p className={styles["description-title"]}>命理运势</p>
						<p className={styles["description-content"]}>
							由专业塔罗师设计的塔罗牌阵, 结合大模型给出专业解读, 专业解答.
						</p>
					</div>
				</div>

				<p className={styles.button}>
					{/* 插入四个Button , 立即注册, 查看介绍 立即登录 */}

					{isLogin ? (
						<>
							<Button type="primary" onClick={handleOk}>
								开始对话
							</Button>
							<Button type="primary" href="/tarot">
								塔罗占卜
							</Button>
						</>
					) : (
						<>
							<Button type="primary" href="/auth#tab2">
								立即注册
							</Button>

							<Button type="primary" href="/auth">
								立即登录
							</Button>
						</>
					)}
				</p>
			</div>
		</Modal>
	);
};

export default ModalPopup;
