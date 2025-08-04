import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { PointerEvent } from "react";
import { fakeNotesArray, sideBarLinks } from "@/constants/constants";
import Link from "next/link";

export function DashboardSidebar({
  hoverFunc,
}: {
  hoverFunc?: (e: PointerEvent<HTMLDivElement>) => void;
}) {
  return (
    <Sidebar onPointerOver={hoverFunc}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>NextNote</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sideBarLinks.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton className={item.className} asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {false && (
                <>
                  <SidebarSeparator />

                  <SidebarGroupLabel>My notes</SidebarGroupLabel>
                  {fakeNotesArray.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link href={`dashboard?note=${item.id}`}>
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
