"use client";
import React, { useState, useEffect } from "react";
import LogoutButton from "./logout";
import { useUserStore } from "../store/user";
import Link from "next/link";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Path } from "../constant";

import { Layout, Menu, Button, Form, Input, Space, Dropdown } from "antd";
import AvatarComponent from "./avatar";
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
import { oss_base } from "../constant";
import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/ui/avatar";

import {
	ChevronsUpDown,
	Sparkles,
	BadgeCheck,
	CreditCard,
	Bell,
	LogOut,
	Settings,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAuth from "../hooks/useAuth";

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
			key: "setting",
			label: (
				<RouterLink to={Path.Settings}>
					<IconButton icon={<SettingsIcon />} text="系统设置" />
				</RouterLink>
			),
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
		</>
	);
};
export default function UserInfo() {
	const { user } = useUserStore();
	const { id, user_balance } = user;
	const isLogin = !!id && id != 0;
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

	return (
		<div className={styles["user-info-wrapper"]}>
			{/* <NewUserInfo user={user} /> */}
			{isLogin ? (
				<>
					<NewUserInfo />

					{/* <div className={styles["user-info"]}>
						<div className={styles["user-profile"]}>
							<AvatarComponent
								avatar={`${oss_base}/${user?.avatar}`}
								nickname={user.nickname || "神秘人"}
							/>
							<div className={styles["user-name-type"]}>
								<span className={styles["user-nickname"]}>
									{user.nickname || "神秘人"}
								</span>
								<span className={styles["user-type"]}>
									{mappingMembershipLevel(user?.membership_level)}
								</span>
							</div>
							<div className={styles["user-actions"]}>
								<ConfigMemu />
							</div>
						</div>
						<div className={styles["user-details"]}>
							<p>到期时间：{user?.membership_expiry_date}</p>
							<p>基础对话余额：{user_balance.basic_chat_balance}</p>
							<p>高级对话余额：{user_balance.pro_chat_balance}</p>
						</div>
						<LogoutButton />
					</div> */}
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
						/>
					</div>
					<p className={style.title}>进群可领取邀请码，领取1个月免费福利</p>
				</div>
			</Modal>
		</div>
	);
}

const NewUserInfo = () => {
	const auth = useAuth();
	const { user } = useUserStore();
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

	const handleLogout = async (e: React.MouseEvent) => {
		e.stopPropagation();
		await auth.logoutHook();
	};

	const mappingMembershipLevel = (level: string) => {
		switch (level) {
			case "free":
				return "免费会员";
			case "gold_member":
				return "黄金会员";
			case "diamond_member":
				return "钻石会员";
			default:
				return "未知会员";
		}
	};
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
					<Avatar className="h-8 w-8 rounded-lg">
						<AvatarImage src={`${oss_base}/${user.avatar}`} alt={user.name} />
						<AvatarFallback className="rounded-lg">
							{user.nickname}
						</AvatarFallback>
					</Avatar>
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-semibold">{user.nickname}</span>
						<span className="truncate text-xs">
							{mappingMembershipLevel(user?.membership_level)}
						</span>
					</div>
					<ChevronsUpDown className="ml-auto size-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
				side="bottom"
				align="end"
				sideOffset={4}
			>
				<DropdownMenuLabel className="p-0 font-normal">
					<div className="flex flex-col  gap-2 px-1 py-1.5 text-left text-sm">
						<div className="flex  gap-2">
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage
									src={`${oss_base}/${user.avatar}`}
									alt={user.name}
								/>
								<AvatarFallback className="rounded-lg">
									{user.nickname}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{user.nickname}</span>
								<span className="truncate text-xs">{user.email}</span>
							</div>
						</div>
						<div className="flex flex-col gap-1 text-xs text-gray-500">
							<p>到期时间：{user?.membership_expiry_date}</p>
							<p>基础对话余额：{user.user_balance.basic_chat_balance}</p>
							<p>高级对话余额：{user.user_balance.pro_chat_balance}</p>
						</div>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<Sparkles />
						<Link href="/products">升级为Pro</Link>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<BadgeCheck />
						<Link href="/profile">个人中心</Link>
					</DropdownMenuItem>
					{/* <DropdownMenuItem>
						<CreditCard />
						<Link href="/profile">会员</Link>
					</DropdownMenuItem> */}
					<DropdownMenuItem onClick={handleButtonClick}>
						<Bell />
						福利
					</DropdownMenuItem>
					{/* 邀请 */}
					<DropdownMenuItem>
						<Sparkles />
						<Link href="/profile#4">邀请</Link>
					</DropdownMenuItem>
					{/* 系统设置 */}
					<DropdownMenuItem>
						<Settings />
						<RouterLink to={Path.Settings}>系统设置</RouterLink>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleLogout}>
					<LogOut />
					注销登出
				</DropdownMenuItem>
			</DropdownMenuContent>
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
		</DropdownMenu>
	);
};
