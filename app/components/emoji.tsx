import { ModelType } from "../store";
import { Mask } from "@/app/types/";

import BotIcon from "@/app/icons/bot.svg";
import BlackBotIcon from "@/app/icons/black-bot.svg";

import { Avatar as CustomAvatar } from "antd";

export function BotAvatar(props: {
	mask?: Mask;
	avatar?: string;
	size?: number;
}) {
	const avatar = props.mask?.avatar || "";
	const imgurl = props.mask?.img || `/avatars/${avatar}.png`;

	if (props.mask) {
		return (
			<div className="no-dark">
				{avatar !== "gpt-bot" ? (
					<CustomAvatar size={props.size} src={imgurl}>
						{props.mask.name}
					</CustomAvatar>
				) : (
					<BotIcon className="user-avatar" width={props.size} />
					// <CustomAvatar
					// 	icon={<BotIcon />}
					// 	size={props.size}
					// 	className="user-avatar"
					// />
				)}
			</div>
		);
	}
}
