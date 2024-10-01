import { SketchOutlined, CrownOutlined, UserOutlined } from "@ant-design/icons";

export type MembershipLevel = "free" | "gold_membership" | "diamond_membership";

export interface MembershipReward {
	type: string;
	subtype: string;
	total: number;
}

export interface MembershipInfo {
	icon: typeof SketchOutlined | typeof CrownOutlined | typeof UserOutlined;
	displayName: string;
	product_key: string;
	description: string;
	rewards: MembershipReward[];
}

export const MEMBERSHIP_INFO: Record<MembershipLevel, MembershipInfo> = {
	//TODO :
	free: {
		icon: UserOutlined,
		displayName: "免费会员",
		product_key: "free_membership",
		description: "每天重置 200 次基础对话, 5 次高级对话, 1 次塔罗牌",
		rewards: [
			{ type: "chat", subtype: "Basic", total: 200 },
			{ type: "chat", subtype: "Pro", total: 5 },
			{ type: "tarot", subtype: "Basic", total: 1 },
		],
	},
	gold_membership: {
		icon: CrownOutlined,
		displayName: "黄金会员",
		product_key: "gold_membership",
		description: "每天重置 1000 次基础对话, 30 次高级对话, 5 次塔罗牌",
		rewards: [
			{ type: "chat", subtype: "Basic", total: 1000 },
			{ type: "chat", subtype: "Pro", total: 30 },
			{ type: "tarot", subtype: "Basic", total: 5 },
		],
	},
	diamond_membership: {
		icon: SketchOutlined,
		displayName: "钻石会员",
		product_key: "diamond_membership",
		description: "每天重置 10000 次基础对话, 100 次高级对话, 10 次塔罗牌",
		rewards: [
			{ type: "chat", subtype: "Basic", total: 10000 },
			{ type: "chat", subtype: "Pro", total: 100 },
			{ type: "tarot", subtype: "Basic", total: 10 },
		],
	},
};

export function getMembershipInfo(level: MembershipLevel): MembershipInfo {
	return MEMBERSHIP_INFO[level] || MEMBERSHIP_INFO.free;
}
