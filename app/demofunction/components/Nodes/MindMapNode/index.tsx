"use client";

import { memo, useState, useRef, useEffect } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { MindMapNodeData } from "../../../types";
import styles from "./styles.module.scss";

type MindMapNodeProps = NodeProps<MindMapNodeData> & {
	isEditing?: boolean;
	onStartEditing: (nodeId: string) => void;
	onStopEditing: () => void;
	onLabelChange?: (nodeId: string, newLabel: string) => void;
	onAddChild?: (parentId: string) => void;
	onDelete?: (nodeId: string) => void;
};

const sourceHandleStyle = { background: "#4a9eff" };
const targetHandleStyle = { background: "rgba(43, 48, 51, 0.2)" };

export const MindMapNode = memo(
	({
		id,
		data,
		selected,
		isConnectable,
		isEditing,
		onStartEditing,
		onStopEditing,
		onLabelChange,
		onAddChild,
		onDelete,
	}: MindMapNodeProps) => {
		const [label, setLabel] = useState(data?.label || "");
		const [showMenu, setShowMenu] = useState(false);
		const inputRef = useRef<HTMLInputElement>(null);
		const menuRef = useRef<HTMLDivElement>(null);

		useEffect(() => {
			if (data?.label) {
				setLabel(data.label);
			}
		}, [data?.label]);

		useEffect(() => {
			if (isEditing && inputRef.current) {
				inputRef.current.focus();
			}
		}, [isEditing]);

		const handleDoubleClick = (evt: React.MouseEvent) => {
			evt.preventDefault();
			evt.stopPropagation();
			onStartEditing(id);
		};

		const handleKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
			if (evt.key === "Enter" || evt.key === "Escape") {
				evt.preventDefault();

				if (evt.key === "Enter" && onLabelChange) {
					onLabelChange(id, label);
				} else if (evt.key === "Escape") {
					setLabel(data?.label || "");
					onStopEditing();
				}
			}
		};

		const handleBlur = () => {
			if (onLabelChange && label !== data?.label) {
				onLabelChange(id, label);
			} else {
				onStopEditing();
			}
		};

		const handleContextMenu = (evt: React.MouseEvent) => {
			evt.preventDefault();
			evt.stopPropagation();
			setShowMenu(true);
		};

		return (
			<div
				className={`${styles.node} ${selected ? styles.selected : ""}`}
				onDoubleClick={handleDoubleClick}
				onContextMenu={handleContextMenu}
			>
				{/* Left Handle (Target) */}
				<Handle
					type="target"
					position={Position.Left}
					isConnectable={isConnectable}
					style={targetHandleStyle}
					id="left"
				/>

				<div className={styles.content}>
					{isEditing ? (
						<input
							ref={inputRef}
							value={label}
							onChange={(e) => setLabel(e.target.value)}
							onKeyDown={handleKeyDown}
							onBlur={handleBlur}
							className={styles.nodeInput}
							autoFocus
						/>
					) : (
						<div className={styles.label}>{data?.label || ""}</div>
					)}
				</div>

				{/* Right Handle (Source) */}
				<Handle
					type="source"
					position={Position.Right}
					isConnectable={isConnectable}
					style={sourceHandleStyle}
					id="right"
				/>

				{showMenu && (
					<div ref={menuRef} className={styles.contextMenu}>
						<button
							onClick={() => {
								onAddChild?.(id);
								setShowMenu(false);
							}}
						>
							添加子节点
						</button>
						<button
							onClick={() => {
								onDelete?.(id);
								setShowMenu(false);
							}}
						>
							删除节点
						</button>
					</div>
				)}
			</div>
		);
	},
);

MindMapNode.displayName = "MindMapNode";
