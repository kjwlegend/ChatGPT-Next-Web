"use client";
import React, { useState, useEffect } from "react";
import {
	Table,
	Switch,
	Button,
	Progress,
	Pagination,
	message,
	Tag,
	Popconfirm,
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
import { removeEmbedding } from "@/app/api/backend/embedding";
import { getEmbedding } from "@/app/api/backend/embedding";
import { useUserStore } from "@/app/store";
import { getDocs } from "@/app/api/backend/embedding";

// 定义表格数据接口
interface DataType {
	id: number;
	name: string;
	type: string;
	updatedAt: string;
	status: boolean | "inprogress" | "error";
	size: number;
	points: number;
}

export enum knowledge_group {
	PERSONAL = 1,
	TEAM = 2,
	AGENT = 3,
	PUBLIC = 4,
}

//  将收到的数据转换为表格数据
const transformData = (data: any) => {
	// data structure
	// "data": {
	// 	"id": 21,
	// 	"name": "武侠.txt",
	// 	"description": null,
	// 	"file_meta": {
	// 		"username": "kjwlegend",
	// 		"filename": "武侠.txt",
	// 		"upload_date": "2024-01-22 23:56:34",
	// 		"category": "knowledge",
	// 		"knowledge_group": "4"
	// 	},
	// 	"knowledge_group": 4,
	// 	"cost": 0,
	// 	"file_path": "media/knowledge/kjwlegend/武侠.txt",
	// 	"file_type": "txt",
	// 	"content_length": 706,
	// 	"chunk_number": 0,
	// 	"embedding_status": false,
	// 	"create_date": "2024-01-22 23:56:34",
	// 	"update_date": "2024-01-22 23:56:34",
	// 	"user": 3
	// }

	// knowledge_group: 1 个人知识库
	// knowledge_group: 2 团队知识库
	// knowledge_group: 3 代理知识库
	// knowledge_group: 4 公共知识库
	// create a function to transform knowledge group into string

	const transformKnowledgeGroup = (knowledge_group: number) => {
		switch (knowledge_group) {
			case 1:
				return "个人知识库";
			case 2:
				return "团队知识库";
			case 3:
				return "代理知识库";
			case 4:
				return "公共知识库";
			default:
				return "未知知识库";
		}
	};

	const newData: DataType[] = [];
	data.forEach((item: any) => {
		newData.push({
			id: item.id,
			name: item.name,
			type: transformKnowledgeGroup(item.knowledge_group),
			updatedAt: item.update_date,
			status: item.embedding_status,
			size: item.content_length,
			points: item.cost,
		});
	});
	return newData;
};

const Knowledge: React.FC = () => {
	const userStore = useUserStore.getState();
	const user = userStore.user;
	const username = user.username;
	const userid = user.id;
	const [total, setTotal] = useState(0);

	const [data, setData] = useState<DataType[]>([
		{
			id: 1,
			name: "example.pdf",
			type: "个人知识库",
			updatedAt: "2023-04-01",
			status: false,
			size: 1024,
			points: 0,
		},
	]);
	const [originalData, setOriginalData] = useState<DataType[]>([]); // 用于存储从服务器获取的原始数据
	const [displayData, setDisplayData] = useState<DataType[]>([]); // 用于存储当前页面显示的数据

	const [currentPage, setCurrentPage] = useState(1); // 添加一个状态来保存当前页码
	const pageSize = 10; // 每页显示的数据量

	const fetchData = async (page: number, pageSize: number) => {
		const data = {
			user_id: userid,
			page: page,
			limit: pageSize,
		};

		const res = await getDocs(data);
		try {
			console.log(res);
			const newData = transformData(res.data);
			setOriginalData(newData); // 更新原始数据状态
			setDisplayData(newData.slice(0, pageSize)); // 更新当前页面显示的数据
			setTotal(res.total);
		} catch (error) {
			console.log(error);
		}
	};

	const handleUploadSuccess = (file: any) => {
		fetchData(currentPage, pageSize);
	};

	const handleEmbedings = async (id: number) => {
		console.log(id);
		const data = {
			knowledge_id: id,
		};
		message.info("开始构建");
		// 设定当前行数的状态为构建中

		const newData = originalData.map((item) => {
			if (item.id === id) {
				item.status = "inprogress";
			}
			return item;
		});

		setOriginalData(newData);

		const res = await getEmbedding(data);

		if (res.status_code === 200) {
			message.success("构建成功");
			fetchData(currentPage, pageSize);
		} else {
			message.error("构建失败, 文件不支持,或请重新尝试");
			// 设定当前行数的状态为构建失败
			const newData = originalData.map((item) => {
				if (item.id === id) {
					item.status = "error";
				}
				return item;
			});

			setOriginalData(newData);
		}
	};
	const handleRemoveEmbedings = async (record: DataType) => {
		// remove embedding
		const data = {
			username: username, // 假设 username 已经定义
			file_id: record.id,
			delete_type: "file",
		};
		// 将文件从当前页面移除

		const res = await removeEmbedding(data);
		message.warning(`${record.name} 文件已经被移除`);

		// update list
		fetchData(currentPage, pageSize);
	};
	const handlePaginationChange = (page: number) => {
		setCurrentPage(page); // 更新当前页码
		// console.log("page", page);

		// // 根据当前页码和每页显示的数据量计算需要显示的数据范围
		// const startIndex = (page - 1) * pageSize;
		// const endIndex = startIndex + pageSize;

		// // 从原始数据中获取当前页面的数据
		// const newDisplayData = originalData.slice(startIndex, endIndex);

		// // 更新当前页面显示的数据
		// setDisplayData(newDisplayData);

		fetchData(page, pageSize);
	};

	useEffect(() => {
		fetchData(currentPage, pageSize);
	}, []);

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
			title: "文本长度",
			dataIndex: "size",
			key: "size",
			render: (size: number) => `${size} 字符`,
		},
		{
			title: "构建消耗积分",
			key: "points",
			dataIndex: "points",
		},
		{
			title: "状态",
			dataIndex: "status",
			key: "status",
			render: (_: any, record: DataType) => {
				if (record.status === false) {
					return (
						<Tag
							icon={<PlayCircleOutlined />}
							color="default"
							style={{ cursor: "pointer" }}
							onClick={() => {
								handleEmbedings(record.id);
							}}
						>
							未构建
						</Tag>
					);
				} else if (record.status === true) {
					return <Tag color="success">已构建</Tag>;
				}
				if (record.status === "inprogress") {
					return (
						<Tag icon={<PlayCircleFilled />} color="processing">
							构建中
						</Tag>
					);
				} else if (record.status === "error") {
					return (
						<Tag
							color="error"
							style={{ cursor: "pointer" }}
							onClick={() => {
								handleEmbedings(record.id);
							}}
						>
							构建失败
						</Tag>
					);
				}
			},
		},
		{
			title: "操作",
			key: "action",
			render: (text: string, record: any) => (
				<Popconfirm
					title="删除后重新构建"
					description="会再次消耗积分,是否删除?"
					onConfirm={() => {
						handleRemoveEmbedings(record);
					}}
					// onCancel="取消"
					okText="是的"
					cancelText="取消"
				>
					<Button
						icon={<DeleteOutlined />}
						// onClick={() => {
						// 	handleRemoveEmbedings(record);
						// }}
					/>
				</Popconfirm>
			),
		},
	];

	return (
		<div className={styles.container}>
			<Upload onSuccess={handleUploadSuccess} />

			<Table
				className={styles.table}
				columns={columns}
				dataSource={displayData}
				pagination={false}
				rowKey="id"
			/>
			<Pagination
				className={styles.pagination}
				defaultCurrent={currentPage}
				total={total}
				pageSize={pageSize}
				onChange={handlePaginationChange}
			/>
		</div>
	);
};

export default Knowledge;
