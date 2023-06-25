"use client";

import { useState, useEffect } from "react";

import styles from "./header.module.scss";

import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { AuthPage } from "./auth";

function Screen() {
  return <div className={styles.header}>abc</div>;
}

export function Header() {
  return <Screen />;
}
