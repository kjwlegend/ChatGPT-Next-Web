import { Analytics } from "@vercel/analytics/react";
import { Home } from "./components/home";
import { MainNav } from "./components/header";
import { Bottom } from "./components/footer";
import { getServerSideConfig } from "./config/server";
import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { ErrorBoundary } from "./components/error";

const serverConfig = getServerSideConfig();

export default async function App() {
  return (
    <>
      <div className="appcontainer">
        <Home />
      </div>
      {serverConfig?.isVercel && <Analytics />}
    </>
  );
}
