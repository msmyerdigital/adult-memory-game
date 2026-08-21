import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Free Brain Gain Portal",
  description: "Train your mind and elevate focus.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}