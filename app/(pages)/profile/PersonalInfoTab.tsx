"use client";
import React from "react";
import { useState } from "react";
import { useUserStore } from "../../store/user";
import { Form, Input, Button, message, Select } from "antd";
import Upload from "../../utils/upload";
import dayjs from "dayjs";
import styles from "./profile.module.scss";
import type { DatePickerProps } from "antd";
import { DatePicker, Space } from "antd";

import { UploadOutlined } from "@ant-design/icons";
import { updateProfile } from "../../api/backend/user";
import { server_url } from "../../constant";
import Link from "next/link";

const formItemLayout = {
	labelCol: {
		xs: { span: 24 },
		sm: { span: 4 },
	},
	wrapperCol: {
		xs: { span: 24 },
		sm: { span: 20 },
	},
};

const PersonalInfoTab = () => {
	const { user, setUser } = useUserStore();

	const [form] = Form.useForm(); // 创建表单实例
	const [messageApi, contextHolder] = message.useMessage();

	const onFinish = (values: any) => {
		console.log("Received values of form: ", values);

		messageApi.open({
			type: "loading",
			content: "新资料提交中..",
			duration: 0,
			key: "loading",
		});

		updateProfile(user.id, values)
			.then((response) => {
				console.log("User info updated successfully:", response);
				// 在这里处理更新成功后的逻辑
				setUser({ ...user, ...values });
				messageApi.destroy("loading");
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
				messageApi.destroy("loading");

				messageApi.open({
					type: "error",
					content: errormsg,
					style: {
						marginTop: "10vh",
					},
				});
			});
	};
	const handleImgListChange = (imgList: any[]) => {
		form.setFieldsValue({ avatar: imgList[0] }); // 设置表单的 avatar 字段为新的 img
	};

	const avatar = user?.avatar ? user?.avatar : null; // 获取 user.avatar
	const onChange: DatePickerProps["onChange"] = (date, dateString) => {
		console.log(date, dateString);
		// 将更新后的日期设置到表单的值中
		// 注意：这里需要根据实际的表单字段名进行设置
		// 假设日期字段名为 "birthday"，则可以使用 setFieldsValue 方法来设置
		form.setFieldsValue({ birthday: dateString });
		console.log(server_url, process.env.BASE_URL);
	};

	const handlezodiacChange = (value: any) => {
		console.log(`selected ${value}`);
		form.setFieldsValue({ zodiac: value });
	};

	return (
		<Form
			{...formItemLayout}
			form={form}
			name="personal_info"
			style={{ width: "100%", maxWidth: 900, minWidth: 300 }}
			onFinish={onFinish}
			initialValues={{
				nickname: user.nickname,
				avatar: user.avatar,
				gender: user.gender,
				birthday: "2000-10-10",
				zodiac: user.zodiac ? user.zodiac : "0",
			}}
		>
			<Form.Item
				name="avatar"
				style={{ textAlign: "center", width: "100%" }}
				wrapperCol={{ span: 28 }}
			>
				<Upload avatar={avatar} onImgListChange={handleImgListChange} />
			</Form.Item>
			<Form.Item label="昵称" name="nickname">
				<Input />
			</Form.Item>

			{/* 性别 */}
			<Form.Item name="gender" label="性别">
				<Select
					options={[
						{ value: "0", label: "请选择" },
						{ value: "1", label: "男" },
						{ value: "2", label: "女" },
					]}
				/>
			</Form.Item>

			<Form.Item label="生日" name="birthday">
				<div>
					<DatePicker
						onChange={onChange}
						style={{ width: "100%" }}
						allowClear
						size="large"
						defaultPickerValue={dayjs(
							user.birthday ? user.birthday : "2000-01-01",
							"YYYY-MM-DD",
						)}
						defaultValue={
							user.birthday ? dayjs(user.birthday, "YYYY-MM-DD") : undefined
						}
					/>
				</div>
			</Form.Item>
			<Form.Item label="星座" name="zodiac">
				<Select
					onChange={handlezodiacChange}
					options={[
						{ value: "0", label: "请选择" },
						{ value: "摩羯座", label: "摩羯座" },
						{ value: "水瓶座", label: "水瓶座" },
						{ value: "双鱼座", label: "双鱼座" },
						{ value: "白羊座", label: "白羊座" },
						{ value: "金牛座", label: "金牛座" },
						{ value: "双子座", label: "双子座" },
						{ value: "巨蟹座", label: "巨蟹座" },
						{ value: "狮子座", label: "狮子座" },
						{ value: "处女座", label: "处女座" },
						{ value: "天秤座", label: "天秤座" },
						{ value: "天蝎座", label: "天蝎座" },
						{ value: "射手座", label: "射手座" },
					]}
				/>
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

export default PersonalInfoTab;
