"use client";
import Image from "next/image";
import Link from "next/link";
import styles from "./header.module.scss";
import { useTheme } from "next-themes";
import { useAppConfig } from "../store/config";

export default function Logo() {
	const config = useAppConfig();
	const theme = config.theme;

	const logoSrc = theme === "dark" ? "/logo-dark.png" : "/logo-light.png";

	return (
		<div className={styles.logo}>
			<Link href="/">
				<Image
					src={logoSrc}
					alt="logo"
					objectFit="contain"
					width={137}
					height={45}
				/>
			</Link>
		</div>
	);
}
