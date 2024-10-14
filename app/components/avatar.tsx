import { Avatar as AntdAvatar } from "antd";
import React, { useMemo } from "react";
import { oss_base } from "../constant";

interface AvatarProps {
	avatar?: string | null;
	nickname?: string;
	size?: any;
}

// 生成随机颜色的函数
const getRandomColor = () => {
	const letters = "0123456789ABCDEF";
	let color = "#";
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
};

export const Avatar: React.FC<AvatarProps> = ({ avatar, nickname, size }) => {
	const RenderedAvatar = useMemo(() => {
		// if (avatar) {
		// 	if (avatar.startsWith("a-")) {
		// 		return <AntdAvatar src={`/avatars/${avatar}.png`} size={size} />;
		// 	}
		// 	return <AntdAvatar size={size} src={`${oss_base}${avatar}`} />;
		// }

		// 为默认头像生成随机背景色
		const randomColor = "#d5d5d5"; //getRandomColor();

		return (
			<AntdAvatar
				style={{ backgroundColor: randomColor }}
				size={size}
				src={`${oss_base}/${avatar}!avatar`}
			>
				{nickname}
			</AntdAvatar>
		);
	}, [avatar, nickname, size]);

	return <div className="no-dark">{RenderedAvatar}</div>;
};
