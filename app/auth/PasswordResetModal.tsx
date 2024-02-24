import React, { useState } from "react";
import { Modal, Form, Input, Button, message, Steps } from "antd";

import { resetPasswordAPI, changePasswordAPI } from "../api/auth";

import styles from "./auth.module.scss";

const { Step } = Steps;

// 定义 props 的 TypeScript 接口
interface PasswordResetModalProps {
	visible: boolean;
	onCancel: () => void;
}

const PasswordResetModal = ({ visible, onCancel }: PasswordResetModalProps) => {
	// 1. useState

	const [form] = Form.useForm();
	const [currentStep, setCurrentStep] = useState(0);
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSendClick = async () => {
		try {
			setLoading(true);
			const values = await form.validateFields();
			const data = {
				email: values.email,
			};
			const response = await resetPasswordAPI(data);
			setLoading(false);
			if (response.status == "success") {
				message.success("验证码已发送到您的邮箱");
				setEmail(values.email);
				setCurrentStep(1);
			} else {
				message.error(response.message);
			}
		} catch (error) {
			setLoading(false);
			message.error("发送失败，请检查邮箱是否正确");
		}
	};

	const handleChangePasswordClick = async () => {
		try {
			setLoading(true);
			const values = await form.validateFields();
			const data = {
				email: email,
				reset_code: values.code,
				new_password: values.newPassword,
			};
			const response = await changePasswordAPI(data);
			setLoading(false);
			if (response.status == "success") {
				message.success("密码修改成功");
				setCurrentStep(2);
			} else {
				message.error(response.message);
			}
		} catch (error) {
			setLoading(false);
			message.error("密码修改失败，请检查输入是否正确");
		}
	};

	const previouseStep = () => {
		setCurrentStep(currentStep - 1);
	};
	const nextStep = () => {
		setCurrentStep(currentStep + 1);
	};

	return (
		<Modal
			title="重置密码"
			open={visible}
			onCancel={onCancel}
			// cancelText="取消"
			footer={null}
		>
			<Steps current={currentStep}>
				<Step title="输入邮箱" />
				<Step title="输入新密码" />
				<Step title="修改完成" />
			</Steps>
			<Form form={form} layout="vertical" style={{ marginTop: "24px" }}>
				{currentStep === 0 && (
					<>
						<Form.Item
							name="email"
							rules={[
								{ required: true, message: "请输入邮箱地址", type: "email" },
							]}
						>
							<Input placeholder="请输入邮箱" />
						</Form.Item>

						<Form.Item className={styles["modal-actions"]}>
							<Button
								type="primary"
								onClick={handleSendClick}
								loading={loading}
							>
								发送
							</Button>
							{/* 
							<Button
								type="default"
								onClick={nextStep}
								style={{ marginLeft: 8 }}
							>
								next
							</Button> */}
						</Form.Item>
					</>
				)}
				{currentStep === 1 && (
					<>
						<Form.Item
							name="code"
							rules={[{ required: true, message: "请输入验证码" }]}
						>
							<Input placeholder="请输入验证码" />
						</Form.Item>
						<Form.Item
							name="newPassword"
							rules={[{ required: true, message: "请输入新密码" }]}
						>
							<Input.Password placeholder="请输入新密码" />
						</Form.Item>
						{/* 上一步 */}

						<div className={styles["modal-actions"]}>
							<Button onClick={previouseStep} type="default">
								上一步
							</Button>
							<Button
								type="primary"
								onClick={handleChangePasswordClick}
								loading={loading}
							>
								修改密码
							</Button>
						</div>
					</>
				)}
				{currentStep === 2 && (
					<div style={{ textAlign: "center", padding: "24px" }}>
						<p>您的密码已成功修改！</p>
					</div>
				)}
			</Form>
		</Modal>
	);
};

export default PasswordResetModal;
