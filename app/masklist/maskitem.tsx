"use client";
import React from "react";
import DownloadIcon from "../icons/download.svg";
import UploadIcon from "../icons/upload.svg";
import EditIcon from "../icons/edit.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import DeleteIcon from "../icons/delete.svg";
import EyeIcon from "../icons/eye.svg";
import CopyIcon from "../icons/copy.svg";
import DragIcon from "../icons/drag.svg";
import styles from "./mask.module.scss";

import Locale, { AllLangs, ALL_LANG_OPTIONS, Lang } from "../locales";
import {
  Input,
  List,
  ListItem,
  Modal,
  Popover,
  Select,
  showConfirm,
} from "../components/ui-lib";
import { Card } from "antd";
import { IconButton } from "../components/button";
import { Avatar, AvatarPicker } from "../components/emoji";
import { DEFAULT_MASK_AVATAR, Mask, useMaskStore } from "../store/mask";
import {
  ChatMessage,
  createMessage,
  ModelConfig,
  useAppConfig,
  useChatStore,
} from "../store";
import { FileName, Path } from "../constant";

import { useNavigate } from "react-router-dom";

const { Meta } = Card;

export function MaskAvatar(props: { mask: Mask }) {
  return props.mask.avatar !== DEFAULT_MASK_AVATAR ? (
    <Avatar avatar={props.mask.avatar} />
  ) : (
    <Avatar model={props.mask} />
  );
}

type MaskComponentProps = {
  mask: Mask;
  setEditingMaskId: (id: string) => void;
  styleName?: string;
};

const MaskComponent: React.FC<MaskComponentProps> = ({
  mask,
  setEditingMaskId,
  styleName = "",
}) => {
  const navigate = useNavigate();

  const maskStore = useMaskStore();
  const chatStore = useChatStore();

  const onChat = () => {
    console.log("onChat");
    chatStore.newSession(mask);
    navigate(Path.Chat);
  };

  const onDelete = () => {
    console.log("onDelete");
    maskStore.delete(mask.id);
  };
  const getCardStyle = () => {
    if (styleName === "card") {
      return styles["mask-item-card"];
    } else if (styleName === "info") {
      return styles["mask-item-info"];
    } else if (styleName === "roleplay") {
      return styles["mask-item-roleplay"];
    } else {
      return styles["mask-item-card"];
    }
  };

  const renderCard = () => {
    return (
      <Card
        title={
          <div className={styles["mask-header"]}>
            {<MaskAvatar mask={mask} />} {mask.name}{" "}
            {mask.version ? mask.version : ""}
          </div>
        }
        headStyle={{ padding: 5 }}
        extra={<span className={styles["label"]}>{mask.category}</span>}
        hoverable
        className={`${styles["mask-item"]} ${getCardStyle()}`}
        bodyStyle={{ padding: 10 }}
        actions={[
          <IconButton
            icon={<AddIcon />}
            key="chat"
            text={Locale.Mask.Item.Chat}
            onClick={() => onChat()}
          />,
          <>
            {" "}
            {mask.builtin ? (
              <IconButton
                icon={<EyeIcon />}
                key="view"
                text={`热度: ${mask.hotness ? mask.hotness : "0"}`}
                // onClick={() => setEditingMaskId(mask.id)}
              />
            ) : (
              <IconButton
                icon={<EditIcon />}
                key="edit"
                text={Locale.Mask.Item.Edit}
                onClick={() => setEditingMaskId(mask.id)}
              />
            )}
          </>,
          <>
            {" "}
            {!mask.builtin && (
              <IconButton
                icon={<DeleteIcon />}
                text={Locale.Mask.Item.Delete}
                key="delete"
                onClick={async () => {
                  if (await showConfirm(Locale.Mask.Item.DeleteConfirm)) {
                    onDelete();
                  }
                }}
              />
            )}
          </>,
        ]}
      >
        <Meta
          // avatar={<MaskAvatar mask={mask} />}
          description={
            mask.description ? mask.description : "作者很懒, 还没有上传介绍"
          }
        />
      </Card>
    );
  };

  const renderInfo = () => {
    return (
      <div className={styles["mask-item-info"]}>
        <h3>{mask.name}</h3>
        <p>{mask.description}</p>
        <button onClick={onChat}>Chat</button>
        {!mask.builtin && <button onClick={onDelete}>Delete</button>}
      </div>
    );
  };

  const renderRoleplay = () => {
    return (
      <div className={styles["mask-item-roleplay"]}>
        <h1>{mask.name}</h1>
        <p>{mask.description}</p>
        <button onClick={onChat}>Chat</button>
        {!mask.builtin && <button onClick={onDelete}>Delete</button>}
      </div>
    );
  };

  const renderComponent = () => {
    if (styleName === "card") {
      return renderCard();
    } else if (styleName === "info") {
      return renderInfo();
    } else if (styleName === "roleplay") {
      return renderRoleplay();
    } else {
      return renderCard();
    }
  };

  return renderComponent();
};

export default MaskComponent;
