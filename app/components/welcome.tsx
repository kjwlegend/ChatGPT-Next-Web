"use client";
import { useState, useEffect } from "react";
import { Modal, Button, message } from "antd";
import styles from "./welcome.module.scss";
import Image from "next/image";
import { useAuthStore } from "../store/auth";
import { getDailyCheckIn } from "../services/api/user";
import { oss_base } from "../constant";

const ModalPopup = () => {
	const [visible, setVisible] = useState(true);
	const [checkedIn, setCheckedIn] = useState(false);
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

	const handleDontShowToday = () => {
		const today = new Date().toDateString();
		localStorage.setItem("lastDismissDate", today);
		setVisible(false);
	};

	// 更新签到功能
	const handleCheckin = async () => {
		try {
			const res = await getDailyCheckIn();
			if (res.status === "success") {
				setCheckedIn(true);
				message.success("签到成功！获得高级模型20次，基础模型200次使用额度。");
			} else if (res.status === "already_checked_in") {
				setCheckedIn(true);
				message.info("您今天已经签到过了");
			} else {
				message.error(res.message || "签到失败，请稍后再试。");
			}
		} catch (error) {
			console.error("签到出错:", error);
			message.error("签到失败，请稍后再试。");
		}
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
				<p className={styles.title}>小光AI 3.0 全新升级</p>

				<div className={styles.description}>
					<div className={styles["description-item"]}>
						<p className={styles["description-title"]}>每日对话额度升级</p>
						<p className={styles["description-content"]}>
							每天免费使用基础模型200次。释放您的创意潜能。
						</p>
					</div>
					<div className={styles["description-item"]}>
						<p className={styles["description-title"]}>对话质量全面升级</p>
						<p className={styles["description-content"]}>
							顶级模型 + 专业提示词，带来精准、流畅、富有洞察力的对话。
						</p>
					</div>
					<div className={styles["description-item"]}>
						<p className={styles["description-title"]}>多Agent协作模式</p>
						<p className={styles["description-content"]}>
							AI智能体团队协作，为复杂任务提供全方位解决方案。
						</p>
					</div>
					<div className={styles["description-item"]}>
						<p className={styles["description-title"]}>无限制工作流定制</p>
						<p className={styles["description-content"]}>
							自由组合AI助手，灵活应对各种专业领域和复杂场景。
						</p>
					</div>
				</div>
				<div className={styles["update-content"]}>
					<div className={styles["update-image-container"]}>
						<Image
							src={`${oss_base}/public/latest_customer_qr.png!webp90`}
							alt="更新图片"
							width={200}
							height={200}
							className={styles["update-image"]}
						/>
						<p className={styles["update-title"]}>
							进群可升级成黄金会员,获取1000次免费对话额度!
						</p>
					</div>
				</div>

				<p className={styles.buttons}>
					{isLogin ? (
						<>
							<Button type="primary" onClick={handleOk}>
								开始对话
							</Button>
							<Button onClick={handleCheckin} disabled={checkedIn}>
								{checkedIn ? "已签到" : "签到"}
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
					<Button onClick={handleDontShowToday}>今日不再提示</Button>
				</p>
			</div>
		</Modal>
	);
};

export default ModalPopup;
