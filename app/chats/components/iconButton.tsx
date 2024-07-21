import React from "react";
import { Button, Tooltip } from "antd";
import { ButtonProps } from "antd/es/button";
import { TooltipProps } from "antd/es/tooltip";

interface IconButtonProps extends ButtonProps {
	text: string;
	icon: React.ReactNode;
	onClick: () => void;
	tooltipProps?: TooltipProps; // Optional props for Tooltip customization
}

const IconTooltipButton: React.FC<IconButtonProps> = ({
	text,
	icon,
	onClick,
	tooltipProps,
	...buttonProps
}) => {
	return (
		<Tooltip title={text} {...tooltipProps}>
			<Button
				icon={icon}
				onClick={onClick}
				{...buttonProps}
				style={{ margin: 2 }}
			/>
		</Tooltip>
	);
};

export default IconTooltipButton;
