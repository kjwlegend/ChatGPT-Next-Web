import React from "react";
import { useSessions } from "../hooks/useChatContext";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { oss_base } from "@/app/constant";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDoSubmit } from "../hooks/useDoSubmit";
import { message } from "antd";

const ChatIntro = () => {
	const session = useSessions();
	const agent = session.mask;
	const [messageApi, contextHolder] = message.useMessage();

	// 初始化 doSubmit
	const { doSubmit } = useDoSubmit(
		session,
		[], // 无图片附件
		[], // 无文件附件
		"chat",
		(error: string) => messageApi.error(error),
	);

	// 示例快捷问题列表
	const allQuickQuestions = {
		// 基础了解
		basic: [
			// 身份与功能
			"你能做什么?",
			"介绍下自己",
			"你是谁?",

			// 使用指南
			"如何使用这个功能",
			"怎样和你更好地对话?",
			"有什么使用技巧吗?",

			// 基本定位
			"你的主要职责是什么?",
			"你的专业领域是什么?",
			"你最擅长解决什么问题?",

			// 互动方式
			"我们该如何开始对话?",
			"你喜欢怎样的交流方式?",
			"有什么需要注意的事项吗?",

			// 期望设定
			"你能给我什么帮助?",
			"我们能达到什么效果?",
			"有什么使用限制吗?",
		],

		// 能力探索
		capability: [
			"你有什么特长?",
			"你的知识范围是什么?",
			"你能帮我做哪些事?",
			"你擅长什么类型的任务?",
		],

		// 互动方式
		interaction: [
			"如何让我们的对话更有效?",
			"怎样才能更好地表达我的需求?",
			"你希望我如何配合你?",
			"我们如何建立良好的沟通?",
		],

		// 学习指导
		learning: [
			"你能教我些什么?",
			"如何和你一起学习?",
			"你能推荐学习方法吗?",
			"怎样才能学得更好?",
		],

		// 问题解决
		problemSolving: [
			"遇到问题时该如何描述?",
			"你需要什么信息来帮助我?",
			"如何让你更好地理解我的问题?",
			"我们如何一步步解决问题?",
		],

		// 创意激发
		creativity: [
			"我们能一起头脑风暴吗?",
			"你能帮我拓展思路吗?",
			"如何激发创意灵感?",
			"我们能探讨新想法吗?",
		],
	};

	// 从每组随机选择一个问题，最多显示4-5个
	const quickQuestions = Object.entries(allQuickQuestions)
		.sort(() => Math.random() - 0.5) // 随机打乱分组顺序
		.slice(0, 4) // 选择前4个分组
		.map(
			([_, questions]) =>
				questions[Math.floor(Math.random() * questions.length)],
		);

	const handleQuestionClick = async (question: string) => {
		await doSubmit(question);
	};

	return (
		<Card className="w-full border-0 bg-gradient-to-b from-muted/30 to-background">
			{contextHolder}
			<CardContent className="p-3 sm:p-4">
				<div className="flex items-start gap-3">
					<Avatar className="h-10 w-10 shrink-0 ring-2 ring-primary/10 md:h-16 md:w-16">
						<AvatarImage src={`${oss_base}/${agent.avatar}`} alt={agent.name} />
						<AvatarFallback>{agent.name[0]}</AvatarFallback>
					</Avatar>

					<div className="min-w-0 flex-1 space-y-3">
						{/* 描述区域 */}
						<div className="space-y-2">
							{agent.description && (
								<div className="rounded-lg bg-primary/5 p-2.5 text-sm leading-relaxed text-foreground/80 sm:p-3">
									{agent.description}
								</div>
							)}
							{agent.intro && (
								<div className="rounded-lg border border-border/50 bg-muted/50 p-2.5 text-sm leading-relaxed text-muted-foreground sm:p-3">
									{agent.intro}
								</div>
							)}
						</div>

						{/* 快捷问题区域 */}
						<div className="flex flex-wrap gap-2 sm:gap-2.5">
							{quickQuestions.map((question, index) => (
								<Button
									key={index}
									variant="secondary"
									size="sm"
									className="h-7 whitespace-nowrap border border-border/50 bg-background/60 text-xs hover:bg-primary/10 sm:h-8"
									onClick={() => handleQuestionClick(question)}
								>
									{question}
								</Button>
							))}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default ChatIntro;
