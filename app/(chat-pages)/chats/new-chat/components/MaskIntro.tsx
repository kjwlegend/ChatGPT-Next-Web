import React from 'react';
import { IconButton } from "@/app/components/button";
import LightningIcon from "@/app/icons/lightning.svg";
import EyeIcon from "@/app/icons/eye.svg";
import Locale from "@/app/locales";
import styles from "../styles/NewChat.module.scss";

interface MaskIntroProps {
  startChat: () => void;
  navigateToMasks: () => void;
}

const MaskIntro: React.FC<MaskIntroProps> = ({ startChat, navigateToMasks }) => (
  <div className={styles["mask-intro"]}>
    <div className={styles["title"]}>{Locale.NewChat.Title}</div>
    <div className={styles["sub-title"]}>{Locale.NewChat.SubTitle}</div>
    <div className={styles["actions"]}>
      <IconButton
        key="skip"
        text={Locale.NewChat.Skip}
        onClick={startChat}
        icon={<LightningIcon />}
        type="primary"
        shadow
        className={"primary"}
      />
      <IconButton
        key="more"
        text={Locale.NewChat.More}
        onClick={navigateToMasks}
        icon={<EyeIcon />}
        shadow
      />
    </div>
  </div>
);

export default MaskIntro;
