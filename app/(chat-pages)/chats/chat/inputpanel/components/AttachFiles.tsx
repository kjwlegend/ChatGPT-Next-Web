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

export function AttachFiles({
	attachFiles,
	setAttachFiles,
}: {
	attachFiles: FileInfo[];
	setAttachFiles: (images: FileInfo[]) => void;
}) {
	return (
		<>
			{attachFiles.length != 0 && (
				<div className={styles["attach-files"]}>
					{attachFiles.map((file, index) => {
						return (
							<div
								key={index}
								className={styles["attach-file"]}
								title={file.originalFilename}
							>
								<div className={styles["attach-file-info"]}>
									{file.originalFilename}
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
