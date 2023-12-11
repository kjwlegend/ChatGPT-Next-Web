"use client";
import styles from "./header.module.scss";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppConfig } from "../store/config";
import { useMobileScreen } from "../utils";

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

import LoadingIcon from "../icons/three-dots.svg";
import { menuItems } from "./menu-items";

import DrawerMenu from "./drawer-menu";
import LoginButton from "./userinfo";
import UserInfo from "./userinfo";

const items: any = menuItems;

const { Header } = Layout;

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
			const subItem = items.find(
				(item: any) => item.children?.some((child: any) => child.key === e.key),
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
					<div className={styles.logo}>
						{/* <img
							className={styles["logo-image"]}
							src="/logo-2.png"
							alt="Logo"
						/> */}
						<Image
							src={"/logo-2.png"}
							alt="logo"
							fill={true}
							objectFit="contain"
							style={{ left: -50 }}
						/>
						<Link href="/">
							<div className={styles["logo-text"]}>
								<p className={styles["headline"]}>小光AI</p>
							</div>
						</Link>
					</div>
				</Header>
			) : (
				<Header
					className={styles.header}
					style={{ display: !showHeader ? "none" : "" }}
				>
					<div className={styles.logo}>
						{/* <img
							className={styles["logo-image"]}
							src="/logo-2.png"
							alt="Logo"
						/> */}
						<Image
							src={"/logo-2.png"}
							alt="logo"
							fill={true}
							objectFit="contain"
							style={{ left: -80 }}
						/>
						<Link href="/">
							<div className={styles["logo-text"]}>
								<p className={styles["headline"]}>小光AI</p>
								<p className={styles["subline"]}>xiaoguang.fun</p>
							</div>
						</Link>
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
					<UserInfo />
				</Header>
			)}
		</>
	);
}
