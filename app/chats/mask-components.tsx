import { IconButton } from "../components/button";
import { ErrorBoundary } from "../components/error";

import styles from "./mask.module.scss";

import DownloadIcon from "../icons/download.svg";
import UploadIcon from "../icons/upload.svg";
import EditIcon from "../icons/edit.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import DeleteIcon from "../icons/delete.svg";
import EyeIcon from "../icons/eye.svg";
import CopyIcon from "../icons/copy.svg";
import DragIcon from "../icons/drag.svg";

import { Button } from "antd";
import { genPrompt } from "../chains/promptgen";

import { DEFAULT_MASK_AVATAR, Mask, useMaskStore } from "../store/mask";
import {
	ChatMessage,
	createMessage,
	ModelConfig,
	useAppConfig,
	useChatStore,
} from "../store";
import { ROLES } from "../client/api";
import {
	Input,
	List,
	ListItem,
	Modal,
	Popover,
	Select,
	showConfirm,
} from "../components/ui-lib";
import { Avatar } from "../components/emoji";
import Locale, { AllLangs, ALL_LANG_OPTIONS, Lang } from "../locales";
import { MaskCategory } from "../constant";
import { useNavigate } from "react-router-dom";
import { Row, Col } from "antd";

import chatStyle from "./chat.module.scss";
import { useEffect, useState } from "react";
import { copyToClipboard, downloadAs, readFromFile } from "../utils";
import { Updater } from "../typing";
import { ModelConfigList } from "../components/model-config";
import { FileName, Path } from "../constant";
import { BUILTIN_MASK_STORE } from "../masks";
import { nanoid } from "nanoid";

import {
	DragDropContext,
	Droppable,
	Draggable,
	OnDragEndResponder,
} from "@hello-pangea/dnd";
import { useMobileScreen } from "../utils";

import { Tabs, Radio, Input as AntdInput } from "antd";
import type { RadioChangeEvent } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useAllModels } from "../utils/hooks";

const { TextArea } = AntdInput;

// drag and drop helper function
function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
	const result = [...list];
	const [removed] = result.splice(startIndex, 1);
	result.splice(endIndex, 0, removed);
	return result;
}

export function MaskAvatar(props: { mask: Mask }) {
	return props.mask.avatar !== DEFAULT_MASK_AVATAR ? (
		<Avatar mask={props.mask} />
	) : (
		<Avatar mask={props.mask} />
	);
}

type TabPosition = "left" | "right" | "top" | "bottom";

