import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { PointerEvent } from "react";
import { sideBarLinks } from "@/constants/constants";

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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
