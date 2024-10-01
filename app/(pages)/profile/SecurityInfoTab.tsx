"use client";
import React from "react";
import { useUserStore } from "../../store/user";
import { Form, Input, Button, message, Space } from "antd";
import { updateUser } from "@/app/services/api/user";
import Link from "next/link";

const SecurityInfoTab = () => {
	const { user } = useUserStore();
	const [form] = Form.useForm();
	const [messageApi, contextHolder] = message.useMessage();

	const onFinish = (values: any) => {
		updateUser(values, user.id)
			.then(() => {
				messageApi.open({ type: "success", content: "信息更新成功" });
			})
			.catch((error) => {
				messageApi.open({ type: "error", content: error.data.msg || "更新失败" });
			});
	};

	return (
		<Form form={form} name="password_edit" onFinish={onFinish}>
			<Form.Item name="username" label="用户名" tooltip="无法修改">
				<Input disabled />
			</Form.Item>
			<Form.Item name="password" label="密码" rules={[{ required: true, message: "请输入密码" }]} >
				<Input.Password />
			</Form.Item>
			<Form.Item name="confirm" label="密码确认" dependencies={["password"]} rules={[{ required: true, message: "请再次输入密码" }]} >
				<Input.Password />
			</Form.Item>
			<Form.Item>
				<Space>
					<Button type="primary" htmlType="submit">保存</Button>
					<Link href="/" passHref>
						<Button type="default">取消</Button>
					</Link>
				</Space>
			</Form.Item>
			{contextHolder}
		</Form>
	);
};

export default SecurityInfoTab;
