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

enum Theme {
	Auto = "auto",
	Dark = "dark",
	Light = "light",
}
const items: any = TopMenuItems;

const { Header } = Layout;
import Locale from "@/app/locales";
import LightIcon from "@/app/icons/light.svg";
import DarkIcon from "@/app/icons/dark.svg";
import AutoIcon from "@/app/icons/auto.svg";

export const ThemeSwitcher = () => {
	const config = useAppConfig();
	const updateConfig = config.update;
	const currentTheme = config.theme;

	const [theme, setTheme] = useState(currentTheme as Theme);
	const newTheme = theme === "light" ? "dark" : "light";

	useEffect(() => {
		// set theme
		document.body.className = theme;
	}, [theme]);

	const toggleTheme = () => {
		setTheme(newTheme as Theme);
		localStorage.setItem("theme", newTheme);
		document.body.className = newTheme;

		updateConfig((config) => {
			config.theme = newTheme as Theme;
		});
	};
	const iconStyle = {
		top: "2px",
		position: "relative",
	};

	const ThemeIcon =
		theme == "dark" ? (
			<DarkIcon style={iconStyle} />
		) : (
			<LightIcon style={iconStyle} />
		);
	return (
		<>
			<Button onClick={toggleTheme}>
				{/* {Locale.Chat.InputActions.Theme[theme]} */}
				<span
					style={{
						top: "5px",
					}}
				>
					{ThemeIcon}
				</span>
			</Button>
		</>
	);
};
