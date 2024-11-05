import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import React, { useMemo } from "react";
import { oss_base } from "../constant";

interface AvatarProps {
	avatar?: string | null;
	nickname?: string;
	size?: any;
	className?: string;
}

const AvatarComponent: React.FC<AvatarProps> = ({
	avatar,
	nickname,
	size,
	className,
}) => {
	const RenderedAvatar = useMemo(() => {
		const randomColor = "#d5d5d5"; //getRandomColor();

		return (
			<Avatar className={className}>
				<AvatarImage src={`${oss_base}/${avatar}!avatar`} />
				<AvatarFallback>{nickname?.slice(0, 1)}</AvatarFallback>
			</Avatar>
		);
	}, [avatar, nickname, size]);

	return <div className={className}>{RenderedAvatar}</div>;
};

export default AvatarComponent;
