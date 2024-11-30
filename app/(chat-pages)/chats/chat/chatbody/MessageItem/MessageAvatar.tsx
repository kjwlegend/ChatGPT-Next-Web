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
	console.log("isUser", isUser);
	console.log("userAvatar", userAvatar);
	console.log("userNickname", userNickname);
	console.log("agentAvatar", agentAvatar);
	console.log("agentName", agentName);
	if (isUser) {
		return <Avatar avatar={userAvatar} nickname={userNickname} />;
	}
	return <Avatar avatar={agentAvatar} nickname={agentName} />;
};

export default MessageAvatar;
