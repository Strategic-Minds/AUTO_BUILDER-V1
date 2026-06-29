import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AUTO_BUILDER OS — Control Plane",
  description: "Strategic Minds AUTO_BUILDER v1 system dashboard",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}