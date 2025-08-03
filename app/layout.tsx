import type { Metadata } from "next";
import { Montserrat, Marcellus_SC } from "next/font/google";
import "./globals.css";
import Client from "./components/Client";
import { SpeedInsights } from "@vercel/speed-insights/next";
import PageTransition from "./components/PageTransition";
import { CloudTransitionProvider } from "./components/CloudTransitionProvider";
import { TestingCloudTransitionProvider } from "./components/TestingCloudTransitionProvider";

const montserrat = Montserrat({ subsets: ["latin"], weight: "300" });
const marcellus = Marcellus_SC({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-title",
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
      <body className={`${marcellus.className} ${montserrat.className}`}>
        <Client>
          
            
              <PageTransition>{children}</PageTransition>
           
          
        </Client>
        <SpeedInsights />
      </body>
    </html>
  );
}
