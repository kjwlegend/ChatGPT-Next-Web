import React, { useEffect, useState, useMemo } from "react";
import { Layout } from "antd";
import { WorkflowSidebar } from "../../sidebar";
import AgentList from "../AgentList";
import MainScreen from "./MainScreen";
import styles from "../../workflow-chats.module.scss";
import styles2 from "@/app/(chat-pages)/chats/home.module.scss";
import { useAuthStore } from "@/app/store/auth";
import { useAgentListModal, useWorkflowSessions } from "../../workflowContext";
import { useWorkflowGroups } from "../../hooks/useWorkflow/useWorkflowGroups";
import { workflowChatSession } from "@/app/types/";
import { useRouter } from "next/navigation";
import AgentListModal from "../modal/AgentListModal";

const SimpleWorkflow: React.FC = () => {
	const isAuthenticated = useAuthStore().isAuthenticated;
	const { workflowGroups, selectedId } = useWorkflowGroups();
	const workflowSessions = useWorkflowSessions() as workflowChatSession[];
	const { fetchWorkflowGroups, createWorkflowGroup } = useWorkflowGroups();
	const { showAgentList, openAgentList, closeAgentList } = useAgentListModal();
	const [isAuth, setIsAuth] = useState(false);
	const router = useRouter();

	useEffect(() => {
		setIsAuth(isAuthenticated);
	}, [isAuthenticated]);

	const currentWorkflowGroup = useMemo(() => {
		return workflowGroups.find((group) => group.id === selectedId);
	}, [selectedId, workflowGroups]);

	const [currentSessions, setCurrentSessions] = useState<any[]>([]);

	useEffect(() => {
		fetchWorkflowGroups({
			page: 1,
			limit: 100,
		});
	}, []);

	useEffect(() => {
		const sessions = workflowSessions.filter(
			(session) => session.workflow_group_id === selectedId,
		);
		setCurrentSessions(sessions.sort((a, b) => a.order - b.order));
	}, [selectedId, workflowSessions]);

	return (
		<Layout className="tight-container">
			<WorkflowSidebar />
			<Layout
				className={`${styles2["window-content"]} ${styles["background"]}`}
			>
				{selectedId !== "" && (
					<AgentList
						sessions={currentSessions}
						workflowGroup={currentWorkflowGroup}
					/>
				)}
				<div className={styles["chats-container"]}>
					<MainScreen
						isAuth={isAuth}
						currentSessions={currentSessions}
						workflowGroups={workflowGroups}
						addWorkflowGroup={createWorkflowGroup}
						router={router}
					/>
				</div>
				<AgentListModal open={showAgentList} onClose={closeAgentList} />
			</Layout>
		</Layout>
	);
};

export default SimpleWorkflow;
