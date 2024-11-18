"use client";
import React, {
	useState,
	useRef,
	useEffect,
	useMemo,
	useCallback,
	Fragment,
} from "react";
import useSimpleWorkflowService from "../../hooks/useSimpleWorkflowHook";
import { useAgentActions } from "@/app/hooks/useAgentActions";
import { Modal } from "antd";
import MaskPage from "@/app/(chat-pages)/chats/masklist";

interface AgentListModalProps {
	open: boolean;
	onClose: () => void;
}

const AgentListModal: React.FC<AgentListModalProps> = ({ open, onClose }) => {
	const { handleAgentClick } = useSimpleWorkflowService();
	const { onDelete, onChat } = useAgentActions();

	return (
		<Modal
			open={open}
			onCancel={onClose}
			footer={null}
			width="80vw"
			height="80vh"
			styles={{
				body: {
					height: "75vh",
					overflow: "scroll",
				},
			}}
		>
			<MaskPage onItemClick={handleAgentClick} onDelete={onDelete} />
		</Modal>
	);
};

export default AgentListModal;
