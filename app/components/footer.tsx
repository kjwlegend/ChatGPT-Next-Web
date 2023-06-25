"use client";

import { useState, useEffect } from "react";

import styles from "./footer.module.scss";

import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { AuthPage } from "./auth";

function Screen() {
  return <div className={styles.footer}>footer</div>;
}

export function Footer() {
  return <Screen />;
}
