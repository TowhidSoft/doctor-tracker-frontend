import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ConfigProvider } from "antd";
import { Toaster } from "sonner";
import ReduxProvider from "@/redux/ReduxProvider";
import "./globals.css";
import "antd/dist/reset.css";

const inter = Inter({
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Doctor Tracker",
  description: "Admin portal for managing doctors, their patients and clinic analytics.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${inter.variable} antialiased`}>
        <ReduxProvider>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: "#2558B3",
                colorInfo: "#2558B3",
                colorSuccess: "#3ECF8E",
                colorWarning: "#F5821F",
                colorError: "#FF6B6B",
                colorTextBase: "#1F1F1F",
                borderRadius: 8,
                fontSize: 15,
                lineHeight: 1.6,
                controlHeight: 40,
              },
              components: {
                Button: {
                  colorPrimary: "#2558B3",
                  colorPrimaryHover: "#1E4A9A",
                  colorPrimaryActive: "#1B4187",
                },
                Layout: { colorBgLayout: "transparent" },
              },
            }}
          >
            <div className="min-h-screen max-w-[100vw] overflow-hidden bg-transparent text-title">{children}</div>
            <Toaster position="top-right" closeButton duration={3000} />
          </ConfigProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
