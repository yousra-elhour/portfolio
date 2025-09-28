import type { Metadata } from "next";
import { Montserrat, Marcellus_SC, Pixelify_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Client from "./components/Client";
import { SpeedInsights } from "@vercel/speed-insights/next";
import PageTransition from "./components/PageTransition";
import FontPreloader from "./components/FontPreloader";

const montserrat = Montserrat({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: true,
  variable: "--font-sans",
});
const marcellus = Marcellus_SC({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-title",
  display: "swap",
  preload: true,
});
const pixelifySans = Pixelify_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-pixelify",
  display: "swap",
  preload: true,
});
const bhavuka = localFont({
  src: "../public/fonts/Bhavuka-Regular.ttf",
  variable: "--font-bhavuka",
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
      <body className={`${marcellus.variable} ${montserrat.variable} ${pixelifySans.variable} ${bhavuka.variable}`}>
        <Client>
          <PageTransition>{children}</PageTransition>
        </Client>
        <SpeedInsights />
      </body>
    </html>
  );
}
