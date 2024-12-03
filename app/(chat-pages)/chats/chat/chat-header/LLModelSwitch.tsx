"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronDown, Info } from "lucide-react";
import { isProModel } from "@/app/utils";
import styles from "../chats.module.scss";

import { useAppConfig, ModelType } from "@/app/store";

import { useChatStore } from "@/app/store/chat/index";

import { message } from "antd";

import { useWorkflowStore } from "@/app/store/workflow";
import { sessionConfig } from "@/app/types/";
import { LLMModel, Model } from "@/app/client/api";

export function LLMModelSwitch(
	props: { session?: sessionConfig; isworkflow?: boolean } = {
		isworkflow: false,
	},
) {
	const config = useAppConfig();
	const chatStore = useChatStore.getState();
	const workflowStore = useWorkflowStore.getState();
	const { selectedId, updateWorkflowSession } = workflowStore;
	const session = props.session || chatStore.selectCurrentSession();

	const [model, setModel] = useState("默认模型");
	const availableModels = config.models;

	const handleModelChange = useCallback(
		async (newModel: Model) => {
			console.log("handleModelChange newModel:", newModel);
			try {
				setModel(newModel.displayName ?? newModel.name);
				if (props.isworkflow) {
					updateWorkflowSession(selectedId, session.id, {
						mask: {
							...session.mask,
							modelConfig: {
								...session.mask.modelConfig,
								model: newModel.name,
								historyMessageCount: 33,
							},
						},
					});
				} else {
					chatStore.updateSession(session.id, (session) => {
						session.mask.modelConfig.model = newModel.name as ModelType;
						return session;
					});
				}
			} catch (error) {
				console.error("Failed to update model:", error);
			}
		},
		[props.isworkflow, selectedId, session, chatStore, updateWorkflowSession],
	);

	return (
		<div className={styles["chat-model"]}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" size="sm" className="h-7 text-xs">
						{model}
						<ChevronDown className="ml-1 h-3 w-3" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					{availableModels.map((provider) =>
						provider.models.map((m) => (
							<DropdownMenuItem
								key={m.name}
								onSelect={() => handleModelChange(m)}
							>
								{`${provider.provider} - ${m.key}`}
							</DropdownMenuItem>
						)),
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			{isProModel(model) && (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button variant="ghost" size="icon" className="h-7 w-7">
								<Info className="h-3 w-3" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>高级模型消耗5积分/次</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			)}
		</div>
	);
}
