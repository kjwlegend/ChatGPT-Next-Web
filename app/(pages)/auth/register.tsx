import React, { useState, useMemo, useCallback } from "react";
import {
	Form,
	Input,
	Select,
	Button,
	Checkbox,
	Modal,
	message as antdMessage,
} from "antd";
import Image from "next/image";
import { register, RegisterParams } from "@/app/services/api/auth";
import { useInviteCodeStore } from "@/app/store/auth";
import style from "@/app/components/welcome.module.scss";
import Disclaimer from "./disclaimer";

const { Option } = Select;

// 定义表单字段的接口
interface FormFields {
	username: string;
	password: string;
	confirm: string;
	email: string;
	mobile: string;
	prefix: string;
	nickname?: string;
	gender?: string;
	inviter_code?: string;
	agreement: boolean;
}

// 定义表单状态的接口
interface FormState {
	isSubmitting: boolean;
	open: boolean;
	visible: boolean;
}

// 表单布局配置
const formItemLayout = {
	labelCol: { xs: { span: 24 }, sm: { span: 6 } },
	wrapperCol: { xs: { span: 24 }, sm: { span: 18 } },
};

const tailFormItemLayout = {
	wrapperCol: { xs: { span: 24, offset: 0 }, sm: { span: 16, offset: 8 } },
};

// 自定义 Hook 用于管理表单逻辑
const useRegisterForm = (onRegisterSuccess: () => void) => {
	const [form] = Form.useForm<FormFields>();
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const inviteCodeStore = useInviteCodeStore();

	const onFinish = async (values: RegisterParams) => {
		try {
			setIsSubmitting(true);
			const result = await register(values);
			console.log(result);

			if (result.id != -1) {
				antdMessage.success("注册成功,请登录", 3);
				onRegisterSuccess();
			} else {
				const errormsg = result.msg || "您的密码太常见了, 请使用更复杂的密码";
				antdMessage.error(errormsg, 3);
			}
		} catch (error) {
			console.error(error);
			antdMessage.error("注册失败，请稍后再试", 3);
		}
		setIsSubmitting(false);
	};

	return { form, isSubmitting, onFinish, inviteCodeStore };
};

// 主组件
const App: React.FC<{ onRegisterSuccess: () => void }> = ({
	onRegisterSuccess,
}) => {
	const [open, setOpen] = useState<boolean>(false);
	const [visible, setVisible] = useState<boolean>(false);

	const { form, isSubmitting, onFinish, inviteCodeStore } =
		useRegisterForm(onRegisterSuccess);

	const handleButtonClick = useCallback(() => setVisible(true), []);
	const handleOk = useCallback(() => setVisible(false), []);
	const handleCancel = useCallback(() => setVisible(false), []);

	const selectChange = (value: string) =>
		form.setFieldsValue({ gender: value });

	const prefixSelector = useMemo(
		() => (
			<Form.Item name="prefix" noStyle>
				<Select style={{ width: 70 }}>
					<Option value="86">+86</Option>
				</Select>
			</Form.Item>
		),
		[],
	);

	return (
		<Form
			{...formItemLayout}
			form={form}
			name="register"
			onFinish={onFinish}
			initialValues={{
				prefix: "86",
				invite_code: inviteCodeStore.inviteCode,
				gender: "选择",
			}}
			style={{ maxWidth: 900, minWidth: 300 }}
			scrollToFirstError
			labelAlign="left"
		>
			<Form.Item
				name="username"
				label="用户名"
				rules={[
					{ required: true, message: "请输入你的用户名", whitespace: false },
				]}
			>
				<Input placeholder="请输入小写英文, 不要带有空格和特殊符号" />
			</Form.Item>

			<Form.Item
				name="password"
				label="密码"
				rules={[{ required: true, message: "请输入密码" }]}
				hasFeedback
			>
				<Input.Password />
			</Form.Item>

			<Form.Item
				name="confirm"
				label="密码确认"
				dependencies={["password"]}
				hasFeedback
				rules={[
					{ required: true, message: "请再次输入密码" },
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
				name="email"
				label="邮箱"
				rules={[
					{ type: "email", message: "您的邮箱格式不正确" },
					{ required: true, message: "请输入邮箱" },
				]}
			>
				<Input />
			</Form.Item>

			<Form.Item
				name="mobile"
				label="手机号"
				rules={[{ required: true, message: "请输入手机号" }]}
			>
				<Input addonBefore={prefixSelector} style={{ width: "100%" }} />
			</Form.Item>

			<Form.Item
				name="nickname"
				label="昵称"
				rules={[
					{ required: false, message: "请输入你的昵称", whitespace: true },
				]}
			>
				<Input placeholder="希望AI 怎么称呼您?" />
			</Form.Item>

			<Form.Item name="gender" label="性别">
				<Select
					style={{ width: 375 }}
					onChange={selectChange}
					options={[
						{ value: "notset", label: "选择" },
						{ value: "male", label: "男" },
						{ value: "female", label: "女" },
					]}
				/>
			</Form.Item>

			<Form.Item
				name="inviter_code"
				label="邀请码"
				rules={[{ required: false, message: "邀请双方都会获得奖励!" }]}
			>
				<Input placeholder="邀请双方都会获得奖励! " />
			</Form.Item>

			<p>
				若无邀请码, 可<a onClick={handleButtonClick}>加群获取</a>,
				不填也可完成注册, 只是无奖励
			</p>

			<Form.Item
				name="agreement"
				valuePropName="checked"
				rules={[
					{
						validator: (_, value) =>
							value
								? Promise.resolve()
								: Promise.reject(new Error("需要同意用户协议才能注册")),
					},
				]}
				{...tailFormItemLayout}
			>
				<Checkbox>
					同意{" "}
					<a href="#" onClick={() => setOpen(true)}>
						用户协议
					</a>
				</Checkbox>
			</Form.Item>

			<Form.Item
				wrapperCol={{
					xs: { span: 24, offset: 0 },
					sm: { span: 16, offset: 4 },
				}}
			>
				<Button block type="primary" htmlType="submit" disabled={isSubmitting}>
					立即注册
				</Button>
			</Form.Item>

			<Modal
				centered
				open={visible}
				onCancel={handleCancel}
				onOk={handleOk}
				width={800}
			>
				<div className={style.content}>
					<div className={style.banner}>
						<Image
							src="/assets/banner-2.png"
							alt="banner"
							fill
							objectFit="contain"
						/>
					</div>
					<p className={style.title}>进群可领取邀请码, 领取2个月免费福利</p>
				</div>
			</Modal>

			<Modal
				title="小光AI（测试版）个人信息保护规则"
				centered
				open={open}
				onOk={() => setOpen(false)}
				onCancel={() => setOpen(false)}
				width={1000}
				styles={{ body: { height: 500, overflow: "scroll" } }}
			>
				<Disclaimer />
			</Modal>
		</Form>
	);
};

export default React.memo(App);
