"use client";
import React from "react";
import {
	Card,
	Carousel,
	Layout,
	Row,
	Col,
	Collapse,
	Button,
	Divider,
	Tabs,
	Timeline,
} from "antd";
import type { CollapseProps } from "antd";
import { useEffect, useRef } from "react";
import styles from "./updates.module.scss";

const { Content } = Layout;

const items = [
	{
		label: "2023-05-15",
		children: "小规模测试版发布, 主要为朋友和公司团队内部使用",
		color: "green",
	},
	{
		label: "2023-06-15",
		children: "系统升级, 增加预设功能",
	},
	{
		label: "2023-06-30",
		children: `更名, 从 "某个Chatgpt" 变为 "小光AI", 开启内部Alpha测试, 正式发布v0.1 `,
		color: "red",
	},
	{
		label: "2023-07-01",
		children: "发布 v0.2 版本, 重构预设和面具功能界面",
	},
	{
		label: "2023-07-02",
		children:
			"发布 v0.3 版本, 重构聊天界面, 增加聊天窗口快捷命令, 可以快速新建角色, 切换对话",
	},
	{
		label: "2023-07-03",
		children:
			"发布 v0.3.1 版本, 优化小光AI默认模型预设, 增加阳光温暖的人设对话逻辑, 增加代码解释器预设(主要自用)",
	},
	{
		label: "2023-07-04",
		children:
			'发布 v0.3.2 版本,增加 "小光AI" 介绍页面, 重构了整个站点的配色风格',
	},
	{
		label: "2023-07-05",
		children:
			"发布 v0.3.3 版本, 增加版本更新日志页面, 主要用于记录开发里程碑, 修复介绍页面的手机端bug",
	},
	{
		label: "2023-07-07",
		children:
			"发布 v0.3.4 版本, 小光为了更好的陪伴你, 他现在已经可以识别你的名字了",
	},
	{
		label: "2023-07-08",
		children: (
			<>
				发布 v0.4.0 版本,
				<ul>
					<li>
						我们重构了角色页面, 增加了角色的分类,你可以在全部角色中进行分类筛选.
						(但深度定制的角色还没有上线).
					</li>
					<li>
						{" "}
						我们引入了小亮(开发者), 主要来帮助小光同学编写代码, 他们会一起努力,
						让小光变得更加强大.
					</li>
					<li>
						同时加入了女巫小双, 小双心中追随者小亮, 但是小亮眼中只有小光.
						(佐为在天之灵感到甚是无奈) .
					</li>
					<li>
						{" "}
						其中角色等级, 代表着当前语言模型的深度定制程度. Lv1 为较为基础模型
					</li>
					<li>其他小细节, 间距, 色调调整</li>
				</ul>
			</>
		),
		className: "fade-in-element",
	},
	{
		label: "2023-07-11",
		children:
			"发布 v0.4.1 版本, 优化了角色选择页的展示, 代码重新结构化, 改进了网站路由(后端功能), 优化bug修复",
		className: "fade-in-element",
	},
	{
		label: "2023-07-12",
		children: (
			<>
				发布 v0.4.2 版本,
				<ul>
					<li>
						我们加入了第一个超级角色, 孔老师. 孔老师拥有极其复杂的提示词工程,
						他能够根据你的性格, 偏好, 特征, 当前学历程度进行个性化课程的定制.
					</li>
					<li>
						原本用户打开每个角色, 都会提示 小光来了 的bug.
						我们已经修复了这个bug, 对于特殊角色,他们终于有了自己的开场白.
					</li>
					<li>
						我们意识到原本的小光底层, 性格过于乐观单一, 在回答的时候略显啰嗦.
						我们重新对小光进行了调整, 他由原本的lv2, 升级到了lv2.5
						(lv3的中间状态), 他的回答更加简洁, 但是也更加有趣.
					</li>
				</ul>
			</>
		),
		className: "fade-in-element",
	},
	{
		label: "2023-07-14",
		children: (
			<>
				发布 v0.4.3 版本,
				<ul>
					<li>
						我们加入了第2个超级角色, 小佩, 小佩是你的职业导师,
						她同样拥有极其复杂的提示词工程, 能够根据你所申请的职位,
						提供简历修改, 简历制作, 面试准备, 面试问答等多种能力.
					</li>
					<li>
						小佩，作为一位求职相关的面试官，她拥有丰富的经验和敏锐的洞察力。她总是面带微笑，给人温暖而亲切的感觉。她善于倾听，并以友善和专业的方式与求职者交流。
						<br />
						她深知求职过程中的挑战和压力，因此总是尽力为每个人提供鼓励和支持。她会耐心地解答问题，提供宝贵的建议，并分享自己的经验。她相信每个人都有闪光的瞬间，只要给予机会和发展空间，他们就能展现出自己独特的才华和能力。
					</li>
					<li>
						她的星座是天秤座。天秤座的人通常具有平衡、公正、善解人意的性格，他们擅长与人相处并寻求和谐。
					</li>
					<li>PS: 我们偷偷将孔老师的星座从天秤转变成了处女座</li>
				</ul>
			</>
		),
		className: "fade-in-element",
	},
	{
		label: "2023-07-15",
		children: (
			<>
				发布 v0.4.4 版本,
				<ul>
					<li>
						小光从 Lv2 晋级到了 Lv3, 他现在的回答除了加强了一定的逻辑性,
						同时还熟读了各种哲学经典. 并且会在结尾给你增加了更多的提问提示.
					</li>
				</ul>
			</>
		),
		className: "fade-in-element",
	},
	{
		label: "2023-07-16",
		children:
			" 发布 v0.4.5 版本: 优化了对话框色调, 调整了手机端的布局, 现在手机端有更大的对话空间了 ",
		className: "fade-in-element",
	},
	{
		label: "2023-07-22",
		children:
			"完善登录, 注册, 个人中心页面, 增加了用户信息的展示, 优化了用户体验, 修复了一些bug",
		className: "fade-in-element",
	},
	{
		label: "2023-07-27",
		children:
			"发布 v0.5.1 版本: 开通注册功能, 优化了注册页面, 优化了登录页面, 优化介绍页面的手机端展示, 增加个人性别,生日,星座的填写",
		className: "fade-in-element",
	},
	{
		label: "2023-07-28",
		children: "发布 v0.5.2 版本: 公测版正式上线, 启用 https://xiaoguang.fun",
		color: "red",
		className: "fade-in-element",
	},
	{
		label: "2023-07-29",
		children: (
			<>
				发布 v0.5.3 版本:
				<ul>
					<li>全新优化角色页 , 增加分类筛选</li>
					<li>优化头像展示, 用户无上传时则展示默认头像</li>
				</ul>
			</>
		),
		className: "fade-in-element",
	},
	{
		label: "2023-07-30",
		children:
			"发布 v0.5.4 版本: 发布小光青年版, 这个版本他能带来更专业性的回答",
		className: "fade-in-element",
	},
	{
		label: "2023-07-31",
		children:
			"发布 v0.6 版本: 发布 55个新角色更新, 总计至70个角色. 涵盖10个分类以上的不同需求",
		color: "green",
		className: "fade-in-element",
	},
	{
		label: "2023-08-01",
		children: "发布 v0.6.1 版本: 更新了角色图标, 增加了隐藏标题栏来扩大空间",
		className: "fade-in-element",
	},
	{
		label: "2023-08-03",
		children:
			"发布 v0.6.2 版本: 修复token 失效导致登录失败的错误, 修复无昵称导致登录按钮的错误, 优化翻译写手",
		className: "fade-in-element",
	},
	{
		label: "2023-08-05",
		children:
			"发布 v0.6.3 版本: 开通邀请注册功能, 邀请双方都能获得邀请点数, 用于兑换未来的小光会员服务和高级功能",
		className: "fade-in-element",
	},
	{
		label: "2023-08-06",
		children: "发布 v0.6.4 版本: 优化手机版菜单展示, 修复对话窗口bug",
		className: "fade-in-element",
	},
	{
		label: "2023-08-16",
		children: "发布 v0.6.5 版本: 增加token统计功能",
		className: "fade-in-element",
	},
	{
		label: "2023-08-19",
		children:
			"发布 v0.7.0 版本: 大幅度bug修复,增加会话热度统计, 角色排序, 优化用户登录注册, 优化全屏模式侧边栏",
		color: "red",
		className: "fade-in-element",
	},
	{
		label: "2023-08-21",
		children: "发布 v0.7.1 版本: 侧边栏展示修复, 系统bug修复",
		className: "fade-in-element",
	},
	{
		label: "2023-08-23",
		children:
			"发布 v0.7.2 版本: 修复注册页性别的bug, 修复对话session容易过期的bug",
		className: "fade-in-element",
	},
	{
		label: "2023-08-24",
		children:
			"发布 v0.7.3 版本: 修复小红书特殊emoji 字符会导致报错的错误, 修复一旦出现会话问题会导致无法登录的错误.\n 优化大量的提示词功能, 增强许多文案和分析的提示词能力",
		className: "fade-in-element",
	},
	{
		label: "2023-08-27",
		children:
			"发布 v0.8.0 版本: 推出重磅功能, 超级工作流. 在当今 智能 AI agent 还没有办法达到完美的时代, 不如引入人工的监工和指示, 手动来控制整个工作流",
		color: "red",
		className: "fade-in-element",
	},
	{
		label: "2023-08-31",
		children:
			"发布 v0.8.1 版本: 工作流增加 下一步按钮, 能快速将对话转移的下一个窗口",
		color: "red",
		className: "fade-in-element",
	},
	{
		label: "2023-09-01",
		children: "发布 v0.8.2 版本: 工作流能够在任务完成后自动跳到下一步",
		className: "fade-in-element",
	},
	{
		label: "2023-09-02",
		children: "发布 v0.8.3 版本: 工作流可以选择是自动跳转还是人工下一步",
		className: "fade-in-element",
	},
	{
		label: "2023-09-03",
		children: "发布 v0.8.4 版本: 增加初步语音播放和语音识别功能",
		className: "fade-in-element",
	},
	{
		label: "2023-09-06",
		children: "发布 v0.8.5 版本: 修复注册性别无法识别的bug, 优化图片",
		className: "fade-in-element",
	},
	{
		label: "2023-09-15",
		children: "发布 v0.8.6 版本: 样式优化, 侧边栏优化, 手机端导航栏优化",
		className: "fade-in-element",
	},
	{
		label: "2023-09-21",
		children:
			"发布 v0.8.7 版本: 优化未发送的文字保留功能, 修复聊天窗口自动滚动功能",
		className: "fade-in-element",
	},
	{
		label: "2023-10-7",
		children:
			"发布 v0.8.8 版本: 修复prompts页热度展示的bug, 优化个人中心, 优化系统管理后台,优化工作流,调整侧边栏展示, 优化手机端展示 ",
		className: "fade-in-element",
	},
	{
		label: "2023-10-23",
		children: (
			<>
				<ul>
					<li>发布 v0.9 版本: 联网查询, 网页浏览, 计算器插件, Dalle 画图</li>
					<li> 联网查询: 支持百度 谷歌 duckgo</li>
					<li>网页浏览: 支持不带有反爬虫的网页内容浏览并总结</li>
					<li>计算器插件: 支持简单的数学运算</li>
					<li>增加会员系统, 以上功能目前仍然免费测试</li>
					<li>优化了小光接口响应速度</li>
				</ul>
			</>
		),
		color: "red",
		className: "fade-in-element",
	},
	{
		label: "2023-11-15",
		children:
			" 发布 v1.0.0 版本: 增加知识库功能, 小光AI 迄今完成了大部分核心功能的开发, 正式进入1.0版本接下来就会对所有的核心功能进行全部的优化重做和重构, 达到全新的体验级别",
		color: "red",
		className: "fade-in-element",
	},
	{
		label: "2023-11-17",
		children: " 发布 v1.0.1 版本: 优化站点代码架构",
		color: "blue",
		className: "fade-in-element",
	},
	{
		label: "2023-11-23",
		children: " 发布 v1.1.0 版本: 完善会员流程, 开放小光币兑换, 修复一些bug",
		color: "red",
		className: "fade-in-element",
	},
	{
		label: "2023-11-24",
		children:
			" 发布 v1.2.0 版本: 优化全部角色页面, 增加助手和虚拟对话分栏. 助手分类重新构建",
		color: "blue",
		className: "fade-in-element",
	},
	{
		label: "2023-11-26",
		children: " 发布 v1.2.1 版本: 全面优化普通角色提示词, 提升回答质量和能力",
		color: "blue",
		className: "fade-in-element",
	},
	{
		label: "2023-11-30",
		children: " 发布 v1.2.2 版本: 修复工作流页面bug, 改进代码结构",
		color: "blue",
		className: "fade-in-element",
	},
	{
		label: "2023-12-04",
		children: " 发布 v1.3.0 版本: 增加基础对话角色及角色分类",
		color: "blue",
		className: "fade-in-element",
	},
	{
		label: "2023-12-07",
		children: " 发布 v1.3.1 版本: 修复工作流页面bug, 改进代码结构",
		color: "blue",
		className: "fade-in-element",
	},
	{
		label: "2023-12-13",
		children: " 发布 v1.3.2 版本: 改进插件调用逻辑, 调整页面交互UI",
		color: "blue",
		className: "fade-in-element",
	},
	{
		label: "2023-12-16",
		children: " 发布 v1.3.3 版本: 优化了对话配置流程和界面",
		color: "blue",
		className: "fade-in-element",
	},
	{
		label: "2023-12-21",
		children:
			" 发布 v1.4 版本: 代码结构重构, gpt4v 模型优化中, 图片上传功能优化中, 重新设计首页PC端和手机端视觉",
		color: "blue",
		className: "fade-in-element",
	},
	{
		label: "2023-12-21",
		children: (
			<>
				发布 v1.4.1 版本:
				<ul>
					<li>工作流模块代码重构, 精简代码结构, bug 修复"</li>
					<li> 新增角色: BRD 产品经理</li>
					<li>网页浏览: 支持不带有反爬虫的网页内容浏览并总结</li>
					<li>计算器插件: 支持简单的数学运算</li>
					<li>增加会员系统, 以上功能目前仍然免费测试</li>
					<li>优化了小光接口响应速度</li>
				</ul>
			</>
		),
		color: "blue",
		className: "fade-in-element",
	},
];

const Log = () => {
	useEffect(() => {
		const timelineItems = document.querySelectorAll(".fade-in-element");

		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("fade-in-animation");
				} else {
					entry.target.classList.remove("fade-in-animation");
				}
			});
		});

		timelineItems.forEach((item) => {
			observer.observe(item);
		});

		return () => {
			timelineItems.forEach((item) => {
				observer.unobserve(item);
			});
		};
	}, []);

	return (
		<div className={styles["home-page"]}>
			<Timeline mode="left" items={items} pending="On my road.." />
		</div>
	);
};

export default Log;
