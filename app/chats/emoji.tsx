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

export function Avatar(props: { model?: Mask; avatar?: string }) {
	if (props.model) {
		return (
			<div className="no-dark">
				{props.model.avatar?.startsWith("a-") ? (
					<CustomAvatar src={`/avatars/${props.avatar}.png`} />
				) : (
					<BotIcon className="user-avatar" />
				)}
			</div>
		);
	}

	return (
		<div className="user-avatar">
			{props.avatar && props.avatar.startsWith("a-") ? (
				<>
					<CustomAvatar src={`/avatars/${props.avatar}.png`} />
					{/* <i className="icon-weixin" /> */}
				</>
			) : (
				<EmojiAvatar avatar={props.avatar || ""} />
			)}
		</div>
	);
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
