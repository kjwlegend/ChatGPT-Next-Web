import React, { useState, useEffect, useMemo, useContext } from "react";

import { ChatMessage, ChatSession } from "@/app/types/chat";

import styles from "../chats.module.scss";

import { SessionConfigModal } from "./SessionConfigModal";

import { sessionConfig } from "@/app/types/";

export const SessionModal = (props: {
	session?: sessionConfig;
	index?: number;
	isworkflow: boolean;
	showModal?: boolean;
	setShowModal: (_: boolean) => void;
	MultiAgent?: boolean;
}) => {
	const session = props.session;

	return (
		<div>
			{props.showModal && (
				<SessionConfigModal
					onClose={() => props.setShowModal(false)}
					session={session}
					isworkflow={props.isworkflow}
				/>
			)}
		</div>
	);
};