export function MaskConfig(props: {
	mask: Mask;
	updateMask: Updater<Mask>;
	extraListItems?: JSX.Element;
	readonly?: boolean;
	shouldSyncFromGlobal?: boolean;
}) {
	const isMobileScreen = useMobileScreen();
	const [showPicker, setShowPicker] = useState(false);
	const [tabPosition, setTabPosition] = useState<TabPosition>("left");

	const allModels = useAllModels();

	// set tab position to top on mobile screen
	useEffect(() => {
		if (isMobileScreen) {
			setTabPosition("top");
		} else {
			setTabPosition("left");
		}
	}, [isMobileScreen]);
	const updateConfig = (updater: (config: ModelConfig) => void) => {
		if (props.readonly) return;

		const config = { ...props.mask.modelConfig };
		updater(config);
		props.updateMask((mask) => {
			mask.modelConfig = config;
			// if user changed current session mask, it will disable auto sync
			mask.syncGlobalConfig = false;
		});
	};

	const copyMaskLink = () => {
		const maskLink = `${location.protocol}//${location.host}/#${Path.NewChat}?mask=${props.mask.id}`;
		copyToClipboard(maskLink);
	};

	const globalConfig = useAppConfig();

	// 提示词管理模块
	const PromptsManage = (
		<ContextPrompts
			context={props.mask.context}
			updateContext={(updater) => {
				const context = props.mask.context.slice();
				updater(context);
				props.updateMask((mask) => (mask.context = context));
			}}
		/>
	);

	//  角色管理模块
	const RolesManage = (
		<List>
			{/* <ListItem title={Locale.Mask.Config.Avatar}>
    <Popover
        content={<div>Avatar</div>}
        open={showPicker}
        onClose={() => setShowPicker(false)}
    >
        <div
            onClick={() => setShowPicker(true)}
            style={{ cursor: "pointer" }}
        >
            <MaskAvatar mask={props.mask} />
        </div>
    </Popover>
</ListItem> */}
			<ListItem title={Locale.Mask.Config.Name}>
				<input
					type="text"
					value={props.mask.name}
					onInput={(e) =>
						props.updateMask((mask) => {
							mask.name = e.currentTarget.value;
						})
					}
				></input>
			</ListItem>
			<ListItem title={"欢迎语"}>
				<textarea
					value={props.mask.intro}
					rows={3}
					style={{
						width: "50%",
						border: "1px solid #d9d9d9",
						padding: "5px",
						borderRadius: "5px",
					}}
					onInput={(e) =>
						props.updateMask((mask) => {
							mask.intro = e.currentTarget.value;
						})
					}
				></textarea>
			</ListItem>
			<ListItem title={Locale.Mask.Config.category}>
				<select
					value={props.mask.category}
					onChange={(e) =>
						props.updateMask((mask) => {
							mask.category = e.currentTarget.value;
						})
					}
					disabled
				>
					{Object.values(MaskCategory).map((category) => (
						<option key={category.key} value={category.value}>
							{category.value}
						</option>
					))}
				</select>
			</ListItem>
			{/* show mask.ModelConfig */}
			<ListItem title={Locale.Settings.Model}>
				<Select
					value={props.mask.modelConfig.model}
					onChange={(e) => {
						props.updateMask((mask) => {
							mask.modelConfig.model = e.currentTarget.value;
						});
					}}
				>
					{allModels
						.filter((v) => v.available)
						.map((v, i) => (
							<option value={v.name} key={i}>
								{v.displayName}
							</option>
						))}
				</Select>
			</ListItem>
			<ListItem
				title={Locale.Mask.Config.HideContext.Title}
				subTitle={Locale.Mask.Config.HideContext.SubTitle}
			>
				<input
					type="checkbox"
					checked={props.mask.hideContext}
					onChange={(e) => {
						props.updateMask((mask) => {
							mask.hideContext = e.currentTarget.checked;
						});
					}}
				></input>
			</ListItem>

			{!props.shouldSyncFromGlobal ? (
				<ListItem
					title={Locale.Mask.Config.Share.Title}
					subTitle={Locale.Mask.Config.Share.SubTitle}
				>
					<IconButton
						icon={<CopyIcon />}
						text={Locale.Mask.Config.Share.Action}
						onClick={copyMaskLink}
					/>
				</ListItem>
			) : null}

			{props.shouldSyncFromGlobal ? (
				<ListItem
					title={Locale.Mask.Config.Sync.Title}
					subTitle={Locale.Mask.Config.Sync.SubTitle}
				>
					<input
						type="checkbox"
						checked={props.mask.syncGlobalConfig}
						onChange={async (e) => {
							const checked = e.currentTarget.checked;
							if (
								checked &&
								(await showConfirm(Locale.Mask.Config.Sync.Confirm))
							) {
								props.updateMask((mask) => {
									mask.syncGlobalConfig = checked;
									mask.modelConfig = {
										...globalConfig.modelConfig,
									};
								});
							} else if (!checked) {
								props.updateMask((mask) => {
									mask.syncGlobalConfig = checked;
								});
							}
						}}
					></input>
				</ListItem>
			) : null}
		</List>
	);

	// advance setting
	const AdvanceSetting = (
		<List>
			<ModelConfigList
				modelConfig={{ ...props.mask.modelConfig }}
				updateConfig={updateConfig}
			/>
			{props.extraListItems}
		</List>
	);

	return (
		<>
			{/* 1 row 2 col layout */}

			<Tabs
				defaultActiveKey="1"
				tabPosition={tabPosition}
				items={[
					{
						key: "1",
						label: "提示词配置",
						children: PromptsManage,
					},
					{
						key: "2",
						label: "角色基础",
						children: RolesManage,
					},
					{
						key: "3",
						label: "高级设置",
						children: AdvanceSetting,
					},
				]}
			/>
		</>
	);
}

