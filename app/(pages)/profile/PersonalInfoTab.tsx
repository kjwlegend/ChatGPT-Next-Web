"use client";
import React from "react";
import { useUserStore } from "../../store/user";
import styles from "./profile.module.scss";
import { Form, Input, Button, message, Select, DatePicker } from "antd";
import Upload from "./components/upload";
import dayjs from "dayjs";
import { updateUser } from "@/app/services/api/user";

import BasicInfoForm from "./components/BasicInfoForm";
import AccountInfo from "./components/AccountInfo";
import UsageInfo from "./components/UsageInfo";

const { Option } = Select;
const ProfilePage = () => {
	const { user } = useUserStore();

	return (
		<div className={styles.profileContainer}>
			<div className={styles.leftColumn}>
				<BasicInfoForm user={user} />
			</div>
			<div className={styles.rightColumn}>
				<AccountInfo user={user} />

				<UsageInfo user={user} />
			</div>
		</div>
	);
};

export default ProfilePage;
