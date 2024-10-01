"use client";
import React from "react";
import { useUserStore } from "../../store/user";
import { Col, Row, Statistic, Divider, Typography, QRCode } from "antd";
import styles from "./profile.module.scss";

const { Paragraph } = Typography;

const InvitationInfoTab = () => {
	const { user } = useUserStore();
	const { invite_code, invite_count, virtual_currency } = user;

	const baseUrl = new URL(window.location.href).origin;
	const inviteLink = `${baseUrl}/auth?i=${invite_code}`;

	return (
		<div>
			<Row justify="center" gutter={16} style={{ textAlign: "center" }}>
				<Col xs={12} sm={8}>
					<Statistic title="邀请人数" value={invite_count} />
				</Col>
				<Col xs={12} sm={8}>
					<Statistic title="小光币" value={virtual_currency} />
				</Col>
				<Col xs={12} sm={8}>
					<Statistic title="专属id" value={invite_code || ""} />
				</Col>
			</Row>
			<Divider />
			<div>
				<Row gutter={16}>
					<Col xs={24} sm={14}>
						<p className={styles["label-title"]}>邀请方法1 - 链接:</p>
						<Paragraph className={styles["link"]} copyable>
							{inviteLink}
						</Paragraph>
					</Col>
					<Col xs={24} sm={10}>
						<p className={styles["label-title"]}>方法2 - 使用专属二维码:</p>
						<QRCode errorLevel="H" value={inviteLink} />
					</Col>
				</Row>
				<Divider />
				<p className={styles["label-title"]}>规则说明:</p>
				<p>
					每一位通过您的链接注册小光，双方都会获得10小光币,
					邀请点数可以用来兑换未来的小光会员服务。
				</p>
			</div>
		</div>
	);
};

export default InvitationInfoTab;
