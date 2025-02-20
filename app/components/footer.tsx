"use client";

import { useState, useEffect } from "react";
import { Layout, Button } from "antd";

const { Footer } = Layout;
import styles from "./footer.module.scss";

import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

export function PageFooter() {
  return (
    <Footer className={styles.footer + " desktop-only"}>
      <div className={styles.footerContent}>CopyRight © 2023 by 经纬咨询</div>
    </Footer>
  );
}

export default PageFooter;
