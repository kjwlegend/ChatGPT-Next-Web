import {
	AliwangwangOutlined,
	UsergroupAddOutlined,
	HighlightOutlined,
	ContainerOutlined,
	BookOutlined,
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
		label: "塔罗",
		title: "塔罗",
		key: "tarot",
		icon: <BookOutlined />,
		url: "/tarot/",
	},
	{
		label: "ai实验室",
		key: "double-agents",
		icon: <UsergroupAddOutlined />,
		disabled: false,
		url: "/double-agents",
	},
	{
		label: "超级工作流",
		key: "workflow-chats",
		icon: <UsergroupAddOutlined />,
		disabled: false,
		url: "/workflow-chats",
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
