"use client";
import { useState, useEffect } from "react";
import { Modal, Button, message } from "antd";
import styles from "./welcome.module.scss";
import Image from "next/image";
import { useAuthStore } from "../store/auth";
import { getDailyCheckIn } from "../services/api/user";

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
						<p className={styles["description-title"]}>每日签到奖励</p>
						<p className={styles["description-content"]}>
							每日签到可获得高级模型5次，基础模型200次的使用额度。
						</p>
					</div>
					<div className={styles["description-item"]}>
						<p className={styles["description-title"]}>对话质量升级</p>
						<p className={styles["description-content"]}>
							集合先进大模型,并加入了大量定制化微调,专业提示词工程师研究.
						</p>
					</div>
					<div className={styles["description-item"]}>
						<p className={styles["description-title"]}>工作流+双AI</p>
						<p className={styles["description-content"]}>
							可支持无限制工作流定制, 集成双AI特色训练.
						</p>
					</div>
				</div>
				<div className={styles["update-content"]}>
					<div className={styles["update-image-container"]}>
						<Image
							src="/assets/android-chrome-512x512.png"
							alt="更新图片"
							width={200}
							height={200}
							className={styles["update-image"]}
						/>
						<p className={styles["update-title"]}>
							进群将获取每日免费额度上限提高
						</p>
					</div>
					<div className={styles["update-text-container"]}>
						0908更新日志:
						<ul className={styles["update-list"]}>
							<li>新增每日签到功能，普通模型大幅度免费</li>
							<li>优化对话模型，提升回答质量</li>
							<li>增加更多工作流模板，提高使用效率</li>
							<li>优化新界面细节, 加快对话速度</li>
						</ul>
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
