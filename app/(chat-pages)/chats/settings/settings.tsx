import { useState, useEffect, useMemo } from "react";

import styles from "./settings.module.scss";

import ResetIcon from "@/app/icons/reload.svg";
import AddIcon from "@/app/icons/add.svg";
import CloseIcon from "@/app/icons/close.svg";
import CopyIcon from "@/app/icons/copy.svg";
import ClearIcon from "@/app/icons/clear.svg";
import LoadingIcon from "@/app/icons/three-dots.svg";
import EditIcon from "@/app/icons/edit.svg";
import EyeIcon from "@/app/icons/eye.svg";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

import {
	Input,
	List,
	ListItem,
	Modal,
	PasswordInput,
	Popover,
	Select,
	showConfirm,
	showToast,
} from "@/app/components/ui-lib";
import { ModelConfigList } from "@/app/(chat-pages)/chats/components/model-config";

import { IconButton } from "@/app/components/button";
import {
	SubmitKey,
	useChatStore,
	Theme,
	useUpdateStore,
	useAccessStore,
	useAppConfig,
} from "@/app/store";

import Locale, {
	AllLangs,
	ALL_LANG_OPTIONS,
	changeLang,
	getLang,
} from "@/app/locales";
import { copyToClipboard } from "@/app/utils";
import {
	Azure,
	OPENAI_BASE_URL,
	Path,
	RELEASE_URL,
	STORAGE_KEY,
	ServiceProvider,
	SlotID,
	UPDATE_URL,
} from "@/app/constant";
import { Prompt, SearchService, usePromptStore } from "@/app/store/prompt";
import { ErrorBoundary } from "@/app/components/error";
import { InputRange } from "@/app/components/input-range";
import { useNavigate } from "react-router-dom";
import { BotAvatar } from "@/app/components/emoji";
import { getClientConfig } from "@/app/config/client";
import { useAuthStore } from "@/app/store/auth";
import { nanoid } from "nanoid";
import { PluginConfigList } from "./plugin-config";
import { Checkbox } from "@/components/ui/checkbox";

function EditPromptModal(props: { id: string; onClose: () => void }) {
	const promptStore = usePromptStore();
	const prompt = promptStore.get(props.id);

	return prompt ? (
		<div className="modal-mask">
			<Modal
				title={Locale.Settings.Prompt.EditModal.Title}
				onClose={props.onClose}
				actions={[
					<IconButton
						key=""
						onClick={props.onClose}
						text={Locale.UI.Confirm}
						bordered
					/>,
				]}
			>
				<div className={styles["edit-prompt-modal"]}>
					<input
						type="text"
						value={prompt.title}
						readOnly={!prompt.isUser}
						className={styles["edit-prompt-title"]}
						onInput={(e) =>
							promptStore.updatePrompt(
								props.id,
								(prompt) => (prompt.title = e.currentTarget.value),
							)
						}
					></input>
					<Input
						value={prompt.content}
						readOnly={!prompt.isUser}
						className={styles["edit-prompt-content"]}
						rows={10}
						onInput={(e) =>
							promptStore.updatePrompt(
								props.id,
								(prompt) => (prompt.content = e.currentTarget.value),
							)
						}
					></Input>
				</div>
			</Modal>
		</div>
	) : null;
}

function UserPromptModal(props: { onClose?: () => void }) {
	const promptStore = usePromptStore();
	const userPrompts = promptStore.getUserPrompts();
	const builtinPrompts = SearchService.builtinPrompts;
	const allPrompts = userPrompts.concat(builtinPrompts);
	const [searchInput, setSearchInput] = useState("");
	const [searchPrompts, setSearchPrompts] = useState<Prompt[]>([]);
	const prompts = searchInput.length > 0 ? searchPrompts : allPrompts;

	const [editingPromptId, setEditingPromptId] = useState<string>();

	useEffect(() => {
		if (searchInput.length > 0) {
			const searchResult = SearchService.search(searchInput);
			setSearchPrompts(searchResult);
		} else {
			setSearchPrompts([]);
		}
	}, [searchInput]);

	return (
		<div className="modal-mask">
			<Modal
				title={Locale.Settings.Prompt.Modal.Title}
				onClose={() => props.onClose?.()}
				actions={[
					<IconButton
						key="add"
						onClick={() => {
							const promptId = promptStore.add({
								id: nanoid(),
								createdAt: Date.now(),
								title: "Empty Prompt",
								content: "Empty Prompt Content",
							});
							setEditingPromptId(promptId);
						}}
						icon={<AddIcon />}
						bordered
						text={Locale.Settings.Prompt.Modal.Add}
					/>,
				]}
			>
				<div className={styles["user-prompt-modal"]}>
					<input
						type="text"
						className={styles["user-prompt-search"]}
						placeholder={Locale.Settings.Prompt.Modal.Search}
						value={searchInput}
						onInput={(e) => setSearchInput(e.currentTarget.value)}
					></input>

					<div className={styles["user-prompt-list"]}>
						{prompts.map((v, _) => (
							<div className={styles["user-prompt-item"]} key={v.id ?? v.title}>
								<div className={styles["user-prompt-header"]}>
									<div className={styles["user-prompt-title"]}>{v.title}</div>
									<div className={styles["user-prompt-content"] + " one-line"}>
										{v.content}
									</div>
								</div>

								<div className={styles["user-prompt-buttons"]}>
									{v.isUser && (
										<IconButton
											icon={<ClearIcon />}
											className={styles["user-prompt-button"]}
											onClick={() => promptStore.remove(v.id!)}
										/>
									)}
									{v.isUser ? (
										<IconButton
											icon={<EditIcon />}
											className={styles["user-prompt-button"]}
											onClick={() => setEditingPromptId(v.id)}
										/>
									) : (
										<IconButton
											icon={<EyeIcon />}
											className={styles["user-prompt-button"]}
											onClick={() => setEditingPromptId(v.id)}
										/>
									)}
									<IconButton
										icon={<CopyIcon />}
										className={styles["user-prompt-button"]}
										onClick={() => copyToClipboard(v.content)}
									/>
								</div>
							</div>
						))}
					</div>
				</div>
			</Modal>

			{editingPromptId !== undefined && (
				<EditPromptModal
					id={editingPromptId!}
					onClose={() => setEditingPromptId(undefined)}
				/>
			)}
		</div>
	);
}

