import React, { useState, useEffect } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Modal, Upload } from "antd";
import type { RcFile, UploadProps } from "antd/es/upload";
import type { UploadFile } from "antd/es/upload/interface";
import { oss_base, server_url } from "../../../constant";
import axios from "axios";

const getBase64 = (file: RcFile): Promise<string> =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = (error) => reject(error);
	});

interface AppProps {
	avatar?: string | null;
	onImgListChange: (imgList: any[]) => void;
}

const App: React.FC<AppProps> = ({ avatar, onImgListChange }) => {
	const imglist: any = [];
	const [previewOpen, setPreviewOpen] = useState(false);
	const [previewImage, setPreviewImage] = useState("");
	const [previewTitle, setPreviewTitle] = useState("");
	const [fileList, setFileList] = useState<UploadFile[]>([]);

	useEffect(() => {
		if (avatar) {
			setFileList([
				{
					uid: "-1",
					name: "image.png",
					status: "done",
					url: oss_base + avatar,
				},
			]);
		}
	}, [avatar]);

	const handleCancel = () => setPreviewOpen(false);

	const handlePreview = async (file: UploadFile) => {
		if (!file.url && !file.preview) {
			file.preview = await getBase64(file.originFileObj as RcFile);
		}

		setPreviewImage(file.url || (file.preview as string));
		setPreviewOpen(true);
		setPreviewTitle(
			file.name || file.url!.substring(file.url!.lastIndexOf("/") + 1),
		);
	};

	const handleUpload = async (options: any) => {
		const { onSuccess, onError, file } = options;

		const formData = new FormData();
		formData.append("file", file);
		formData.append("folderName", "user/avatar");

		try {
			const response = await axios.post("/api/file/upload", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			onSuccess(response.data);
		} catch (error) {
			onError({ error });
		}
	};

	const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
		setFileList(newFileList);
		const newImgList = newFileList
			.filter((file) => file.response)
			.map((file) => file.response.fileName);
		onImgListChange(newImgList);
	};

	const uploadButton = (
		<div>
			<PlusOutlined />
			<div style={{ marginTop: 8 }}>Upload</div>
		</div>
	);
	return (
		<>
			<Upload
				customRequest={handleUpload}
				listType="picture-circle"
				fileList={fileList}
				onPreview={handlePreview}
				onChange={handleChange}
			>
				{fileList.length >= 1 ? null : uploadButton}
			</Upload>
			<Modal
				open={previewOpen}
				title={previewTitle}
				footer={null}
				onCancel={handleCancel}
			>
				<img
					alt="example"
					style={{ width: "100%" }}
					src={`${oss_base}/${previewImage}`}
				/>
			</Modal>
		</>
	);
};

export default App;
