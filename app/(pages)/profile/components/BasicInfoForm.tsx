import React from "react";
import { Form, Input, Button, Select, DatePicker, message } from "antd";
import Upload from "./upload";
import dayjs from "dayjs";
import styles from "../profile.module.scss";
import { updateUser } from "@/app/services/api/user";
import { useUserStore } from "../../../store/user";

const { Option } = Select;
import { oss_base } from "@/app/constant";
interface BasicInfoFormProps {
	user: any;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ user }) => {
	const [form] = Form.useForm();
	const { setUser } = useUserStore();

	const onFinish = (values: any) => {
		// 处理生日日期格式
		if (values.birthday) {
			values.birthday = dayjs(values.birthday).format("YYYY-MM-DD");
		}

		updateUser(values, user.id)
			.then((response) => {
				if (response.code === 4000) {
					message.error("更新失败: " + response.msg);
				} else {
					setUser({ ...user, ...values });
					message.success("个人信息更新成功");
				}
			})
			.catch((error) => {
				message.error("更新失败: " + (error.data?.msg || error.message));
			});
	};

	const handleImgListChange = (imgList: any[]) => {
		form.setFieldsValue({ avatar: imgList[0] });
	};

	return (
		<div className={styles.basicInfo}>
			<h2>基本信息</h2>
			<Form
				form={form}
				name="profile_form"
				onFinish={onFinish}
				initialValues={{
					nickname: user.nickname,
					gender: user.gender,
					birthday: user.birthday ? dayjs(user.birthday) : undefined,
					zodiac: user.zodiac,
				}}
				layout="vertical"
			>
				<Form.Item name="avatar" label="头像">
					<Upload avatar={user.avatar} onImgListChange={handleImgListChange} />
				</Form.Item>
				<Form.Item name="nickname" label="昵称">
					<Input />
				</Form.Item>
				<Form.Item name="gender" label="性别">
					<Select>
						<Option value="0">请选择</Option>
						<Option value="1">男</Option>
						<Option value="2">女</Option>
					</Select>
				</Form.Item>
				<Form.Item name="birthday" label="生日">
					<DatePicker style={{ width: "100%" }} />
				</Form.Item>
				<Form.Item name="zodiac" label="星座">
					<Select>
						<Option value="0">请选择</Option>
						<Option value="摩羯座">摩羯座</Option>
						<Option value="水瓶座">水瓶座</Option>
						<Option value="双鱼座">双鱼座</Option>
						<Option value="白羊座">白羊座</Option>
						<Option value="金牛座">金牛座</Option>
						<Option value="双子座">双子座</Option>
						<Option value="巨蟹座">巨蟹座</Option>
						<Option value="狮子座">狮子座</Option>
						<Option value="处女座">处女座</Option>
						<Option value="天秤座">天秤座</Option>
						<Option value="天蝎座">天蝎座</Option>
						<Option value="射手座">射手座</Option>
					</Select>
				</Form.Item>
				<Form.Item>
					<Button type="primary" htmlType="submit">
						保存更改
					</Button>
				</Form.Item>
			</Form>
		</div>
	);
};

export default BasicInfoForm;
