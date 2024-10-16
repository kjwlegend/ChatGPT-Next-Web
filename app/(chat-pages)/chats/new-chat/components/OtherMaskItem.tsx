import React from 'react';
import { Button } from "antd";
import { Mask } from "@/app/types/mask";
import styles from "../styles/NewChat.module.scss";

interface OtherMaskItemProps {
  mask: Mask;
  startChat: (mask: Mask) => void;
}

const OtherMaskItem: React.FC<OtherMaskItemProps> = ({ mask, startChat }) => (
  <div className={styles["other-mask-item"]}>
    <img src={mask.avatar} alt={mask.name} className={styles["other-mask-avatar"]} />
    <div className={styles["other-mask-info"]}>
      <h3>{mask.name}</h3>
      <p>{mask.description}</p>
    </div>
    <Button onClick={() => startChat(mask)}>
      开始聊天
    </Button>
  </div>
);

export default OtherMaskItem;
