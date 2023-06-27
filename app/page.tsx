import { Analytics } from "@vercel/analytics/react";

import { Home } from "./components/home";
import { MainNav } from "./components/header";
import { Bottom } from "./components/footer";
import { getServerSideConfig } from "./config/server";

const serverConfig = getServerSideConfig();

export default async function App() {
  return (
    <>
      <div className="appcontainer">
        <MainNav />
        <Home />
        <Bottom />
      </div>
      {serverConfig?.isVercel && <Analytics />}
    </>
  );
}
