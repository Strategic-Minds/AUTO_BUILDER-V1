import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "AUTO BUILDER Bridge",
  description: "Universal GPT Business Operations Bridge"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