function ContextPromptItem(props: {
	index: number;
	prompt: ChatMessage;
	update: (prompt: ChatMessage) => void;
	remove: () => void;
}) {
	const [focusingInput, setFocusingInput] = useState(false);
	const [loadings, setLoadings] = useState<boolean[]>([]);
	const [value, setValue] = useState<string>(props.prompt.role);

	const onChange = (e: RadioChangeEvent) => {
		// update role
		props.update({
			...props.prompt,
			role: e.target.value as any,
		});
		// update radio checked value
		setValue(e.target.value);

		// console.log(`Roles checked:${e.target.value}`);
	};

	const enterLoading = (index: number) => {
		setLoadings((prevLoadings) => {
			const newLoadings = [...prevLoadings];
			newLoadings[index] = true;
			return newLoadings;
		});
	};

	// 重命名函数以避免冲突，并处理异步逻辑
	const handleGenPrompt = async () => {
		// 获取当前textArea的值
		const currentContent = props.prompt.content;

		setLoadings((prevLoadings) => {
			const newLoadings = [...prevLoadings];
			newLoadings[0] = true;
			return newLoadings;
		});

		genPrompt(currentContent).then((newPrompt) => {
			props.update({
				...props.prompt,
				content: newPrompt as string,
			});

			setLoadings((prevLoadings) => {
				const newLoadings = [...prevLoadings];
				newLoadings[0] = false;
				return newLoadings;
			});
		});
	};

	return (
		<>
			<div className={chatStyle["context-prompt-row"]}>
				<div>
					<span className={chatStyle["context-drag"]}>
						<DragIcon />
					</span>
					<Radio.Group
						onChange={onChange}
						defaultValue={ROLES[0]}
						value={value}
					>
						{ROLES.map((r) => (
							<Radio.Button key={r} value={r}>
								{r}
							</Radio.Button>
						))}
					</Radio.Group>
				</div>
				<Button
					type="primary"
					onClick={() => {
						handleGenPrompt();
					}}
					loading={loadings[0]}
					size="middle"
				>
					优化提示词
				</Button>

				<IconButton
					icon={
						<DeleteOutlined size={16} className={chatStyle["context-icons"]} />
					}
					className={chatStyle["context-delete-button"]}
					onClick={() => props.remove()}
					text="删除"
				/>
			</div>
			<Row>
				{" "}
				<Col span={24}>
					<TextArea
						value={props.prompt.content}
						className={chatStyle["context-content"]}
						placeholder="请添加提示词, 如不会撰写, 也输入大致需求和主题后, 再点击生成提示词"
						showCount
						onFocus={() => setFocusingInput(true)}
						onBlur={() => {
							setFocusingInput(false);
							// If the selection is not removed when the user loses focus, some
							// extensions like "Translate" will always display a floating bar
							window?.getSelection()?.removeAllRanges();
						}}
						onChange={(e) =>
							props.update({
								...props.prompt,
								content: e.currentTarget.value as any,
							})
						}
						autoSize={{ minRows: 4, maxRows: 10 }}
					/>
				</Col>
			</Row>
		</>
	);
}

export function ContextPrompts(props: {
	context: ChatMessage[];
	updateContext: (updater: (context: ChatMessage[]) => void) => void;
}) {
	const context = props.context;

	const addContextPrompt = (prompt: ChatMessage, i: number) => {
		props.updateContext((context) => context.splice(i, 0, prompt));
	};

	const removeContextPrompt = (i: number) => {
		props.updateContext((context) => context.splice(i, 1));
	};

	const updateContextPrompt = (i: number, prompt: ChatMessage) => {
		props.updateContext((context) => (context[i] = prompt));
	};

	const onDragEnd: OnDragEndResponder = (result) => {
		if (!result.destination) {
			return;
		}
		const newContext = reorder(
			context,
			result.source.index,
			result.destination.index,
		);
		props.updateContext((context) => {
			context.splice(0, context.length, ...newContext);
		});
	};

	return (
		<>
			<div className={chatStyle["context-prompt"]} style={{ marginBottom: 20 }}>
				<DragDropContext onDragEnd={onDragEnd}>
					<Droppable droppableId="context-prompt-list">
						{(provided) => (
							<div ref={provided.innerRef} {...provided.droppableProps}>
								{context.map((c, i) => (
									<Draggable
										draggableId={c.id || i.toString()}
										index={i}
										key={c.id}
									>
										{(provided) => (
											<div
												ref={provided.innerRef}
												{...provided.draggableProps}
												{...provided.dragHandleProps}
											>
												<ContextPromptItem
													index={i}
													prompt={c}
													update={(prompt) => updateContextPrompt(i, prompt)}
													remove={() => removeContextPrompt(i)}
												/>
												<div
													className={chatStyle["context-prompt-insert"]}
													onClick={() => {
														addContextPrompt(
															createMessage({
																role: "user",
																content: "",
																date: new Date().toLocaleString(),
															}),
															i + 1,
														);
													}}
												>
													<AddIcon />
												</div>
											</div>
										)}
									</Draggable>
								))}
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</DragDropContext>

				{props.context.length === 0 && (
					<div className={chatStyle["context-prompt-row"]}>
						<IconButton
							icon={<AddIcon />}
							text={Locale.Context.Add}
							bordered
							className={chatStyle["context-prompt-button"]}
							onClick={() =>
								addContextPrompt(
									createMessage({
										role: "user",
										content: "",
										date: "",
									}),
									props.context.length,
								)
							}
						/>
					</div>
				)}
			</div>
		</>
	);
}
