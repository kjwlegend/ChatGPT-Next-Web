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

export function AttachImages({
	attachImages,
	setAttachImages,
}: {
	attachImages: string[];
	setAttachImages: (images: string[]) => void;
}) {
	return (
		<>
			{attachImages.length !== 0 && (
				<div className={styles["attach-images"]}>
					{attachImages.map((image, index) => (
						<div
							key={index}
							className={styles["attach-image"]}
							style={{ backgroundImage: `url("${image}")` }}
						>
							<div className={styles["attach-image-mask"]}>
								<DeleteImageButton
									deleteImage={() => {
										setAttachImages(attachImages.filter((_, i) => i !== index));
									}}
								/>
							</div>
						</div>
					))}
				</div>
			)}
		</>
	);
}
