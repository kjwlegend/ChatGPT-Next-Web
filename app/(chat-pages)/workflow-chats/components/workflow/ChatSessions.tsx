import { _Chat } from "@/app/(chat-pages)/chats/chat/main";

interface ChatSessionsProps {
	sessions: any[];
}

export const ChatSessions: React.FC<ChatSessionsProps> = ({ sessions }) => {
	return sessions.map((session, index) => (
		<_Chat
			key={`workflow-${session?.id}`}
			_session={session}
			index={index}
			isworkflow={true}
			submitType="workflow"
			storeType="workflow"
		/>
	));
};
