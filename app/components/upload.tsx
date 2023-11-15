import React, { useState } from "react";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { Button, message, Upload } from "antd";
import type { UploadFile } from "antd/lib/upload/interface";
import { server_url } from "../constant";
import { removeEmbedding } from "../api/embedding";
import { getEmbedding } from "../api/embedding";
import { useUserStore } from "../store";

const App: React.FC = () => {
	// 储存fileList
	const [fileList, setFileList] = useState<UploadFile<any>[]>([]);

	// get username
	const { user } = useUserStore();
	const username = user.username;

	const props: UploadProps = {
		name: "file",
		accept: ".txt, .doc, .docx, .pdf, .md , .csv, .xls, .xlsx",
		action: `${server_url}/api/gpt/embeddings/`,
		method: "post",
		data: {
			username: username,
			knowledge_group: "personal",
		},
		headers: {
			authorization: "authorization-text",
		},
		fileList: fileList,
		beforeUpload: (file) => {
			const isAccepted = [
				".txt",
				".doc",
				".docx",
				".pdf",
				".md",
				".csv",
				".xls",
				".xlsx",
			].some((ext) => file.name.endsWith(ext));
			if (!isAccepted) {
				message.error(
					"只能上传.txt, .doc, .docx, .pdf, .md , .csv, .xls, .xlsx, 文件",
				);
			}
			// max file size is 10MB
			const isLt10M = file.size / 1024 / 1024 < 10;
			if (!isLt10M) {
				message.error("文件大小不能超过10MB");
			}
			return isAccepted && isLt10M;
		},
		onChange(info) {
			// 上传文件时的回调函数

			if (info.file.status !== "uploading") {
				console.log(info.file, info.fileList);
			}
			// uploading status
			if (info.file.status === "uploading") {
				message.loading(`${info.file.name} 文件上传中, 稍后会进行知识库构建`);
			}
			if (info.file.status === "done") {
				message.success(`${info.file.name} 文件上传且知识库构建成功`);
				// 上传成功后，对文件进行处理
			} else if (info.file.status === "error") {
				message.error(`${info.file.name} 文件上传或者知识库构建失败`);
			}
			// update fileList
			setFileList(info.fileList);
		},

		onRemove(file) {
			// remove file
			message.warning(`${file.name} 文件已经被移除`);
			// remove embedding
			const data = {
				username: username,
				file_name: file.name,
				delete_type: "file",
			};
			const res = removeEmbedding(data);
			console.log(res);
		},
		progress: {
			strokeColor: {
				"0%": "#108ee9",
				"100%": "#87d068",
			},
			strokeWidth: 3,
			format: (percent) => percent && `${parseFloat(percent.toFixed(2))}%`,
		},
	};

	// console.log(fileList);

	return (
		<>
			<Upload {...props} showUploadList={true}>
				<Button icon={<UploadOutlined />}>上传文档</Button>
			</Upload>
		</>
	);
};

export default App;
