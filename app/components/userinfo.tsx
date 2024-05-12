import React, { useState, useEffect } from "react";
import LogoutButton from "./logout";
import { useUserStore } from "../store/user";
import Link from "next/link";

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
import styles from "./header.module.scss";
import { IconButton } from "./button";
import LightningIcon from "../icons/lightning.svg";
import EditIcon from "../icons/menu.svg";
import { Modal } from "antd";
import style from "./welcome.module.scss";
import Image from "next/image";

export default function UserInfo() {
	const { user } = useUserStore();
	const [visible, setVisible] = useState(false);

	const handleButtonClick = () => {
		setVisible(true);
	};
	const handleOk = () => {
		setVisible(false);
	};

	const handleCancel = () => {
		setVisible(false);
	};

	const items: MenuProps["items"] = [
		{
			label: <Link href="/profile/">个人中心</Link>,
			key: "0",
		},
		{
			// 展示会员类型, 不可点击
			label: <Link href="/profile#2">会员类型: {user?.member_type}</Link>,
			key: "1",
		},

		// 展示到期时间
		{
			label: `到期时间: ${user?.member_expire_date} `,
			key: "2",
		},
		// 对话次数
		{
			label: `对话剩余: ${user?.user_balance?.chat_balance}`,
			key: "3",
		},

		{
			label: <Link href="/profile#4">邀请得礼</Link>,
			key: "5",
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
		<div className={styles["login-wrapper"]}>
			{user?.username ? (
				<>
					<Dropdown menu={{ items }} trigger={["click"]}>
						<a onClick={(f) => f.preventDefault()}>
							{user?.avatar && (
								<div className={styles["avatar"]}>
									<Avatar src={user?.avatar} />
								</div>
							)}
							<Space>
								<Button>
									<EditIcon
										style={{
											marginRight: "4px",
											position: "relative",
											top: "5px",
										}}
									/>{" "}
									{user.nickname ? user.nickname : "神秘人"}{" "}
								</Button>
							</Space>
						</a>
					</Dropdown>

					<Button onClick={handleButtonClick}>
						<LightningIcon
							style={{
								marginRight: "4px",
								position: "relative",
								top: "5px",
							}}
						/>{" "}
						领福利
					</Button>
				</>
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
							// style={{ objectFit: "contain" }}
						/>
					</div>

					<p className={style.title}> 进群可领取邀请码, 领取1个月免费福利</p>
				</div>
			</Modal>
		</div>
	);
}
