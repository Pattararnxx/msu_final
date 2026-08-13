import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Thai } from "next/font/google";
import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";
import "@/styles/_color.scss";
import "./globals.scss";
import { ChatbotProvider } from "@/component/chatbot/chatbot-context";
import ChatbotShell from "@/component/chatbot-shell/chatbot-shell";

import {
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";

import { theme } from "@/mantine-theme";
import StoreProvider from "@/lib/redux/store-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai", "latin"],
});

export const metadata: Metadata = {
  title: "ผู้ช่วยจัดการออร์เดอร์ร้านอาหารเช้า",
  description:
    "ต้นแบบผู้ช่วยอ่านและตรวจทานใบออร์เดอร์ รวมยอดขาย และวางแผนเตรียมวัตถุดิบสำหรับร้านอาหารเช้า",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansThai.variable}`}
      {...mantineHtmlProps}
    >
      <body>
        <MantineProvider theme={theme} forceColorScheme="light">
          <StoreProvider>
            <ChatbotProvider>
              <ChatbotShell>{children}</ChatbotShell>
            </ChatbotProvider>
          </StoreProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
