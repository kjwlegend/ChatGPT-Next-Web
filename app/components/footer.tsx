"use client";

import { useState, useEffect } from "react";
import { Layout, Menu, Button } from "antd";

const { Footer } = Layout;
import styles from "./footer.module.scss";

import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { AuthPage } from "./auth";

export function Bottom() {
  return (
    <Footer className={styles.footer}>
      <div className={styles.footerContent}>CopyRight © 2023 by 经纬咨询</div>
    </Footer>
  );
}
