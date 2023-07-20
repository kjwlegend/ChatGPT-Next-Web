/* eslint-disable @next/next/no-page-custom-font */
import "./styles/globals.scss";
import "./styles/markdown.scss";
import "./styles/highlight.scss";
import "./styles/layout.scss";
import { getClientConfig } from "./config/client";
import Header from "./components/header";
import Footer from "./components/footer";
import { ErrorBoundary } from "./components/error";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "小光AI",
  description: "专业的超级助手.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#151515" },
  ],
  appleWebApp: {
    title: "小光AI",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="config" content={JSON.stringify(getClientConfig())} />
        <link rel="manifest" href="/site.webmanifest"></link>
        <script src="/serviceWorkerRegister.js" defer></script>
        <script
          async
          src="https://jic.talkingdata.com/app/h5/v1?appid=EF569EDD56B64DEEB3BF84539A707729&vn=开发版&vc=1.0"
        ></script>
      </head>
      <body>
        <section className="appcontainer">
          <Header displayMobileVersion={false} />
          {children}
          <Footer />
        </section>
      </body>
    </html>
  );
}
