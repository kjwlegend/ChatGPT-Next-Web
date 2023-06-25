import { Analytics } from "@vercel/analytics/react";

import { Home } from "./components/home";
import { Header } from "./components/header";
import { Footer } from "./components/footer";

import { getServerSideConfig } from "./config/server";

const serverConfig = getServerSideConfig();

export default async function App() {
  return (
    <>
      <div className="appcontainer">
        <Header />
        <Home />
        <Footer />
      </div>
      {serverConfig?.isVercel && <Analytics />}
    </>
  );
}
