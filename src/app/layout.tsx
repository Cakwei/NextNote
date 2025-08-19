import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { appleFont } from "@/lib/fonts";
import { metadataDescription, metadataInfo } from "@/constants/constants";
import QueryProvider from "@/contexts/QueryProvider";
import { AuthProvider } from "@/contexts/AuthProvider";

export const metadata: Metadata = {
  title: metadataInfo.default,
  description: metadataDescription.default,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${appleFont.className} antialiased`}>
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
