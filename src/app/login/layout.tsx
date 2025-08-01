import type { Metadata } from "next";
import "@/app/globals.css";
import { Toaster } from "sonner";
import { appleFont } from "@/lib/fonts";
import { metadataDescription, metadataInfo } from "@/constants/constants";

export const metadata: Metadata = {
  title: metadataInfo.login,
  description: metadataDescription.default,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className={`${appleFont.className} antialiased`}>
      {children}
      <Toaster />
    </main>
  );
}
