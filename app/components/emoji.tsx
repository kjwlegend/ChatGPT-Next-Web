import EmojiPicker, {
	Emoji,
	EmojiStyle,
	Theme as EmojiTheme,
} from "emoji-picker-react";

import { ModelType } from "../store";
import { Mask } from "../store/mask";
import BotIcon from "../icons/bot.svg";
import BlackBotIcon from "../icons/black-bot.svg";

export function getEmojiUrl(unified: string, style: EmojiStyle) {
	return `https://cdn.staticfile.org/emoji-datasource-apple/14.0.0/img/${style}/64/${unified}.png`;
}
import { Avatar as CustomAvatar } from "antd";

export function AvatarPicker(props: {
	onEmojiClick: (emojiId: string) => void;
}) {
	return (
		<EmojiPicker
			lazyLoadEmojis
			theme={EmojiTheme.AUTO}
			getEmojiUrl={getEmojiUrl}
			onEmojiClick={(e) => {
				props.onEmojiClick(e.unified);
			}}
		/>
	);
}

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
					<CustomAvatar src={props.mask.img} />
				) : (
					<BotIcon className="user-avatar" />
				)}
			</div>
		);
	}
}

export function EmojiAvatar(props: { avatar: string; size?: number }) {
	return (
		<Emoji
			unified={props.avatar}
			size={props.size ?? 18}
			getEmojiUrl={getEmojiUrl}
		/>
	);
}
