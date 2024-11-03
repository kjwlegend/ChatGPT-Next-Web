"use client";

import { MindMapData } from "../../types";
import { useExport } from "../../hooks/useExport";
import { useImport } from "../../hooks/useImport";
import styles from "./styles.module.scss";

interface DataControlsProps {
	data: MindMapData;
	onDataImport: (data: MindMapData) => void;
}

export const DataControls = ({ data, onDataImport }: DataControlsProps) => {
	const { handleJSONExport, handleMarkdownExport, handleImageExport } =
		useExport(data);
	const {
		fileInputRef,
		mdFileInputRef,
		handleFileChange,
		triggerJSONImport,
		triggerMarkdownImport,
	} = useImport(onDataImport);

	return (
		<div className={styles.controls}>
			<button onClick={handleJSONExport} className={styles.button}>
				导出 JSON
			</button>
			<button onClick={triggerJSONImport} className={styles.button}>
				导入 JSON
			</button>
			<button onClick={handleMarkdownExport} className={styles.button}>
				导出 Markdown
			</button>
			<button onClick={triggerMarkdownImport} className={styles.button}>
				导入 Markdown
			</button>
			<button onClick={handleImageExport} className={styles.button}>
				导出图片
			</button>
			<input
				ref={fileInputRef}
				type="file"
				accept=".json"
				onChange={(e) => handleFileChange(e, false)}
				style={{ display: "none" }}
			/>
			<input
				ref={mdFileInputRef}
				type="file"
				accept=".md"
				onChange={(e) => handleFileChange(e, true)}
				style={{ display: "none" }}
			/>
		</div>
	);
};
