"use client";
import React from "react";
import { useUserStore } from "../../store/user";
import { Form, Input, Button, message, Space } from "antd";

import Upload from "../../utils/upload";
import { updateProfile } from "../../api/backend/user";
import { server_url } from "../../constant";
import Link from "next/link";
import { updateUser } from "@/app/services/api/user";

const formItemLayout = {
	labelCol: {
		xs: { span: 24 },
		sm: { span: 6 },
	},
	wrapperCol: {
		xs: { span: 24 },
		sm: { span: 18 },
	},
};

const SecurityInfoTab = () => {
	const { user } = useUserStore();
	const [form] = Form.useForm();
	const [messageApi, contextHolder] = message.useMessage();

	const onFinish = (values: any) => {
		console.log("Received values of form: ", values);

		updateUser(values, user.id)
			.then((response) => {
				console.log("User info updated successfully:", response);
				// 在这里处理更新成功后的逻辑
				messageApi.open({
					type: "success",
					content: "小光已经记住了您的新信息",
					style: {
						marginTop: "10vh",
					},
				});
			})
			.catch((error) => {
				console.error("Failed to update user info:", error);
				// 在这里处理更新失败后的逻辑
				const errormsg = error.data.msg ? error.data.msg : error;

				messageApi.open({
					type: "error",
					content: errormsg,
					style: {
						marginTop: "10vh",
					},
				});
			});
	};
	return (
		<Form
			{...formItemLayout}
			form={form}
			name="password_edit"
			onFinish={onFinish}
			initialValues={{ username: user.username }}
			style={{ maxWidth: 900, minWidth: 300 }}
			scrollToFirstError
			labelAlign="left"
		>
			<Form.Item
				name="username"
				label="用户名"
				tooltip="无法修改"
				rules={[
					{ required: true, message: "请输入你的用户名", whitespace: false },
				]}
			>
				<Input disabled={true} />
			</Form.Item>

			<Form.Item
				name="password"
				label="密码"
				tooltip="密码会使用PBKDF2算法加密存储"
				rules={[
					{
						required: true,
						message: "请输入密码",
					},
				]}
				hasFeedback
			>
				<Input.Password />
			</Form.Item>

			<Form.Item
				name="confirm"
				label="密码确认"
				tooltip="密码会使用PBKDF2算法加密存储"
				dependencies={["password"]}
				hasFeedback
				rules={[
					{
						required: true,
						message: "请再次输入密码",
					},
					({ getFieldValue }) => ({
						validator(_, value) {
							if (!value || getFieldValue("password") === value) {
								return Promise.resolve();
							}
							return Promise.reject(new Error("两次输入的密码没有匹配"));
						},
					}),
				]}
			>
				<Input.Password />
			</Form.Item>
			<Form.Item
				wrapperCol={{
					xs: { span: 24, offset: 0 },
					sm: { span: 16, offset: 4 },
				}}
			>
				<div style={{ textAlign: "center" }}>
					{" "}
					<Space direction="horizontal" size="large">
						<Button type="primary" htmlType="submit">
							保存
						</Button>
						<Link href="/" passHref>
							<Button type="default">取消</Button>
						</Link>
					</Space>
				</div>
			</Form.Item>
			{contextHolder}
		</Form>
	);
};

export default SecurityInfoTab;
