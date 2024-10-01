"use client";
import React, { Suspense, lazy } from "react"; // 使用 lazy 和 Suspense
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/auth";
import LogoutButton from "../../components/logout";
import styles from "./profile.module.scss";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import { useUserStore } from "../../store";

// 动态导入组件
const PersonalInfoTab = lazy(() => import("./PersonalInfoTab"));
const SecurityInfoTab = lazy(() => import("./SecurityInfoTab"));
const InvitationInfoTab = lazy(() => import("./InvitationInfoTab"));

const items: TabsProps["items"] = [
	{
		key: "1",
		label: "个人信息",
		children: (
			<Suspense fallback={<div>Loading...</div>}>
				<PersonalInfoTab />
			</Suspense>
		),
	},

	{
		key: "3",
		label: "密码信息",
		children: (
			<Suspense fallback={<div>Loading...</div>}>
				<SecurityInfoTab />
			</Suspense>
		),
	},
	{
		key: "4",
		label: "邀请信息",
		children: (
			<Suspense fallback={<div>Loading...</div>}>
				<InvitationInfoTab />
			</Suspense>
		),
	},
];

const ProfilePage = () => {
	const { isAuthenticated } = useAuthStore();
	const { user } = useUserStore();
	const [isClient, setIsClient] = useState(false);
	const [activeTab, setActiveTab] = useState("1");

	// const urlkey = ;

	// if (urlkey) {
	//   setActiveTab(urlkey);
	// } else {
	//   setActiveTab("1");
	// }

	useEffect(() => {
		// 先判断URL 中的参数是否为空
		// 如果为空, 则默认显示第一个 Tab
		// 如果不为空, 则显示对应的 Tab
		if (window.location.hash === "") {
			setActiveTab("1");
		} else {
			setActiveTab(window.location.hash.slice(1));
		}

		setIsClient(true);
	}, []);

	const onChange = (key: string) => {
		// console.log(key);
		setActiveTab(key);
	};

	// 从 URL 中获取参数值
	console.log("activeTab:", activeTab);

	return (
		<div className="body-container">
			<h1>用户中心</h1>
			{isAuthenticated && isClient ? (
				<div className={styles.profiletab}>
					<Tabs
						defaultActiveKey="1"
						activeKey={activeTab}
						items={items}
						onChange={onChange}
						size="large"
						tabBarGutter={40}
						centered={true}
						tabBarStyle={{ marginBottom: 25 }}
					/>
					<div className={styles["logout"]}>
						<LogoutButton />
					</div>
				</div>
			) : (
				<div>请先登录</div>
			)}
		</div>
	);
};

export default ProfilePage;
