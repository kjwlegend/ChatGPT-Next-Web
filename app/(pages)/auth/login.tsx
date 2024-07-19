import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Modal } from "antd";
import useAuth from "@/app/hooks/useAuth";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { message } from "antd";
import { LoginResult } from "@/app/types";
import { use, useState, useEffect } from "react";
import { User } from "@/app/store";
import { useUserStore } from "@/app/store";
import { useChatStore } from "@/app/store";

import PasswordResetModal from "./PasswordResetModal";
import { query } from "express";
// 登录页面

export default function Login() {
	const { loginHook } = useAuth(); // 获取登录方法
	const [messageApi, contextHolder] = message.useMessage();
	const router = useRouter();
	const path = usePathname();
	const param = useSearchParams();
	const from = param.get("from");

	const userStore = useUserStore();
	const chatStore = useChatStore();

	console.log("path", from, path, param);

	const [user, setUser] = useState<User | null>(null);

	// a modal to show password reset box
	const [showResetPassword, setShowResetPassword] = useState(false);

	const [historyStack, setHistoryStack] = useState([] as string[]);

	const showModal = () => {
		setShowResetPassword(true);
	};

	const handleCancel = () => {
		setShowResetPassword(false);
	};

	const onFinish = async (values: any) => {
		try {
			// 调用登录接口
			messageApi.open({
				type: "loading",
				content: "登录初始化中..",
				duration: 0,
				key: "loading",
			});

			await loginHook(values); // 不再需要返回特定结果

			messageApi.destroy("loading");

			// 登录成功后跳转
			messageApi.open({
				type: "success",
				content: "登录成功, 正在跳转..",
			});

			setTimeout(() => {
				// push to the previous page
				// check router path, if it's login, then push to chats
				// if it's not login, then push to the previous page
				// if it's empty, then push to chats

				if (from && from !== "/auth") {
					router.push(from);
				} else {
					router.push("/chats");
				}
			}, 1000);
		} catch (error: any) {
			// 失败提示
			console.log("Received values of error: ", error);
			messageApi.destroy("loading");
			messageApi.open({
				type: "error",
				content: `登录失败: ${error.message || error}`,
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
