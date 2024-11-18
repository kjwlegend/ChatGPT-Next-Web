"use client";
import About from "./(pages)/about/page";
import { getServerSideConfig } from "./config/server";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useInviteCodeStore } from "./store/auth";
import Header from "./components/header";
import Footer from "./components/footer";
import Head from "next/head";
import Home from "./(chat-pages)/chats/page";
import AuthPage from "./(pages)/auth/page";
import { Toaster } from "@/components/ui/toaster";
const serverConfig = getServerSideConfig();

export default function App() {
	const query = useSearchParams();

	const inviteCode = query.get("i");
	const inviteCodeStore = useInviteCodeStore();

	useEffect(() => {
		// 在这里可以使用inviteCode进行相应的处理
		// console.log("inviteCode", inviteCode);

		inviteCodeStore.setInviteCode(inviteCode);
	}, [inviteCode]);

	return (
		<>
			{/* <About /> */}
			<Home />
			{/* <AuthPage /> */}
		</>
	);
}
