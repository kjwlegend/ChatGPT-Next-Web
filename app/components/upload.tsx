import React, { useState } from "react";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { Button, message, Upload } from "antd";
import type { UploadFile } from "antd/lib/upload/interface";

const App: React.FC = () => {
	// 储存fileList
	const [fileList, setFileList] = useState<UploadFile<any>[]>([]);

	const props: UploadProps = {
		name: "file",
		accept: ".txt, .doc, .docx, .pdf, .md , .csv, .xls, .xlsx, .ppt, .pptx",
		action: "https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188",
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
				".ppt",
				".pptx",
			].some((ext) => file.name.endsWith(ext));
			if (!isAccepted) {
				message.error(
					"只能上传.txt, .doc, .docx, .pdf, .md , .csv, .xls, .xlsx, .ppt, .pptx文件",
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
			if (info.file.status === "done") {
				message.success(`${info.file.name} file uploaded successfully`);
				// 上传成功后，对文件进行处理
			} else if (info.file.status === "error") {
				message.error(`${info.file.name} file upload failed.`);
			}
			// update fileList
			setFileList(info.fileList);
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

	console.log(fileList);

	return (
		<>
			<Upload {...props} showUploadList={true}>
				<Button icon={<UploadOutlined />}>上传文档</Button>
			</Upload>
		</>
	);
};

export default App;
