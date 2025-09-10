"use client";

import LoadingScreen from "./LoadingScreen";

export default function Client({ children }: { children: React.ReactNode }) {
  return <LoadingScreen>{children}</LoadingScreen>;
}
