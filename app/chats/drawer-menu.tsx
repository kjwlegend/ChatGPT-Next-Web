"use client";
import { useState } from "react";
import { Drawer, Menu } from "antd";
import { HomeOutlined, MenuOutlined, CloseOutlined } from "@ant-design/icons";
import styles from "@/app/components/header.module.scss";
import { TopMenuItems } from "@/app/components/menu-items";
import type { MenuProps } from "antd";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

const items = TopMenuItems;

const DrawerMenu = () => {
	const [visible, setVisible] = useState(false);
	const path = usePathname();
	const [current, setCurrent] = useState(() => {
		const current = path;
		// console.log("current", current);
		if (current === "/") {
			return "chat";
		}
		return current || "chat";
	});
	const router = useRouter();

	const showDrawer = () => {
		setVisible(true);
	};

	const onClose = () => {
		setVisible(false);
	};

	const onClick: MenuProps["onClick"] = (e) => {
		setCurrent(e.key);
		console.log("click ", e);

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
		setVisible(false);
	};

	return (
		<>
			<MenuOutlined
				onClick={showDrawer}
				style={{ fontSize: "24px", cursor: "pointer", color: "#444" }}
			/>
			<Drawer placement="left" onClose={onClose} open={visible}>
				<div className={styles.logo}>
					<Image
						className={styles["logo-image"]}
						src="/logo-2.png"
						width={50}
						height={64}
						alt="Logo"
					/>
					<div className={styles["logo-text"]}>
						<p className={styles["headline"]}>小光AI</p>
						<p className={styles["subline"] + " desktop-only"}>xiaoguang.fun</p>
					</div>
				</div>
				<Menu
					mode="inline"
					items={items}
					onClick={onClick}
					selectedKeys={[current]}
				></Menu>
			</Drawer>
		</>
	);
};

export default DrawerMenu;
