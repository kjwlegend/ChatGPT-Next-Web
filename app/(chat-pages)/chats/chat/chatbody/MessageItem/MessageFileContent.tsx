import React from "react";
import { FilePdfFilled, FileFilled, FileExcelFilled } from "@ant-design/icons";

interface FileInfo {
	fileName: string;
	originalFilename: string;
}

interface MessageFileContentProps {
	fileInfos: FileInfo[];
}

const getFileIcon = (filePath: string) => {
	const extension = filePath.split(".").pop()?.toLowerCase();
	switch (extension) {
		case "pdf":
			return <FilePdfFilled />;
		case "doc":
		case "docx":
		case "md":
		case "txt":
			return <FileFilled />;
		case "xls":
		case "xlsx":
			return <FileExcelFilled />;
		default:
			return <FileFilled />;
	}
};

const MessageFileContent: React.FC<MessageFileContentProps> = ({
	fileInfos,
}) => {
	return (
		<div className="mt-3 space-y-1.5">
			{fileInfos.map((fileInfo, index) => {
				const fileIcon = getFileIcon(fileInfo.fileName);

				return (
					<div
						key={index}
						className="group flex items-center gap-2 rounded-md border border-secondary/5 bg-gradient-to-r from-secondary/5 to-primary/5 p-1.5 text-xs text-muted-foreground"
					>
						<div className="flex h-5 w-5 items-center justify-center rounded bg-secondary/10">
							{fileIcon}
						</div>

						<div className="min-w-0 flex-1">
							<div className="truncate font-medium">
								{fileInfo.originalFilename}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default MessageFileContent;
