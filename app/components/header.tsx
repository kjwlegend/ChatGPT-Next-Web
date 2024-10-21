"use client";
import styles from "./header.module.scss";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppConfig } from "../store/config";
import { useMobileScreen } from "@/app/hooks/useMobileScreen";

import Link from "next/link";
import Image from "next/image";

import type { MenuProps } from "antd";
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

import LoadingIcon from "@/app/icons/three-dots.svg";
import { TopMenuItems } from "./menu-items";

import DrawerMenu from "./drawer-menu";
import LoginButton from "./userinfo";
import UserInfo from "./userinfo";
enum Theme {
	Auto = "auto",
	Dark = "dark",
	Light = "light",
}
const items: any = TopMenuItems;

const { Header } = Layout;

import { ThemeSwitcher } from "./themeSwitcher";
interface Props {
	displayMobileVersion: boolean;
}

export default function MainNav() {
	const isMobileScreen = useMobileScreen();

	const path = usePathname();
	const router = useRouter();
	const { showHeader } = useAppConfig();
	const [current, setCurrent] = useState(() => {
		const current = path;
		// console.log("current", current);
		if (current === "/") {
			return "home";
		}
		return current || "home";
	});

	// 等待样式表加载完后, 再显示
	const [show, setShow] = useState(false);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setShow(true);
		}, 100);

		// 在组件卸载时清除定时器
		return () => clearTimeout(timeout);
	}, []);

	if (!show) {
		return <LoadingIcon />;
	}

	const onClick: MenuProps["onClick"] = (e) => {
		setCurrent(e.key);
		console.log("click ", e);
		if (items) {
		}
		const item = items.find((item: any) => item.key === e.key);
		if (item) {
			router.push(item.url);
		} else {
			const subItem = items.find((item: any) =>
				item.children?.some((child: any) => child.key === e.key),
			);
			if (subItem) {
				const subItemChild = subItem.children?.find(
					(child: any) => child.key === e.key,
				);
				if (subItemChild) {
					router.push(subItemChild.url);
				}
			}
		}
	};

	return (
		<>
			{isMobileScreen ? (
				<Header className={styles.header}>
					<DrawerMenu />
					<div className={styles.logo}>
						<Link href="/chats">
							<Image
								src={"/logo.png"}
								alt="logo"
								width={106}
								height={35}
								objectFit="contain"
							/>
							{/* 
							<div className={styles["logo-text"]}>
								<p className={styles["headline"]}>小光AI</p>
							</div> */}
						</Link>
					</div>
				</Header>
			) : (
				<Header
					className={styles.header}
					style={{ display: !showHeader ? "none" : "" }}
				>
					<div className={styles.logo}>
						<Link href="/">
							<Image
								src={"/logo.png"}
								alt="logo"
								// fill={true}
								objectFit="contain"
								width={137}
								height={45}
								// style={{ left: -80 }}
							/>
						</Link>

						{/* <div className={styles["logo-text"]}>
								<p className={styles["headline"]}>小光AI 3.0</p>
								<p className={styles["subline"]}>XiaoGuang</p>
							</div> */}
					</div>

					<div className={styles["ant-menu"]}>
						<Menu
							onClick={onClick}
							selectedKeys={[current]}
							mode="horizontal"
							style={{ backgroundColor: "transparent" }}
							className={styles["ant-menu" + " desktop-only"]}
							items={items}
							// overflowedIndicator={<span>...</span>}
						/>
					</div>
					<div style={{ display: "flex", alignItems: "center", flexGrow: "1" }}>
						<ThemeSwitcher />
					</div>
				</Header>
			)}
		</>
	);
}
