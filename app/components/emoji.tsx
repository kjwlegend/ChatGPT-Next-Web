import { ModelType } from "../store";
import { Mask } from "../store/mask";
import BotIcon from "../icons/bot.svg";
import BlackBotIcon from "../icons/black-bot.svg";

import { Avatar as CustomAvatar } from "antd";

export function Avatar(props: { mask?: Mask; avatar?: string }) {
	const avatar = props.mask?.avatar || "";

	if (props.mask) {
		return (
			<div className="no-dark">
				{props.mask.avatar?.startsWith("a-") ? (
					<CustomAvatar src={`/avatars/${avatar}.png`} />
				) : //  判断是否startsWith("role-")，如果是则使用 promps.mask.img 作为头像
				//  否则使用默认头像 BotIcon
				props.mask.avatar?.startsWith("role-") ? (
					<CustomAvatar src={props.mask.img}>{props.mask.name}</CustomAvatar>
				) : (
					<BotIcon className="user-avatar" />
				)}
			</div>
		);
	}
}
