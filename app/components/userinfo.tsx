import React, { useState, useEffect } from "react";
import LogoutButton from "./logout";
import { useUserStore } from "../store/user";
import Link from "next/link";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Path } from "../constant";

import {
	Layout,
	Menu,
	Button,
	Form,
	Input,
	Avatar,
	Space,
	Dropdown,
} from "antd";
import type { MenuProps } from "antd";
import styles from "./userinfo.module.scss";
import { IconButton } from "./button";
import LightningIcon from "@/app/icons/lightning.svg";
import EditIcon from "@/app/icons/menu.svg";
import { Modal } from "antd";
import style from "./welcome.module.scss";
import Image from "next/image";
import { text } from "stream/consumers";
import { SettingsIcon } from "../icons";

export const ConfigMemu = () => {
	const [visible, setVisible] = useState(false);
	const [expanded, setExpanded] = useState(false); // 控制展开状态

	const handleOk = () => {
		setVisible(false);
	};

	const handleCancel = () => {
		setVisible(false);
	};

	const toggleExpand = () => {
		setExpanded(!expanded);
	};

	const handleButtonClick = () => {
		setVisible(true);
	};

	const items: MenuProps["items"] = [
		{
			label: <Link href="/profile/">个人中心</Link>,
			key: "0",
		},
		{
			label: <Link href="/profile#4">邀请得礼</Link>,
			key: "5",
		},
		{
			key: "7",
			label: (
				<Button onClick={handleButtonClick}>
					<LightningIcon style={{ marginRight: "4px" }} /> 领福利
				</Button>
			),
		},
		{
			key: "setting",
			label: (
				<RouterLink to={Path.Settings}>
					<IconButton icon={<SettingsIcon />} text="系统设置" />
				</RouterLink>
			),
		},
		{
			type: "divider",
		},
		{
			label: <LogoutButton isButton={false} />,
			key: "6",
		},
	];

	return (
		<>
			<Dropdown menu={{ items }} trigger={["click"]}>
				<a onClick={(f) => f.preventDefault()}>
					<Space>
						<IconButton
							icon={<EditIcon />}
							// text={!expanded ? "收起" : "展开"}
							onClick={() => toggleExpand()}
							shadow
							bordered
						/>
					</Space>
				</a>
			</Dropdown>
			<Modal
				centered
				open={visible}
				onCancel={handleCancel}
				onOk={handleOk}
				width={800}
			>
				<div className={style.content}>
					<div className={style.banner}>
						<Image
							src="/assets/banner-2.png"
							alt="banner"
							fill={true}
							objectFit="contain"
						/>
					</div>
					<p className={style.title}>进群可领取邀请码，领取1个月免费福利</p>
				</div>
			</Modal>
		</>
	);
};
export default function UserInfo() {
	const { user } = useUserStore();
	const { id, user_balance } = user;
	const isLogin = !!id && id != 0;
	const [visible, setVisible] = useState(false);
	const [expanded, setExpanded] = useState(false); // 控制展开状态

	const handleOk = () => {
		setVisible(false);
	};

	const handleCancel = () => {
		setVisible(false);
	};

	const handleButtonClick = () => {
		setVisible(true);
	};

	return (
		<div className={styles["user-info-wrapper"]}>
			{isLogin ? (
				<div className={styles["user-info"]}>
					<Avatar src={user?.avatar} size="large">
						{user.nickname || "神秘人"}{" "}
					</Avatar>
					<div className={styles["user-details"]}>
						<p>会员类型：{user?.membership_level}</p>
						<p>到期时间：{user?.membership_expiry_date}</p>
						<p>基础对话余额：{user_balance.basic_chat_balance}</p>
						<p>高级对话余额：{user_balance.pro_chat_balance}</p>
					</div>
					<div>
						<ConfigMemu />
					</div>
				</div>
			) : (
				<>
					<Link href="/auth">
						<Button type="default">登录</Button>
					</Link>
					<Button onClick={handleButtonClick}>
						<LightningIcon /> 领福利
					</Button>
				</>
			)}
			<Modal
				centered
				open={visible}
				onCancel={handleCancel}
				onOk={handleOk}
				width={800}
			>
				<div className={style.content}>
					<div className={style.banner}>
						<Image
							src="/assets/banner-2.png"
							alt="banner"
							fill={true}
							objectFit="contain"
						/>
					</div>
					<p className={style.title}>进群可领取邀请码，领取1个月免费福利</p>
				</div>
			</Modal>
		</div>
	);
}
