import { ModelType } from "@/app/store";
import { Mask } from "@/app/types/mask";
import BotIcon from "@/app/icons/bot.svg";
import BlackBotIcon from "@/app/icons/black-bot.svg";
import { Avatar as AntdAvatar } from "antd";

import React, { useMemo } from "react";
interface AvatarProps {
	model?: Mask;
	avatar?: string | null;
	nickname?: string;
	size?: any;
}

export const Avatar: React.FC<AvatarProps> = ({
	model,
	avatar,
	nickname,
	size,
}) => {
	const RenderedAvatar = useMemo(() => {
		if (model) {
			return model.avatar?.startsWith("a-") ? (
				<AntdAvatar src={`/avatars/${avatar}.png`} size={size}>
					{model.name}
				</AntdAvatar>
			) : (
				<BotIcon className="user-avatar" />
			);
		}

		if (avatar && avatar.startsWith("a-")) {
			return <AntdAvatar src={`/avatars/${avatar}.png`} />;
		}

		if (avatar) {
			return <AntdAvatar size={size} src={avatar} />;
		}

		return (
			<AntdAvatar style={{ backgroundColor: "rgb(91,105,230)" }} size={size}>
				{nickname}
			</AntdAvatar>
		);
	}, [model, avatar, nickname]);

	return <div className=" no-dark">{RenderedAvatar}</div>;
};
