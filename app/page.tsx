"use client";
import { Analytics } from "@vercel/analytics/react";
import { Home } from "./components/home";
import About from "./about/page";
import { getServerSideConfig } from "./config/server";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useInviteCodeStore } from "./store/auth";

const serverConfig = getServerSideConfig();

export default function App() {
	const query = useSearchParams();

	const inviteCode = query.get("i");
	console.log("inviteCode", inviteCode);
	const inviteCodeStore = useInviteCodeStore();

	useEffect(() => {
		// 在这里可以使用inviteCode进行相应的处理
		inviteCodeStore.setInviteCode(inviteCode);
	}, [inviteCode]);

	return (
		<>
			{/* <Home /> */}
			<About />
			{serverConfig?.isVercel && <Analytics />}
		</>
	);
}
