import React, { useState } from "react";
import {
	Table,
	Switch,
	Button,
	Progress,
	Pagination,
	message,
	Tag,
} from "antd";
import {
	UploadOutlined,
	DeleteOutlined,
	PlayCircleFilled,
	PlayCircleOutlined,
} from "@ant-design/icons";
import type { UploadProps } from "antd";
import Upload from "./upload";
import styles from "./knowledge.module.scss"; // 引入样式模块
import { removeEmbedding } from "../../api/backend/embedding";
import { getEmbedding } from "../../api/backend/embedding";
import { useUserStore } from "../../store";

// 定义表格数据接口
interface DataType {
	id: number;
	name: string;
	type: string;
	updatedAt: string;
	status: number;
	size: number;
}

const Knowledge: React.FC = () => {
	const { user } = useUserStore();
	const username = user.username;

	const [data, setData] = useState<DataType[]>([
		{
			id: 1,
			name: "example.pdf",
			type: "个人知识库",
			updatedAt: "2023-04-01",
			status: 1, // 0: 未构建, 1: 已构建
			size: 1024,
		},
	]);

	const columns = [
		{
			title: "id",
			dataIndex: "id",
			key: "id",
		},
		{
			title: "文件名",
			dataIndex: "name",
			key: "name",
		},
		{
			title: "类型",
			dataIndex: "type",
			key: "type",
			render: (text: string) => <Tag color="blue">{text}</Tag>,
		},
		{
			title: "最后更新时间",
			dataIndex: "updatedAt",
			key: "updatedAt",
		},
		{
			title: "文档大小",
			dataIndex: "size",
			key: "size",
			render: (size: number) => `${(size / 1024).toFixed(2)} KB`, // 假设size是以字节为单位
		},
		{
			title: "构建消耗积分",
			key: "points",
			render: (text: string, record: DataType) =>
				Math.floor(record.size / 10000),
		},
		{
			title: "状态",
			dataIndex: "status",
			key: "status",
			render: (status: number) => {
				if (status === 0) {
					return (
						<Tag icon={<PlayCircleOutlined />} color="default">
							未构建
						</Tag>
					);
				} else if (status === 1) {
					return <Tag color="success">已构建</Tag>;
				}
			},
		},
		{
			title: "操作",
			key: "action",
			render: (text: string, record: any) => (
				<span>
					<Button
						icon={<DeleteOutlined />}
						onClick={() => {
							message.warning(`${record.name} 文件已经被移除`);
							// remove embedding
							const data = {
								username: username, // 假设 username 已经定义
								file_name: record.name,
								delete_type: "file",
							};
							const res = removeEmbedding(data);
							console.log(res);
						}}
					/>
				</span>
			),
		},
	];

	const handleUploadSuccess = (file: any) => {
		message.success(`${file.name} 上传成功`);
		const newData = [...data];
		console.log(newData);
		newData.push({
			id: 2,
			name: file.name,
			type: "个人知识库",
			updatedAt: "2023-04-01",
			status: 0,
			size: file.size,
		});
		setData(newData);
	};

	return (
		<div className={styles.container}>
			<Upload onSuccess={handleUploadSuccess} />

			<Table
				className={styles.table}
				columns={columns}
				dataSource={data}
				pagination={false}
				rowKey="id"
			/>
			<Pagination
				className={styles.pagination}
				defaultCurrent={1}
				total={data.length}
				pageSize={15}
			/>
		</div>
	);
};

export default Knowledge;
