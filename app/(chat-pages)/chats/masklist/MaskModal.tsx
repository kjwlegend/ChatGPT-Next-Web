import React from "react";
import {
	Input,
	List,
	ListItem,
	Modal,
	Popover,
	Select,
	showConfirm,
} from "@/app/components/ui-lib";
import { MaskConfig } from "../components/mask-modal";
import { Mask } from "@/app/types/mask";
import { IconButton } from "@/app/components/button";
import Locale, { AllLangs, ALL_LANG_OPTIONS, Lang } from "@/app/locales";
import { copyToClipboard, downloadAs, readFromFile } from "@/app/utils";

import DownloadIcon from "@/app/icons/download.svg";
import CopyIcon from "@/app/icons/copy.svg";

interface MaskModalProps {
	editingMask: Mask | undefined;
	closeMaskModal: () => void;
	saveMask: (id: string) => void;
	updateMask: (id: string, updater: any) => void;
}

const MaskModal: React.FC<MaskModalProps> = ({
	editingMask,
	closeMaskModal,
	saveMask,
	updateMask,
}) => {
	if (!editingMask) return null;

	return (
		<Modal
			title={Locale.Mask.EditModal.Title(editingMask?.builtin)}
			onClose={closeMaskModal}
			actions={[
				<p key="description">新建角色可以享受 1小光币奖励</p>,
				<IconButton
					icon={<DownloadIcon />}
					text={Locale.Mask.EditModal.Download}
					key="export"
					bordered
					onClick={() =>
						downloadAs(JSON.stringify(editingMask), `${editingMask.name}.json`)
					}
				/>,
				<IconButton
					key="save"
					icon={<CopyIcon />}
					bordered
					text={"保存助手"}
					onClick={() => {
						saveMask(editingMask.id);
						closeMaskModal();
					}}
				/>,
			]}
		>
			{/* <MaskConfig
				mask={editingMask}
				updateMask={(updater) => updateMask(editingMask.id, updater)}
				readonly={editingMask.builtin}
				onSave={() => {}}
                session={session}
			/> */}
		</Modal>
	);
};

export default MaskModal;
