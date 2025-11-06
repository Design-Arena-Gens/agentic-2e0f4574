import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Polygon Bridge Planner",
  description: "Connect disjoint polygons with shortest links"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bg">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
