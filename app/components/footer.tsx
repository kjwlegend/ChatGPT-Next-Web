"use client";

import { useState } from "react";
import { Layout, Menu } from "antd";
import { useRouter } from "next/navigation";

const { Footer } = Layout;
import styles from "./footer.module.scss";

import { BottomMenuItems } from "./menu-items";
import type { MenuProps } from "antd";

export function PageFooter() {
	const [current, setCurrent] = useState("updates");
	const router = useRouter();

	const onClick: MenuProps["onClick"] = (e) => {
		setCurrent(e.key);
		console.log("click ", e);

		const item = BottomMenuItems.find((item) => item.key === e.key);
		if (item) {
			router.push(item.url);
		}
	};

	return (
		<Footer className={styles.footer + " desktop-only"}>
			<Menu
				items={BottomMenuItems}
				mode="horizontal"
				className={styles.footerMenu}
				onClick={onClick}
				// selectedKeys={[current]}
			/>
			<div className={styles.footerContent}>CopyRight © 2023 by 经纬咨询</div>
		</Footer>
	);
}

export default PageFooter;
