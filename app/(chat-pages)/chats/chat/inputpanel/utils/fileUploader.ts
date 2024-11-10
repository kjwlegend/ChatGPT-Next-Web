import { useDebouncedCallback } from "use-debounce";
import React from "react";

import { oss_base } from "@/app/constant";
import { FileInfo } from "@/app/client/platforms/utils";

import {
	PauseOutlined,
	PlayCircleOutlined,
	DeleteOutlined,
	HeartTwoTone,
} from "@ant-design/icons";

import { ChatMessage, ChatSession } from "@/app/types/chat";

import { compressImage } from "@/app/utils/chat/chat";
import { ClientApi } from "@/app/client/api";

import { createFromIconfontCN } from "@ant-design/icons";
import { User } from "@/app/store";

type FileProcessFunction<T> = (file: File) => Promise<T>;
type UploadCallback<T> = (files: T[]) => void;

function uploadFiles<T>(
	acceptTypes: string,
	processFile: FileProcessFunction<T>,
	callback: UploadCallback<T>,
) {
	const fileInput = document.createElement("input");
	fileInput.type = "file";
	fileInput.accept = acceptTypes;
	fileInput.multiple = true;

	fileInput.onchange = (event: any) => {
		const files = event.target.files;
		const fileDatas: T[] = [];
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			processFile(file)
				.then((fileData) => {
					fileDatas.push(fileData);
					if (fileDatas.length === 3 || fileDatas.length === files.length) {
						callback(fileDatas);
					}
				})
				.catch((e) => {
					console.error(e);
				});
		}
	};
	fileInput.click();
}

// 文件路径: src/components/YourComponent.tsx

export const uploadImage = (setAttachImages: (images: string[]) => void) => {
	const attachImages: string[] = [];
	const api = new ClientApi(); // 创建 API 实例

	const processImage = async (file: File): Promise<string> => {
		const uploadedFileInfo = await api.file.upload(file, "chat-upload"); // 上传文件
		return uploadedFileInfo.filePath; // 返回上传后的文件路径
	};

	uploadFiles<string>(
		"image/png, image/jpeg, image/webp, image.heic, image.heif",
		processImage,
		(images) => {
			attachImages.push(...images);
			if (attachImages.length > 3) {
				attachImages.splice(3, attachImages.length - 3);
			}
			setAttachImages(attachImages);
		},
	);
};

export const uploadFile = async (
	file: File,
	session: ChatSession,
	userinfo: User,
): Promise<FileInfo> => {
	console.log("uploadFile", file);
	const api = new ClientApi();
	let fileInfo: FileInfo = {
		originalFilename: file.name,
		fileName: "",
		filePath: "",
		size: file.size,
		status: "uploading", // 设置为上传中
	};

	// 上传文件
	console.log("uploadingFile", file);
	fileInfo = await api.file.upload(file, "RAG");
	fileInfo.status = "uploading"; // 上传完成，设置为转码中

	let partial;
	try {
		partial = await api.llm.createRAGStore({
			chatSessionId: session.id,
			fileInfos: [fileInfo],
			userinfo: userinfo.username,
		});
		fileInfo.partial = partial;
		fileInfo.status = "done"; // 转码成功
	} catch (error) {
		console.error("转码失败:", error);
		fileInfo.status = "error"; // 转码失败
	}

	return fileInfo;
};

interface HandlePasteOptions {
	attachImages: string[];
	setAttachImages: (images: string[]) => void;
	setUploading: (uploading: boolean) => void;
	maxImages?: number;
}

export const handlePasteEvent = async (
	event: React.ClipboardEvent<HTMLTextAreaElement>,
	options: HandlePasteOptions,
) => {
	const {
		attachImages,
		setAttachImages,
		setUploading,
		maxImages = 3,
	} = options;

	const items = (event.clipboardData || (window as any).clipboardData).items;
	const api = new ClientApi(); // 创建 API 实例
	for (const item of items) {
		if (item.kind === "file" && item.type.startsWith("image/")) {
			event.preventDefault();
			const file = item.getAsFile();
			if (file) {
				const images: string[] = [...attachImages];
				images.push(
					...(await new Promise<string[]>((res, rej) => {
						setUploading(true);
						const imagesData: string[] = [];
						api.file
							.upload(file, "chat-upload") // 上传文件
							.then((uploadedFileInfo) => {
								imagesData.push(uploadedFileInfo.filePath); // 添加上传后的文件路径
								setUploading(false);
								res(imagesData);
							})
							.catch((e) => {
								setUploading(false);
								rej(e);
							});
					})),
				);

				if (images.length > maxImages) {
					images.splice(maxImages);
				}
				setAttachImages(images);
			}
		}
	}
};
