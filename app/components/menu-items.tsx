import {
	AliwangwangOutlined,
	UsergroupAddOutlined,
	HighlightOutlined,
	ContainerOutlined,
} from "@ant-design/icons";
import { ReactNode } from "react";

export interface MenuItem {
	label: string;
	title?: string;
	key: string;
	icon: ReactNode;
	url: string;
	children?: MenuItem[];
	disabled?: boolean;
}

export const menuItems: MenuItem[] = [
	{
		label: "首页",
		key: "home",
		icon: <ContainerOutlined />,
		url: "/about",
	},
	{
		label: "对话",
		title: "对话",
		key: "chat",
		icon: <AliwangwangOutlined />,
		url: "/chats/",
	},
	{
		label: "超级工作流",
		key: "multi-chats",
		icon: <UsergroupAddOutlined />,
		disabled: false,
		url: "/multi-chats",
	},

	{
		label: "版本日志",
		key: "updates",
		icon: <ContainerOutlined />,
		url: "/updates",
	},
	{
		label: "社区(开发中)",
		key: "draw",
		icon: <HighlightOutlined />,
		disabled: true,
		url: "/draw",
	},
	// {
	//   label: "商城(开发中)",
	//   key: "mall",
	//   disabled: true,
	//   url: "/mall",
	// },
];
