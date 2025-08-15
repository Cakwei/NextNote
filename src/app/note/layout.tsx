import type { Metadata } from "next";
import "@/app/globals.css";
import { Toaster } from "sonner";
import { appleFont } from "@/lib/fonts";
import { metadataDescription, metadataInfo } from "@/constants/constants";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "../../components/navigation";

export const metadata: Metadata = {
  title: metadataInfo.dashboard,
  description: metadataDescription.default,
};

export default function NoteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className={`${appleFont.className} antialiased`}>
      <SidebarProvider className="relative">
        <DashboardSidebar />
        <main className="bg-[#f9f9f9] w-full">
          {children}
          <Toaster />
        </main>
      </SidebarProvider>
    </main>
  );
}
