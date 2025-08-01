import type { Metadata } from "next";
import "@/app/globals.css";
import { Toaster } from "sonner";
import { appleFont } from "@/lib/fonts";
import { metadataDescription, metadataInfo } from "@/constants/constants";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./ui/navigation";
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
        <SidebarProvider className="relative">
          <DashboardSidebar />
          <main className="bg-[#f9f9f9] w-full">
            <SidebarTrigger
              title="Open sidebar"
              className="sidebarTrigger absolute top-[50%]  translate-x-[-50%] z-100 rounded-[50%] bg-white border border-zinc-400"
            />
            {children}
            <Toaster />
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
