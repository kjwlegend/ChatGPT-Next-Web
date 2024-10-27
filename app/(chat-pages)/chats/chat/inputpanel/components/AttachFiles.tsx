"use client";
import { useDebouncedCallback } from "use-debounce";
import React, {
	useState,
	useRef,
	useEffect,
	useMemo,
	Fragment,
	useContext,
	use,
	useCallback,
} from "react";

import styles from "../../chats.module.scss";

import { createFromIconfontCN } from "@ant-design/icons";
export const IconFont = createFromIconfontCN({
	scriptUrl: "//at.alicdn.com/t/c/font_4149808_awi8njsz19j.js",
});

import { DeleteImageButton, DeleteFileButton } from "../components/chatactions";
import { FileInfo } from "@/app/client/platforms/utils";
import {
	FileTextOutlined,
	FilePptOutlined,
	FileMarkdownOutlined,
	FileWordOutlined,
	CheckCircleOutlined,
	CloseCircleOutlined,
	LoadingOutlined,
} from "@ant-design/icons"; // 示例图标

const getFileIcon = (file: FileInfo) => {
	switch (file.originalFilename.split(".").pop()) {
		case "ppt":
		case "pptx":
			return <FilePptOutlined />;
		case "txt":
			return <FileTextOutlined />;
		case "md":
			return <FileMarkdownOutlined />;
		case "doc":
		case "docx":
			return <FileWordOutlined />;
		default:
			return <FileTextOutlined />; // 默认图标
	}
};

const getStatusIcon = (status: string) => {
	switch (status) {
		case "transcoding":
			return <LoadingOutlined />;
		case "success":
			return <CheckCircleOutlined style={{ color: "green" }} />;
		case "failed":
			return <CloseCircleOutlined style={{ color: "red" }} />;
		default:
			return null;
	}
};

export function AttachFiles({
	attachFiles,
	setAttachFiles,
	loading,
}: {
	attachFiles: FileInfo[];
	setAttachFiles: (images: FileInfo[]) => void;
	loading: boolean;
}) {
	return (
		<>
			{attachFiles.length !== 0 && (
				<div className={styles["attach-files"]}>
					{attachFiles.map((file, index) => {
						return (
							<div
								key={index}
								className={styles["attach-file"]}
								title={file.originalFilename}
							>
								<div className={styles["attach-file-icon"]}>
									{getFileIcon(file)} {/* 显示文件类型图标 */}
								</div>
								<div className={styles["attach-file-info"]}>
									{file.originalFilename}
								</div>
								<div className={styles["attach-file-status"]}>
									{getStatusIcon(file.status || "")} {/* 显示状态图标 */}
								</div>
								<div className={styles["attach-file-mask"]}>
									<DeleteFileButton
										deleteFile={() => {
											setAttachFiles(attachFiles.filter((_, i) => i !== index));
										}}
									/>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</>
	);
}
