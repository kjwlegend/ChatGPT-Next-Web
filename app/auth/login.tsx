import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Modal } from "antd";
import useAuth from "../hooks/useAuth";
import { useRouter } from "next/navigation";
import { message } from "antd";
import { LoginResult } from "../types";
import { use, useState, useEffect } from "react";
import { User } from "../store";
import { ChatSessionData, getChatSession } from "@/app/api/backend/chat";
import { createEmptyMask } from "@/app/store/mask";
import { useUserStore } from "../store";
import { useChatStore } from "../store";
import { ChatSession } from "../store";
import { UpdateChatSessions } from "../services/chatService";
import PasswordResetModal from "./PasswordResetModal";
// 登录页面

export default function Login() {
	const { loginHook } = useAuth(); // 获取登录方法
	const [messageApi, contextHolder] = message.useMessage();

	const router = useRouter();

	const userStore = useUserStore();
	const chatStore = useChatStore();

	const [user, setUser] = useState<User | null>(null);

	//  a modal to show password reset box
	const [showResetPassword, setShowResetPassword] = useState(false);

	const showModal = () => {
		setShowResetPassword(true);
	};

	const handleCancel = () => {
		setShowResetPassword(false);
	};

	useEffect(() => {
		const fetchAndStoreSessions = async () => {
			const param: ChatSessionData = {
				user: user?.id || 0,
				limit: 30,
			};
			try {
				const chatSessionList = await getChatSession(param);
				// console.log("chatSessionList", chatSessionList.data);
				// 直接使用 chatStore 的方法更新 sessions
				UpdateChatSessions(chatSessionList.data);
			} catch (error) {
				console.log("get chatSession list error", error);
			}
		};
		fetchAndStoreSessions();
	}, [user]);

	const onFinish = async (values: any) => {
		try {
			// 调用登录接口

			messageApi.open({
				type: "loading",
				content: "登录初始化中..",
				duration: 0,
				key: "loading",
			});

			const result: any = await loginHook(values);
			// console.log("Received values of form: ", values);
			// console.log("Received values of result: ", result);
			messageApi.destroy("loading");

			if (result) {
				// 登录成功后跳转
				messageApi.open({
					type: "success",
					content: "登录成功, 正在跳转..",
				});

				setUser(result.data.user);
				//
				setTimeout(() => {
					router.push("/chats");
				}, 1000);
			}
		} catch (error) {
			// 失败提示
			console.log("Received values of error: ", error);
			messageApi.destroy("loading");
			messageApi.open({
				type: "error",
				content: `登录失败: ${error}`,
			});
		}
	};

	return (
		<Form
			name="normal_login"
			className="login-form"
			initialValues={{ remember: true }}
			style={{ maxWidth: 900, minWidth: 300 }}
			onFinish={onFinish}
			labelAlign="left"
		>
			<Form.Item
				name="username"
				rules={[{ required: true, message: " 请输入用户名!" }]}
			>
				<Input
					prefix={<UserOutlined className="site-form-item-icon" />}
					placeholder="支持用户名或者11位手机号登录"
				/>
			</Form.Item>
			<Form.Item
				name="password"
				rules={[{ required: true, message: "请输入密码!" }]}
			>
				<Input
					prefix={<LockOutlined className="site-form-item-icon" />}
					type="password"
					placeholder="密码"
				/>
			</Form.Item>
			<Form.Item>
				<Form.Item name="remember" valuePropName="checked" noStyle>
					<Checkbox>2天内保持登录</Checkbox>
				</Form.Item>
			</Form.Item>

			<Form.Item>
				<Button
					block
					type="primary"
					htmlType="submit"
					className="login-form-button"
				>
					登录
				</Button>
			</Form.Item>
			{/* 忘记密码 link */}
			<Form.Item>
				{/* 点击后会显示model */}
				<Button type="link" onClick={showModal}>
					忘记密码?
				</Button>

				{/* 重置密码的model */}
				<PasswordResetModal
					visible={showResetPassword}
					onCancel={handleCancel}
				/>
			</Form.Item>

			{contextHolder}
		</Form>
	);
}
