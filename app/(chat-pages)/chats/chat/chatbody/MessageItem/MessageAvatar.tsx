import React from "react";
import Avatar from "@/app/components/avatar";

interface MessageAvatarProps {
	isUser: boolean;
	userAvatar?: string;
	userNickname?: string;
	agentAvatar?: string;
	agentName?: string;
}

const MessageAvatar: React.FC<MessageAvatarProps> = ({
	isUser,
	userAvatar,
	userNickname,
	agentAvatar,
	agentName,
}) => {
	if (isUser) {
		return <Avatar avatar={userAvatar} nickname={userNickname} />;
	}
	return <Avatar avatar={agentAvatar} nickname={agentName} />;
};

export default MessageAvatar;
