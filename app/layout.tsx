import type { Metadata } from "next";
import { Montserrat, Marcellus_SC } from "next/font/google";
import "./globals.css";
import Client from "./components/Client";
import { SpeedInsights } from "@vercel/speed-insights/next";
import PageTransition from "./components/PageTransition";
import FontPreloader from "./components/FontPreloader";

const montserrat = Montserrat({ 
  subsets: ["latin"], 
  weight: "300",
  display: "swap",
  preload: true,
});
const marcellus = Marcellus_SC({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-title",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Yousra Elhour - Software Engineer",
  description: "Yousra Elhour's Portfolio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <FontPreloader />
      </head>
      <body className={`${marcellus.className} ${montserrat.className}`}>
        <Client>
          <PageTransition>{children}</PageTransition>
        </Client>
        <SpeedInsights />
      </body>
    </html>
  );
}
