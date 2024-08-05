"use client";
import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import React from "react";

import styles from "@/app/chats/home.module.scss";

import { SideBar } from "@/app/chats/sidebar/sidebar";
import { ChatList } from "@/app/chats/sidebar/chatList";
import { useMultipleAgentsChatService } from "@/app/hooks/useMultipleAgentsHook";

export function DoubleAgentSideBar(props: { className?: string }) {
	const {
		chatSessions,
		loadMoreSessions,
		handleAddClick,
		handleChatItemClick,
		handleChatItemDelete,
	} = useMultipleAgentsChatService();

	return (
		<SideBar
			className={styles["sidebar-show"]}
			chatSessions={chatSessions}
			loadMoreSessions={loadMoreSessions}
			onAddClick={handleAddClick}
			onChatItemClick={handleChatItemClick}
			onChatItemDelete={handleChatItemDelete}
			ChatListComponent={ChatList}
		/>
	);
}
