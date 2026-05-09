import type { Metadata } from "next";
import "./globals.css";
import Providers from "./components/Providers";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "DGU-CAP",
  description: "K8s 모니터링 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <body className="bg-gray-950 text-gray-100 antialiased">
        <Providers>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