function DangerItems() {
	const chatStore = useChatStore();
	const appConfig = useAppConfig();

	return (
		<List>
			<ListItem
				title={Locale.Settings.Danger.Reset.Title}
				subTitle={Locale.Settings.Danger.Reset.SubTitle}
			>
				<IconButton
					text={Locale.Settings.Danger.Reset.Action}
					onClick={async () => {
						if (await showConfirm(Locale.Settings.Danger.Reset.Confirm)) {
							appConfig.reset();
						}
					}}
					type="danger"
				/>
			</ListItem>
			<ListItem
				title={Locale.Settings.Danger.Clear.Title}
				subTitle={Locale.Settings.Danger.Clear.SubTitle}
			>
				<IconButton
					text={Locale.Settings.Danger.Clear.Action}
					onClick={async () => {
						if (await showConfirm(Locale.Settings.Danger.Clear.Confirm)) {
							chatStore.clearAllData();
						}
					}}
					type="danger"
				/>
			</ListItem>
		</List>
	);
}

export function Settings() {
	const navigate = useNavigate();
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const config = useAppConfig();
	const updateConfig = config.update;

	const updateStore = useUpdateStore();
	const [checkingUpdate, setCheckingUpdate] = useState(false);
	const currentVersion = updateStore.formatVersion(updateStore.version);
	const remoteId = updateStore.formatVersion(updateStore.remoteVersion);
	const hasNewVersion = currentVersion !== remoteId;
	const updateUrl = getClientConfig()?.isApp ? RELEASE_URL : UPDATE_URL;

	function checkUpdate(force = false) {
		setCheckingUpdate(true);
		updateStore.getLatestVersion(force).then(() => {
			setCheckingUpdate(false);
		});

		console.log("[Update] local version ", updateStore.version);
		console.log("[Update] remote version ", updateStore.remoteVersion);
	}

	const usage = {
		used: updateStore.used,
		subscription: updateStore.subscription,
	};
	const [loadingUsage, setLoadingUsage] = useState(false);
	function checkUsage(force = false) {
		if (accessStore.hideBalanceQuery) {
			return;
		}

		setLoadingUsage(true);
		updateStore.updateUsage(force).finally(() => {
			setLoadingUsage(false);
		});
	}

	const accessStore = useAccessStore();
	const enabledAccessControl = useMemo(
		() => accessStore.enabledAccessControl(),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);

	const promptStore = usePromptStore();
	const builtinCount = SearchService.count.builtin;
	const customCount = promptStore.getUserPrompts().length ?? 0;
	const [shouldShowPromptModal, setShowPromptModal] = useState(false);

	const IsAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const showUsage = accessStore.isAuthorized();
	useEffect(() => {
		// checks per minutes
		checkUpdate();
		showUsage && checkUsage();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const keydownEvent = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				navigate(Path.Home);
			}
		};
		document.addEventListener("keydown", keydownEvent);
		return () => {
			document.removeEventListener("keydown", keydownEvent);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const clientConfig = useMemo(() => getClientConfig(), []);
	const showAccessCode = enabledAccessControl && !clientConfig?.isApp;

	return (
		<ErrorBoundary>
			<div className="window-header" data-tauri-drag-region>
				<div className="window-header-title">
					<div className="window-header-main-title">
						{Locale.Settings.Title}
					</div>
					<div className="window-header-sub-title">
						{Locale.Settings.SubTitle}
					</div>
				</div>
				<div className="window-actions">
					<div className="window-action-button"></div>
					<div className="window-action-button"></div>
					<div className="window-action-button">
						<IconButton
							icon={<CloseIcon />}
							onClick={() => navigate(Path.Home)}
							bordered
						/>
					</div>
				</div>
			</div>
			<div className={styles["settings"]}>
				<List>
					<ListItem title={Locale.Settings.SendKey}>
						<Select
							value={config.submitKey}
							onChange={(e) => {
								updateConfig(
									(config) =>
										(config.submitKey = e.target.value as any as SubmitKey),
								);
							}}
						>
							{Object.values(SubmitKey).map((v) => (
								<option value={v} key={v}>
									{v}
								</option>
							))}
						</Select>
					</ListItem>

					<ListItem title={Locale.Settings.Theme}>
						<Select
							value={config.theme}
							onChange={(e) => {
								updateConfig(
									(config) => (config.theme = e.target.value as any as Theme),
								);
							}}
						>
							{Object.values(Theme).map((v) => (
								<option value={v} key={v}>
									{v}
								</option>
							))}
						</Select>
					</ListItem>

					<ListItem title={Locale.Settings.Lang.Name}>
						<Select
							value={getLang()}
							onChange={(e) => {
								changeLang(e.target.value as any);
							}}
						>
							{AllLangs.map((lang) => (
								<option value={lang} key={lang}>
									{ALL_LANG_OPTIONS[lang]}
								</option>
							))}
						</Select>
					</ListItem>

					<ListItem
						title={Locale.Settings.FontSize.Title}
						subTitle={Locale.Settings.FontSize.SubTitle}
					>
						<div className="flex w-[200px] flex-col gap-2">
							<Label>{`${config.fontSize ?? 14}px`}</Label>
							<Slider
								value={[config.fontSize ?? 14]}
								min={10}
								max={21}
								step={1}
								onValueChange={(value) =>
									updateConfig((config) => (config.fontSize = value[0]))
								}
							/>
						</div>
					</ListItem>

					<ListItem
						title={Locale.Settings.AutoGenerateTitle.Title}
						subTitle={Locale.Settings.AutoGenerateTitle.SubTitle}
					>
						<Checkbox
							checked={config.enableAutoGenerateTitle}
							onCheckedChange={(checked: boolean) =>
								updateConfig(
									(config) => (config.enableAutoGenerateTitle = checked),
								)
							}
						/>
					</ListItem>
				</List>
				{/* <SyncItems /> */}
				<List>
					<ListItem
						title={Locale.Settings.Mask.Splash.Title}
						subTitle={Locale.Settings.Mask.Splash.SubTitle}
					>
						<Checkbox
							checked={!config.dontShowMaskSplashScreen}
							onCheckedChange={(checked: boolean) =>
								updateConfig(
									(config) => (config.dontShowMaskSplashScreen = !checked),
								)
							}
						></Checkbox>
					</ListItem>

					<ListItem
						title={Locale.Settings.Mask.Builtin.Title}
						subTitle={Locale.Settings.Mask.Builtin.SubTitle}
					>
						<Checkbox
							checked={config.hideBuiltinMasks}
							onCheckedChange={(checked: boolean) => {
								updateConfig((config) => (config.hideBuiltinMasks = checked));
								console.log("checked", config.hideBuiltinMasks);
							}}
						></Checkbox>
					</ListItem>
				</List>
				``
				<List>
					<ListItem
						title={Locale.Settings.Prompt.Disable.Title}
						subTitle={Locale.Settings.Prompt.Disable.SubTitle}
					>
						<Checkbox
							checked={config.disablePromptHint}
							onCheckedChange={(checked: boolean) =>
								updateConfig((config) => (config.disablePromptHint = checked))
							}
						></Checkbox>
					</ListItem>

					<ListItem
						title={Locale.Settings.Prompt.List}
						subTitle={Locale.Settings.Prompt.ListCount(
							builtinCount,
							customCount,
						)}
					>
						<IconButton
							icon={<EditIcon />}
							text={Locale.Settings.Prompt.Edit}
							onClick={() => setShowPromptModal(true)}
						/>
					</ListItem>
				</List>
				{shouldShowPromptModal && (
					<UserPromptModal onClose={() => setShowPromptModal(false)} />
				)}
				<List>
					<PluginConfigList
						pluginConfig={config.pluginConfig}
						updateConfig={(updater) => {
							const pluginConfig = { ...config.pluginConfig };
							updater(pluginConfig);
							config.update((config) => (config.pluginConfig = pluginConfig));
						}}
					/>
				</List>
				<DangerItems />
			</div>
		</ErrorBoundary>
	);
}
