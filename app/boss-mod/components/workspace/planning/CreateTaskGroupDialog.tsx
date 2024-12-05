"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import type { TaskGroupType } from "@/app/boss-mod/types";
import { TASK_GROUP_TYPES } from "@/app/boss-mod/types";

interface CreateTaskGroupDialogProps {
	onSubmit: (data: {
		name: string;
		type: TaskGroupType;
		description: string;
	}) => void;
}

export function CreateTaskGroupDialog({
	onSubmit,
}: CreateTaskGroupDialogProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [type, setType] = useState("");
	const [description, setDescription] = useState("");

	const handleSubmit = () => {
		onSubmit({ name, type, description });
		setOpen(false);
		resetForm();
	};

	const resetForm = () => {
		setName("");
		setType("");
		setDescription("");
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="icon">
					<Plus className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>创建新任务组</DialogTitle>
					<DialogDescription>
						创建一个新的任务组来组织相关任务
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">名称</label>
						<Input
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="输入任务组名称"
						/>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium">类型</label>
						<Select value={type} onValueChange={setType}>
							<SelectTrigger>
								<SelectValue placeholder="选择任务组类型" />
							</SelectTrigger>
							<SelectContent>
								{TASK_GROUP_TYPES.map((type) => (
									<SelectItem key={type.value} value={type.value}>
										{type.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium">描述</label>
						<Textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="输入任务组描述"
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)}>
						取消
					</Button>
					<Button onClick={handleSubmit} disabled={!name || !type}>
						创建
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
