"use server"; // 服务器组件

import React from "react";
import { Layout, Timeline } from "antd";
import styles from "./updates.module.scss";
import FadeInEffect from "./FadeInEffect"; // 引入客户端组件

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
						她同样拥有极其复杂的提示词工, 能够根据你所申的职位, 提供简历修改,
						简历制作, 面试准备, 面试问答等多种能力.
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
			" 发布 v1.0.0 版本: 增加知识库功能, 小光AI 迄今完成了大部分核心功能的开发, 正式进入1.0版本接下来就会对所有的核心功能进行全部的优化和重构, 达到全新的体验级别",
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
		color: "red",
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
		color: "red",
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
		children:
			" 发布 v1.3.3 版本: 优化了对话配置流程和界面, 增加进阶周报生成器助手",
		color: "blue",
		className: "fade-in-element",
	},
	{
		label: "2023-12-21",
		children: (
			<>
				发布 v1.4 版本:
				<ul>
					<li>
						代码结构重构, gpt4v 模型优化中, 图片上传功能优化中,
						重新设计首页PC端和手机端视觉
					</li>
					<li> 新增角色: Typescript, Django, Vue 代码重构优化助手</li>
				</ul>
			</>
		),

		color: "red",
		className: "fade-in-element",
	},
	{
		label: "2023-12-22",
		children: (
			<>
				发布 v1.4.1 版本:
				<ul>
					<li>工作流模块代码重构, 精简代码结构, bug 修复</li>
					<li> 新增角色: BRD 产品经理</li>
				</ul>
			</>
		),
		color: "blue",
		className: "fade-in-element",
	},
	{
		label: "2023-12-23",
		children: (
			<>
				发布 v1.4.2 版本:
				<ul>
					<li>bug 修复: 修复了工作流任务排序的问题</li>
					<li>优化: 调整了工作流输入框图标的动效</li>
				</ul>
			</>
		),
		color: "blue",
		className: "fade-in-element",
	},
	{
		label: "2023-12-25",
		children: (
			<>
				发布 v1.5.0 版本, 小光说:
				<div>
					虽然提示词是解锁GPT的秘密武器,
					可是太过于深奥所以大伙都没法获得想要的输出.
					为了让大伙更好的体验小光AI的威力,
					小光特地联系了小亮同学,在圣诞夜疯狂加班,
					做出了自动生成优化提示词的功能! 为此小亮又少了13根头发{" "}
				</div>
				<div>
					另: 全面将模型升级为最新版GPT4和3.5, 针对插件的使用进行了质量提升
				</div>
			</>
		),
		color: "red",
		className: "fade-in-element",
	},
	{
		label: "2023-12-28",
		children: (
			<>
				发布 v1.6.0 版本, 小光说:
				<div>
					随着 Midjourney 6.0 的发布, 小光AI也绝对不能落下时代, 现在已经接入最新
					MJ 6.0 版本, 而且改进体验模式, 不需要在输入繁琐的discord指令,
					直接在小光AI的聊天窗口进行切换模型, 就可以直接发送提示词画图,
					但由于官方限制, 目前不支持中文提示词
				</div>
			</>
		),
		color: "red",
		className: "fade-in-element",
	},
	{
		label: "2023-12-29",
		children: (
			<>
				发布 v1.6.1 版本, 小光说:
				<div>
					身为一个AI, 怎么能不支持中文? 小光已经迫使小亮同学日更代码500行,
					已经加入了全语言智能翻译, 同时加入MJ 变化和放大功能.
					还有非常多的细节正在高速迭代优化中
				</div>
			</>
		),
		color: "blue",
		className: "fade-in-element",
	},
	{
		label: "2023-12-29",
		children: (
			<>
				发布 v1.6.2 版本, 小光说:
				<div>小bug修复, 改进放大和变换时候的随机提示词</div>
			</>
		),
		color: "blue",
		className: "fade-in-element",
	},
	{
		label: "2023-12-30",
		children: (
			<>
				发布 v1.6.3 版本, 小光说:
				<ul>
					<li>
						{" "}
						我们的超级角色团成员终于又增加了一名 琳琳, 她是双鱼座,
						一位对绘画有着无尽热情的艺术家.
						在每一笔勾勒中，既有对美好生活的向往，也有对深邃思考的体现。 座右铭:
						&quot;色彩是心灵的语言&quot;
					</li>
					<li>开通了图床CDN 服务, 现在下载图片更迅速了!</li>
					<li>大幅度的代码构改进</li>
					<li>绘图现在能够快速的进行尺寸的选择</li>
				</ul>
			</>
		),
		color: "blue",
		className: "fade-in-element",
	},
	{
		label: "2024-1-3",
		children: (
			<>
				发布 v1.6.4 版本, 小光说:
				<ul>
					<li>
						想要欣赏别人的画作? 来画廊看一看吧! , 你所有通过 琳琳 所创作的画作,
						都会保存在这里. 你可以随时查看, 也可以下载到本地.
					</li>
					<li>同时也支持快速复制好看画作的的提示词.</li>
				</ul>
			</>
		),
		color: "blue",
		className: "fade-in-element",
	},
	{
		label: "2024-1-6",
		children: (
			<>
				发布 v1.6.5 版本, 小光说:
				<ul>
					<li>原本画廊的加载速度较慢, 我们重新更换了国内的阿里云的CDN服务.</li>
				</ul>
			</>
		),
		color: "blue",
		className: "fade-in-element",
	},
	{
		label: "2024-1-17",
		children: (
			<>
				发布 v1.7.0 版本, 小光说:
				<ul>
					<li>开通消息多设备同步功能</li>
				</ul>
			</>
		),
		color: "red",
		className: "fade-in-element",
	},
	{
		label: "2024-1-21",
		children: (
			<>
				发布 v1.7.1 版本, 小光说:
				<ul>
					<li>增加了绘图设置模块, 当你使用琳琳绘图时他会显示</li>
					<li>优化了画廊的展示, 用户可以选择是否公开自己的作画了</li>
					<li>调整琳琳的绘制的图片大小</li>
					<li>优化了手机版的布局</li>
				</ul>
			</>
		),
		color: "blue",
		className: "fade-in-element",
	},
	{
		label: "2024-1-22",
		children: (
			<>
				发布 v1.7.2 版本, 小光说:
				<ul>
					<li>修复手机版返回按钮失效的问题</li>
				</ul>
			</>
		),
		color: "blue",
		className: "fade-in-element",
	},
	{
		label: "2024-1-25",
		children: (
			<>
				发布 v1.8.0 版本, 小光说:
				<ul>
					<li>文件上传功能重构, 新增文档管理</li>
					<li>优化由于token过期导致的登录失败问题</li>
					<li>优化langchain 版本,更新到最新v.0.1.0</li>
				</ul>
			</>
		),
		color: "red",
		className: "fade-in-element",
	},
	{
		label: "2024-02-15",
		children: (
			<>
				发布 v2.0.0 版本, 小光说:
				<ul>
					<li>发布了AI 实验室, 开启了双AI Agent 时代!</li>
					<li>
						当两个AI开始进行对话时, 他们会互相学习, 互相提升,
						到底能产生什么样的火花?
					</li>
				</ul>
			</>
		),
		color: "red",
		className: "fade-in-element",
	},
	{
		label: "2024-02-21",
		color: "green",
		children: (
			<>
				发布 V2.0.1 版本, 小光说:
				<ul>
					<li>1. 登录页面 支持 用户名 / 手机号 登录 </li>
					<li>2. 增加忘记密码 重置功能</li>
					<li>
						3. 对话窗口列表, 后续会按照 最后更新时间排序.
						(即最新消息会出现在列表顶端)
					</li>
					<li>
						4. 如果使用 小光(通用) , 在对话一定轮数后, 会自动生成对话窗口标题
					</li>
				</ul>
			</>
		),
	},
	{
		label: "2024-03-07",
		color: "blue",
		children: (
			<>
				发布 V2.1.0 版本, 小光说:
				<ul>
					<li>重构了工作流功能, 加入了工作流列表, 现在可以保存多个工作流了!</li>
					<li>原本工作流可以在 对话中显示, 现在工作流的对话会单独存在</li>
					<li>修复了对话页登录过期会一直闪退的bug</li>
				</ul>
			</>
		),
	},
	{
		label: "2024-03-08",
		color: "blue",
		children: (
			<>
				发布 V2.1.1 版本, 小光说:
				<ul>
					<li>修复普通对话列表的bug</li>
				</ul>
			</>
		),
	},
	{
		label: "2024-03-10",
		color: "blue",
		children: (
			<>
				发布 V2.1.2 版本, 小光说:
				<ul>
					<li>增加工作流对话的标题和描述更新</li>
				</ul>
			</>
		),
	},
	{
		label: "2024-03-23",
		color: "red",
		children: (
			<>
				发布 V2.2.0 版本, 小光说:
				<ul>
					<li>发布目前最强的塔罗应用</li>
					<p>
						为什么我敢说这是第一的塔罗应用？ ​<br />
						我​从15年前既开始进入西方神秘学领域，研究金色黎明也叫黄金黎明学派体系，不同于现在所谓的偏向于心理学领域的图卡玩家，
						我属于最早一批国内普及卡巴拉，生命之树，黑白魔法仪式的相对专业的神秘学研究者。​
						<br />
						​早期的门罗吧，星体投射吧吧主。​
						<br />
						从2012扬升时代开始，国内终于开始诞生了大批灵性研究者，也少不了大量的神棍​
						<br />
						我​10年前开启了专业塔罗咨询。不同于娱乐性质的塔罗玩法，我们更多偏向于神秘学体系，结合12宫的塔罗占卜。
						​ 小双塔罗，不同于其他的单纯的AI大模型， 或者塔罗应用。​
						<br />
						我将我的历史经验和研究，对所有的牌义和阵的解读都做出了特定的修正，成就这一套赛博塔罗体系。
					</p>
				</ul>
			</>
		),
	},
	{
		label: "2024-03-27",
		color: "blue",
		children: (
			<>
				发布 V2.2.1 版本, 小光说:
				<ul>
					<li>更新塔罗体验: </li>
					<li>优化了牌阵标签, 加强了牌阵筛选逻辑</li>
					<li>修改单牌解读模型, 增强解读速度</li>
					<li>增加解读等待提示</li>
					<li>增加占卜次数签到奖励</li>
				</ul>
			</>
		),
	},
	{
		label: "2024-04-09",
		color: "red",
		children: (
			<>
				发布 V2.3 版本, 小光说:
				<ul>
					<li>更新角色自建和上传功能, 开放用户建立角色啦 </li>
					<li>限时活动: 自建角色可获得小光币奖励(小光币可以兑换会员)</li>
					<li>修改单牌解读模型, 增强解读速度</li>
				</ul>
			</>
		),
	},
	{
		label: "2024-04-28",
		color: "blue",
		children: (
			<>
				发布 V2.3.1 版本, 小光说:
				<ul>
					<li>修复登录循环的bug</li>
					<li>优化登录弹窗</li>
				</ul>
			</>
		),
	},
	{
		label: "2024-05-06",
		color: "blue",
		children: (
			<>
				发布 V2.3.2 版本, 小光说:
				<ul>
					<li>修复工作流无法自动下一步的bug</li>
					<li>修复工作流个性化标题无法保存的bug</li>
					<li>优化部分页面响应速度</li>
				</ul>
			</>
		),
	},
	{
		label: "2024-05-08",
		color: "blue",
		children: (
			<>
				发布 V2.3.3 版本, 小光说:
				<ul>
					<li>优化了模型选择, 增加模型积分消耗提示</li>
				</ul>
			</>
		),
	},

	{
		label: "2024-05-13",
		color: "red",
		children: (
			<>
				发布 V2.4.0 版本, 小光说:
				<ul>
					<li>
						小光AI 终于增加了深色模式, 虽然光爸自身很少使用深色,
						但黑暗中的光似乎更被人需要. 经过5天的UI和色彩搭配设计,
						终于完成了深色模式第一版本.
					</li>
					<li>优化代码结构</li>
				</ul>
			</>
		),
	},
	{
		label: "2024-05-27",
		color: "blue",
		children: (
			<>
				发布 V2.4.1 版本, 小光说:
				<ul>
					<li>修复一些深色模式bug</li>
					<li>优化页面 SEO 标题</li>
					<li>移除 顶部导航的福利</li>
					<li>更新页面结构</li>
				</ul>
			</>
		),
	},
	{
		label: "2024-05-28",
		color: "blue",
		children: (
			<>
				发布 V2.4.2 版本, 小光说:
				<ul>
					<li>更新界面图标 , UI优化</li>
				</ul>
			</>
		),
	},
	{
		label: "2024-05-29",
		color: "blue",
		children: (
			<>
				发布 V2.4.3 版本, 小光说:
				<ul>
					<li>分离了回答联想功能, 用户可以自己选择是否要激活关联问答</li>
					<li>拆开用户记忆属性, 用户可以自行决定是否要增加个性化记忆</li>
				</ul>
			</>
		),
	},
	{
		label: "2024-06-05",
		color: "red",
		children: (
			<>
				发布 V2.5.0 版本, 小光说:
				<ul>
					<li>支持图像视觉模型, 拥有极高精度的回答</li>
				</ul>
			</>
		),
	},
	{
		label: "2024-06-26",
		color: "blue",
		children: (
			<>
				发布 V2.5.1 版本, 小光说:
				<ul>
					<li>优化了深色模式</li>
					<li>修复chat页循环跳转的bug</li>
					<li>优化了对话列表的排序</li>
					<li>优化了对话框的底色</li>
					<li>更新站点菜单</li>
				</ul>
			</>
		),
	},
	{
		label: "2024-10-01",
		color: "red",
		children: (
			<>
				发布 V3.0.0 版本, 小光说:
				<ul>
					<li>重大更新：系统全面重构，带来多项革新性变化</li>
					<li>
						对话次数升级：
						<ul>
							<li>
								免费用户：从原本的总计200次对话额度，升级为每日签到后可获得200次对话机会（普通模型）
							</li>
							<li>会员用户：每天可享有1000次对话额度（普通模型）</li>
						</ul>
					</li>
					<li>
						AI模式升级：原双AI模式现已进化为无限制AI模式，突破对话限制，激发更多创意可能
					</li>
					<li>工作流功能全面优化：提供更流畅、更智能的任务处理体验</li>
					<li>全新助手模式：为用户提供更精准、更贴心的智能辅助</li>
					<li>单体对话窗口优化：带来更直观、更高效的交互体验</li>
					<li>
						功能重构预告：
						<ul>
							<li>AI绘画功能：正在进行全面重做，即将带来更强大的创作体验</li>
							<li>
								知识库管理：正在优化中，未来将为用户提供更便捷的知识管理方式
							</li>
							<li>
								提示词管理：正在重新设计，旨在提供更智能、更个性化的提示服务
							</li>
						</ul>
					</li>
					<li>
						注意：由于系统进行了大规模重构，部分功能可能暂时无法使用或与之前的版本有所不同。
						我们正在努力完善所有功能，感谢您的理解和支持！
					</li>
				</ul>
			</>
		),
		className: "fade-in-element",
	},
	{
		label: "2024-10-15",
		color: "green",
		children: (
			<>
				发布 V3.0.1 版本, 小光说:
				<ul>
					<li>修复了获取服务器自定义智能体数据导致会话错误的bug</li>
					<li>优化了登出时对cookie的更新机制</li>
					<li>修复了sidebar在新增对话时没有自动选中最新建立的对话的bug</li>
					<li>修复了插件状态没有更新的bug</li>
				</ul>
			</>
		),
		className: "fade-in-element",
	},
];

const Log = () => {
	return (
		<Layout className={styles["home-page"]}>
			<FadeInEffect /> {/* 使用淡入效果组件 */}
			<Timeline mode="left" items={items} pending="On my road.." reverse />
		</Layout>
	);
};

export default Log;
