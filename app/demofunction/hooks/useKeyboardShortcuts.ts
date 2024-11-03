import { useEffect } from "react";
import { Node } from "../types";

export const useKeyboardShortcuts = (
	selectedNodes: Node[],
	editingNodeId: string | null,
	handlers: {
		handleAddParent: (nodeId: string) => void;
		handleAddChild: (nodeId: string) => void;
		handleAddSibling: (nodeId: string) => void;
		handleDeleteNodes: (nodeIds: string[]) => void;
		handleCopy: (nodes: Node[]) => void;
		handlePaste: () => void;
	},
) => {
	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			console.log("Key pressed:", {
				key: event.key,
				ctrlKey: event.ctrlKey,
				shiftKey: event.shiftKey,
				defaultPrevented: event.defaultPrevented,
			});
			// Prevent default behavior for our keyboard shortcuts
			if (event.key === "Enter" && (event.ctrlKey || event.shiftKey)) {
				event.preventDefault();
			}

			if (editingNodeId) return;

			if (event.ctrlKey && event.key === "c" && selectedNodes.length > 0) {
				handlers.handleCopy(selectedNodes);
				return;
			}

			if (event.ctrlKey && event.key === "v") {
				handlers.handlePaste();
				return;
			}

			if (event.key === "Delete" && selectedNodes.length > 0) {
				const nodeIds = selectedNodes.map((node) => node.id);
				handlers.handleDeleteNodes(nodeIds);
				return;
			}

			if (selectedNodes.length === 1) {
				const selectedNode = selectedNodes[0];

				if (event.key === "Enter") {
					event.preventDefault();
					console.log("Enter pressed", {
						altKey: event.altKey,
						shiftKey: event.shiftKey,
					});

					if (event.altKey && !event.shiftKey) {
						console.log("Add parent - Alt + Enter");
						handlers.handleAddParent(selectedNode.id);
					} else if (event.shiftKey && !event.altKey) {
						console.log("Add child - Shift + Enter");
						handlers.handleAddChild(selectedNode.id);
					} else if (!event.altKey && !event.shiftKey) {
						console.log("Add sibling");
						handlers.handleAddSibling(selectedNode.id);
					}
				}

				if (event.key === "Tab") {
					event.preventDefault();
					handlers.handleAddChild(selectedNode.id);
					return;
				}
			}
		};

		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, [selectedNodes, editingNodeId, handlers]);
};
